import { useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { PlayerManager } from '../../lib/playerManager'
import { PrimeRuneService } from '../services/primeRuneService'
import { UIPrime } from '../services/primeService'
import { PlayerInventoryItem } from '../../types/supabase'

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
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
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

      return (data || []).map((item: PlayerInventoryItem) => {
        const metadata = item.metadata as any || {}
        return {
          id: item.id,
          name: getXPItemName(item.item_id),
          xpValue: getXPItemValue(item.item_id),
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

  // Helper function to get XP value for item
  const getXPItemValue = (itemId: string): number => {
    const valueMap: Record<string, number> = {
      'small_xp_potion': 50,
      'medium_xp_potion': 150,
      'large_xp_potion': 400,
      'epic_xp_potion': 1000,
      'legendary_xp_potion': 2500
    }
    return valueMap[itemId] || 50
  }

  // Use XP items to level up prime
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

      // Calculate total XP to be gained and validate items
      let totalXPGain = 0
      const itemsToConsume: { inventoryId: string; quantity: number; currentQuantity: number }[] = []

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

        const xpValue = getXPItemValue(inventoryItem.item_id)
        totalXPGain += xpValue * item.quantity

        itemsToConsume.push({
          inventoryId: inventoryItem.id,
          quantity: item.quantity,
          currentQuantity: currentQuantity
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

      // Consume XP items from inventory
      for (const item of itemsToConsume) {
        const newQuantity = item.currentQuantity - item.quantity

        if (newQuantity <= 0) {
          // Delete the inventory item if quantity reaches 0
          const { error: deleteError } = await supabase
            .from('player_inventory')
            .delete()
            .eq('id', item.inventoryId)

          if (deleteError) {
            console.error('Error deleting XP item:', deleteError)
            throw new Error('Failed to consume XP items')
          }
        } else {
          // Update the quantity
          const { error: updateError } = await supabase
            .from('player_inventory')
            .update({ quantity: newQuantity })
            .eq('id', item.inventoryId)

          if (updateError) {
            console.error('Error updating XP item quantity:', updateError)
            throw new Error('Failed to consume XP items')
          }
        }
      }

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

  // Calculate ability upgrade cost
  const calculateAbilityUpgradeCost = useCallback((
    abilityLevel: number,
    abilityIndex: number,
    primeRarity: string
  ): AbilityUpgradeCost => {
    // Base cost increases with ability level and prime rarity
    const rarityMultiplier = {
      'Common': 1,
      'Rare': 1.5,
      'Epic': 2,
      'Legendary': 3,
      'Mythical': 4
    }[primeRarity] || 1

    const baseCost = Math.floor((50 + abilityLevel * 25) * rarityMultiplier)
    
    // Higher ability indices (slots) cost more
    const slotMultiplier = 1 + (abilityIndex * 0.3)
    const finalCost = Math.floor(baseCost * slotMultiplier)

    return {
      gems: finalCost,
      items: [
        {
          itemId: 'ability_scroll',
          itemName: 'Ability Scroll',
          quantity: Math.max(1, Math.floor(abilityLevel / 3))
        }
      ]
    }
  }, [])

  // Upgrade ability
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

      const cost = calculateAbilityUpgradeCost(abilityLevel, abilityIndex, prime.rarity)

      // Check if player has enough resources
      const playerData = await PlayerManager.loadPlayerData(playerId)
      if (!playerData) {
        throw new Error('Could not load player data')
      }

      if (cost.gems && (playerData.player.gems || 0) < cost.gems) {
        return { success: false, message: 'Not enough gems' }
      }

      // Check ability scrolls
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

      // Consume resources
      if (cost.gems) {
        await PlayerManager.updatePlayer(playerId, {
          gems: (playerData.player.gems || 0) - cost.gems
        })
      }

      if (cost.items) {
        for (const item of cost.items) {
          // Get current quantity first
          const { data: currentItem } = await supabase
            .from('player_inventory')
            .select('quantity')
            .eq('player_id', playerId)
            .eq('item_type', 'ability_scroll')
            .eq('item_id', item.itemId)
            .single()

          if (currentItem && currentItem.quantity && currentItem.quantity >= item.quantity) {
            // Update inventory quantity
            const newQuantity = currentItem.quantity - item.quantity
            await supabase
              .from('player_inventory')
              .update({ quantity: newQuantity })
              .eq('player_id', playerId)
              .eq('item_type', 'ability_scroll')
              .eq('item_id', item.itemId)
          }
        }
      }

      // Update ability level in prime abilities array
      const currentAbilities = Array.isArray(prime.abilities) ? [...prime.abilities] : []
      // For now, we'll just track that an upgrade happened
      // In a full implementation, you'd store ability levels in the database
      
      return {
        success: true,
        message: `Ability upgraded to level ${abilityLevel + 1}!`,
        newAbilityLevel: abilityLevel + 1,
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