import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { colors, spacing } from '../../../theme/designSystem'

interface StatBarProps {
  label: string
  value: number
  maxValue: number
  color?: string
  bonus?: number
  showNumbers?: boolean
}

export default function StatBar({ 
  label, 
  value, 
  maxValue, 
  color = colors.primary, 
  bonus = 0, 
  showNumbers = true 
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const totalValue = value + bonus
  const bonusPercentage = bonus > 0 ? Math.min((bonus / maxValue) * 100, 100 - percentage) : 0

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text variant="bodyMedium" style={styles.label}>
          {label}
        </Text>
        {showNumbers && (
          <View style={styles.valueContainer}>
            <Text variant="bodyMedium" style={styles.baseValue}>
              {value}
            </Text>
            {bonus > 0 && (
              <Text variant="bodySmall" style={[styles.bonusValue, { color }]}>
                +{bonus}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.barContainer}>
        <View style={styles.barBackground}>
          {/* Base stat bar */}
          <View 
            style={[
              styles.barFill,
              { 
                width: `${percentage}%`,
                backgroundColor: color + '80'
              }
            ]} 
          />
          {/* Bonus stat bar */}
          {bonus > 0 && (
            <View 
              style={[
                styles.bonusBarFill,
                { 
                  left: `${percentage}%`,
                  width: `${bonusPercentage}%`,
                  backgroundColor: color
                }
              ]} 
            />
          )}
        </View>
        
        {/* Stat markers for reference */}
        <View style={styles.markers}>
          {[0.25, 0.5, 0.75].map((marker, index) => (
            <View 
              key={index}
              style={[
                styles.marker,
                { left: `${marker * 100}%` }
              ]} 
            />
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  baseValue: {
    color: colors.text,
    fontWeight: '600',
  },
  bonusValue: {
    fontWeight: '600',
    fontSize: 12,
  },
  barContainer: {
    position: 'relative',
    height: 8,
  },
  barBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bonusBarFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    top: 0,
  },
  markers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: colors.textTertiary + '40',
  },
}) 