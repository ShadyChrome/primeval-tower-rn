import { PlayerManager } from './playerManager'

/**
 * Add test items to existing player for testing upgrade functions
 */
export const addTestItemsToExistingPlayer = async (): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      console.log('No player found')
      return
    }

    console.log('Adding test items to existing player...')

    // Add additional XP potions for testing
    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'small_xp_potion',
      10,
      { rarity: 'Common', xpValue: 50 }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'medium_xp_potion',
      5,
      { rarity: 'Rare', xpValue: 150 }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'large_xp_potion',
      2,
      { rarity: 'Epic', xpValue: 400 }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'huge_xp_potion',
      1,
      { rarity: 'Legendary', xpValue: 1000 }
    )

    // Add ability scrolls
    await PlayerManager.addInventoryItem(
      playerId,
      'ability_scroll',
      'ability_scroll',
      5,
      { description: 'Used to upgrade Prime abilities' }
    )

    // Add enhancers
    await PlayerManager.addInventoryItem(
      playerId,
      'enhancer',
      'element_enhancer_ignis',
      2,
      { element: 'Ignis' }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'enhancer',
      'rarity_amplifier',
      3,
      { description: 'Increases chance of higher rarity hatch' }
    )

    // Add additional eggs
    await PlayerManager.addInventoryItem(
      playerId,
      'egg',
      'rare_egg',
      1,
      { rarity: 'Rare' }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'egg',
      'epic_egg',
      1,
      { rarity: 'Epic' }
    )

    console.log('✅ Test items added successfully!')
  } catch (error) {
    console.error('❌ Error adding test items:', error)
  }
}

/**
 * Quick function to add XP potions for testing upgrade functionality
 */
export const addXPPotionsForTesting = async (): Promise<void> => {
  try {
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      console.log('No player found')
      return
    }

    console.log('Adding XP potions for testing...')

    // Add lots of XP potions for testing
    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'small_xp_potion',
      20,
      { rarity: 'Common', xpValue: 50 }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'medium_xp_potion',
      10,
      { rarity: 'Rare', xpValue: 150 }
    )

    await PlayerManager.addInventoryItem(
      playerId,
      'xp_potion',
      'large_xp_potion',
      5,
      { rarity: 'Epic', xpValue: 400 }
    )

    console.log('✅ XP potions added for testing!')
  } catch (error) {
    console.error('❌ Error adding XP potions:', error)
  }
} 