import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input, Header, Text, Card } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

export default function Account({ session, onBack }: { session: Session; onBack?: () => void }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')

  const isAnonymous = session.user.is_anonymous

  useEffect(() => {
    if (session && !isAnonymous) getProfile()
    else setLoading(false)
  }, [session, isAnonymous])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function upgradeAccount() {
    if (!email.trim()) {
      Alert.alert('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
      })

      if (updateError) {
        Alert.alert('Error', updateError.message)
        setLoading(false)
        return
      }

      Alert.alert(
        'Check your email',
        'We sent you a verification link. Please check your email and click the link to verify your account. After verification, you can set a password and access profile settings.',
        [{ text: 'OK', onPress: onBack }]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade account')
    }
    setLoading(false)
  }

  const renderAnonymousUserView = () => (
    <View style={styles.content}>
      <Card containerStyle={styles.card}>
        <Card.Title>Guest Account</Card.Title>
        <Card.Divider />
        <Text style={styles.anonymousText}>
          You're currently browsing as a guest. Create a permanent account to access profile settings and save your data across devices.
        </Text>
        
        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        />
        
        <View style={styles.anonymousActions}>
          <Button
            title="Create Account"
            onPress={upgradeAccount}
            loading={loading}
            buttonStyle={styles.primaryButton}
          />
          <Button
            title="Sign Out"
            onPress={() => supabase.auth.signOut()}
            type="outline"
            buttonStyle={styles.secondaryButton}
          />
        </View>
      </Card>
    </View>
  )

  const renderProfileView = () => (
    <View style={styles.content}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input label="Email" value={session?.user?.email} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)} />
      </View>
      <View style={styles.verticallySpaced}>
        <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? 'Loading ...' : 'Update'}
          onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {onBack && (
        <Header
          centerComponent={{ 
            text: isAnonymous ? 'Account' : 'Profile', 
            style: { color: '#fff', fontSize: 18 } 
          }}
          leftComponent={{
            icon: 'arrow-back',
            color: '#fff',
            onPress: onBack,
          }}
          backgroundColor="#2089dc"
        />
      )}
      {isAnonymous ? renderAnonymousUserView() : renderProfileView()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  card: {
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  anonymousText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  anonymousActions: {
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#2089dc',
    borderRadius: 8,
  },
  secondaryButton: {
    borderColor: '#2089dc',
    borderRadius: 8,
  },
}) 