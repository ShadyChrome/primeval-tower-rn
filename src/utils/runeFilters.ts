import { PlayerRune } from '../../types/supabase'

// Helper function to check if rune affects a specific stat
export const runeAffectsStat = (rune: PlayerRune, stat: string): boolean => {
  if (!rune.stat_bonuses || typeof rune.stat_bonuses !== 'object') return false
  
  const bonuses = rune.stat_bonuses as Record<string, any>
  
  switch (stat) {
    case 'attack':
      return bonuses.attack > 0 || bonuses.criticalRate > 0 || bonuses.criticalDamage > 0
    case 'defense':
      return bonuses.defense > 0 || bonuses.health > 0 || bonuses.resistance > 0
    case 'speed':
      return bonuses.speed > 0
    case 'courage':
      return bonuses.courage > 0 || bonuses.extraTurn > 0 || bonuses.criticalDamage > 0
    case 'precision':
      return bonuses.precision > 0 || bonuses.accuracy > 0 || bonuses.criticalRate > 0
    case 'stamina':
      return bonuses.stamina > 0 || bonuses.health > 0 || bonuses.endurance > 0
    default:
      return true
  }
}

// Helper function to filter runes by stat and tier
export const filterRunes = (
  runes: PlayerRune[],
  statFilter: string,
  tierFilter: string,
  includeEquipped: boolean = true
): PlayerRune[] => {
  return runes.filter(rune => {
    // Filter by equipped status
    if (!includeEquipped && rune.is_equipped) return false
    
    // Filter by tier
    if (tierFilter !== 'all' && rune.rune_tier !== tierFilter) return false
    
    // Filter by stat
    if (statFilter !== 'all' && !runeAffectsStat(rune, statFilter)) return false
    
    return true
  })
}

// Helper function to sort runes by tier and level
export const sortRunes = (runes: PlayerRune[]): PlayerRune[] => {
  return [...runes].sort((a, b) => {
    // Sort by tier first (higher tier first)
    const tierOrder = { 'mythical': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 }
    const aTier = tierOrder[a.rune_tier as keyof typeof tierOrder] || 0
    const bTier = tierOrder[b.rune_tier as keyof typeof tierOrder] || 0
    if (aTier !== bTier) return bTier - aTier
    
    // Then by level (higher level first)
    return (b.rune_level || 0) - (a.rune_level || 0)
  })
} 