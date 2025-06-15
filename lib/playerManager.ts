import { supabase } from './supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthManager } from './authManager'
import { 
  Player, 
  PlayerInsert, 
  PlayerUpdate, 
  PlayerInventoryItem,
  PlayerInventoryInsert,
  PlayerRune,
  PlayerRuneInsert,
  PlayerPrime
} from '../types/supabase'
import * as Device from 'expo-device'

const PLAYER_ID_KEY = 'player_id'

export interface PlayerData {
  player: Player
  inventory: PlayerInventoryItem[]
  runes: PlayerRune[]
  primes?: PlayerPrime[]
}

export class PlayerManager {
  /**
   * Get device ID for identifying the device
   */
  static async getDeviceID(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id')
      console.log('📱 Retrieved device ID from storage:', deviceId)
      
      if (!deviceId) {
        console.log('🆕 No device ID found, creating new one...')
        // Create a unique device ID based on device info
        const deviceInfo = await Device.getDeviceTypeAsync()
        const randomId = Math.random().toString(36).substring(2, 15)
        deviceId = `${deviceInfo}_${randomId}_${Date.now()}`
        await AsyncStorage.setItem('device_id', deviceId)
        console.log('💾 Created and stored new device ID:', deviceId)
      }
      return deviceId
    } catch (error) {
      console.error('Error getting device ID:', error)
      // Fallback to simple random ID
      const fallbackId = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
      await AsyncStorage.setItem('device_id', fallbackId)
      console.log('🚨 Used fallback device ID:', fallbackId)
      return fallbackId
    }
  }

  // Legacy device-based player lookup removed - using auth-based system only

  /**
   * Check if a player exists for the authenticated user (auth-based)
   */
  static async getExistingPlayerWithAuth(): Promise<Player | null> {
    try {
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        console.log('❌ No authenticated user for player lookup')
        return null
      }

      console.log('🔍 Checking for existing player with game user ID:', gameUserId)
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', gameUserId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Database error when checking for existing player:', error)
        throw error
      }

      if (data) {
        console.log('✅ Found existing player:', data.player_name, 'ID:', data.id)
      } else {
        console.log('ℹ️ No existing player found for this user')
      }

      return data || null
    } catch (error) {
      console.error('Error checking for existing player with auth:', error)
      return null
    }
  }

  // Legacy device-based player creation removed - using auth-based system only

  /**
   * Create a new player with authentication context
   */
  static async createPlayerWithAuth(playerName: string): Promise<Player> {
    try {
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        throw new Error('No authenticated user for player creation')
      }

      const deviceId = await AuthManager.getDeviceId()
      console.log('Creating new player with auth context:', { gameUserId, deviceId, playerName })

      const playerData: PlayerInsert = {
        id: gameUserId, // Use the game user ID as the player ID
        device_id: deviceId,
        auth_user_id: gameUserId, // Also store the auth user ID
        player_name: playerName,
        level: 1,
        current_xp: 0,
        max_xp: 100,
        gems: 100, // Starting gems
        total_playtime: 0,
        last_login: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single()

      if (error) throw error

      // Store player ID locally for quick access
      await AsyncStorage.setItem(PLAYER_ID_KEY, data.id)

      // Initialize with starter items
      await this.initializeStarterItems(data.id)

      console.log('Player created successfully with auth:', data)
      return data
    } catch (error) {
      console.error('Error creating player with auth:', error)
      throw error
    }
  }



  /**
   * Initialize starter items for new players
   */
  private static async initializeStarterItems(playerId: string): Promise<void> {
    try {
      // Add starter items to inventory
      const starterItems: PlayerInventoryInsert[] = [
        // Eggs
        {
          player_id: playerId,
          item_type: 'egg',
          item_id: 'basic_egg',
          quantity: 3,
          metadata: { rarity: 'Common' }
        },
        {
          player_id: playerId,
          item_type: 'egg',
          item_id: 'rare_egg',
          quantity: 1,
          metadata: { rarity: 'Rare' }
        },
        // XP Potions for progression
        {
          player_id: playerId,
          item_type: 'xp_potion',
          item_id: 'small_xp_potion',
          quantity: 5,
          metadata: { rarity: 'Common', xpValue: 50 }
        },
        {
          player_id: playerId,
          item_type: 'xp_potion',
          item_id: 'medium_xp_potion',
          quantity: 2,
          metadata: { rarity: 'Rare', xpValue: 150 }
        },
        // Ability Scrolls for ability upgrades
        {
          player_id: playerId,
          item_type: 'ability_scroll',
          item_id: 'ability_scroll',
          quantity: 3,
          metadata: { description: 'Used to upgrade Prime abilities' }
        },
        // Enhancers
        {
          player_id: playerId,
          item_type: 'enhancer',
          item_id: 'element_enhancer_ignis',
          quantity: 2,
          metadata: { element: 'Ignis' }
        },
        {
          player_id: playerId,
          item_type: 'enhancer',
          item_id: 'rarity_amplifier',
          quantity: 1,
          metadata: { description: 'Increases chance of higher rarity hatch' }
        }
      ]

      const { error: inventoryError } = await supabase
        .from('player_inventory')
        .insert(starterItems)

      if (inventoryError) throw inventoryError

      // Add starter rune
      const starterRune: PlayerRuneInsert = {
        player_id: playerId,
        rune_type: 'attack',
        rune_level: 1,
        rune_tier: 'common',
        stat_bonuses: { attack: 5 },
        is_equipped: false
      }

      const { error: runeError } = await supabase
        .from('player_runes')
        .insert(starterRune)

      if (runeError) throw runeError

      console.log('Starter items initialized successfully')
    } catch (error) {
      console.error('Error initializing starter items:', error)
      throw error
    }
  }

  /**
   * Load complete player data - OPTIMIZED VERSION
   */
  static async loadPlayerData(playerId?: string): Promise<PlayerData | null> {
    try {
      let deviceId: string
      console.log('🔄 Loading player data with optimized atomic function')
      
      if (playerId) {
        // If playerId provided, still need device ID for security
        deviceId = await this.getDeviceID()
      } else {
        // Get device ID and try atomic load
        deviceId = await this.getDeviceID()
      }

      console.log('📊 Loading atomic player data for device:', deviceId)

      // Use the new atomic player data loading function
      const { data, error } = await supabase
        .rpc('load_player_data_atomic', {
          p_device_id: deviceId
        })

      if (error) {
        console.error('Atomic player data load failed:', error)
        throw error
      }

      if (!data || data.length === 0) {
        console.log('❌ No player data found for device ID')
        return null
      }

      const playerResult = data[0]
      console.log('✅ Atomic player data loaded successfully:', {
        playerId: playerResult.player_id,
        playerName: playerResult.player_name,
        inventoryItems: Array.isArray(playerResult.inventory_items) ? playerResult.inventory_items.length : 0,
        runes: Array.isArray(playerResult.runes) ? playerResult.runes.length : 0,
        primes: Array.isArray(playerResult.primes) ? playerResult.primes.length : 0
      })

      // Cache the player ID
      await AsyncStorage.setItem(PLAYER_ID_KEY, playerResult.player_id)

      // Convert the aggregated data back to the expected format
      const playerData: PlayerData = {
        player: {
          id: playerResult.player_id,
          device_id: deviceId,
          auth_user_id: playerResult.player_id, // Same as ID for auth-based system
          player_name: playerResult.player_name,
          level: playerResult.level,
          current_xp: playerResult.current_xp,
          max_xp: playerResult.max_xp,
          gems: playerResult.gems,
          last_login: playerResult.last_login,
          total_playtime: playerResult.total_playtime,
          created_at: playerResult.created_at,
          updated_at: playerResult.updated_at
        },
        inventory: Array.isArray(playerResult.inventory_items) ? playerResult.inventory_items as PlayerInventoryItem[] : [],
        runes: Array.isArray(playerResult.runes) ? playerResult.runes as PlayerRune[] : [],
        primes: Array.isArray(playerResult.primes) ? playerResult.primes as PlayerPrime[] : []
      }

      return playerData
    } catch (error) {
      console.error('Error in optimized loadPlayerData:', error)
      
             // For now, return null if atomic function fails
       console.log('❌ Atomic function failed, returning null')
       return null
    }
  }

  /**
   * Load complete player data using authentication context (for new auth-based users only)
   */
  static async loadPlayerDataWithAuth(): Promise<PlayerData | null> {
    try {
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        console.log('❌ No authenticated user for player data loading')
        return null
      }

      console.log('🔄 Loading player data with auth context for user:', gameUserId)

      // Try to load by game user ID (new auth system only)
      console.log('🔍 Trying to load player by game user ID:', gameUserId)
      const { data: authPlayer, error: authError } = await supabase
        .from('players')
        .select('*')
        .eq('id', gameUserId)
        .single()

      if (!authError && authPlayer) {
        console.log('✅ Found player by auth user ID, loading complete data...')
        // Load complete data using the existing atomic function with device ID
        const { data: completeData, error: completeError } = await supabase
          .rpc('load_player_data_atomic', {
            p_device_id: authPlayer.device_id
          })

        if (!completeError && completeData && completeData.length > 0) {
          const playerResult = completeData[0]
          console.log('✅ Auth-based player data loaded successfully:', {
            playerId: playerResult.player_id,
            playerName: playerResult.player_name,
            inventoryItems: Array.isArray(playerResult.inventory_items) ? playerResult.inventory_items.length : 0,
            runes: Array.isArray(playerResult.runes) ? playerResult.runes.length : 0,
            primes: Array.isArray(playerResult.primes) ? playerResult.primes.length : 0
          })

          // Cache the player ID
          await AsyncStorage.setItem(PLAYER_ID_KEY, playerResult.player_id)

          // Transform the data to match our PlayerData interface
          const deviceId = await AuthManager.getDeviceId()
          const playerData: PlayerData = {
            player: {
              id: playerResult.player_id,
              device_id: deviceId,
              auth_user_id: playerResult.player_id, // Same as ID for auth-based system
              player_name: playerResult.player_name,
              level: playerResult.level,
              current_xp: playerResult.current_xp,
              max_xp: playerResult.max_xp,
              gems: playerResult.gems,
              last_login: playerResult.last_login,
              total_playtime: playerResult.total_playtime,
              created_at: playerResult.created_at,
              updated_at: playerResult.updated_at
            },
            inventory: Array.isArray(playerResult.inventory_items) ? playerResult.inventory_items as PlayerInventoryItem[] : [],
            runes: Array.isArray(playerResult.runes) ? playerResult.runes as PlayerRune[] : [],
            primes: Array.isArray(playerResult.primes) ? playerResult.primes as PlayerPrime[] : []
          }

          return playerData
        }
      }

      // No player found with auth user ID - this means it's a new auth-based user
      console.log('ℹ️ No player found by game user ID - new auth-based user needs to create a player')
      return null

    } catch (error) {
      console.error('Failed to load player data with auth:', error)
      return null
    }
  }

  /**
   * Update player data
   */
  static async updatePlayer(playerId: string, updates: PlayerUpdate): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId)
        .select()
        .single()

      if (error) throw error

      console.log('Player updated successfully:', data)
      return data
    } catch (error) {
      console.error('Error updating player:', error)
      return null
    }
  }

  /**
   * Add XP to player (automatically handles level ups via database trigger)
   */
  static async addXP(playerId: string, xpAmount: number): Promise<Player | null> {
    try {
      // First get current XP
      const { data: currentPlayer, error: fetchError } = await supabase
        .from('players')
        .select('current_xp')
        .eq('id', playerId)
        .single()

      if (fetchError) throw fetchError

      // Update with new XP amount
      const newXP = (currentPlayer.current_xp || 0) + xpAmount

      return await this.updatePlayer(playerId, { current_xp: newXP })
    } catch (error) {
      console.error('Error adding XP:', error)
      return null
    }
  }

  /**
   * Add gems to player
   */
  static async addGems(playerId: string, gemAmount: number): Promise<Player | null> {
    try {
      // Get current gems
      const { data: currentPlayer, error: fetchError } = await supabase
        .from('players')
        .select('gems')
        .eq('id', playerId)
        .single()

      if (fetchError) throw fetchError

      const newGems = (currentPlayer.gems || 0) + gemAmount

      return await this.updatePlayer(playerId, { gems: newGems })
    } catch (error) {
      console.error('Error adding gems:', error)
      return null
    }
  }

  /**
   * Add item to inventory
   */
  static async addInventoryItem(
    playerId: string, 
    itemType: string, 
    itemId: string, 
    quantity: number = 1, 
    metadata: any = {}
  ): Promise<PlayerInventoryItem | null> {
    try {
      // Check if item already exists
      const { data: existingItem, error: checkError } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', playerId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingItem) {
        // Update existing item quantity
        const newQuantity = (existingItem.quantity || 0) + quantity
                 const { data, error } = await supabase
           .from('player_inventory')
           .update({ 
             quantity: newQuantity,
             metadata: { ...(existingItem.metadata as object || {}), ...metadata }
           })
           .eq('id', existingItem.id)
           .select()
           .single()

        if (error) throw error
        return data
      } else {
        // Create new item
        const newItem: PlayerInventoryInsert = {
          player_id: playerId,
          item_type: itemType,
          item_id: itemId,
          quantity,
          metadata
        }

        const { data, error } = await supabase
          .from('player_inventory')
          .insert(newItem)
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error adding inventory item:', error)
      return null
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLogin(playerId: string): Promise<void> {
    try {
      await supabase
        .from('players')
        .update({ last_login: new Date().toISOString() })
        .eq('id', playerId)
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  /**
   * Get player's cached ID from local storage
   */
  static async getCachedPlayerId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PLAYER_ID_KEY)
    } catch (error) {
      console.error('Error getting cached player ID:', error)
      return null
    }
  }

  /**
   * Clear cached player data (for logout)
   */
  static async clearCachedData(): Promise<void> {
    try {
      console.log('🗑️ Clearing cached player data...')
      await AsyncStorage.removeItem(PLAYER_ID_KEY)
      console.log('✅ Cached player ID cleared (device ID preserved)')
      
      // Let's also verify what's still in storage
      const deviceId = await AsyncStorage.getItem('device_id')
      console.log('📱 Device ID still in storage:', deviceId)
    } catch (error) {
      console.error('Error clearing cached data:', error)
    }
  }


} 