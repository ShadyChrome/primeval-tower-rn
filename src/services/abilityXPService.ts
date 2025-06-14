import { supabase } from '../../lib/supabase'
import { AXPAllocationResult, AXPReallocationResult, PrimeAXPStatus } from '../../types/supabase'
import { PlayerManager } from '../../lib/playerManager'

export class AbilityXPService {
  /**
   * Allocates AXP to a specific ability of a prime
   * @param primeId UUID of the prime
   * @param abilityIndex Index of the ability (0-3)
   * @param axpAmount Amount of AXP to allocate
   * @returns Result of the allocation operation
   */
  static async allocateAXP(
    primeId: string,
    abilityIndex: number,
    axpAmount: number
  ): Promise<AXPAllocationResult> {
    try {
      const deviceId = await this.getDeviceId()
      
      const { data, error } = await supabase.rpc('allocate_ability_xp', {
        p_device_id: deviceId,
        p_prime_id: primeId,
        p_ability_index: abilityIndex,
        p_axp_amount: axpAmount
      })

      if (error) {
        console.error('Error allocating AXP:', error)
        throw new Error(`Failed to allocate AXP: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from AXP allocation')
      }

      return data[0]
    } catch (error) {
      console.error('AbilityXPService.allocateAXP error:', error)
      throw error
    }
  }

  /**
   * Reallocates AXP from one ability to another
   * @param primeId UUID of the prime
   * @param fromAbilityIndex Source ability index (0-3)
   * @param toAbilityIndex Target ability index (0-3)
   * @param axpAmount Amount of AXP to move
   * @returns Result of the reallocation operation
   */
  static async reallocateAXP(
    primeId: string,
    fromAbilityIndex: number,
    toAbilityIndex: number,
    axpAmount: number
  ): Promise<AXPReallocationResult> {
    try {
      const deviceId = await this.getDeviceId()
      
      const { data, error } = await supabase.rpc('reallocate_ability_xp', {
        p_device_id: deviceId,
        p_prime_id: primeId,
        p_from_ability_index: fromAbilityIndex,
        p_to_ability_index: toAbilityIndex,
        p_axp_amount: axpAmount
      })

      if (error) {
        console.error('Error reallocating AXP:', error)
        throw new Error(`Failed to reallocate AXP: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from AXP reallocation')
      }

      return data[0]
    } catch (error) {
      console.error('AbilityXPService.reallocateAXP error:', error)
      throw error
    }
  }

  /**
   * Gets the current AXP status for a prime
   * @param primeId UUID of the prime
   * @returns AXP status information
   */
  static async getPrimeAXPStatus(primeId: string): Promise<PrimeAXPStatus> {
    try {
      const { data, error } = await supabase
        .from('player_primes')
        .select('ability_xp, ability_xp_allocated')
        .eq('id', primeId)
        .single()

      if (error) {
        console.error('Error fetching prime AXP status:', error)
        throw new Error(`Failed to fetch AXP status: ${error.message}`)
      }

      const totalAXP = data.ability_xp || 0
      const allocatedAXP = data.ability_xp_allocated || {}
      
      // Calculate total allocated and available AXP
      const totalAllocated = Object.values(allocatedAXP as { [key: string]: number })
        .reduce((sum, value) => sum + (value || 0), 0)
      
      const availableAXP = totalAXP - totalAllocated

      // Calculate ability tiers for each ability (0-3)
      const abilityTiers = []
      for (let i = 0; i < 4; i++) {
        const abilityKey = `ability_${i}`
        const abilityAXP = (allocatedAXP as any)[abilityKey] || 0
        abilityTiers.push(this.calculateAbilityTier(abilityAXP))
      }

      return {
        totalAXP,
        allocatedAXP: allocatedAXP as { [abilityIndex: string]: number },
        availableAXP,
        abilityTiers
      }
    } catch (error) {
      console.error('AbilityXPService.getPrimeAXPStatus error:', error)
      throw error
    }
  }

  /**
   * Calculates the ability tier based on AXP amount
   * @param axpAmount Current AXP for the ability
   * @returns Tier name (Common, Rare, Epic, Legendary, Mythical)
   */
  static calculateAbilityTier(axpAmount: number): string {
    if (axpAmount >= 10000) return 'Mythical'
    if (axpAmount >= 1000) return 'Legendary'
    if (axpAmount >= 100) return 'Epic'
    if (axpAmount >= 10) return 'Rare'
    return 'Common'
  }
  
  /**
   * Gets the threshold for the next tier
   * @param currentAXP Current AXP amount
   * @returns AXP needed to reach next tier
   */
  static getNextTierThreshold(currentAXP: number): number {
    if (currentAXP < 10) return 10
    if (currentAXP < 100) return 100
    if (currentAXP < 1000) return 1000
    if (currentAXP < 10000) return 10000
    return 10000 // Max tier
  }

  /**
   * Calculates how much AXP is needed to reach the next tier
   * @param currentAXP Current AXP amount
   * @returns AXP needed for next tier (0 if already at max)
   */
  static getAXPToNextTier(currentAXP: number): number {
    const nextThreshold = this.getNextTierThreshold(currentAXP)
    return Math.max(0, nextThreshold - currentAXP)
  }

  /**
   * Gets all tier thresholds
   * @returns Array of tier thresholds with names
   */
  static getTierThresholds(): { tier: string; threshold: number }[] {
    return [
      { tier: 'Common', threshold: 0 },
      { tier: 'Rare', threshold: 10 },
      { tier: 'Epic', threshold: 100 },
      { tier: 'Legendary', threshold: 1000 },
      { tier: 'Mythical', threshold: 10000 }
    ]
  }

  /**
   * Validates AXP allocation parameters
   * @param abilityIndex Ability index (must be 0-3)
   * @param axpAmount AXP amount (must be positive)
   * @returns Validation result
   */
  static validateAXPAllocation(
    abilityIndex: number,
    axpAmount: number
  ): { valid: boolean; error?: string } {
    if (abilityIndex < 0 || abilityIndex > 3) {
      return { valid: false, error: 'Ability index must be between 0 and 3' }
    }

    if (axpAmount <= 0) {
      return { valid: false, error: 'AXP amount must be positive' }
    }

    return { valid: true }
  }

  /**
   * Validates AXP reallocation parameters
   * @param fromAbilityIndex Source ability index
   * @param toAbilityIndex Target ability index
   * @param axpAmount AXP amount to move
   * @returns Validation result
   */
  static validateAXPReallocation(
    fromAbilityIndex: number,
    toAbilityIndex: number,
    axpAmount: number
  ): { valid: boolean; error?: string } {
    if (fromAbilityIndex < 0 || fromAbilityIndex > 3) {
      return { valid: false, error: 'Source ability index must be between 0 and 3' }
    }

    if (toAbilityIndex < 0 || toAbilityIndex > 3) {
      return { valid: false, error: 'Target ability index must be between 0 and 3' }
    }

    if (fromAbilityIndex === toAbilityIndex) {
      return { valid: false, error: 'Cannot move AXP to the same ability' }
    }

    if (axpAmount <= 0) {
      return { valid: false, error: 'AXP amount must be positive' }
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
   * Formats AXP amount for display
   * @param axp AXP amount
   * @returns Formatted string
   */
  static formatAXP(axp: number): string {
    if (axp >= 10000) {
      return `${(axp / 1000).toFixed(1)}k`
    }
    if (axp >= 1000) {
      return `${(axp / 1000).toFixed(1)}k`
    }
    return axp.toString()
  }
} 