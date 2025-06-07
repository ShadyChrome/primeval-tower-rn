import { PlayerManager } from './playerManager'

/**
 * Test functions for the player system
 * These can be used for development and testing
 */

export const testPlayerSystem = async () => {
  console.log('=== Testing Player System ===')
  
  try {
    // Test 1: Check for existing player
    console.log('1. Checking for existing player...')
    const existingPlayer = await PlayerManager.getExistingPlayer()
    console.log('Existing player:', existingPlayer?.player_name || 'None found')
    
    // Test 2: Load player data if exists
    if (existingPlayer) {
      console.log('2. Loading existing player data...')
      const playerData = await PlayerManager.loadPlayerData()
      console.log('Player data loaded:', {
        name: playerData?.player.player_name,
        level: playerData?.player.level,
        xp: `${playerData?.player.current_xp}/${playerData?.player.max_xp}`,
        gems: playerData?.player.gems,
        inventory_items: playerData?.inventory.length,
        runes: playerData?.runes.length
      })
    }
    
    console.log('=== Player system test completed ===')
  } catch (error) {
    console.error('Error testing player system:', error)
  }
}

export const addTestXP = async (amount: number = 50) => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (playerId) {
      console.log(`Adding ${amount} XP...`)
      const updatedPlayer = await PlayerManager.addXP(playerId, amount)
      console.log('Updated player:', {
        level: updatedPlayer?.level,
        xp: `${updatedPlayer?.current_xp}/${updatedPlayer?.max_xp}`,
        gems: updatedPlayer?.gems
      })
    }
  } catch (error) {
    console.error('Error adding XP:', error)
  }
}

export const addTestGems = async (amount: number = 50) => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (playerId) {
      console.log(`Adding ${amount} gems...`)
      const updatedPlayer = await PlayerManager.addGems(playerId, amount)
      console.log('Updated gems:', updatedPlayer?.gems)
    }
  } catch (error) {
    console.error('Error adding gems:', error)
  }
}

export const addTestItem = async () => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (playerId) {
      console.log('Adding test item...')
      const newItem = await PlayerManager.addInventoryItem(
        playerId,
        'egg',
        'rare_egg',
        1,
        { rarity: 'rare', element: 'fire' }
      )
      console.log('Added item:', newItem)
    }
  } catch (error) {
    console.error('Error adding item:', error)
  }
}

// Test the sign-out/sign-in flow
export const testSignOutSignIn = async () => {
  console.log('=== Testing Sign-Out/Sign-In Flow ===')
  
  try {
    // Check current state
    console.log('1. Current state before sign-out:')
    await PlayerManager.debugStorageState()
    
    // Sign out (clear cached data)
    console.log('2. Signing out...')
    await PlayerManager.clearCachedData()
    
    // Check state after sign-out
    console.log('3. State after sign-out:')
    await PlayerManager.debugStorageState()
    
    // Try to load player data (simulating sign-in)
    console.log('4. Attempting to load player data (simulating sign-in)...')
    const playerData = await PlayerManager.loadPlayerData()
    
    if (playerData) {
      console.log('✅ SUCCESS: Player data loaded after sign-out/sign-in')
      console.log('   Player:', playerData.player.player_name)
      console.log('   Level:', playerData.player.level)
    } else {
      console.log('❌ FAILED: No player data found after sign-out')
    }
    
    console.log('=== Sign-Out/Sign-In Test Complete ===')
  } catch (error) {
    console.error('Error testing sign-out/sign-in flow:', error)
  }
}

// Utility to clear all player data (for testing)
export const clearPlayerData = async () => {
  try {
    console.log('Clearing player data...')
    await PlayerManager.clearCachedData()
    console.log('Player data cleared')
  } catch (error) {
    console.error('Error clearing player data:', error)
  }
}

// Debug current storage state
export const debugStorage = async () => {
  await PlayerManager.debugStorageState()
} 