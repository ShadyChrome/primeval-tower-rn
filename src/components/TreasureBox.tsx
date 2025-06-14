import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Text, ActivityIndicator } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { TreasureBoxManager } from '../lib/treasureBoxManager'
import { TreasureBoxStatus } from '../types/supabase'
import LootModal from './LootModal'
import { HapticManager } from '../src/utils/haptics'

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
  
  // Animation for treasure chest shaking
  const iconShakeAnimation = useRef(new Animated.Value(0)).current
  const scaleAnimation = useRef(new Animated.Value(1)).current
  
  // Animation loop reference for proper cleanup
  const shakeLoopRef = useRef<Animated.CompositeAnimation | null>(null)
  
  // Timer reference for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Ref to store current status to avoid stale closure issues
  const statusRef = useRef(status)

  // Load initial status only once
  useEffect(() => {
    loadTreasureBoxStatus()
  }, [playerId])

  // Create a shared timer update function
  const updateClientSideTimer = React.useCallback(() => {
    if (!status) {
      console.log('🚨 No status available yet, skipping timer update')
      return
    }
    
    if (!status.last_claim_time) {
      console.log('🚨 No last_claim_time found in status:', status)
      setAccumulationTime('00:00:00')
      setClientAccumulatedGems(0)
      return
    }

    console.log('⏰ Client-side timer calculation:', {
      last_claim_time: status.last_claim_time,
      current_time: new Date().toISOString()
    })

    const lastClaimDate = new Date(status.last_claim_time)
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
    const minutesElapsed = Math.min(diffInSeconds / 60, 30 * 60) // Cap at 30 hours = 1800 minutes
    const calculatedGems = Math.floor(minutesElapsed) // 1 gem per minute
    const cappedGems = Math.min(calculatedGems, status.max_storage || 300)
    
    console.log('⏰ Client calculation:', {
      formattedTime,
      minutesElapsed,
      calculatedGems: cappedGems
    })
    
    setAccumulationTime(formattedTime)
    setClientAccumulatedGems(cappedGems)
  }, [status])

  // Navigation-aware timer management
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 TreasureBox: Screen focused - starting timer')
      
      // Start the timer when screen becomes focused and we have status
      if (status) {
        updateClientSideTimer() // Immediate update
        timerRef.current = setInterval(updateClientSideTimer, 1000)
      }
      
      return () => {
        // Cleanup timer when screen loses focus or unmounts
        console.log('⏸️ TreasureBox: Screen unfocused - pausing timer')
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }, [status, updateClientSideTimer]) // Re-run when status or timer function changes
  )

  useEffect(() => {
    statusRef.current = status
    if (status) {
      startAnimations()
      updateClientSideTimer()
    }
  }, [status, updateClientSideTimer])

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
    
    // Stop any existing animations first
    stopAnimations()
    
    // Use client-side calculated gems for animations
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      clientAccumulatedGems, 
      status.max_storage
    )
    
    // Only animate if there are gems to claim
    if (fillPercentage > 0) {
      // Shake animation for treasure chest icon only
      shakeLoopRef.current = Animated.loop(
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
      )
      shakeLoopRef.current.start()
    }
  }

  const stopAnimations = () => {
    if (shakeLoopRef.current) {
      shakeLoopRef.current.stop()
      shakeLoopRef.current = null
    }
    // Reset animation values
    iconShakeAnimation.setValue(0)
  }

  // Re-run animations when client gems change
  useEffect(() => {
    if (status && clientAccumulatedGems !== undefined) {
      if (clientAccumulatedGems > 0) {
        startAnimations()
      } else {
        stopAnimations()
      }
    }
  }, [clientAccumulatedGems])

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      stopAnimations()
    }
  }, [])

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
      HapticManager.medium() // Initial feedback for starting claim
      setClaiming(true)
      
      // Start opening animation
      await startOpeningAnimation()
      
      const result = await TreasureBoxManager.claimTreasureBoxGems(playerId)
      
      if (result && result.success) {
        HapticManager.success() // Success feedback for successful claim
        setClaimedGems(result.gems_claimed)
        setShowLootModal(true)
        
        // Immediately reset client state (optimistic update)
        setAccumulationTime('00:00:00')
        setClientAccumulatedGems(0) // This will trigger stopAnimations via useEffect
        
        // Notify parent component about gem update
        if (onGemsUpdated) {
          onGemsUpdated(result.new_gem_total)
        }
        
        // Wait a moment for server to process, then refresh status with timer update
        setTimeout(async () => {
          await loadTreasureBoxStatus(true)
        }, 500)
      } else {
        HapticManager.error() // Error feedback for failed claim
      }
    } catch (error) {
      HapticManager.error() // Error feedback for exceptions
      console.error('Error claiming gems:', error)
    } finally {
      setClaiming(false)
    }
  }

  const getTreasureChestColor = () => {
    if (!status) return '#ADB5BD'
    
    // Use client-side calculated gems
    const fillPercentage = TreasureBoxManager.calculateFillPercentage(
      clientAccumulatedGems, 
      status.max_storage
    )
    const state = TreasureBoxManager.getTreasureBoxState(fillPercentage)
    
    switch (state) {
      case 'full': return '#FFA8A8'      // Mythical - Soft Coral
      case 'high': return '#FFCC8A'      // Legendary - Warm Peach
      case 'medium': return '#B197FC'    // Epic - Lavender Purple
      case 'low': return '#74C0FC'       // Rare - Pastel Blue
      default: return '#ADB5BD'          // Common - Soft Gray
    }
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
        <ActivityIndicator size="large" color="#B197FC" />
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
          onPress={() => {
            if (canClaim && !claiming) {
              HapticManager.light() // Light feedback for touch
              handleClaimGems()
            }
          }}
          disabled={!canClaim || claiming}
          activeOpacity={0.7}
        >
          {/* Transform animation view */}
          <Animated.View style={[styles.treasureBox, getOpeningTransform()]}>
            <Animated.View style={getIconShakeTransform()}>
              <MaterialCommunityIcons 
                name="treasure-chest"
                size={80}
                color={getTreasureChestColor()}
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