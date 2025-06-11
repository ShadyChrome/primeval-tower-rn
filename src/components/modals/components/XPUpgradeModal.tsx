import React, { useState, useEffect, useMemo } from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native'
import { Text, Modal, Portal, IconButton, Button, ProgressBar } from 'react-native-paper'
import { usePrimeUpgrade, XPItem, UpgradeResult } from '../../../hooks/usePrimeUpgrade'
import { UIPrime } from '../../../services/primeService'
import { colors, spacing } from '../../../theme/designSystem'

interface XPUpgradeModalProps {
  visible: boolean
  onDismiss: () => void
  prime: UIPrime
  primaryColor: string
  onUpgradeSuccess: (result: UpgradeResult) => void
}

interface SelectedXPItem extends XPItem {
  selectedQuantity: number
}

const { height } = Dimensions.get('window')

export default function XPUpgradeModal({
  visible,
  onDismiss,
  prime,
  primaryColor,
  onUpgradeSuccess
}: XPUpgradeModalProps) {
  const {
    loading,
    error,
    calculateXPForLevel,
    getAvailableXPItems,
    usePrimeXPItems,
    calculatePowerForLevel
  } = usePrimeUpgrade()

  const [availableXPItems, setAvailableXPItems] = useState<XPItem[]>([])
  const [selectedItems, setSelectedItems] = useState<SelectedXPItem[]>([])
  const [isUpgrading, setIsUpgrading] = useState(false)

  // Load available XP items when modal opens
  useEffect(() => {
    if (visible) {
      loadXPItems()
      setSelectedItems([])
    }
  }, [visible])

  const loadXPItems = async () => {
    const items = await getAvailableXPItems()
    setAvailableXPItems(items)
  }

  // Calculate preview of upgrade
  const upgradePreview = useMemo(() => {
    const totalXP = selectedItems.reduce((sum, item) => sum + (item.xpValue * item.selectedQuantity), 0)
    
    // Calculate XP needed for next level from current level
    const xpNeededForNextLevel = calculateXPForLevel(prime.level)
    
    if (totalXP === 0) {
      return {
        currentLevel: prime.level,
        newLevel: prime.level,
        totalXPGain: 0,
        newPower: prime.power,
        xpNeededForNextLevel,
        xpDeficitForNextLevel: xpNeededForNextLevel,
        willLevelUp: false
      }
    }

    // Calculate level progression including current experience
    let level = prime.level
    let remainingXP = (prime.experience || 0) + totalXP // Start with current experience + gained XP
    
    while (remainingXP > 0 && level < 100) {
      const xpNeeded = calculateXPForLevel(level)
      if (remainingXP >= xpNeeded) {
        remainingXP -= xpNeeded
        level++
      } else {
        break
      }
    }

    const willLevelUp = level > prime.level
    const currentExperience = prime.experience || 0
    const xpDeficitForNextLevel = Math.max(0, xpNeededForNextLevel - currentExperience - totalXP)

    return {
      currentLevel: prime.level,
      newLevel: level,
      totalXPGain: totalXP,
      newPower: calculatePowerForLevel(level, prime.rarity),
      xpNeededForNextLevel,
      xpDeficitForNextLevel,
      willLevelUp
    }
  }, [selectedItems, prime, calculateXPForLevel, calculatePowerForLevel])

  const handleItemQuantityChange = (item: XPItem, change: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(selected => selected.id === item.id)
      
      if (existing) {
        const newQuantity = Math.max(0, Math.min(item.quantity, existing.selectedQuantity + change))
        if (newQuantity === 0) {
          return prev.filter(selected => selected.id !== item.id)
        }
        return prev.map(selected => 
          selected.id === item.id 
            ? { ...selected, selectedQuantity: newQuantity }
            : selected
        )
      } else if (change > 0) {
        return [...prev, { ...item, selectedQuantity: 1 }]
      }
      
      return prev
    })
  }

  const getSelectedQuantity = (itemId: string): number => {
    return selectedItems.find(item => item.id === itemId)?.selectedQuantity || 0
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      'Common': '#ADB5BD',
      'Rare': '#74C0FC',
      'Epic': '#B197FC',
      'Legendary': '#FFCC8A'
    }
    return colors[rarity as keyof typeof colors] || '#ADB5BD'
  }

  const handleUpgrade = async () => {
    if (selectedItems.length === 0) return

    setIsUpgrading(true)
    try {
      const itemsToUse = selectedItems.map(item => ({
        itemId: item.id,
        quantity: item.selectedQuantity
      }))

      const result = await usePrimeXPItems(prime, itemsToUse)
      
      if (result.success) {
        onUpgradeSuccess(result)
        onDismiss()
      } else {
        // Handle error - could show toast/alert
        console.error('Upgrade failed:', result.message)
      }
    } catch (err) {
      console.error('Upgrade error:', err)
    } finally {
      setIsUpgrading(false)
    }
  }

  const renderXPItem = ({ item }: { item: XPItem }) => {
    const selectedQuantity = getSelectedQuantity(item.id)
    const isSelected = selectedQuantity > 0

    return (
      <View style={[
        styles.itemCard,
        isSelected && { borderColor: primaryColor, backgroundColor: primaryColor + '10' }
      ]}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleSmall" style={styles.itemName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.itemDetails}>
              +{item.xpValue} XP • Owned: {item.quantity}
            </Text>
          </View>
          
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(item.rarity) }]}>
            <Text variant="bodySmall" style={styles.rarityText}>
              {item.rarity}
            </Text>
          </View>
        </View>

        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: primaryColor }]}
            onPress={() => handleItemQuantityChange(item, -1)}
            disabled={selectedQuantity === 0}
          >
            <Text style={[styles.quantityButtonText, { color: primaryColor }]}>−</Text>
          </TouchableOpacity>
          
          <Text variant="titleMedium" style={[styles.quantityText, { color: primaryColor }]}>
            {selectedQuantity}
          </Text>
          
          <TouchableOpacity
            style={[styles.quantityButton, { borderColor: primaryColor }]}
            onPress={() => handleItemQuantityChange(item, 1)}
            disabled={selectedQuantity >= item.quantity}
          >
            <Text style={[styles.quantityButtonText, { color: primaryColor }]}>+</Text>
          </TouchableOpacity>
        </View>

        {selectedQuantity > 0 && (
          <View style={styles.selectedInfo}>
            <Text variant="bodySmall" style={[styles.selectedText, { color: primaryColor }]}>
              Total XP: +{item.xpValue * selectedQuantity}
            </Text>
          </View>
        )}
      </View>
    )
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
            <Text variant="headlineSmall" style={styles.title}>
              Level Up {prime.name}
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onDismiss}
            />
          </View>

          {/* Current Prime Info */}
          <View style={styles.primeInfo}>
            <View style={styles.levelInfo}>
              <Text variant="titleMedium" style={styles.currentLevel}>
                Level {upgradePreview.currentLevel}
              </Text>
              {upgradePreview.newLevel > upgradePreview.currentLevel && (
                <>
                  <Text variant="titleMedium" style={styles.arrow}>→</Text>
                  <Text variant="titleMedium" style={[styles.newLevel, { color: primaryColor }]}>
                    Level {upgradePreview.newLevel}
                  </Text>
                </>
              )}
            </View>
            
            <View style={styles.powerInfo}>
              <Text variant="bodyMedium" style={styles.powerLabel}>Power:</Text>
              <Text variant="bodyMedium" style={styles.currentPower}>
                {prime.power}
              </Text>
              {upgradePreview.newPower > prime.power && (
                <>
                  <Text variant="bodyMedium" style={styles.arrow}>→</Text>
                  <Text variant="bodyMedium" style={[styles.newPower, { color: primaryColor }]}>
                    {upgradePreview.newPower}
                  </Text>
                </>
              )}
            </View>

            {/* XP Progress Bar with Preview */}
            <View style={styles.xpProgressSection}>
              <View style={styles.xpProgressHeader}>
                <Text variant="bodySmall" style={styles.xpProgressLabel}>
                  Level {prime.level} Progress
                </Text>
                                 <View style={styles.xpProgressValues}>
                   <Text variant="bodySmall" style={styles.xpCurrentValue}>
                     {prime.experience || 0}
                   </Text>
                   {upgradePreview.totalXPGain > 0 && (
                     <Text variant="bodySmall" style={[styles.xpGainValue, { color: primaryColor }]}>
                       +{upgradePreview.totalXPGain}
                     </Text>
                   )}
                   <Text variant="bodySmall" style={styles.xpMaxValue}>
                     / {upgradePreview.xpNeededForNextLevel} XP
                   </Text>
                 </View>
              </View>

              {/* XP Progress Bar */}
                             <View style={styles.xpBarContainer}>
                 <View style={styles.xpBarBackground}>
                   {/* Current XP */}
                   <View 
                     style={[
                       styles.xpBarFill,
                       { 
                         width: `${Math.min(((prime.experience || 0) / upgradePreview.xpNeededForNextLevel) * 100, 100)}%`,
                         backgroundColor: colors.text + '40' // More visible than surfaceVariant
                       }
                     ]} 
                   />
                   {/* Potential XP gain */}
                   {upgradePreview.totalXPGain > 0 && (
                     <View 
                       style={[
                         styles.xpBarGain,
                         { 
                           left: `${Math.min(((prime.experience || 0) / upgradePreview.xpNeededForNextLevel) * 100, 100)}%`,
                           width: `${Math.min((upgradePreview.totalXPGain / upgradePreview.xpNeededForNextLevel) * 100, 100 - ((prime.experience || 0) / upgradePreview.xpNeededForNextLevel) * 100)}%`,
                           backgroundColor: primaryColor
                         }
                       ]} 
                     />
                   )}
                 </View>
                
                {/* Progress markers */}
                <View style={styles.xpBarMarkers}>
                  {[0.25, 0.5, 0.75].map((marker, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.xpBarMarker,
                        { left: `${marker * 100}%` }
                      ]} 
                    />
                  ))}
                </View>
              </View>

              {/* Status Messages */}
              {upgradePreview.totalXPGain > 0 && (
                <View style={styles.xpStatusContainer}>
                  {upgradePreview.willLevelUp ? (
                    <Text variant="bodySmall" style={[styles.xpStatusSuccess, { color: primaryColor }]}>
                      ✓ Will advance to Level {upgradePreview.newLevel}!
                    </Text>
                  ) : upgradePreview.xpDeficitForNextLevel > 0 ? (
                    <Text variant="bodySmall" style={styles.xpStatusNeed}>
                      Need {upgradePreview.xpDeficitForNextLevel} more XP for Level {prime.level + 1}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {/* XP Items List */}
          <View style={styles.itemsSection}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Select XP Potions
            </Text>
            
            {availableXPItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  No XP potions available
                </Text>
                <Text variant="bodySmall" style={styles.emptySubtext}>
                  Obtain XP potions from battles and rewards
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableXPItems}
                renderItem={renderXPItem}
                keyExtractor={(item) => item.id}
                style={styles.itemsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: spacing.lg }}
              />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelButton}
              disabled={isUpgrading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleUpgrade}
              style={[styles.upgradeButton, { backgroundColor: primaryColor }]}
              disabled={selectedItems.length === 0 || isUpgrading}
              loading={isUpgrading}
            >
              {isUpgrading ? 'Upgrading...' : 'Level Up'}
            </Button>
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
    height: height * 0.85,
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
  primeInfo: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceVariant + '40',
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentLevel: {
    color: colors.text,
    fontWeight: '600',
  },
  arrow: {
    color: colors.textSecondary,
    marginHorizontal: spacing.sm,
  },
  newLevel: {
    fontWeight: '600',
  },
  powerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  powerLabel: {
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  currentPower: {
    color: colors.text,
    fontWeight: '600',
  },
  newPower: {
    fontWeight: '600',
  },
  xpProgressSection: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant + '20',
    borderRadius: 12,
  },
  xpProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  xpProgressLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  xpProgressValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpCurrentValue: {
    color: colors.text,
    fontWeight: '500',
  },
  xpGainValue: {
    fontWeight: '600',
  },
  xpMaxValue: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  xpBarContainer: {
    marginBottom: spacing.sm,
  },
  xpBarBackground: {
    height: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    minWidth: '100%',
  },
  xpBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 6,
    minWidth: 2, // Ensure minimum visibility
  },
  xpBarGain: {
    position: 'absolute',
    height: '100%',
    borderRadius: 6,
    opacity: 0.8,
    minWidth: 2, // Ensure minimum visibility
  },
  xpBarMarkers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
  },
  xpBarMarker: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: colors.surface + '80',
  },
  xpStatusContainer: {
    alignItems: 'center',
  },
  xpStatusSuccess: {
    fontWeight: '600',
    fontSize: 13,
  },
  xpStatusNeed: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  itemsSection: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  itemsList: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  itemDetails: {
    color: colors.textSecondary,
  },
  rarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  rarityText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 10,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  quantityText: {
    minWidth: 30,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedInfo: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  selectedText: {
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textTertiary,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  cancelButton: {
    flex: 1,
  },
  upgradeButton: {
    flex: 2,
  },
}) 