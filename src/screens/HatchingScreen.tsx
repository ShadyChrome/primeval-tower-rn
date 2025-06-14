import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, shadows, typography } from '../theme/designSystem'

export default function HatchingScreen() {
  const [selectedEgg, setSelectedEgg] = useState<string | null>(null)

  const eggTypes = [
    { 
      id: 'common', 
      name: 'Common Egg', 
      cost: 100, 
      rarity: 'Common', 
      color: '#ADB5BD',      // Soft Gray
      bgColor: '#F8F9FA'
    },
    { 
      id: 'rare', 
      name: 'Rare Egg', 
      cost: 250, 
      rarity: 'Rare', 
      color: '#74C0FC',      // Pastel Blue
      bgColor: '#E7F5FF'
    },
    { 
      id: 'epic', 
      name: 'Epic Egg', 
      cost: 500, 
      rarity: 'Epic', 
      color: '#B197FC',      // Lavender Purple
      bgColor: '#F3F0FF'
    },
    { 
      id: 'legendary', 
      name: 'Legendary Egg', 
      cost: 1000, 
      rarity: 'Legendary', 
      color: '#FFCC8A',      // Warm Peach
      bgColor: '#FFF4E6'
    },
    { 
      id: 'mythical', 
      name: 'Mythical Egg', 
      cost: 2500, 
      rarity: 'Mythical', 
      color: '#FFA8A8',      // Soft Coral
      bgColor: '#FFE8E8'
    },
  ]

  const selectedEggData = eggTypes.find(egg => egg.id === selectedEgg)

  const renderEggCard = (egg: typeof eggTypes[0]) => {
    const isSelected = selectedEgg === egg.id
    
    return (
      <TouchableOpacity
        key={egg.id}
        style={[
          styles.eggCard,
          isSelected && { borderColor: egg.color, borderWidth: 3 }
        ]}
        onPress={() => setSelectedEgg(egg.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.eggIconContainer, { backgroundColor: egg.bgColor }]}>
          <View style={[styles.eggIcon, { backgroundColor: egg.color }]} />
        </View>
        
        <Text variant="titleMedium" style={styles.eggName}>
          {egg.name.replace(' Egg', '')}
        </Text>
        <Text variant="titleMedium" style={styles.eggType}>
          Egg
        </Text>
        <Text variant="bodySmall" style={[styles.eggRarity, { color: egg.color }]}>
          {egg.rarity}
        </Text>
        
        <View style={styles.eggCostContainer}>
          <MaterialCommunityIcons 
            name="diamond" 
            size={16} 
            color="#4CAF50" 
          />
          <Text variant="titleMedium" style={styles.eggCost}>
            {egg.cost}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.title}>
          Choose an Egg
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          Select an egg to hatch a new Prime. Higher rarity eggs have better chances for powerful Primes.
        </Text>
      </View>

      {/* Egg Grid */}
      <View style={styles.eggGrid}>
        <View style={styles.eggRow}>
          {renderEggCard(eggTypes[0])}
          {renderEggCard(eggTypes[1])}
          {renderEggCard(eggTypes[2])}
        </View>
        <View style={styles.eggRow}>
          {renderEggCard(eggTypes[3])}
          {renderEggCard(eggTypes[4])}
        </View>
      </View>

      {/* Hatch Button */}
      {selectedEgg && (
        <Surface style={styles.hatchSection} elevation={2}>
          <TouchableOpacity 
            style={[styles.hatchButton, { backgroundColor: selectedEggData?.color }]}
            activeOpacity={0.8}
          >
            <Text variant="titleLarge" style={styles.hatchButtonText}>
              Hatch Egg
            </Text>
            <View style={styles.hatchCostContainer}>
              <MaterialCommunityIcons 
                name="diamond" 
                size={20} 
                color="white" 
              />
              <Text variant="titleLarge" style={styles.hatchCostText}>
                {selectedEggData?.cost}
              </Text>
            </View>
          </TouchableOpacity>
        </Surface>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
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
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    minWidth: 100,
    flex: 1,
    maxWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.light,
  },
  eggIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  eggIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  eggName: {
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  eggType: {
    fontWeight: '400',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  eggRarity: {
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  eggCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eggCost: {
    fontWeight: '700',
    color: '#4CAF50',
  },
  hatchSection: {
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.lg,
  },
  hatchButton: {
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hatchButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  hatchCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hatchCostText: {
    color: 'white',
    fontWeight: '700',
  },
}) 