import { supabase } from '../../lib/supabase'
import { PrimeClaimResult, CleanupResult } from '../../types/supabase'
import { PlayerManager } from '../../lib/playerManager'

export class PrimeAcquisitionService {
  /**
   * Claims a new prime for the player with intelligent duplicate handling
   * @param primeName Name of the prime to claim
   * @param rarity Rarity of the prime (Common, Rare, Epic, Legendary, Mythical)
   * @param element Element of the prime
   * @param abilities Array of ability names
   * @param source Where the prime was acquired from (hatching, shop, etc.)
   * @returns Result of the prime claim operation
   */
  static async claimPrime(
    primeName: string,
    rarity: string,
    element: string,
    abilities: string[],
    source: string = 'hatching'
  ): Promise<PrimeClaimResult> {
    try {
      // Get device ID from storage or generate one
      const deviceId = await this.getDeviceId()
      
      const { data, error } = await supabase.rpc('secure_prime_claim', {
        p_device_id: deviceId,
        p_prime_name: primeName,
        p_rarity: rarity,
        p_element: element,
        p_abilities: abilities,
        p_source: source
      })

      if (error) {
        console.error('Error claiming prime:', error)
        throw new Error(`Failed to claim prime: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from prime claim')
      }

      const result = data[0]
      return {
        ...result,
        action: result.action as 'new_prime' | 'upgrade_prime' | 'duplicate_axp'
      }
    } catch (error) {
      console.error('PrimeAcquisitionService.claimPrime error:', error)
      throw error
    }
  }

  /**
   * Cleans up duplicate primes for the current player
   * @returns Result of the cleanup operation
   */
  static async cleanupDuplicatePrimes(): Promise<CleanupResult> {
    try {
      const deviceId = await this.getDeviceId()
      
      const { data, error } = await supabase.rpc('cleanup_duplicate_primes', {
        p_device_id: deviceId
      })

      if (error) {
        console.error('Error cleaning up duplicates:', error)
        throw new Error(`Failed to cleanup duplicates: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from cleanup')
      }

      return data[0]
    } catch (error) {
      console.error('PrimeAcquisitionService.cleanupDuplicatePrimes error:', error)
      throw error
    }
  }

  /**
   * Validates if a prime claim is valid before processing
   * @param primeName Name of the prime
   * @param rarity Rarity level
   * @param element Element type
   * @param abilities Array of abilities
   * @returns True if valid, false otherwise
   */
  static validatePrimeClaim(
    primeName: string,
    rarity: string,
    element: string,
    abilities: string[]
  ): { valid: boolean; error?: string } {
    // Validate prime name
    if (!primeName || primeName.trim().length === 0) {
      return { valid: false, error: 'Prime name is required' }
    }

    // Validate rarity
    const validRarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical']
    if (!validRarities.includes(rarity)) {
      return { valid: false, error: `Invalid rarity: ${rarity}. Must be one of: ${validRarities.join(', ')}` }
    }

    // Validate element
    const validElements = ['Ignis', 'Vitae', 'Azur', 'Geo', 'Tempest', 'Aeris']
    if (!validElements.includes(element)) {
      return { valid: false, error: `Invalid element: ${element}. Must be one of: ${validElements.join(', ')}` }
    }

    // Validate abilities
    if (!abilities || abilities.length !== 4) {
      return { valid: false, error: 'Exactly 4 abilities are required' }
    }

    for (const ability of abilities) {
      if (!ability || ability.trim().length === 0) {
        return { valid: false, error: 'All abilities must have valid names' }
      }
    }

    return { valid: true }
  }

  /**
   * Gets the current device ID for the player
   * @returns Device ID string
   */
  private static async getDeviceId(): Promise<string> {
    return await PlayerManager.getDeviceID()
  }

  /**
   * Calculates the AXP value of a prime based on its rarity
   * @param rarity The rarity of the prime
   * @returns AXP value when converted to duplicate
   */
  static getAXPValueByRarity(rarity: string): number {
    switch (rarity) {
      case 'Common': return 1
      case 'Rare': return 10
      case 'Epic': return 100
      case 'Legendary': return 1000
      case 'Mythical': return 10000
      default: return 1
    }
  }

  /**
   * Calculates evolution bonus AXP per ability when upgrading rarity
   * @param fromRarity Current rarity
   * @param toRarity Target rarity
   * @returns AXP bonus per ability
   */
  static getEvolutionBonusAXP(fromRarity: string, toRarity: string): number {
    const rarityRanks = {
      'Common': 1,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 4,
      'Mythical': 5
    }

    const fromRank = rarityRanks[fromRarity as keyof typeof rarityRanks] || 0
    const toRank = rarityRanks[toRarity as keyof typeof rarityRanks] || 0

    if (toRank <= fromRank) return 0

    // Evolution bonus table
    const bonusTable: { [key: string]: number } = {
      '1->2': 10,    // Common → Rare
      '1->3': 100,   // Common → Epic
      '1->4': 1000,  // Common → Legendary
      '1->5': 10000, // Common → Mythical
      '2->3': 100,   // Rare → Epic
      '2->4': 1000,  // Rare → Legendary
      '2->5': 10000, // Rare → Mythical
      '3->4': 1000,  // Epic → Legendary
      '3->5': 10000, // Epic → Mythical
      '4->5': 10000, // Legendary → Mythical
    }

    const key = `${fromRank}->${toRank}`
    return bonusTable[key] || 0
  }

  /**
   * Gets the rarity rank for comparison purposes
   * @param rarity Rarity string
   * @returns Numeric rank (1-5)
   */
  static getRarityRank(rarity: string): number {
    switch (rarity) {
      case 'Common': return 1
      case 'Rare': return 2
      case 'Epic': return 3
      case 'Legendary': return 4
      case 'Mythical': return 5
      default: return 0
    }
  }
} 