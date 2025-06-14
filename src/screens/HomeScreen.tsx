import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Button, IconButton } from 'react-native-paper'
import TreasureBox from '../components/TreasureBox'
import ModernCard from '../components/ui/ModernCard'
import GradientCard from '../components/ui/GradientCard'
import SettingsModal from '../components/ui/SettingsModal'
import { PlayerData } from '../../lib/playerManager'
import { colors, spacing, typography, shadows } from '../theme/designSystem'

interface HomeScreenProps {
  onLogout?: () => void
  playerData?: PlayerData
  onRefreshPlayerData?: () => Promise<void>
}

export default function HomeScreen({ 
  onLogout, 
  playerData, 
  onRefreshPlayerData 
}: HomeScreenProps) {
  const [showTowerSection, setShowTowerSection] = useState(false)
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false)
  
  // Mock data for current tower progress
  const currentFloor = 15
  const maxFloor = 100

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
  }

  const handleGemsUpdated = async (newGemTotal: number) => {
    // Refresh player data to sync with the updated gem count
    if (onRefreshPlayerData) {
      await onRefreshPlayerData()
    }
  }

  return (
    <View style={styles.container}>
      {/* Settings Button */}
      <View style={styles.headerActions}>
        <IconButton
          icon="cog"
          size={24}
          iconColor="#666666"
          onPress={() => setSettingsMenuVisible(true)}
        />
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
            
            {/* Treasure Box Section */}
            {playerData && (
              <TreasureBox 
                playerId={playerData.player.id}
                onGemsUpdated={handleGemsUpdated}
              />
            )}
            
            <GradientCard 
              gradientType="sunset" 
              style={styles.battlePromptCard}
              size="large"
            >
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
            </GradientCard>
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
            
            <ModernCard variant="large" style={styles.towerCard}>
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
            </ModernCard>
          </View>
        )}
      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal
        visible={settingsMenuVisible}
        onDismiss={() => setSettingsMenuVisible(false)}
        onLogout={handleLogout}
        playerName={playerData?.player.player_name}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerActions: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  mainHomeSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...typography.heading,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  battlePromptCard: {
    width: '100%',
    alignItems: 'center',
  },
  battlePromptContent: {
    alignItems: 'center',
  },
  battlePromptTitle: {
    ...typography.subheading,
    color: colors.surface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  battlePromptDescription: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  mainBattleButton: {
    backgroundColor: colors.surface,
    minWidth: 150,
    borderRadius: 16,
    ...shadows.light,
  },
  mainBattleButtonContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  towerSection: {
    marginBottom: spacing.xl,
  },
  towerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
    marginLeft: -spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    marginBottom: spacing.sm,
  },
  floorProgress: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  towerCard: {
    // Card styles are handled by ModernCard component
  },
  towerInfo: {
    marginBottom: spacing.lg,
  },
  floorNumber: {
    ...typography.subheading,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  floorDescription: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  floorHint: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  battleButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.primary,
    borderRadius: 16,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
}) 