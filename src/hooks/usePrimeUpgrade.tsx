import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { PlayerManager } from '../../lib/playerManager'
import { PrimeRuneService } from '../services/primeRuneService'
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
  id: string
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

  // Use XP items to level up prime with secure item consumption
  const usePrimeXPItems = useCallback(async (
    prime: UIPrime,
    xpItems: { itemId: string; quantity: number }[]
  ): Promise<UpgradeResult> => {
    try {
      setLoading(true)
      setError(null)

      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('Player not found')
      }

      // Get device ID for secure operations
      const deviceId = await PlayerManager.getDeviceID()

      // Calculate total XP to be gained and validate items using server config
      let totalXPGain = 0
      const itemsToConsume: { inventoryId: string; quantity: number; currentQuantity: number; xpValue: number }[] = []
      const xpValues = await InventoryService.getXPPotionValues()

      for (const item of xpItems) {
        // Get the inventory item data
        const { data: inventoryItem } = await supabase
          .from('player_inventory')
          .select('id, item_id, quantity')
          .eq('id', item.itemId)
          .eq('player_id', playerId)
          .eq('item_type', 'xp_potion')
          .single()

        if (!inventoryItem) {
          throw new Error(`XP item not found in inventory`)
        }

        const currentQuantity = inventoryItem.quantity || 0
        if (currentQuantity < item.quantity) {
          throw new Error(`Not enough ${getXPItemName(inventoryItem.item_id)}`)
        }

        const xpValue = xpValues[inventoryItem.item_id] || 50 // Use server config
        totalXPGain += xpValue * item.quantity

        itemsToConsume.push({
          inventoryId: inventoryItem.id,
          quantity: item.quantity,
          currentQuantity: currentQuantity,
          xpValue: xpValue
        })
      }

      if (totalXPGain <= 0) {
        return { success: false, message: 'No XP selected' }
      }

      // Calculate new experience and level
      let currentLevel = prime.level
      let remainingXP = (prime.experience || 0) + totalXPGain // Start with current level XP + gained XP
      
      // Process level ups
      while (remainingXP > 0 && currentLevel < 100) {
        const xpNeededForNextLevel = calculateXPForLevel(currentLevel)
        
        if (remainingXP >= xpNeededForNextLevel) {
          // Level up!
          remainingXP -= xpNeededForNextLevel
          currentLevel++
        } else {
          // Not enough XP for next level, stop here
          break
        }
      }

      const newLevel = currentLevel
      const newLevelXP = remainingXP // Remaining XP in the current level
      const newPower = calculatePowerForLevel(newLevel, prime.rarity)

      // Consume XP items using secure server function
      for (const item of itemsToConsume) {
        const success = await InventoryService.consumeItem(item.inventoryId, item.quantity)
        if (!success) {
          throw new Error('Failed to consume XP items securely')
        }
      }

      // Log upgrade activity
      await supabase.rpc('log_player_activity', {
        p_device_id: deviceId,
        p_activity_type: 'prime_upgrade',
        p_activity_data: {
          prime_id: prime.id,
          prime_name: prime.name,
          old_level: prime.level,
          new_level: newLevel,
          xp_gained: totalXPGain,
          items_consumed: itemsToConsume.map(item => ({
            id: item.inventoryId,
            quantity: item.quantity,
            xp_value: item.xpValue
          }))
        }
      })

      // Update prime in database
      const updatedPrime = await PrimeRuneService.updatePrime(prime.id, {
        level: newLevel,
        experience: newLevelXP,
        power: newPower,
        updated_at: new Date().toISOString()
      })

      if (!updatedPrime) {
        throw new Error('Failed to update prime')
      }

      const levelsGained = newLevel - prime.level
      const successMessage = levelsGained > 1 
        ? `${prime.name} leveled up ${levelsGained} times to Level ${newLevel}!`
        : levelsGained === 1
        ? `${prime.name} leveled up to Level ${newLevel}!`
        : `${prime.name} gained ${totalXPGain} XP!`

      return {
        success: true,
        message: successMessage,
        newLevel,
        newExperience: newLevelXP,
        newPower
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upgrade failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [calculateXPForLevel, calculateTotalXP])

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

  // Upgrade ability with secure cost validation
  const upgradeAbility = useCallback(async (
    prime: UIPrime,
    abilityIndex: number,
    abilityLevel: number
  ): Promise<AbilityUpgradeResult> => {
    try {
      setLoading(true)
      setError(null)

      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('Player not found')
      }

      // Get device ID for secure operations
      const deviceId = await PlayerManager.getDeviceID()

      // Get secure cost calculation from server
      const cost = await calculateAbilityUpgradeCost(abilityLevel, abilityIndex, prime.rarity)

      // Check if player has enough resources
      const playerData = await PlayerManager.loadPlayerData(playerId)
      if (!playerData) {
        throw new Error('Could not load player data')
      }

      if (cost.gems && (playerData.player.gems || 0) < cost.gems) {
        return { success: false, message: 'Not enough gems' }
      }

      // Check ability scrolls using secure inventory
      if (cost.items) {
        for (const requiredItem of cost.items) {
          const inventoryItem = playerData.inventory.find(
            item => item.item_type === 'ability_scroll' && item.item_id === requiredItem.itemId
          )
          
          if (!inventoryItem || (inventoryItem.quantity || 0) < requiredItem.quantity) {
            return { 
              success: false, 
              message: `Not enough ${requiredItem.itemName}` 
            }
          }
        }
      }

      // Consume resources securely
      if (cost.gems) {
        await PlayerManager.updatePlayer(playerId, {
          gems: (playerData.player.gems || 0) - cost.gems
        })
      }

      if (cost.items) {
        for (const item of cost.items) {
          // Find the inventory item ID
          const inventoryItem = playerData.inventory.find(
            inv => inv.item_type === 'ability_scroll' && inv.item_id === item.itemId
          )
          
          if (inventoryItem) {
            const success = await InventoryService.consumeItem(inventoryItem.id, item.quantity)
            if (!success) {
              throw new Error(`Failed to consume ${item.itemName}`)
            }
          }
        }
      }

      // Use secure ability upgrade function to update the database
      const { data, error } = await supabase
        .rpc('secure_upgrade_ability', {
          p_device_id: deviceId,
          p_prime_id: prime.id,
          p_ability_index: abilityIndex,
          p_current_level: abilityLevel
        })

      if (error) {
        console.error('Secure ability upgrade failed:', error)
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result || !result.success) {
        console.warn('Ability upgrade failed:', result?.message)
        return { success: false, message: result?.message || 'Upgrade failed' }
      }

      // Log upgrade activity
      await supabase.rpc('log_player_activity', {
        p_device_id: deviceId,
        p_activity_type: 'ability_upgrade',
        p_activity_data: {
          prime_id: prime.id,
          prime_name: prime.name,
          ability_index: abilityIndex,
          old_level: abilityLevel,
          new_level: result.new_level,
          cost_paid: JSON.parse(JSON.stringify(cost)) // Convert to proper JSON
        }
      })

      console.log('✅ Secure ability upgrade successful:', {
        prime: prime.name,
        ability_index: abilityIndex,
        old_level: abilityLevel,
        new_level: result.new_level
      })

      return {
        success: true,
        message: `Ability upgraded to level ${result.new_level}!`,
        newAbilityLevel: result.new_level,
        costPaid: cost
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ability upgrade failed'
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [calculateAbilityUpgradeCost])

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