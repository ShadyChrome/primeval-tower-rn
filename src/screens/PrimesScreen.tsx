import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { Text, Searchbar, Chip, IconButton } from 'react-native-paper'
import { RecyclerListView, DataProvider, LayoutProvider } from 'recyclerlistview'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ElementIcon, PrimeImage } from '../components/OptimizedImage'
import ModernCard from '../components/ui/ModernCard'
import GradientCard from '../components/ui/GradientCard'
import { PrimeService, UIPrime } from '../services/primeService'

import { colors, spacing, typography, shadows } from '../theme/designSystem'

// Use UIPrime interface from the service
type Prime = UIPrime

interface RowData {
  type: 'ROW'
  items: Prime[]
  index: number
}

type RootStackParamList = {
  MainTabs: undefined
  PrimeDetails: { 
    prime: Prime
    primesList: Prime[]
    currentIndex: number
  }
}

type PrimesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>

const screenWidth = Dimensions.get('window').width
const cardMargin = spacing.sm
const cardsPerRow = 2
const totalHorizontalPadding = spacing.lg * 2
const totalCardMargins = cardMargin * (cardsPerRow - 1)
const cardWidth = (screenWidth - totalHorizontalPadding - totalCardMargins) / cardsPerRow
const cardHeight = cardWidth * 1.3

export default function PrimesScreen() {
  const navigation = useNavigation<PrimesScreenNavigationProp>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterElement, setFilterElement] = useState('all')
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [primes, setPrimes] = useState<Prime[]>([])
  const [loading, setLoading] = useState(true)

  // Load Primes from database
  const loadPrimes = async () => {
    try {
      setLoading(true)
      const playerPrimes = await PrimeService.getPlayerPrimes()
      
      // If no Primes found, initialize starter Primes
      if (playerPrimes.length === 0) {
        const starterPrimes = await PrimeService.initializeStarterPrimes()
        setPrimes(starterPrimes)
      } else {
        setPrimes(playerPrimes)
      }
    } catch (error) {
      console.error('Error loading primes:', error)
      setPrimes([])
    } finally {
      setLoading(false)
    }
  }

  // Load Primes on component mount and when screen is focused
  useEffect(() => {
    loadPrimes()
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadPrimes()
    }, [])
  )



  const elementColors = {
    'Ignis': '#FF6B6B',
    'Vitae': '#51CF66',
    'Azur': '#339AF0',
    'Geo': '#9775FA',
    'Tempest': '#FFD43B',
    'Aeris': '#74C0FC'
  }

  const rarityColors = {
    'Common': '#ADB5BD',
    'Rare': '#74C0FC',
    'Epic': '#B197FC',
    'Legendary': '#FFCC8A',
    'Mythical': '#FFA8A8'
  }

  const rarityOptions = ['all', 'common', 'rare', 'epic', 'legendary', 'mythical']
  const elementOptions = ['all', 'ignis', 'vitae', 'azur', 'geo', 'tempest', 'aeris']

  const filteredPrimes = primes.filter(prime => {
    const matchesSearch = prime.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = filterRarity === 'all' || prime.rarity.toLowerCase() === filterRarity
    const matchesElement = filterElement === 'all' || prime.element.toLowerCase() === filterElement
    return matchesSearch && matchesRarity && matchesElement
  })

  // Check if any filters are active
  const hasActiveFilters = filterRarity !== 'all' || filterElement !== 'all'

  // Create rows of primes for proper spacing
  const createRows = (primes: Prime[]): RowData[] => {
    const rows: RowData[] = []
    for (let i = 0; i < primes.length; i += cardsPerRow) {
      rows.push({
        type: 'ROW',
        items: primes.slice(i, i + cardsPerRow),
        index: Math.floor(i / cardsPerRow)
      })
    }
    return rows
  }

  const rowData = createRows(filteredPrimes)

  // RecyclerListView setup
  const dataProvider = new DataProvider((r1, r2) => r1.index !== r2.index).cloneWithRows(rowData)
  
  const layoutProvider = new LayoutProvider(
    () => 'ROW',
    (type, dim) => {
      dim.width = screenWidth
      dim.height = cardHeight + cardMargin // Card height + bottom margin
    }
  )

  const handlePrimePress = (prime: Prime) => {
    const currentIndex = filteredPrimes.findIndex(p => p.id === prime.id)
    navigation.navigate('PrimeDetails', { 
      prime, 
      primesList: filteredPrimes,
      currentIndex 
    })
  }

  const toggleSearchExpanded = () => {
    setIsSearchExpanded(!isSearchExpanded)
  }

  const renderPrimeCard = (prime: Prime, isLast: boolean = false) => (
    <TouchableOpacity 
      key={prime.id}
      style={[
        styles.primeCardTouchable,
        !isLast && styles.cardMarginRight
      ]}
      onPress={() => handlePrimePress(prime)}
      activeOpacity={0.8}
    >
      <ModernCard 
        style={styles.primeCard} 
        variant="compact"
        noPadding
      >
        {/* Element Icon - Top Left Corner */}
        <View style={styles.elementCorner}>
          <View style={[
            styles.elementBadge
          ]}>
            <ElementIcon 
              element={prime.element} 
              size="medium"
            />
          </View>
        </View>

        {/* Rarity Badge - Top Right Corner */}
        <View style={styles.rarityCorner}>
          <View style={[
            styles.rarityBadge,
            { backgroundColor: rarityColors[prime.rarity] }
          ]}>
            <Text variant="bodySmall" style={styles.rarityText}>
              {prime.rarity.charAt(0)}
            </Text>
          </View>
        </View>

        {/* Prime Image Container */}
        <View style={[
          styles.primeImageContainer,
          { backgroundColor: elementColors[prime.element] + '20' }
        ]}>
          {prime.imageName ? (
            <PrimeImage 
              primeName={prime.imageName}
              width={cardWidth * 0.7}
              height={cardWidth * 0.7}
              style={styles.primeImage}
            />
          ) : (
            <ElementIcon 
              element={prime.element} 
              size="large" 
            />
          )}
        </View>
        
        {/* Prime Info - Vertically Centered */}
        <View style={styles.primeInfo}>
          <View style={styles.nameElementRow}>
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

  const renderRow = (type: string | number, rowData: RowData) => (
    <View style={styles.rowContainer}>
      <View style={styles.cardsRow}>
        {rowData.items.map((prime, index) => 
          renderPrimeCard(prime, index === rowData.items.length - 1)
        )}
        {/* Fill empty spaces with invisible placeholders for consistent spacing */}
        {Array.from({ length: cardsPerRow - rowData.items.length }).map((_, index) => (
          <View 
            key={`placeholder-${index}`} 
            style={[
              styles.primeCardTouchable,
              index < cardsPerRow - rowData.items.length - 1 && styles.cardMarginRight
            ]} 
          />
        ))}
      </View>
    </View>
  )

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

      {/* Primes Grid with RecyclerListView or Empty State */}
      <View style={styles.gridContainer}>
        {rowData.length > 0 ? (
          <RecyclerListView
            dataProvider={dataProvider}
            layoutProvider={layoutProvider}
            rowRenderer={renderRow}
            style={styles.recyclerList}
            contentContainerStyle={styles.recyclerContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateContent}>
              <Text variant="headlineSmall" style={styles.emptyStateTitle}>
                No Primes Found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyStateMessage}>
                {hasActiveFilters 
                  ? "Try adjusting your filters to find more Primes."
                  : searchQuery 
                    ? `No Primes match "${searchQuery}".`
                    : "No Primes available."
                }
              </Text>
              {hasActiveFilters && (
                <View style={styles.resetFiltersContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      setFilterRarity('all')
                      setFilterElement('all')
                      setSearchQuery('')
                    }}
                    style={styles.resetButton}
                  >
                    <Text variant="bodyMedium" style={styles.resetButtonText}>
                      Reset Filters
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
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
    borderRadius: 10,
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
    minWidth: 45,
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
    borderRadius: 16,
    width: 32,
    height: 32,
  },
  expandIcon: {
    margin: 0,
    width: 32,
    height: 32,
  },
  filtersContainer: {
    marginTop: spacing.sm,
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
  },
  recyclerList: {
    flex: 1,
  },
  recyclerContent: {
    paddingBottom: spacing.xl,
  },
  rowContainer: {
    width: '100%',
    marginBottom: cardMargin,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  primeCardTouchable: {
    width: cardWidth,
    height: cardHeight,
  },
  cardMarginRight: {
    marginRight: cardMargin,
  },
  primeCard: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  elementCorner: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 1,
  },
  elementBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.light,
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
  primeImage: {
    borderRadius: 8,
  },
  primeInfo: {
    flex: 0.5,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  nameElementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },

  primeName: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  levelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primeLevel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...typography.heading,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  emptyStateMessage: {
    ...typography.body,
    textAlign: 'center' as 'center',
    marginBottom: spacing.md,
  },
  resetFiltersContainer: {
    marginTop: spacing.sm,
  },
  resetButton: {
    padding: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  resetButtonText: {
    ...typography.button,
    color: colors.surface,
  },
}) 