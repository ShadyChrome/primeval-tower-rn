import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Chip, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function HatchingScreen() {
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null)
  const [selectedEnhancers, setSelectedEnhancers] = useState<string[]>([])

  const eggTypes = [
    { id: 'common', name: 'Common Egg', cost: 100, rarity: 'Common', color: '#ADB5BD' },
    { id: 'rare', name: 'Rare Egg', cost: 250, rarity: 'Rare', color: '#74C0FC' },
    { id: 'epic', name: 'Epic Egg', cost: 500, rarity: 'Epic', color: '#B197FC' },
    { id: 'legendary', name: 'Legendary Egg', cost: 1000, rarity: 'Legendary', color: '#FFCC8A' },
    { id: 'mythical', name: 'Mythical Egg', cost: 2500, rarity: 'Mythical', color: '#FFA8A8' },
  ]

  const enhancers = [
    { id: 'element_ignis', name: 'Ignis Enhancer', cost: 50, type: 'Element', description: '+1% Ignis chance' },
    { id: 'element_vitae', name: 'Vitae Enhancer', cost: 50, type: 'Element', description: '+1% Vitae chance' },
    { id: 'element_azur', name: 'Azur Enhancer', cost: 50, type: 'Element', description: '+1% Azur chance' },
    { id: 'rarity_amplifier', name: 'Rarity Amplifier', cost: 100, type: 'Rarity', description: '+1% higher rarity chance' },
    { id: 'rainbow_enhancer', name: 'Rainbow Enhancer', cost: 200, type: 'Rainbow', description: 'Better odds across all rarities' },
  ]

  const selectedEggData = eggTypes.find(egg => egg.id === selectedEgg)
  const totalCost = (selectedEggData?.cost || 0) + 
    selectedEnhancers.reduce((total, enhancerId) => {
      const enhancer = enhancers.find(e => e.id === enhancerId)
      return total + (enhancer?.cost || 0)
    }, 0)

  const toggleEnhancer = (enhancerId: string) => {
    setSelectedEnhancers(prev => 
      prev.includes(enhancerId) 
        ? prev.filter(id => id !== enhancerId)
        : [...prev, enhancerId]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Choose an Egg
        </Text>
        <Text variant="bodyMedium" style={styles.sectionDescription}>
          Select an egg to hatch a new Prime. Higher rarity eggs have better chances for powerful Primes.
        </Text>
        
        <View style={styles.eggGrid}>
          {eggTypes.map((egg) => (
            <Card 
              key={egg.id}
              style={[
                styles.eggCard,
                selectedEgg === egg.id && styles.selectedEggCard,
                { borderColor: egg.color }
              ]}
              onPress={() => setSelectedEgg(egg.id)}
            >
              <Card.Content style={styles.eggCardContent}>
                <View style={[styles.eggIcon, { backgroundColor: egg.color }]}>
                  <Text style={styles.eggEmoji}>🥚</Text>
                </View>
                <Text variant="titleMedium" style={styles.eggName}>
                  {egg.name}
                </Text>
                <Text variant="bodySmall" style={styles.eggRarity}>
                  {egg.rarity}
                </Text>
                <View style={styles.eggCostContainer}>
                  <MaterialCommunityIcons 
                    name="diamond" 
                    size={14} 
                    color="#A0C49D" 
                  />
                  <Text variant="titleSmall" style={styles.eggCost}>
                    {egg.cost}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {selectedEgg && (
        <View style={styles.section}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Enhancers (Optional)
          </Text>
          <Text variant="bodyMedium" style={styles.sectionDescription}>
            Apply enhancers to improve your hatching chances.
          </Text>
          
          <View style={styles.enhancerList}>
            {enhancers.map((enhancer) => (
              <Card 
                key={enhancer.id}
                style={[
                  styles.enhancerCard,
                  selectedEnhancers.includes(enhancer.id) && styles.selectedEnhancerCard
                ]}
                onPress={() => toggleEnhancer(enhancer.id)}
              >
                <Card.Content style={styles.enhancerContent}>
                  <View style={styles.enhancerInfo}>
                    <Text variant="titleMedium" style={styles.enhancerName}>
                      {enhancer.name}
                    </Text>
                    <Text variant="bodySmall" style={styles.enhancerDescription}>
                      {enhancer.description}
                    </Text>
                  </View>
                  <Chip 
                    style={[
                      styles.enhancerCost,
                      selectedEnhancers.includes(enhancer.id) && styles.selectedEnhancerCost
                    ]}
                  >
                    <View style={styles.enhancerCostContent}>
                      <MaterialCommunityIcons 
                        name="diamond" 
                        size={12} 
                        color={selectedEnhancers.includes(enhancer.id) ? "white" : "#666666"} 
                      />
                      <Text style={[styles.enhancerCostText, {
                        color: selectedEnhancers.includes(enhancer.id) ? "white" : "#666666"
                      }]}>
                        {enhancer.cost}
                      </Text>
                    </View>
                  </Chip>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      )}

      {selectedEgg && (
        <Surface style={styles.hatchSection} elevation={3}>
          <View style={styles.totalCostContainer}>
            <Text variant="titleMedium" style={styles.totalCostLabel}>
              Total Cost:
            </Text>
            <View style={styles.totalCostContent}>
              <MaterialCommunityIcons 
                name="diamond" 
                size={24} 
                color="#A0C49D" 
              />
              <Text variant="headlineSmall" style={styles.totalCostValue}>
                {totalCost.toLocaleString()}
              </Text>
            </View>
          </View>
          
          <Button 
            mode="contained" 
            style={styles.hatchButton}
            contentStyle={styles.hatchButtonContent}
          >
            Hatch Egg
          </Button>
        </Surface>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#666666',
    marginBottom: 16,
  },
  eggGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  eggCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedEggCard: {
    borderWidth: 2,
  },
  eggCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  eggIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eggEmoji: {
    fontSize: 24,
  },
  eggName: {
    textAlign: 'center',
    marginBottom: 4,
    color: '#333333',
  },
  eggRarity: {
    textAlign: 'center',
    color: '#666666',
    marginBottom: 8,
  },
  eggCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eggCost: {
    fontWeight: '600',
    color: '#A0C49D',
  },
  enhancerList: {
    gap: 8,
  },
  enhancerCard: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedEnhancerCard: {
    borderColor: '#A0C49D',
    backgroundColor: '#F0F7ED',
  },
  enhancerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  enhancerInfo: {
    flex: 1,
  },
  enhancerName: {
    color: '#333333',
    marginBottom: 4,
  },
  enhancerDescription: {
    color: '#666666',
  },
  enhancerCost: {
    backgroundColor: '#E0E0E0',
  },
  selectedEnhancerCost: {
    backgroundColor: '#A0C49D',
  },
  enhancerCostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enhancerCostText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hatchSection: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  totalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalCostLabel: {
    color: '#333333',
  },
  totalCostValue: {
    fontWeight: '700',
    color: '#A0C49D',
  },
  hatchButton: {
    backgroundColor: '#A0C49D',
  },
  hatchButtonContent: {
    paddingVertical: 12,
  },
  totalCostContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}) 