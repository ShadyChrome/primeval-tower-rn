import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

const ANONYMOUS_USER_ID_KEY = 'anonymous_user_id'

export class AnonymousUserManager {
  /**
   * Store the anonymous user ID locally
   */
  static async storeAnonymousUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ANONYMOUS_USER_ID_KEY, userId)
    } catch (error) {
      console.error('Error storing anonymous user ID:', error)
    }
  }

  /**
   * Retrieve the stored anonymous user ID
   */
  static async getStoredAnonymousUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ANONYMOUS_USER_ID_KEY)
    } catch (error) {
      console.error('Error retrieving anonymous user ID:', error)
      return null
    }
  }

  /**
   * Check if stored UUID exists in Supabase auth.users table
   * If not found, clear async storage and sign out user
   */
  static async validateStoredUserId(): Promise<boolean> {
    try {
      const storedUserId = await this.getStoredAnonymousUserId()
      if (!storedUserId) {
        return true // No stored ID, nothing to validate
      }

      // Check if the current session exists and matches stored ID
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session || !session.user) {
        // No active session, clear stored data and require login
        await this.clearAnonymousUserData()
        return false
      }

      // If we have a session but the user ID doesn't match what we stored
      // or if we can't verify the user exists, clear data and require re-login
      if (session.user.id !== storedUserId) {
        console.log('Stored user ID does not match current session, clearing data')
        await this.clearAnonymousUserData()
        await supabase.auth.signOut()
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating stored user ID:', error)
      // On error, clear data and require re-login for safety
      await this.clearAnonymousUserData()
      await supabase.auth.signOut()
      return false
    }
  }

  /**
   * Clear stored anonymous user data
   */
  static async clearAnonymousUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ANONYMOUS_USER_ID_KEY)
      // Clear any session restoration flags
      const keys = await AsyncStorage.getAllKeys()
      const sessionRestoredKeys = keys.filter(key => key.startsWith('session_restored_for_'))
      if (sessionRestoredKeys.length > 0) {
        await AsyncStorage.multiRemove(sessionRestoredKeys)
      }
    } catch (error) {
      console.error('Error clearing anonymous user data:', error)
    }
  }

  /**
   * Simplified anonymous sign-in that tracks returning users by UUID only
   */
  static async signInAnonymously(): Promise<{ data?: any; error?: any }> {
    try {
      // Check if we have a stored anonymous user ID
      const storedUserId = await this.getStoredAnonymousUserId()
      const isReturningUser = storedUserId !== null

      // Always create a fresh session - let Supabase handle tokens
      const { data, error } = await supabase.auth.signInAnonymously()

      if (error) {
        return { error }
      }

      if (data.session && data.user) {
        if (isReturningUser) {
          console.log('Returning anonymous user - fresh session created')
          // Mark this session as representing a returning user
          await this.markSessionRestored(storedUserId!)
        } else {
          console.log('New anonymous user created')
          // Store the new user ID for future reference
          await this.storeAnonymousUserId(data.user.id)
        }
      }

      return { data }

    } catch (error) {
      console.error('Error in anonymous sign-in:', error)
      return { error }
    }
  }

  /**
   * Handle sign out - preserve anonymous user data for regular users, clear for permanent users
   */
  static async handleSignOut(isAnonymous: boolean): Promise<void> {
    // Sign out from Supabase
    await supabase.auth.signOut()

    // Only clear anonymous data if the user was not anonymous (they were a permanent user)
    // For anonymous users, we want to keep their ID for next sign-in
    if (!isAnonymous) {
      await this.clearAnonymousUserData()
    }
  }

  /**
   * Convert anonymous user to permanent - clear the anonymous flags
   */
  static async convertToPermanentUser(): Promise<void> {
    await this.clearAnonymousUserData()
  }

  /**
   * Get the original anonymous user ID for data queries
   * For returning users, this returns the stored ID
   * For new users, this returns the current session ID
   */
  static async getOriginalAnonymousUserId(currentUserId: string): Promise<string> {
    const storedUserId = await this.getStoredAnonymousUserId()
    return storedUserId || currentUserId
  }

  /**
   * Check if current session belongs to a returning anonymous user
   */
  static async isReturningAnonymousUser(currentUserId: string): Promise<boolean> {
    const storedUserId = await this.getStoredAnonymousUserId()
    return storedUserId !== null
  }

  /**
   * Mark that a session restoration was successful
   */
  static async markSessionRestored(userId: string): Promise<void> {
    await AsyncStorage.setItem('session_restored_for_' + userId, 'true')
  }

  /**
   * Check if the current session was restored (vs newly created)
   */
  static async wasSessionRestored(userId: string): Promise<boolean> {
    try {
      const restored = await AsyncStorage.getItem('session_restored_for_' + userId)
      // Clear the flag after checking
      await AsyncStorage.removeItem('session_restored_for_' + userId)
      return restored === 'true'
    } catch {
      return false
    }
  }
} 