import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing } from '../../../theme/designSystem'

interface AnimatedStatBarProps {
  label: string
  value: number
  maxValue: number
  bonus?: number
  color: string
  icon: string
  animationDelay?: number
  onAnimationComplete?: () => void
}

export default function AnimatedStatBar({
  label,
  value,
  maxValue,
  bonus = 0,
  color,
  icon,
  animationDelay = 0,
  onAnimationComplete
}: AnimatedStatBarProps) {
  const progress = useSharedValue(0)
  const bonusProgress = useSharedValue(0)
  const iconScale = useSharedValue(0)
  const labelOpacity = useSharedValue(0)
  const valueScale = useSharedValue(0.8)

  const totalValue = value + bonus
  const basePercentage = Math.min((value / maxValue) * 100, 100)
  const bonusPercentage = Math.min((bonus / maxValue) * 100, 100)
  const totalPercentage = Math.min((totalValue / maxValue) * 100, 100)

  useEffect(() => {
    // Staggered animation sequence
    const sequence = async () => {
      // Start with icon and label fade-in
      iconScale.value = withDelay(
        animationDelay,
        withSpring(1, { damping: 12, stiffness: 100 })
      )
      
      labelOpacity.value = withDelay(
        animationDelay + 100,
        withTiming(1, { duration: 300 })
      )

      // Animate main progress bar
      progress.value = withDelay(
        animationDelay + 200,
        withTiming(basePercentage / 100, { duration: 800 })
      )

      // Animate bonus progress if exists
      if (bonus > 0) {
        bonusProgress.value = withDelay(
          animationDelay + 600,
          withTiming(bonusPercentage / 100, { duration: 600 })
        )
      }

      // Animate value number with bounce
      valueScale.value = withDelay(
        animationDelay + 1000,
        withSpring(1, { damping: 8, stiffness: 120 }, () => {
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)()
          }
        })
      )
    }

    sequence()
  }, [value, bonus, maxValue, animationDelay])

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      backgroundColor: interpolateColor(
        progress.value,
        [0, 0.5, 1],
        [color + '30', color + '60', color]
      ),
    }
  })

  const animatedBonusStyle = useAnimatedStyle(() => {
    return {
      width: `${bonusProgress.value * 100}%`,
      backgroundColor: interpolateColor(
        bonusProgress.value,
        [0, 1],
        ['#FFD700', '#FFA500']
      ),
    }
  })

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    }
  })

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: labelOpacity.value,
    }
  })

  const animatedValueStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: valueScale.value }],
    }
  })

  const animatedShineStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateX: progress.value * 200 - 100 }]
    }
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
            <MaterialCommunityIcons 
              name={icon as any} 
              size={16} 
              color={color} 
            />
          </Animated.View>
          <Animated.Text style={[styles.label, animatedLabelStyle]}>
            {label}
          </Animated.Text>
        </View>
        
        <Animated.View style={animatedValueStyle}>
          <Text variant="bodyMedium" style={[styles.value, { color }]}>
            {totalValue}
            {bonus > 0 && (
              <Text style={styles.bonus}> (+{bonus})</Text>
            )}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.barBackground, { backgroundColor: color + '10' }]}>
          {/* Base stat bar */}
          <Animated.View style={[styles.barFill, animatedBarStyle]} />
          
          {/* Bonus stat bar overlay */}
          {bonus > 0 && (
            <Animated.View 
              style={[
                styles.bonusBar, 
                animatedBonusStyle,
                { left: `${basePercentage}%` }
              ]} 
            />
          )}
          
          {/* Shine effect */}
          <Animated.View 
            style={[styles.shine, animatedShineStyle]}
          />
        </View>
        
        {/* Progress markers */}
        <View style={styles.markers}>
          {[25, 50, 75].map((marker) => (
            <View
              key={marker}
              style={[
                styles.marker,
                { left: `${marker}%`, backgroundColor: color + '30' }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Percentage indicator */}
      <Text variant="bodySmall" style={styles.percentage}>
        {Math.round(totalPercentage)}%
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  bonus: {
    color: '#FFA500',
    fontSize: 12,
    fontWeight: '600',
  },
  barContainer: {
    height: 8,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barBackground: {
    flex: 1,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bonusBar: {
    height: '100%',
    position: 'absolute',
    top: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: -50,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
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
    top: 0,
  },
  percentage: {
    textAlign: 'right',
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 11,
  },
}) 