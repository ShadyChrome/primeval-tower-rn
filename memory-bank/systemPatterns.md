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

Primeval Tower follows a modern React Native architecture with TypeScript, combining functional components, custom hooks, and a clean separation of concerns.

## Core Navigation Architecture ⭐ UPDATED

### Dual Navigation System
```
AppNavigation (Stack Navigator)
├── MainTabs (Tab Navigator)  
│   ├── Hatching
│   ├── Primes  
│   ├── Home
│   ├── Bag
│   └── Shop
└── PrimeDetails (Screen)
```

**Key Pattern:** Stack Navigator wraps Tab Navigator, enabling seamless navigation to detail screens while preserving tab state.

### Navigation Flow
1. **Tab Navigation**: Primary app navigation between major sections
2. **Stack Navigation**: Detail screens (PrimeDetails) push onto stack  
3. **Route Parameters**: Type-safe parameter passing between screens
4. **Back Navigation**: Native back button support with proper state restoration

### TypeScript Navigation Types
```typescript
type RootStackParamList = {
  MainTabs: undefined
  PrimeDetails: { prime: Prime }
}
```

## Component Architecture

### Dual Viewing Approach Pattern ⭐ NEW

**Problem Solved**: Users need different viewing contexts - quick modal vs immersive screen

**Implementation**: 
- Single source components (`StatsSection`, `AbilitiesSection`, `ElementAdvantages`)
- Modal wrapper (`PrimeDetailsModal`) for overlay context
- Screen wrapper (`PrimeDetailsScreen`) for full-screen context  
- User toggle to select preferred approach

**Benefits**:
- Code reuse eliminates duplication
- Consistent user experience across modes
- Easy maintenance of business logic
- User choice improves satisfaction

### Component Hierarchy
```
PrimeDetailsModal OR PrimeDetailsScreen
├── Header (different implementations)
├── Image Section (shared styling patterns)
├── Tab Navigation (different layouts)
└── Content Sections (fully shared)
    ├── StatsSection
    ├── AbilitiesSection  
    └── ElementAdvantages
```

## Theme System

### Element-Based Design Pattern
Every UI element derives colors from prime elements:
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
interface Prime {
  // Core Identity
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  
  // Progression
  level: number
  power: number
  abilities: string[]
  
  // Assets
  imageName?: PrimeImageType
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

### Image Optimization
```typescript
// Optimized WebP images for runtime
const imagePath = `/assets/primes/${primeName}.webp`

// High-res PNG for development  
const devImagePath = `/assets/primes-png/${primeName}.png`
```

### Component Optimization
- **Memoization**: React.memo for expensive renders
- **Lazy Loading**: Conditional component rendering
- **Asset Preloading**: Critical images loaded early

## Code Organization

### File Structure Pattern
```
src/
├── screens/           # Full screen components
├── components/        # Reusable UI components
│   ├── ui/           # Basic UI building blocks
│   └── modals/       # Modal-specific components
│       ├── sections/ # Business logic sections
│       └── components/ # Modal UI components  
├── theme/            # Design system
├── assets/           # Static assets and definitions
└── services/         # API and data services
```

### Import Patterns
- **Relative imports**: For co-located files
- **Absolute imports**: For cross-domain utilities
- **Barrel exports**: For clean component APIs

## Error Handling

### Navigation Error Prevention
```typescript
// Type-safe navigation calls
navigation.navigate('PrimeDetails', { prime })

// Safe parameter access
const { prime } = route.params
if (!prime) {
  navigation.goBack()
  return null
}
```

### Component Error Boundaries
- Graceful fallbacks for missing data
- Type guards for runtime safety
- User-friendly error states

## Testing Patterns

### Component Testing Approach
- **Unit Tests**: Individual component logic
- **Integration Tests**: Navigation flows
- **E2E Tests**: Complete user workflows

### Testable Architecture
- Pure functions for business logic
- Separated UI and logic concerns
- Mockable service interfaces

## Future Architecture Plans

### Database Integration Patterns
- **Supabase**: Real-time data sync
- **Type-safe queries**: Generated TypeScript types  
- **Offline support**: Local data caching

### Advanced Navigation
- **Deep linking**: Direct navigation to primes
- **Back stack management**: Complex navigation flows
- **Screen analytics**: Usage tracking patterns

This architecture successfully balances flexibility, maintainability, and user experience through thoughtful component design and navigation patterns. 