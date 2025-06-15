import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native'
import { Text, Surface, Chip, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ShopService, ShopItem, PurchaseResult } from '../services/shopService'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { colors, spacing, shadows } from '../theme/designSystem'
import Header from '../components/Header'
import { PlayerManager } from '../../lib/playerManager'

interface EggsShopScreenProps {
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

export default function EggsShopScreen({ route }: EggsShopScreenProps) {
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
      const eggItems = items.filter(item => item.category === 'eggs')
      setShopItems(eggItems)
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

  const rarityOrder = {
    'Common': 1,
    'Rare': 2,
    'Epic': 3,
    'Legendary': 4,
    'Mythical': 5
  }

  const getEggColors = (eggId: string) => {
    const colorMap: Record<string, { color: string; bgColor: string }> = {
      'common_egg': { color: '#ADB5BD', bgColor: '#F8F9FA' },
      'rare_egg': { color: '#74C0FC', bgColor: '#E7F5FF' },
      'epic_egg': { color: '#B197FC', bgColor: '#F3F0FF' },
      'legendary_egg': { color: '#FFCC8A', bgColor: '#FFF4E6' },
      'mythical_egg': { color: '#FFA8A8', bgColor: '#FFE8E8' }
    }
    return colorMap[eggId] || { color: '#ADB5BD', bgColor: '#F8F9FA' }
  }

  const getSortedItems = (items: ShopItem[]) => {
    return [...items].sort((a, b) => {
      const rarityA = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0
      const rarityB = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0
      return rarityA - rarityB
    })
  }

  const sortedItems = getSortedItems(shopItems)

  const renderShopItem = (item: ShopItem) => {
    const isPurchasing = purchasingItems.has(item.id)
    const canAfford = playerGems >= item.price
    const eggColors = getEggColors(item.id)

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.eggCard,
          !canAfford && styles.itemCardDisabled
        ]}
        onPress={() => handlePurchase(item)}
        disabled={!canAfford || isPurchasing}
        activeOpacity={0.8}
      >
        <View style={[styles.itemIcon, { backgroundColor: eggColors.bgColor }]}>
          <MaterialCommunityIcons name="egg" size={32} color={eggColors.color} />
        </View>
        
        <Text variant="titleSmall" style={styles.itemName} numberOfLines={2}>
          {item.name.replace(' Egg', '\nEgg')}
        </Text>
        
        {item.rarity && (
          <View style={[styles.rarityBadge, { backgroundColor: eggColors.color }]}>
            <Text style={styles.rarityText}>
              {item.rarity}
            </Text>
          </View>
        )}
        
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

  const renderEggGrid = () => {
    if (sortedItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyStateText}>
            No eggs available
          </Text>
          <Text variant="bodyMedium" style={styles.emptyStateSubtext}>
            Check back later for new eggs!
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.eggGrid}>
        <View style={styles.eggRow}>
          {sortedItems.slice(0, 3).map(renderShopItem)}
        </View>
        <View style={styles.eggRow}>
          {sortedItems.slice(3, 5).map(renderShopItem)}
        </View>
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
              Eggs
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Hatch new Primes from these magical eggs
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
        {renderEggGrid()}
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Tip: Higher rarity eggs have better chances for rare Primes!
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
    flex: 1,
    minHeight: 180,
    maxWidth: 120,
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
  rarityBadge: {
    marginBottom: spacing.sm,
    height: 24,
    minWidth: 80,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
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