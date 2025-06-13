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
  abilityLevels: number[]
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
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return null
      }

      const { data, error } = await supabase
        .from('player_primes')
        .select('*')
        .eq('id', primeId)
        .eq('player_id', playerId)
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
   * Update a Prime's basic stats
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

  /**
   * Convert database PlayerPrime to UI Prime format
   */
  private static convertToUIPrime(dbPrime: PlayerPrime): UIPrime {
    // Parse ability levels from database
    const abilityLevels: number[] = dbPrime.ability_levels && Array.isArray(dbPrime.ability_levels) 
      ? dbPrime.ability_levels as number[]
      : [] // Default to empty array if not found

    return {
      id: dbPrime.id,
      name: dbPrime.prime_name,
      element: dbPrime.element as ElementType,
      rarity: dbPrime.rarity as 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical',
      level: dbPrime.level || 1,
      experience: dbPrime.experience || 0,
      power: dbPrime.power || 0,
      abilities: Array.isArray(dbPrime.abilities) ? dbPrime.abilities as string[] : [],
      abilityLevels: abilityLevels,
      imageName: PrimeService.getImageNameForPrime(dbPrime.prime_name)
    }
  }

  /**
   * Get image name for a prime based on its name
   */
  private static getImageNameForPrime(primeName: string): PrimeImageType | undefined {
    // Only map actual prime names to their image assets
    // Basic element names (Ignis, Azur, etc.) will return undefined
    const imageMap: Record<string, PrimeImageType> = {
      // Exact matches for actual prime names only
      'Rathalos': 'Rathalos',
      'Rathian': 'Rathian',
      'Anjanath': 'Anjanath',
      'Barroth': 'Barroth',
      'Diablos': 'Diablos',
      'Teostra': 'Teostra',
      'Silver Rathalos': 'Silver Rathalos',
      'Gold Rathian': 'Gold Rathian',
      'Apex Rathalos': 'Apex Rathalos',
      'Apex Rathian': 'Apex Rathian',
      'Espinas': 'Espinas',
      'Pukei-Pukei': 'Pukei-Pukei',
      'Great Izuchi': 'Great Izuchi',
      'Bishaten': 'Bishaten',
      'Blood Orange Bishaten': 'Blood Orange Bishaten',
      'Tetranadon': 'Tetranadon',
      'Royal Ludroth': 'Royal Ludroth',
      'Tobi-Kadachi': 'Tobi-Kadachi',
      'Great Baggi': 'Great Baggi',
      'Great Wroggi': 'Great Wroggi',
      'Mizutsune': 'Mizutsune',
      'Apex Mizutsune': 'Apex Mizutsune',
      'Somnacanth': 'Somnacanth',
      'Aurora Somnacanth': 'Aurora Somnacanth',
      'Jyuratodus': 'Jyuratodus',
      'VioletMizu': 'VioletMizu',
      'Almudron': 'Almudron',
      'Magma Almudron': 'Magma Almudron',
      'Basarios': 'Basarios',
      'Shogun Ceanataur': 'Shogun Ceanataur',
      'Daimyo Hermitaur': 'Daimyo Hermitaur',
      'Volvidon': 'Volvidon',
      'Garangolm': 'Garangolm',
      'Zinogre': 'Zinogre',
      'Apex Zinogre': 'Apex Zinogre',
      'Astalos': 'Astalos',
      'Kulu-Ya-Ku': 'Kulu-Ya-Ku',
      'Seregios': 'Seregios',
      'Wind Serpent Ibushi': 'Wind Serpent Ibushi',
      'Bazelgeuse': 'Bazelgeuse',
      'Seething Bazelgeuse': 'Seething Bazelgeuse',
      'Nargacuga': 'Nargacuga',
      'Lucent Nargacuga': 'Lucent Nargacuga',
      'Barioth': 'Barioth',
      'Kushala Daora': 'Kushala Daora',
      'Tigrex': 'Tigrex',
      'Lagombi': 'Lagombi',
      'Khezu': 'Khezu',
      'Magnamalo': 'Magnamalo',
      'Scorned Magnamalo': 'Scorned Magnamalo',
      'Malzeno': 'Malzeno',
      'Gaismagorm': 'Gaismagorm',
      'Gore Magala': 'Gore Magala',
      'Shagaru': 'Shagaru',
      'Chameleos': 'Chameleos',
      'Narwa the Allmother': 'Narwa the Allmother',
      'Narwa': 'Narwa',
      'Rajang': 'Rajang',
      'Furious Rajang': 'Furious Rajang',
      'Crimson Glow Valstrax': 'Crimson Glow Valstrax',
      'Lunagaron': 'Lunagaron',
      'Arzuros': 'Arzuros',
      'Apex Arzuros': 'Apex Arzuros',
      'Goss Harag': 'Goss Harag',
      'Aknosom': 'Aknosom',
      'Apex Diablos': 'Apex Diablos',
      'Rakna': 'Rakna',
      'Pyre Rakna-Kadaki': 'Pyre Rakna-Kadaki'
    }

    return imageMap[primeName]
  }
} 