import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { Button, Card, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AnonymousUserManager } from '../lib/anonymousUserManager'
import { GuestDataManager, GuestData } from '../lib/guestDataManager'

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
  const [guestData, setGuestData] = useState<GuestData | null>(null)
  const [deviceInfo, setDeviceInfo] = useState<{ deviceId: string; hasData: boolean } | null>(null)

  const isAnonymous = session.user.is_anonymous

  // Check if this is a returning anonymous user and load guest data
  React.useEffect(() => {
    const checkReturningUser = async () => {
      if (isAnonymous) {
        // Check if we have an existing guest session based on device
        const isReturning = await AnonymousUserManager.isReturningGuestDevice()
        setIsReturningAnonymous(isReturning)
        
        // Load guest data
        const data = await GuestDataManager.getCurrentUserData()
        setGuestData(data)
        
        // Get device info for debugging
        const info = await GuestDataManager.getDeviceInfo()
        setDeviceInfo(info)
      }
    }
    checkReturningUser()
  }, [isAnonymous])

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

  const simulateGameProgress = async () => {
    const currentProgress = guestData?.game_progress as any || { level: 1, score: 0, achievements: [] }
    const newProgress = {
      ...currentProgress,
      level: currentProgress.level + 1,
      score: currentProgress.score + 100,
      lastPlayed: new Date().toISOString()
    }
    
    const success = await GuestDataManager.updateGameProgress(newProgress)
    if (success) {
      // Reload data to show the update
      const updatedData = await GuestDataManager.getCurrentUserData()
      setGuestData(updatedData)
      Alert.alert('Success', 'Game progress updated!')
    } else {
      Alert.alert('Error', 'Failed to update progress')
    }
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
              ? "Great to see you again! You're continuing as a guest."
              : "You're browsing as a guest. Create an account to save your progress."
            }
          </Text>
          {deviceInfo && (
            <Text style={styles.deviceInfo}>
              Device ID: {deviceInfo.deviceId.substring(0, 20)}...
            </Text>
          )}
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

  const clearAllLocalData = async () => {
    Alert.alert(
      'Clear All Local Data',
      'This will sign you out and clear all locally stored data. Use this for testing when database is cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AnonymousUserManager.clearAllLocalData()
            Alert.alert('Success', 'All local data cleared. You will be redirected to login.')
          }
        }
      ]
    )
  }

  const renderGuestDataDemo = () => {
    if (!isAnonymous) return null

    return (
      <Card containerStyle={styles.card}>
        <Card.Title>Guest Data Persistence Demo</Card.Title>
        <Card.Divider />
        <View style={styles.cardContent}>
          {guestData ? (
            <>
              <Text style={styles.dataText}>
                Level: {(guestData.game_progress as any)?.level || 1}
              </Text>
              <Text style={styles.dataText}>
                Score: {(guestData.game_progress as any)?.score || 0}
              </Text>
              <Text style={styles.dataText}>
                Created: {new Date(guestData.created_at || '').toLocaleDateString()}
              </Text>
              <Button
                title="Simulate Game Progress"
                onPress={simulateGameProgress}
                buttonStyle={[styles.button, styles.primaryButton]}
              />
            </>
          ) : (
            <Text style={styles.dataText}>No guest data found</Text>
          )}
          
          {/* Development/Testing button */}
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>🔧 Development Tools</Text>
            <Button
              title="Clear All Local Data"
              onPress={clearAllLocalData}
              buttonStyle={[styles.button, styles.debugButton]}
              titleStyle={styles.debugButtonText}
            />
          </View>
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

  const renderQuickActions = () => {
    return (
      <Card containerStyle={styles.card}>
        <Card.Title>Quick Actions</Card.Title>
        <Card.Divider />
        <View style={styles.quickActions}>
          {isAnonymous && (
            <Button
              title="Create Account"
              onPress={() => setShowUpgrade(true)}
              buttonStyle={[styles.button, styles.primaryButton]}
            />
          )}
          <Button
            title="View Profile"
            onPress={onProfilePress}
            type="outline"
            buttonStyle={[styles.button, styles.secondaryButton]}
          />
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            type="outline"
            buttonStyle={[styles.button, styles.signOutButton]}
          />
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
      '✅ Device-based Data Persistence',
      '⚠️ Limited to this device',
    ]

    const permanentFeatures = [
      ...baseFeatures,
      '✅ Account Management',
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
      {renderGuestDataDemo()}
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
                • Try the "Simulate Game Progress" button to test data persistence
              </Text>
              <Text style={styles.stepText}>
                • Restart the app and sign in as guest again - your data will be restored
              </Text>
              <Text style={styles.stepText}>
                • Create an account to save your progress permanently
              </Text>
              <Text style={styles.stepText}>
                • Access your data from any device after creating an account
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2089dc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  deviceInfo: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  card: {
    margin: 10,
    borderRadius: 10,
  },
  cardContent: {
    padding: 10,
  },
  dataText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  upgradeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  quickActions: {
    gap: 10,
  },
  upgradeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
    borderWidth: 2,
  },
  signOutButton: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
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
  },
  debugSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
  },
}) 