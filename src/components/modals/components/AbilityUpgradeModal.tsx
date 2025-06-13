import React, { useState, useMemo, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Text, Modal, Portal, IconButton, Button, Chip } from 'react-native-paper'
import { usePrimeUpgrade, AbilityUpgradeResult, AbilityUpgradeCost } from '../../../hooks/usePrimeUpgrade'
import { UIPrime } from '../../../services/primeService'
import { ElementIcon } from '../../../../components/OptimizedImage'
import { colors, spacing } from '../../../theme/designSystem'
import { PlayerManager } from '../../../../lib/playerManager'

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

interface AbilityUpgradeModalProps {
  visible: boolean
  onDismiss: () => void
  prime: UIPrime
  ability: PrimeAbility
  abilityIndex: number
  primaryColor: string
  onUpgradeSuccess: (result: AbilityUpgradeResult) => void
}

const { height } = Dimensions.get('window')

export default function AbilityUpgradeModal({
  visible,
  onDismiss,
  prime,
  ability,
  abilityIndex,
  primaryColor,
  onUpgradeSuccess
}: AbilityUpgradeModalProps) {
  const {
    loading,
    calculateAbilityUpgradeCost,
    upgradeAbility
  } = usePrimeUpgrade()

  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeCost, setUpgradeCost] = useState<AbilityUpgradeCost | null>(null)
  const [loadingCost, setLoadingCost] = useState(false)
  const [playerResources, setPlayerResources] = useState<{gems: number, scrolls: number} | null>(null)

  // Load upgrade cost and player resources when modal opens or ability changes
  useEffect(() => {
    if (visible && ability.level < ability.maxLevel) {
      loadUpgradeCost()
      loadPlayerResources()
    }
  }, [visible, ability.level, abilityIndex, prime.rarity])

  const loadUpgradeCost = async () => {
    try {
      setLoadingCost(true)
      const cost = await calculateAbilityUpgradeCost(ability.level, abilityIndex, prime.rarity)
      setUpgradeCost(cost)
      console.log('💰 Loaded upgrade cost:', cost)
    } catch (error) {
      console.error('Error loading upgrade cost:', error)
      setUpgradeCost(null)
    } finally {
      setLoadingCost(false)
    }
  }

  const loadPlayerResources = async () => {
    try {
      const playerId = await PlayerManager.getCachedPlayerId()
      if (!playerId) return

      const playerData = await PlayerManager.loadPlayerData(playerId)
      if (!playerData) return

      // Get ability scroll count
      const scrollItem = playerData.inventory.find(
        item => item.item_type === 'ability_scroll' && item.item_id === 'ability_scroll'
      )

      setPlayerResources({
        gems: playerData.player.gems || 0,
        scrolls: scrollItem?.quantity || 0
      })
    } catch (error) {
      console.error('Error loading player resources:', error)
      setPlayerResources(null)
    }
  }

  // Calculate next level stats preview
  const nextLevelPreview = useMemo(() => {
    if (ability.level >= ability.maxLevel) return null
    
    const newLevel = ability.level + 1
    const powerIncrease = Math.floor(ability.power * 0.15) // 15% power increase per level
    const newPower = ability.power + powerIncrease
    
    return {
      level: newLevel,
      power: newPower,
      powerIncrease
    }
  }, [ability])

  const isMaxLevel = ability.level >= ability.maxLevel

  const handleUpgrade = async () => {
    if (isMaxLevel || !upgradeCost) return

    setIsUpgrading(true)
    try {
      const result = await upgradeAbility(prime, abilityIndex, ability.level)
      
      if (result.success) {
        onUpgradeSuccess(result)
        onDismiss()
      } else {
        // Handle error - could show toast/alert
        console.error('Ability upgrade failed:', result.message)
      }
    } catch (err) {
      console.error('Ability upgrade error:', err)
    } finally {
      setIsUpgrading(false)
    }
  }

  const getStatusEffectColor = (effect: string) => {
    const effectColors: Record<string, string> = {
      'Burn': '#FF6B6B',
      'Poison': '#51CF66',
      'Sleep': '#339AF0',
      'Slow': '#868E96',
      'Fear': '#7C2D12',
      'Knockdown': '#F59E0B',
      'Blind': '#6B7280',
      'Intimidate': '#7C3AED',
      'Speed Boost': '#10B981',
      'Evasion Up': '#3B82F6',
      'Team Boost': '#EC4899',
      'Bleed': '#DC2626'
    }
    return effectColors[effect] || primaryColor
  }

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
            <View style={styles.headerInfo}>
              <Text variant="headlineSmall" style={styles.title}>
                {ability.name}
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                {prime.name} • {prime.element}
              </Text>
            </View>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          {/* Ability Details */}
          <View style={styles.abilitySection}>
            <View style={styles.levelIndicator}>
              <Text variant="titleLarge" style={[styles.currentLevel, { color: primaryColor }]}>
                Level {ability.level}
              </Text>
              <Text variant="bodySmall" style={styles.maxLevel}>
                / {ability.maxLevel}
              </Text>
              {ability.elementalDamage && (
                <View style={styles.elementalIndicator}>
                  <ElementIcon element={prime.element} size="small" />
                  <Text variant="bodySmall" style={[styles.elementalText, { color: primaryColor }]}>
                    Elemental
                  </Text>
                </View>
              )}
            </View>

            <Text variant="bodyMedium" style={styles.description}>
              {ability.description}
            </Text>

            {/* Current Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text variant="bodySmall" style={styles.statLabel}>Power:</Text>
                <Text variant="bodyMedium" style={[styles.statValue, { color: primaryColor }]}>
                  {ability.power}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text variant="bodySmall" style={styles.statLabel}>Stamina Cost:</Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {ability.staminaCost}
                </Text>
              </View>
              
              <View style={styles.statRow}>
                <Text variant="bodySmall" style={styles.statLabel}>Cooldown:</Text>
                <Text variant="bodyMedium" style={styles.statValue}>
                  {ability.cooldown} turns
                </Text>
              </View>
            </View>

            {/* Status Effects */}
            {ability.statusEffects.length > 0 && (
              <View style={styles.statusEffectsContainer}>
                <Text variant="bodySmall" style={styles.statusLabel}>Status Effects:</Text>
                <View style={styles.statusEffects}>
                  {ability.statusEffects.map((effect, index) => (
                    <Chip
                      key={index}
                      style={[styles.statusChip, { backgroundColor: getStatusEffectColor(effect) + '20' }]}
                      textStyle={[styles.statusChipText, { color: getStatusEffectColor(effect) }]}
                    >
                      {effect}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Upgrade Preview */}
          {!isMaxLevel && nextLevelPreview && (
            <View style={styles.upgradePreview}>
              <Text variant="titleSmall" style={styles.previewTitle}>
                Next Level Preview
              </Text>
              
              <View style={styles.previewStats}>
                <View style={styles.previewStat}>
                  <Text variant="bodySmall" style={styles.previewLabel}>Level:</Text>
                  <View style={styles.previewChange}>
                    <Text variant="bodyMedium" style={styles.currentValue}>
                      {ability.level}
                    </Text>
                    <Text variant="bodyMedium" style={styles.arrow}>→</Text>
                    <Text variant="bodyMedium" style={[styles.newValue, { color: primaryColor }]}>
                      {nextLevelPreview.level}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.previewStat}>
                  <Text variant="bodySmall" style={styles.previewLabel}>Power:</Text>
                  <View style={styles.previewChange}>
                    <Text variant="bodyMedium" style={styles.currentValue}>
                      {ability.power}
                    </Text>
                    <Text variant="bodyMedium" style={styles.arrow}>→</Text>
                    <Text variant="bodyMedium" style={[styles.newValue, { color: primaryColor }]}>
                      {nextLevelPreview.power}
                    </Text>
                    <Text variant="bodySmall" style={[styles.increase, { color: primaryColor }]}>
                      (+{nextLevelPreview.powerIncrease})
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Upgrade Cost */}
          {!isMaxLevel && (
            <View style={styles.costSection}>
              <Text variant="titleSmall" style={styles.costTitle}>
                Upgrade Cost
              </Text>
              
              {loadingCost ? (
                <View style={styles.loadingCost}>
                  <Text variant="bodyMedium" style={styles.loadingText}>
                    Calculating cost...
                  </Text>
                </View>
              ) : upgradeCost ? (
                <View style={styles.costItems}>
                  {upgradeCost.gems && (
                    <View style={styles.costItem}>
                      <View style={styles.costIcon}>
                        <Text style={styles.gemIcon}>💎</Text>
                      </View>
                      <View style={styles.costTextContainer}>
                        <Text variant="bodyMedium" style={styles.costText}>
                          {upgradeCost.gems} Gems
                        </Text>
                        {playerResources && (
                          <Text variant="bodySmall" style={[
                            styles.resourceCount,
                            { color: playerResources.gems >= upgradeCost.gems ? '#10B981' : '#DC2626' }
                          ]}>
                            You have: {playerResources.gems}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                  
                  {upgradeCost.items?.map((item, index) => (
                    <View key={index} style={styles.costItem}>
                      <View style={styles.costIcon}>
                        <Text style={styles.scrollIcon}>📜</Text>
                      </View>
                      <View style={styles.costTextContainer}>
                        <Text variant="bodyMedium" style={styles.costText}>
                          {item.quantity}x {item.itemName}
                        </Text>
                        {playerResources && (
                          <Text variant="bodySmall" style={[
                            styles.resourceCount,
                            { color: playerResources.scrolls >= item.quantity ? '#10B981' : '#DC2626' }
                          ]}>
                            You have: {playerResources.scrolls}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.errorCost}>
                  <Text variant="bodyMedium" style={styles.errorText}>
                    Unable to calculate cost
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={loadUpgradeCost}
                    style={styles.retryButton}
                  >
                    Retry
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Max Level Message */}
          {isMaxLevel && (
            <View style={styles.maxLevelSection}>
              <Text variant="titleMedium" style={[styles.maxLevelText, { color: primaryColor }]}>
                ✨ Maximum Level Reached
              </Text>
              <Text variant="bodyMedium" style={styles.maxLevelDescription}>
                This ability has reached its maximum potential and cannot be upgraded further.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
              disabled={isUpgrading}
            >
              {isMaxLevel ? 'Close' : 'Cancel'}
            </Button>
            
            {!isMaxLevel && (
              <Button
                mode="contained"
                onPress={handleUpgrade}
                style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
                disabled={isUpgrading || loadingCost || !upgradeCost}
                loading={isUpgrading}
              >
                {isUpgrading ? 'Upgrading...' : 'Upgrade Ability'}
              </Button>
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
    maxHeight: height * 0.9,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  abilitySection: {
    padding: spacing.lg,
  },
  levelIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  currentLevel: {
    fontWeight: '700',
  },
  maxLevel: {
    color: colors.textSecondary,
  },
  elementalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    gap: spacing.xs,
  },
  elementalText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: colors.surfaceVariant + '40',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    color: colors.textSecondary,
  },
  statValue: {
    fontWeight: '600',
    color: colors.text,
  },
  statusEffectsContainer: {
    marginBottom: spacing.md,
  },
  statusLabel: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  statusEffects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  upgradePreview: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceVariant + '20',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  previewTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  previewStats: {
    gap: spacing.md,
  },
  previewStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    color: colors.textSecondary,
  },
  previewChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  currentValue: {
    color: colors.text,
    fontWeight: '600',
  },
  arrow: {
    color: colors.textSecondary,
  },
  newValue: {
    fontWeight: '600',
  },
  increase: {
    fontWeight: '600',
    fontSize: 12,
  },
  costSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  costTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  loadingCost: {
    alignItems: 'center',
    padding: spacing.md,
  },
  loadingText: {
    color: colors.textSecondary,
  },
  costItems: {
    gap: spacing.md,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  costIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemIcon: {
    fontSize: 16,
  },
  scrollIcon: {
    fontSize: 16,
  },
  costText: {
    fontWeight: '600',
    color: colors.text,
  },
  costTextContainer: {
    flex: 1,
  },
  resourceCount: {
    marginTop: spacing.xs / 2,
    fontWeight: '500',
  },
  errorCost: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: '#DC2626',
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  maxLevelSection: {
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  maxLevelText: {
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  maxLevelDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  upgradeButton: {
    flex: 2,
  },
}) 