import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { Button, Card, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AnonymousUserManager } from '../lib/anonymousUserManager'

interface HomeProps {
  session: Session
  onProfilePress: () => void
}

export default function Home({ session, onProfilePress }: HomeProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isReturningAnonymous, setIsReturningAnonymous] = useState(false)

  const isAnonymous = session.user.is_anonymous

  // Check if this is a returning anonymous user
  React.useEffect(() => {
    const checkReturningUser = async () => {
      if (isAnonymous && session.user.id) {
        // Check if the session was actually restored (not just that we had a stored ID)
        const wasRestored = await AnonymousUserManager.wasSessionRestored(session.user.id)
        setIsReturningAnonymous(wasRestored)
      }
    }
    checkReturningUser()
  }, [session.user.id, isAnonymous])

  const handleSignOut = async () => {
    await AnonymousUserManager.handleSignOut(isAnonymous ?? false)
  }

  const handleUpgradeAccount = async () => {
    if (!email.trim()) {
      Alert.alert('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      // First, update the user with an email
      const { error: updateError } = await supabase.auth.updateUser({
        email: email.trim(),
      })

      if (updateError) {
        Alert.alert('Error', updateError.message)
        setLoading(false)
        return
      }

      // Clear anonymous user data since they're converting to permanent user
      await AnonymousUserManager.convertToPermanentUser()

      Alert.alert(
        'Check your email',
        'We sent you a verification link. Please check your email and click the link to verify your account. After verification, you can set a password.',
        [{ text: 'OK', onPress: () => setShowUpgrade(false) }]
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to upgrade account')
    }
    setLoading(false)
  }

  const renderWelcomeMessage = () => {
    if (isAnonymous) {
      return (
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {isReturningAnonymous ? 'Welcome back, Guest!' : 'Welcome, Guest!'}
          </Text>
          <Text style={styles.subtitle}>
            {isReturningAnonymous 
              ? "Great to see you again! Your previous session has been restored."
              : "You're browsing as a guest. Create an account to save your progress."
            }
          </Text>
        </View>
      )
    }

    return (
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {session.user.email}!
        </Text>
        <Text style={styles.subtitle}>
          Your React Native app with Supabase is ready to go.
        </Text>
      </View>
    )
  }

  const renderQuickActions = () => {
    if (isAnonymous) {
      return (
        <Card containerStyle={styles.card}>
          <Card.Title>Account Actions</Card.Title>
          <Card.Divider />
          <View style={styles.cardContent}>
            <Button
              title="Create Account"
              onPress={() => setShowUpgrade(true)}
              buttonStyle={[styles.button, styles.primaryButton]}
            />
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              buttonStyle={[styles.button, styles.secondaryButton]}
              type="outline"
            />
          </View>
        </Card>
      )
    }

    return (
      <Card containerStyle={styles.card}>
        <Card.Title>Quick Actions</Card.Title>
        <Card.Divider />
        <View style={styles.cardContent}>
          <Button
            title="View Profile"
            onPress={onProfilePress}
            buttonStyle={[styles.button, styles.primaryButton]}
          />
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            buttonStyle={[styles.button, styles.secondaryButton]}
            type="outline"
          />
        </View>
      </Card>
    )
  }

  const renderUpgradeForm = () => {
    if (!showUpgrade) return null

    return (
      <Card containerStyle={styles.card}>
        <Card.Title>Create Your Account</Card.Title>
        <Card.Divider />
        <View style={styles.cardContent}>
          <Text style={styles.upgradeText}>
            Convert your guest account to a permanent account to save your data and access it from any device.
          </Text>
          <Input
            label="Email Address"
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={setEmail}
            value={email}
            placeholder="your@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.upgradeActions}>
            <Button
              title="Cancel"
              onPress={() => setShowUpgrade(false)}
              type="outline"
              buttonStyle={[styles.button, styles.secondaryButton]}
            />
            <Button
              title="Create Account"
              onPress={handleUpgradeAccount}
              loading={loading}
              buttonStyle={[styles.button, styles.primaryButton]}
            />
          </View>
        </View>
      </Card>
    )
  }

  const renderFeatures = () => {
    const baseFeatures = [
      '✅ User Authentication',
      '✅ Session Persistence',
      '✅ Cross-platform Support',
    ]

    const anonymousFeatures = [
      ...baseFeatures,
      '🔄 Guest Mode Active',
      '⚠️ Limited to this device',
    ]

    const permanentFeatures = [
      ...baseFeatures,
      '✅ Profile Management',
      '✅ Data Synchronization',
    ]

    const features = isAnonymous ? anonymousFeatures : permanentFeatures

    return (
      <Card containerStyle={styles.card}>
        <Card.Title>Available Features</Card.Title>
        <Card.Divider />
        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>
              {feature}
            </Text>
          ))}
        </View>
      </Card>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {renderWelcomeMessage()}
      {renderUpgradeForm()}
      {renderQuickActions()}
      {renderFeatures()}

      <Card containerStyle={styles.card}>
        <Card.Title>Next Steps</Card.Title>
        <Card.Divider />
        <View style={styles.nextSteps}>
          {isAnonymous ? (
            <>
              <Text style={styles.stepText}>
                • Create an account to save your progress
              </Text>
              <Text style={styles.stepText}>
                • Access your data from any device
              </Text>
              <Text style={styles.stepText}>
                • Unlock all app features
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.stepText}>
                • Customize your profile settings
              </Text>
              <Text style={styles.stepText}>
                • Invite friends to join
              </Text>
              <Text style={styles.stepText}>
                • Explore premium features
              </Text>
              <Text style={styles.stepText}>
                • Enable notifications
              </Text>
            </>
          )}
        </View>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2089dc',
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#2089dc',
  },
  secondaryButton: {
    borderColor: '#2089dc',
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#333',
  },
  nextSteps: {
    gap: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  upgradeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
}) 