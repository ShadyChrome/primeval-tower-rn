import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'
import { Session, User } from '@supabase/supabase-js'
import * as Device from 'expo-device'

const ANONYMOUS_USER_KEY = 'anonymous_user_id'
const DEVICE_ID_KEY = 'device_id'

export interface AuthState {
  session: Session | null
  user: User | null
  isAnonymous: boolean
  deviceId: string
}

export class AuthManager {
  private static authStateListeners: ((authState: AuthState) => void)[] = []

  /**
   * Initialize authentication system
   * This should be called when the app starts
   */
  static async initialize(): Promise<AuthState> {
    console.log('🔐 Initializing AuthManager...')

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id)
      this.notifyAuthStateChange(session)
    })

    // Try to restore existing session or create anonymous user
    const authState = await this.getOrCreateAnonymousUser()
    console.log('✅ AuthManager initialized:', {
      userId: authState.user?.id,
      isAnonymous: authState.isAnonymous,
      deviceId: authState.deviceId
    })

    return authState
  }

  /**
   * Get current authentication state
   */
  static async getCurrentAuthState(): Promise<AuthState> {
    const { data: { session } } = await supabase.auth.getSession()
    const deviceId = await this.getDeviceId()
    
    return {
      session,
      user: session?.user || null,
      isAnonymous: session?.user?.is_anonymous || false,
      deviceId
    }
  }

  /**
   * Get or create persistent anonymous user with device mapping
   */
  static async getOrCreateAnonymousUser(): Promise<AuthState> {
    try {
      // First, check if we have an existing session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('✅ Found existing session:', session.user.id)
        const deviceId = await this.getDeviceId()
        
        // Ensure device mapping exists for this session
        await this.ensureDeviceMapping(deviceId, session.user.id)
        
        return {
          session,
          user: session.user,
          isAnonymous: session.user.is_anonymous || false,
          deviceId
        }
      }

      const deviceId = await this.getDeviceId()
      
      // Check if we have an existing user mapped to this device
      const existingUserId = await this.getExistingUserForDevice(deviceId)
      
      // Create new anonymous user (this is expected behavior for Supabase anonymous auth)
      console.log('🆕 Creating new anonymous user...')
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        console.error('❌ Failed to create anonymous user:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user returned from anonymous sign in')
      }

      console.log('✅ Anonymous user created:', data.user.id)
      
      if (existingUserId) {
        console.log('🔍 Found existing user mapping for device:', existingUserId)
        console.log('🔄 Will preserve existing user ID for game data persistence')
        console.log('💡 New auth user for RLS, existing user for game data')
        
        // DON'T update the device mapping - it should stay as is
        // The existing mapping already has the correct originalUserId
        console.log('🔗 Device mapping preserved (no changes needed)')
      } else {
        console.log('🆕 First time user - creating new device mapping')
        
        // Create new device mapping with this user as the original
        await this.ensureDeviceMapping(deviceId, data.user.id)
        
        console.log('🔗 New device mapping created')
      }

      return {
        session: data.session,
        user: data.user,
        isAnonymous: true,
        deviceId
      }

    } catch (error) {
      console.error('❌ Error in getOrCreateAnonymousUser:', error)
      throw error
    }
  }

  /**
   * Ensure device mapping exists for user
   */
  private static async ensureDeviceMapping(deviceId: string, userId: string): Promise<void> {
    try {
      console.log('🔗 Creating device mapping for:', { deviceId, userId })
      
      // Store the mapping in AsyncStorage for now (simple approach)
      const mappingKey = `device_mapping_${deviceId}`
      const mappingData = {
        deviceId,
        currentUserId: userId,
        originalUserId: userId,
        updatedAt: new Date().toISOString()
      }
      
      await AsyncStorage.setItem(mappingKey, JSON.stringify(mappingData))
      console.log('✅ Device mapping stored locally:', mappingData)
      
    } catch (error) {
      console.error('❌ Error ensuring device mapping:', error)
      throw error
    }
  }

  /**
   * Get existing user ID for device (if any)
   */
  private static async getExistingUserForDevice(deviceId: string): Promise<string | null> {
    try {
      console.log('🔍 Checking for existing user mapping for device:', deviceId)
      
      // Check AsyncStorage for existing mapping
      const mappingKey = `device_mapping_${deviceId}`
      const mappingDataStr = await AsyncStorage.getItem(mappingKey)
      
      if (mappingDataStr) {
        const mappingData = JSON.parse(mappingDataStr)
        console.log('✅ Found existing user mapping:', mappingData)
        return mappingData.originalUserId || null
      }

      console.log('ℹ️ No existing user mapping found for device')
      return null
    } catch (error) {
      console.error('❌ Error getting user by device ID:', error)
      return null
    }
  }

  /**
   * Convert anonymous user to permanent user with email/password
   */
  static async convertAnonymousUser(email: string, password: string): Promise<AuthState> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.is_anonymous) {
        throw new Error('Current user is not anonymous or not logged in')
      }

      console.log('🔄 Converting anonymous user to permanent user...')

      // Update the user with email
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        email: email
      })

      if (updateError) {
        console.error('❌ Failed to update user email:', updateError)
        throw updateError
      }

      console.log('📧 Email update initiated, user needs to verify email')
      
      // Note: User will need to verify email before they can set password
      // The password update should happen after email verification
      
      return await this.getCurrentAuthState()

    } catch (error) {
      console.error('❌ Error converting anonymous user:', error)
      throw error
    }
  }

  /**
   * Set password after email verification
   */
  static async setPasswordAfterVerification(password: string): Promise<AuthState> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('❌ Failed to set password:', error)
        throw error
      }

      console.log('✅ Password set successfully')
      
      // Clear the anonymous user storage since they're now permanent
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY)
      
      return await this.getCurrentAuthState()

    } catch (error) {
      console.error('❌ Error setting password:', error)
      throw error
    }
  }

  /**
   * Link OAuth provider to anonymous user
   */
  static async linkOAuthProvider(provider: 'google' | 'apple' | 'facebook'): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user?.is_anonymous) {
        throw new Error('Current user is not anonymous or not logged in')
      }

      console.log(`🔗 Linking ${provider} to anonymous user...`)

      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider
      })

      if (error) {
        console.error(`❌ Failed to link ${provider}:`, error)
        throw error
      }

      console.log(`✅ ${provider} linked successfully`)
      
      // Clear the anonymous user storage since they're now permanent
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY)

    } catch (error) {
      console.error(`❌ Error linking ${provider}:`, error)
      throw error
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      console.log('👋 Signing out user...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Error signing out:', error)
        throw error
      }

      // Clear stored anonymous user ID
      await AsyncStorage.removeItem(ANONYMOUS_USER_KEY)
      
      console.log('✅ User signed out successfully')

    } catch (error) {
      console.error('❌ Error in signOut:', error)
      throw error
    }
  }

  /**
   * Continue as guest (create new anonymous user or restore existing)
   */
  static async continueAsGuest(): Promise<AuthState> {
    console.log('👤 Continuing as guest...')
    return await this.getOrCreateAnonymousUser()
  }

  /**
   * Get device ID (for backward compatibility with existing system)
   */
  static async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY)
      
      if (!deviceId) {
        const deviceInfo = await Device.getDeviceTypeAsync()
        const randomId = Math.random().toString(36).substring(2, 15)
        deviceId = `${deviceInfo}_${randomId}_${Date.now()}`
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId)
        console.log('💾 Created new device ID:', deviceId)
      }
      
      return deviceId
    } catch (error) {
      console.error('Error getting device ID:', error)
      const fallbackId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
      await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId)
      return fallbackId
    }
  }

  /**
   * Add auth state change listener
   */
  static addAuthStateListener(listener: (authState: AuthState) => void): () => void {
    this.authStateListeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all listeners of auth state change
   */
  private static async notifyAuthStateChange(session: Session | null): Promise<void> {
    const deviceId = await this.getDeviceId()
    const authState: AuthState = {
      session,
      user: session?.user || null,
      isAnonymous: session?.user?.is_anonymous || false,
      deviceId
    }

    this.authStateListeners.forEach(listener => {
      try {
        listener(authState)
      } catch (error) {
        console.error('Error in auth state listener:', error)
      }
    })
  }

  /**
   * Get current user ID (for RLS policies)
   */
  static async getCurrentUserId(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.id || null
  }

  /**
   * Check if current user is anonymous
   */
  static async isCurrentUserAnonymous(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user?.is_anonymous || false
  }

  /**
   * Get the user ID that should be used for game data operations
   * This returns the original/persistent user ID from device mapping
   */
  static async getGameUserId(): Promise<string | null> {
    try {
      const deviceId = await this.getDeviceId()
      const mappingKey = `device_mapping_${deviceId}`
      const mappingDataStr = await AsyncStorage.getItem(mappingKey)
      
      if (mappingDataStr) {
        const mappingData = JSON.parse(mappingDataStr)
        console.log('🎮 Using game user ID:', mappingData.originalUserId)
        return mappingData.originalUserId
      }

      // Fallback to current auth user ID
      const currentUserId = await this.getCurrentUserId()
      console.log('🎮 Using current auth user ID as game user ID:', currentUserId)
      return currentUserId
    } catch (error) {
      console.error('❌ Error getting game user ID:', error)
      return await this.getCurrentUserId()
    }
  }
} 