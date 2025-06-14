import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native'
import { Text, Card, Button, SegmentedButtons, Surface, Chip } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ShopService, ShopItem, PurchaseResult } from '../services/shopService'
import { PlayerManager } from '../../lib/playerManager'
import { useFocusEffect } from '@react-navigation/native'
import { colors, spacing, shadows } from '../theme/designSystem'

interface ShopScreenProps {
  playerData?: {
    player: {
      gems: number | null
      [key: string]: any
    }
    [key: string]: any
  }
  onPlayerDataUpdate?: () => void
}

export default function ShopScreen({ playerData, onPlayerDataUpdate }: ShopScreenProps) {
  const [activeCategory, setActiveCategory] = useState<'eggs' | 'enhancers'>('eggs')
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [purchasingItems, setPurchasingItems] = useState<Set<string>>(new Set())
  const [playerGems, setPlayerGems] = useState(0)

  // Load shop items and player data
  const loadShopData = async () => {
    try {
      // Load shop items from server
      const items = await ShopService.getShopItems()
      setShopItems(items)

      // Load current player gems
      const playerId = await PlayerManager.getCachedPlayerId()
      if (playerId) {
        const currencies = await ShopService.getPlayerCurrencies(playerId)
        setPlayerGems(currencies.gems)
      }
    } catch (error) {
      console.error('Error loading shop data:', error)
      Alert.alert('Error', 'Failed to load shop data. Please try again.')
    }
  }

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadShopData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadShopData()
  }, [])

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadShopData()
    }, [])
  )

  // Update gems from props if available
  useEffect(() => {
    if (playerData?.player?.gems !== undefined && playerData.player.gems !== null) {
      setPlayerGems(playerData.player.gems)
    }
  }, [playerData?.player?.gems])

  const handlePurchase = async (item: ShopItem, quantity: number = 1) => {
    try {
      // Prevent multiple purchases of the same item
      if (purchasingItems.has(item.id)) {
        return
      }

      // Check if player can afford the item
      const totalCost = item.price * quantity
      if (playerGems < totalCost) {
        Alert.alert(
          'Insufficient Gems',
          `You need ${totalCost} gems but only have ${playerGems} gems.`,
          [{ text: 'OK' }]
        )
        return
      }

      // Confirm purchase
      Alert.alert(
        'Confirm Purchase',
        `Purchase ${quantity}x ${item.name} for ${totalCost} gems?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              // Add item to purchasing set
              setPurchasingItems(prev => new Set(prev).add(item.id))

              try {
                const result: PurchaseResult = await ShopService.purchaseItem(item.id, quantity)
                
                if (result.success) {
                  // Update local gem balance
                  if (result.newBalance !== undefined) {
                    setPlayerGems(result.newBalance)
                  }

                  // Trigger parent component to refresh player data
                  if (onPlayerDataUpdate) {
                    onPlayerDataUpdate()
                  }

                  Alert.alert(
                    'Purchase Successful!',
                    result.message,
                    [{ text: 'OK' }]
                  )
                } else {
                  Alert.alert(
                    'Purchase Failed',
                    result.message,
                    [{ text: 'OK' }]
                  )
                }
              } catch (error) {
                console.error('Purchase error:', error)
                Alert.alert(
                  'Purchase Error',
                  'An unexpected error occurred. Please try again.',
                  [{ text: 'OK' }]
                )
              } finally {
                // Remove item from purchasing set
                setPurchasingItems(prev => {
                  const newSet = new Set(prev)
                  newSet.delete(item.id)
                  return newSet
                })
              }
            }
          }
        ]
      )
    } catch (error) {
      console.error('Error in handlePurchase:', error)
    }
  }

  const categories = [
    { value: 'eggs' as const, label: 'Eggs' },
    { value: 'enhancers' as const, label: 'Enhancers' },
  ]

  // Define rarity order for sorting eggs
  const rarityOrder = {
    'Common': 1,
    'Rare': 2,
    'Epic': 3,
    'Legendary': 4,
    'Mythical': 5
  }

  // Get egg colors matching the design system rarity colors
  const getEggColors = (eggId: string) => {
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'common_egg': { color: '#ADB5BD', bgColor: '#F8F9FA' },      // Soft Gray
      'rare_egg': { color: '#74C0FC', bgColor: '#E7F5FF' },        // Pastel Blue
      'epic_egg': { color: '#B197FC', bgColor: '#F3F0FF' },        // Lavender Purple
      'legendary_egg': { color: '#FFCC8A', bgColor: '#FFF4E6' },   // Warm Peach
      'mythical_egg': { color: '#FFA8A8', bgColor: '#FFE8E8' }     // Soft Coral
    }
    return colorMap[eggId] || { color: '#ADB5BD', bgColor: '#F8F9FA' }
  }

  // Sort items by rarity for eggs, keep original order for enhancers
  const getSortedItems = (items: ShopItem[]) => {
    if (activeCategory === 'eggs') {
      return [...items].sort((a, b) => {
        const rarityA = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0
        const rarityB = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0
        return rarityA - rarityB
      })
    }
    return items
  }

  const filteredItems = getSortedItems(shopItems.filter(item => item.category === activeCategory))

  const renderShopItem = (item: ShopItem) => {
    const isPurchasing = purchasingItems.has(item.id)
    const canAfford = playerGems >= item.price
    const isEgg = item.category === 'eggs'
    const eggColors = isEgg ? getEggColors(item.id) : { color: colors.accent, bgColor: colors.accentLight }

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          isEgg ? styles.eggCard : styles.itemCard,
          !canAfford && styles.itemCardDisabled
        ]}
        onPress={() => handlePurchase(item)}
        disabled={!canAfford || isPurchasing}
        activeOpacity={0.8}
      >
        {/* Item Icon */}
        <View style={[styles.itemIcon, { backgroundColor: eggColors.bgColor }]}>
          {isEgg ? (
            <Text style={[styles.eggEmoji, { color: eggColors.color }]}>🥚</Text>
          ) : (
            <MaterialCommunityIcons name="star-outline" size={24} color={eggColors.color} />
          )}
        </View>
        
        {/* Item Name */}
        <Text variant="titleSmall" style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        
        {/* Rarity Chip */}
        {item.rarity && (
          <Chip 
            style={[styles.rarityChip, { backgroundColor: eggColors.color }]}
            textStyle={styles.rarityText}
            compact
          >
            {item.rarity}
          </Chip>
        )}
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <MaterialCommunityIcons 
            name="diamond" 
            size={14} 
            color={canAfford ? '#4CAF50' : '#DC2626'} 
          />
          <Text variant="bodyMedium" style={[
            styles.price,
            canAfford ? styles.affordablePrice : styles.unaffordablePrice
          ]}>
            {item.price}
          </Text>
        </View>
        
        {/* Purchase Button */}
        <Button 
          mode="contained" 
          style={[
            styles.purchaseButton,
            canAfford ? styles.affordableButton : styles.unaffordableButton
          ]}
          contentStyle={styles.buttonContent}
          disabled={!canAfford || isPurchasing}
          loading={isPurchasing}
          compact
        >
          {isPurchasing ? 'Buying...' : 'Buy'}
        </Button>
      </TouchableOpacity>
    )
  }

  const renderEggGrid = () => {
    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyStateText}>
            No items available in this category
          </Text>
          <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
            Check back later for new items!
          </Text>
        </View>
      )
    }

    if (activeCategory !== 'eggs') {
      // For enhancers, use regular grid
      return (
        <View style={styles.itemsGrid}>
          {filteredItems.map(renderShopItem)}
        </View>
      )
    }

    // For eggs, use 3+2 layout like HatchingScreen
    return (
      <View style={styles.eggGrid}>
        <View style={styles.eggRow}>
          {filteredItems.slice(0, 3).map(renderShopItem)}
        </View>
        <View style={styles.eggRow}>
          {filteredItems.slice(3, 5).map(renderShopItem)}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.headerSection} elevation={1}>
        <Text variant="headlineSmall" style={styles.screenTitle}>
          Shop
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Purchase eggs and enhancers with gems
        </Text>
        
        {/* Category Selector */}
        <SegmentedButtons
          value={activeCategory}
          onValueChange={setActiveCategory}
          buttons={categories}
          style={styles.categorySelector}
        />
      </Surface>

      {/* Shop Items Grid */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent]}
          />
        }
      >
        {renderEggGrid()}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            💡 Tip: Eggs can be used in the Hatching screen to get new Primes!
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  screenTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  categorySelector: {
    backgroundColor: colors.surfaceVariant,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    width: '48%', // Two columns for enhancers
    minHeight: 180,
    ...shadows.light,
  },
  itemCardDisabled: {
    opacity: 0.6,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  eggEmoji: {
    fontSize: 32,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemName: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 32, // Consistent height for alignment
  },
  rarityChip: {
    marginBottom: spacing.sm,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  price: {
    fontWeight: '700',
  },
  affordablePrice: {
    color: '#4CAF50',
  },
  unaffordablePrice: {
    color: '#DC2626',
  },
  purchaseButton: {
    width: '100%',
  },
  affordableButton: {
    backgroundColor: colors.accent,
  },
  unaffordableButton: {
    backgroundColor: colors.textTertiary,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  eggGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  eggRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  eggCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1, // Flexible width for 3+2 layout
    minHeight: 180,
    maxWidth: 120, // Limit max width to keep cards compact
    ...shadows.light,
  },
}) 