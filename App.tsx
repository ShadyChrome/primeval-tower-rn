import { useState, useEffect } from 'react'
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native'
import { GuestManager, GuestData } from './lib/guestManager'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  const [isGuestSessionActive, setGuestSessionActive] = useState(false)
  const [guestDeviceId, setGuestDeviceId] = useState<string | null>(null)
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    console.log("Signing in as guest...")
    try {
      const deviceId = await GuestManager.getDeviceID()
      const data = await GuestManager.loadGuestData()

      setGuestDeviceId(deviceId)
      setGuestSessionActive(true)

      if (data) {
        setGuestData(data)
        console.log("Guest data loaded:", data)
      } else {
        // Initialize with default data if none is found
        const defaultData: GuestData = {
          progress: { level: 1, score: 0 },
          settings: { volume: 80, difficulty: 'normal' },
        }
        setGuestData(defaultData)
        console.log("No guest data found, initialized with default data.")
      }

      console.log("Guest session started with Device ID:", deviceId)
    } catch (error) {
      console.error("Failed to sign in as guest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = () => {
    console.log("Signing out...")
    // This just resets the UI state. The device ID remains in local storage.
    setGuestSessionActive(false)
    setGuestDeviceId(null)
    setGuestData(null)
  }

  const handleUpdateProgress = async () => {
    if (!guestData) return
    console.log("Updating progress...")
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
    console.log("Progress updated and saved.")
  }

  const handleUpdateSettings = async () => {
    if (!guestData) return
    console.log("Updating settings...")
    setIsLoading(true)
    const newSettings = {
      ...guestData.settings,
      volume: guestData.settings.volume - 10,
    }
    const newData = { ...guestData, settings: newSettings }
    setGuestData(newData)
    await GuestManager.saveGuestData(newData.progress, newData.settings)
    setIsLoading(false)
    console.log("Settings updated and saved.")
  }

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" />
    }

    if (isGuestSessionActive) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Welcome Guest!</Text>
          <Text style={styles.subtitle}>Your persistent Device ID is:</Text>
          <Text style={styles.deviceIdText}>{guestDeviceId}</Text>
          {guestData && (
            <View style={styles.dataContainer}>
              <Text style={styles.dataTitle}>Game Data:</Text>
              <Text>Level: {guestData.progress.level}, Score: {guestData.progress.score}</Text>
              <Text>Volume: {guestData.settings.volume}, Difficulty: {guestData.settings.difficulty}</Text>
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button title="Update Progress" onPress={handleUpdateProgress} />
            <View style={{ marginVertical: 5 }} />
            <Button title="Update Settings" onPress={handleUpdateSettings} />
            <View style={{ marginVertical: 5 }} />
            <Button title="Sign Out" onPress={handleSignOut} />
          </View>
        </View>
      )
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>You are not signed in.</Text>
        <View style={styles.buttonContainer}>
          <Button title="Sign in as Guest" onPress={handleSignIn} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {renderContent()}
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  deviceIdText: {
    fontSize: 12,
    color: '#333',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    width: '80%',
  },
})
