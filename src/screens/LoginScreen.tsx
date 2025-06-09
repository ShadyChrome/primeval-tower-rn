import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import GradientCard from '../../components/ui/GradientCard';
import ModernCard from '../../components/ui/ModernCard';
import { colors, spacing, typography, shadows } from '../theme/designSystem';

const LoginScreen = ({ onSignIn }: { onSignIn: () => void }) => {
  return (
    <LinearGradient
      colors={colors.gradients.aurora as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <GradientCard 
          gradientType="coral" 
          style={styles.welcomeCard}
          size="large"
        >
          <Text variant="headlineLarge" style={styles.title}>
            Primeval Tower
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Welcome, brave adventurer!
          </Text>
        </GradientCard>
        
        <ModernCard variant="large" style={styles.actionCard}>
          <Text variant="titleMedium" style={styles.actionTitle}>
            Begin Your Journey
          </Text>
          <Text variant="bodyMedium" style={styles.actionDescription}>
            Climb the ancient tower and discover legendary creatures
          </Text>
          <Button
            icon="account-arrow-right"
            mode="contained"
            onPress={onSignIn}
            style={styles.playButton}
            contentStyle={styles.playButtonContent}
          >
            Play as Guest
          </Button>
        </ModernCard>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  welcomeCard: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.surface,
    opacity: 0.9,
    textAlign: 'center',
  },
  actionCard: {
    width: '100%',
    alignItems: 'center',
  },
  actionTitle: {
    ...typography.subheading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actionDescription: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    minWidth: 200,
    ...shadows.light,
  },
  playButtonContent: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
});

export default LoginScreen; 