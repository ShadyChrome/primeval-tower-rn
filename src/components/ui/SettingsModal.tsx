import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Text, Card, Button, List, Divider } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import CenteredModal from './CenteredModal'
import { colors, spacing, typography, shadows } from '../../theme/designSystem'

interface SettingsModalProps {
  visible: boolean
  onDismiss: () => void
  onLogout: () => void
  playerName?: string
}

export default function SettingsModal({
  visible,
  onDismiss,
  onLogout,
  playerName
}: SettingsModalProps) {
  const handleLogout = () => {
    onDismiss()
    onLogout()
  }

  return (
    <CenteredModal
      visible={visible}
      onDismiss={onDismiss}
      maxWidth={350}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons 
              name="cog" 
              size={32} 
              color={colors.primary} 
              style={styles.headerIcon}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Settings
            </Text>
            {playerName && (
              <Text variant="bodyMedium" style={styles.playerName}>
                {playerName}
              </Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Settings Options */}
          <View style={styles.optionsContainer}>
            <List.Item
              title="Sound Effects"
              description="Game sounds and music"
              left={() => (
                <MaterialCommunityIcons 
                  name="volume-high" 
                  size={24} 
                  color={colors.text} 
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons 
                  name="toggle-switch" 
                  size={24} 
                  color={colors.primary}
                />
              )}
              onPress={() => {}}
              style={styles.listItem}
            />

            <List.Item
              title="Notifications"
              description="Push notifications for events"
              left={() => (
                <MaterialCommunityIcons 
                  name="bell" 
                  size={24} 
                  color={colors.text} 
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons 
                  name="toggle-switch-off" 
                  size={24} 
                  color={colors.textSecondary}
                />
              )}
              onPress={() => {}}
              style={styles.listItem}
            />

            <List.Item
              title="About Game"
              description="Version and credits"
              left={() => (
                <MaterialCommunityIcons 
                  name="information" 
                  size={24} 
                  color={colors.text} 
                  style={styles.listIcon}
                />
              )}
              right={() => (
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={24} 
                  color={colors.textSecondary}
                />
              )}
              onPress={() => {}}
              style={styles.listItem}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              style={styles.logoutButton}
              contentStyle={styles.buttonContent}
              textColor="#E57373"
            >
              Logout
            </Button>
            
            <Button
              mode="contained"
              onPress={onDismiss}
              style={styles.closeButton}
              contentStyle={styles.buttonContent}
            >
              Close
            </Button>
          </View>
        </Card.Content>
      </Card>
    </CenteredModal>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    ...shadows.medium,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerIcon: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subheading,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  playerName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  optionsContainer: {
    marginVertical: spacing.sm,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: spacing.xs,
  },
  listIcon: {
    marginLeft: spacing.sm,
    marginRight: spacing.md,
    alignSelf: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  logoutButton: {
    flex: 1,
    borderColor: '#E57373',
    borderRadius: 12,
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
}) 