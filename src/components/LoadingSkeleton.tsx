import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated'
import { colors, spacing } from '../theme/designSystem'

interface LoadingSkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
  shimmer?: boolean
}

export default function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmer = true
}: LoadingSkeletonProps) {
  const shimmerTranslateX = useSharedValue(-100)

  React.useEffect(() => {
    if (shimmer) {
      shimmerTranslateX.value = withRepeat(
        withTiming(100, { duration: 1500 }),
        -1,
        false
      )
    }
  }, [shimmer])

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = shimmerTranslateX.value
    const opacity = interpolate(
      Math.abs(translateX),
      [0, 50, 100],
      [0, 1, 0]
    )

    return {
      transform: [{ translateX }],
      opacity,
    }
  })

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      {shimmer && (
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      )}
    </View>
  )
}

// Specialized skeleton components
export function StatBarSkeleton() {
  return (
    <View style={styles.statBarContainer}>
      <View style={styles.statBarHeader}>
        <LoadingSkeleton width={16} height={16} borderRadius={8} />
        <LoadingSkeleton width={60} height={14} />
        <LoadingSkeleton width={30} height={14} />
      </View>
      <LoadingSkeleton width="100%" height={8} borderRadius={4} />
    </View>
  )
}

export function AbilityCardSkeleton() {
  return (
    <View style={styles.abilityCardContainer}>
      <View style={styles.abilityCardHeader}>
        <LoadingSkeleton width={120} height={16} />
        <LoadingSkeleton width={40} height={14} />
      </View>
      <View style={styles.abilityCardStats}>
        <LoadingSkeleton width={30} height={12} />
        <LoadingSkeleton width={30} height={12} />
        <LoadingSkeleton width={30} height={12} />
      </View>
      <LoadingSkeleton width="100%" height={32} />
      <View style={styles.abilityCardEffects}>
        <LoadingSkeleton width={60} height={16} borderRadius={8} />
        <LoadingSkeleton width={40} height={16} borderRadius={8} />
      </View>
    </View>
  )
}

export function PrimeHeaderSkeleton() {
  return (
    <View style={styles.primeHeaderContainer}>
      <LoadingSkeleton width={80} height={80} borderRadius={40} />
      <View style={styles.primeHeaderInfo}>
        <LoadingSkeleton width={150} height={24} />
        <LoadingSkeleton width={200} height={16} />
        <View style={styles.primeHeaderBadges}>
          <LoadingSkeleton width={60} height={20} borderRadius={10} />
          <LoadingSkeleton width={50} height={20} borderRadius={10} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statBarContainer: {
    marginBottom: spacing.md,
  },
  statBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  abilityCardContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
  },
  abilityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  abilityCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  abilityCardEffects: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  primeHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
  },
  primeHeaderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  primeHeaderBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
}) 