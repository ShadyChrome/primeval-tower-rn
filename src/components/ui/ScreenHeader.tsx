import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { headerStyles, colors, spacing } from '../../theme/designSystem'

interface ScreenHeaderProps {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightComponent?: React.ReactNode
  style?: any
}

export default function ScreenHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  style
}: ScreenHeaderProps) {
  return (
    <View style={[headerStyles.container, style]}>
      {/* Left side */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.text}
            onPress={onBackPress}
            style={headerStyles.backButton}
          />
        )}
        <Text style={headerStyles.title}>{title}</Text>
      </View>
      
      {/* Right side */}
      {rightComponent && (
        <View style={styles.rightContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContainer: {
    marginLeft: spacing.md,
  },
}) 