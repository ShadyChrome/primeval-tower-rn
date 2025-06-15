import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native'
import { Text, Surface, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ShopService, ShopItem, PurchaseResult } from '../services/shopService'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { colors, spacing, shadows } from '../theme/designSystem'
import Header from '../components/Header'
import { PlayerManager } from '../../lib/playerManager'

interface ItemsShopScreenProps {
  route: {
    params: {
      playerData?: {
        player: {
          gems: number | null
          [key: string]: any
        }
        [key: string]: any
      }
      onPlayerDataUpdate?: () => void
    }
  }
}

export default function ItemsShopScreen({ route }: ItemsShopScreenProps) {
  const navigation = useNavigation()
  const { playerData: initialPlayerData, onPlayerDataUpdate } = route.params
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [purchasingItems, setPurchasingItems] = useState<Set<string>>(new Set())
  const [currentPlayerData, setCurrentPlayerData] = useState(initialPlayerData)

  const { player } = currentPlayerData || { player: {} }
  const playerGems = player?.gems || 0

  const loadShopItems = async () => {
    try {
      const items = await ShopService.getShopItems()
      const enhancerItems = items.filter(item => item.category === 'enhancers')
      setShopItems(enhancerItems)
    } catch (error) {
      console.error('Error loading shop items:', error)
      Alert.alert('Error', 'Failed to load shop items. Please try again.')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        loadShopItems(),
        onPlayerDataUpdate?.()
      ])
      
      // Refresh local player data
      try {
        const freshPlayerData = await PlayerManager.loadPlayerDataWithAuth()
        if (freshPlayerData) {
          setCurrentPlayerData(freshPlayerData)
        }
      } catch (error) {
        console.error('Error refreshing player data:', error)
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadShopItems()
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadShopItems()
    }, [])
  )

  const handlePurchase = async (item: ShopItem, quantity: number = 1) => {
    try {
      if (purchasingItems.has(item.id)) {
        return
      }

      const totalCost = item.price * quantity
      if (playerGems < totalCost) {
        Alert.alert(
          'Insufficient Gems',
          `You need ${totalCost} gems but only have ${playerGems} gems.`,
          [{ text: 'OK' }]
        )
        return
      }

      Alert.alert(
        'Confirm Purchase',
        `Purchase ${quantity}x ${item.name} for ${totalCost} gems?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Purchase',
            onPress: async () => {
              setPurchasingItems(prev => new Set(prev).add(item.id))

              try {
                const result: PurchaseResult = await ShopService.purchaseItem(item.id, quantity)
                
                if (result.success) {
                  if (onPlayerDataUpdate) {
                    await onPlayerDataUpdate()
                  }
                  
                  // Fetch fresh player data to update local state
                  try {
                    const freshPlayerData = await PlayerManager.loadPlayerDataWithAuth()
                    if (freshPlayerData) {
                      setCurrentPlayerData(freshPlayerData)
                    }
                  } catch (error) {
                    console.error('Error refreshing player data:', error)
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

  const getItemIcon = (itemId: string) => {
    const iconMap: Record<string, string> = {
      'element_enhancer': 'atom',
      'rarity_amplifier': 'trending-up',
      'rainbow_enhancer': 'star-circle'
    }
    return iconMap[itemId] || 'star-outline'
  }

  const getItemColors = (itemId: string) => {
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'element_enhancer': { color: colors.secondary, bgColor: colors.gradients.lavender[1] },
      'rarity_amplifier': { color: colors.accent, bgColor: colors.gradients.mint[1] },
      'rainbow_enhancer': { color: colors.primary, bgColor: colors.gradients.coral[1] }
    }
    return colorMap[itemId] || { color: colors.accent, bgColor: colors.accentLight }
  }

  const renderShopItem = (item: ShopItem) => {
    const isPurchasing = purchasingItems.has(item.id)
    const canAfford = playerGems >= item.price
    const itemColors = getItemColors(item.id)
    const itemIcon = getItemIcon(item.id)

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.itemCard,
          !canAfford && styles.itemCardDisabled
        ]}
        onPress={() => handlePurchase(item)}
        disabled={!canAfford || isPurchasing}
        activeOpacity={0.8}
      >
        <View style={[styles.itemIcon, { backgroundColor: itemColors.bgColor }]}>
          <MaterialCommunityIcons name={itemIcon as any} size={32} color={itemColors.color} />
        </View>
        
        <Text variant="titleSmall" style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        
        <Text variant="bodySmall" style={styles.itemDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
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

  const renderItemsGrid = () => {
    if (shopItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyStateText}>
            No items available
          </Text>
          <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
            Check back later for new items!
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.itemsGrid}>
        {shopItems.map(renderShopItem)}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Header 
        playerName={player.player_name || 'Player'}
        playerLevel={player.level || 1}
        currentXP={player.current_xp || 0}
        maxXP={player.max_xp || 100}
        gems={player.gems || 0}
      />
      
      <Surface style={styles.headerSection} elevation={1}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.screenTitle}>
              Items
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Enhance your hatching with special items
            </Text>
          </View>
        </View>
      </Surface>

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
        {renderItemsGrid()}
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Tip: Use enhancers before hatching to improve your chances!
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  screenTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
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
    marginBottom: spacing.xl,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    width: '48%',
    minHeight: 200,
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
  itemName: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    minHeight: 32,
  },
  itemDescription: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minHeight: 42,
    lineHeight: 14,
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
})