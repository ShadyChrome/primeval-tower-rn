import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, shadows, spacing } from '../../src/theme/designSystem'

interface GradientCardProps {
  children: React.ReactNode
  gradientType?: 'coral' | 'lavender' | 'mint' | 'peach' | 'sunset' | 'aurora'
  style?: ViewStyle
  contentStyle?: ViewStyle
  size?: 'small' | 'medium' | 'large'
  elevation?: 'light' | 'medium' | 'heavy'
}

export default function GradientCard({
  children,
  gradientType = 'coral',
  style,
  contentStyle,
  size = 'medium',
  elevation = 'medium'
}: GradientCardProps) {
  const gradientColors = colors.gradients[gradientType] as [string, string]
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          borderRadius: 12,
          padding: spacing.md,
        }
      case 'large':
        return {
          borderRadius: 24,
          padding: spacing.xl,
        }
      default: // medium
        return {
          borderRadius: 20,
          padding: spacing.lg,
        }
    }
  }

  const getElevationStyles = () => {
    return shadows[elevation]
  }

  return (
    <View style={[getElevationStyles(), style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          getSizeStyles(),
          contentStyle
        ]}
      >
        {children}
      </LinearGradient>
    </View>
  )
} 