import { PrimeAcquisitionService } from './PrimeAcquisitionService'
import { PrimeClaimResult } from '../../types/supabase'
import { InventoryService } from './inventoryService'
import { PlayerManager } from '../../lib/playerManager'
import { supabase } from '../../lib/supabase'

export interface HatchResult {
  success: boolean
  primeClaimResult?: PrimeClaimResult
  error?: string
}

export interface HatchProbabilities {
  common: number
  rare: number
  epic: number
  legendary: number
  mythical: number
  [key: string]: number
}

export class HatchingService {
  /**
   * Hatches an egg and claims the resulting prime
   * @param eggInventoryId Inventory ID of the egg to hatch
   * @param enhancerInventoryIds Array of enhancer inventory IDs to use
   * @returns Result of the hatching operation
   */
  static async hatchEgg(
    eggInventoryId: string,
    enhancerInventoryIds: string[] = []
  ): Promise<HatchResult> {
    try {
      // 1. Validate the egg exists and belongs to the player
      const playerInventory = await InventoryService.getPlayerInventory()
      const eggItem = playerInventory.find(item => item.id === eggInventoryId && item.type === 'egg')
      
      if (!eggItem) {
        return {
          success: false,
          error: 'Egg not found in inventory'
        }
      }

      if (eggItem.quantity <= 0) {
        return {
          success: false,
          error: 'No eggs available to hatch'
        }
      }

      // 2. Validate enhancers exist and belong to the player
      const enhancers = []
      for (const enhancerId of enhancerInventoryIds) {
        const enhancer = playerInventory.find(item => item.id === enhancerId && item.type === 'enhancer')
        if (!enhancer || enhancer.quantity <= 0) {
          return {
            success: false,
            error: `Enhancer not found or insufficient quantity: ${enhancerId}`
          }
        }
        enhancers.push(enhancer)
      }

      // 3. Get egg rarity from metadata
      const eggRarity = eggItem.metadata?.rarity || 'Common'
      
             // 4. Calculate probabilities with enhancer effects
       const probabilities = await this.calculateHatchProbabilities(eggRarity, enhancers.map(e => e.itemId))
      
      // 5. Roll for prime rarity
      const rolledRarity = this.rollForRarity(probabilities)
      
             // 6. Get available primes for this rarity
       const availablePrimes = await this.getAvailablePrimes(rolledRarity)
      if (availablePrimes.length === 0) {
        return {
          success: false,
          error: `No primes available for rarity: ${rolledRarity}`
        }
      }
      
      // 7. Roll for specific prime
      const selectedPrime = availablePrimes[Math.floor(Math.random() * availablePrimes.length)]
      
      // 8. Consume the egg from inventory
      const eggConsumed = await InventoryService.consumeItem(eggInventoryId, 1)
      if (!eggConsumed) {
        return {
          success: false,
          error: 'Failed to consume egg from inventory'
        }
      }

      // 9. Consume enhancers from inventory
      for (const enhancerId of enhancerInventoryIds) {
        const enhancerConsumed = await InventoryService.consumeItem(enhancerId, 1)
        if (!enhancerConsumed) {
          console.warn(`Failed to consume enhancer: ${enhancerId}`)
          // Continue anyway - egg is already consumed
        }
      }

      // 10. Claim the prime using the acquisition service
      const primeClaimResult = await PrimeAcquisitionService.claimPrime(
        selectedPrime.prime_name,
        rolledRarity,
        selectedPrime.element,
        selectedPrime.abilities,
        'hatching'
      )

      // 11. Log the hatching activity
      const deviceId = await PlayerManager.getDeviceID()
      await supabase.rpc('log_player_activity', {
        p_device_id: deviceId,
        p_activity_type: 'egg_hatch',
        p_activity_data: {
          egg_type: eggItem.itemId,
          egg_rarity: eggRarity,
          enhancers_used: enhancers.map(e => e.itemId),
          result_prime: selectedPrime.prime_name,
          result_rarity: rolledRarity,
          claim_action: primeClaimResult.action
        }
      })

      return {
        success: true,
        primeClaimResult
      }
    } catch (error) {
      console.error('HatchingService.hatchEgg error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown hatching error'
      }
    }
  }

  /**
   * Calculates hatch probabilities for an egg type with enhancers
   * @param eggRarity The rarity of the egg
   * @param enhancers Array of enhancer items
   * @returns Probability distribution for prime rarities
   */
  static async calculateHatchProbabilities(
    eggRarity: string,
    enhancers: string[]
  ): Promise<HatchProbabilities> {
    // Base probabilities by egg type
    const baseProbabilities: { [key: string]: HatchProbabilities } = {
      'Common': { common: 70, rare: 25, epic: 4, legendary: 1, mythical: 0 },
      'Rare': { common: 45, rare: 35, epic: 15, legendary: 4, mythical: 1 },
      'Epic': { common: 20, rare: 35, epic: 30, legendary: 12, mythical: 3 },
      'Legendary': { common: 5, rare: 20, epic: 35, legendary: 30, mythical: 10 },
      'Mythical': { common: 0, rare: 10, epic: 25, legendary: 35, mythical: 30 }
    }

    let probabilities = baseProbabilities[eggRarity] || baseProbabilities['Common']

    // Apply enhancer effects (simplified)
    // TODO: Implement actual enhancer logic based on enhancer types
    if (enhancers.length > 0) {
      // Example: each enhancer increases higher rarity chances
      const enhancerBonus = enhancers.length * 2
      probabilities = {
        common: Math.max(0, probabilities.common - enhancerBonus),
        rare: probabilities.rare,
        epic: probabilities.epic + enhancerBonus * 0.3,
        legendary: probabilities.legendary + enhancerBonus * 0.5,
        mythical: probabilities.mythical + enhancerBonus * 0.2
      }
    }

    return probabilities
  }

  /**
   * Simulates a hatch result for testing purposes
   * @param eggId ID of the egg
   * @param enhancers Array of enhancers
   * @returns Simulated prime data
   */
  private static simulateHatch(eggId: string, enhancers: string[]) {
    // This is a simplified simulation for testing
    // In a real implementation, this would involve:
    // 1. Getting egg data from database
    // 2. Rolling for rarity based on probabilities
    // 3. Rolling for prime from available prime pool
    // 4. Rolling for element and abilities

    const rarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythical']
    const elements = ['Ignis', 'Vitae', 'Azur', 'Geo', 'Tempest', 'Aeris']
    const primeNames = [
      'Rathalos', 'Diablos', 'Zinogre', 'Nargacuga', 'Tigrex',
      'Mizutsune', 'Teostra', 'Kushala Daora', 'Kirin', 'Rajang'
    ]
    
    const abilities = [
      ['Fireball', 'Wing Attack', 'Roar', 'Tail Swipe'],
      ['Horn Charge', 'Burrow', 'Rage', 'Intimidate'],
      ['Thunder Strike', 'Lightning Bolt', 'Charge', 'Electric Field'],
      ['Shadow Strike', 'Stealth', 'Blade Dance', 'Night Vision'],
      ['Rampage', 'Bite', 'Claw Strike', 'Berserker']
    ]

    // Simple random selection for demo
    const rarity = rarities[Math.floor(Math.random() * rarities.length)]
    const element = elements[Math.floor(Math.random() * elements.length)]
    const primeName = primeNames[Math.floor(Math.random() * primeNames.length)]
    const primeAbilities = abilities[Math.floor(Math.random() * abilities.length)]

    return {
      primeName,
      rarity,
      element,
      abilities: primeAbilities
    }
  }

  /**
   * Validates egg hatching parameters
   * @param eggId ID of the egg
   * @param enhancers Array of enhancer items
   * @returns Validation result
   */
  static validateHatchParameters(
    eggId: string,
    enhancers: string[]
  ): { valid: boolean; error?: string } {
    if (!eggId || eggId.trim().length === 0) {
      return { valid: false, error: 'Egg ID is required' }
    }

    // Validate enhancers if provided
    if (enhancers.length > 5) {
      return { valid: false, error: 'Maximum 5 enhancers allowed per hatch' }
    }

    return { valid: true }
  }

  /**
   * Gets available primes for a given rarity
   * @param rarity Prime rarity to filter by
   * @returns Array of available prime data
   */
  static async getAvailablePrimes(rarity: string): Promise<any[]> {
    // For now, using mock data since we don't have a primes table yet
    // TODO: Implement database query when primes table is created
    return this.getMockPrimesForRarity(rarity)
  }

  /**
   * Fallback mock data for primes when database is unavailable
   * @param rarity Prime rarity
   * @returns Mock prime data
   */
  private static getMockPrimesForRarity(rarity: string): any[] {
    const mockPrimes: Record<string, any[]> = {
      'Common': [
        { prime_name: 'Flamewyrm', element: 'Ignis', abilities: { fire_breath: 1, flame_shield: 1 } },
        { prime_name: 'Aquadrake', element: 'Aqua', abilities: { water_blast: 1, healing_mist: 1 } },
        { prime_name: 'Stonebeast', element: 'Terra', abilities: { rock_throw: 1, earth_armor: 1 } },
        { prime_name: 'Windbird', element: 'Aer', abilities: { wind_slash: 1, speed_boost: 1 } }
      ],
      'Rare': [
        { prime_name: 'Infernox', element: 'Ignis', abilities: { inferno: 1, fire_wall: 1, burn: 1 } },
        { prime_name: 'Tidalcrest', element: 'Aqua', abilities: { tsunami: 1, ice_shard: 1, regeneration: 1 } },
        { prime_name: 'Rockguard', element: 'Terra', abilities: { earthquake: 1, stone_skin: 1, fortify: 1 } },
        { prime_name: 'Stormwing', element: 'Aer', abilities: { lightning: 1, tornado: 1, agility: 1 } }
      ],
      'Epic': [
        { prime_name: 'Pyrothane', element: 'Ignis', abilities: { meteor: 1, phoenix_rise: 1, molten_core: 1, flame_burst: 1 } },
        { prime_name: 'Abysscaller', element: 'Aqua', abilities: { tidal_wave: 1, frost_nova: 1, aqua_shield: 1, deep_current: 1 } },
        { prime_name: 'Earthshaker', element: 'Terra', abilities: { landslide: 1, crystal_armor: 1, seismic_slam: 1, mountain_rage: 1 } },
        { prime_name: 'Tempestor', element: 'Aer', abilities: { storm_call: 1, wind_barrier: 1, thunder_strike: 1, cyclone: 1 } }
      ],
      'Legendary': [
        { prime_name: 'Solaris', element: 'Lux', abilities: { solar_flare: 1, light_beam: 1, radiance: 1, purify: 1, divine_shield: 1 } },
        { prime_name: 'Leviathan', element: 'Aqua', abilities: { maelstrom: 1, depth_charge: 1, oceanic_fury: 1, hydro_cannon: 1, aqua_dominion: 1 } },
        { prime_name: 'Terraforge', element: 'Terra', abilities: { continental_shift: 1, diamond_skin: 1, gravity_well: 1, earth_mastery: 1, tectonic_force: 1 } },
        { prime_name: 'Cyclonarch', element: 'Aer', abilities: { hurricane: 1, void_wind: 1, atmospheric_control: 1, wind_mastery: 1, storm_lord: 1 } }
      ],
      'Mythical': [
        { prime_name: 'Ignistar', element: 'Ignis', abilities: { supernova: 1, stellar_fire: 1, cosmic_burn: 1, star_forge: 1, solar_dominion: 1, eternal_flame: 1 } },
        { prime_name: 'Oceanus', element: 'Aqua', abilities: { primordial_tide: 1, world_flood: 1, aqua_genesis: 1, ocean_lord: 1, tidal_mastery: 1, water_creation: 1 } },
        { prime_name: 'Gaiarch', element: 'Terra', abilities: { world_shaper: 1, planetary_core: 1, terra_genesis: 1, earth_lord: 1, continental_mastery: 1, land_creation: 1 } },
        { prime_name: 'Zephyros', element: 'Aer', abilities: { world_wind: 1, atmospheric_genesis: 1, sky_dominion: 1, wind_lord: 1, storm_mastery: 1, air_creation: 1 } }
      ]
    }
    
    return mockPrimes[rarity] || []
  }

  /**
   * Rolls for prime rarity based on calculated probabilities
   * @param probabilities Rarity probabilities object
   * @returns Selected rarity string
   */
  private static rollForRarity(probabilities: Record<string, number>): string {
    const roll = Math.random() * 100
    let cumulative = 0
    
    // Check in order from highest to lowest rarity
    const rarities = ['Mythical', 'Legendary', 'Epic', 'Rare', 'Common']
    
    for (const rarity of rarities) {
      cumulative += probabilities[rarity] || 0
      if (roll <= cumulative) {
        return rarity
      }
    }
    
    // Fallback to Common if something goes wrong
    return 'Common'
  }
} 