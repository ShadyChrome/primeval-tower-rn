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

// Cache for game config to avoid repeated database calls
let gameConfigCache: Record<string, any> = {}
let gameConfigCacheTime: Record<string, number> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class InventoryService {
  /**
   * Get all inventory items for the current player (optimized)
   */
  static async getPlayerInventory(): Promise<UIInventoryItem[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return []
      }

      // Use optimized query with minimal data transfer
      const { data, error } = await supabase
        .from('player_inventory')
        .select('id, item_type, item_id, quantity, metadata, acquired_at')
        .eq('player_id', playerId)
        .gt('quantity', 0)
        .order('acquired_at', { ascending: false })

      if (error) throw error

      // Convert database format to UI format with optimized processing
      return (data || []).map(this.convertToUIItemOptimized)
    } catch (error) {
      console.error('Error fetching player inventory:', error)
      return []
    }
  }

  /**
   * Get inventory items by type (optimized)
   */
  static async getInventoryByType(itemType: string): Promise<UIInventoryItem[]> {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) {
        return []
      }

      const { data, error } = await supabase
        .from('player_inventory')
        .select('id, item_type, item_id, quantity, metadata, acquired_at')
        .eq('player_id', playerId)
        .eq('item_type', itemType)
        .gt('quantity', 0)
        .order('acquired_at', { ascending: false })

      if (error) throw error

      return (data || []).map(this.convertToUIItemOptimized)
    } catch (error) {
      console.error('Error fetching inventory by type:', error)
      return []
    }
  }

  /**
   * Optimized conversion with pre-computed lookups
   */
  private static convertToUIItemOptimized(dbItem: {
    id: string;
    item_type: string;
    item_id: string;
    quantity: number | null;
    metadata: any;
    acquired_at: string | null;
  }): UIInventoryItem {
    const metadata = dbItem.metadata as any || {}
    
    return {
      id: dbItem.id,
      name: InventoryService.getItemDisplayNameFast(dbItem.item_type, dbItem.item_id),
      type: InventoryService.getItemTypeDisplayNameFast(dbItem.item_type),
      itemId: dbItem.item_id,
      quantity: dbItem.quantity || 0,
      description: InventoryService.getItemDescriptionFast(dbItem.item_type, dbItem.item_id, metadata),
      rarity: metadata.rarity,
      xpValue: metadata.xpValue,
      metadata
    }
  }

  /**
   * Fast item name lookup with pre-computed map
   */
  private static getItemDisplayNameFast(itemType: string, itemId: string): string {
    // Pre-computed lookup map for better performance
    const fastLookup: Record<string, string> = {
      'xp_potion:small_xp_potion': 'Small XP Potion',
      'xp_potion:medium_xp_potion': 'Medium XP Potion',
      'xp_potion:large_xp_potion': 'Large XP Potion',
      'xp_potion:huge_xp_potion': 'Huge XP Potion',
      'ability_scroll:ability_scroll': 'Ability Scroll',
      'egg:basic_egg': 'Basic Egg',
      'egg:common_egg': 'Common Egg',
      'egg:rare_egg': 'Rare Egg',
      'egg:epic_egg': 'Epic Egg',
      'egg:legendary_egg': 'Legendary Egg',
      'egg:mythical_egg': 'Mythical Egg',
      'enhancer:element_enhancer_ignis': 'Element Enhancer (Ignis)',
      'enhancer:element_enhancer_aqua': 'Element Enhancer (Aqua)',
      'enhancer:element_enhancer_terra': 'Element Enhancer (Terra)',
      'enhancer:element_enhancer_aer': 'Element Enhancer (Aer)',
      'enhancer:element_enhancer_lux': 'Element Enhancer (Lux)',
      'enhancer:element_enhancer_umbra': 'Element Enhancer (Umbra)',
      'enhancer:rarity_amplifier': 'Rarity Amplifier',
      'enhancer:rainbow_enhancer': 'Rainbow Enhancer',
      'currency:gems': 'Gems'
    }

    const key = `${itemType}:${itemId}`
    return fastLookup[key] || `${itemType} ${itemId}`.replace(/_/g, ' ')
  }

  /**
   * Fast item type lookup
   */
  private static getItemTypeDisplayNameFast(itemType: string): string {
    const typeMap: Record<string, string> = {
      'xp_potion': 'Consumable',
      'ability_scroll': 'Consumable',
      'egg': 'Hatchable',
      'enhancer': 'Enhancer',
      'currency': 'Currency'
    }

    return typeMap[itemType] || itemType.replace(/_/g, ' ')
  }

  /**
   * Fast description lookup
   */
  private static getItemDescriptionFast(itemType: string, itemId: string, metadata: any): string {
    const fastDescriptions: Record<string, string> = {
      'xp_potion:small_xp_potion': 'Grants XP to a Prime (value determined by server)',
      'xp_potion:medium_xp_potion': 'Grants XP to a Prime (value determined by server)',
      'xp_potion:large_xp_potion': 'Grants XP to a Prime (value determined by server)',
      'xp_potion:huge_xp_potion': 'Grants XP to a Prime (value determined by server)',
      'ability_scroll:ability_scroll': 'Used to upgrade Prime abilities',
      'egg:basic_egg': 'Basic Prime hatching egg',
      'egg:common_egg': 'Common Prime hatching egg',
      'egg:rare_egg': 'Rare Prime hatching egg with better chances',
      'egg:epic_egg': 'Epic Prime hatching egg with high rarity chances',
      'egg:legendary_egg': 'Legendary Prime hatching egg with premium chances',
      'egg:mythical_egg': 'Mythical Prime hatching egg with ultimate chances',
      'enhancer:element_enhancer_ignis': 'Increases chance of hatching Ignis Primes',
      'enhancer:element_enhancer_aqua': 'Increases chance of hatching Aqua Primes',
      'enhancer:element_enhancer_terra': 'Increases chance of hatching Terra Primes',
      'enhancer:element_enhancer_aer': 'Increases chance of hatching Aer Primes',
      'enhancer:element_enhancer_lux': 'Increases chance of hatching Lux Primes',
      'enhancer:element_enhancer_umbra': 'Increases chance of hatching Umbra Primes',
      'enhancer:rarity_amplifier': 'Increases chance of higher rarity hatch',
      'enhancer:rainbow_enhancer': 'Best rarity boost available'
    }

    const key = `${itemType}:${itemId}`
    return fastDescriptions[key] || metadata.description || 'No description available'
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

      // Item consumption successful

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
   * Get game configuration from server with caching (optimized)
   * SECURITY: Game constants now stored securely on server
   */
  static async getGameConfig(configKey: string): Promise<any> {
    try {
      // Check cache first
      const now = Date.now()
      if (gameConfigCache[configKey] && 
          gameConfigCacheTime[configKey] && 
          (now - gameConfigCacheTime[configKey]) < CACHE_DURATION) {
        return gameConfigCache[configKey]
      }

      const { data, error } = await supabase
        .from('game_config')
        .select('config_value')
        .eq('config_key', configKey)
        .single()
      
      if (error) {
        console.error('Error fetching game config:', error)
        return null
      }
      
      // Cache the result
      const configValue = data?.config_value
      if (configValue) {
        gameConfigCache[configKey] = configValue
        gameConfigCacheTime[configKey] = now
      }
      
      return configValue
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