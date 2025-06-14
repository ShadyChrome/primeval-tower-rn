import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography, shadows } from '../../theme/designSystem'

interface ProgressCardProps {
  title: string
  currentValue: number
  maxValue?: number
  gradientType?: 'coral' | 'lavender' | 'mint' | 'peach' | 'sunset' | 'aurora'
  style?: ViewStyle
  subtitle?: string
  icon?: string
}

export default function ProgressCard({
  title,
  currentValue,
  maxValue,
  gradientType = 'coral',
  style,
  subtitle,
  icon = '📊'
}: ProgressCardProps) {
  const gradientColors = colors.gradients[gradientType] as [string, string]
  const progress = maxValue ? currentValue / maxValue : 0
  const percentage = Math.min(progress * 100, 100)

  return (
    <View style={[shadows.medium, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.valueContainer}>
            <Text style={styles.currentValue}>{currentValue}</Text>
            {maxValue && (
              <Text style={styles.maxValue}>/ {maxValue}</Text>
            )}
          </View>
          
          {maxValue && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${percentage}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.subheading,
    color: colors.surface,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
    color: colors.surface,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  progressSection: {
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.surface,
  },
  maxValue: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.8,
    marginLeft: spacing.xs,
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 4,
  },
}) 