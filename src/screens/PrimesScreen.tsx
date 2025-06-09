import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { Text, Searchbar, Chip, IconButton } from 'react-native-paper'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview'
import { LinearGradient } from 'expo-linear-gradient'
import { ElementIcon } from '../../components/OptimizedImage'
import { ElementType } from '../assets/ImageAssets'
import ModernCard from '../../components/ui/ModernCard'
import GradientCard from '../../components/ui/GradientCard'
import { colors, spacing, typography, shadows } from '../theme/designSystem'

interface Prime {
  id: string
  name: string
  element: string
  rarity: string
  level: number
  power: number
  abilities: string[]
  image?: string // For future image implementation
}

const screenWidth = Dimensions.get('window').width
const cardMargin = spacing.sm
const cardsPerRow = 3
const cardWidth = (screenWidth - (spacing.lg * 2) - (cardMargin * (cardsPerRow - 1))) / cardsPerRow

export default function PrimesScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterElement, setFilterElement] = useState('all')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Mock data for owned Primes
  const primes: Prime[] = [
    {
      id: '1',
      name: 'Flamewyrm',
      element: 'Ignis',
      rarity: 'Epic',
      level: 25,
      power: 847,
      abilities: ['Fire Blast', 'Ember Shield', 'Flame Burst', 'Inferno']
    },
    {
      id: '2',
      name: 'Crystalhorn',
      element: 'Geo',
      rarity: 'Rare',
      level: 18,
      power: 623,
      abilities: ['Rock Throw', 'Stone Armor', 'Earthquake']
    },
    {
      id: '3',
      name: 'Tidecaller',
      element: 'Azur',
      rarity: 'Uncommon',
      level: 12,
      power: 345,
      abilities: ['Water Splash', 'Bubble Shield']
    },
    {
      id: '4',
      name: 'Stormrider',
      element: 'Tempest',
      rarity: 'Legendary',
      level: 30,
      power: 1245,
      abilities: ['Lightning Strike', 'Thunder Roar', 'Storm Fury', 'Hurricane']
    },
    {
      id: '5',
      name: 'Leafdancer',
      element: 'Vitae',
      rarity: 'Rare',
      level: 22,
      power: 712,
      abilities: ['Vine Whip', 'Photosynthesis', 'Nature\'s Blessing']
    },
    {
      id: '6',
      name: 'Skywhisper',
      element: 'Aeris',
      rarity: 'Epic',
      level: 27,
      power: 892,
      abilities: ['Wind Slash', 'Gust Shield', 'Tornado']
    },
    {
      id: '7',
      name: 'Emberkin',
      element: 'Ignis',
      rarity: 'Common',
      level: 8,
      power: 234,
      abilities: ['Spark', 'Heat Wave']
    },
    {
      id: '8',
      name: 'Aquaflow',
      element: 'Azur',
      rarity: 'Rare',
      level: 19,
      power: 667,
      abilities: ['Water Pulse', 'Tidal Wave', 'Healing Spring']
    },
  ]

  const elementColors = {
    'Ignis': '#FF6B6B',
    'Vitae': '#51CF66',
    'Azur': '#339AF0',
    'Geo': '#9775FA',
    'Tempest': '#FFD43B',
    'Aeris': '#74C0FC'
  }

  const rarityColors = {
    'Common': '#868E96',
    'Uncommon': '#51CF66',
    'Rare': '#339AF0',
    'Epic': '#9775FA',
    'Legendary': '#FFD43B'
  }

  const rarityOptions = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary']
  const elementOptions = ['all', 'ignis', 'vitae', 'azur', 'geo', 'tempest', 'aeris']

  const filteredPrimes = primes.filter(prime => {
    const matchesSearch = prime.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = filterRarity === 'all' || prime.rarity.toLowerCase() === filterRarity
    const matchesElement = filterElement === 'all' || prime.element.toLowerCase() === filterElement
    return matchesSearch && matchesRarity && matchesElement
  })

  // Check if any filters are active
  const hasActiveFilters = filterRarity !== 'all' || filterElement !== 'all'

  // RecyclerListView setup
  const dataProvider = new DataProvider((r1, r2) => r1.id !== r2.id).cloneWithRows(filteredPrimes)
  
  const layoutProvider = new LayoutProvider(
    () => 'PRIME_CARD',
    (type, dim) => {
      dim.width = cardWidth
      dim.height = cardWidth * 1.3 // Aspect ratio for card height
    }
  )

  const handlePrimePress = (prime: Prime) => {
    // TODO: Navigate to prime details modal/screen
    console.log('Prime selected:', prime.name)
  }

  const toggleSearchExpanded = () => {
    setIsSearchExpanded(!isSearchExpanded)
  }

  const renderPrimeCard = (type: string | number, prime: Prime, index: number) => {
    const rowIndex = Math.floor(index / cardsPerRow)
    const columnIndex = index % cardsPerRow
    
    // Calculate margins for proper spacing
    const marginLeft = columnIndex === 0 ? 0 : cardMargin / 2
    const marginRight = columnIndex === cardsPerRow - 1 ? 0 : cardMargin / 2
    const marginTop = rowIndex === 0 ? 0 : cardMargin

    return (
      <TouchableOpacity 
        style={[
          styles.primeCardTouchable,
          {
            marginLeft,
            marginRight,
            marginTop,
          }
        ]}
        onPress={() => handlePrimePress(prime)}
        activeOpacity={0.8}
      >
        <ModernCard 
          style={styles.primeCard} 
          variant="compact"
          noPadding
        >
          {/* Rarity Badge - Top Right Corner */}
          <View style={styles.rarityCorner}>
            <View style={[
              styles.rarityBadge,
              { backgroundColor: rarityColors[prime.rarity as keyof typeof rarityColors] }
            ]}>
              <Text variant="bodySmall" style={styles.rarityText}>
                {prime.rarity.charAt(0)}
              </Text>
            </View>
          </View>

          {/* Prime Image Container */}
          <View style={[
            styles.primeImageContainer,
            { backgroundColor: elementColors[prime.element as keyof typeof elementColors] + '20' }
          ]}>
            <ElementIcon 
              element={prime.element as ElementType} 
              size="large" 
            />
          </View>
          
          {/* Prime Info - Vertically Centered */}
          <View style={styles.primeInfo}>
            <View style={styles.nameElementRow}>
              <ElementIcon 
                element={prime.element as ElementType} 
                size="small" 
                style={styles.elementIconSmall}
              />
              <Text variant="bodySmall" style={styles.primeName} numberOfLines={1}>
                {prime.name}
              </Text>
            </View>
            
            <View style={styles.levelContainer}>
              <Text variant="bodySmall" style={styles.primeLevel}>
                Level {prime.level}
              </Text>
            </View>
          </View>
        </ModernCard>
      </TouchableOpacity>
    )
  }

  const renderFilterChip = (
    options: string[], 
    currentValue: string, 
    onValueChange: (value: string) => void,
    label: string
  ) => (
    <View style={styles.filterGroup}>
      <Text variant="bodySmall" style={styles.filterLabel}>{label}:</Text>
      <View style={styles.chipContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onValueChange(option)}
            style={styles.chipTouchable}
          >
            <Chip
              selected={currentValue === option}
              style={[
                styles.filterChip,
                currentValue === option && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                currentValue === option && styles.selectedChipText
              ]}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Chip>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Collapsible Search & Filter Section */}
      <GradientCard 
        gradientType="aurora" 
        style={styles.searchSection}
        size="small"
        elevation="light"
      >
        {/* Search Bar and Collection Stats Row */}
        <View style={styles.searchHeaderRow}>
          <View style={styles.searchBarContainer}>
            <Searchbar
              placeholder="Search Primes..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={colors.textSecondary}
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          
          <View style={styles.headerRightSection}>
            <View style={styles.collectionStats}>
              <Text variant="bodySmall" style={styles.collectionCount}>
                {filteredPrimes.length}/{primes.length}
              </Text>
              <Text variant="bodySmall" style={styles.collectionLabel}>
                Primes
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={toggleSearchExpanded}
              style={styles.expandButton}
            >
              <IconButton
                icon={isSearchExpanded ? "chevron-up" : "tune"}
                size={20}
                iconColor={hasActiveFilters ? colors.primary : colors.textSecondary}
                style={styles.expandIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Collapsible Filters */}
        {isSearchExpanded && (
          <View style={styles.filtersContainer}>
            {renderFilterChip(rarityOptions, filterRarity, setFilterRarity, "Rarity")}
            {renderFilterChip(elementOptions, filterElement, setFilterElement, "Element")}
          </View>
        )}
      </GradientCard>

      {/* Primes Grid with RecyclerListView */}
      <View style={styles.gridContainer}>
        <RecyclerListView
          dataProvider={dataProvider}
          layoutProvider={layoutProvider}
          rowRenderer={renderPrimeCard}
          style={styles.recyclerList}
          contentContainerStyle={styles.recyclerContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchSection: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchBarContainer: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  collectionStats: {
    alignItems: 'center',
    minWidth: 50,
  },
  collectionCount: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    fontSize: 13,
  },
  collectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  expandButton: {
    borderRadius: 20,
  },
  expandIcon: {
    margin: 0,
  },
  filtersContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface + '40',
  },
  filterGroup: {
    marginBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chipTouchable: {
    marginBottom: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.surface + '80',
    borderWidth: 1,
    borderColor: colors.surface,
  },
  selectedChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedChipText: {
    color: colors.surface,
    fontWeight: '600',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  recyclerList: {
    flex: 1,
  },
  recyclerContent: {
    paddingBottom: spacing.xl,
  },
  primeCardTouchable: {
    width: cardWidth,
  },
  primeCard: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  rarityCorner: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    zIndex: 1,
  },
  rarityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.surface,
  },
  primeImageContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: spacing.xs,
  },
  primeInfo: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  nameElementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  elementIconSmall: {
    marginRight: spacing.xs,
  },
  primeName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  levelContainer: {
    alignItems: 'center',
  },
  primeLevel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
}) 