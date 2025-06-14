import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { ElementIcon } from '../../OptimizedImage'
import { ElementType } from '../../../assets/ImageAssets'
import { colors, spacing } from '../../../theme/designSystem'

interface ElementAdvantagesProps {
  element: ElementType
  primaryColor: string
}

// Element effectiveness chart
const elementChart: { [key in ElementType]: { weak: ElementType[], strong: ElementType[] } } = {
  Ignis: {
    weak: ['Azur', 'Geo'],       // Fire is weak to Water and Earth
    strong: ['Vitae', 'Aeris']   // Fire is strong against Nature and Air
  },
  Azur: {
    weak: ['Vitae', 'Tempest'],  // Water is weak to Nature and Electric
    strong: ['Ignis', 'Geo']     // Water is strong against Fire and Earth
  },
  Vitae: {
    weak: ['Ignis', 'Aeris'],    // Nature is weak to Fire and Air
    strong: ['Azur', 'Geo']      // Nature is strong against Water and Earth
  },
  Geo: {
    weak: ['Vitae', 'Azur'],     // Earth is weak to Nature and Water
    strong: ['Tempest', 'Aeris'] // Earth is strong against Electric and Air
  },
  Tempest: {
    weak: ['Geo', 'Aeris'],      // Electric is weak to Earth and Air
    strong: ['Azur', 'Ignis']    // Electric is strong against Water and Fire
  },
  Aeris: {
    weak: ['Tempest', 'Ignis'],  // Air is weak to Electric and Fire
    strong: ['Geo', 'Vitae']     // Air is strong against Earth and Nature
  }
}

const ElementCard = ({ 
  element, 
  effectiveness, 
  primaryColor 
}: { 
  element: ElementType, 
  effectiveness: 'strong' | 'weak' | 'neutral', 
  primaryColor: string 
}) => {
  const getEffectivenessColor = () => {
    switch(effectiveness) {
      case 'strong': return colors.accent    // Green for advantage
      case 'weak': return colors.secondary   // Purple for disadvantage
      case 'neutral': return colors.textTertiary // Gray for neutral
    }
  }

  const getEffectivenessText = () => {
    switch(effectiveness) {
      case 'strong': return '2x'
      case 'weak': return '0.5x'
      case 'neutral': return '1x'
    }
  }

  return (
    <View style={[styles.elementCard, { borderColor: getEffectivenessColor() + '40' }]}>
      <ElementIcon element={element} size="medium" />
      <Text variant="bodySmall" style={styles.elementName}>
        {element}
      </Text>
      <Text variant="bodySmall" style={[styles.effectiveness, { color: getEffectivenessColor() }]}>
        {getEffectivenessText()}
      </Text>
    </View>
  )
}

export default function ElementAdvantages({ element, primaryColor }: ElementAdvantagesProps) {
  const advantages = elementChart[element]
  const allElements: ElementType[] = ['Ignis', 'Azur', 'Vitae', 'Geo', 'Tempest', 'Aeris']
  
  const getEffectiveness = (targetElement: ElementType): 'strong' | 'weak' | 'neutral' => {
    if (advantages.strong.includes(targetElement)) return 'strong'
    if (advantages.weak.includes(targetElement)) return 'weak'
    return 'neutral'
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Element Matchups
      </Text>
      
      <Text variant="bodySmall" style={styles.subtitle}>
        Damage effectiveness against other elements
      </Text>

      {/* Your Element */}
      <View style={styles.yourElementSection}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          Your Element
        </Text>
        <View style={styles.yourElementCard}>
          <ElementIcon element={element} size="large" />
          <Text variant="titleMedium" style={[styles.yourElementName, { color: primaryColor }]}>
            {element}
          </Text>
        </View>
      </View>

      {/* Effectiveness Grid */}
      <View style={styles.effectivenessSection}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          VS Other Elements
        </Text>
        
        <View style={styles.elementsGrid}>
          {allElements.filter(e => e !== element).map((targetElement) => (
            <ElementCard
              key={targetElement}
              element={targetElement}
              effectiveness={getEffectiveness(targetElement)}
              primaryColor={primaryColor}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text variant="titleSmall" style={[styles.groupTitle, { color: primaryColor }]}>
          Legend
        </Text>
        
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.accent }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              2x Damage (Strong Against)
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.textTertiary }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              1x Damage (Neutral)
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors.secondary }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              0.5x Damage (Weak Against)
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
  yourElementSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  groupTitle: {
    fontWeight: '600',
    marginBottom: spacing.md,
    fontSize: 14,
  },
  yourElementCard: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    width: '60%',
  },
  yourElementName: {
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  effectivenessSection: {
    marginBottom: spacing.xl,
  },
  elementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  elementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  elementName: {
    color: colors.text,
    fontWeight: '500',
    marginTop: spacing.xs,
    fontSize: 11,
  },
  effectiveness: {
    fontWeight: '700',
    fontSize: 12,
    marginTop: spacing.xs / 2,
  },
  legend: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 16,
    padding: spacing.lg,
  },
  legendItems: {
    gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    color: colors.text,
    fontSize: 13,
  },
}) 