import { PlayerRune } from '../../types/supabase'

// Mock rune data for testing and development
export const mockRunes: PlayerRune[] = [
  // Offensive Runes
  {
    id: 'rune_001',
    player_id: 'player_1',
    rune_type: 'attack',
    rune_level: 15,
    rune_tier: 'legendary',
    stat_bonuses: { 
      attack: 25, 
      criticalRate: 8,
      synergy: 'offense' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-15T10:30:00Z',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'rune_002',
    player_id: 'player_1',
    rune_type: 'attack',
    rune_level: 12,
    rune_tier: 'epic',
    stat_bonuses: { 
      attack: 18, 
      speed: 5,
      synergy: 'offense' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-14T14:20:00Z',
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: 'rune_003',
    player_id: 'player_1',
    rune_type: 'fatal',
    rune_level: 8,
    rune_tier: 'rare',
    stat_bonuses: { 
      attack: 15, 
      criticalDamage: 12,
      synergy: 'fatal' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-13T09:15:00Z',
    created_at: '2024-01-13T09:15:00Z'
  },
  
  // Defensive Runes
  {
    id: 'rune_004',
    player_id: 'player_1',
    rune_type: 'defense',
    rune_level: 14,
    rune_tier: 'epic',
    stat_bonuses: { 
      defense: 22, 
      health: 18,
      synergy: 'guardian' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-12T16:45:00Z',
    created_at: '2024-01-12T16:45:00Z'
  },
  {
    id: 'rune_005',
    player_id: 'player_1',
    rune_type: 'guard',
    rune_level: 10,
    rune_tier: 'rare',
    stat_bonuses: { 
      defense: 16, 
      resistance: 10,
      synergy: 'guardian' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-11T11:30:00Z',
    created_at: '2024-01-11T11:30:00Z'
  },
  {
    id: 'rune_006',
    player_id: 'player_1',
    rune_type: 'endure',
    rune_level: 6,
    rune_tier: 'common',
    stat_bonuses: { 
      health: 12, 
      resistance: 8,
      synergy: 'endurance' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-10T08:20:00Z',
    created_at: '2024-01-10T08:20:00Z'
  },

  // Speed Runes
  {
    id: 'rune_007',
    player_id: 'player_1',
    rune_type: 'speed',
    rune_level: 13,
    rune_tier: 'legendary',
    stat_bonuses: { 
      speed: 28, 
      accuracy: 12,
      synergy: 'swift' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-09T13:10:00Z',
    created_at: '2024-01-09T13:10:00Z'
  },
  {
    id: 'rune_008',
    player_id: 'player_1',
    rune_type: 'swift',
    rune_level: 11,
    rune_tier: 'epic',
    stat_bonuses: { 
      speed: 20, 
      attack: 8,
      synergy: 'swift' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-08T17:25:00Z',
    created_at: '2024-01-08T17:25:00Z'
  },

  // Critical Runes
  {
    id: 'rune_009',
    player_id: 'player_1',
    rune_type: 'critical',
    rune_level: 9,
    rune_tier: 'epic',
    stat_bonuses: { 
      criticalRate: 18, 
      precision: 10,
      synergy: 'blade' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-07T12:40:00Z',
    created_at: '2024-01-07T12:40:00Z'
  },
  {
    id: 'rune_010',
    player_id: 'player_1',
    rune_type: 'blade',
    rune_level: 7,
    rune_tier: 'rare',
    stat_bonuses: { 
      criticalRate: 12, 
      criticalDamage: 15,
      synergy: 'blade' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-06T15:55:00Z',
    created_at: '2024-01-06T15:55:00Z'
  },

  // Special Runes
  {
    id: 'rune_011',
    player_id: 'player_1',
    rune_type: 'violent',
    rune_level: 16,
    rune_tier: 'mythical',
    stat_bonuses: { 
      attack: 22, 
      extraTurn: 25,
      synergy: 'violent' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-05T09:30:00Z',
    created_at: '2024-01-05T09:30:00Z'
  },
  {
    id: 'rune_012',
    player_id: 'player_1',
    rune_type: 'violent',
    rune_level: 14,
    rune_tier: 'legendary',
    stat_bonuses: { 
      health: 20, 
      extraTurn: 22,
      synergy: 'violent' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-04T14:15:00Z',
    created_at: '2024-01-04T14:15:00Z'
  },
  {
    id: 'rune_013',
    player_id: 'player_1',
    rune_type: 'despair',
    rune_level: 12,
    rune_tier: 'epic',
    stat_bonuses: { 
      statusChance: 20, 
      precision: 15,
      synergy: 'despair' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-03T10:45:00Z',
    created_at: '2024-01-03T10:45:00Z'
  },
  {
    id: 'rune_014',
    player_id: 'player_1',
    rune_type: 'despair',
    rune_level: 10,
    rune_tier: 'rare',
    stat_bonuses: { 
      statusChance: 15, 
      accuracy: 12,
      synergy: 'despair' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-02T16:20:00Z',
    created_at: '2024-01-02T16:20:00Z'
  },

  // Utility Runes
  {
    id: 'rune_015',
    player_id: 'player_1',
    rune_type: 'focus',
    rune_level: 8,
    rune_tier: 'rare',
    stat_bonuses: { 
      accuracy: 18, 
      precision: 10,
      synergy: 'focus' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2024-01-01T12:00:00Z',
    created_at: '2024-01-01T12:00:00Z'
  },
  {
    id: 'rune_016',
    player_id: 'player_1',
    rune_type: 'energy',
    rune_level: 5,
    rune_tier: 'common',
    stat_bonuses: { 
      stamina: 15, 
      health: 10,
      synergy: 'energy' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2023-12-31T18:30:00Z',
    created_at: '2023-12-31T18:30:00Z'
  },
  {
    id: 'rune_017',
    player_id: 'player_1',
    rune_type: 'rage',
    rune_level: 11,
    rune_tier: 'epic',
    stat_bonuses: { 
      criticalDamage: 25, 
      courage: 12,
      synergy: 'rage' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2023-12-30T14:45:00Z',
    created_at: '2023-12-30T14:45:00Z'
  },
  {
    id: 'rune_018',
    player_id: 'player_1',
    rune_type: 'destruction',
    rune_level: 13,
    rune_tier: 'legendary',
    stat_bonuses: { 
      criticalDamage: 30, 
      attack: 12,
      synergy: 'destruction' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2023-12-29T11:15:00Z',
    created_at: '2023-12-29T11:15:00Z'
  },

  // More Common Runes for variety
  {
    id: 'rune_019',
    player_id: 'player_1',
    rune_type: 'health',
    rune_level: 4,
    rune_tier: 'common',
    stat_bonuses: { 
      health: 18, 
      defense: 5,
      synergy: 'vitality' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2023-12-28T08:30:00Z',
    created_at: '2023-12-28T08:30:00Z'
  },
  {
    id: 'rune_020',
    player_id: 'player_1',
    rune_type: 'accuracy',
    rune_level: 6,
    rune_tier: 'rare',
    stat_bonuses: { 
      accuracy: 16, 
      speed: 8,
      synergy: 'precision' 
    },
    is_equipped: false,
    equipped_slot: null,
    acquired_at: '2023-12-27T15:20:00Z',
    created_at: '2023-12-27T15:20:00Z'
  }
]

// Helper function to get runes by filter
export const getRunesByFilter = (
  runes: PlayerRune[], 
  typeFilter?: string, 
  tierFilter?: string,
  equippedFilter?: boolean
) => {
  return runes.filter(rune => {
    if (typeFilter && typeFilter !== 'all' && rune.rune_type !== typeFilter) return false
    if (tierFilter && tierFilter !== 'all' && rune.rune_tier !== tierFilter) return false
    if (equippedFilter !== undefined && rune.is_equipped !== equippedFilter) return false
    return true
  })
}

// Helper function to get available (unequipped) runes
export const getAvailableRunes = (runes: PlayerRune[]) => {
  return runes.filter(rune => !rune.is_equipped)
}

// Helper function to get equipped runes
export const getEquippedRunes = (runes: PlayerRune[]) => {
  return runes.filter(rune => rune.is_equipped)
}

// Helper function to get rune count by tier
export const getRuneCountByTier = (runes: PlayerRune[]) => {
  const counts = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythical: 0
  }
  
  runes.forEach(rune => {
    if (rune.rune_tier && rune.rune_tier in counts) {
      counts[rune.rune_tier as keyof typeof counts]++
    }
  })
  
  return counts
} 