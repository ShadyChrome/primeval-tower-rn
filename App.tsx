import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import {
  Provider as PaperProvider,
  Button,
  Text,
} from 'react-native-paper'
import { PlayerManager, PlayerData } from './lib/playerManager'
import { StatusBar } from 'expo-status-bar'
import LoginScreen from './src/screens/LoginScreen'
import PlayerNameScreen from './src/screens/PlayerNameScreen'
import AppNavigation from './components/AppNavigation'
import { ImageAssets } from './src/assets/ImageAssets'
import { theme, colors } from './src/theme/designSystem'

// App state types
type AppState = 'loading' | 'needsPlayerName' | 'loggedIn' | 'loginScreen'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Preload images for better performance
    ImageAssets.preloadAllImages()
    checkPlayerStatus()
  }, [])

  const checkPlayerStatus = async () => {
    console.log('🚀 App: Checking player status...')
    try {
      setIsLoading(true)
      
      // Try to load existing player data
      console.log('🔄 App: Attempting to load existing player data...')
      const existingPlayerData = await PlayerManager.loadPlayerData()
      
      if (existingPlayerData) {
        console.log('✅ App: Existing player data found:', existingPlayerData.player.player_name)
        setPlayerData(existingPlayerData)
        setAppState('loggedIn')
      } else {
        console.log('❌ App: No player data loaded, checking for existing player...')
        // Check if player exists but we don't have their data
        const existingPlayer = await PlayerManager.getExistingPlayer()
        
        if (existingPlayer) {
          console.log('✅ App: Player found, loading their data...')
          // Player exists, load their data
          const playerData = await PlayerManager.loadPlayerData(existingPlayer.id)
          if (playerData) {
            console.log('✅ App: Player found and data loaded:', playerData.player.player_name)
            setPlayerData(playerData)
            setAppState('loggedIn')
          } else {
            console.log('❌ App: Failed to load player data')
            setAppState('loginScreen')
          }
        } else {
          // No player found, show login screen
          console.log('ℹ️ App: No existing player found, showing login screen')
          setAppState('loginScreen')
        }
      }
    } catch (error) {
      console.error('❌ App: Error checking player status:', error)
      setAppState('loginScreen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartAsGuest = async () => {
    console.log('🔄 App: Starting sign-in process...')
    try {
      setIsLoading(true)
      
      // First check if a player already exists for this device
      console.log('🔍 App: Checking for existing player before creating new one...')
      const existingPlayer = await PlayerManager.getExistingPlayer()
      
      if (existingPlayer) {
        console.log('✅ App: Found existing player during sign-in, loading data...')
        // Player exists, load their data
        const playerData = await PlayerManager.loadPlayerData(existingPlayer.id)
        if (playerData) {
          console.log('✅ App: Existing player signed in successfully:', playerData.player.player_name)
          setPlayerData(playerData)
          setAppState('loggedIn')
          return
        } else {
          console.log('❌ App: Failed to load existing player data, proceeding to create new player')
        }
      }
      
      // No existing player found, proceed to player creation
      console.log('ℹ️ App: No existing player found, starting player creation flow...')
      setAppState('needsPlayerName')
    } catch (error) {
      console.error('❌ App: Error during sign-in process:', error)
      setAppState('needsPlayerName') // Fallback to player creation
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePlayer = async (playerName: string) => {
    console.log('Creating player with name:', playerName)
    try {
      setIsLoading(true)
      
      // Create new player
      const newPlayer = await PlayerManager.createPlayer(playerName)
      console.log('Player created successfully:', newPlayer)
      
      // Load complete player data
      const completePlayerData = await PlayerManager.loadPlayerData(newPlayer.id)
      
      if (completePlayerData) {
        setPlayerData(completePlayerData)
        setAppState('loggedIn')
        console.log('Player creation complete, logging in...')
      } else {
        throw new Error('Failed to load player data after creation')
      }
    } catch (error) {
      console.error('Failed to create player:', error)
      // Stay on the player name screen so user can try again
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    console.log('Signing out...')
    await PlayerManager.clearCachedData()
    setPlayerData(null)
    setAppState('loginScreen')
  }

  // Update player data and pass to navigation
  const refreshPlayerData = async () => {
    if (playerData) {
      const updatedData = await PlayerManager.loadPlayerData(playerData.player.id)
      if (updatedData) {
        setPlayerData(updatedData)
      }
    }
  }

  const renderContent = () => {
    if (appState === 'loading' || isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )
    }

    switch (appState) {
      case 'loginScreen':
        return <LoginScreen onSignIn={handleStartAsGuest} />
      
      case 'needsPlayerName':
        return (
          <PlayerNameScreen 
            onCreatePlayer={handleCreatePlayer}
            isLoading={isLoading}
          />
        )
      
      case 'loggedIn':
        if (!playerData) {
          return (
            <View style={styles.container}>
              <Text>Error: No player data available</Text>
              <Button onPress={() => setAppState('loginScreen')}>
                Back to Login
              </Button>
            </View>
          )
        }
        
        return (
          <AppNavigation 
            onLogout={handleSignOut} 
            playerData={playerData}
            onRefreshPlayerData={refreshPlayerData}
          />
        )
      
      default:
        return (
          <View style={styles.container}>
            <Text>Unknown app state</Text>
          </View>
        )
    }
  }

  return (
    <PaperProvider theme={theme}>
      <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
        {renderContent()}
        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
})
