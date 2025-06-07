import { supabase } from './supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  Player, 
  PlayerInsert, 
  PlayerUpdate, 
  PlayerInventoryItem,
  PlayerInventoryInsert,
  PlayerRune,
  PlayerRuneInsert 
} from '../types/supabase'
import * as Device from 'expo-device'

const PLAYER_ID_KEY = 'player_id'

export interface PlayerData {
  player: Player
  inventory: PlayerInventoryItem[]
  runes: PlayerRune[]
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

  /**
   * Check if a player exists for this device
   */
  static async getExistingPlayer(): Promise<Player | null> {
    try {
      const deviceId = await this.getDeviceID()
      console.log('🔍 Checking for existing player with device ID:', deviceId)
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('device_id', deviceId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Database error when checking for existing player:', error)
        throw error
      }

      if (data) {
        console.log('✅ Found existing player:', data.player_name, 'ID:', data.id)
      } else {
        console.log('ℹ️ No existing player found for this device')
      }

      return data || null
    } catch (error) {
      console.error('Error checking for existing player:', error)
      return null
    }
  }

  /**
   * Create a new player
   */
  static async createPlayer(playerName: string): Promise<Player> {
    try {
      const deviceId = await this.getDeviceID()
      
      const playerData: PlayerInsert = {
        device_id: deviceId,
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

      console.log('Player created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating player:', error)
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
        {
          player_id: playerId,
          item_type: 'egg',
          item_id: 'basic_egg',
          quantity: 3,
          metadata: { rarity: 'common' }
        },
        {
          player_id: playerId,
          item_type: 'prime',
          item_id: 'small_prime',
          quantity: 5,
          metadata: { value: 10 }
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
   * Load complete player data
   */
  static async loadPlayerData(playerId?: string): Promise<PlayerData | null> {
    try {
      let targetPlayerId = playerId
      console.log('🔄 Loading player data, provided playerId:', playerId)
      
      if (!targetPlayerId) {
        // Try to get from local storage first
        targetPlayerId = await AsyncStorage.getItem(PLAYER_ID_KEY) || undefined
        console.log('💾 Cached player ID from storage:', targetPlayerId)
        
        // If not found locally, try to find by device ID
        if (!targetPlayerId) {
          console.log('🔍 No cached player ID, checking for existing player by device ID...')
          const existingPlayer = await this.getExistingPlayer()
          if (existingPlayer) {
            targetPlayerId = existingPlayer.id
            await AsyncStorage.setItem(PLAYER_ID_KEY, targetPlayerId)
            console.log('✅ Found existing player, cached ID:', targetPlayerId)
          }
        }
      }

      if (!targetPlayerId) {
        console.log('❌ No player ID available, returning null')
        return null
      }

      console.log('📊 Loading full player data for ID:', targetPlayerId)

      // Load player data
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', targetPlayerId)
        .single()

      if (playerError) throw playerError

      // Load inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('player_inventory')
        .select('*')
        .eq('player_id', targetPlayerId)
        .order('acquired_at', { ascending: false })

      if (inventoryError) throw inventoryError

      // Load runes
      const { data: runes, error: runesError } = await supabase
        .from('player_runes')
        .select('*')
        .eq('player_id', targetPlayerId)
        .order('acquired_at', { ascending: false })

      if (runesError) throw runesError

      // Update last login
      await this.updateLastLogin(targetPlayerId)

      console.log('✅ Player data loaded successfully for:', player.player_name)
      return {
        player,
        inventory: inventory || [],
        runes: runes || []
      }
    } catch (error) {
      console.error('Error loading player data:', error)
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

  /**
   * Debug method to check current storage state
   */
  static async debugStorageState(): Promise<void> {
    try {
      const deviceId = await AsyncStorage.getItem('device_id')
      const playerId = await AsyncStorage.getItem(PLAYER_ID_KEY)
      console.log('🔍 Current storage state:')
      console.log('  Device ID:', deviceId)
      console.log('  Player ID:', playerId)
      
      if (deviceId) {
        const existingPlayer = await this.getExistingPlayer()
        console.log('  Player in DB:', existingPlayer?.player_name || 'Not found')
      }
    } catch (error) {
      console.error('Error checking storage state:', error)
    }
  }
} 