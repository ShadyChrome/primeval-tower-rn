import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { PlayerRune } from '../../../../types/supabase'
import { colors } from '../../../theme/designSystem'

interface RuneSlotProps {
  slotIndex: number
  rune: PlayerRune | null
  size: number
  onPress: () => void
  onRemove: () => void
  primaryColor: string
}

export default function RuneSlot({ 
  slotIndex, 
  rune, 
  size, 
  onPress, 
  onRemove, 
  primaryColor 
}: RuneSlotProps) {
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

  const hexagonPath = (size: number) => {
    const radius = size / 2
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30)
      const x = radius + radius * 0.9 * Math.cos(angle)
      const y = radius + radius * 0.9 * Math.sin(angle)
      points.push(`${x},${y}`)
    }
    return `M${points.join('L')}Z`
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { width: size, height: size }]}>
      {/* Hexagonal Background */}
      <View style={[
        styles.hexagonBackground,
        { 
          width: size, 
          height: size,
          borderColor: rune ? getRarityColor(rune.rune_tier) : colors.surfaceVariant,
          backgroundColor: rune ? getRarityColor(rune.rune_tier) + '20' : colors.surface
        }
      ]}>
        {/* Slot Number (when empty) */}
        {!rune && (
          <View style={styles.slotNumberContainer}>
            <Text variant="bodySmall" style={[styles.slotNumber, { color: primaryColor + '80' }]}>
              {slotIndex + 1}
            </Text>
          </View>
        )}

        {/* Rune Content */}
        {rune && (
          <>
            {/* Rune Type Icon */}
            <View style={styles.runeIconContainer}>
              <Text style={[styles.runeIcon, { fontSize: size * 0.3 }]}>
                {getRuneTypeIcon(rune.rune_type)}
              </Text>
            </View>

            {/* Rune Level */}
            <View style={[styles.runeLevelBadge, { backgroundColor: getRarityColor(rune.rune_tier) }]}>
              <Text variant="bodySmall" style={styles.runeLevelText}>
                +{rune.rune_level}
              </Text>
            </View>

            {/* Remove Button */}
            <IconButton
              icon="close"
              size={16}
              iconColor={colors.surface}
              style={[styles.removeButton, { backgroundColor: '#F44336CC' }]}
              onPress={(e) => {
                e.stopPropagation()
                onRemove()
              }}
            />

            {/* Synergy Indicator */}
            {rune.stat_bonuses && typeof rune.stat_bonuses === 'object' && (rune.stat_bonuses as any).synergy && (
              <View style={[styles.synergyIndicator, { backgroundColor: primaryColor }]}>
                <Text variant="bodySmall" style={styles.synergyText}>
                  {((rune.stat_bonuses as any).synergy as string).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Empty Slot Plus Icon */}
        {!rune && (
          <View style={styles.plusIconContainer}>
            <Text style={[styles.plusIcon, { color: primaryColor + '60' }]}>+</Text>
          </View>
        )}
      </View>

      {/* Enhanced Glow Effect for Equipped Runes */}
      {rune && (
        <View style={[
          styles.glowEffect,
          { 
            width: size + 8, 
            height: size + 8,
            borderColor: getRarityColor(rune.rune_tier) + '60'
          }
        ]} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexagonBackground: {
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slotNumberContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  slotNumber: {
    fontWeight: '600',
    fontSize: 12,
  },
  runeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  runeIcon: {
    textAlign: 'center',
  },
  runeLevelBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  runeLevelText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    margin: 0,
  },
  synergyIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  synergyText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  plusIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    opacity: 0.8,
    zIndex: -1,
  },
}) 