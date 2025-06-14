import React from 'react'
import { View, ViewStyle } from 'react-native'
import { cardStyles, colors, shadows, spacing } from '../../src/theme/designSystem'

interface ModernCardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'compact' | 'base' | 'large'
  backgroundColor?: string
  noPadding?: boolean
}

export default function ModernCard({
  children,
  style,
  variant = 'base',
  backgroundColor = colors.surface,
  noPadding = false
}: ModernCardProps) {
  const getCardStyle = () => {
    const baseStyle = cardStyles[variant]
    return {
      ...baseStyle,
      backgroundColor,
      ...(noPadding && { padding: 0 })
    }
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  )
} 