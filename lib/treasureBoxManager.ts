import { supabase } from './supabase'
import { TreasureBoxStatus, TreasureBoxClaim } from '../types/supabase'
import { PlayerManager } from './playerManager'

export class TreasureBoxManager {
  /**
   * Get treasure box status for a player using secure device validation
   * SECURITY: Now uses device ID validation on server side
   */
  static async getTreasureBoxStatus(playerId: string): Promise<TreasureBoxStatus | null> {
    try {
      console.log('📦 Getting treasure box status for player:', playerId)
      
      // Get device ID for secure server validation
      const deviceId = await PlayerManager.getDeviceID()
      
      const { data, error } = await supabase
        .rpc('get_treasure_box_status_secure', { p_device_id: deviceId })
      
      if (error) {
        console.error('❌ Error getting treasure box status:', error)
        throw error
      }
      
      console.log('🔍 Raw server response:', data)
      
      if (data && data.length > 0) {
        const status = data[0]
        console.log('✅ Secure treasure box status details:', {
          accumulated_gems: status.accumulated_gems,
          is_full: status.is_full,
          gems_per_hour: status.gems_per_hour,
          max_storage: status.max_storage,
          last_claim_time: status.last_claim_time,
          last_claim_time_type: typeof status.last_claim_time,
          time_until_full: status.time_until_full
        })
        
        // Additional validation
        if (!status.last_claim_time) {
          console.warn('⚠️ No last_claim_time in server response - this will cause timer reset!')
          console.warn('⚠️ You may need to update your Supabase function to return last_claim_time')
        }
        
        return status
      }
      
      console.warn('⚠️ No data returned from get_treasure_box_status_secure function')
      return null
    } catch (error) {
      console.error('Error getting treasure box status:', error)
      return null
    }
  }

  /**
   * Claim gems from treasure box using secure device validation
   * SECURITY: Now uses device ID validation and server-side time calculation
   */
  static async claimTreasureBoxGems(playerId: string): Promise<TreasureBoxClaim | null> {
    try {
      console.log('💎 Claiming treasure box gems for player:', playerId)
      
      // Get device ID for secure server validation
      const deviceId = await PlayerManager.getDeviceID()
      
      const { data, error } = await supabase
        .rpc('secure_treasure_box_claim', { p_device_id: deviceId })
      
      if (error) {
        console.error('❌ Error claiming treasure box gems:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        const result = data[0]
        console.log('✅ Secure treasure box claim result:', {
          gems_claimed: result.gems_claimed,
          success: result.success,
          message: result.message,
          new_gem_total: result.new_gem_total
        })

        // Log activity for monitoring
        if (result.success && result.gems_claimed > 0) {
          await supabase.rpc('log_player_activity', {
            p_device_id: deviceId,
            p_activity_type: 'gem_claim',
            p_activity_data: {
              gems_claimed: result.gems_claimed,
              new_total: result.new_gem_total
            }
          })
        }

        return result
      }
      
      return null
    } catch (error) {
      console.error('Error claiming treasure box gems:', error)
      return null
    }
  }

  /**
   * Format time until full in a human-readable way
   */
  static formatTimeUntilFull(seconds: number): string {
    if (seconds <= 0) return 'Full!'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  /**
   * Calculate fill percentage (0-100)
   */
  static calculateFillPercentage(accumulatedGems: number, maxStorage: number): number {
    return Math.min(Math.round((accumulatedGems / maxStorage) * 100), 100)
  }

  /**
   * Get treasure box visual state based on fill percentage
   */
  static getTreasureBoxState(fillPercentage: number): 'empty' | 'low' | 'medium' | 'high' | 'full' {
    if (fillPercentage >= 100) return 'full'
    if (fillPercentage >= 75) return 'high'
    if (fillPercentage >= 50) return 'medium'
    if (fillPercentage >= 25) return 'low'
    return 'empty'
  }
} 