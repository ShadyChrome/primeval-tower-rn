import { useState } from 'react'
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native'
import { GuestManager } from './lib/guestManager'
import { StatusBar } from 'expo-status-bar'

export default function App() {
  const [isGuestSessionActive, setGuestSessionActive] = useState(false)
  const [guestDeviceId, setGuestDeviceId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    console.log("Signing in as guest...")
    try {
      const deviceId = await GuestManager.getDeviceID()
      // We can also try loading data to make sure the connection works
      await GuestManager.loadGuestData() 
      
      setGuestDeviceId(deviceId)
      setGuestSessionActive(true)
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
          <View style={styles.buttonContainer}>
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
    marginBottom: 30,
  },
  buttonContainer: {
    width: '80%',
  },
})
