import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { Text, Portal, Modal, Card, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface LootModalProps {
  visible: boolean
  onDismiss: () => void
  gemsReceived: number
  title?: string
}

export default function LootModal({
  visible,
  onDismiss,
  gemsReceived,
  title = 'Loot Claimed!'
}: LootModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const sparkleAnim = useRef(new Animated.Value(0)).current
  const bounceAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Start entrance animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()

      // Start sparkle animation loop
      const sparkleLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      sparkleLoop.start()

      return () => {
        sparkleLoop.stop()
      }
    } else {
      // Reset animations when modal closes
      scaleAnim.setValue(0)
      sparkleAnim.setValue(0)
      bounceAnim.setValue(0)
    }
  }, [visible])

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  })

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
        style={styles.modal}
      >
        <Animated.View 
          style={[
            styles.cardContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Card style={styles.card}>
            <Card.Content style={styles.content}>
              {/* Sparkle Animation Background */}
              <Animated.View 
                style={[
                  styles.sparkleBackground,
                  {
                    transform: [{ rotate: sparkleRotation }],
                    opacity: sparkleAnim,
                  }
                ]}
              >
                <MaterialCommunityIcons 
                  name="star-four-points" 
                  size={100} 
                  color="#FFD700" 
                />
              </Animated.View>

              <Text variant="headlineMedium" style={styles.title}>
                {title}
              </Text>

              <View style={styles.rewardContainer}>
                <Animated.View 
                  style={[
                    styles.gemReward,
                    {
                      transform: [{ scale: bounceScale }]
                    }
                  ]}
                >
                  <MaterialCommunityIcons 
                    name="diamond" 
                    size={48} 
                    color="#A0C49D" 
                  />
                  <Text variant="headlineSmall" style={styles.gemAmount}>
                    +{gemsReceived}
                  </Text>
                  <Text variant="bodyMedium" style={styles.gemLabel}>
                    Gems
                  </Text>
                </Animated.View>
              </View>

              <Button
                mode="contained"
                onPress={onDismiss}
                style={styles.collectButton}
                contentStyle={styles.collectButtonContent}
              >
                Awesome!
              </Button>
            </Card.Content>
          </Card>
        </Animated.View>
      </Modal>
    </Portal>
  )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: width * 0.85,
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  sparkleBackground: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -50,
    zIndex: 0,
  },
  title: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
    zIndex: 1,
  },
  rewardContainer: {
    alignItems: 'center',
    marginVertical: 20,
    zIndex: 1,
  },
  gemReward: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7EFE5',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#A0C49D',
    minWidth: 120,
  },
  gemAmount: {
    fontWeight: '700',
    color: '#A0C49D',
    marginTop: 8,
    marginBottom: 4,
  },
  gemLabel: {
    color: '#666666',
    fontWeight: '500',
  },
  collectButton: {
    backgroundColor: '#A0C49D',
    borderRadius: 12,
    marginTop: 20,
    minWidth: 120,
  },
  collectButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
}) 