import { supabase } from '../../lib/supabase'
import { PlayerRune, PlayerPrime } from '../../types/supabase'

export class PrimeRuneService {
  /**
   * Get all Primes owned by a player
   */
  static async getPlayerPrimes(playerId: string): Promise<PlayerPrime[]> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .select('*')
        .eq('player_id', playerId)
        .order('acquired_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching player primes:', error)
      throw error
    }
  }

  /**
   * Get equipped runes for a specific Prime
   */
  static async getPrimeEquippedRunes(playerId: string, primeId: string): Promise<PlayerRune[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_prime_equipped_runes', {
          p_player_id: playerId,
          p_prime_id: primeId
        })

      if (error) throw error

      // Convert the RPC result to PlayerRune format
      const equippedRunes: (PlayerRune | null)[] = Array(6).fill(null)
      
      if (data) {
        data.forEach((rune: any) => {
          if (rune.slot_index >= 0 && rune.slot_index < 6) {
            equippedRunes[rune.slot_index] = {
              id: rune.rune_id,
              player_id: playerId,
              prime_id: primeId,
              rune_type: rune.rune_type,
              rune_tier: rune.rune_tier,
              rune_level: rune.rune_level,
              stat_bonuses: rune.stat_bonuses,
              acquired_at: rune.acquired_at,
              created_at: null,
              equipped_slot: rune.slot_index,
              is_equipped: true
            }
          }
        })
      }

      return equippedRunes.filter(rune => rune !== null) as PlayerRune[]
    } catch (error) {
      console.error('Error fetching prime equipped runes:', error)
      throw error
    }
  }

  /**
   * Get all runes owned by a player (including availability status)
   */
  static async getPlayerRunes(playerId: string): Promise<PlayerRune[]> {
    try {
      const { data, error } = await supabase
        .from('player_runes')
        .select('*')
        .eq('player_id', playerId)
        .order('acquired_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching player runes:', error)
      throw error
    }
  }

  /**
   * Equip a rune to a specific Prime slot
   */
  static async equipRuneToPrime(
    playerId: string,
    primeId: string,
    runeId: string,
    slotIndex: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('equip_rune_to_prime', {
          p_player_id: playerId,
          p_prime_id: primeId,
          p_rune_id: runeId,
          p_slot_index: slotIndex
        })

      if (error) throw error
      return data === true
    } catch (error) {
      console.error('Error equipping rune to prime:', error)
      throw error
    }
  }

  /**
   * Unequip a rune from a specific Prime slot
   */
  static async unequipRuneFromPrime(
    playerId: string,
    primeId: string,
    slotIndex: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('unequip_rune_from_prime', {
          p_player_id: playerId,
          p_prime_id: primeId,
          p_slot_index: slotIndex
        })

      if (error) throw error
      return data === true
    } catch (error) {
      console.error('Error unequipping rune from prime:', error)
      throw error
    }
  }

  /**
   * Add starter Primes for new players
   */
  static async addStarterPrimes(playerId: string): Promise<{ prime_id: string; prime_name: string }[]> {
    try {
      const { data, error } = await supabase
        .rpc('add_starter_primes', {
          p_player_id: playerId
        })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error adding starter primes:', error)
      throw error
    }
  }

  /**
   * Get a Prime by ID
   */
  static async getPrimeById(primeId: string): Promise<PlayerPrime | null> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .select('*')
        .eq('id', primeId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching prime by ID:', error)
      throw error
    }
  }

  /**
   * Update Prime stats (level, experience, etc.)
   */
  static async updatePrime(primeId: string, updates: Partial<PlayerPrime>): Promise<PlayerPrime | null> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .update(updates)
        .eq('id', primeId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating prime:', error)
      throw error
    }
  }
} 