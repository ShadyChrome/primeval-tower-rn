import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Chip } from 'react-native-paper'
import { PlayerRune } from '../../../types/supabase'
import { colors, spacing } from '../../theme/designSystem'

interface RuneCardProps {
  rune: PlayerRune
  onPress?: () => void
  primaryColor?: string
  showEquipStatus?: boolean
  compact?: boolean
}

export default function RuneCard({ 
  rune, 
  onPress, 
  primaryColor = colors.primary,
  showEquipStatus = true,
  compact = false
}: RuneCardProps) {
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

  const getSynergyName = (rune: PlayerRune): string | null => {
    if (rune.stat_bonuses && typeof rune.stat_bonuses === 'object') {
      return (rune.stat_bonuses as any).synergy || null
    }
    return null
  }

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component
      style={[
        styles.container,
        compact && styles.containerCompact,
        rune.is_equipped && showEquipStatus && styles.equippedContainer,
        { borderColor: getRarityColor(rune.rune_tier) }
      ]}
      onPress={onPress}
    >
      {/* Rune Header */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.runeInfo}>
          <Text style={[styles.runeIcon, compact && styles.runeIconCompact]}>
            {getRuneTypeIcon(rune.rune_type)}
          </Text>
          <View style={styles.runeDetails}>
            <Text variant={compact ? "bodyMedium" : "titleSmall"} style={styles.runeName}>
              {rune.rune_type.charAt(0).toUpperCase() + rune.rune_type.slice(1)} Rune
            </Text>
            <Text variant="bodySmall" style={styles.runeMainStat}>
              {getRuneMainStat(rune)}
            </Text>
          </View>
        </View>
        
        <View style={styles.runeBadges}>
          <View style={[
            styles.levelBadge, 
            compact && styles.levelBadgeCompact,
            { backgroundColor: getRarityColor(rune.rune_tier) }
          ]}>
            <Text variant="bodySmall" style={styles.levelText}>
              +{rune.rune_level}
            </Text>
          </View>
          {showEquipStatus && rune.is_equipped && (
            <Chip style={styles.equippedChip} textStyle={styles.equippedText}>
              Equipped
            </Chip>
          )}
        </View>
      </View>

      {/* Synergy and Tier Info */}
      <View style={[styles.bottomSection, compact && styles.bottomSectionCompact]}>
        {getSynergyName(rune) && (
          <Text variant="bodySmall" style={styles.synergyInfo}>
            Synergy: <Text style={[styles.synergyValue, { color: primaryColor }]}>
              {getSynergyName(rune)}
            </Text>
          </Text>
        )}
        
        <Chip 
          style={[
            styles.tierChip, 
            compact && styles.tierChipCompact,
            { backgroundColor: getRarityColor(rune.rune_tier) }
          ]}
          textStyle={[styles.tierText, compact && styles.tierTextCompact]}
        >
          {rune.rune_tier ? rune.rune_tier.charAt(0).toUpperCase() + rune.rune_tier.slice(1) : 'Unknown'}
        </Chip>
      </View>

      {/* Glow Effect for Equipped Runes */}
      {rune.is_equipped && showEquipStatus && (
        <View style={[
          styles.glowEffect,
          { borderColor: getRarityColor(rune.rune_tier) + '60' }
        ]} />
      )}
    </Component>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerCompact: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  equippedContainer: {
    backgroundColor: '#F0F7ED',
    borderColor: '#A0C49D',
    borderWidth: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerCompact: {
    marginBottom: spacing.xs,
  },
  runeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  runeIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  runeIconCompact: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  runeDetails: {
    flex: 1,
  },
  runeName: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  runeMainStat: {
    color: colors.textSecondary,
  },
  runeBadges: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  levelBadge: {
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  levelBadgeCompact: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 28,
  },
  levelText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 12,
  },
  equippedChip: {
    backgroundColor: '#A0C49D',
  },
  equippedText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  bottomSectionCompact: {
    marginTop: 2,
  },
  synergyInfo: {
    color: colors.textSecondary,
    flex: 1,
  },
  synergyValue: {
    fontWeight: '600',
  },
  tierChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
  },
  tierChipCompact: {
    borderRadius: 12,
  },
  tierText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 11,
  },
  tierTextCompact: {
    fontSize: 10,
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    borderWidth: 1,
    opacity: 0.6,
  },
}) 