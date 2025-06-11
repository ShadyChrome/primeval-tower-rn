import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { Text, Chip } from 'react-native-paper'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  interpolateColor,
  runOnUI,
} from 'react-native-reanimated'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing } from '../../../theme/designSystem'

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

interface AnimatedAbilityCardProps {
  ability: PrimeAbility
  primaryColor: string
  animationDelay?: number
  onPress?: () => void
  index?: number
}

const { width } = Dimensions.get('window')
const cardWidth = (width - spacing.lg * 3) / 2

export default function AnimatedAbilityCard({
  ability,
  primaryColor,
  animationDelay = 0,
  onPress,
  index = 0
}: AnimatedAbilityCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  
  // Animation values
  const scale = useSharedValue(0)
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(30)
  const borderColor = useSharedValue(0)
  const pressScale = useSharedValue(1)
  const glowIntensity = useSharedValue(0)

  // Power level calculations
  const powerLevel = Math.ceil(ability.level / 3) // 1-10 scale
  const isMaxLevel = ability.level >= ability.maxLevel
  const canUpgrade = !isMaxLevel

  useEffect(() => {
    // Entry animation
    const startAnimation = () => {
      scale.value = withDelay(
        animationDelay,
        withSpring(1, { damping: 12, stiffness: 100 })
      )
      
      opacity.value = withDelay(
        animationDelay,
        withTiming(1, { duration: 400 })
      )
      
      translateY.value = withDelay(
        animationDelay,
        withSpring(0, { damping: 12, stiffness: 100 })
      )

      // Subtle glow animation for upgraded abilities
      if (ability.level > 1) {
        glowIntensity.value = withDelay(
          animationDelay + 500,
          withSequence(
            withTiming(1, { duration: 800 }),
            withTiming(0.3, { duration: 800 })
          )
        )
      }
    }

    startAnimation()
  }, [animationDelay, ability.level])

  // Handle press interactions
  const handlePressIn = () => {
    setIsPressed(true)
    pressScale.value = withSpring(0.95, { damping: 15, stiffness: 400 })
    borderColor.value = withTiming(1, { duration: 150 })
  }

  const handlePressOut = () => {
    setIsPressed(false)
    pressScale.value = withSpring(1, { damping: 15, stiffness: 400 })
    borderColor.value = withTiming(0, { duration: 200 })
  }

  const handlePress = () => {
    // Haptic feedback would go here
    if (onPress) {
      onPress()
    }
  }

  // Animated styles
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pressScale.value },
        { translateY: translateY.value }
      ],
      opacity: opacity.value,
      borderColor: interpolateColor(
        borderColor.value,
        [0, 1],
        ['transparent', primaryColor]
      ),
      shadowOpacity: glowIntensity.value * 0.3,
      shadowColor: primaryColor,
      elevation: glowIntensity.value * 8,
    }
  })

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowIntensity.value * 0.5,
      backgroundColor: primaryColor + '20',
    }
  })

  const getLevelColor = () => {
    if (isMaxLevel) return '#FFD700'
    if (ability.level >= 7) return '#FF6B9D'
    if (ability.level >= 4) return '#C084FC'
    if (ability.level >= 2) return '#60A5FA'
    return '#A3A3A3'
  }

  const getPowerIcon = () => {
    if (powerLevel >= 8) return 'lightning-bolt'
    if (powerLevel >= 6) return 'fire'
    if (powerLevel >= 4) return 'water'
    if (powerLevel >= 2) return 'leaf'
    return 'circle-outline'
  }

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
      style={styles.touchable}
    >
      <Animated.View style={[styles.card, animatedCardStyle]}>
        {/* Glow effect overlay */}
        <Animated.View style={[styles.glowOverlay, animatedGlowStyle]} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.abilityInfo}>
            <MaterialCommunityIcons
              name={getPowerIcon() as any}
              size={16}
              color={getLevelColor()}
              style={styles.powerIcon}
            />
            <Text 
              variant="bodyMedium" 
              style={styles.abilityName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {ability.name}
            </Text>
          </View>
          
          {canUpgrade && (
            <View style={[styles.upgradeIndicator, { backgroundColor: primaryColor }]}>
              <MaterialCommunityIcons
                name="arrow-up"
                size={10}
                color="white"
              />
            </View>
          )}
        </View>

        {/* Level Indicator */}
        <View style={styles.levelSection}>
          <View style={styles.levelContainer}>
            <Text variant="bodySmall" style={styles.levelLabel}>
              Level
            </Text>
            <Text 
              variant="titleSmall" 
              style={[styles.levelValue, { color: getLevelColor() }]}
            >
              {ability.level}
            </Text>
          </View>
          
          {isMaxLevel && (
            <Chip
              style={styles.maxChip}
              textStyle={styles.maxChipText}
            >
              MAX
            </Chip>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="sword"
              size={12}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.statValue}>
              {ability.power}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={12}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.statValue}>
              {ability.staminaCost}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={12}
              color={colors.textSecondary}
            />
            <Text variant="bodySmall" style={styles.statValue}>
              {ability.cooldown}s
            </Text>
          </View>
        </View>

        {/* Status Effects */}
        {ability.statusEffects.length > 0 && (
          <View style={styles.effectsContainer}>
            {ability.statusEffects.slice(0, 2).map((effect, index) => (
              <Chip
                key={index}
                style={[styles.effectChip, { backgroundColor: primaryColor + '15' }]}
                textStyle={[styles.effectText, { color: primaryColor }]}
              >
                {effect}
              </Chip>
            ))}
            {ability.statusEffects.length > 2 && (
              <Text variant="bodySmall" style={styles.moreEffects}>
                +{ability.statusEffects.length - 2}
              </Text>
            )}
          </View>
        )}

        {/* Elemental Damage Indicator */}
        {ability.elementalDamage && (
          <View style={[styles.elementalBadge, { backgroundColor: primaryColor + '20' }]}>
            <MaterialCommunityIcons
              name="flash"
              size={12}
              color={primaryColor}
            />
            <Text variant="bodySmall" style={[styles.elementalText, { color: primaryColor }]}>
              Elemental
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    margin: spacing.xs / 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    minHeight: 140,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  abilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  powerIcon: {
    marginRight: spacing.xs,
  },
  abilityName: {
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  upgradeIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelLabel: {
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  levelValue: {
    fontWeight: '700',
  },
  maxChip: {
    height: 20,
    backgroundColor: '#FFD700',
  },
  maxChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statValue: {
    marginLeft: spacing.xs / 2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  effectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  effectChip: {
    height: 16,
    marginRight: spacing.xs / 2,
    marginBottom: spacing.xs / 2,
  },
  effectText: {
    fontSize: 9,
    fontWeight: '600',
  },
  moreEffects: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  elementalBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  elementalText: {
    fontSize: 9,
    fontWeight: '600',
    marginLeft: spacing.xs / 2,
  },
}) 