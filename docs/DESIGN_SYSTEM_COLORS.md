# Design System - Color Palette

## Overview
Primeval Tower uses a carefully crafted pastel color palette that creates a calming, wellness-inspired aesthetic. All colors are soft and harmonious, promoting a relaxing gaming experience.

## Rarity Color System

The game uses a 5-tier rarity system with beautiful pastel colors that maintain clear hierarchy while feeling gentle and approachable:

### **Rarity Colors**
- **Common**: `#ADB5BD` (Soft Gray)
  - *Feeling*: Calm and neutral, representing the foundational tier
  - *Usage*: Prime cards, egg icons, rune badges
  
- **Rare**: `#74C0FC` (Pastel Blue) 
  - *Feeling*: Peaceful and trustworthy, like a clear sky
  - *Usage*: Prime cards, egg icons, rune badges
  
- **Epic**: `#B197FC` (Lavender Purple)
  - *Feeling*: Mystical and elegant, suggesting magical properties
  - *Usage*: Prime cards, egg icons, rune badges
  
- **Legendary**: `#FFCC8A` (Warm Peach)
  - *Feeling*: Premium yet gentle, like a warm sunset
  - *Usage*: Prime cards, egg icons, rune badges
  
- **Mythical**: `#FFA8A8` (Soft Coral)
  - *Feeling*: Ultimate tier with warm energy, passionate but not aggressive
  - *Usage*: Prime cards, egg icons, rune badges

## Element Color System

The element colors complement the rarity system and maintain the pastel aesthetic:

- **Ignis**: `#FF6B6B` (Warm Coral Red)
- **Vitae**: `#51CF66` (Fresh Green)
- **Azur**: `#339AF0` (Ocean Blue)
- **Geo**: `#9775FA` (Earth Purple)
- **Tempest**: `#FFD43B` (Electric Yellow)
- **Aeris**: `#74C0FC` (Sky Blue)

## Gradient System

The app uses beautiful linear gradients throughout:

- **Coral**: Warm peachy tones
- **Lavender**: Soft purple to pink
- **Mint**: Fresh green to blue
- **Peach**: Warm orange to pink
- **Sunset**: Orange to pink
- **Aurora**: Multi-color mystical blend

## Design Principles

1. **Harmony**: All colors work together to create a cohesive experience
2. **Accessibility**: Sufficient contrast while maintaining softness
3. **Wellness**: Colors promote calm and reduce stress
4. **Hierarchy**: Clear visual distinction between tiers without harsh contrasts
5. **Consistency**: Same colors used across all screens and components

## Treasure Box Integration

The treasure box uses the same rarity color progression to show fill levels:

- **Empty/Default** (0-24%): `#ADB5BD` (Common - Soft Gray)
- **Low Fill** (25-49%): `#74C0FC` (Rare - Pastel Blue) 
- **Medium Fill** (50-74%): `#B197FC` (Epic - Lavender Purple)
- **High Fill** (75-99%): `#FFCC8A` (Legendary - Warm Peach)
- **Full** (100%): `#FFA8A8` (Mythical - Soft Coral)

This creates intuitive visual progression where players immediately understand the treasure box state through familiar rarity colors.

## Implementation

All rarity colors are consistently applied across:
- Prime collection cards (`PrimesScreen.tsx`)
- Egg selection interface (`HatchingScreen.tsx`) 
- Inventory rune displays (`BagScreen.tsx`)
- Shop item categories (`ShopScreen.tsx`)
- Treasure box fill levels (`TreasureBox.tsx`) - **Updated**: Now uses flat design without glow effects
- Modal and detail views (planned)

The color system ensures that whether players are collecting, battling, or managing their inventory, they experience the same calming, beautiful aesthetic that makes Primeval Tower feel like a peaceful escape. 