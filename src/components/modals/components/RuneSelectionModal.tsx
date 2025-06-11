import React, { useState, useMemo } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import { Text, Modal, Portal, IconButton, SegmentedButtons, Chip } from 'react-native-paper'
import { PlayerRune } from '../../../../types/supabase'
import { colors, spacing } from '../../../theme/designSystem'

interface RuneSelectionModalProps {
  visible: boolean
  onDismiss: () => void
  availableRunes: PlayerRune[]
  currentRune: PlayerRune | null
  onRuneSelect: (rune: PlayerRune | null) => void
  primaryColor: string
}

const { height } = Dimensions.get('window')

export default function RuneSelectionModal({
  visible,
  onDismiss,
  availableRunes,
  currentRune,
  onRuneSelect,
  primaryColor
}: RuneSelectionModalProps) {
  const [filterStat, setFilterStat] = useState('all')
  const [filterTier, setFilterTier] = useState('all')

  const getRarityColor = (tier: string | null) => {
    const rarityColors = {
      'common': '#ADB5BD',
      'rare': '#74C0FC',
      'epic': '#B197FC',
      'legendary': '#FFCC8A',
      'mythical': '#FFA8A8'
    }
    return rarityColors[tier as keyof typeof rarityColors] || '#ADB5BD'
  }

  const getRuneTypeIcon = (runeType: string) => {
    const iconMap: Record<string, string> = {
      'attack': '⚔️',
      'defense': '🛡️',
      'speed': '⚡',
      'health': '❤️',
      'critical': '💢',
      'accuracy': '🎯',
      'resistance': '✨',
      'destruction': '💥',
      'violent': '🔥',
      'despair': '😵',
      'focus': '👁️',
      'energy': '🔋',
      'endure': '🏔️',
      'fatal': '💀',
      'blade': '🗡️',
      'rage': '😡',
      'swift': '💨',
      'guard': '🔰'
    }
    return iconMap[runeType] || '💎'
  }

  // Helper function to check if rune affects a specific stat
  const runeAffectsStat = (rune: PlayerRune, stat: string): boolean => {
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

  // Filter available runes (exclude equipped ones)
  const unequippedRunes = useMemo(() => {
    return availableRunes.filter(rune => !rune.is_equipped)
  }, [availableRunes])

  // Apply filters
  const filteredRunes = useMemo(() => {
    let filtered = unequippedRunes

    if (filterStat !== 'all') {
      filtered = filtered.filter(rune => runeAffectsStat(rune, filterStat))
    }

    if (filterTier !== 'all') {
      filtered = filtered.filter(rune => rune.rune_tier === filterTier)
    }

    return filtered.sort((a, b) => {
      // Sort by tier first (higher tier first)
      const tierOrder = { 'mythical': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 }
      const aTier = tierOrder[a.rune_tier as keyof typeof tierOrder] || 0
      const bTier = tierOrder[b.rune_tier as keyof typeof tierOrder] || 0
      if (aTier !== bTier) return bTier - aTier
      
      // Then by level (higher level first)
      return (b.rune_level || 0) - (a.rune_level || 0)
    })
  }, [unequippedRunes, filterStat, filterTier])

  const getRuneMainStat = (rune: PlayerRune): string => {
    if (!rune.stat_bonuses || typeof rune.stat_bonuses !== 'object') return 'Unknown'
    
    const bonuses = rune.stat_bonuses as Record<string, any>
    const mainStats = ['attack', 'defense', 'speed', 'health', 'criticalRate', 'criticalDamage', 'accuracy', 'resistance']
    
    for (const stat of mainStats) {
      if (bonuses[stat]) {
        const value = bonuses[stat]
        const suffix = stat.includes('Rate') || stat.includes('Damage') || stat.includes('accuracy') || stat.includes('resistance') ? '%' : ''
        return `${stat.charAt(0).toUpperCase() + stat.slice(1)}: +${value}${suffix}`
      }
    }
    
    return 'Utility Rune'
  }

  const renderRuneCard = ({ item: rune }: { item: PlayerRune }) => (
    <TouchableOpacity
      style={[
        styles.runeCard,
        { borderColor: getRarityColor(rune.rune_tier) }
      ]}
      onPress={() => onRuneSelect(rune)}
    >
      {/* Rune Header */}
      <View style={styles.runeHeader}>
        <View style={styles.runeInfo}>
          <Text style={[styles.runeIcon, { fontSize: 24 }]}>
            {getRuneTypeIcon(rune.rune_type)}
          </Text>
          <View style={styles.runeDetails}>
            <Text variant="titleSmall" style={styles.runeName}>
              {rune.rune_type.charAt(0).toUpperCase() + rune.rune_type.slice(1)} Rune
            </Text>
            <Text variant="bodySmall" style={styles.runeMainStat}>
              {getRuneMainStat(rune)}
            </Text>
          </View>
        </View>
        
        <View style={styles.runeBadges}>
          <View style={[styles.levelBadge, { backgroundColor: getRarityColor(rune.rune_tier) }]}>
            <Text variant="bodySmall" style={styles.levelText}>
              +{rune.rune_level}
            </Text>
          </View>
          <Chip 
            style={[styles.tierChip, { backgroundColor: getRarityColor(rune.rune_tier) }]}
            textStyle={styles.tierText}
          >
{rune.rune_tier ? rune.rune_tier.charAt(0).toUpperCase() + rune.rune_tier.slice(1) : 'Unknown'}
          </Chip>
        </View>
      </View>

      {/* Synergy Info */}
      {rune.stat_bonuses && typeof rune.stat_bonuses === 'object' && (rune.stat_bonuses as any).synergy && (
        <View style={styles.synergyContainer}>
          <Text variant="bodySmall" style={styles.synergyLabel}>
            Synergy: <Text style={[styles.synergyValue, { color: primaryColor }]}>
              {(rune.stat_bonuses as any).synergy}
            </Text>
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )

  const statFilters = ['all', 'attack', 'defense', 'speed', 'courage', 'precision', 'stamina']
  const runeTiers = ['all', 'common', 'rare', 'epic', 'legendary', 'mythical']

  // Debug logging
  console.log('RuneSelectionModal - Available runes:', availableRunes.length)
  console.log('RuneSelectionModal - Unequipped runes:', unequippedRunes.length)
  console.log('RuneSelectionModal - Filtered runes:', filteredRunes.length)
  console.log('RuneSelectionModal - Filter stat:', filterStat, 'Filter tier:', filterTier)

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={styles.title}>
              Select Rune
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          {/* Current Rune (if any) */}
          {currentRune && (
            <View style={styles.currentRuneSection}>
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Currently Equipped:
              </Text>
              <View style={[styles.currentRuneCard, { borderColor: getRarityColor(currentRune.rune_tier) }]}>
                <Text style={styles.runeIcon}>{getRuneTypeIcon(currentRune.rune_type)}</Text>
                <View style={styles.currentRuneInfo}>
                  <Text variant="bodyMedium" style={styles.currentRuneName}>
                    {currentRune.rune_type.charAt(0).toUpperCase() + currentRune.rune_type.slice(1)} +{currentRune.rune_level}
                  </Text>
                  <Text variant="bodySmall" style={styles.currentRuneStats}>
                    {getRuneMainStat(currentRune)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.removeCurrentButton, { backgroundColor: primaryColor }]}
                  onPress={() => onRuneSelect(null)}
                >
                  <Text variant="bodySmall" style={styles.removeCurrentText}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Filters */}
          <View style={styles.filtersSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Filter by Stat:
            </Text>
            <View style={styles.filterChips}>
              {statFilters.map(stat => (
                <Chip
                  key={stat}
                  selected={filterStat === stat}
                  onPress={() => setFilterStat(stat)}
                  style={[
                    styles.filterChip,
                    filterStat === stat && { backgroundColor: primaryColor + '20' }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    filterStat === stat && { color: primaryColor }
                  ]}
                >
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </Chip>
              ))}
            </View>

            <Text variant="titleSmall" style={[styles.sectionTitle, { marginTop: spacing.md }]}>
              Filter by Tier:
            </Text>
            <View style={styles.filterChips}>
              {runeTiers.map(tier => (
                <Chip
                  key={tier}
                  selected={filterTier === tier}
                  onPress={() => setFilterTier(tier)}
                  style={[
                    styles.filterChip,
                    filterTier === tier && { backgroundColor: primaryColor + '20' }
                  ]}
                  textStyle={[
                    styles.filterChipText,
                    filterTier === tier && { color: primaryColor }
                  ]}
                >
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Chip>
              ))}
            </View>
          </View>

          {/* Runes List */}
          <View style={styles.runesSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Available Runes ({filteredRunes.length}):
            </Text>
            
            {filteredRunes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No runes available with current filters
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredRunes}
                renderItem={renderRuneCard}
                keyExtractor={(item) => item.id}
                style={styles.runesList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    </Portal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  title: {
    fontWeight: '600',
    color: colors.text,
  },
  currentRuneSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  currentRuneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
  },
  currentRuneInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  currentRuneName: {
    fontWeight: '600',
    color: colors.text,
  },
  currentRuneStats: {
    color: colors.textSecondary,
  },
  removeCurrentButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  removeCurrentText: {
    color: colors.surface,
    fontWeight: '600',
  },
  filtersSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.surfaceVariant,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  runesSection: {
    flex: 1,
    padding: spacing.lg,
  },
  runesList: {
    flex: 1,
  },
  runeCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  runeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  runeIcon: {
    marginRight: spacing.md,
  },
  runeDetails: {
    flex: 1,
  },
  runeName: {
    fontWeight: '600',
    color: colors.text,
  },
  runeMainStat: {
    color: colors.textSecondary,
  },
  runeBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  levelText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 12,
  },
  tierChip: {
    borderRadius: 12,
  },
  tierText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  synergyContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  synergyLabel: {
    color: colors.textSecondary,
  },
  synergyValue: {
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
}) 