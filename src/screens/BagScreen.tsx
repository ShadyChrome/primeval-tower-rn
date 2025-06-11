import React, { useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Text, Card, SegmentedButtons, Surface, Chip } from 'react-native-paper'
import { mockRunes, getRunesByFilter, getRuneCountByTier } from '../data/mockRunes'

interface Rune {
  id: string
  name: string
  type: string
  rarity: string
  primaryStat: string
  synergy: string
  level: number
  equipped: boolean
}

interface Item {
  id: string
  name: string
  type: string
  quantity: number
  description: string
}

export default function BagScreen() {
  const [activeTab, setActiveTab] = useState('runes')
  const [runeStatFilter, setRuneStatFilter] = useState('all')
  const [runeTierFilter, setRuneTierFilter] = useState('all')

  // Helper function to check if rune affects a specific stat
  const runeAffectsStat = (rune: any, stat: string): boolean => {
    if (!rune.stat_bonuses || typeof rune.stat_bonuses !== 'object') return false
    
    const bonuses = rune.stat_bonuses as Record<string, any>
    
    switch (stat) {
      case 'attack':
        return bonuses.attack > 0 || bonuses.criticalRate > 0 || bonuses.criticalDamage > 0
      case 'defense':
        return bonuses.defense > 0 || bonuses.health > 0 || bonuses.resistance > 0
      case 'speed':
        return bonuses.speed > 0
      case 'courage':
        return bonuses.courage > 0 || bonuses.extraTurn > 0 || bonuses.criticalDamage > 0
      case 'precision':
        return bonuses.precision > 0 || bonuses.accuracy > 0 || bonuses.criticalRate > 0
      case 'stamina':
        return bonuses.stamina > 0 || bonuses.health > 0 || bonuses.endurance > 0
      default:
        return true
    }
  }

  // Use mock rune data with stat-based filtering
  const allRunes = mockRunes
  const filteredRunes = allRunes.filter(rune => {
    // Filter by tier
    if (runeTierFilter !== 'all' && rune.rune_tier !== runeTierFilter) return false
    
    // Filter by stat
    if (runeStatFilter !== 'all' && !runeAffectsStat(rune, runeStatFilter)) return false
    
    return true
  })
  const runeCounts = getRuneCountByTier(allRunes)

  // Mock data for items
  const items: Item[] = [
    {
      id: '1',
      name: 'Element Enhancer (Ignis)',
      type: 'Enhancer',
      quantity: 3,
      description: 'Increases chance of hatching Ignis Primes'
    },
    {
      id: '2',
      name: 'Rarity Amplifier',
      type: 'Enhancer',
      quantity: 5,
      description: 'Increases chance of higher rarity hatch'
    },
    {
      id: '3',
      name: 'XP Potion',
      type: 'Consumable',
      quantity: 12,
      description: 'Grants experience to Primes'
    },
    {
      id: '4',
      name: 'Ability Scroll',
      type: 'Consumable',
      quantity: 7,
      description: 'Upgrades Prime abilities'
    },
  ]

  const rarityColors = {
    'Common': '#ADB5BD',
    'Rare': '#74C0FC',
    'Epic': '#B197FC',
    'Legendary': '#FFCC8A',
    'Mythical': '#FFA8A8'
  }

  const getRuneDisplayName = (rune: any) => {
    return `${rune.rune_type.charAt(0).toUpperCase() + rune.rune_type.slice(1)} Rune`
  }

  const getRuneMainStat = (rune: any) => {
    if (!rune.stat_bonuses || typeof rune.stat_bonuses !== 'object') return 'Unknown'
    
    const bonuses = rune.stat_bonuses as Record<string, any>
    const mainStats = ['attack', 'defense', 'speed', 'health', 'criticalRate', 'criticalDamage']
    
    for (const stat of mainStats) {
      if (bonuses[stat]) {
        const value = bonuses[stat]
        const suffix = stat.includes('Rate') || stat.includes('Damage') ? '%' : ''
        return `${stat.toUpperCase()}: +${value}${suffix}`
      }
    }
    
    return 'Utility Rune'
  }

  const renderRuneCard = ({ item: rune }: { item: any }) => (
    <Card style={[styles.itemCard, rune.is_equipped && styles.equippedCard]}>
      <Card.Content style={styles.itemCardContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={styles.itemName}>
              {getRuneDisplayName(rune)}
            </Text>
            <Text variant="bodySmall" style={styles.itemType}>
              Level +{rune.rune_level} • {rune.rune_tier?.charAt(0).toUpperCase() + rune.rune_tier?.slice(1)}
            </Text>
          </View>
          {rune.is_equipped && (
            <Chip style={styles.equippedChip} textStyle={styles.equippedText}>
              Equipped
            </Chip>
          )}
        </View>
        
        <View style={styles.runeStats}>
          <View style={styles.statRow}>
            <Text variant="bodyMedium" style={styles.statLabel}>Primary:</Text>
            <Text variant="bodyMedium" style={styles.statValue}>{getRuneMainStat(rune)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="bodyMedium" style={styles.statLabel}>Synergy:</Text>
            <Text variant="bodyMedium" style={styles.statValue}>
              {rune.stat_bonuses?.synergy || 'None'}
            </Text>
          </View>
        </View>
        
        <Chip 
          style={[styles.rarityChip, { backgroundColor: rarityColors[rune.rune_tier as keyof typeof rarityColors] }]}
          textStyle={styles.rarityText}
        >
          {rune.rune_tier?.charAt(0).toUpperCase() + rune.rune_tier?.slice(1)}
        </Chip>
      </Card.Content>
    </Card>
  )

  const renderItemCard = ({ item }: { item: Item }) => (
    <Card style={styles.itemCard}>
      <Card.Content style={styles.itemCardContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={styles.itemName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.itemType}>
              {item.type}
            </Text>
          </View>
          <View style={styles.quantityContainer}>
            <Text variant="headlineSmall" style={styles.quantity}>
              {item.quantity}
            </Text>
          </View>
        </View>
        
        <Text variant="bodyMedium" style={styles.itemDescription}>
          {item.description}
        </Text>
      </Card.Content>
    </Card>
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
        <Text variant="titleMedium" style={styles.tabStats}>
          {activeTab === 'runes' 
            ? `Runes: ${filteredRunes.length} (${allRunes.filter(r => r.is_equipped).length} equipped)`
            : `Items: ${items.reduce((total, item) => total + item.quantity, 0)} total`
          }
        </Text>
        
        {activeTab === 'runes' && (
          <View style={styles.filterSection}>
            <View style={styles.filterRow}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Stat:</Text>
              <View style={styles.filterChips}>
                {['all', 'attack', 'defense', 'speed', 'courage', 'precision', 'stamina'].map(stat => (
                  <Chip
                    key={stat}
                    selected={runeStatFilter === stat}
                    onPress={() => setRuneStatFilter(stat)}
                    style={styles.filterChip}
                    textStyle={styles.filterChipText}
                  >
                    {stat.charAt(0).toUpperCase() + stat.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.filterRow}>
              <Text variant="bodyMedium" style={styles.filterLabel}>Tier:</Text>
              <View style={styles.filterChips}>
                {['all', 'common', 'rare', 'epic', 'legendary', 'mythical'].map(tier => (
                  <Chip
                    key={tier}
                    selected={runeTierFilter === tier}
                    onPress={() => setRuneTierFilter(tier)}
                    style={styles.filterChip}
                    textStyle={styles.filterChipText}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {activeTab === 'runes' ? (
        <FlatList
          data={filteredRunes}
          renderItem={renderRuneCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItemCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  headerSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  screenTitle: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 16,
  },
  tabSelector: {
    backgroundColor: '#F5F5F5',
  },
  statsBar: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabStats: {
    color: '#333333',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  equippedCard: {
    borderWidth: 2,
    borderColor: '#A0C49D',
    backgroundColor: '#F0F7ED',
  },
  itemCardContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  itemType: {
    color: '#666666',
  },
  equippedChip: {
    backgroundColor: '#A0C49D',
  },
  equippedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  runeStats: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666666',
  },
  statValue: {
    color: '#333333',
    fontWeight: '600',
  },
  rarityChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
  },
  rarityText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A0C49D',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  quantity: {
    color: 'white',
    fontWeight: '700',
  },
  itemDescription: {
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  filterSection: {
    paddingTop: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666666',
  },
}) 