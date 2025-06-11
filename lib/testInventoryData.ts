import { PlayerManager } from './playerManager'
import { InventoryService } from '../src/services/inventoryService'
import { addTestItemsToExistingPlayer, addXPPotionsForTesting } from './updatePlayerItems'

/**
 * Test and verify inventory system
 */
export const testInventorySystem = async () => {
  console.log('=== Testing Inventory System ===')
  
  try {
    // Test 1: Check for existing player
    console.log('1. Checking for existing player...')
    const playerId = await PlayerManager.getCachedPlayerId()
    if (!playerId) {
      console.log('❌ No player found. Please create a player first.')
      return
    }
    console.log('✅ Player found:', playerId)

    // Test 2: Load current inventory
    console.log('2. Loading current inventory...')
    const inventory = await InventoryService.getPlayerInventory()
    console.log(`📦 Current inventory: ${inventory.length} items`)
    
    // Group by type for better overview
    const itemsByType = inventory.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = []
      acc[item.type].push(item)
      return acc
    }, {} as Record<string, any[]>)

    Object.entries(itemsByType).forEach(([type, items]) => {
      console.log(`   ${type}: ${items.length} different items`)
      items.forEach(item => {
        console.log(`     - ${item.name}: ${item.quantity}`)
      })
    })

    // Test 3: Check XP potions specifically
    console.log('3. Checking XP potions for upgrade testing...')
    const xpPotions = await InventoryService.getInventoryByType('xp_potion')
    console.log(`🧪 XP Potions available: ${xpPotions.length} types`)
    
    let totalXP = 0
    xpPotions.forEach(potion => {
      const totalValue = (potion.xpValue || 0) * potion.quantity
      totalXP += totalValue
      console.log(`   - ${potion.name}: ${potion.quantity} (${potion.xpValue} XP each, ${totalValue} total)`)
    })
    console.log(`💪 Total XP available: ${totalXP}`)

    // Test 4: Check ability scrolls
    console.log('4. Checking ability scrolls...')
    const abilityScrolls = await InventoryService.getInventoryByType('ability_scroll')
    const totalScrolls = abilityScrolls.reduce((sum, item) => sum + item.quantity, 0)
    console.log(`📜 Ability scrolls available: ${totalScrolls}`)

    // Test 5: Show recommendations
    console.log('5. Recommendations:')
    if (xpPotions.length === 0 || totalXP < 500) {
      console.log('⚠️  Low XP potions - consider adding more for testing')
    }
    if (totalScrolls < 5) {
      console.log('⚠️  Low ability scrolls - consider adding more for testing')
    }
    if (xpPotions.length > 0 && totalScrolls > 0) {
      console.log('✅ Inventory looks good for testing upgrade functions!')
    }

    console.log('=== Inventory system test completed ===')
    return { inventory, xpPotions, totalXP, totalScrolls }
  } catch (error) {
    console.error('❌ Error testing inventory system:', error)
    return null
  }
}

/**
 * Quick function to add test items for upgrade testing
 */
export const setupTestItemsForUpgrades = async () => {
  console.log('=== Setting up test items for upgrades ===')
  
  try {
    await addTestItemsToExistingPlayer()
    console.log('✅ Test items added successfully')
    
    // Verify the additions
    await testInventorySystem()
  } catch (error) {
    console.error('❌ Error setting up test items:', error)
  }
}

/**
 * Add lots of XP potions for extensive testing
 */
export const addLotsOfXPPotions = async () => {
  console.log('=== Adding lots of XP potions for testing ===')
  
  try {
    await addXPPotionsForTesting()
    console.log('✅ XP potions added successfully')
    
    // Show updated inventory
    const inventory = await testInventorySystem()
    return inventory
  } catch (error) {
    console.error('❌ Error adding XP potions:', error)
  }
} 