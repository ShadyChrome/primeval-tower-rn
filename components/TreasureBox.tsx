import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Text, Card, Button, ProgressBar, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TreasureBoxManager } from '../lib/treasureBoxManager'
import { TreasureBoxStatus } from '../types/supabase'
import LootModal from './LootModal'

interface TreasureBoxProps {
  playerId: string
  onGemsUpdated?: (newGemTotal: number) => void
}

export default function TreasureBox({ playerId, onGemsUpdated }: TreasureBoxProps) {
  const [status, setStatus] = useState<TreasureBoxStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [lastClaimMessage, setLastClaimMessage] = useState('')
  const [showLootModal, setShowLootModal] = useState(false)
  const [claimedGems, setClaimedGems] = useState(0)
  const [accumulationTime, setAccumulationTime] = useState('00:00:00')
  const [clientAccumulatedGems, setClientAccumulatedGems] = useState(0)
  
  // Animation for treasure box glow and chest opening
  const glowAnimation = useRef(new Animated.Value(0)).current
  const iconShakeAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(1)).current
  
  // Ref to store current status to avoid stale closure issues
  const statusRef = useRef(status)

  useEffect(() => {
    // Only load initial status - no polling!
    loadTreasureBoxStatus()
    
    // Start client-side timer that updates every second
    // But it will only work once status is loaded
    const timerInterval = setInterval(updateClientSideTimer, 1000)
    
    return () => {
      clearInterval(timerInterval)
    }
  }, [playerId])

  useEffect(() => {
    statusRef.current = status
    if (status) {
      startAnimations()
      updateClientSideTimer()
    }
  }, [status])

  const updateClientSideTimer = () => {
    const currentStatus = statusRef.current
    
    if (!currentStatus) {
      console.log('🚨 No status available yet, skipping timer update')
      return
    }
    
    if (!currentStatus.last_claim_time) {
      console.log('🚨 No last_claim_time found in status:', currentStatus)
      setAccumulationTime('00:00:00')
      setClientAccumulatedGems(0)
      return
    }

    console.log('⏰ Client-side timer calculation:', {
      last_claim_time: currentStatus.last_claim_time,
      current_time: new Date().toISOString()
    })

    const lastClaimDate = new Date(currentStatus.last_claim_time)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - lastClaimDate.getTime()) / 1000)

    console.log('⏰ Time calculation:', {
      lastClaimDate: lastClaimDate.toISOString(),
      now: now.toISOString(),
      diffInSeconds,
      diffInHours: diffInSeconds / 3600
    })

    // Cap at 30 hours (108000 seconds)
    const cappedSeconds = Math.min(diffInSeconds, 30 * 60 * 60)

    const hours = Math.floor(cappedSeconds / 3600)
    const minutes = Math.floor((cappedSeconds % 3600) / 60)
    const seconds = cappedSeconds % 60

    // Format as hh:mm:ss
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    // Calculate client-side accumulated gems
    const hoursElapsed = Math.min(diffInSeconds / 3600, 30)
    const calculatedGems = Math.floor(hoursElapsed * (currentStatus.gems_per_hour || 10))
    const cappedGems = Math.min(calculatedGems, currentStatus.max_storage || 300)
    
    console.log('⏰ Client calculation:', {
      formattedTime,
      hoursElapsed,
      calculatedGems: cappedGems
    })
    
    setAccumulationTime(formattedTime)
    setClientAccumulatedGems(cappedGems)
  }

  const loadTreasureBoxStatus = async (forceTimerUpdate = false) => {
    try {
      const treasureStatus = await TreasureBoxManager.getTreasureBoxStatus(playerId)
      setStatus(treasureStatus)
      
      // Force timer update if requested (useful after claiming)
      if (forceTimerUpdate && treasureStatus) {
        // Update timer with new status
        setTimeout(() => {
          updateClientSideTimer()
        }, 100)
      }
    } catch (error) {
      console.error('Error loading treasure box status:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAnimations = () => {
    if (!status) return
    
    // Use client-side calculated gems for animations
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      clientAccumulatedGems, 
      status.max_storage
    )
    
    // Only animate if there are gems to claim
    if (fillPercentage > 0) {
      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start()

      // Shake animation for treasure chest icon only
      if (fillPercentage > 0) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(iconShakeAnimation, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(iconShakeAnimation, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(iconShakeAnimation, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
          ])
        ).start()
      }
    }
  }

  // Re-run animations when client gems change
  useEffect(() => {
    if (status && clientAccumulatedGems !== undefined) {
      startAnimations()
    }
  }, [clientAccumulatedGems])

  const startOpeningAnimation = () => {
    return new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => resolve())
    })
  }

  const handleClaimGems = async () => {
    if (!status || clientAccumulatedGems <= 0 || claiming) return
    
    try {
      setClaiming(true)
      
      // Start opening animation
      await startOpeningAnimation()
      
      const result = await TreasureBoxManager.claimTreasureBoxGems(playerId)
      
      if (result && result.success) {
        setClaimedGems(result.gems_claimed)
        setShowLootModal(true)
        
        // Immediately reset timer display (optimistic update)
        setAccumulationTime('00:00:00')
        
        // Notify parent component about gem update
        if (onGemsUpdated) {
          onGemsUpdated(result.new_gem_total)
        }
        
        // Wait a moment for server to process, then refresh status with timer update
        setTimeout(async () => {
          await loadTreasureBoxStatus(true)
        }, 500)
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

  const getTreasureChestColor = () => {
    if (!status) return '#A0C49D'
    
    // Use client-side calculated gems
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      clientAccumulatedGems, 
      status.max_storage
    )
    const state = TreasureBoxManager.getTreasureBoxState(fillPercentage)
    
    switch (state) {
      case 'full': return '#FFD700'
      case 'high': return '#FFA500'
      case 'medium': return '#A0C49D'
      case 'low': return '#A0C49D'
      default: return '#999999'
    }
  }

  const getBoxGlowStyle = () => {
    if (!status || clientAccumulatedGems <= 0) return {}
    
    // Use client-side calculated gems
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      clientAccumulatedGems, 
      status.max_storage
    )
    
    if (fillPercentage > 0) {
      return {
        shadowColor: getTreasureChestColor(),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 0.8],
        }),
        shadowRadius: 15,
        elevation: 12,
      }
    }
    
    return {}
  }

  const getIconShakeTransform = () => {
    return {
      transform: [
        {
          translateX: iconShakeAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-3, 0, 3],
          })
        },
        {
          rotate: iconShakeAnimation.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-2deg', '0deg', '2deg'],
          })
        }
      ]
    }
  }

  const getOpeningTransform = () => {
    return {
      transform: [
        { 
          scale: scaleAnimation 
        }
      ]
    }
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

  // Use client-side calculations for display
  const fillPercentage = TreasureBoxManager.calculateFillPercentage(
    clientAccumulatedGems, 
    status.max_storage
  )
  const timeUntilFull = TreasureBoxManager.formatTimeUntilFull(status.time_until_full)
  const canClaim = clientAccumulatedGems > 0

  return (
    <>
      <Animated.View style={getBoxGlowStyle()}>
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <View style={styles.header}>
              <Text variant="titleLarge" style={styles.title}>
                Treasure Box
              </Text>
              <Text variant="bodySmall" style={styles.subtitle}>
                Generates {status.gems_per_hour} gems/hour
              </Text>
              <Text variant="bodySmall" style={styles.accumulationText}>
                Accumulating: {accumulationTime}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.treasureBoxContainer}
              onPress={handleClaimGems}
              disabled={!canClaim || claiming}
            >
              <Animated.View style={[styles.treasureBox, getOpeningTransform()]}>
                <Animated.View style={getIconShakeTransform()}>
                  <MaterialCommunityIcons 
                    name={'treasure-chest'}
                    size={64}
                    color={getTreasureChestColor()}
                    style={styles.treasureChestIcon}
                  />
                </Animated.View>
                <Text variant="headlineSmall" style={styles.gemsCount}>
                  {clientAccumulatedGems}
                </Text>
                <View style={styles.gemsLabelContainer}>
                  <MaterialCommunityIcons 
                    name="diamond" 
                    size={16} 
                    color="#666666" 
                  />
                  <Text variant="bodySmall" style={styles.gemsLabel}>
                    gems ready
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.progressSection}>
              <ProgressBar 
                progress={fillPercentage / 100} 
                style={styles.progressBar}
              />
              <View style={styles.progressInfo}>
                <Text variant="bodySmall" style={styles.progressText}>
                  {fillPercentage}% full ({clientAccumulatedGems}/{status.max_storage})
                </Text>
                <Text variant="bodySmall" style={styles.timeText}>
                  {fillPercentage >= 100 ? 'Full!' : `Full in: ${timeUntilFull}`}
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
                {claiming ? 'Opening...' : `Claim ${clientAccumulatedGems} Gems`}
              </Button>
            )}

            {lastClaimMessage ? (
              <Text variant="bodyMedium" style={styles.claimMessage}>
                {lastClaimMessage}
              </Text>
            ) : null}
          </Card.Content>
        </Card>
      </Animated.View>

      <LootModal
        visible={showLootModal}
        onDismiss={() => setShowLootModal(false)}
        gemsReceived={claimedGems}
      />
    </>
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
  accumulationText: {
    color: '#999999',
    fontStyle: 'italic',
    marginTop: 4,
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
  treasureChestIcon: {
    marginBottom: 8,
  },
  gemsCount: {
    fontWeight: '700',
    color: '#A0C49D',
    marginBottom: 4,
  },
  gemsLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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