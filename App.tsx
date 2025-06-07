import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import {
  Provider as PaperProvider,
  Button,
  Text,
  MD3LightTheme,
} from 'react-native-paper'
import { GuestManager, GuestData } from './lib/guestManager'
import { StatusBar } from 'expo-status-bar'
import LoginScreen from './src/screens/LoginScreen'
import MainNavigation from './components/MainNavigation'

// Define a custom theme that fits the "warm, pastel, flat" description
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#A0C49D', // A soft, pastel green
    secondary: '#C4D7B2',
    background: '#F7EFE5',
    surface: '#FFFFFF',
    text: '#333333',
  },
  roundness: 2,
}

// The main App component remains, but will render content based on auth state
export default function App() {
  const [isGuestSessionActive, setGuestSessionActive] = useState(false)
  const [guestDeviceId, setGuestDeviceId] = useState<string | null>(null)
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkExistingSession = async () => {
      console.log('Checking for existing guest session...')
      try {
        const deviceId = await GuestManager.getDeviceID()
        const data = await GuestManager.loadGuestData()

        if (data) {
          console.log('Existing guest data loaded:', data)
          setGuestData(data)
          setGuestDeviceId(deviceId)
          setGuestSessionActive(true)
        } else {
          console.log('No existing session found.')
        }
      } catch (error) {
        console.error('Failed to check for existing session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const handleSignIn = async () => {
    setIsLoading(true)
    console.log('Signing in as guest...')
    try {
      const deviceId = await GuestManager.getDeviceID()
      let data = await GuestManager.loadGuestData()

      if (!data) {
        console.log('No guest data found, initializing with default data.')
        const defaultData: GuestData = {
          progress: { level: 1, score: 0 },
          settings: { volume: 80, difficulty: 'normal' },
        }
        await GuestManager.saveGuestData(defaultData.progress, defaultData.settings)
        data = defaultData
      }

      setGuestData(data)
      setGuestDeviceId(deviceId)
      setGuestSessionActive(true)
      console.log('Guest session started with Device ID:', deviceId)
    } catch (error) {
      console.error('Failed to sign in as guest:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    console.log('Signing out...')
    setGuestSessionActive(false)
    setGuestDeviceId(null)
    setGuestData(null)
  }

  const handleUpdateProgress = async () => {
    if (!guestData) return
    console.log('Updating progress...')
    setIsLoading(true)
    const newProgress = {
      ...guestData.progress,
      level: guestData.progress.level + 1,
      score: guestData.progress.score + 100,
    }
    const newData = { ...guestData, progress: newProgress }
    setGuestData(newData)
    await GuestManager.saveGuestData(newData.progress, newData.settings)
    setIsLoading(false)
    console.log('Progress updated and saved.')
  }

  const handleUpdateSettings = async () => {
    if (!guestData) return
    console.log('Updating settings...')
    setIsLoading(true)
    const newSettings = {
      ...guestData.settings,
      volume: guestData.settings.volume - 10,
    }
    const newData = { ...guestData, settings: newSettings }
    setGuestData(newData)
    await GuestManager.saveGuestData(newData.progress, newData.settings)
    setIsLoading(false)
    console.log('Settings updated and saved.')
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      )
    }

    if (isGuestSessionActive) {
      return <MainNavigation onLogout={handleSignOut} />
    }

    return <LoginScreen onSignIn={handleSignIn} />
  }

  return (
    <PaperProvider theme={theme}>
      {isGuestSessionActive ? (
        <>
          {renderContent()}
          <StatusBar style="auto" />
        </>
      ) : (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          {renderContent()}
          <StatusBar style="auto" />
        </View>
      )}
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  deviceIdText: {
    fontSize: 12,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 20,
  },
  dataContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  dataTitle: {
    marginBottom: 10,
  },
  buttonContainer: {
    width: '80%',
  },
})
