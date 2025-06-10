import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import { ElementIcon } from '../../../../components/OptimizedImage'
import { ElementType } from '../../../assets/ImageAssets'
import { colors, spacing, shadows } from '../../../theme/designSystem'

interface PrimeAbility {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  power: number
  staminaCost: number
  cooldown: number
  statusEffects: string[]
  elementalDamage: boolean
}

interface AbilityCardProps {
  ability: PrimeAbility
  element: ElementType
  primaryColor: string
  onPress?: () => void
  canUpgrade?: boolean
}

export default function AbilityCard({ 
  ability, 
  element, 
  primaryColor, 
  onPress, 
  canUpgrade = false 
}: AbilityCardProps) {
  const isMaxLevel = ability.level >= ability.maxLevel
  
  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: primaryColor + '30' }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      {/* Header with ability name and level */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text variant="bodyMedium" style={styles.abilityName} numberOfLines={1}>
            {ability.name}
          </Text>
          {ability.elementalDamage && (
            <View style={styles.elementIcon}>
              <ElementIcon element={element} size="small" />
            </View>
          )}
        </View>
        
        <View style={styles.levelContainer}>
          <Text variant="bodySmall" style={[styles.levelText, { color: primaryColor }]}>
            Lv.{ability.level}
          </Text>
          {!isMaxLevel && (
            <Text variant="bodySmall" style={styles.maxLevelText}>
              /{ability.maxLevel}
            </Text>
          )}
          {canUpgrade && !isMaxLevel && (
            <View style={[styles.upgradeIndicator, { backgroundColor: primaryColor }]} />
          )}
        </View>
      </View>

      {/* Ability stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>Power</Text>
          <Text variant="bodyMedium" style={[styles.statValue, { color: colors.accent }]}>
            {ability.power}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>Stamina</Text>
          <Text variant="bodyMedium" style={[styles.statValue, { color: colors.secondary }]}>
            {ability.staminaCost}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text variant="bodySmall" style={styles.statLabel}>Cooldown</Text>
          <Text variant="bodyMedium" style={[styles.statValue, { color: colors.pastelPeach }]}>
            {ability.cooldown}s
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
        {ability.description}
      </Text>

      {/* Status effects (if any) */}
      {ability.statusEffects.length > 0 && (
        <View style={styles.statusEffects}>
          {ability.statusEffects.slice(0, 2).map((effect, index) => (
            <View key={index} style={[styles.statusChip, { backgroundColor: primaryColor + '20' }]}>
              <Text variant="bodySmall" style={[styles.statusText, { color: primaryColor }]}>
                {effect}
              </Text>
            </View>
          ))}
          {ability.statusEffects.length > 2 && (
            <Text variant="bodySmall" style={styles.moreEffects}>
              +{ability.statusEffects.length - 2} more
            </Text>
          )}
        </View>
      )}

      {/* Level progress bar (if not max level) */}
      {!isMaxLevel && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(ability.level / ability.maxLevel) * 100}%`,
                  backgroundColor: primaryColor + '60'
                }
              ]} 
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    ...shadows.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  abilityName: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  elementIcon: {
    marginLeft: spacing.xs,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  levelText: {
    fontWeight: '600',
    fontSize: 12,
  },
  maxLevelText: {
    color: colors.textTertiary,
    fontSize: 12,
  },
  upgradeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: colors.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontWeight: '600',
    fontSize: 13,
  },
  description: {
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  statusEffects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statusChip: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreEffects: {
    color: colors.textTertiary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
}) 