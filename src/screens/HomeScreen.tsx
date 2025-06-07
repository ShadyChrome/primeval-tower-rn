import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, Surface, IconButton, Menu } from 'react-native-paper'

interface HomeScreenProps {
  onLogout?: () => void
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const [showTowerSection, setShowTowerSection] = useState(false)
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false)
  
  // Mock data for current tower progress
  const currentFloor = 15
  const maxFloor = 100

  const handleLogout = () => {
    setSettingsMenuVisible(false)
    if (onLogout) {
      onLogout()
    }
  }

  return (
    <View style={styles.container}>
      {/* Settings Menu */}
      <View style={styles.headerActions}>
        <Menu
          visible={settingsMenuVisible}
          onDismiss={() => setSettingsMenuVisible(false)}
          anchor={
            <IconButton
              icon="cog"
              size={24}
              iconColor="#666666"
              onPress={() => setSettingsMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={handleLogout}
            title="Logout"
            leadingIcon="logout"
          />
        </Menu>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {!showTowerSection ? (
          /* Main Home View */
          <View style={styles.mainHomeSection}>
            <Text variant="headlineSmall" style={styles.welcomeTitle}>
              Welcome to Primeval Tower
            </Text>
            <Text variant="bodyLarge" style={styles.welcomeSubtitle}>
              Ready to climb the tower and battle ancient guardians?
            </Text>
            
            <Surface style={styles.battlePromptCard} elevation={3}>
              <View style={styles.battlePromptContent}>
                <Text variant="titleLarge" style={styles.battlePromptTitle}>
                  Continue Your Journey
                </Text>
                <Text variant="bodyMedium" style={styles.battlePromptDescription}>
                  You're currently on floor {currentFloor} of {maxFloor}
                </Text>
                <Button 
                  mode="contained" 
                  style={styles.mainBattleButton}
                  contentStyle={styles.mainBattleButtonContent}
                  onPress={() => setShowTowerSection(true)}
                >
                  Enter Tower
                </Button>
              </View>
            </Surface>
          </View>
        ) : (
          /* Tower Battle Section */
          <View style={styles.towerSection}>
            <View style={styles.towerHeader}>
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor="#666666"
                onPress={() => setShowTowerSection(false)}
                style={styles.backButton}
              />
              <Text variant="headlineSmall" style={styles.sectionTitle}>
                Primeval Tower
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.floorProgress}>
              Floor {currentFloor} of {maxFloor}
            </Text>
            
            <Surface style={styles.towerCard} elevation={3}>
              <View style={styles.towerInfo}>
                <Text variant="titleLarge" style={styles.floorNumber}>
                  Floor {currentFloor}
                </Text>
                <Text variant="bodyMedium" style={styles.floorDescription}>
                  Ancient Guardian Chamber
                </Text>
                <Text variant="bodySmall" style={styles.floorHint}>
                  Ignis element enemies are strong here
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <Button 
                  mode="contained" 
                  style={styles.battleButton}
                  contentStyle={styles.buttonContent}
                >
                  Enter Battle
                </Button>
                <Button 
                  mode="outlined" 
                  style={styles.secondaryButton}
                  contentStyle={styles.buttonContent}
                >
                  View Team
                </Button>
              </View>
            </Surface>
          </View>
        )}

        <View style={styles.quickStatsSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Stats
          </Text>
          
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  12
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Primes Owned
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  847
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Power Level
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  23
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Floors Cleared
                </Text>
              </Card.Content>
            </Card>
            
            <Card style={styles.statCard}>
              <Card.Content style={styles.statContent}>
                <Text variant="headlineSmall" style={styles.statNumber}>
                  1,245
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Total Gems
                </Text>
              </Card.Content>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  headerActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  mainHomeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  battlePromptCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    width: '100%',
    alignItems: 'center',
  },
  battlePromptContent: {
    alignItems: 'center',
  },
  battlePromptTitle: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  battlePromptDescription: {
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  mainBattleButton: {
    backgroundColor: '#A0C49D',
    minWidth: 150,
  },
  mainBattleButtonContent: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  towerSection: {
    marginBottom: 24,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  floorProgress: {
    color: '#666666',
    marginBottom: 16,
  },
  towerCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  towerInfo: {
    marginBottom: 20,
  },
  floorNumber: {
    fontWeight: '700',
    color: '#A0C49D',
    marginBottom: 4,
  },
  floorDescription: {
    color: '#333333',
    marginBottom: 8,
  },
  floorHint: {
    color: '#666666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  battleButton: {
    flex: 1,
    backgroundColor: '#A0C49D',
  },
  secondaryButton: {
    flex: 1,
    borderColor: '#A0C49D',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  quickStatsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontWeight: '700',
    color: '#A0C49D',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666666',
    textAlign: 'center',
  },
}) 