import { supabase } from './supabase'
import { TreasureBoxStatus, TreasureBoxClaim } from '../types/supabase'

export class TreasureBoxManager {
  /**
   * Get treasure box status for a player
   */
  static async getTreasureBoxStatus(playerId: string): Promise<TreasureBoxStatus | null> {
    try {
      console.log('📦 Getting treasure box status for player:', playerId)
      
      const { data, error } = await supabase
        .rpc('calculate_treasure_box_gems', { p_player_id: playerId })
      
      if (error) {
        console.error('❌ Error getting treasure box status:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        const status = data[0]
        console.log('✅ Treasure box status:', {
          accumulated_gems: status.accumulated_gems,
          is_full: status.is_full,
          gems_per_hour: status.gems_per_hour,
          max_storage: status.max_storage
        })
        return status
      }
      
      return null
    } catch (error) {
      console.error('Error getting treasure box status:', error)
      return null
    }
  }

  /**
   * Claim gems from treasure box
   */
  static async claimTreasureBoxGems(playerId: string): Promise<TreasureBoxClaim | null> {
    try {
      console.log('💎 Claiming treasure box gems for player:', playerId)
      
      const { data, error } = await supabase
        .rpc('claim_treasure_box_gems', { p_player_id: playerId })
      
      if (error) {
        console.error('❌ Error claiming treasure box gems:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        const result = data[0]
        console.log('✅ Treasure box claim result:', {
          gems_claimed: result.gems_claimed,
          success: result.success,
          message: result.message
        })
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