import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
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
  const [showLootModal, setShowLootModal] = useState(false)
  const [claimedGems, setClaimedGems] = useState(0)
  const [accumulationTime, setAccumulationTime] = useState('00:00:00')
  const [clientAccumulatedGems, setClientAccumulatedGems] = useState(0)
  
  // Animation for treasure box glow and chest shaking
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
      diffInMinutes: diffInSeconds / 60
    })

    // Cap at 30 hours (108000 seconds)
    const cappedSeconds = Math.min(diffInSeconds, 30 * 60 * 60)

    const hours = Math.floor(cappedSeconds / 3600)
    const minutes = Math.floor((cappedSeconds % 3600) / 60)
    const seconds = cappedSeconds % 60

    // Format as hh:mm:ss
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    
    // Calculate client-side accumulated gems based on minutes (1 gem per minute)
    // Note: gems_per_hour from server is 60 (representing 1 gem per minute)
    // but we calculate directly from minutes for more precise client-side updates
    const minutesElapsed = Math.min(diffInSeconds / 60, 30 * 60) // Cap at 30 hours = 1800 minutes
    const calculatedGems = Math.floor(minutesElapsed) // 1 gem per minute
    const cappedGems = Math.min(calculatedGems, currentStatus.max_storage || 300)
    
    console.log('⏰ Client calculation:', {
      formattedTime,
      minutesElapsed,
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
      }
    } catch (error) {
      console.error('Error claiming gems:', error)
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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A0C49D" />
      </View>
    )
  }

  if (!status) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.errorText}>
          Unable to load treasure box
        </Text>
      </View>
    )
  }

  const canClaim = clientAccumulatedGems > 0

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.treasureBoxContainer}
          onPress={handleClaimGems}
          disabled={!canClaim || claiming}
          activeOpacity={0.7}
        >
          {/* Separate glow animation view */}
          <Animated.View style={getBoxGlowStyle()}>
            {/* Transform animation view */}
            <Animated.View style={[styles.treasureBox, getOpeningTransform()]}>
              <Animated.View style={getIconShakeTransform()}>
                <MaterialCommunityIcons 
                  name="treasure-chest"
                  size={80}
                  color={getTreasureChestColor()}
                  style={styles.treasureChestIcon}
                />
              </Animated.View>
              {clientAccumulatedGems > 0 && (
                <View style={styles.gemsBadge}>
                  <Text variant="bodySmall" style={styles.gemsBadgeText}>
                    {clientAccumulatedGems}
                  </Text>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
        
        <Text variant="bodyMedium" style={styles.accumulationTime}>
          {accumulationTime}
        </Text>
      </View>

      <LootModal
        visible={showLootModal}
        onDismiss={() => setShowLootModal(false)}
        gemsReceived={claimedGems}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  treasureBoxContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  treasureBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  treasureChestIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gemsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  gemsBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  accumulationTime: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
  },
}) 