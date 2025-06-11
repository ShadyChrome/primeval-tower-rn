import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Button, ProgressBar, Card, Chip } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import XPUpgradeModal from '../components/XPUpgradeModal'
import AbilityUpgradeModal from '../components/AbilityUpgradeModal'
import { usePrimeUpgrade, UpgradeResult, AbilityUpgradeResult } from '../../../hooks/usePrimeUpgrade'
import { UIPrime } from '../../../services/primeService'
import { ElementType } from '../../../assets/ImageAssets'
import { colors, spacing } from '../../../theme/designSystem'

interface Prime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  power: number
  abilities: string[]
}

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

interface UpgradeSectionProps {
  prime: UIPrime
  abilities: PrimeAbility[]
  primaryColor: string
  onPrimeUpdated: (updatedPrime: Partial<UIPrime>) => void
}

export default function UpgradeSection({ 
  prime, 
  abilities, 
  primaryColor,
  onPrimeUpdated 
}: UpgradeSectionProps) {
  const [xpModalVisible, setXpModalVisible] = useState(false)
  const [abilityModalVisible, setAbilityModalVisible] = useState(false)
  const [selectedAbility, setSelectedAbility] = useState<{ ability: PrimeAbility; index: number } | null>(null)

  const { calculateXPForLevel } = usePrimeUpgrade()

  // Calculate XP progress for current level
  const currentLevelXP = calculateXPForLevel(prime.level)
  const currentProgress = prime.experience || 0 // Current XP in level
  const progressPercentage = Math.min((currentProgress / currentLevelXP) * 100, 100)

  const handleXPUpgradeSuccess = (result: UpgradeResult) => {
    if (result.success && result.newLevel && result.newPower !== undefined) {
      onPrimeUpdated({
        level: result.newLevel,
        power: result.newPower,
        experience: result.newExperience || 0
      })
    }
  }

  const handleAbilityUpgradeSuccess = (result: AbilityUpgradeResult) => {
    if (result.success) {
      // In a full implementation, you'd update the abilities in the database
      // For now, we'll just close the modal
      console.log('Ability upgraded successfully:', result)
    }
  }

  const handleAbilityPress = (ability: PrimeAbility, index: number) => {
    setSelectedAbility({ ability, index })
    setAbilityModalVisible(true)
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Common': '#ADB5BD',
      'Rare': '#74C0FC',
      'Epic': '#B197FC',
      'Legendary': '#FFCC8A',
      'Mythical': '#FFA8A8'
    }
    return colors[rarity as keyof typeof colors] || '#ADB5BD'
  }

  const canLevelUp = prime.level < 100
  const upgradeableAbilities = abilities.filter(ability => ability.level < ability.maxLevel)

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Prime Upgrades
      </Text>

      {/* Prime Level Section */}
      <Card style={styles.upgradeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.levelInfo}>
            <Text variant="titleSmall" style={styles.cardTitle}>
              Prime Level
            </Text>
            <View style={styles.levelBadge}>
              <Text variant="titleMedium" style={[styles.levelText, { color: primaryColor }]}>
                {prime.level}
              </Text>
            </View>
          </View>
          
          <View style={styles.powerInfo}>
            <Text variant="bodySmall" style={styles.powerLabel}>Power</Text>
            <Text variant="titleSmall" style={[styles.powerValue, { color: primaryColor }]}>
              {prime.power}
            </Text>
          </View>
        </View>

        {/* XP Progress Bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text variant="bodySmall" style={styles.xpLabel}>
              Level Progress
            </Text>
            <Text variant="bodySmall" style={styles.xpText}>
              {currentProgress} / {currentLevelXP} XP
            </Text>
          </View>
          <ProgressBar
            progress={progressPercentage / 100}
            color={primaryColor}
            style={styles.xpBar}
          />
        </View>

        <Button
          mode="contained"
          onPress={() => setXpModalVisible(true)}
          style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
          contentStyle={styles.buttonContent}
          disabled={!canLevelUp}
          icon={canLevelUp ? "trending-up" : "star"}
        >
          {canLevelUp ? 'Level Up Prime' : 'Max Level Reached'}
        </Button>
      </Card>

      {/* Abilities Section */}
      <Card style={styles.upgradeCard}>
        <View style={styles.cardHeader}>
          <Text variant="titleSmall" style={styles.cardTitle}>
            Ability Upgrades
          </Text>
          {upgradeableAbilities.length > 0 && (
            <Chip
              style={[styles.upgradeableChip, { backgroundColor: primaryColor + '20' }]}
              textStyle={[styles.upgradeableText, { color: primaryColor }]}
            >
              {upgradeableAbilities.length} upgradeable
            </Chip>
          )}
        </View>

        <Text variant="bodySmall" style={styles.abilitiesDescription}>
          Tap abilities to view upgrade options and costs
        </Text>

        <View style={styles.abilitiesGrid}>
          {abilities.map((ability, index) => {
            const canUpgrade = ability.level < ability.maxLevel
            
            return (
              <TouchableOpacity
                key={ability.id}
                style={[
                  styles.abilityCard,
                  canUpgrade && { borderColor: primaryColor + '40' },
                  !canUpgrade && styles.maxLevelAbility
                ]}
                onPress={() => handleAbilityPress(ability, index)}
                activeOpacity={0.7}
              >
                <View style={styles.abilityHeader}>
                  <Text variant="bodyMedium" style={styles.abilityName} numberOfLines={1}>
                    {ability.name}
                  </Text>
                  {canUpgrade && (
                    <MaterialCommunityIcons
                      name="arrow-up-circle"
                      size={16}
                      color={primaryColor}
                    />
                  )}
                  {!canUpgrade && (
                    <MaterialCommunityIcons
                      name="star"
                      size={16}
                      color={colors.textSecondary}
                    />
                  )}
                </View>

                <View style={styles.abilityLevel}>
                  <Text variant="bodySmall" style={styles.levelLabel}>
                    Level {ability.level}/{ability.maxLevel}
                  </Text>
                  <ProgressBar
                    progress={ability.level / ability.maxLevel}
                    color={canUpgrade ? primaryColor : colors.textSecondary}
                    style={styles.abilityProgress}
                  />
                </View>

                <Text variant="bodySmall" style={styles.abilityPower}>
                  Power: {ability.power}
                </Text>
              </TouchableOpacity>
            )
          })}

          {/* Show empty slots for primes with fewer than 4 abilities */}
          {abilities.length < 4 && (
            Array.from({ length: 4 - abilities.length }).map((_, index) => (
              <View key={`empty_${index}`} style={[styles.abilityCard, styles.emptyAbility]}>
                <Text variant="bodySmall" style={styles.emptyAbilityText}>
                  Slot {abilities.length + index + 1}
                </Text>
                <Text variant="bodySmall" style={styles.unlockLevel}>
                  Unlocks at level {(abilities.length + index + 1) * 10}
                </Text>
              </View>
            ))
          )}
        </View>
      </Card>

      {/* Quick Stats Preview */}
      <Card style={styles.statsPreview}>
        <Text variant="titleSmall" style={styles.cardTitle}>
          Upgrade Benefits
        </Text>
        
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="trending-up" size={20} color={primaryColor} />
            <Text variant="bodySmall" style={styles.benefitText}>
              Higher level = increased power and stats
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="sword" size={20} color={primaryColor} />
            <Text variant="bodySmall" style={styles.benefitText}>
              Ability upgrades boost damage and effects
            </Text>
          </View>
          
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons name="shield" size={20} color={primaryColor} />
            <Text variant="bodySmall" style={styles.benefitText}>
              Enhanced combat effectiveness
            </Text>
          </View>
        </View>
      </Card>

      {/* XP Upgrade Modal */}
      <XPUpgradeModal
        visible={xpModalVisible}
        onDismiss={() => setXpModalVisible(false)}
        prime={prime}
        primaryColor={primaryColor}
        onUpgradeSuccess={handleXPUpgradeSuccess}
      />

      {/* Ability Upgrade Modal */}
      {selectedAbility && (
        <AbilityUpgradeModal
          visible={abilityModalVisible}
          onDismiss={() => {
            setAbilityModalVisible(false)
            setSelectedAbility(null)
          }}
          prime={prime}
          ability={selectedAbility.ability}
          abilityIndex={selectedAbility.index}
          primaryColor={primaryColor}
          onUpgradeSuccess={handleAbilityUpgradeSuccess}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  upgradeCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  levelText: {
    fontWeight: '700',
  },
  powerInfo: {
    alignItems: 'flex-end',
  },
  powerLabel: {
    color: colors.textSecondary,
  },
  powerValue: {
    fontWeight: '600',
  },
  xpSection: {
    marginBottom: spacing.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  xpLabel: {
    color: colors.textSecondary,
  },
  xpText: {
    color: colors.text,
    fontWeight: '500',
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceVariant,
  },
  upgradeButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  upgradeableChip: {
    height: 28,
  },
  upgradeableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  abilitiesDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  abilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  abilityCard: {
    width: '48%',
    backgroundColor: colors.surfaceVariant + '40',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  maxLevelAbility: {
    opacity: 0.7,
  },
  emptyAbility: {
    backgroundColor: colors.surfaceVariant + '20',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  abilityName: {
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  abilityLevel: {
    marginBottom: spacing.sm,
  },
  levelLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  abilityProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceVariant,
  },
  abilityPower: {
    color: colors.text,
    fontWeight: '500',
  },
  emptyAbilityText: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  unlockLevel: {
    color: colors.textTertiary,
    fontSize: 10,
  },
  statsPreview: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceVariant + '20',
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    color: colors.textSecondary,
    flex: 1,
  },
}) 