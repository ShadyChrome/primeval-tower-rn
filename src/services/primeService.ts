import { supabase } from '../../lib/supabase'
import { PlayerPrime } from '../../types/supabase'
import { PlayerManager } from '../../lib/playerManager'
import { ElementType, PrimeImageType } from '../assets/ImageAssets'

// Convert database Prime to UI Prime format
export interface UIPrime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  experience: number
  power: number
  abilities: string[]
  imageName?: PrimeImageType
}

export class PrimeService {
  /**
   * Get all Primes for the current player
   */
  static async getPlayerPrimes(): Promise<UIPrime[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        console.log('No player ID found')
        return []
      }

      const { data, error } = await supabase
        .from('player_primes')
        .select('*')
        .eq('player_id', playerId)
        .order('acquired_at', { ascending: false })

      if (error) throw error

      // Convert database format to UI format
      return (data || []).map(this.convertToUIPrime)
    } catch (error) {
      console.error('Error fetching player primes:', error)
      return []
    }
  }

  /**
   * Get a specific Prime by ID
   */
  static async getPrimeById(primeId: string): Promise<UIPrime | null> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .select('*')
        .eq('id', primeId)
        .single()

      if (error) throw error
      return data ? this.convertToUIPrime(data) : null
    } catch (error) {
      console.error('Error fetching prime by ID:', error)
      return null
    }
  }

  /**
   * Initialize starter Primes for new players
   */
  static async initializeStarterPrimes(): Promise<UIPrime[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('No player ID found')
      }

      // Check if player already has Primes
      const existingPrimes = await this.getPlayerPrimes()
      if (existingPrimes.length > 0) {
        return existingPrimes
      }

      // Add starter Primes
      const { data, error } = await supabase
        .rpc('add_starter_primes', {
          p_player_id: playerId
        })

      if (error) throw error

      // Return the newly created Primes
      return await this.getPlayerPrimes()
    } catch (error) {
      console.error('Error initializing starter primes:', error)
      return []
    }
  }

  /**
   * Convert database PlayerPrime to UI Prime format
   */
  private static convertToUIPrime(dbPrime: PlayerPrime): UIPrime {
    return {
      id: dbPrime.id,
      name: dbPrime.prime_name,
      element: dbPrime.element as ElementType,
      rarity: dbPrime.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical',
      level: dbPrime.level || 1,
      experience: dbPrime.experience || 0,
      power: dbPrime.power || 0,
      abilities: Array.isArray(dbPrime.abilities) ? dbPrime.abilities as string[] : [],
      imageName: PrimeService.getImageNameForPrime(dbPrime.prime_name)
    }
  }

  /**
   * Map Prime names to image assets
   */
  private static getImageNameForPrime(primeName: string): PrimeImageType | undefined {
    // Map database prime names to image asset names
    const nameMap: Record<string, PrimeImageType> = {
      'Great Izuchi': 'Great Izuchi',
      'Kulu-Ya-Ku': 'Kulu-Ya-Ku',
      'Basarios': 'Basarios',
      'Rathalos': 'Rathalos',
      'Mizutsune': 'Mizutsune',
      'Zinogre': 'Zinogre',
      'Nargacuga': 'Nargacuga',
      'Teostra': 'Teostra',
      'Rathian': 'Rathian',
      'Pukei-Pukei': 'Pukei-Pukei',
      'Bishaten': 'Bishaten',
      'Somnacanth': 'Somnacanth',
      'VioletMizu': 'VioletMizu',
      'Garangolm': 'Garangolm',
      'Astalos': 'Astalos',
      'Barioth': 'Barioth',
      'Kushala Daora': 'Kushala Daora',
      'Magnamalo': 'Magnamalo',
      'Malzeno': 'Malzeno',
      'Gaismagorm': 'Gaismagorm'
    }

    return nameMap[primeName]
  }

  /**
   * Update a Prime's stats
   */
  static async updatePrime(primeId: string, updates: Partial<PlayerPrime>): Promise<UIPrime | null> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .update(updates)
        .eq('id', primeId)
        .select()
        .single()

      if (error) throw error
      return data ? this.convertToUIPrime(data) : null
    } catch (error) {
      console.error('Error updating prime:', error)
      return null
    }
  }
} 