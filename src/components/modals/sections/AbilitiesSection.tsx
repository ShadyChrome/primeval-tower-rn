import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import AnimatedAbilityCard from '../components/AnimatedAbilityCard'
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

interface PrimeAbility {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  power: number
  staminaCost: number
  cooldown: number
  statusEffects: string[]
  elementalDamage: boolean
}

interface AbilitiesSectionProps {
  prime: Prime
  primaryColor: string
}

// Generate detailed ability data from basic ability names
const generateAbilityData = (prime: Prime): PrimeAbility[] => {
  const abilityTemplates: { [key: string]: Partial<PrimeAbility> } = {
    // Ignis abilities
    'Fire Blast': {
      description: 'Unleashes a concentrated blast of fire energy dealing high damage.',
      power: 120,
      staminaCost: 25,
      cooldown: 3,
      statusEffects: ['Burn'],
      elementalDamage: true,
    },
    'Aerial Claw': {
      description: 'Swift aerial attack with razor-sharp claws.',
      power: 90,
      staminaCost: 20,
      cooldown: 2,
      statusEffects: [],
      elementalDamage: false,
    },
    'Fireball': {
      description: 'Launches a blazing fireball that explodes on impact.',
      power: 100,
      staminaCost: 22,
      cooldown: 4,
      statusEffects: ['Burn', 'Fear'],
      elementalDamage: true,
    },
    'King of the Skies': {
      description: 'Ultimate aerial dominance ability that strikes from above.',
      power: 180,
      staminaCost: 40,
      cooldown: 8,
      statusEffects: ['Intimidate', 'Knockdown'],
      elementalDamage: true,
    },
    'Poison Tail': {
      description: 'Venomous tail strike that inflicts lasting poison damage.',
      power: 95,
      staminaCost: 18,
      cooldown: 3,
      statusEffects: ['Poison'],
      elementalDamage: false,
    },
    'Fire Breath': {
      description: 'Breathes intense flames in a wide arc.',
      power: 110,
      staminaCost: 30,
      cooldown: 5,
      statusEffects: ['Burn'],
      elementalDamage: true,
    },
    'Spike Barrage': {
      description: 'Launches multiple poisonous spikes at enemies.',
      power: 85,
      staminaCost: 25,
      cooldown: 4,
      statusEffects: ['Poison', 'Slow'],
      elementalDamage: false,
    },
    'Supernova': {
      description: 'Explosive ultimate ability that devastates the battlefield.',
      power: 220,
      staminaCost: 50,
      cooldown: 12,
      statusEffects: ['Burn', 'Blind', 'Knockdown'],
      elementalDamage: true,
    },

    // Azur abilities
    'Bubble Beam': {
      description: 'Fires pressurized bubbles that burst on contact.',
      power: 85,
      staminaCost: 20,
      cooldown: 3,
      statusEffects: ['Slow'],
      elementalDamage: true,
    },
    'Water Jet': {
      description: 'High-pressure water attack with pinpoint accuracy.',
      power: 95,
      staminaCost: 22,
      cooldown: 2,
      statusEffects: ['Knockback'],
      elementalDamage: true,
    },
    'Graceful Dance': {
      description: 'Elegant movement that boosts speed and evasion.',
      power: 60,
      staminaCost: 15,
      cooldown: 6,
      statusEffects: ['Speed Boost', 'Evasion Up'],
      elementalDamage: false,
    },
    'Sleep Beam': {
      description: 'Mystical beam that induces deep slumber.',
      power: 70,
      staminaCost: 25,
      cooldown: 5,
      statusEffects: ['Sleep'],
      elementalDamage: true,
    },

    // Vitae abilities
    'Poison Spit': {
      description: 'Toxic projectile that spreads poison on impact.',
      power: 75,
      staminaCost: 18,
      cooldown: 3,
      statusEffects: ['Poison'],
      elementalDamage: true,
    },
    'Pack Leader': {
      description: 'Rally allies and boost team coordination.',
      power: 50,
      staminaCost: 20,
      cooldown: 8,
      statusEffects: ['Team Boost'],
      elementalDamage: false,
    },
    'Tail Blade': {
      description: 'Sharp tail attack with surgical precision.',
      power: 90,
      staminaCost: 16,
      cooldown: 2,
      statusEffects: ['Bleed'],
      elementalDamage: false,
    },

    // Geo abilities
    'Rock Shield': {
      description: 'Summons protective rock barrier.',
      power: 40,
      staminaCost: 25,
      cooldown: 6,
      statusEffects: ['Defense Up'],
      elementalDamage: true,
    },
    'Earth Punch': {
      description: 'Devastating ground-shaking punch.',
      power: 130,
      staminaCost: 35,
      cooldown: 4,
      statusEffects: ['Stun'],
      elementalDamage: true,
    },
    'Seismic Slam': {
      description: 'Creates powerful earthquake tremors.',
      power: 140,
      staminaCost: 40,
      cooldown: 6,
      statusEffects: ['Knockdown', 'Slow'],
      elementalDamage: true,
    },

    // Tempest abilities
    'Lightning Strike': {
      description: 'Swift electrical attack from the heavens.',
      power: 115,
      staminaCost: 28,
      cooldown: 3,
      statusEffects: ['Paralyze'],
      elementalDamage: true,
    },
    'Thunder Howl': {
      description: 'Intimidating roar charged with electricity.',
      power: 80,
      staminaCost: 30,
      cooldown: 5,
      statusEffects: ['Fear', 'Paralyze'],
      elementalDamage: true,
    },
    'Electric Charge': {
      description: 'Builds electrical energy for enhanced attacks.',
      power: 65,
      staminaCost: 20,
      cooldown: 4,
      statusEffects: ['Attack Up', 'Speed Up'],
      elementalDamage: false,
    },

    // Aeris abilities
    'Tail Swing': {
      description: 'Wide sweeping tail attack.',
      power: 85,
      staminaCost: 20,
      cooldown: 2,
      statusEffects: ['Knockback'],
      elementalDamage: false,
    },
    'Swift Strike': {
      description: 'Lightning-fast precision attack.',
      power: 95,
      staminaCost: 18,
      cooldown: 2,
      statusEffects: [],
      elementalDamage: false,
    },
  }

  return prime.abilities.map((abilityName, index) => {
    const template = abilityTemplates[abilityName] || {
      description: 'A powerful ability unique to this Prime.',
      power: 80,
      staminaCost: 20,
      cooldown: 3,
      statusEffects: [],
      elementalDamage: true,
    }

    // Calculate ability level based on prime level and rarity
    const baseLevel = Math.max(1, Math.floor(prime.level / 8) + index)
    const rarityBonus = {
      Common: 0,
      Rare: 1,
      Epic: 2,
      Legendary: 3,
      Mythical: 5,
    }[prime.rarity]

    const abilityLevel = Math.min(baseLevel + rarityBonus, 10)
    const maxLevel = index === 0 ? 15 : index === 1 ? 12 : 10 // First ability can be leveled higher

    // Scale power with ability level and prime power
    const scaledPower = Math.floor((template.power || 80) * (1 + abilityLevel * 0.1) * (prime.power / 1000))

    return {
      id: `${prime.id}_ability_${index}`,
      name: abilityName,
      description: template.description || 'A powerful ability unique to this Prime.',
      level: abilityLevel,
      maxLevel,
      power: scaledPower,
      staminaCost: template.staminaCost || 20,
      cooldown: template.cooldown || 3,
      statusEffects: template.statusEffects || [],
      elementalDamage: template.elementalDamage !== undefined ? template.elementalDamage : true,
    }
  })
}

export default function AbilitiesSection({ prime, primaryColor }: AbilitiesSectionProps) {
  const abilities = generateAbilityData(prime)
  
  const handleAbilityPress = (ability: PrimeAbility) => {
    // TODO: Show ability upgrade modal in Phase 4
    console.log('Ability pressed:', ability.name)
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Battle Abilities
      </Text>
      
      <Text variant="bodySmall" style={styles.subtitle}>
        Tap abilities to view upgrade options (Phase 4)
      </Text>

      <View style={styles.abilitiesContainer}>
        {abilities.map((ability, index) => (
          <AnimatedAbilityCard
            key={ability.id}
            ability={ability}
            element={prime.element}
            primaryColor={primaryColor}
            onPress={() => handleAbilityPress(ability)}
            canUpgrade={ability.level < ability.maxLevel}
            animationDelay={index * 100}
            index={index}
          />
        ))}
        
        {/* Show empty slots for primes with fewer than 4 abilities */}
        {abilities.length < 4 && (
          Array.from({ length: 4 - abilities.length }).map((_, index) => (
            <View key={`empty_${index}`} style={styles.emptySlot}>
              <Text variant="bodyMedium" style={styles.emptySlotText}>
                Ability Slot {abilities.length + index + 1}
              </Text>
              <Text variant="bodySmall" style={styles.emptySlotSubtext}>
                Unlocks at level {(abilities.length + index + 1) * 10}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Ability Summary */}
      <View style={styles.summary}>
        <Text variant="titleSmall" style={[styles.summaryTitle, { color: primaryColor }]}>
          Ability Summary
        </Text>
        
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text variant="bodyMedium" style={styles.summaryStatValue}>
              {abilities.reduce((sum, ability) => sum + ability.power, 0)}
            </Text>
            <Text variant="bodySmall" style={styles.summaryStatLabel}>
              Total Power
            </Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text variant="bodyMedium" style={styles.summaryStatValue}>
              {Math.round(abilities.reduce((sum, ability) => sum + ability.staminaCost, 0) / abilities.length)}
            </Text>
            <Text variant="bodySmall" style={styles.summaryStatLabel}>
              Avg. Stamina
            </Text>
          </View>
          
          <View style={styles.summaryStat}>
            <Text variant="bodyMedium" style={styles.summaryStatValue}>
              {abilities.filter(ability => ability.statusEffects.length > 0).length}
            </Text>
            <Text variant="bodySmall" style={styles.summaryStatLabel}>
              Status Effects
            </Text>
          </View>
        </View>
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
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  abilitiesContainer: {
    marginBottom: spacing.lg,
  },
  emptySlot: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textTertiary + '30',
    borderStyle: 'dashed',
  },
  emptySlotText: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  emptySlotSubtext: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  summary: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  summaryTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: spacing.xs / 2,
  },
  summaryStatLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
})