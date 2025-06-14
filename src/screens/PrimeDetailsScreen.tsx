import React, { useState, useCallback } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
  FadeIn,
  FadeOut
} from 'react-native-reanimated'

import { ElementIcon, PrimeImage } from '../components/OptimizedImage'
import {
  MemoizedStatsSection,
  MemoizedAbilitiesSection,
  MemoizedElementAdvantages,
  MemoizedRuneEquipment,
  MemoizedUpgradeSection
} from '../components/MemoizedSections'
import LoadingSkeleton, { 
  StatBarSkeleton, 
  AbilityCardSkeleton, 
  PrimeHeaderSkeleton 
} from '../components/LoadingSkeleton'
import { HapticManager } from '../utils/haptics'
import { colors, spacing, typography } from '../theme/designSystem'
import { PlayerRune } from '../../types/supabase'
import { RuneService } from '../services/runeService'
import { 
  savePrimeRuneEquipment, 
  loadPrimeRuneEquipment
} from '../utils/primeRuneStorage'
import { UIPrime, PrimeService } from '../services/primeService'

// Use UIPrime interface from the service
type Prime = UIPrime

interface PrimeAbility {
  id: string
  name: string
  description: string
  level: number
  maxLevel: number
  power: number
  staminaCost: number
  cooldown: number
  statusEffects: string[]
  elementalDamage: boolean
}

// Generate detailed ability data from basic ability names
const generateAbilityData = (prime: Prime): PrimeAbility[] => {
  const abilityTemplates: { [key: string]: Partial<PrimeAbility> } = {
    // Ignis abilities
    'Fire Blast': {
      description: 'Unleashes a concentrated blast of fire energy dealing high damage.',
      power: 120,
      staminaCost: 25,
      cooldown: 3,
      statusEffects: ['Burn'],
      elementalDamage: true,
    },
    'Aerial Claw': {
      description: 'Swift aerial attack with razor-sharp claws.',
      power: 90,
      staminaCost: 20,
      cooldown: 2,
      statusEffects: [],
      elementalDamage: false,
    },
    'Fireball': {
      description: 'Launches a blazing fireball that explodes on impact.',
      power: 100,
      staminaCost: 22,
      cooldown: 4,
      statusEffects: ['Burn', 'Fear'],
      elementalDamage: true,
    },
    'King of the Skies': {
      description: 'Ultimate aerial dominance ability that strikes from above.',
      power: 180,
      staminaCost: 40,
      cooldown: 8,
      statusEffects: ['Intimidate', 'Knockdown'],
      elementalDamage: true,
    },
    'Poison Tail': {
      description: 'Venomous tail strike that inflicts lasting poison damage.',
      power: 95,
      staminaCost: 18,
      cooldown: 3,
      statusEffects: ['Poison'],
      elementalDamage: false,
    },
    'Fire Breath': {
      description: 'Breathes intense flames in a wide arc.',
      power: 110,
      staminaCost: 30,
      cooldown: 5,
      statusEffects: ['Burn'],
      elementalDamage: true,
    },
    'Spike Barrage': {
      description: 'Launches multiple poisonous spikes at enemies.',
      power: 85,
      staminaCost: 25,
      cooldown: 4,
      statusEffects: ['Poison', 'Slow'],
      elementalDamage: false,
    },
    'Supernova': {
      description: 'Explosive ultimate ability that devastates the battlefield.',
      power: 220,
      staminaCost: 50,
      cooldown: 12,
      statusEffects: ['Burn', 'Blind', 'Knockdown'],
      elementalDamage: true,
    },
    // Add other elements' abilities as needed...
  }

  return prime.abilities.map((abilityName, index) => {
    const template = abilityTemplates[abilityName] || {
      description: 'A powerful ability unique to this Prime.',
      power: 80,
      staminaCost: 20,
      cooldown: 3,
      statusEffects: [],
      elementalDamage: true,
    }

    // Use actual ability level from database
    const maxLevel = index === 0 ? 15 : index === 1 ? 12 : 10 // First ability can be leveled higher
    const abilityLevel = prime.abilityLevels[index] ?? 1 // Default to level 1 if not found

    // Scale power with ability level and prime power
    const scaledPower = Math.floor((template.power || 80) * (1 + abilityLevel * 0.1) * (prime.power / 1000))

    return {
      id: `${prime.id}_ability_${index}`,
      name: abilityName,
      description: template.description || 'A powerful ability unique to this Prime.',
      level: abilityLevel,
      maxLevel,
      power: scaledPower,
      staminaCost: template.staminaCost || 20,
      cooldown: template.cooldown || 3,
      statusEffects: template.statusEffects || [],
      elementalDamage: template.elementalDamage !== undefined ? template.elementalDamage : true,
    }
  })
}

type RootStackParamList = {
  MainTabs: undefined
  PrimeDetails: { 
    prime: Prime
    primesList: Prime[]
    currentIndex: number
  }
}

type PrimeDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PrimeDetails'>
type PrimeDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PrimeDetails'>

const elementColors = {
  Ignis: '#FF6B6B',
  Vitae: '#51CF66',
  Azur: '#339AF0',
  Geo: '#9775FA',
  Tempest: '#FFD43B',
  Aeris: '#74C0FC'
}

const rarityColors = {
  Common: '#ADB5BD',
  Rare: '#74C0FC',
  Epic: '#B197FC',
  Legendary: '#FFCC8A',
  Mythical: '#FFA8A8'
}

export default function PrimeDetailsScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'matchups' | 'runes' | 'upgrade'>('stats')
  const [currentPrime, setCurrentPrime] = useState<Prime | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [equippedRunes, setEquippedRunes] = useState<(PlayerRune | null)[]>(Array(6).fill(null))
  const [allRunes, setAllRunes] = useState<PlayerRune[]>([])
  const [availableRunes, setAvailableRunes] = useState<PlayerRune[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunesLoading, setIsRunesLoading] = useState(false)
  
  const navigation = useNavigation<PrimeDetailsScreenNavigationProp>()
  const route = useRoute<PrimeDetailsScreenRouteProp>()
  const insets = useSafeAreaInsets()
  
  const { prime, primesList, currentIndex: initialIndex } = route.params
  
  // Load Prime-specific runes and data
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      if (prime) {
        setCurrentPrime(prime)
        setCurrentIndex(initialIndex)
        
        try {
          setIsRunesLoading(true)
          
          // Load data in parallel for better performance
          const [primeEquippedRunes, playerRunes, availableRunesList] = await Promise.all([
            loadPrimeRuneEquipment(prime.id),
            RuneService.getPlayerRunes(),
            RuneService.getAvailableRunes()
          ])
          
          setEquippedRunes(primeEquippedRunes)
          setAllRunes(playerRunes)
          setAvailableRunes(availableRunesList)
        } catch (error) {
          console.error('Error loading prime data:', error)
        } finally {
          setIsRunesLoading(false)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [prime, initialIndex])

  // Refresh prime data when screen comes into focus
  React.useEffect(() => {
    const refreshPrimeData = async () => {
      if (currentPrime) {
        // Refresh the prime data from database to get latest experience, level, etc.
        const updatedPrime = await PrimeService.getPrimeById(currentPrime.id)
        if (updatedPrime) {
          setCurrentPrime(updatedPrime)
        }
      }
    }

    refreshPrimeData()
  }, [currentPrime?.id])

  // Save runes when Prime changes
  React.useEffect(() => {
    const saveData = async () => {
      if (currentPrime && equippedRunes.some(rune => rune !== null)) {
        await savePrimeRuneEquipment(currentPrime.id, equippedRunes)
      }
    }
    
    saveData()
  }, [currentPrime, equippedRunes])
  
  // Handle invalid route params
  React.useEffect(() => {
    if (!prime || !primesList) {
      navigation.goBack()
    }
  }, [prime, primesList, navigation])
  
  // Memoized handlers for better performance
  const handleTabChange = useCallback((tab: 'stats' | 'abilities' | 'matchups' | 'runes' | 'upgrade') => {
    HapticManager.tabSwitch()
    setActiveTab(tab)
  }, [])
  
  const handlePrimeUpdate = useCallback((updates: Partial<Prime>) => {
    setCurrentPrime(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      console.log('Prime updated:', {
        id: updated.id,
        name: updated.name,
        level: updated.level,
        abilityLevels: updated.abilityLevels
      })
      return updated
    })
  }, [])
  
  // Loading state
  if (!currentPrime || !primesList || isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PrimeHeaderSkeleton />
        <View style={styles.tabContainer}>
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingSkeleton key={index} width="20%" height={40} borderRadius={8} />
          ))}
        </View>
        <ScrollView style={styles.contentContainer}>
          {activeTab === 'stats' && (
            <View>
              {Array.from({ length: 6 }).map((_, index) => (
                <StatBarSkeleton key={index} />
              ))}
            </View>
          )}
          {activeTab === 'abilities' && (
            <View>
              {Array.from({ length: 3 }).map((_, index) => (
                <AbilityCardSkeleton key={index} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    )
  }

  const primaryColor = elementColors[currentPrime.element]
  const rarityColor = rarityColors[currentPrime.rarity]

  // Rune equipment handlers
  const handleRuneEquip = async (slotIndex: number, rune: PlayerRune | null) => {
    const newEquippedRunes = [...equippedRunes]
    newEquippedRunes[slotIndex] = rune
    setEquippedRunes(newEquippedRunes)
    
    // Save immediately
    if (currentPrime) {
      await savePrimeRuneEquipment(currentPrime.id, newEquippedRunes)
      
      // Refresh available runes list
      const availableRunesList = await RuneService.getAvailableRunes()
      setAvailableRunes(availableRunesList)
    }
  }

  const handleRuneUnequip = async (slotIndex: number) => {
    const newEquippedRunes = [...equippedRunes]
    newEquippedRunes[slotIndex] = null
    setEquippedRunes(newEquippedRunes)
    
    // Save immediately
    if (currentPrime) {
      await savePrimeRuneEquipment(currentPrime.id, newEquippedRunes)
      
      // Refresh available runes list
      const availableRunesList = await RuneService.getAvailableRunes()
      setAvailableRunes(availableRunesList)
    }
  }

  // Navigation functions
  const navigateToPrevious = async () => {
    if (currentIndex > 0 && currentPrime) {
      HapticManager.primeNavigate()
      
      // Save current Prime's runes
      await savePrimeRuneEquipment(currentPrime.id, equippedRunes)
      
      const newIndex = currentIndex - 1
      const newPrime = primesList[newIndex]
      
      // Load new Prime's runes
      const newPrimeEquippedRunes = await loadPrimeRuneEquipment(newPrime.id)
      
      setCurrentPrime(newPrime)
      setCurrentIndex(newIndex)
      setEquippedRunes(newPrimeEquippedRunes)
    }
  }

  const navigateToNext = async () => {
    if (currentIndex < primesList.length - 1 && currentPrime) {
      HapticManager.primeNavigate()
      
      // Save current Prime's runes
      await savePrimeRuneEquipment(currentPrime.id, equippedRunes)
      
      const newIndex = currentIndex + 1
      const newPrime = primesList[newIndex]
      
      // Load new Prime's runes
      const newPrimeEquippedRunes = await loadPrimeRuneEquipment(newPrime.id)
      
      setCurrentPrime(newPrime)
      setCurrentIndex(newIndex)
      setEquippedRunes(newPrimeEquippedRunes)
    }
  }

  // Swipe gesture handler
  const onSwipeGesture = (event: any) => {
    if (event.nativeEvent.state === 5) { // 5 = END state
      const { translationX, velocityX } = event.nativeEvent
      
      // Determine swipe direction and threshold
      const swipeThreshold = 50
      const velocityThreshold = 500
      
      if (translationX > swipeThreshold || velocityX > velocityThreshold) {
        // Swipe right -> Previous prime
        navigateToPrevious()
      } else if (translationX < -swipeThreshold || velocityX < -velocityThreshold) {
        // Swipe left -> Next prime
        navigateToNext()
      }
    }
  }

  const tabs = [
    { key: 'stats', label: 'Stats' },
    { key: 'abilities', label: 'Abilities' }, 
    { key: 'matchups', label: 'Elements' },
    { key: 'runes', label: 'Runes' },
    { key: 'upgrade', label: 'Upgrade' }
  ] as const

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PanGestureHandler onHandlerStateChange={onSwipeGesture}>
        <View style={styles.gestureContainer}>
          {/* Compact Header with Image and Info */}
          <LinearGradient
            colors={[primaryColor + '20', primaryColor + '10', 'transparent']}
            style={styles.header}
          >
            {/* Back Button */}
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={colors.text}
              onPress={() => {
                HapticManager.modalClose()
                navigation.goBack()
              }}
              style={styles.backButton}
            />

            {/* Navigation indicators */}
            <View style={styles.navigationIndicators}>
              <Text variant="bodySmall" style={styles.positionText}>
                {currentIndex + 1} of {primesList.length}
              </Text>
              <View style={styles.navigationButtons}>
                <IconButton
                  icon="chevron-left"
                  size={20}
                  iconColor={currentIndex > 0 ? colors.text : colors.textTertiary}
                  onPress={navigateToPrevious}
                  disabled={currentIndex === 0}
                  style={styles.navButton}
                />
                <IconButton
                  icon="chevron-right"
                  size={20}
                  iconColor={currentIndex < primesList.length - 1 ? colors.text : colors.textTertiary}
                  onPress={navigateToNext}
                  disabled={currentIndex === primesList.length - 1}
                  style={styles.navButton}
                />
              </View>
            </View>

            {/* Compact Header Layout */}
            <View style={styles.compactHeader}>
              {/* Left: Prime Image */}
              <View style={styles.primeImageContainer}>
                <View style={[
                  styles.primeImageBackground,
                  { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }
                ]}>
                  <PrimeImage 
                    primeName={currentPrime.imageName || 'Rathalos'} 
                    width={80}
                    height={80}
                    style={styles.primeImage}
                  />
                </View>
              </View>

              {/* Right: Prime Info */}
              <View style={styles.primeInfo}>
                <Text variant="headlineSmall" style={[styles.primeName, { color: primaryColor }]}>
                  {currentPrime.name}
                </Text>
                
                <Text variant="titleMedium" style={styles.levelText}>
                  Level {currentPrime.level} • {currentPrime.rarity} • {currentPrime.power} Power
                </Text>

                <View style={styles.badgeContainer}>
                  <View style={[styles.elementBadge, { backgroundColor: primaryColor + '10' }]}>
                    <ElementIcon element={currentPrime.element} size="small" />
                    <Text variant="bodySmall" style={[styles.badgeText, { color: primaryColor }]}>
                      {currentPrime.element}
                    </Text>
                  </View>
                  
                  <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                    <Text variant="bodySmall" style={styles.badgeText}>
                      {currentPrime.rarity}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: primaryColor + '20' }
            ]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text 
              variant="bodyMedium" 
              style={[
                styles.tabText,
                activeTab === tab.key && { color: primaryColor, fontWeight: '600' }
              ]}
                          >
                {tab.key === 'matchups' ? 'Elements' : tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
              </Text>
          </TouchableOpacity>
        ))}
      </View>

          {/* Content Area */}
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {activeTab === 'stats' && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                <MemoizedStatsSection prime={currentPrime} primaryColor={primaryColor} equippedRunes={equippedRunes} />
              </Animated.View>
            )}

            {activeTab === 'abilities' && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                <MemoizedAbilitiesSection prime={currentPrime} primaryColor={primaryColor} />
              </Animated.View>
            )}

            {activeTab === 'matchups' && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                <MemoizedElementAdvantages element={currentPrime.element} primaryColor={primaryColor} />
              </Animated.View>
            )}

            {activeTab === 'runes' && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                <MemoizedRuneEquipment
                  prime={currentPrime}
                  primaryColor={primaryColor}
                  equippedRunes={equippedRunes}
                  availableRunes={availableRunes}
                  onRuneEquip={handleRuneEquip}
                  onRuneUnequip={handleRuneUnequip}
                />
              </Animated.View>
            )}

            {activeTab === 'upgrade' && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
                <MemoizedUpgradeSection
                  prime={currentPrime}
                  abilities={generateAbilityData(currentPrime)}
                  primaryColor={primaryColor}
                  onPrimeUpdated={handlePrimeUpdate}
                />
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </PanGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    flexShrink: 0,
  },
  backButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 10,
    backgroundColor: colors.surface + 'AA',
    margin: 0,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  primeImageContainer: {
    alignItems: 'center',
  },
  primeImageBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  primeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  primeName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  levelText: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  primeImage: {
    borderRadius: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  elementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },
  rarityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  badgeText: {
    color: colors.surface,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    margin: spacing.md,
    borderRadius: 12,
    padding: spacing.xs,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  placeholder: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  gestureContainer: {
    flex: 1,
  },
  navigationIndicators: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  positionText: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    backgroundColor: colors.surface + 'DD',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navButton: {
    backgroundColor: colors.surface + 'DD',
    margin: 0,
    width: 32,
    height: 32,
  },
}) 