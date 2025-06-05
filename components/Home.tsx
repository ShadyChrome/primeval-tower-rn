import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Button, Card } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface HomeProps {
  session: Session
  onProfilePress: () => void
}

export default function Home({ session, onProfilePress }: HomeProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {session.user.email}!
        </Text>
        <Text style={styles.subtitle}>
          Your React Native app with Supabase is ready to go.
        </Text>
      </View>

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

      <Card containerStyle={styles.card}>
        <Card.Title>Features Available</Card.Title>
        <Card.Divider />
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✅ User Authentication</Text>
          <Text style={styles.featureItem}>✅ Profile Management</Text>
          <Text style={styles.featureItem}>✅ Session Persistence</Text>
          <Text style={styles.featureItem}>✅ Cross-platform Support</Text>
        </View>
      </Card>

      <Card containerStyle={styles.card}>
        <Card.Title>Next Steps</Card.Title>
        <Card.Divider />
        <View style={styles.nextSteps}>
          <Text style={styles.stepText}>
            • Add your Supabase credentials to get started
          </Text>
          <Text style={styles.stepText}>
            • Customize the UI to match your brand
          </Text>
          <Text style={styles.stepText}>
            • Add more features like real-time updates
          </Text>
          <Text style={styles.stepText}>
            • Deploy your app to app stores
          </Text>
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
}) 