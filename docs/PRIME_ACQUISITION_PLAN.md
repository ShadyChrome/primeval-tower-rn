# Prime Acquisition System - Implementation Plan

## Overview
Implement a comprehensive prime acquisition system that ensures uniqueness, handles duplicates intelligently, and provides proper ability upgrade mechanics through prime-specific ability xp.

## Current Issues
1. **Prime Duplication**: Players can have multiple copies of the same prime with different rarities
2. **Generic Ability Scrolls**: Current system uses generic ability scrolls instead of prime-specific ones
3. **No Hatching Implementation**: HatchingScreen exists but doesn't actually perform hatching
4. **Database Cleanup Needed**: Existing duplicate primes need to be consolidated

## Core Requirements

### 1. Prime Uniqueness System
- **One Prime Per Name**: Each player can only own one prime with a specific name
- **Rarity Priority**: Higher rarity versions take precedence over lower rarity ones
- **Automatic Upgrades**: When claiming a higher rarity version, existing prime is upgraded
- **Compensation**: When claiming same/lower rarity, player receives appropriate compensation

### 2. Ability XP (AXP) System
- **Prime-Specific AXP**: Each prime has its own pool of Ability XP
- **Flexible Allocation**: AXP can be freely allocated to any of the prime's abilities
- **Threshold-Based Upgrades**: Abilities upgrade automatically once AXP thresholds are reached
- **AXP Thresholds**: 10, 100, 1,000, 10,000 for Rare, Epic, Legendary, Mythical tiers

### 3. Duplicate Handling Logic

#### Case 1: New Prime (Never Owned)
- **Action**: Add new prime to collection
- **Result**: Prime added with base stats for its rarity

#### Case 2: Same Prime, Higher Rarity
- **Action**: Upgrade existing prime to new rarity (Evolution)
- **Compensation**: 
  - Refund all spent AXP back to the prime's AXP pool
  - Add new AXP based on rarity difference to all abilities
  - Upgrade prime to new rarity with appropriate base stats
- **Example**: Player has Rare Rathalos → Claims Epic Rathalos → Upgrade to Epic + refund spent AXP + add 1,000 AXP to all abilities

#### Case 3: Same Prime, Same or Lower Rarity
- **Action**: Convert duplicate to Ability XP
- **Compensation**: Award AXP to the existing prime based on duplicate's rarity
- **AXP Awards**: Common=1, Rare=10, Epic=100, Legendary=1,000, Mythical=10,000

### 4. Ability XP System Details

#### AXP Thresholds (reach this much AXP to achieve tier)
- **0-9 AXP**: Common tier
- **10-99 AXP**: Rare tier
- **100-999 AXP**: Epic tier
- **1,000-9,999 AXP**: Legendary tier
- **10,000+ AXP**: Mythical tier

#### Examples
| AXP Amount | Ability Tier |
|------------|--------------|
| 0-9        | Common       |
| 10-15      | Rare         |
| 99         | Rare         |
| 100        | Epic         |
| 500        | Epic         |
| 999        | Epic         |
| 1,000      | Legendary    |
| 5,000      | Legendary    |
| 10,000     | Mythical     |

#### Duplicate AXP Awards
- **Common Duplicate**: 1 AXP
- **Rare Duplicate**: 10 AXP
- **Epic Duplicate**: 100 AXP
- **Legendary Duplicate**: 1,000 AXP
- **Mythical Duplicate**: 10,000 AXP

#### Evolution AXP Bonus (added to all abilities)
**From Common:**
- **Common → Rare**: +10 AXP per ability
- **Common → Epic**: +100 AXP per ability
- **Common → Legendary**: +1,000 AXP per ability
- **Common → Mythical**: +10,000 AXP per ability

**From Rare:**
- **Rare → Epic**: +100 AXP per ability
- **Rare → Legendary**: +1,000 AXP per ability
- **Rare → Mythical**: +10,000 AXP per ability

**From Epic:**
- **Epic → Legendary**: +1,000 AXP per ability
- **Epic → Mythical**: +10,000 AXP per ability

**From Legendary:**
- **Legendary → Mythical**: +10,000 AXP per ability

## Database Schema Changes

### 1. Updated Player Primes Schema
```sql
-- Add AXP tracking to player_primes table
ALTER TABLE player_primes ADD COLUMN IF NOT EXISTS ability_xp INTEGER DEFAULT 0;
ALTER TABLE player_primes ADD COLUMN IF NOT EXISTS ability_xp_allocated JSONB DEFAULT '{}';
-- ability_xp_allocated format: {"ability_0": 150, "ability_1": 50, ...}
-- Total allocated AXP across all abilities should not exceed ability_xp
```

### 2. Prime Templates Table
```sql
CREATE TABLE IF NOT EXISTS prime_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prime_name VARCHAR(100) UNIQUE NOT NULL,
  element VARCHAR(20) NOT NULL,
  abilities TEXT[] NOT NULL,
  base_stats JSONB NOT NULL,
  rarity_stats JSONB NOT NULL, -- Stats for each rarity level
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Updated Player Primes Constraints
```sql
-- Ensure uniqueness per player per prime name
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_primes_unique_name 
ON player_primes (player_id, prime_name);
```

## Database Functions

### 1. Secure Prime Claim Function
```sql
CREATE OR REPLACE FUNCTION secure_prime_claim(
  p_device_id TEXT,
  p_prime_name TEXT,
  p_rarity TEXT,
  p_element TEXT,
  p_abilities TEXT[],
  p_source TEXT DEFAULT 'hatching'
)
RETURNS TABLE(
  success BOOLEAN,
  action TEXT, -- 'new_prime', 'upgrade_prime', 'duplicate_axp'
  prime_id UUID,
  axp_awarded INTEGER,
  axp_refunded INTEGER,
  new_rarity TEXT,
  message TEXT
)
```

### 2. Database Cleanup Function
```sql
CREATE OR REPLACE FUNCTION cleanup_duplicate_primes(p_device_id TEXT)
RETURNS TABLE(
  primes_processed INTEGER,
  primes_removed INTEGER,
  axp_awarded INTEGER,
  upgrades_performed INTEGER
)
```

### 3. AXP Allocation Function
```sql
CREATE OR REPLACE FUNCTION allocate_ability_xp(
  p_device_id TEXT,
  p_prime_id UUID,
  p_ability_index INTEGER,
  p_axp_amount INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  new_ability_tier TEXT,
  axp_allocated INTEGER,
  total_allocated INTEGER,
  remaining_axp INTEGER
)
```

## Client-Side Implementation

### 1. Prime Acquisition Service
```typescript
export class PrimeAcquisitionService {
  static async claimPrime(
    primeName: string,
    rarity: string,
    element: string,
    abilities: string[],
    source: string = 'hatching'
  ): Promise<PrimeClaimResult>

  static async cleanupDuplicatePrimes(): Promise<CleanupResult>
}

export interface PrimeClaimResult {
  success: boolean
  action: 'new_prime' | 'upgrade_prime' | 'duplicate_axp'
  primeId: string
  axpAwarded?: number
  axpRefunded?: number
  newRarity?: string
  message: string
}
```

### 2. Ability XP Service
```typescript
export class AbilityXPService {
  static async allocateAXP(
    primeId: string,
    abilityIndex: number,
    axpAmount: number
  ): Promise<AXPAllocationResult>

  static async getPrimeAXPStatus(primeId: string): Promise<PrimeAXPStatus>
  
  static calculateAbilityTier(axpAmount: number): string {
    if (axpAmount >= 10000) return 'Mythical'
    if (axpAmount >= 1000) return 'Legendary'
    if (axpAmount >= 100) return 'Epic'
    if (axpAmount >= 10) return 'Rare'
    return 'Common'
  }
  
  static getNextTierThreshold(currentAXP: number): number {
    if (currentAXP < 10) return 10
    if (currentAXP < 100) return 100
    if (currentAXP < 1000) return 1000
    if (currentAXP < 10000) return 10000
    return 10000 // Max tier
  }
}

export interface PrimeAXPStatus {
  totalAXP: number
  allocatedAXP: { [abilityIndex: string]: number }
  availableAXP: number
  abilityTiers: string[] // Current tier for each ability based on allocated AXP
}
```

### 3. Hatching Implementation
```typescript
export class HatchingService {
  static async hatchEgg(
    eggId: string,
    enhancers: string[] = []
  ): Promise<HatchResult>

  static async calculateHatchProbabilities(
    eggRarity: string,
    enhancers: string[]
  ): Promise<HatchProbabilities>
}
```

## User Interface Updates

### 1. Prime Claim Modal
- **New Prime**: "New prime acquired!"
- **Upgrade**: "Prime evolved to [NEW_RARITY]! AXP refunded and bonus AXP added!"
- **Duplicate**: "Duplicate prime converted to +X AXP for [PRIME_NAME]"

### 2. AXP Management Interface
```typescript
interface AXPDisplay {
  totalAXP: number
  availableAXP: number
  allocatedAXP: number
  abilityBreakdown: {
    [abilityIndex: number]: {
      name: string
      currentTier: string
      allocatedAXP: number
      nextTierThreshold: number
      axpToNextTier: number
      canAllocateMore: boolean
    }
  }
}
```

### 3. Ability Upgrade Modal Enhancement
- **AXP Allocation**: Slider or input to allocate available AXP to specific abilities
- **Tier Preview**: Show what tier the ability will reach with allocated AXP
- **Threshold Display**: Show AXP thresholds for each tier (10, 100, 1,000, 10,000)
- **Progress Bars**: Visual progress toward next tier threshold
- **Reallocation**: Allow moving AXP between abilities freely

## Implementation Phases

### Phase 1: Database Foundation
- [ ] Add AXP columns to player_primes table
- [ ] Add prime uniqueness constraints
- [ ] Implement secure_prime_claim function
- [ ] Create AXP allocation functions
- [ ] Create cleanup functions

### Phase 2: Core Services
- [ ] Implement PrimeAcquisitionService
- [ ] Create AbilityXPService for AXP management
- [ ] Create HatchingService
- [ ] Update existing prime upgrade logic

### Phase 3: User Interface
- [ ] Update AbilityUpgradeModal for AXP allocation
- [ ] Create PrimeClaimModal for acquisition feedback
- [ ] Implement AXP management interface
- [ ] Add tier progression visualization
- [ ] Implement hatching interface

### Phase 4: Migration & Testing
- [ ] Run database cleanup for existing players
- [ ] Convert existing ability levels to AXP system
- [ ] Test all acquisition scenarios
- [ ] Validate uniqueness constraints
- [ ] Test evolution and duplicate mechanics

This comprehensive plan ensures a smooth transition to a unique prime system while maintaining player progress and introducing enhanced ability upgrade mechanics. 