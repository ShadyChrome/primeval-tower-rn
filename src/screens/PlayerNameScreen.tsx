import React, { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { 
  Text, 
  TextInput, 
  Button, 
  ActivityIndicator 
} from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import GradientCard from '../../components/ui/GradientCard'
import ModernCard from '../../components/ui/ModernCard'
import { colors, spacing, typography, shadows } from '../theme/designSystem'

interface PlayerNameScreenProps {
  onCreatePlayer: (playerName: string) => Promise<void>
  isLoading?: boolean
}

export default function PlayerNameScreen({ 
  onCreatePlayer, 
  isLoading = false 
}: PlayerNameScreenProps) {
  const insets = useSafeAreaInsets()
  const [playerName, setPlayerName] = useState('')
  const [nameError, setNameError] = useState('')

  const validatePlayerName = (name: string): boolean => {
    const trimmedName = name.trim()
    
    if (trimmedName.length < 3) {
      setNameError('Player name must be at least 3 characters long')
      return false
    }
    
    if (trimmedName.length > 20) {
      setNameError('Player name must be less than 20 characters')
      return false
    }
    
    // Only allow letters, numbers, spaces, underscores, and hyphens
    const validNameRegex = /^[a-zA-Z0-9\s_-]+$/
    if (!validNameRegex.test(trimmedName)) {
      setNameError('Player name can only contain letters, numbers, spaces, underscores, and hyphens')
      return false
    }
    
    setNameError('')
    return true
  }

  const handleCreatePlayer = async () => {
    const trimmedName = playerName.trim()
    
    if (validatePlayerName(trimmedName)) {
      try {
        await onCreatePlayer(trimmedName)
      } catch (error) {
        console.error('Error creating player:', error)
        setNameError('Failed to create player. Please try again.')
      }
    }
  }

  const handleNameChange = (text: string) => {
    setPlayerName(text)
    if (nameError) {
      setNameError('') // Clear error when user starts typing
    }
  }

  return (
    <LinearGradient
      colors={colors.gradients.aurora as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView 
        style={[styles.keyboardView, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <GradientCard 
            gradientType="sunset" 
            style={styles.headerCard}
            size="large"
          >
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to Primeval Tower! 🏰
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Choose your adventurer name
            </Text>
          </GradientCard>

          <ModernCard variant="large" style={styles.inputCard}>
            <Text variant="titleMedium" style={styles.inputLabel}>
              Player Name
            </Text>
            <TextInput
              mode="outlined"
              value={playerName}
              onChangeText={handleNameChange}
              placeholder="Enter your name..."
              maxLength={20}
              error={!!nameError}
              disabled={isLoading}
              style={styles.textInput}
              contentStyle={styles.textInputContent}
            />
            {nameError ? (
              <Text variant="bodySmall" style={styles.errorText}>
                {nameError}
              </Text>
            ) : null}
            
            <Text variant="bodySmall" style={styles.helperText}>
              • 3-20 characters
              • Letters, numbers, spaces, _, - only
              • This will be displayed in the game
            </Text>
          </ModernCard>

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Creating your adventure...
              </Text>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleCreatePlayer}
              disabled={playerName.trim().length < 3 || !!nameError}
              style={styles.createButton}
              contentStyle={styles.createButtonContent}
            >
              Start Adventure
            </Button>
          )}
        </View>

        <View style={styles.bottomInfo}>
          <Text variant="bodySmall" style={styles.infoText}>
            You'll start with:
          </Text>
          <Text variant="bodySmall" style={styles.starterItems}>
            • 100 💎 Gems
            • 3 🥚 Basic Eggs  
            • 5 🔺 Small Primes
            • 1 ⚔️ Attack Rune
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.heading,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    textAlign: 'center',
  },
  inputCard: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  textInput: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  textInputContent: {
    fontSize: 16,
  },
  errorText: {
    color: '#E57373',
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  helperText: {
    ...typography.caption,
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    ...shadows.light,
  },
  createButtonContent: {
    paddingVertical: spacing.md,
  },
  bottomInfo: {
    alignItems: 'center',
  },
  infoText: {
    ...typography.body,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  starterItems: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 20,
  },
}) 