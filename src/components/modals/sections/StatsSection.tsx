import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import StatBar from '../components/StatBar'
import { ElementType } from '../../../assets/ImageAssets'
import { colors, spacing } from '../../../theme/designSystem'

interface Prime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  power: number
  abilities: string[]
}

interface StatsSectionProps {
  prime: Prime
  primaryColor: string
}

// Calculate base stats from power and level (simplified stat system)
const calculateStats = (prime: Prime) => {
  const basePower = prime.power
  const level = prime.level
  
  // Base stat distribution varies by element
  const elementModifiers = {
    Ignis: { attack: 1.3, defense: 0.9, speed: 1.0, stamina: 1.1, courage: 1.2, precision: 0.8 },
    Azur: { attack: 1.0, defense: 1.2, speed: 1.1, stamina: 1.0, courage: 0.9, precision: 1.3 },
    Vitae: { attack: 0.9, defense: 1.1, speed: 0.8, stamina: 1.3, courage: 1.0, precision: 1.1 },
    Geo: { attack: 1.1, defense: 1.4, speed: 0.7, stamina: 1.2, courage: 1.1, precision: 0.9 },
    Tempest: { attack: 1.2, defense: 0.8, speed: 1.4, stamina: 0.9, precision: 1.2, courage: 1.0 },
    Aeris: { attack: 1.0, defense: 0.9, speed: 1.3, stamina: 1.0, courage: 0.8, precision: 1.4 },
  }
  
  const modifier = elementModifiers[prime.element]
  const baseStatValue = basePower * 0.4 // Base conversion from power to individual stats
  
  return {
    // Visible Stats
    attack: Math.floor(baseStatValue * modifier.attack),
    defense: Math.floor(baseStatValue * modifier.defense),
    speed: Math.floor(baseStatValue * modifier.speed),
    stamina: Math.floor(baseStatValue * modifier.stamina),
    courage: Math.floor(baseStatValue * modifier.courage),
    precision: Math.floor(baseStatValue * modifier.precision),
    
    // Calculated Hidden Stats
    health: Math.floor(baseStatValue * modifier.defense * 2.5 + level * 10),
    criticalChance: Math.min(Math.floor(baseStatValue * modifier.precision * 0.1), 25), // Max 25%
    criticalDamage: Math.floor(150 + baseStatValue * modifier.precision * 0.05), // Base 150%
    threat: Math.floor(baseStatValue * modifier.courage * 0.8),
    statusChance: Math.floor(baseStatValue * modifier.precision * 0.08),
    statusDamage: Math.floor(baseStatValue * modifier.attack * 0.6),
  }
}

// Rarity-based max stats for bar visualization
const getMaxStatForRarity = (rarity: string) => {
  const maxValues = {
    Common: 300,
    Rare: 500,
    Epic: 800,
    Legendary: 1200,
    Mythical: 1800,
  }
  return maxValues[rarity as keyof typeof maxValues] || 300
}

export default function StatsSection({ prime, primaryColor }: StatsSectionProps) {
  const stats = calculateStats(prime)
  const maxStat = getMaxStatForRarity(prime.rarity)
  
  // For now, no rune bonuses - will be added in Phase 3
  const runeBonus = {
    attack: 0,
    defense: 0,
    speed: 0,
    stamina: 0,
    courage: 0,
    precision: 0,
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Combat Stats
      </Text>
      
      {/* Primary Stats */}
      <View style={styles.statsGroup}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          Primary Attributes
        </Text>
        
        <StatBar
          label="Attack"
          value={stats.attack}
          maxValue={maxStat}
          color={colors.accent}
          bonus={runeBonus.attack}
        />
        
        <StatBar
          label="Defense"
          value={stats.defense}
          maxValue={maxStat}
          color={colors.secondary}
          bonus={runeBonus.defense}
        />
        
        <StatBar
          label="Speed"
          value={stats.speed}
          maxValue={maxStat}
          color={primaryColor}
          bonus={runeBonus.speed}
        />
        
        <StatBar
          label="Stamina"
          value={stats.stamina}
          maxValue={maxStat}
          color={colors.pastelMint}
          bonus={runeBonus.stamina}
        />
        
        <StatBar
          label="Courage"
          value={stats.courage}
          maxValue={maxStat}
          color={colors.pastelPeach}
          bonus={runeBonus.courage}
        />
        
        <StatBar
          label="Precision"
          value={stats.precision}
          maxValue={maxStat}
          color={colors.pastelLavender}
          bonus={runeBonus.precision}
        />
      </View>

      {/* Derived Stats */}
      <View style={styles.statsGroup}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          Combat Performance
        </Text>
        
        <View style={styles.derivedStatsGrid}>
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Health</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.secondary }]}>
              {stats.health}
            </Text>
          </View>
          
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Crit Chance</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.accent }]}>
              {stats.criticalChance}%
            </Text>
          </View>
          
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Crit Damage</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.accent }]}>
              {stats.criticalDamage}%
            </Text>
          </View>
          
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Threat</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.pastelPeach }]}>
              {stats.threat}
            </Text>
          </View>
          
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Status Chance</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.pastelLavender }]}>
              {stats.statusChance}%
            </Text>
          </View>
          
          <View style={styles.derivedStat}>
            <Text variant="bodyMedium" style={styles.derivedStatLabel}>Status Power</Text>
            <Text variant="titleMedium" style={[styles.derivedStatValue, { color: colors.pastelMint }]}>
              {stats.statusDamage}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Power Summary */}
      <View style={styles.powerSummary}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          Overall Power
        </Text>
        <Text variant="headlineMedium" style={[styles.powerValue, { color: primaryColor }]}>
          {prime.power}
        </Text>
        <Text variant="bodySmall" style={styles.powerLabel}>
          Combat Rating
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  statsGroup: {
    marginBottom: spacing.xl,
  },
  groupTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  derivedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  derivedStat: {
    width: '48%',
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  derivedStatLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  derivedStatValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  powerSummary: {
    backgroundColor: colors.surfaceVariant,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  powerValue: {
    fontWeight: '700',
    fontSize: 32,
    marginVertical: spacing.xs,
  },
  powerLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
}) 