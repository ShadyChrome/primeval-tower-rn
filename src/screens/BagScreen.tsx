import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native'
import { Text, SegmentedButtons, Surface } from 'react-native-paper'
import { PlayerRune } from '../../types/supabase'
import { RuneService } from '../services/runeService'
import { InventoryService, UIInventoryItem } from '../services/inventoryService'
import RuneFilter from '../components/common/RuneFilter'
import RuneCard from '../components/common/RuneCard'
import ItemCard from '../components/common/ItemCard'
import { filterRunes, sortRunes } from '../utils/runeFilters'
import { useFocusEffect } from '@react-navigation/native'
import { colors, spacing } from '../theme/designSystem'

export default function BagScreen() {
  const [activeTab, setActiveTab] = useState('runes')
  const [runeStatFilter, setRuneStatFilter] = useState('all')
  const [runeTierFilter, setRuneTierFilter] = useState('all')
  const [allRunes, setAllRunes] = useState<PlayerRune[]>([])
  const [allItems, setAllItems] = useState<UIInventoryItem[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load runes from database
  const loadRunes = async () => {
    try {
      const runes = await RuneService.getPlayerRunes()
      setAllRunes(runes)
    } catch (error) {
      console.error('Error loading runes:', error)
    }
  }

  // Load items from database
  const loadItems = async () => {
    try {
      const items = await InventoryService.getPlayerInventory()
      setAllItems(items)
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  // Load all data
  const loadAllData = async () => {
    try {
      await Promise.all([loadRunes(), loadItems()])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadAllData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadAllData()
  }, [])

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAllData()
    }, [])
  )

  const filteredRunes = sortRunes(filterRunes(allRunes, runeStatFilter, runeTierFilter, true))
  
  // Calculate rune counts by tier
  const getRuneCountByTier = (runes: PlayerRune[]) => {
    const counts = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythical: 0
    }
    
    runes.forEach(rune => {
      const tier = rune.rune_tier?.toLowerCase() as keyof typeof counts
      if (tier && counts.hasOwnProperty(tier)) {
        counts[tier]++
      }
    })
    
    return counts
  }
  
  const runeCounts = getRuneCountByTier(allRunes)

  const renderRuneCard = ({ item: rune }: { item: PlayerRune }) => (
    <RuneCard 
      rune={rune}
      primaryColor={colors.primary}
      showEquipStatus={true}
    />
  )

  const renderItemCard = ({ item }: { item: UIInventoryItem }) => (
    <ItemCard 
      item={item}
      primaryColor={colors.primary}
    />
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="titleMedium" style={styles.emptyText}>
        {activeTab === 'runes' ? 'No runes found' : 'No items in inventory'}
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtext}>
        {activeTab === 'runes' 
          ? 'Runes can be obtained from battles and rewards'
          : 'Items can be purchased from the shop or earned through gameplay'
        }
      </Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Surface style={styles.headerSection} elevation={1}>
        <Text variant="headlineSmall" style={styles.screenTitle}>
          Bag
        </Text>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'runes', label: 'Runes' },
            { value: 'items', label: 'Items' },
          ]}
          style={styles.tabSelector}
        />
      </Surface>

      <View style={styles.statsBar}>
        {activeTab === 'runes' ? (
          <RuneFilter
            statFilter={runeStatFilter}
            tierFilter={runeTierFilter}
            onStatFilterChange={setRuneStatFilter}
            onTierFilterChange={setRuneTierFilter}
            filteredCount={filteredRunes.length}
            totalCount={allRunes.length}
          />
        ) : (
          <Text variant="titleMedium" style={styles.tabStats}>
            Items: {allItems.reduce((total, item) => total + item.quantity, 0)} total
          </Text>
        )}
      </View>

      {activeTab === 'runes' ? (
        <FlatList
          data={filteredRunes}
          renderItem={renderRuneCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            filteredRunes.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      ) : (
        <FlatList
          data={allItems}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            allItems.length === 0 && styles.emptyContainer
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  screenTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tabSelector: {
    backgroundColor: colors.surfaceVariant,
  },
  statsBar: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabStats: {
    color: colors.text,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
}) 