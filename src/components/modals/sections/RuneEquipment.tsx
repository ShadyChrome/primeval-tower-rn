import React, { useState } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Text } from 'react-native-paper'
import RuneSlot from '../../modals/components/RuneSlot'
import RuneSelectionModal from '../../modals/components/RuneSelectionModal'
import { ElementType } from '../../../assets/ImageAssets'
import { colors, spacing } from '../../../theme/designSystem'
import { PlayerRune } from '../../../../types/supabase'

interface Prime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  power: number
  abilities: string[]
}

interface RuneEquipmentProps {
  prime: Prime
  primaryColor: string
  equippedRunes: (PlayerRune | null)[]
  availableRunes: PlayerRune[]
  onRuneEquip: (slotIndex: number, rune: PlayerRune | null) => void
  onRuneUnequip: (slotIndex: number) => void
}

interface RuneSynergy {
  name: string
  requiredSlots: number
  activeSlots: number
  bonusStats: Record<string, number>
  isActive: boolean
}

const { width } = Dimensions.get('window')
const SLOT_SIZE = Math.min((width - 80) / 3, 80) // Responsive slot size

export default function RuneEquipment({ 
  prime, 
  primaryColor, 
  equippedRunes,
  availableRunes,
  onRuneEquip,
  onRuneUnequip 
}: RuneEquipmentProps) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null)
  const [showRuneModal, setShowRuneModal] = useState(false)

  // Calculate active synergies
  const calculateSynergies = (): RuneSynergy[] => {
    const synergyGroups: Record<string, PlayerRune[]> = {}
    
    // Group runes by synergy type
    equippedRunes.forEach((rune) => {
      if (rune && rune.stat_bonuses && typeof rune.stat_bonuses === 'object') {
        const synergy = (rune.stat_bonuses as any).synergy || rune.rune_type
        if (!synergyGroups[synergy]) {
          synergyGroups[synergy] = []
        }
        synergyGroups[synergy].push(rune)
      }
    })

    // Calculate synergy bonuses
    return Object.entries(synergyGroups).map(([synergyName, runes]) => {
      const activeSlots = runes.length
      let requiredSlots = 2 // Default requirement
      let bonusStats: Record<string, number> = {}
      let isActive = false

      // Define synergy requirements and bonuses
      switch (synergyName) {
        case 'attack':
        case 'offense':
          requiredSlots = 2
          bonusStats = { attack: 15 }
          break
        case 'defense':
        case 'guardian':
          requiredSlots = 2
          bonusStats = { defense: 15 }
          break
        case 'speed':
        case 'swift':
          requiredSlots = 2
          bonusStats = { speed: 20 }
          break
        case 'destruction':
          requiredSlots = 4
          bonusStats = { criticalDamage: 40 }
          break
        case 'violent':
          requiredSlots = 4
          bonusStats = { attack: 20, extraTurn: 22 }
          break
        case 'despair':
          requiredSlots = 4
          bonusStats = { stunChance: 25 }
          break
        default:
          requiredSlots = 2
          bonusStats = { [synergyName]: 10 }
      }

      isActive = activeSlots >= requiredSlots

      return {
        name: synergyName,
        requiredSlots,
        activeSlots,
        bonusStats,
        isActive
      }
    })
  }

  const activeSynergies = calculateSynergies()

  const handleSlotPress = (slotIndex: number) => {
    setSelectedSlotIndex(slotIndex)
    setShowRuneModal(true)
  }

  const handleRuneSelect = (rune: PlayerRune | null) => {
    if (selectedSlotIndex !== null) {
      if (rune) {
        onRuneEquip(selectedSlotIndex, rune)
      } else {
        onRuneUnequip(selectedSlotIndex)
      }
    }
    setShowRuneModal(false)
    setSelectedSlotIndex(null)
  }

  const handleRuneRemove = (slotIndex: number) => {
    onRuneUnequip(slotIndex)
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Rune Equipment
      </Text>
      
      {/* Rune Slots Grid - Hexagonal Layout */}
      <View style={styles.runeGrid}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <RuneSlot
            slotIndex={0}
            rune={equippedRunes[0]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(0)}
            onRemove={() => handleRuneRemove(0)}
            primaryColor={primaryColor}
          />
          <RuneSlot
            slotIndex={1}
            rune={equippedRunes[1]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(1)}
            onRemove={() => handleRuneRemove(1)}
            primaryColor={primaryColor}
          />
        </View>

        {/* Middle Row */}
        <View style={styles.middleRow}>
          <RuneSlot
            slotIndex={2}
            rune={equippedRunes[2]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(2)}
            onRemove={() => handleRuneRemove(2)}
            primaryColor={primaryColor}
          />
          <RuneSlot
            slotIndex={3}
            rune={equippedRunes[3]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(3)}
            onRemove={() => handleRuneRemove(3)}
            primaryColor={primaryColor}
          />
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <RuneSlot
            slotIndex={4}
            rune={equippedRunes[4]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(4)}
            onRemove={() => handleRuneRemove(4)}
            primaryColor={primaryColor}
          />
          <RuneSlot
            slotIndex={5}
            rune={equippedRunes[5]}
            size={SLOT_SIZE}
            onPress={() => handleSlotPress(5)}
            onRemove={() => handleRuneRemove(5)}
            primaryColor={primaryColor}
          />
        </View>
      </View>

      {/* Active Synergies Display */}
      {activeSynergies.length > 0 && (
        <View style={styles.synergiesContainer}>
          <Text variant="titleSmall" style={[styles.synergyTitle, { color: primaryColor }]}>
            Active Synergies
          </Text>
          {activeSynergies.map((synergy, index) => (
            <View key={index} style={[
              styles.synergyCard,
              synergy.isActive && { borderColor: primaryColor, backgroundColor: primaryColor + '10' }
            ]}>
              <View style={styles.synergyHeader}>
                <Text variant="bodyMedium" style={[
                  styles.synergyName,
                  synergy.isActive && { color: primaryColor, fontWeight: '600' }
                ]}>
                  {synergy.name.charAt(0).toUpperCase() + synergy.name.slice(1)}
                </Text>
                <Text variant="bodySmall" style={[
                  styles.synergyProgress,
                  synergy.isActive && { color: primaryColor }
                ]}>
                  {synergy.activeSlots}/{synergy.requiredSlots}
                </Text>
              </View>
              
              {synergy.isActive && (
                <View style={styles.synergyBonuses}>
                  {Object.entries(synergy.bonusStats).map(([stat, value]) => (
                    <Text key={stat} variant="bodySmall" style={styles.synergyBonus}>
                      +{value}{stat.includes('Chance') || stat.includes('Damage') ? '%' : ''} {stat}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Rune Selection Modal */}
      <RuneSelectionModal
        visible={showRuneModal}
        onDismiss={() => setShowRuneModal(false)}
        availableRunes={availableRunes}
        currentRune={selectedSlotIndex !== null ? equippedRunes[selectedSlotIndex] : null}
        onRuneSelect={handleRuneSelect}
        primaryColor={primaryColor}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: spacing.lg,
    color: colors.text,
  },
  runeGrid: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl * 2,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  synergiesContainer: {
    marginTop: spacing.md,
  },
  synergyTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  synergyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  synergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  synergyName: {
    fontWeight: '500',
    color: colors.text,
  },
  synergyProgress: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  synergyBonuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  synergyBonus: {
    color: colors.textSecondary,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    overflow: 'hidden',
  },
}) 