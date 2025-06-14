# Shop Implementation Plan
## Egg Purchase System with Gems

### Overview
This document outlines the complete implementation plan for the shop system that allows players to purchase eggs with gems. The shop will be the primary source for eggs, which are then used in the hatching screen to obtain new Primes.

---

## Current System Analysis

### ✅ Already Implemented
- **Database Structure**: `game_config` table with shop pricing
- **Shop Service**: `ShopService` class with secure purchase logic
- **Inventory System**: Complete inventory management with `InventoryService`
- **Player Manager**: Gem management and player data handling
- **Shop Screen UI**: Basic shop interface with categories
- **Hatching Screen**: Redesigned egg selection interface

### 🔧 Current Shop Prices (Database)
```json
{
  "eggs": {
    "common_egg": 100,
    "rare_egg": 250,
    "epic_egg": 500,
    "legendary_egg": 1000,
    "mythical_egg": 2500
  },
  "enhancers": {
    "element_enhancer": 50,
    "rarity_amplifier": 100,
    "rainbow_enhancer": 200
  }
}
```

---

## Implementation Plan

### Phase 1: Shop Screen Enhancement
**Goal**: Make the shop fully functional with real purchase capabilities

#### 1.1 Update ShopScreen.tsx
- **Replace static data** with dynamic data from `ShopService`
- **Add real purchase functionality** using existing `ShopService.purchaseItem()`
- **Display current gem balance** from player data
- **Add purchase confirmation dialogs**
- **Handle purchase success/failure states**
- **Add loading states during purchases**

#### 1.2 Shop Features
- **Real-time gem balance** display
- **Purchase validation** (insufficient gems handling)
- **Success/error notifications**
- **Inventory updates** after purchase
- **Purchase history logging**

### Phase 2: Inventory Integration
**Goal**: Ensure purchased eggs appear in player inventory

#### 2.1 Inventory Display
- **Egg inventory screen** or section
- **Show purchased eggs** with quantities
- **Egg usage tracking** (consumed when hatched)

#### 2.2 Database Operations
- **Secure purchase transactions** (already implemented)
- **Inventory item creation** (already implemented)
- **Gem deduction** (already implemented)
- **Activity logging** (already implemented)

### Phase 3: Hatching Screen Integration
**Goal**: Connect shop purchases to hatching functionality

#### 3.1 Hatching Screen Updates
- **Load eggs from inventory** instead of static data
- **Display owned egg quantities**
- **Prevent hatching** if no eggs available
- **Consume eggs** when hatching
- **Show "Buy More" button** linking to shop

#### 3.2 Egg Consumption Logic
- **Deduct egg from inventory** when hatching
- **Validate egg availability** before hatching
- **Handle edge cases** (egg consumed by another session)

### Phase 4: Enhanced Features
**Goal**: Add polish and advanced functionality

#### 4.1 Shop Enhancements
- **Bundle deals** (multiple eggs + enhancers)
- **Daily deals** with discounts
- **Gem purchase packages** (real money)
- **Special offers** based on player progress

#### 4.2 User Experience
- **Purchase animations**
- **Inventory notifications**
- **Shop recommendations**
- **Purchase history**

---

## Database Schema

### Current Tables (Already Implemented)
```sql
-- Players table with gems
players (
  id UUID PRIMARY KEY,
  gems INTEGER DEFAULT 0,
  -- ... other fields
)

-- Inventory system
player_inventory (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  item_type TEXT, -- 'egg', 'enhancer', etc.
  item_id TEXT,   -- 'common_egg', 'rare_egg', etc.
  quantity INTEGER,
  metadata JSONB,
  acquired_at TIMESTAMP
)

-- Game configuration
game_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB, -- Contains shop prices
  version INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Required Database Functions (Already Implemented)
```sql
-- Activity logging for purchases
log_player_activity(p_device_id TEXT, p_activity_type TEXT, p_activity_data JSONB)

-- Secure item consumption (for hatching)
secure_consume_items(p_device_id TEXT, p_item_type TEXT, p_item_id TEXT, p_quantity INTEGER)
```

---

## API Endpoints & Services

### ShopService Methods (Already Implemented)
```typescript
class ShopService {
  // Get shop items with server-side pricing
  static async getShopItems(): Promise<ShopItem[]>
  
  // Purchase item with validation
  static async purchaseItem(itemId: string, quantity: number): Promise<PurchaseResult>
  
  // Check if player can afford item
  static async canAffordItem(playerId: string, itemId: string, quantity: number): Promise<boolean>
  
  // Get player currencies
  static async getPlayerCurrencies(playerId: string): Promise<{gems: number, coins: number}>
}
```

### InventoryService Methods (Already Implemented)
```typescript
class InventoryService {
  // Get all inventory items
  static async getPlayerInventory(): Promise<UIInventoryItem[]>
  
  // Get items by type (e.g., eggs)
  static async getInventoryByType(itemType: string): Promise<UIInventoryItem[]>
  
  // Add items to inventory
  static async addItem(itemType: string, itemId: string, quantity: number, metadata?: any): Promise<boolean>
  
  // Get item count
  static async getItemCount(itemType: string, itemId: string): Promise<number>
}
```

---

## Security Considerations

### ✅ Already Implemented Security Features
1. **Server-side price validation** - Prices fetched from database config
2. **Device ID validation** - Prevents unauthorized purchases
3. **Transaction atomicity** - Rollback on failure
4. **Activity logging** - All purchases logged for monitoring
5. **Inventory validation** - Prevents negative quantities

### Additional Security Measures
1. **Rate limiting** - Prevent rapid-fire purchases
2. **Purchase validation** - Double-check before deducting gems
3. **Audit trails** - Complete purchase history
4. **Anti-cheat measures** - Validate client-server state

---

## User Experience Flow

### Purchase Flow
1. **Player opens Shop** → Load items from database
2. **Player selects egg** → Show price and current gems
3. **Player taps "Buy"** → Show confirmation dialog
4. **Confirm purchase** → Validate gems, deduct cost, add to inventory
5. **Show success** → Update UI, show new gem balance
6. **Navigate to inventory** → Show purchased eggs

### Hatching Flow
1. **Player opens Hatching** → Load eggs from inventory
2. **Player selects egg** → Check availability in inventory
3. **Player taps "Hatch"** → Consume egg, run hatching logic
4. **Show results** → Display hatched Prime
5. **Update inventory** → Remove consumed egg

---

## Testing Strategy

### Unit Tests
- **ShopService purchase logic**
- **Inventory management**
- **Gem balance calculations**
- **Error handling**

### Integration Tests
- **End-to-end purchase flow**
- **Shop → Inventory → Hatching flow**
- **Database transaction integrity**
- **UI state management**

### Edge Cases
- **Insufficient gems**
- **Network failures**
- **Concurrent purchases**
- **Inventory synchronization**

---

## Implementation Priority

### High Priority (Phase 1)
1. ✅ **Database setup** (Already complete)
2. ✅ **Shop service** (Already complete)
3. 🔧 **Shop UI integration** (Needs implementation)
4. 🔧 **Purchase functionality** (Needs UI integration)

### Medium Priority (Phase 2)
1. 🔧 **Inventory display** (Partially complete)
2. 🔧 **Hatching integration** (Needs inventory connection)
3. 🔧 **Egg consumption** (Needs implementation)

### Low Priority (Phase 3)
1. 📋 **Enhanced shop features**
2. 📋 **Purchase animations**
3. 📋 **Advanced analytics**

---

## Success Metrics

### Technical Metrics
- **Purchase success rate** > 99%
- **Transaction integrity** 100%
- **Response time** < 2 seconds
- **Error rate** < 1%

### User Experience Metrics
- **Purchase completion rate**
- **Shop engagement time**
- **Egg purchase frequency**
- **User satisfaction scores**

---

## Next Steps

### Immediate Actions
1. **Update ShopScreen.tsx** to use real data and purchase functionality
2. **Test purchase flow** end-to-end
3. **Integrate inventory display** in hatching screen
4. **Implement egg consumption** logic

### Follow-up Actions
1. **Add purchase confirmations** and better UX
2. **Implement bundle deals** and special offers
3. **Add purchase analytics** and monitoring
4. **Optimize performance** and caching

---

## Code Examples

### Shop Purchase Implementation
```typescript
// In ShopScreen.tsx
const handlePurchase = async (itemId: string) => {
  setLoading(true)
  try {
    const result = await ShopService.purchaseItem(itemId, 1)
    if (result.success) {
      showSuccessMessage(result.message)
      updateGemBalance(result.newBalance)
      // Optionally navigate to inventory
    } else {
      showErrorMessage(result.message)
    }
  } catch (error) {
    showErrorMessage('Purchase failed')
  } finally {
    setLoading(false)
  }
}
```

### Hatching with Inventory
```typescript
// In HatchingScreen.tsx
const handleHatch = async (eggType: string) => {
  const eggCount = await InventoryService.getItemCount('egg', eggType)
  if (eggCount <= 0) {
    showMessage('No eggs available. Visit the shop to buy more!')
    return
  }
  
  // Consume egg and hatch
  const consumed = await InventoryService.consumeItem('egg', eggType, 1)
  if (consumed) {
    // Run hatching logic
    const result = await hatchEgg(eggType)
    showHatchingResult(result)
  }
}
```

This comprehensive plan provides a roadmap for implementing a fully functional shop system that integrates seamlessly with the existing game architecture while maintaining security and providing an excellent user experience. 