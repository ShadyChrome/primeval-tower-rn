import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Chip } from 'react-native-paper'
import { colors, spacing } from '../../theme/designSystem'

interface RuneFilterProps {
  statFilter: string
  tierFilter: string
  onStatFilterChange: (stat: string) => void
  onTierFilterChange: (tier: string) => void
  filteredCount: number
  totalCount: number
  primaryColor?: string
}

export default function RuneFilter({
  statFilter,
  tierFilter,
  onStatFilterChange,
  onTierFilterChange,
  filteredCount,
  totalCount,
  primaryColor = colors.primary
}: RuneFilterProps) {
  const statFilters = ['all', 'attack', 'defense', 'speed', 'courage', 'precision', 'stamina']
  const tierFilters = ['all', 'common', 'rare', 'epic', 'legendary', 'mythical']

  return (
    <View style={styles.container}>
      {/* Count Display */}
      <Text variant="titleSmall" style={styles.countText}>
        Showing {filteredCount} of {totalCount} runes
      </Text>

      {/* Stat Filter */}
      <View style={styles.filterRow}>
        <Text variant="bodyMedium" style={styles.filterLabel}>Stat:</Text>
        <View style={styles.filterChips}>
          {statFilters.map(stat => (
            <Chip
              key={stat}
              selected={statFilter === stat}
              onPress={() => onStatFilterChange(stat)}
              style={[
                styles.filterChip,
                statFilter === stat && { backgroundColor: primaryColor + '20' }
              ]}
              textStyle={[
                styles.filterChipText,
                statFilter === stat && { color: primaryColor }
              ]}
            >
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </Chip>
          ))}
        </View>
      </View>

      {/* Tier Filter */}
      <View style={styles.filterRow}>
        <Text variant="bodyMedium" style={styles.filterLabel}>Tier:</Text>
        <View style={styles.filterChips}>
          {tierFilters.map(tier => (
            <Chip
              key={tier}
              selected={tierFilter === tier}
              onPress={() => onTierFilterChange(tier)}
              style={[
                styles.filterChip,
                tierFilter === tier && { backgroundColor: primaryColor + '20' }
              ]}
              textStyle={[
                styles.filterChipText,
                tierFilter === tier && { color: primaryColor }
              ]}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  countText: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    backgroundColor: colors.surfaceVariant,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
}) 