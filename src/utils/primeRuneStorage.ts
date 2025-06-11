import { PlayerRune } from '../../types/supabase'
import { PrimeRuneService } from '../services/primeRuneService'
import { PlayerManager } from '../../lib/playerManager'

// Type for Prime-specific rune equipment data
export interface PrimeRuneEquipment {
  primeId: string
  equippedRunes: (PlayerRune | null)[]
}

// In-memory cache for performance
const primeRuneCache = new Map<string, (PlayerRune | null)[]>()

// Initialize storage and load existing data
export const initializePrimeRuneStorage = async (): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      console.log('No player ID found during initialization')
      return
    }

    // Load all runes for this player to determine equipped ones
    const allRunes = await PrimeRuneService.getPlayerRunes(playerId)
    
    // Group by prime_id and organize by slot
    const primeRuneMap = new Map<string, (PlayerRune | null)[]>()
    
    allRunes.forEach((rune: PlayerRune) => {
      if (rune.prime_id && rune.equipped_slot !== null && rune.is_equipped) {
        if (!primeRuneMap.has(rune.prime_id)) {
          primeRuneMap.set(rune.prime_id, Array(6).fill(null))
        }
        const equippedRunes = primeRuneMap.get(rune.prime_id)!
        equippedRunes[rune.equipped_slot] = rune
      }
    })
    
    // Update cache
    primeRuneMap.forEach((equippedRunes, primeId) => {
      primeRuneCache.set(primeId, equippedRunes)
    })
  } catch (error) {
    console.error('Error initializing prime rune storage:', error)
  }
}

// Save equipped runes for a specific Prime
export const savePrimeRuneEquipment = async (
  primeId: string, 
  equippedRunes: (PlayerRune | null)[]
): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      throw new Error('No player ID found')
    }

    // Update cache immediately for UI responsiveness
    primeRuneCache.set(primeId, [...equippedRunes])

    // Get current equipped runes for this prime from database
    const currentRunes = await PrimeRuneService.getPrimeEquippedRunes(playerId, primeId)
    
    // Unequip all current runes for this prime
    for (const rune of currentRunes) {
      if (rune.equipped_slot !== null) {
        await PrimeRuneService.unequipRuneFromPrime(playerId, primeId, rune.equipped_slot)
      }
    }

    // Equip new runes
    for (let slot = 0; slot < equippedRunes.length; slot++) {
      const rune = equippedRunes[slot]
      if (rune?.id) {
        await PrimeRuneService.equipRuneToPrime(playerId, primeId, rune.id, slot)
      }
    }
  } catch (error) {
    console.error('Error saving prime rune equipment:', error)
    throw error
  }
}

// Load equipped runes for a specific Prime
export const loadPrimeRuneEquipment = async (primeId: string): Promise<(PlayerRune | null)[]> => {
  try {
    // Check cache first
    if (primeRuneCache.has(primeId)) {
      return primeRuneCache.get(primeId)!
    }

    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      return Array(6).fill(null)
    }

    // Load from database
    const runes = await PrimeRuneService.getPrimeEquippedRunes(playerId, primeId)
    const equippedRunes: (PlayerRune | null)[] = Array(6).fill(null)
    
    runes.forEach((rune: PlayerRune) => {
      if (rune.equipped_slot !== null) {
        equippedRunes[rune.equipped_slot] = rune
      }
    })
    
    // Update cache
    primeRuneCache.set(primeId, equippedRunes)
    
    return equippedRunes
  } catch (error) {
    console.error('Error loading prime rune equipment:', error)
    return Array(6).fill(null)
  }
}

// Get all Primes that have equipped runes
export const getAllPrimesWithRunes = async (): Promise<PrimeRuneEquipment[]> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      return []
    }

    const allRunes = await PrimeRuneService.getPlayerRunes(playerId)
    const primeRuneMap = new Map<string, (PlayerRune | null)[]>()
    
    allRunes.forEach((rune: PlayerRune) => {
      if (rune.prime_id && rune.equipped_slot !== null && rune.is_equipped) {
        if (!primeRuneMap.has(rune.prime_id)) {
          primeRuneMap.set(rune.prime_id, Array(6).fill(null))
        }
        const equippedRunes = primeRuneMap.get(rune.prime_id)!
        equippedRunes[rune.equipped_slot] = rune
      }
    })
    
    return Array.from(primeRuneMap.entries()).map(([primeId, equippedRunes]) => ({
      primeId,
      equippedRunes
    }))
  } catch (error) {
    console.error('Error getting all primes with runes:', error)
    return []
  }
}

// Clear all rune equipment for a specific Prime
export const clearPrimeRuneEquipment = async (primeId: string): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      throw new Error('No player ID found')
    }

    // Clear from cache
    primeRuneCache.delete(primeId)

    // Clear from database
    const currentRunes = await PrimeRuneService.getPrimeEquippedRunes(playerId, primeId)
    for (const rune of currentRunes) {
      if (rune.equipped_slot !== null) {
        await PrimeRuneService.unequipRuneFromPrime(playerId, primeId, rune.equipped_slot)
      }
    }
  } catch (error) {
    console.error('Error clearing prime rune equipment:', error)
    throw error
  }
}

// Get list of rune IDs currently equipped by any Prime
export const getAllEquippedRuneIds = async (): Promise<string[]> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      return []
    }

    const allRunes = await PrimeRuneService.getPlayerRunes(playerId)
    return allRunes
      .filter((rune: PlayerRune) => rune.is_equipped && rune.id)
      .map((rune: PlayerRune) => rune.id)
  } catch (error) {
    console.error('Error getting all equipped rune IDs:', error)
    return []
  }
}

// Clear all storage (for testing/reset purposes)
export const clearAllPrimeRuneStorage = async (): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      return
    }

    // Clear cache
    primeRuneCache.clear()

    // Clear all equipped runes from database
    const allRunes = await PrimeRuneService.getPlayerRunes(playerId)
    const equippedRunes = allRunes.filter((rune: PlayerRune) => rune.is_equipped && rune.prime_id && rune.equipped_slot !== null)
    
    for (const rune of equippedRunes) {
      if (rune.prime_id && rune.equipped_slot !== null) {
        await PrimeRuneService.unequipRuneFromPrime(playerId, rune.prime_id, rune.equipped_slot)
      }
    }
  } catch (error) {
    console.error('Error clearing all prime rune storage:', error)
    throw error
  }
} 