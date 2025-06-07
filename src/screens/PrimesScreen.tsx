import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList } from 'react-native'
import { Text, Card, Chip, Searchbar, SegmentedButtons, Surface } from 'react-native-paper'

interface Prime {
  id: string
  name: string
  element: string
  rarity: string
  level: number
  power: number
  abilities: string[]
}

export default function PrimesScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterElement, setFilterElement] = useState('all')

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
  ]

  const elementColors = {
    'Ignis': '#E74C3C',
    'Vitae': '#27AE60',
    'Azur': '#3498DB',
    'Geo': '#8E44AD',
    'Tempest': '#F39C12',
    'Aeris': '#95A5A6'
  }

  const rarityColors = {
    'Common': '#95A5A6',
    'Uncommon': '#27AE60',
    'Rare': '#3498DB',
    'Epic': '#9B59B6',
    'Legendary': '#F39C12'
  }

  const filteredPrimes = primes.filter(prime => {
    const matchesSearch = prime.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = filterRarity === 'all' || prime.rarity.toLowerCase() === filterRarity
    const matchesElement = filterElement === 'all' || prime.element.toLowerCase() === filterElement
    return matchesSearch && matchesRarity && matchesElement
  })

  const renderPrimeCard = ({ item: prime }: { item: Prime }) => (
    <Card style={styles.primeCard}>
      <Card.Content style={styles.primeCardContent}>
        <View style={styles.primeHeader}>
          <View style={styles.primeInfo}>
            <Text variant="titleLarge" style={styles.primeName}>
              {prime.name}
            </Text>
            <Text variant="bodyMedium" style={styles.primeLevel}>
              Level {prime.level}
            </Text>
          </View>
          <View style={styles.primeStats}>
            <Text variant="headlineSmall" style={styles.primePower}>
              {prime.power}
            </Text>
            <Text variant="bodySmall" style={styles.powerLabel}>
              Power
            </Text>
          </View>
        </View>
        
        <View style={styles.primeAttributes}>
          <Chip 
            style={[styles.elementChip, { backgroundColor: elementColors[prime.element as keyof typeof elementColors] }]}
            textStyle={styles.chipText}
          >
            {prime.element}
          </Chip>
          <Chip 
            style={[styles.rarityChip, { backgroundColor: rarityColors[prime.rarity as keyof typeof rarityColors] }]}
            textStyle={styles.chipText}
          >
            {prime.rarity}
          </Chip>
        </View>
        
        <View style={styles.abilitiesSection}>
          <Text variant="bodySmall" style={styles.abilitiesLabel}>
            Abilities:
          </Text>
          <View style={styles.abilitiesList}>
            {prime.abilities.map((ability, index) => (
              <Chip key={index} style={styles.abilityChip} textStyle={styles.abilityText}>
                {ability}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <Surface style={styles.filterSection} elevation={1}>
        <Searchbar
          placeholder="Search Primes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <Text variant="bodySmall" style={styles.filterLabel}>Rarity:</Text>
            <SegmentedButtons
              value={filterRarity}
              onValueChange={setFilterRarity}
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'rare', label: 'Rare+' },
                { value: 'legendary', label: 'Legendary' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          <View style={styles.filterGroup}>
            <Text variant="bodySmall" style={styles.filterLabel}>Element:</Text>
            <SegmentedButtons
              value={filterElement}
              onValueChange={setFilterElement}
              buttons={[
                { value: 'all', label: 'All' },
                { value: 'ignis', label: 'Ignis' },
                { value: 'vitae', label: 'Vitae' },
                { value: 'azur', label: 'Azur' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>
        </View>
      </Surface>

      <View style={styles.statsBar}>
        <Text variant="titleMedium" style={styles.collectionStats}>
          Collection: {filteredPrimes.length}/{primes.length} Primes
        </Text>
      </View>

      <FlatList
        data={filteredPrimes}
        renderItem={renderPrimeCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  filterSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  filtersRow: {
    gap: 16,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    marginBottom: 8,
    color: '#666666',
    fontWeight: '500',
  },
  segmentedButtons: {
    backgroundColor: '#F5F5F5',
  },
  statsBar: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  collectionStats: {
    color: '#333333',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  primeCard: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  primeCardContent: {
    padding: 16,
  },
  primeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  primeInfo: {
    flex: 1,
  },
  primeName: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  primeLevel: {
    color: '#666666',
  },
  primeStats: {
    alignItems: 'flex-end',
  },
  primePower: {
    fontWeight: '700',
    color: '#A0C49D',
  },
  powerLabel: {
    color: '#666666',
    marginTop: 2,
  },
  primeAttributes: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  elementChip: {
    borderRadius: 16,
  },
  rarityChip: {
    borderRadius: 16,
  },
  chipText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  abilitiesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  abilitiesLabel: {
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  abilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  abilityChip: {
    backgroundColor: '#F0F7ED',
    borderRadius: 12,
  },
  abilityText: {
    color: '#A0C49D',
    fontSize: 11,
    fontWeight: '500',
  },
}) 