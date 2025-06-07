import React, { useState } from 'react'
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { 
  Text, 
  TextInput, 
  Button, 
  Surface, 
  Card,
  ActivityIndicator 
} from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Surface style={styles.headerSurface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Primeval Tower! 🏰
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Choose your adventurer name
          </Text>
        </Surface>

        <Card style={styles.inputCard}>
          <Card.Content>
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
          </Card.Content>
        </Card>

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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  headerSurface: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666666',
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 12,
    color: '#333333',
    fontWeight: '500',
  },
  textInput: {
    marginBottom: 8,
  },
  textInputContent: {
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
  },
  helperText: {
    color: '#666666',
    lineHeight: 18,
  },
  buttonContainer: {
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  createButton: {
    borderRadius: 8,
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  bottomInfo: {
    alignItems: 'center',
  },
  infoText: {
    color: '#666666',
    marginBottom: 8,
    fontWeight: '500',
  },
  starterItems: {
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
}) 