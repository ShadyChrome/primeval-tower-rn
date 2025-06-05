import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert } from 'react-native'
import { Button, Input, Header, Text, Card } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'

export default function Account({ session, onBack }: { session: Session; onBack?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const isAnonymous = session.user.is_anonymous

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
        'We sent you a verification link. Please check your email and click the link to verify your account. After verification, you can set a password.',
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
          You're currently browsing as a guest. Create a permanent account to access additional features and save your data across devices.
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

  const renderUserView = () => (
    <View style={styles.content}>
      <Card containerStyle={styles.card}>
        <Card.Title>Account</Card.Title>
        <Card.Divider />
        
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Input label="Email" value={session?.user?.email} disabled />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title="Sign Out"
            onPress={() => supabase.auth.signOut()}
            buttonStyle={styles.primaryButton}
          />
        </View>
      </Card>
    </View>
  )

  return (
    <View style={styles.container}>
      {onBack && (
        <Header
          centerComponent={{ 
            text: isAnonymous ? 'Account' : 'Account', 
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
      {isAnonymous ? renderAnonymousUserView() : renderUserView()}
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