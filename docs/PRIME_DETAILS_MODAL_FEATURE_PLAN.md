# Prime Details Modal - Feature Implementation Plan

## Overview

The Prime Details Modal is a comprehensive interface that allows players to view, manage, and interact with their Primes. This feature serves as the central hub for Prime management, including viewing stats, equipping runes, upgrading abilities, and preparing for combat.

## Feature Scope

### Core Functionality
- **Prime Information Display**: Complete stats, abilities, and metadata
- **Rune Equipment System**: Visual rune slots with drag-and-drop functionality
- **Prime Upgrade System**: Level up primes using XP items
- **Ability Management**: View and upgrade individual abilities
- **Element Advantage Display**: Show combat effectiveness against other elements

### User Experience Goals
- **Intuitive Navigation**: Easy-to-understand layout with clear visual hierarchy
- **Beautiful Design**: Consistent with the game's pastel, modern aesthetic
- **Responsive Interactions**: Smooth animations and immediate feedback
- **Accessible Information**: All relevant data presented without overwhelming the user

## Technical Architecture

### Component Structure
```
PrimeDetailsModal/
├── PrimeDetailsModal.tsx           # Main modal container
├── sections/
│   ├── PrimeHeader.tsx            # Prime image, name, level, rarity
│   ├── StatsSection.tsx           # Detailed stats display
│   ├── AbilitiesSection.tsx       # Abilities grid with upgrade options
│   ├── RuneEquipment.tsx          # 6-slot rune equipment interface
│   └── ElementAdvantages.tsx      # Element effectiveness chart
├── components/
│   ├── StatBar.tsx                # Individual stat display component
│   ├── AbilityCard.tsx            # Single ability display
│   ├── RuneSlot.tsx               # Individual rune slot
│   └── UpgradeButton.tsx          # Level up/upgrade action button
└── hooks/
    ├── usePrimeData.tsx           # Prime data management
    ├── useRuneEquipment.tsx       # Rune equipping logic
    └── usePrimeUpgrade.tsx        # Upgrade and XP management
```

### Data Models

#### Extended Prime Type
```typescript
interface DetailedPrime {
  // Base Prime properties
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  experience: number
  maxExperience: number
  
  // Combat Stats
  stats: {
    // Visible Stats
    attack: number
    defense: number
    speed: number
    stamina: number
    courage: number
    precision: number
    
    // Hidden Stats (calculated)
    health: number
    criticalChance: number
    criticalDamage: number
    threat: number
    statusChance: number
    statusDamage: number
  }
  
  // Abilities
  abilities: PrimeAbility[]
  
  // Equipment
  equippedRunes: (PlayerRune | null)[] // 6 slots
  
  // Metadata
  imageName: PrimeImageType
  acquiredAt: string
  totalBattles: number
  totalWins: number
}

interface PrimeAbility {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  power: number
  staminaCost: number
  cooldown: number
  statusEffects: StatusEffect[]
  elementalDamage: boolean
}
```

#### Rune Equipment System
```typescript
interface RuneSlot {
  slotIndex: number
  rune: PlayerRune | null
  synergyActive: boolean
  synergyPartners: number[] // Other slot indices with same synergy
}

interface RuneEquipmentState {
  slots: RuneSlot[]
  availableRunes: PlayerRune[]
  activeSynergies: RuneSynergy[]
  totalStatBonus: StatBonus
}
```

## User Interface Design

### Modal Layout
- **Full-screen modal** with slide-up animation
- **Scrollable content** with fixed header and action buttons
- **Tab-based sections** for different aspects (Stats, Abilities, Runes)
- **Beautiful gradients** matching the prime's element

### Header Section
- **Large prime image** (80% of screen width) with subtle glow effect
- **Prime name** in prominent typography
- **Level and XP bar** with smooth animations
- **Rarity badge** with appropriate color coding
- **Element icon** with glowing effect

### Stats Section
- **Visual stat bars** showing current vs maximum values
- **Rune bonuses** highlighted in different color
- **Base stats vs enhanced stats** clearly differentiated
- **Combat effectiveness preview** against different elements

### Abilities Section
- **4-column grid** for abilities (some may be empty for lower-level primes)
- **Ability level indicators** with upgrade availability
- **Damage/effect previews** calculated with current stats
- **Upgrade costs** clearly displayed

### Rune Equipment
- **6 hexagonal slots** arranged in 2 rows of 3
- **Drag-and-drop interface** for equipping runes
- **Synergy indicators** showing active set bonuses
- **Rune preview** on hover/selection
- **Equipment suggestions** based on prime's element/role

## Implementation Phases

### Phase 1: Core Modal Structure (Day 1)
**Goal**: Basic modal with prime information display

**Tasks**:
- [ ] Create `PrimeDetailsModal` component with CenteredModal base
- [ ] Implement `PrimeHeader` with prime image and basic info
- [ ] Add modal trigger to `handlePrimePress` in PrimesScreen
- [ ] Create basic navigation/close functionality
- [ ] Implement smooth open/close animations

**Acceptance Criteria**:
- Modal opens when prime card is tapped
- Displays prime image, name, level, and rarity
- Can be closed with back button or overlay tap
- Consistent with design system aesthetics

### Phase 2: Stats and Information Display (Day 2)
**Goal**: Complete prime information visualization

**Tasks**:
- [ ] Create `StatsSection` with all visible stats
- [ ] Implement `AbilitiesSection` with ability cards
- [ ] Add `ElementAdvantages` effectiveness chart
- [ ] Create `StatBar` component for visual stat representation
- [ ] Implement tab navigation between sections

**Acceptance Criteria**:
- All prime stats are accurately displayed
- Abilities show correct information and levels
- Element advantages are clearly visualized
- Stats reflect any currently equipped rune bonuses

### Phase 3: Rune Equipment System (Day 3)
**Goal**: Functional rune equipping interface

**Tasks**:
- [ ] Create `RuneEquipment` component with 6 slots
- [ ] Implement `RuneSlot` individual slot component
- [ ] Add rune selection modal/drawer
- [ ] Implement equip/unequip functionality with Supabase
- [ ] Add synergy calculation and display
- [ ] Create stat bonus preview when hovering runes

**Acceptance Criteria**:
- Players can equip/unequip runes to/from prime
- Synergy bonuses are calculated and displayed correctly
- Stat changes are immediately reflected in stats section
- Rune changes persist to database

### Phase 4: Upgrade and Progression (Day 4)
**Goal**: Prime and ability upgrade functionality

**Tasks**:
- [ ] Create `usePrimeUpgrade` hook for XP management
- [ ] Implement level-up functionality using XP potions
- [ ] Add ability upgrade system
- [ ] Create upgrade confirmation dialogs
- [ ] Implement resource consumption (gems, items)
- [ ] Add upgrade success animations

**Acceptance Criteria**:
- Players can use XP potions to level up primes
- Ability upgrades work correctly with resource consumption
- All upgrades are validated and persisted
- Clear feedback for successful/failed upgrades

### Phase 5: Polish and Enhancement (Day 5)
**Goal**: Final refinements and advanced features

**Tasks**:
- [ ] Add micro-animations using react-native-reanimated
- [ ] Implement advanced stat calculations
- [ ] Add combat simulation/preview
- [ ] Create sharing functionality (screenshot prime)
- [ ] Optimize performance and loading states
- [ ] Add accessibility features

**Acceptance Criteria**:
- Smooth animations throughout the interface
- Performance is optimized for all device types
- Advanced features work correctly
- Accessible to users with disabilities

## Database Integration

### Required Supabase Functions
```sql
-- Get detailed prime data with stats and equipment
CREATE OR REPLACE FUNCTION get_prime_details(p_prime_id TEXT)
RETURNS JSON AS $$
-- Implementation details for fetching complete prime data
$$;

-- Equip rune to prime slot
CREATE OR REPLACE FUNCTION equip_rune_to_prime(
  p_player_id TEXT,
  p_prime_id TEXT,
  p_rune_id TEXT,
  p_slot_index INTEGER
) RETURNS BOOLEAN AS $$
-- Implementation for rune equipping
$$;

-- Upgrade prime level using XP items
CREATE OR REPLACE FUNCTION upgrade_prime_level(
  p_player_id TEXT,
  p_prime_id TEXT,
  p_xp_item_id TEXT,
  p_quantity INTEGER
) RETURNS JSON AS $$
-- Implementation for prime leveling
$$;
```

### New Database Tables (if needed)
```sql
-- Prime instances with individual progression
CREATE TABLE player_primes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT REFERENCES players(id),
  prime_name TEXT NOT NULL,
  element TEXT NOT NULL,
  rarity TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  abilities JSONB DEFAULT '[]',
  acquired_at TIMESTAMP DEFAULT NOW(),
  total_battles INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0
);

-- Rune synergy definitions
CREATE TABLE rune_synergies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  required_runes INTEGER NOT NULL,
  stat_bonuses JSONB NOT NULL
);
```

## Testing Strategy

### Unit Tests
- [ ] Component rendering tests for all modal sections
- [ ] Stat calculation accuracy tests
- [ ] Rune synergy logic tests
- [ ] Upgrade validation tests

### Integration Tests
- [ ] Modal open/close flow testing
- [ ] Rune equipping end-to-end tests
- [ ] Prime upgrade flow tests
- [ ] Database transaction tests

### User Acceptance Tests
- [ ] Prime details display accuracy
- [ ] Rune equipment workflow
- [ ] Upgrade process usability
- [ ] Performance under various conditions

## Performance Considerations

### Optimization Strategies
- **Lazy loading** of prime data when modal opens
- **Memoized calculations** for stats and synergies
- **Virtualized rune lists** for large inventories
- **Image caching** for prime and rune assets
- **Debounced updates** for real-time stat previews

### Memory Management
- **Component cleanup** when modal closes
- **Subscription management** for database listeners
- **Image disposal** for large prime assets
- **State cleanup** for complex calculations

## Success Metrics

### User Engagement
- **Modal open rate**: % of prime taps that result in modal views
- **Time spent in modal**: Average session duration
- **Rune equipment rate**: % of users who equip runes
- **Upgrade completion rate**: % of upgrade attempts that complete

### Technical Performance
- **Modal open time**: < 300ms from tap to display
- **Smooth animations**: 60 FPS throughout interaction
- **Database response time**: < 200ms for all queries
- **Memory usage**: < 50MB additional when modal is open

## Future Enhancements

### Planned Features
- **Prime comparison mode**: Side-by-side prime comparison
- **Loadout presets**: Save/load rune configurations
- **Battle simulation**: Preview combat effectiveness
- **Prime sharing**: Social features and screenshots
- **Advanced filtering**: Filter primes by various criteria

### Technical Improvements
- **Offline mode**: Cache prime data for offline viewing
- **Background sync**: Update prime data in background
- **Advanced animations**: More sophisticated visual effects
- **AR integration**: View primes in augmented reality

## Risk Assessment

### Technical Risks
- **Performance**: Complex calculations may impact performance
- **Data consistency**: Concurrent rune equipment conflicts
- **Memory usage**: Large number of prime assets
- **Animation complexity**: Smooth animations on older devices

### Mitigation Strategies
- **Performance profiling** throughout development
- **Database transaction management** for consistency
- **Asset optimization** and lazy loading
- **Progressive enhancement** for animations

## Conclusion

The Prime Details Modal represents a crucial feature that transforms the game from a collection interface into an interactive management system. By implementing this feature with attention to user experience, performance, and extensibility, we create a foundation for future game mechanics while providing immediate value to players.

The phased approach ensures steady progress with testable milestones, while the comprehensive technical plan addresses potential challenges proactively. This feature will significantly enhance player engagement and set the stage for combat system implementation. 