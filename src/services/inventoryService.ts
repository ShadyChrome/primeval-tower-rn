import { supabase } from '../../lib/supabase'
import { PlayerInventoryItem } from '../../types/supabase'
import { PlayerManager } from '../../lib/playerManager'

export interface UIInventoryItem {
  id: string
  name: string
  type: string
  itemId: string
  quantity: number
  description: string
  rarity?: string
  xpValue?: number
  metadata?: any
}

export class InventoryService {
  /**
   * Get all inventory items for the current player
   */
  static async getPlayerInventory(): Promise<UIInventoryItem[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        console.log('No player ID found')
        return []
      }

      const { data, error } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', playerId)
        .gt('quantity', 0) // Only items with quantity > 0
        .order('acquired_at', { ascending: false })

      if (error) throw error

      // Convert database format to UI format
      return (data || []).map(this.convertToUIItem)
    } catch (error) {
      console.error('Error fetching player inventory:', error)
      return []
    }
  }

  /**
   * Get inventory items by type
   */
  static async getInventoryByType(itemType: string): Promise<UIInventoryItem[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return []
      }

      const { data, error } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', playerId)
        .eq('item_type', itemType)
        .gt('quantity', 0)
        .order('acquired_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.convertToUIItem)
    } catch (error) {
      console.error('Error fetching inventory by type:', error)
      return []
    }
  }

  /**
   * Convert database item to UI format
   */
  private static convertToUIItem(dbItem: PlayerInventoryItem): UIInventoryItem {
    const metadata = dbItem.metadata as any || {}
    
    return {
      id: dbItem.id,
      name: InventoryService.getItemDisplayName(dbItem.item_type, dbItem.item_id),
      type: InventoryService.getItemTypeDisplayName(dbItem.item_type),
      itemId: dbItem.item_id,
      quantity: dbItem.quantity || 0,
      description: InventoryService.getItemDescription(dbItem.item_type, dbItem.item_id, metadata),
      rarity: metadata.rarity,
      xpValue: metadata.xpValue,
      metadata
    }
  }

  /**
   * Get display name for item
   */
  private static getItemDisplayName(itemType: string, itemId: string): string {
    const itemNames: Record<string, Record<string, string>> = {
      xp_potion: {
        small_xp_potion: 'Small XP Potion',
        medium_xp_potion: 'Medium XP Potion',
        large_xp_potion: 'Large XP Potion',
        huge_xp_potion: 'Huge XP Potion'
      },
      ability_scroll: {
        ability_scroll: 'Ability Scroll'
      },
      egg: {
        basic_egg: 'Basic Egg',
        common_egg: 'Common Egg',
        rare_egg: 'Rare Egg',
        epic_egg: 'Epic Egg',
        legendary_egg: 'Legendary Egg',
        mythical_egg: 'Mythical Egg'
      },
      enhancer: {
        element_enhancer_ignis: 'Element Enhancer (Ignis)',
        element_enhancer_aqua: 'Element Enhancer (Aqua)',
        element_enhancer_terra: 'Element Enhancer (Terra)',
        element_enhancer_aer: 'Element Enhancer (Aer)',
        element_enhancer_lux: 'Element Enhancer (Lux)',
        element_enhancer_umbra: 'Element Enhancer (Umbra)',
        rarity_amplifier: 'Rarity Amplifier',
        rainbow_enhancer: 'Rainbow Enhancer'
      },
      currency: {
        gems: 'Gems'
      }
    }

    return itemNames[itemType]?.[itemId] || `${itemType} ${itemId}`.replace(/_/g, ' ')
  }

  /**
   * Get display name for item type
   */
  private static getItemTypeDisplayName(itemType: string): string {
    const typeNames: Record<string, string> = {
      xp_potion: 'Consumable',
      ability_scroll: 'Consumable',
      egg: 'Hatchable',
      enhancer: 'Enhancer',
      currency: 'Currency'
    }

    return typeNames[itemType] || itemType.replace(/_/g, ' ')
  }

  /**
   * Get description for item
   */
  private static getItemDescription(itemType: string, itemId: string, metadata: any): string {
    // Get XP values from server config instead of hardcoded values
    const descriptions: Record<string, Record<string, string>> = {
      xp_potion: {
        small_xp_potion: `Grants XP to a Prime (value determined by server)`,
        medium_xp_potion: `Grants XP to a Prime (value determined by server)`,
        large_xp_potion: `Grants XP to a Prime (value determined by server)`,
        huge_xp_potion: `Grants XP to a Prime (value determined by server)`
      },
      ability_scroll: {
        ability_scroll: 'Used to upgrade Prime abilities'
      },
      egg: {
        basic_egg: 'Basic Prime hatching egg',
        common_egg: 'Common Prime hatching egg',
        rare_egg: 'Rare Prime hatching egg with better chances',
        epic_egg: 'Epic Prime hatching egg with high rarity chances',
        legendary_egg: 'Legendary Prime hatching egg with premium chances',
        mythical_egg: 'Mythical Prime hatching egg with ultimate chances'
      },
      enhancer: {
        element_enhancer_ignis: 'Increases chance of hatching Ignis Primes',
        element_enhancer_aqua: 'Increases chance of hatching Aqua Primes',
        element_enhancer_terra: 'Increases chance of hatching Terra Primes',
        element_enhancer_aer: 'Increases chance of hatching Aer Primes',
        element_enhancer_lux: 'Increases chance of hatching Lux Primes',
        element_enhancer_umbra: 'Increases chance of hatching Umbra Primes',
        rarity_amplifier: 'Increases chance of higher rarity hatch',
        rainbow_enhancer: 'Best rarity boost available'
      }
    }

    return descriptions[itemType]?.[itemId] || metadata.description || 'No description available'
  }

  /**
   * Consume items from inventory using secure server-side validation
   * SECURITY: This now uses server-side validation to prevent item duplication
   */
  static async consumeItem(itemId: string, quantity: number): Promise<boolean> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('Player not found')
      }

      // Get device ID for server validation
      const deviceId = await PlayerManager.getDeviceID()
      
      // Get item details first to pass to secure function
      const { data: currentItem, error: fetchError } = await supabase
        .from('player_inventory')
        .select('item_type, item_id')
        .eq('id', itemId)
        .eq('player_id', playerId)
        .single()

      if (fetchError) throw fetchError
      if (!currentItem) {
        throw new Error('Item not found in inventory')
      }

      // Use secure server function for consumption
      const { data, error } = await supabase
        .rpc('secure_consume_items', {
          p_device_id: deviceId,
          p_item_type: currentItem.item_type,
          p_item_id: currentItem.item_id,
          p_quantity: quantity
        })

      if (error) {
        console.error('Server-side consumption failed:', error)
        throw error
      }

      const result = data && data.length > 0 ? data[0] : null
      if (!result || !result.success) {
        console.warn('Item consumption failed:', result?.message)
        return false
      }

      // Log activity for monitoring
      await supabase.rpc('log_player_activity', {
        p_device_id: deviceId,
        p_activity_type: 'item_consumption',
        p_activity_data: {
          item_type: currentItem.item_type,
          item_id: currentItem.item_id,
          quantity: quantity,
          remaining: result.remaining_quantity
        }
      })

      console.log('✅ Secure item consumption successful:', {
        item: currentItem.item_id,
        consumed: quantity,
        remaining: result.remaining_quantity
      })

      return true
    } catch (error) {
      console.error('Error consuming item:', error)
      return false
    }
  }

  /**
   * Add items to inventory
   */
  static async addItem(
    itemType: string,
    itemId: string,
    quantity: number,
    metadata: any = {}
  ): Promise<boolean> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        throw new Error('Player not found')
      }

      const item = await PlayerManager.addInventoryItem(
        playerId,
        itemType,
        itemId,
        quantity,
        metadata
      )

      return !!item
    } catch (error) {
      console.error('Error adding item:', error)
      return false
    }
  }

  /**
   * Get item count by type and id
   */
  static async getItemCount(itemType: string, itemId: string): Promise<number> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return 0
      }

      const { data, error } = await supabase
        .from('player_inventory')
        .select('quantity')
        .eq('player_id', playerId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single()

      if (error) return 0

      return data?.quantity || 0
    } catch (error) {
      console.error('Error getting item count:', error)
      return 0
    }
  }

  /**
   * Get game configuration from server (replaces hardcoded values)
   * SECURITY: Game constants now stored securely on server
   */
  static async getGameConfig(configKey: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('game_config')
        .select('config_value')
        .eq('config_key', configKey)
        .single()
      
      if (error) {
        console.error('Error fetching game config:', error)
        return null
      }
      
      return data?.config_value
    } catch (error) {
      console.error('Error fetching game config:', error)
      return null
    }
  }

  /**
   * Get XP potion values from server config
   * SECURITY: XP values now retrieved from secure server config
   */
  static async getXPPotionValues(): Promise<Record<string, number>> {
    try {
      const config = await this.getGameConfig('xp_potion_values')
      return config || {
        small_xp_potion: 50,
        medium_xp_potion: 150,
        large_xp_potion: 400,
        huge_xp_potion: 1000
      }
    } catch (error) {
      console.error('Error getting XP potion values:', error)
      // Fallback values
      return {
        small_xp_potion: 50,
        medium_xp_potion: 150,
        large_xp_potion: 400,
        huge_xp_potion: 1000
      }
    }
  }
} 