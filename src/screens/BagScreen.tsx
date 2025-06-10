import React, { useState } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'
import { Text, Card, SegmentedButtons, Surface, Chip } from 'react-native-paper'

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

  // Mock data for runes
  const runes: Rune[] = [
    {
      id: '1',
      name: 'Flaming Essence',
      type: 'Offensive',
      rarity: 'Epic',
      primaryStat: 'ATK +15%',
      synergy: 'Ignition',
      level: 8,
      equipped: true
    },
    {
      id: '2',
      name: 'Stone Wall',
      type: 'Defensive',
      rarity: 'Rare',
      primaryStat: 'DEF +12%',
      synergy: 'Fortress',
      level: 5,
      equipped: false
    },
    {
      id: '3',
      name: 'Swift Current',
      type: 'Speed',
      rarity: 'Common',
      primaryStat: 'SPD +8%',
      synergy: 'Flow',
      level: 3,
      equipped: true
    },
    {
      id: '4',
      name: 'Thunder Core',
      type: 'Offensive',
      rarity: 'Legendary',
      primaryStat: 'ATK +20%',
      synergy: 'Storm',
      level: 12,
      equipped: false
    },
  ]

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

  const renderRuneCard = ({ item: rune }: { item: Rune }) => (
    <Card style={[styles.itemCard, rune.equipped && styles.equippedCard]}>
      <Card.Content style={styles.itemCardContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text variant="titleMedium" style={styles.itemName}>
              {rune.name}
            </Text>
            <Text variant="bodySmall" style={styles.itemType}>
              {rune.type} Rune • Level {rune.level}
            </Text>
          </View>
          {rune.equipped && (
            <Chip style={styles.equippedChip} textStyle={styles.equippedText}>
              Equipped
            </Chip>
          )}
        </View>
        
        <View style={styles.runeStats}>
          <View style={styles.statRow}>
            <Text variant="bodyMedium" style={styles.statLabel}>Primary:</Text>
            <Text variant="bodyMedium" style={styles.statValue}>{rune.primaryStat}</Text>
          </View>
          <View style={styles.statRow}>
            <Text variant="bodyMedium" style={styles.statLabel}>Synergy:</Text>
            <Text variant="bodyMedium" style={styles.statValue}>{rune.synergy}</Text>
          </View>
        </View>
        
        <Chip 
          style={[styles.rarityChip, { backgroundColor: rarityColors[rune.rarity as keyof typeof rarityColors] }]}
          textStyle={styles.rarityText}
        >
          {rune.rarity}
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
            ? `Runes: ${runes.length} (${runes.filter(r => r.equipped).length} equipped)`
            : `Items: ${items.reduce((total, item) => total + item.quantity, 0)} total`
          }
        </Text>
      </View>

      {activeTab === 'runes' ? (
        <FlatList
          data={runes}
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
}) 