import { supabase } from '../../lib/supabase'
import { PlayerRune } from '../../types/supabase'
import { PlayerManager } from '../../lib/playerManager'

export class RuneService {
  /**
   * Get all runes for the current player
   */
  static async getPlayerRunes(): Promise<PlayerRune[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        console.log('No player ID found')
        return []
      }

      const { data, error } = await supabase
        .from('player_runes')
        .select('*')
        .eq('player_id', playerId)
        .order('acquired_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching player runes:', error)
      return []
    }
  }

  /**
   * Get available (unequipped) runes for selection
   */
  static async getAvailableRunes(): Promise<PlayerRune[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return []
      }

      const { data, error } = await supabase
        .from('player_runes')
        .select('*')
        .eq('player_id', playerId)
        .eq('is_equipped', false)
        .order('rune_tier', { ascending: false })
        .order('rune_level', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching available runes:', error)
      return []
    }
  }

  /**
   * Get runes equipped on a specific Prime
   */
  static async getEquippedRunes(primeId: string): Promise<PlayerRune[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return []
      }

      const { data, error } = await supabase
        .from('player_runes')
        .select('*')
        .eq('player_id', playerId)
        .eq('prime_id', primeId)
        .eq('is_equipped', true)
        .order('equipped_slot', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching equipped runes:', error)
      return []
    }
  }

  /**
   * Add a new rune to player's inventory
   */
  static async addRune(
    runeType: string,
    runeTier: string,
    runeLevel: number = 1,
    statBonuses: Record<string, number>
  ): Promise<PlayerRune | null> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('No player ID found')
      }

      const { data, error } = await supabase
        .from('player_runes')
        .insert({
          player_id: playerId,
          rune_type: runeType,
          rune_tier: runeTier,
          rune_level: runeLevel,
          stat_bonuses: statBonuses,
          is_equipped: false,
          equipped_slot: null,
          prime_id: null
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding rune:', error)
      return null
    }
  }

  /**
   * Calculate total stat bonuses from an array of runes
   */
  static calculateTotalStats(runes: (PlayerRune | null)[]): Record<string, number> {
    const totalStats: Record<string, number> = {}

    runes.forEach(rune => {
      if (rune && rune.stat_bonuses) {
        const bonuses = rune.stat_bonuses as Record<string, number>
        Object.entries(bonuses).forEach(([stat, value]) => {
          totalStats[stat] = (totalStats[stat] || 0) + value
        })
      }
    })

    return totalStats
  }

  /**
   * Get rune tier color for UI
   */
  static getRuneTierColor(tier: string): string {
    const tierColors = {
      'common': '#ADB5BD',
      'rare': '#74C0FC', 
      'epic': '#B197FC',
      'legendary': '#FFCC8A',
      'mythical': '#FFA8A8'
    }
    return tierColors[tier.toLowerCase() as keyof typeof tierColors] || tierColors.common
  }

  /**
   * Get rune type display name
   */
  static getRuneTypeDisplayName(type: string): string {
    const typeNames = {
      'attack': 'Attack',
      'defense': 'Defense', 
      'hp': 'HP',
      'crit_rate': 'Crit Rate',
      'crit_damage': 'Crit Damage',
      'speed': 'Speed',
      'accuracy': 'Accuracy',
      'resistance': 'Resistance'
    }
    return typeNames[type as keyof typeof typeNames] || type
  }
} 