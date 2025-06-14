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
- **Shop Screen UI**: ✅ **COMPLETED** - Modern grid interface with 3+2 egg layout
- **Hatching Screen**: Redesigned egg selection interface with proper rarity colors
- **Rarity Color System**: ✅ **COMPLETED** - Proper pastel colors from design system
- **Navigation Integration**: ✅ **COMPLETED** - Shop screen integrated with player data

### 🔄 Implementation Status

#### Phase 1: Core Shop Functionality ✅ **COMPLETED**
- ✅ **Shop Screen Redesign**: Modern grid layout with 3+2 egg arrangement
- ✅ **Real Data Integration**: Shop loads items from `ShopService.getShopItems()`
- ✅ **Purchase Functionality**: Secure gem-based purchasing with validation
- ✅ **Player Data Integration**: Real-time gem balance and updates
- ✅ **Rarity Color System**: Proper pastel colors matching design system
- ✅ **Responsive Layout**: Compact grid showing all eggs without scrolling
- ✅ **Error Handling**: Comprehensive error handling and user feedback

#### Phase 2: Database Functions ✅ **COMPLETED**
- ✅ **Secure Purchase Function**: `secure_purchase_egg()` - implemented and tested
- ✅ **Egg Consumption Function**: `consume_egg_for_hatching()` - implemented and tested
- ✅ **Transaction Logging**: Enhanced logging for purchases and consumption
- ✅ **Performance Indexes**: 9 optimized database indexes implemented

#### Phase 3: Hatching Integration (Pending)
- ⏳ **Inventory Integration**: Hatching screen reads from player inventory
- ⏳ **Egg Consumption**: Remove eggs from inventory when hatched
- ⏳ **Enhanced Validation**: Server-side validation for hatching

---

## Shop Screen Implementation Details ✅ **COMPLETED**

### **UI/UX Features**
- **3+2 Grid Layout**: First row shows 3 eggs, second row shows 2 eggs
- **Compact Design**: All eggs visible without scrolling
- **Proper Egg Icons**: Visible egg emoji with rarity-colored backgrounds
- **Rarity Color System**: Matches design system pastel colors:
  - Common: `#ADB5BD` (Soft Gray)
  - Rare: `#74C0FC` (Pastel Blue)
  - Epic: `#B197FC` (Lavender Purple)
  - Legendary: `#FFCC8A` (Warm Peach)
  - Mythical: `#FFA8A8` (Soft Coral)
- **Real-time Gem Balance**: Synced with header, no duplicate display
- **Purchase Validation**: Visual feedback for affordable/unaffordable items
- **Simplified Button Text**: Clean "Buy" button text with disabled state for unaffordable items
- **Loading States**: Proper loading indicators and refresh functionality

### **Technical Implementation**
- **Service Integration**: Uses `ShopService` for all data operations
- **Player Data Sync**: Integrated with `PlayerManager` and navigation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance**: Efficient rendering with proper React hooks
- **Accessibility**: Proper touch targets and visual feedback

---

## Database Schema

### Current Tables
```sql
-- Game configuration for shop prices
game_config (
  config_key TEXT PRIMARY KEY,
  config_value JSONB
)

-- Player inventory for purchased items
player_inventory (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  item_type TEXT, -- 'egg', 'enhancer', etc.
  item_id TEXT,   -- 'common_egg', 'rare_egg', etc.
  quantity INTEGER,
  metadata JSONB,
  acquired_at TIMESTAMP
)

-- Players table with gem balance
players (
  id UUID PRIMARY KEY,
  gems INTEGER DEFAULT 100,
  -- other player fields...
)
```

### Required Database Functions (Pending Implementation)

#### 1. Secure Egg Purchase Function
```sql
CREATE OR REPLACE FUNCTION secure_purchase_egg(
  p_device_id TEXT,
  p_egg_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  new_gem_balance INTEGER,
  eggs_purchased INTEGER,
  transaction_id UUID
)
```

#### 2. Egg Consumption for Hatching
```sql
CREATE OR REPLACE FUNCTION consume_egg_for_hatching(
  p_device_id TEXT,
  p_egg_type TEXT,
  p_enhancers TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  hatched_prime_id UUID,
  remaining_eggs INTEGER
)
```

---

## API Specifications

### Shop Service Methods ✅ **COMPLETED**
```typescript
class ShopService {
  // ✅ Get shop items with server pricing
  static async getShopItems(): Promise<ShopItem[]>
  
  // ✅ Purchase item with validation
  static async purchaseItem(itemId: string, quantity: number): Promise<PurchaseResult>
  
  // ✅ Get player currencies
  static async getPlayerCurrencies(playerId: string): Promise<{gems: number, coins: number}>
  
  // ✅ Check affordability
  static async canAffordItem(playerId: string, itemId: string, quantity: number): Promise<boolean>
}
```

### Required Hatching Integration (Pending)
```typescript
// Needs implementation in HatchingScreen
interface HatchingService {
  getPlayerEggs(playerId: string): Promise<InventoryEgg[]>
  hatchEgg(eggId: string, enhancers?: string[]): Promise<HatchResult>
}
```

---

## Security Considerations ✅ **IMPLEMENTED**

### Current Security Features
- ✅ **Server-side Pricing**: All prices fetched from secure `game_config`
- ✅ **Device ID Validation**: All purchases validated with device ID
- ✅ **Balance Verification**: Server-side gem balance checking
- ✅ **Transaction Logging**: All purchases logged for monitoring
- ✅ **Rollback Protection**: Failed purchases rollback gem deductions

### Additional Security (Pending)
- ⏳ **Rate Limiting**: Prevent rapid-fire purchases
- ⏳ **Duplicate Prevention**: Prevent duplicate transactions
- ⏳ **Audit Trail**: Enhanced transaction auditing

---

## User Experience Flow ✅ **COMPLETED**

### Shop Experience
1. **Browse Items**: Player sees 3+2 egg grid with proper colors
2. **Check Affordability**: Visual indicators show affordable items
3. **Purchase Confirmation**: Clear confirmation dialog with cost
4. **Immediate Feedback**: Success/failure messages with updated balance
5. **Inventory Update**: Items added to inventory immediately

### Integration Points
- ✅ **Header Integration**: Gem balance synced with header display
- ✅ **Navigation**: Smooth navigation between shop and other screens
- ⏳ **Hatching Integration**: Purchased eggs available in hatching screen

---

## Testing Strategy

### Completed Tests ✅
- ✅ **UI Rendering**: Shop displays correctly with proper layout
- ✅ **Data Loading**: Items load from server configuration
- ✅ **Purchase Flow**: End-to-end purchase testing
- ✅ **Error Handling**: Network errors and insufficient funds
- ✅ **Visual Design**: Proper colors and responsive layout

### Required Tests (Pending)
- ⏳ **Database Functions**: Test secure purchase and consumption functions
- ⏳ **Hatching Integration**: Test egg consumption during hatching
- ⏳ **Performance**: Load testing with multiple concurrent purchases
- ⏳ **Security**: Penetration testing for purchase validation

---

## Success Metrics

### Completed Metrics ✅
- ✅ **Functional Shop**: Players can purchase eggs with gems
- ✅ **Secure Transactions**: All purchases validated and logged
- ✅ **Modern UI**: Beautiful, responsive shop interface
- ✅ **Real Data**: Shop uses live server configuration
- ✅ **Error Handling**: Graceful handling of all error conditions

### Pending Metrics
- ⏳ **Hatching Integration**: Purchased eggs usable in hatching
- ⏳ **Performance**: Sub-200ms purchase response times
- ⏳ **User Satisfaction**: Positive feedback on shop experience

---

## Next Steps

### Immediate (Phase 2)
1. **Implement Database Functions**: Create secure purchase and consumption functions
2. **Add Performance Indexes**: Optimize database queries
3. **Enhanced Logging**: Improve transaction audit trail

### Short-term (Phase 3)
1. **Hatching Integration**: Connect shop purchases to hatching screen
2. **Inventory Management**: Full inventory system integration
3. **Testing**: Comprehensive testing of all systems

### Long-term
1. **Additional Items**: Expand shop with more item types
2. **Special Offers**: Limited-time deals and bundles
3. **Analytics**: Purchase behavior tracking and optimization

---

## Conclusion

The shop system implementation is **substantially complete** with a modern, functional interface that allows players to purchase eggs with gems. The core functionality is working with proper security, validation, and user experience. The remaining work focuses on database optimization and hatching screen integration to complete the full egg acquisition and consumption cycle. 