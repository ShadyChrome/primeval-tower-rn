import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import Home from './components/Home'
import { Session } from '@supabase/supabase-js'
import { StatusBar } from 'expo-status-bar'

type Screen = 'home' | 'account'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      // Reset to home screen when authentication state changes
      setCurrentScreen('home')
    })
  }, [])

  const renderAuthenticatedContent = () => {
    if (!session) return null

    switch (currentScreen) {
      case 'account':
        return (
          <Account 
            session={session} 
            onBack={() => setCurrentScreen('home')}
          />
        )
      case 'home':
      default:
        return (
          <Home 
            session={session} 
            onProfilePress={() => setCurrentScreen('account')}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      {session && session.user ? renderAuthenticatedContent() : <Auth />}
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
