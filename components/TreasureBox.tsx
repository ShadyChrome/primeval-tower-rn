import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Text, Card, Button, ProgressBar, ActivityIndicator } from 'react-native-paper'
import { TreasureBoxManager } from '../lib/treasureBoxManager'
import { TreasureBoxStatus } from '../types/supabase'

interface TreasureBoxProps {
  playerId: string
  onGemsUpdated?: (newGemTotal: number) => void
}

export default function TreasureBox({ playerId, onGemsUpdated }: TreasureBoxProps) {
  const [status, setStatus] = useState<TreasureBoxStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [lastClaimMessage, setLastClaimMessage] = useState('')
  
  // Animation for treasure box glow
  const glowAnimation = new Animated.Value(0)

  useEffect(() => {
    loadTreasureBoxStatus()
    
    // Set up interval to refresh status every 30 seconds
    const interval = setInterval(loadTreasureBoxStatus, 30000)
    
    return () => clearInterval(interval)
  }, [playerId])

  useEffect(() => {
    if (status) {
      startGlowAnimation()
    }
  }, [status])

  const loadTreasureBoxStatus = async () => {
    try {
      const treasureStatus = await TreasureBoxManager.getTreasureBoxStatus(playerId)
      setStatus(treasureStatus)
    } catch (error) {
      console.error('Error loading treasure box status:', error)
    } finally {
      setLoading(false)
    }
  }

  const startGlowAnimation = () => {
    if (!status) return
    
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      status.accumulated_gems, 
      status.max_storage
    )
    
    // Only animate glow if there are gems to claim
    if (fillPercentage > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }

  const handleClaimGems = async () => {
    if (!status || status.accumulated_gems <= 0 || claiming) return
    
    try {
      setClaiming(true)
      const result = await TreasureBoxManager.claimTreasureBoxGems(playerId)
      
      if (result && result.success) {
        setLastClaimMessage(`+${result.gems_claimed} gems claimed!`)
        
        // Notify parent component about gem update
        if (onGemsUpdated) {
          onGemsUpdated(result.new_gem_total)
        }
        
        // Refresh status after claiming
        await loadTreasureBoxStatus()
        
        // Clear message after 3 seconds
        setTimeout(() => setLastClaimMessage(''), 3000)
      } else {
        setLastClaimMessage(result?.message || 'Failed to claim gems')
        setTimeout(() => setLastClaimMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error claiming gems:', error)
      setLastClaimMessage('Error claiming gems')
      setTimeout(() => setLastClaimMessage(''), 3000)
    } finally {
      setClaiming(false)
    }
  }

  const getTreasureBoxEmoji = () => {
    if (!status) return '📦'
    
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      status.accumulated_gems, 
      status.max_storage
    )
    const state = TreasureBoxManager.getTreasureBoxState(fillPercentage)
    
    switch (state) {
      case 'full': return '🏆'
      case 'high': return '💰'
      case 'medium': return '💎'
      case 'low': return '📦'
      default: return '📦'
    }
  }

  const getBoxGlowStyle = () => {
    if (!status || status.accumulated_gems <= 0) return {}
    
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      status.accumulated_gems, 
      status.max_storage
    )
    
    if (fillPercentage >= 75) {
      return {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnimation,
        shadowRadius: 10,
        elevation: 8,
      }
    }
    
    return {}
  }

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContent}>
          <ActivityIndicator size="large" />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading treasure box...
          </Text>
        </Card.Content>
      </Card>
    )
  }

  if (!status) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="bodyMedium" style={styles.errorText}>
            Unable to load treasure box
          </Text>
        </Card.Content>
      </Card>
    )
  }

  const fillPercentage = TreasureBoxManager.calculateFillPercentage(
    status.accumulated_gems, 
    status.max_storage
  )
  const timeUntilFull = TreasureBoxManager.formatTimeUntilFull(status.time_until_full)
  const canClaim = status.accumulated_gems > 0

  return (
    <Card style={[styles.card, getBoxGlowStyle()]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Treasure Box 🏴‍☠️
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Generates {status.gems_per_hour} gems/hour
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.treasureBoxContainer}
          onPress={handleClaimGems}
          disabled={!canClaim || claiming}
        >
          <Animated.View style={styles.treasureBox}>
            <Text style={styles.treasureBoxEmoji}>
              {getTreasureBoxEmoji()}
            </Text>
            <Text variant="headlineSmall" style={styles.gemsCount}>
              {status.accumulated_gems}
            </Text>
            <Text variant="bodySmall" style={styles.gemsLabel}>
              💎 gems ready
            </Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.progressSection}>
          <ProgressBar 
            progress={fillPercentage / 100} 
            style={styles.progressBar}
          />
          <View style={styles.progressInfo}>
            <Text variant="bodySmall" style={styles.progressText}>
              {fillPercentage}% full ({status.accumulated_gems}/{status.max_storage})
            </Text>
            <Text variant="bodySmall" style={styles.timeText}>
              {status.is_full ? 'Full!' : `Full in: ${timeUntilFull}`}
            </Text>
          </View>
        </View>

        {canClaim && (
          <Button
            mode="contained"
            onPress={handleClaimGems}
            loading={claiming}
            disabled={claiming}
            style={styles.claimButton}
            contentStyle={styles.claimButtonContent}
          >
            {claiming ? 'Claiming...' : `Claim ${status.accumulated_gems} Gems`}
          </Button>
        )}

        {lastClaimMessage ? (
          <Text variant="bodyMedium" style={styles.claimMessage}>
            {lastClaimMessage}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContent: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666666',
  },
  treasureBoxContainer: {
    marginBottom: 20,
  },
  treasureBox: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#F7EFE5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A0C49D',
    minWidth: 150,
  },
  treasureBoxEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  gemsCount: {
    fontWeight: '700',
    color: '#A0C49D',
    marginBottom: 4,
  },
  gemsLabel: {
    color: '#666666',
  },
  progressSection: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    color: '#666666',
  },
  timeText: {
    color: '#A0C49D',
    fontWeight: '500',
  },
  claimButton: {
    backgroundColor: '#A0C49D',
    borderRadius: 8,
    marginTop: 8,
  },
  claimButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  claimMessage: {
    marginTop: 12,
    color: '#A0C49D',
    fontWeight: '600',
    textAlign: 'center',
  },
}) 