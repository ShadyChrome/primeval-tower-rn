import { supabase } from './supabase'
import { AnonymousUserManager } from './anonymousUserManager'
import { Database } from '../types/supabase'

export type GuestData = Database['public']['Tables']['guest_data']['Row']
export type GuestDataInsert = Database['public']['Tables']['guest_data']['Insert']
export type GuestDataUpdate = Database['public']['Tables']['guest_data']['Update']

/**
 * This class manages guest data persistence using the device ID approach,
 * similar to how online games maintain data across guest sessions
 */
export class GuestDataManager {
  
  /**
   * Initialize guest data for a new or returning device
   * This should be called after successful anonymous sign-in
   */
  static async initializeGuestData(authUserId: string): Promise<void> {
    try {
      const deviceId = await AnonymousUserManager.getGuestDeviceId()
      
      // Check if we already have data for this device
      const existingData = await this.getGuestDataByDevice(deviceId)
      
      if (existingData) {
        // Update the auth user ID to link existing data to new session
        await this.linkDataToAuthUser(deviceId, authUserId)
        console.log('Linked existing guest data to new auth session')
      } else {
        // Create new guest data entry
        await this.createNewGuestData(deviceId, authUserId)
        console.log('Created new guest data entry')
      }
    } catch (error) {
      console.error('Error initializing guest data:', error)
    }
  }

  /**
   * Get guest data by device ID (for checking existing data)
   */
  static async getGuestDataByDevice(deviceId: string): Promise<GuestData | null> {
    try {
      const { data, error } = await supabase
        .from('guest_data')
        .select('*')
        .eq('device_id', deviceId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found - this is expected for new devices
          return null
        }
        console.error('Error getting guest data by device:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error getting guest data by device:', error)
      return null
    }
  }

  /**
   * Create new guest data entry for a device
   */
  static async createNewGuestData(deviceId: string, authUserId: string): Promise<void> {
    try {
      // First check if data already exists (safety check)
      const existingData = await this.getGuestDataByDevice(deviceId)
      if (existingData) {
        console.log('Guest data already exists for device, linking instead of creating')
        await this.linkDataToAuthUser(deviceId, authUserId)
        return
      }

      const newGuestData: GuestDataInsert = {
        device_id: deviceId,
        current_auth_user_id: authUserId,
        game_progress: {
          level: 1,
          score: 0,
          achievements: [],
          tutorial_completed: false
        },
        settings: {
          sound_enabled: true,
          notifications_enabled: true,
          theme: 'default'
        }
      }

      const { error } = await supabase
        .from('guest_data')
        .insert(newGuestData)
      
      if (error) {
        if (error.code === '23505') {
          // Duplicate key error - data was created concurrently, just link it
          console.log('Duplicate key detected, linking existing data instead')
          await this.linkDataToAuthUser(deviceId, authUserId)
        } else {
          console.error('Error creating guest data:', error)
        }
      } else {
        console.log('Successfully created guest data for device:', deviceId)
      }
    } catch (error) {
      console.error('Error creating guest data:', error)
    }
  }

  /**
   * Link existing guest data to a new auth user ID
   * This is key to maintaining data across sessions
   */
  static async linkDataToAuthUser(deviceId: string, newAuthUserId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('guest_data')
        .update({ 
          current_auth_user_id: newAuthUserId
        })
        .eq('device_id', deviceId)
      
      if (error) {
        console.error('Error linking data to auth user:', error)
      } else {
        console.log(`Successfully linked device ${deviceId} to auth user ${newAuthUserId}`)
      }
    } catch (error) {
      console.error('Error linking data to auth user:', error)
    }
  }

  /**
   * Get current user's data (by auth user ID)
   */
  static async getCurrentUserData(): Promise<GuestData | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null

      const { data, error } = await supabase
        .from('guest_data')
        .select('*')
        .eq('current_auth_user_id', session.user.id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found for this user
          return null
        }
        console.error('Error getting current user data:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error getting current user data:', error)
      return null
    }
  }

  /**
   * Update game progress for current user
   */
  static async updateGameProgress(progress: any): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return false

      const { error } = await supabase
        .from('guest_data')
        .update({ 
          game_progress: progress
        })
        .eq('current_auth_user_id', session.user.id)
      
      if (error) {
        console.error('Error updating game progress:', error)
        return false
      } else {
        console.log('Successfully updated game progress for user:', session.user.id)
        return true
      }
    } catch (error) {
      console.error('Error updating game progress:', error)
      return false
    }
  }

  /**
   * Update user settings
   */
  static async updateSettings(settings: any): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return false

      const { error } = await supabase
        .from('guest_data')
        .update({ 
          settings: settings
        })
        .eq('current_auth_user_id', session.user.id)
      
      if (error) {
        console.error('Error updating settings:', error)
        return false
      } else {
        console.log('Successfully updated settings for user:', session.user.id)
        return true
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  /**
   * Transfer guest data to permanent account
   * Called when user upgrades from guest to permanent account
   */
  static async transferDataToPermanentAccount(newPermanentUserId: string): Promise<boolean> {
    try {
      const deviceId = await AnonymousUserManager.getGuestDeviceId()
      
      // Get current guest data
      const guestData = await this.getGuestDataByDevice(deviceId)
      if (!guestData) {
        console.log('No guest data to transfer')
        return true
      }

      // Update the guest data to point to the permanent user
      const { error } = await supabase
        .from('guest_data')
        .update({
          current_auth_user_id: newPermanentUserId
        })
        .eq('device_id', deviceId)
      
      if (error) {
        console.error('Error transferring data to permanent account:', error)
        return false
      } else {
        console.log(`Successfully transferred guest data to permanent account: ${newPermanentUserId}`)
        return true
      }
    } catch (error) {
      console.error('Error transferring data to permanent account:', error)
      return false
    }
  }

  /**
   * Get device-specific data for debugging/admin purposes
   */
  static async getDeviceInfo(): Promise<{ deviceId: string; hasData: boolean; dataPreview?: GuestData }> {
    try {
      const deviceId = await AnonymousUserManager.getGuestDeviceId()
      const data = await this.getGuestDataByDevice(deviceId)
      
      return {
        deviceId,
        hasData: data !== null,
        dataPreview: data || undefined
      }
    } catch (error) {
      console.error('Error getting device info:', error)
      const deviceId = await AnonymousUserManager.getGuestDeviceId()
      return { deviceId, hasData: false }
    }
  }
}

/**
 * Database Schema Example:
 * 
 * This is what your guest_data table might look like:
 * 
 * CREATE TABLE guest_data (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   device_id TEXT UNIQUE NOT NULL,
 *   current_auth_user_id UUID REFERENCES auth.users(id),
 *   game_progress JSONB DEFAULT '{}',
 *   settings JSONB DEFAULT '{}',
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Index for fast lookups
 * CREATE INDEX idx_guest_data_device_id ON guest_data(device_id);
 * CREATE INDEX idx_guest_data_auth_user_id ON guest_data(current_auth_user_id);
 * 
 * -- RLS policies (if using Row Level Security)
 * ALTER TABLE guest_data ENABLE ROW LEVEL SECURITY;
 * 
 * -- Allow users to read/write their own data
 * CREATE POLICY "Users can access their own guest data" ON guest_data
 *   FOR ALL USING (current_auth_user_id = auth.uid());
 */ 