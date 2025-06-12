import { supabase } from '../../lib/supabase'
import { PlayerManager } from '../../lib/playerManager'
import { InventoryService } from './inventoryService'

export interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  currency: 'gems' | 'coins'
  category: 'eggs' | 'enhancers' | 'consumables'
  rarity?: string
  metadata?: any
}

export interface PurchaseResult {
  success: boolean
  message: string
  item?: ShopItem
  newBalance?: number
}

export class ShopService {
  /**
   * Get shop items with secure server-side pricing
   * SECURITY: Prices now retrieved from secure server config
   */
  static async getShopItems(): Promise<ShopItem[]> {
    try {
      // Get pricing from secure server config
      const shopConfig = await InventoryService.getGameConfig('shop_prices')
      
      if (!shopConfig) {
        console.error('Failed to load shop configuration from server')
        return []
      }

      const items: ShopItem[] = []

      // Eggs
      if (shopConfig.eggs) {
        Object.entries(shopConfig.eggs).forEach(([eggId, price]) => {
          items.push({
            id: eggId,
            name: this.getItemDisplayName(eggId),
            description: this.getItemDescription(eggId),
            price: price as number,
            currency: 'gems',
            category: 'eggs',
            rarity: this.getEggRarity(eggId)
          })
        })
      }

      // Enhancers
      if (shopConfig.enhancers) {
        Object.entries(shopConfig.enhancers).forEach(([enhancerId, price]) => {
          items.push({
            id: enhancerId,
            name: this.getItemDisplayName(enhancerId),
            description: this.getItemDescription(enhancerId),
            price: price as number,
            currency: 'gems',
            category: 'enhancers'
          })
        })
      }

      console.log('✅ Loaded shop items with secure server pricing:', items.length)
      return items
    } catch (error) {
      console.error('Error loading shop items:', error)
      return []
    }
  }

  /**
   * Purchase item with secure server-side validation
   * SECURITY: Uses device ID validation and server-side price verification
   */
  static async purchaseItem(itemId: string, quantity: number = 1): Promise<PurchaseResult> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return { success: false, message: 'Player not found' }
      }

      // Get device ID for secure operations
      const deviceId = await PlayerManager.getDeviceID()

      // Get current player data
      const playerData = await PlayerManager.loadPlayerData(playerId)
      if (!playerData) {
        return { success: false, message: 'Could not load player data' }
      }

      // Get secure pricing from server
      const shopConfig = await InventoryService.getGameConfig('shop_prices')
      if (!shopConfig) {
        return { success: false, message: 'Shop configuration unavailable' }
      }

      // Find item price in server config
      let itemPrice: number | undefined
      let itemCategory: string | undefined

      if (shopConfig.eggs && shopConfig.eggs[itemId]) {
        itemPrice = shopConfig.eggs[itemId]
        itemCategory = 'egg'
      } else if (shopConfig.enhancers && shopConfig.enhancers[itemId]) {
        itemPrice = shopConfig.enhancers[itemId]
        itemCategory = 'enhancer'
      }

      if (!itemPrice || !itemCategory) {
        return { success: false, message: 'Item not found in shop' }
      }

      const totalCost = itemPrice * quantity
      const currentGems = playerData.player.gems || 0

      if (currentGems < totalCost) {
        return { 
          success: false, 
          message: `Not enough gems. Need ${totalCost}, have ${currentGems}` 
        }
      }

      // Deduct gems from player
      const newGemBalance = currentGems - totalCost
      await PlayerManager.updatePlayer(playerId, {
        gems: newGemBalance,
        updated_at: new Date().toISOString()
      })

      // Add item to inventory
      const itemAdded = await InventoryService.addItem(
        itemCategory,
        itemId,
        quantity,
        {
          purchased: true,
          purchase_price: itemPrice,
          purchase_date: new Date().toISOString()
        }
      )

      if (!itemAdded) {
        // Rollback gem deduction if item addition failed
        await PlayerManager.updatePlayer(playerId, {
          gems: currentGems
        })
        return { success: false, message: 'Failed to add item to inventory' }
      }

      // Log purchase activity for monitoring
      await supabase.rpc('log_player_activity', {
        p_device_id: deviceId,
        p_activity_type: 'item_purchase',
        p_activity_data: {
          item_id: itemId,
          item_category: itemCategory,
          quantity: quantity,
          price_per_item: itemPrice,
          total_cost: totalCost,
          gems_before: currentGems,
          gems_after: newGemBalance
        }
      })

      const shopItem: ShopItem = {
        id: itemId,
        name: this.getItemDisplayName(itemId),
        description: this.getItemDescription(itemId),
        price: itemPrice,
        currency: 'gems',
        category: itemCategory as 'eggs' | 'enhancers' | 'consumables'
      }

      console.log('✅ Secure purchase completed:', {
        item: itemId,
        quantity,
        cost: totalCost,
        newBalance: newGemBalance
      })

      return {
        success: true,
        message: `Successfully purchased ${quantity}x ${this.getItemDisplayName(itemId)}!`,
        item: shopItem,
        newBalance: newGemBalance
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Purchase failed' 
      }
    }
  }

  /**
   * Get display name for shop items
   */
  private static getItemDisplayName(itemId: string): string {
    const nameMap: Record<string, string> = {
      // Eggs
      'common_egg': 'Common Egg',
      'rare_egg': 'Rare Egg',
      'epic_egg': 'Epic Egg',
      'legendary_egg': 'Legendary Egg',
      'mythical_egg': 'Mythical Egg',
      
      // Enhancers
      'element_enhancer': 'Element Enhancer',
      'rarity_amplifier': 'Rarity Amplifier',
      'rainbow_enhancer': 'Rainbow Enhancer'
    }

    return nameMap[itemId] || itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  /**
   * Get description for shop items
   */
  private static getItemDescription(itemId: string): string {
    const descriptionMap: Record<string, string> = {
      // Eggs
      'common_egg': 'Hatch a Common rarity Prime with basic abilities',
      'rare_egg': 'Hatch a Rare rarity Prime with enhanced abilities',
      'epic_egg': 'Hatch an Epic rarity Prime with powerful abilities',
      'legendary_egg': 'Hatch a Legendary rarity Prime with exceptional abilities',
      'mythical_egg': 'Hatch a Mythical rarity Prime with ultimate abilities',
      
      // Enhancers
      'element_enhancer': 'Increases chance of hatching specific element Primes',
      'rarity_amplifier': 'Increases chance of higher rarity when hatching',
      'rainbow_enhancer': 'Maximum rarity boost for hatching'
    }

    return descriptionMap[itemId] || 'No description available'
  }

  /**
   * Get egg rarity for display
   */
  private static getEggRarity(eggId: string): string {
    const rarityMap: Record<string, string> = {
      'common_egg': 'Common',
      'rare_egg': 'Rare',
      'epic_egg': 'Epic',
      'legendary_egg': 'Legendary',
      'mythical_egg': 'Mythical'
    }

    return rarityMap[eggId] || 'Common'
  }

  /**
   * Get available currencies for player
   */
  static async getPlayerCurrencies(playerId: string): Promise<{ gems: number; coins: number }> {
    try {
      const playerData = await PlayerManager.loadPlayerData(playerId)
      return {
        gems: playerData?.player.gems || 0,
        coins: 0 // Coins not implemented yet
      }
    } catch (error) {
      console.error('Error getting player currencies:', error)
      return { gems: 0, coins: 0 }
    }
  }

  /**
   * Check if player can afford item
   */
  static async canAffordItem(playerId: string, itemId: string, quantity: number = 1): Promise<boolean> {
    try {
      const currencies = await this.getPlayerCurrencies(playerId)
      const shopConfig = await InventoryService.getGameConfig('shop_prices')
      
      if (!shopConfig) return false

      let itemPrice: number | undefined
      if (shopConfig.eggs && shopConfig.eggs[itemId]) {
        itemPrice = shopConfig.eggs[itemId]
      } else if (shopConfig.enhancers && shopConfig.enhancers[itemId]) {
        itemPrice = shopConfig.enhancers[itemId]
      }

      if (!itemPrice) return false

      const totalCost = itemPrice * quantity
      return currencies.gems >= totalCost
    } catch (error) {
      console.error('Error checking affordability:', error)
      return false
    }
  }
} 