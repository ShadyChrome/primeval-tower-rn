import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import {
  Provider as PaperProvider,
  Button,
  Text,
} from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PlayerManager, PlayerData } from './lib/playerManager'
import { AuthManager } from './lib/authManager'
import { StatusBar } from 'expo-status-bar'
import LoginScreen from './src/screens/LoginScreen'
import PlayerNameScreen from './src/screens/PlayerNameScreen'
import AppNavigation from './src/components/AppNavigation'
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
      
      // Initialize auth system for all users
      console.log('🔐 App: Initializing auth system...')
      await AuthManager.initialize()
      
      // Check if user is authenticated
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        console.log('❌ App: No authenticated user, showing login screen')
        setAppState('loginScreen')
        return
      }

      console.log('✅ App: User authenticated, game user ID:', gameUserId)
      
      // Try to load existing auth-based player data
      console.log('🔄 App: Attempting to load auth-based player data...')
      const authPlayerData = await PlayerManager.loadPlayerDataWithAuth()
      
      if (authPlayerData) {
        console.log('✅ App: Auth-based player data found:', authPlayerData.player.player_name)
        setPlayerData(authPlayerData)
        setAppState('loggedIn')
      } else {
        console.log('ℹ️ App: No auth-based player found, showing login screen for new user')
        setAppState('loginScreen')
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
      
      // Initialize auth for new user
      console.log('🔐 App: Initializing auth for new user...')
      await AuthManager.initialize()
      
      // Check if we have an authenticated user
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        console.log('❌ App: No authenticated user after initialization')
        setAppState('needsPlayerName')
        return
      }
      
      console.log('✅ App: User authenticated, checking for existing auth-based player...')
      
      // Check if an auth-based player already exists
      const authPlayerData = await PlayerManager.loadPlayerDataWithAuth()
      
      if (authPlayerData) {
        console.log('✅ App: Found existing auth-based player:', authPlayerData.player.player_name)
        setPlayerData(authPlayerData)
        setAppState('loggedIn')
        return
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
      
      // Get authenticated user context
      const gameUserId = await AuthManager.getGameUserId()
      if (!gameUserId) {
        throw new Error('No authenticated user for player creation')
      }
      
      console.log('🔐 App: Creating auth-based player for user:', gameUserId)
      // Create new player with auth context
      const newPlayer = await PlayerManager.createPlayerWithAuth(playerName)
      console.log('Player created successfully with auth:', newPlayer)
      
      // Load complete player data
      const completePlayerData = await PlayerManager.loadPlayerDataWithAuth()
      
      if (completePlayerData) {
        setPlayerData(completePlayerData)
        setAppState('loggedIn')
        console.log('Auth-based player creation complete, logging in...')
      } else {
        throw new Error('Failed to load player data after auth-based creation')
      }
    } catch (error) {
      console.error('Failed to create player:', error)
      // Stay on the player name screen so user can try again
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    console.log('Signing out with auth context...')
    try {
      // Sign out from auth system
      await AuthManager.signOut()
      // Clear cached player data
      await PlayerManager.clearCachedData()
      setPlayerData(null)
      setAppState('loginScreen')
      console.log('✅ Sign out complete')
    } catch (error) {
      console.error('❌ Error during sign out:', error)
      // Still clear local state even if auth sign out fails
      setPlayerData(null)
      setAppState('loginScreen')
    }
  }

  // Update player data and pass to navigation
  const refreshPlayerData = async () => {
    if (playerData) {
      const updatedData = await PlayerManager.loadPlayerDataWithAuth()
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
          {renderContent()}
          <StatusBar style="auto" />
        </View>
      </PaperProvider>
    </GestureHandlerRootView>
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
