import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { PlayerManager } from '../../lib/playerManager'
import { UIPrime } from '../services/primeService'
import { PlayerInventoryItem } from '../../types/supabase'
import { InventoryService } from '../services/inventoryService'

export interface UpgradeResult {
  success: boolean
  message: string
  newLevel?: number
  newExperience?: number
  newPower?: number
}

export interface AbilityUpgradeResult {
  success: boolean
  message: string
  newAbilityLevel?: number
  costPaid?: {
    gems?: number
    items?: { itemId: string; quantity: number }[]
  }
}

export interface XPItem {
  id: string        // inventory UUID
  itemId: string    // actual item type like 'small_xp_potion'
  name: string
  xpValue: number
  quantity: number
  rarity: string
}

export interface AbilityUpgradeCost {
  gems?: number
  items?: { itemId: string; itemName: string; quantity: number }[]
}

export const usePrimeUpgrade = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate XP required for next level
  const calculateXPForLevel = useCallback((level: number): number => {
    // Exponential scaling: base XP * level^1.5
    const baseXP = 100
    return Math.floor(baseXP * Math.pow(level, 1.5))
  }, [])

  // Calculate total XP required from level 1 to target level
  const calculateTotalXP = useCallback((targetLevel: number): number => {
    let totalXP = 0
    for (let i = 1; i < targetLevel; i++) {
      totalXP += calculateXPForLevel(i)
    }
    return totalXP
  }, [calculateXPForLevel])

  // Get available XP items from inventory
  const getAvailableXPItems = useCallback(async (): Promise<XPItem[]> => {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) return []

      const { data, error } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', playerId)
        .eq('item_type', 'xp_potion')
        .gt('quantity', 0)

      if (error) throw error

      // Get XP values from secure server config
      const xpValues = await InventoryService.getXPPotionValues()

      return (data || []).map((item: PlayerInventoryItem) => {
        const metadata = item.metadata as any || {}
        return {
          id: item.id,
          itemId: item.item_id,
          name: getXPItemName(item.item_id),
          xpValue: xpValues[item.item_id] || 50, // Use server config values
          quantity: item.quantity || 0,
          rarity: metadata.rarity || 'Common'
        }
      })
    } catch (err) {
      console.error('Error fetching XP items:', err)
      return []
    }
  }, [])

  // Helper function to get XP item display name
  const getXPItemName = (itemId: string): string => {
    const nameMap: Record<string, string> = {
      'small_xp_potion': 'Small XP Potion',
      'medium_xp_potion': 'Medium XP Potion',
      'large_xp_potion': 'Large XP Potion',
      'epic_xp_potion': 'Epic XP Potion',
      'legendary_xp_potion': 'Legendary XP Potion'
    }
    return nameMap[itemId] || 'XP Potion'
  }

  // Helper function to get XP value for item (now uses server config)
  const getXPItemValue = async (itemId: string): Promise<number> => {
    const xpValues = await InventoryService.getXPPotionValues()
    return xpValues[itemId] || 50
  }

  // Use XP items to level up prime with secure item consumption - OPTIMIZED VERSION
  const usePrimeXPItems = useCallback(async (
    prime: UIPrime,
    xpItems: { itemId: string; quantity: number }[]
  ): Promise<UpgradeResult> => {
    try {
      setLoading(true)
      setError(null)

      // Get device ID for secure operations
      const deviceId = await PlayerManager.getDeviceID()

      console.log('🚀 Starting optimized prime XP upgrade:', {
        prime: prime.name,
        itemsToConsume: xpItems
      })

      // Prepare XP items array for the atomic function
      const xpItemsForServer = xpItems.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity
      }))

      // Use the new atomic XP upgrade function (single database call)
      const { data, error } = await supabase
        .rpc('secure_prime_xp_upgrade_atomic', {
          p_device_id: deviceId,
          p_prime_id: prime.id,
          p_xp_items: xpItemsForServer
        })

      if (error) {
        console.error('Atomic prime XP upgrade failed:', error)
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result) {
        return { success: false, message: 'No response from server' }
      }

      if (!result.success) {
        console.warn('Prime XP upgrade failed:', result.message)
        return { success: false, message: result.message }
      }

      console.log('✅ Optimized prime XP upgrade successful:', {
        prime: prime.name,
        old_level: prime.level,
        new_level: result.new_level,
        xp_gained: result.total_xp_gained,
        levels_gained: result.levels_gained
      })

      const levelsGained = result.levels_gained
      const successMessage = levelsGained > 1 
        ? `${prime.name} leveled up ${levelsGained} times to Level ${result.new_level}!`
        : levelsGained === 1
        ? `${prime.name} leveled up to Level ${result.new_level}!`
        : `${prime.name} gained ${result.total_xp_gained} XP!`

      return {
        success: true,
        message: successMessage,
        newLevel: result.new_level,
        newExperience: result.new_experience,
        newPower: result.new_power
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upgrade failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate power based on level and rarity
  const calculatePowerForLevel = useCallback((level: number, rarity: string): number => {
    const basePower = {
      'Common': 200,
      'Rare': 350,
      'Epic': 500,
      'Legendary': 750,
      'Mythical': 1000
    }[rarity] || 200

    // Power scales with level: basePower + (level - 1) * scalingFactor
    const scalingFactor = basePower * 0.15 // 15% increase per level
    return Math.floor(basePower + (level - 1) * scalingFactor)
  }, [])

  // Calculate ability upgrade cost using secure server function
  // SECURITY: Cost calculation now happens server-side and cannot be manipulated
  const calculateAbilityUpgradeCost = useCallback(async (
    abilityLevel: number,
    abilityIndex: number,
    primeRarity: string
  ): Promise<AbilityUpgradeCost> => {
    try {
      // Get device ID for secure server validation
      const deviceId = await PlayerManager.getDeviceID()
      
      const { data, error } = await supabase
        .rpc('calculate_upgrade_cost', {
          p_device_id: deviceId,
          p_ability_level: abilityLevel,
          p_ability_index: abilityIndex,
          p_prime_rarity: primeRarity
        })

      if (error) {
        console.error('Server-side cost calculation failed:', error)
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result || !result.valid) {
        console.warn('Cost calculation failed:', result?.message)
        // Fallback to basic cost if server fails
        return {
          gems: 100,
          items: [{ itemId: 'ability_scroll', itemName: 'Ability Scroll', quantity: 1 }]
        }
      }

      console.log('✅ Secure cost calculation:', {
        gems: result.gems_cost,
        scrolls: result.scroll_cost
      })

      return {
        gems: result.gems_cost,
        items: [
          {
            itemId: 'ability_scroll',
            itemName: 'Ability Scroll',
            quantity: result.scroll_cost
          }
        ]
      }
    } catch (error) {
      console.error('Error calculating upgrade cost:', error)
      // Fallback to basic cost
      return {
        gems: 100,
        items: [{ itemId: 'ability_scroll', itemName: 'Ability Scroll', quantity: 1 }]
      }
    }
  }, [])

  // Upgrade ability with secure cost validation - OPTIMIZED VERSION
  const upgradeAbility = useCallback(async (
    prime: UIPrime,
    abilityIndex: number,
    abilityLevel: number
  ): Promise<AbilityUpgradeResult> => {
    try {
      setLoading(true)
      setError(null)

      // Get device ID for secure operations
      const deviceId = await PlayerManager.getDeviceID()

      console.log('🚀 Starting optimized ability upgrade:', {
        prime: prime.name,
        abilityIndex,
        currentLevel: abilityLevel
      })

      // Use the new atomic upgrade function (single database call)
      const { data, error } = await supabase
        .rpc('secure_ability_upgrade_atomic', {
          p_device_id: deviceId,
          p_prime_id: prime.id,
          p_ability_index: abilityIndex,
          p_current_level: abilityLevel
        })

      if (error) {
        console.error('Atomic ability upgrade failed:', error)
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result) {
        return { success: false, message: 'No response from server' }
      }

      if (!result.success) {
        console.warn('Ability upgrade failed:', result.message)
        return { 
          success: false, 
          message: result.message,
          // Include cost info for UI display even on failure
          costPaid: {
            gems: result.gems_cost,
            items: [{
              itemId: 'ability_scroll',
              quantity: result.scroll_cost
            }]
          }
        }
      }

      console.log('✅ Optimized ability upgrade successful:', {
        prime: prime.name,
        ability_index: abilityIndex,
        old_level: abilityLevel,
        new_level: result.new_level,
        gems_spent: result.gems_cost,
        scrolls_spent: result.scroll_cost
      })

      return {
        success: true,
        message: `Ability upgraded to level ${result.new_level}!`,
        newAbilityLevel: result.new_level,
        costPaid: {
          gems: result.gems_cost,
          items: [{
            itemId: 'ability_scroll',
            quantity: result.scroll_cost
          }]
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ability upgrade failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    calculateXPForLevel,
    calculateTotalXP,
    getAvailableXPItems,
    usePrimeXPItems,
    calculateAbilityUpgradeCost,
    upgradeAbility,
    calculatePowerForLevel
  }
} 