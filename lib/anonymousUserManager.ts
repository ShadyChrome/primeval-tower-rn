import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import { Platform } from 'react-native'

const GUEST_DEVICE_ID_KEY = 'guest_device_id'
const GUEST_USER_ID_KEY = 'guest_user_id'

export class AnonymousUserManager {
  /**
   * Generate a unique device-based identifier for guest users
   * This will be the same across app reinstalls on the same device
   */
  static async generateDeviceIdentifier(): Promise<string> {
    try {
      // Try to use device-specific identifiers
      let deviceId = ''
      
      if (Platform.OS === 'ios') {
        // For iOS, use identifierForVendor equivalent
        deviceId = Constants.sessionId || Device.osInternalBuildId || ''
      } else if (Platform.OS === 'android') {
        // For Android, use device-specific info
        deviceId = Device.osInternalBuildId || Constants.sessionId || ''
      }
      
      // Fallback: Generate a random ID if device-specific ID not available
      if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      }
      
      // Add platform and model info for uniqueness
      const platformInfo = `${Platform.OS}_${Device.modelName || 'unknown'}`
      return `${platformInfo}_${deviceId}`.replace(/[^a-zA-Z0-9_-]/g, '_')
    } catch (error) {
      console.error('Error generating device identifier:', error)
      // Fallback to random ID
      return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }
  }

  /**
   * Get or create a persistent device ID
   */
  static async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(GUEST_DEVICE_ID_KEY)
      
      if (!deviceId) {
        deviceId = await this.generateDeviceIdentifier()
        await AsyncStorage.setItem(GUEST_DEVICE_ID_KEY, deviceId)
      }
      
      return deviceId
    } catch (error) {
      console.error('Error getting device ID:', error)
      // Return a session-based fallback
      return await this.generateDeviceIdentifier()
    }
  }

  /**
   * Store the guest user ID locally (this will be the Supabase auth user ID)
   */
  static async storeGuestUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_USER_ID_KEY, userId)
    } catch (error) {
      console.error('Error storing guest user ID:', error)
    }
  }

  /**
   * Retrieve the stored guest user ID
   */
  static async getStoredGuestUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(GUEST_USER_ID_KEY)
    } catch (error) {
      console.error('Error retrieving guest user ID:', error)
      return null
    }
  }

  /**
   * Check if we have an existing guest session we can restore
   */
  static async hasExistingGuestSession(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return session && session.user && session.user.is_anonymous || false
  }

  /**
   * Validate that our stored session is still valid with Supabase
   */
  static async validateStoredUserId(): Promise<boolean> {
    try {
      const storedUserId = await this.getStoredGuestUserId()
      if (!storedUserId) {
        return true // No stored ID, nothing to validate
      }

      // Check if the current session exists and matches stored ID
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !session.user) {
        // No active session, but we have a stored ID
        // Don't clear it yet - we might be able to restore it
        return false
      }

      // If we have a session but the user ID doesn't match what we stored
      // Clear data and require re-login
      if (session.user.id !== storedUserId) {
        console.log('Stored user ID does not match current session, clearing data')
        await this.clearGuestData()
        await supabase.auth.signOut()
        return false
      }

      // Additional check: Verify the user actually exists in the auth system
      // This handles the case where database was cleared but local session remains
      try {
        const { data: user, error } = await supabase.auth.getUser()
        if (error || !user.user) {
          console.log('Session exists but user not found in auth system, clearing data')
          await this.clearGuestData()
          await supabase.auth.signOut()
          return false
        }
      } catch (authError) {
        console.log('Error verifying user existence, clearing data:', authError)
        await this.clearGuestData()
        await supabase.auth.signOut()
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating stored user ID:', error)
      return false
    }
  }

  /**
   * Clear stored guest data (only when converting to permanent account)
   */
  static async clearGuestData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([GUEST_USER_ID_KEY])
      // Note: We keep GUEST_DEVICE_ID_KEY for potential future use
    } catch (error) {
      console.error('Error clearing guest data:', error)
    }
  }

  /**
   * DEVELOPMENT/TESTING: Clear ALL local data including Supabase sessions
   * Use this when you want to completely reset the app state
   */
  static async clearAllLocalData(): Promise<void> {
    try {
      console.log('🧹 Clearing all local data...')
      
      // Sign out from Supabase (this clears auth sessions)
      await supabase.auth.signOut()
      
      // Clear all our custom AsyncStorage keys
      await AsyncStorage.multiRemove([
        GUEST_DEVICE_ID_KEY,
        GUEST_USER_ID_KEY
      ])
      
      // Clear any other Supabase-related storage
      // Supabase uses these keys internally
      const supabaseKeys = [
        'supabase.auth.token',
        'supabase.auth.session',
        'sb-' // Supabase prefix for internal keys
      ]
      
      // Get all AsyncStorage keys and filter for Supabase-related ones
      const allKeys = await AsyncStorage.getAllKeys()
      const supabaseStorageKeys = allKeys.filter(key => 
        supabaseKeys.some(prefix => key.includes(prefix))
      )
      
      if (supabaseStorageKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseStorageKeys)
        console.log('🧹 Cleared Supabase storage keys:', supabaseStorageKeys)
      }
      
      console.log('✅ All local data cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing all local data:', error)
    }
  }

  /**
   * Smart guest sign-in that maintains persistence
   */
  static async signInAnonymously(): Promise<{ data?: any; error?: any; isReturning?: boolean }> {
    try {
      const deviceId = await this.getDeviceId()
      
      // First, try to restore existing session if we have one
      const { data: { session } } = await supabase.auth.getSession()
      if (session && session.user && session.user.is_anonymous) {
        console.log('Restored existing guest session for device:', deviceId)
        return { 
          data: { session, user: session.user }, 
          isReturning: true 
        }
      }

      // Check if we have existing guest data for this device
      const { GuestDataManager } = await import('./guestDataManager')
      const existingGuestData = await GuestDataManager.getGuestDataByDevice(deviceId)
      const isReturningDevice = existingGuestData !== null

      // Create a new anonymous auth user (this always creates a new user in Supabase)
      console.log(isReturningDevice ? 
        'Creating new auth session for returning device:' : 
        'Creating new anonymous session for device:', deviceId)
      
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        return { error }
      }

      if (data.session && data.user) {
        // Store this new auth user ID
        await this.storeGuestUserId(data.user.id)
        
        // Handle guest data based on whether device is returning
        if (isReturningDevice) {
          // Link existing guest data to new auth user
          await GuestDataManager.linkDataToAuthUser(deviceId, data.user.id)
          console.log('Linked existing guest data to new auth session')
        } else {
          // Create new guest data for new device
          await GuestDataManager.createNewGuestData(deviceId, data.user.id)
          console.log('Created new guest data entry')
        }
        
        console.log(isReturningDevice ? 'Returning guest device with new session' : 'Brand new guest user')
        
        return { data, isReturning: isReturningDevice }
      }

      return { data }

    } catch (error) {
      console.error('Error in anonymous sign-in:', error)
      return { error }
    }
  }

  /**
   * Handle sign out - preserve guest data for anonymous users
   */
  static async handleSignOut(isAnonymous: boolean): Promise<void> {
    // Sign out from Supabase
    await supabase.auth.signOut()

    // Only clear guest data if the user was not anonymous (they were a permanent user)
    // For anonymous users, we want to keep their device ID and potentially restore session
    if (!isAnonymous) {
      await this.clearGuestData()
    }
  }

  /**
   * Convert anonymous user to permanent - clear the guest flags
   */
  static async convertToPermanentUser(): Promise<void> {
    await this.clearGuestData()
  }

  /**
   * Get the device ID for linking guest data
   */
  static async getGuestDeviceId(): Promise<string> {
    return await this.getDeviceId()
  }

  /**
   * Check if current user is a returning guest based on device
   */
  static async isReturningGuestDevice(): Promise<boolean> {
    try {
      const deviceId = await this.getDeviceId()
      const { GuestDataManager } = await import('./guestDataManager')
      const existingData = await GuestDataManager.getGuestDataByDevice(deviceId)
      return existingData !== null
    } catch (error) {
      console.error('Error checking if returning guest device:', error)
      return false
    }
  }
} 