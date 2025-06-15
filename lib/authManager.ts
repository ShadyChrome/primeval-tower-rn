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

    // Migrate device mapping from AsyncStorage to database
    await this.migrateDeviceMappingToDatabase()

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id)
      this.notifyAuthStateChange(session)
    })

    // Force refresh session from storage to ensure persistence works
    console.log('🔄 Refreshing session from storage...')
    await supabase.auth.refreshSession()

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
      console.log('🔍 No existing session found, checking device mapping...')
      
      // Check if we have an existing user mapped to this device
      const existingUserId = await this.getExistingUserForDevice(deviceId)
      
      if (existingUserId) {
        console.log('🔍 Found existing user mapping for device:', existingUserId)
        console.log('⚠️  Creating new auth session but preserving game data with existing user ID')
      }
      
      // Create new anonymous user 
      console.log('🆕 Creating new anonymous user session...')
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
        // Preserve existing user ID for game data persistence
        console.log('🔄 Preserving existing user ID for game data persistence')
        console.log('💡 New auth user:', data.user.id, 'Game user:', existingUserId)
        
        // Update the current user ID in the existing mapping
        await this.upsertDeviceMappingInDB(deviceId, data.user.id, existingUserId)
        
        console.log('🔗 Device mapping updated with new auth user but preserved game user')
      } else {
        console.log('🆕 First time user - creating new device mapping')
        
        // Create new device mapping with this user as both auth and game user
        await this.upsertDeviceMappingInDB(deviceId, data.user.id, data.user.id)
        
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
   * Ensure device mapping exists for user in database
   */
  private static async ensureDeviceMapping(deviceId: string, userId: string): Promise<void> {
    try {
      console.log('🔗 Creating device mapping in database for:', { deviceId, userId })
      
      // Check if mapping already exists
      const existingMapping = await this.getDeviceMappingFromDB(deviceId)
      
      if (existingMapping) {
        console.log('🔍 Found existing device mapping:', existingMapping)
        
        // Update current user ID if different
        if (existingMapping.current_user_id !== userId) {
          console.log('🔄 Updating current user ID in existing mapping')
          await this.upsertDeviceMappingInDB(deviceId, userId, existingMapping.original_user_id)
        }
      } else {
        console.log('🆕 Creating new device mapping')
        await this.upsertDeviceMappingInDB(deviceId, userId, userId)
      }
      
      console.log('✅ Device mapping ensured in database')
      
    } catch (error) {
      console.error('❌ Error ensuring device mapping:', error)
      throw error
    }
  }

  /**
   * Get existing user ID for device from database
   */
  private static async getExistingUserForDevice(deviceId: string): Promise<string | null> {
    try {
      console.log('🔍 Checking for existing user mapping for device:', deviceId)
      
      const mapping = await this.getDeviceMappingFromDB(deviceId)
      
      if (mapping) {
        console.log('✅ Found existing user mapping:', mapping)
        return mapping.original_user_id || mapping.current_user_id
      }

      console.log('ℹ️ No existing user mapping found for device')
      return null
    } catch (error) {
      console.error('❌ Error getting user by device ID:', error)
      return null
    }
  }

  /**
   * Get device mapping from database
   */
  private static async getDeviceMappingFromDB(deviceId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('device_user_mapping')
        .select('*')
        .eq('device_id', deviceId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        console.error('❌ Error getting device mapping:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('❌ Error in getDeviceMappingFromDB:', error)
      return null
    }
  }

  /**
   * Upsert device mapping in database
   */
  private static async upsertDeviceMappingInDB(
    deviceId: string, 
    currentUserId: string, 
    originalUserId?: string
  ): Promise<void> {
    try {
      console.log('💾 Upserting device mapping:', {
        deviceId,
        currentUserId,
        originalUserId: originalUserId || currentUserId
      })

      const { data, error } = await supabase
        .rpc('bypass_rls_upsert_device_mapping', {
          device_id_param: deviceId,
          current_user_id_param: currentUserId,
          original_user_id_param: originalUserId || undefined
        })

      if (error) {
        console.error('❌ Error upserting device mapping:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('✅ Device mapping upserted successfully:', data)
    } catch (error) {
      console.error('❌ Error in upsertDeviceMappingInDB:', error)
      throw error
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
   * This returns the original/persistent user ID from device mapping in database
   */
  static async getGameUserId(): Promise<string | null> {
    try {
      const deviceId = await this.getDeviceId()
      
             // Try to get game user ID from database mapping
       const mapping = await this.getDeviceMappingFromDB(deviceId)
       
       if (mapping) {
         const gameUserId = mapping.original_user_id || mapping.current_user_id
         console.log('🎮 Using game user ID from database:', gameUserId)
         return gameUserId
       }

       console.log('ℹ️ No device mapping found in database')

      // Fallback to current auth user ID
      const currentUserId = await this.getCurrentUserId()
      console.log('🎮 Using current auth user ID as game user ID:', currentUserId)
      return currentUserId
    } catch (error) {
      console.error('❌ Error getting game user ID:', error)
      return await this.getCurrentUserId()
    }
  }

  /**
   * Migrate device mapping from AsyncStorage to database
   * This should be called once during app startup to migrate existing data
   */
  static async migrateDeviceMappingToDatabase(): Promise<void> {
    try {
      console.log('🔄 Starting device mapping migration...')
      
      const deviceId = await this.getDeviceId()
      const mappingKey = `device_mapping_${deviceId}`
      
      // Check if there's existing AsyncStorage data
      const mappingDataStr = await AsyncStorage.getItem(mappingKey)
      
      if (mappingDataStr) {
        console.log('📦 Found existing AsyncStorage device mapping')
        const mappingData = JSON.parse(mappingDataStr)
        
        // Check if already migrated to database
        const existingMapping = await this.getDeviceMappingFromDB(deviceId)
        
        if (!existingMapping) {
          console.log('💾 Migrating to database...')
          
          // Migrate to database
          await this.upsertDeviceMappingInDB(
            deviceId,
            mappingData.currentUserId || mappingData.originalUserId,
            mappingData.originalUserId
          )
          
          console.log('✅ Migration completed successfully')
          
          // Clean up AsyncStorage after successful migration
          await AsyncStorage.removeItem(mappingKey)
          console.log('🧹 Cleaned up AsyncStorage data')
        } else {
          console.log('ℹ️ Already migrated to database')
          // Clean up AsyncStorage since data is already in database
          await AsyncStorage.removeItem(mappingKey)
        }
      } else {
        console.log('ℹ️ No AsyncStorage device mapping found to migrate')
      }
      
    } catch (error) {
      console.error('❌ Error during device mapping migration:', error)
      // Don't throw error to prevent app from crashing
    }
  }
} 