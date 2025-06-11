# System Patterns: Primeval Tower

## System Architecture
The application is a mobile client-server architecture.
- **Client:** A React Native application responsible for all UI rendering, user interaction, and client-side game logic. It will communicate with the backend via a RESTful API or a similar protocol like GraphQL.
- **Backend:** A server (details TBD, but could be Node.js, Supabase, etc.) that manages game data, user accounts, persistence, and complex calculations that need to be authoritative (e.g., hatching results, combat validation).

## Key Technical Decisions
- **Cross-Platform Development:** Use React Native to target both iOS and Android from a single codebase, reducing development and maintenance effort.
- **Component-Based UI:** The UI will be built using a component-based architecture (as is standard in React Native), promoting reusability and separation of concerns. The main navigation structure will be a bottom tab navigator.
- **State Management:** A robust client-side state management solution (e.g., Redux Toolkit, Zustand) will be used to manage the complex game state, including player data, Primes, inventory, and combat status.
- **Data Persistence:** Game data will be primarily stored on the server to prevent cheating and allow for a consistent experience across multiple devices. The client will cache data locally for performance and offline access where appropriate.

## Design Patterns in Use
- **Observer Pattern:** To be used for game events. For example, when a player's currency changes, the UI components observing that value will automatically update.
- **Service Locator/Dependency Injection:** To manage services like API clients, data managers, and authentication handlers, making them easily accessible throughout the application and simple to mock for testing.
- **State Pattern:** To manage the state of complex entities like a Prime during combat (e.g., `Idle`, `Attacking`, `Stunned`).

## Component Relationships
```mermaid
graph TD
    subgraph Client (React Native)
        App[App Entry Point] --> Nav[Tab Navigator]
        Nav --> Header[Header Component]
        Nav --> HatchingScreen[Hatching Screen]
        Nav --> PrimesScreen[Primes Screen]
        Nav --> HomeScreen[Home Screen]
        Nav --> BagScreen[Bag Screen]
        Nav --> ShopScreen[Shop Screen]

        Header -- displays --> PlayerInfo[Player Name, Level, XP, Resources]

        PrimesScreen --> PrimeList[Prime List]
        PrimeList --> PrimeDetails[Prime Details]
        PrimeDetails --> RuneUI[Rune Equipment UI]

        HomeScreen --> TowerUI[Tower Battle UI]
        TowerUI --> CombatSystem[Combat Logic]
    end

    subgraph Backend
        API[API Endpoint]
        DB[Database]
        Auth[Auth Service]

        API --> DB
        API --> Auth
    end

    Client -- HTTP/API Calls --> Backend

```

## Critical Implementation Paths
1.  **Hatching System:** The full pipeline from purchasing an Egg, applying enhancers, communicating with the backend to determine the hatch result based on complex probability rules, and displaying the new Prime to the user.
2.  **Combat Logic:** Implementing the turn-based, stamina-driven combat system. This includes calculating damage based on the specified formula (Pokémon-like), handling initiative (Summoners War-like), status effects, and threat generation.
3.  **Data Synchronization:** Ensuring that the client state is always in sync with the backend, especially for critical data like currency, Prime ownership, and progression. This path is vital for the integrity of the player's account. 

## Architecture Overview

Primeval Tower follows a **component-driven architecture** with clear separation between UI, business logic, and data management. The system is built around reusable components, service layers, and real-time database integration.

## Core Design Patterns

### Component Unification Pattern
**Principle**: Single source of truth for common UI elements across the application.

#### Unified Display Components
```typescript
// RuneCard - Universal rune display component
interface RuneCardProps {
  rune: PlayerRune
  onPress?: () => void
  primaryColor: string
  showEquipStatus?: boolean
  compact?: boolean
}

// ItemCard - Universal inventory item display
interface ItemCardProps {
  item: InventoryItem
  onPress?: () => void
  primaryColor?: string
  compact?: boolean
  showQuantity?: boolean
}
```

**Benefits**:
- Eliminated 70+ lines of duplicate code
- Consistent styling across all screens
- Single point of maintenance for UI logic
- Themeable and contextually adaptable

#### Usage Across Screens
```typescript
// BagScreen - Uses both components for inventory display
<RuneCard rune={rune} primaryColor={elementColor} compact={false} />
<ItemCard item={item} primaryColor={elementColor} />

// Prime Details Modal - Uses RuneCard in equipment section
<RuneCard rune={equippedRune} showEquipStatus={true} compact={true} />

// Upgrade Modal - Uses ItemCard for XP potions
<ItemCard item={xpPotion} compact={true} showQuantity={true} />
```

### Service Layer Pattern
**Principle**: Centralized business logic with clear data access patterns.

#### InventoryService - Complete CRUD Operations
```typescript
export class InventoryService {
  // Real-time inventory fetching
  static async getPlayerInventory(): Promise<UIInventoryItem[]>
  
  // Type-specific filtering
  static async getInventoryByType(itemType: string): Promise<UIInventoryItem[]>
  
  // Consumption with real-time updates
  static async consumeItem(playerId: string, inventoryId: string, quantity: number): Promise<boolean>
  
  // Item addition for shop/rewards
  static async addItem(playerId: string, itemType: string, itemId: string, quantity: number): Promise<boolean>
}
```

#### Service Integration Pattern
```typescript
// UI Components call services directly
const loadItems = async () => {
  const items = await InventoryService.getPlayerInventory()
  setInventoryItems(items)
}

// Services handle database operations
const consumeXPPotion = async (itemId: string, quantity: number) => {
  await InventoryService.consumeItem(playerId, itemId, quantity)
  // UI automatically refreshes
}
```

### Real-time Data Flow Pattern
**Principle**: Immediate UI feedback with database synchronization.

#### Data Flow Architecture
```
User Action → Service Layer → Database Update → UI State Update
    ↓              ↓              ↓               ↓
Select XP   → usePrimeXPItems → Consume Items → Progress Bar Updates
Potion        Hook              from Inventory   Show New Level
```

#### Implementation Example
```typescript
// XP Upgrade Flow
const usePrimeXPItems = async (prime: UIPrime, xpItems: XPItem[]) => {
  // 1. Validate inventory items
  // 2. Calculate level progression
  // 3. Consume items from database
  // 4. Update prime experience/level
  // 5. Return updated state for UI
  
  return {
    success: true,
    newLevel: calculatedLevel,
    newExperience: remainingXP,
    newPower: calculatedPower
  }
}
```

### State Management Pattern
**Principle**: Centralized state with prop drilling for simple data flow.

#### Component State Flow
```typescript
// Parent Component (PrimeDetailsScreen)
const [currentPrime, setCurrentPrime] = useState<UIPrime | null>(null)

const handlePrimeUpdate = (updates: Partial<UIPrime>) => {
  setCurrentPrime(prev => prev ? { ...prev, ...updates } : null)
}

// Child Component (UpgradeSection)
<UpgradeSection
  prime={currentPrime}
  onPrimeUpdated={handlePrimeUpdate}
/>

// Grandchild Component (XPUpgradeModal)
const result = await usePrimeXPItems(prime, selectedItems)
if (result.success) {
  onUpgradeSuccess(result) // Propagates up to parent
}
```

## User Interface Patterns

### Element-Based Theming
```typescript
const elementColors = {
  Ignis: '#FF6B6B',    // Fire - Red
  Azur: '#4ECDC4',     // Water - Teal  
  Vitae: '#95E1A0',    // Nature - Green
  Geo: '#DDA15E',      // Earth - Brown
  Tempest: '#8D86C9',  // Lightning - Purple
  Aeris: '#B8BBD1'     // Air - Light Purple
}
```

### Design System Structure
- **Colors**: Element-based with opacity variants
- **Typography**: Consistent scale across components
- **Spacing**: Standardized spacing scale
- **Shadows**: Elevation-based shadow system

## Data Flow Patterns

### Prime Data Architecture
```typescript
interface UIPrime {
  // Core Identity
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  
  // Progression
  level: number
  experience: number  // Added for proper XP tracking
  power: number
  abilities: string[]
  
  // Assets
  imageName?: PrimeImageType
}
```

### Database Integration Patterns

#### Service-Database Interface
```typescript
// Clean database abstraction
export class PrimeService {
  static async getPrimeById(primeId: string): Promise<UIPrime | null>
  static async updatePrime(primeId: string, updates: Partial<PlayerPrime>): Promise<UIPrime | null>
  
  // UI conversion handled internally
  private static convertToUIPrime(dbPrime: PlayerPrime): UIPrime
}
```

#### Real-time Update Pattern
```typescript
// Immediate UI update followed by database sync
const handleUpgrade = async () => {
  // 1. Optimistic UI update
  setCurrentPrime(prev => ({ ...prev, ...newData }))
  
  // 2. Database sync
  const result = await upgradeService(prime, items)
  
  // 3. Confirmation or rollback
  if (result.success) {
    // UI already updated
  } else {
    // Rollback UI state
    setCurrentPrime(originalPrime)
  }
}
```

### State Management Approach
- **Local State**: Component-specific UI state (useState)
- **Navigation State**: React Navigation handles route/screen state
- **Global State**: Future implementation for user data (Context/Redux)

## UI Patterns

### Modal vs Screen Decisions
**Use Modal When:**
- Quick information lookup
- Maintaining list context
- Temporary interactions

**Use Screen When:**  
- Extended content consumption
- Complex interactions
- Immersive experiences

### Card-Based Design
All content uses consistent card components:
- `ModernCard`: Standard content containers
- `GradientCard`: Special highlighted sections
- Element-based theming throughout

## Performance Patterns

### Component Optimization
```typescript
// Memoization for expensive operations
const upgradePreview = useMemo(() => {
  return calculateUpgradePreview(prime, selectedItems)
}, [prime, selectedItems])

// Conditional rendering for performance
{activeTab === 'upgrade' && (
  <UpgradeSection prime={prime} onPrimeUpdated={handleUpdate} />
)}
```

### Database Optimization
```typescript
// Efficient queries with proper indexes
const { data, error } = await supabase
  .from('player_inventory')
  .select('*')
  .eq('player_id', playerId)
  .eq('item_type', 'xp_potion')
  .order('acquired_at', { ascending: false })
```

### Memory Management
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  const subscription = setupRealtimeSubscription()
  
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## Testing Patterns

### Component Testing Strategy
```typescript
// Test unified components in isolation
describe('RuneCard', () => {
  it('displays rune information correctly', () => {
    render(<RuneCard rune={mockRune} primaryColor="#FF6B6B" />)
    // Assertions for rune display
  })
  
  it('handles compact mode properly', () => {
    render(<RuneCard rune={mockRune} compact={true} />)
    // Assertions for compact layout
  })
})
```

### Service Testing Strategy
```typescript
// Test service layer with mock database
describe('InventoryService', () => {
  it('fetches player inventory correctly', async () => {
    const items = await InventoryService.getPlayerInventory()
    expect(items).toHaveLength(expectedCount)
  })
  
  it('consumes items properly', async () => {
    const result = await InventoryService.consumeItem(playerId, itemId, 1)
    expect(result).toBe(true)
  })
})
```

### Integration Testing Infrastructure
- **Test Data Scripts**: Automated population of comprehensive test scenarios
- **Database Verification**: Real-time state monitoring during testing
- **Edge Case Coverage**: Multiple level-ups, item depletion, error scenarios

## Security Patterns

### Database Security
- **Row Level Security**: Player data isolation in Supabase
- **Type Validation**: Server-side validation for all mutations
- **Error Handling**: Graceful degradation without data exposure

### Client Security
- **Input Validation**: Client-side validation before service calls
- **Error Boundaries**: Prevent crashes from propagating
- **State Consistency**: Validation of UI state against database state

This pattern architecture provides a solid foundation for scaling the application while maintaining code quality, performance, and user experience excellence. 