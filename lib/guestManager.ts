import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from './supabase'

const DEVICE_ID_KEY = 'guest_device_id'

export interface GuestData {
  progress: any
  settings: any
}

/**
 * A simple manager for handling all guest-related data.
 * It uses secure database functions to interact with the database.
 */
export class GuestManager {

  /**
   * Gets the unique device ID from local storage.
   * If it doesn't exist, it creates and stores one.
   */
  static async getDeviceID(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY)
      if (deviceId) {
        return deviceId
      } else {
        deviceId = uuidv4()
        await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId)
        return deviceId
      }
    } catch (error) {
      console.error('Error handling Device ID:', error)
      // Fallback to a temporary ID if storage fails
      return uuidv4()
    }
  }

  /**
   * Loads the guest's data by calling the secure 'load_guest_data' function.
   */
  static async loadGuestData(): Promise<GuestData | null> {
    const deviceId = await this.getDeviceID()

    try {
      const { data, error } = await supabase.rpc('load_guest_data', {
        p_device_id: deviceId
      })

      if (error) {
        console.error('Error loading guest data via RPC:', error)
        return null
      }

      // The RPC function returns null if no user is found.
      if (!data) {
        return null
      }

      return data as unknown as GuestData
    } catch (error) {
      console.error('Critical error in loadGuestData:', error)
      return null
    }
  }

  /**
   * Saves the guest's data by calling the secure 'save_guest_data' function.
   */
  static async saveGuestData(progress: any, settings: any): Promise<boolean> {
    const deviceId = await this.getDeviceID()

    try {
      const { error } = await supabase.rpc('save_guest_data', {
        p_device_id: deviceId,
        p_progress: progress,
        p_settings: settings,
      })

      if (error) {
        console.error('Error saving guest data via RPC:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Critical error in saveGuestData:', error)
      return false
    }
  }
} 