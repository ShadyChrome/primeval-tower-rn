import React, { useState, useMemo } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { PanGestureHandler } from 'react-native-gesture-handler'

import { ElementIcon, PrimeImage } from '../../components/OptimizedImage'
import { ElementType, PrimeImageType } from '../assets/ImageAssets'
import StatsSection from '../components/modals/sections/StatsSection'
import AbilitiesSection from '../components/modals/sections/AbilitiesSection'
import ElementAdvantages from '../components/modals/sections/ElementAdvantages'
import RuneEquipment from '../components/modals/sections/RuneEquipment'
import { colors, spacing, typography } from '../theme/designSystem'
import { PlayerRune } from '../../types/supabase'
import { RuneService } from '../services/runeService'
import { 
  savePrimeRuneEquipment, 
  loadPrimeRuneEquipment
} from '../utils/primeRuneStorage'
import { UIPrime } from '../services/primeService'

// Use UIPrime interface from the service
type Prime = UIPrime

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
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'matchups' | 'runes'>('stats')
  const [currentPrime, setCurrentPrime] = useState<Prime | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [equippedRunes, setEquippedRunes] = useState<(PlayerRune | null)[]>(Array(6).fill(null))
  const [allRunes, setAllRunes] = useState<PlayerRune[]>([])
  const [availableRunes, setAvailableRunes] = useState<PlayerRune[]>([])
  
  const navigation = useNavigation<PrimeDetailsScreenNavigationProp>()
  const route = useRoute<PrimeDetailsScreenRouteProp>()
  const insets = useSafeAreaInsets()
  
  const { prime, primesList, currentIndex: initialIndex } = route.params
  
  // Load Prime-specific runes and data
  React.useEffect(() => {
    const loadData = async () => {
      if (prime) {
        setCurrentPrime(prime)
        setCurrentIndex(initialIndex)
        
        // Load equipped runes for this specific Prime
        const primeEquippedRunes = await loadPrimeRuneEquipment(prime.id)
        setEquippedRunes(primeEquippedRunes)
        
        // Load all runes from database
        const playerRunes = await RuneService.getPlayerRunes()
        setAllRunes(playerRunes)
        
        // Load available runes (unequipped ones)
        const availableRunesList = await RuneService.getAvailableRunes()
        setAvailableRunes(availableRunesList)
      }
    }
    
    loadData()
  }, [prime, initialIndex])

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
  
  if (!currentPrime || !primesList) {
    return null
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
    { key: 'runes', label: 'Runes' }
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
              onPress={() => navigation.goBack()}
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
            onPress={() => setActiveTab(tab.key)}
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
              <StatsSection prime={currentPrime} primaryColor={primaryColor} equippedRunes={equippedRunes} />
            )}

            {activeTab === 'abilities' && (
              <AbilitiesSection prime={currentPrime} primaryColor={primaryColor} />
            )}

            {activeTab === 'matchups' && (
              <ElementAdvantages element={currentPrime.element} primaryColor={primaryColor} />
            )}

            {activeTab === 'runes' && (
              <RuneEquipment
                prime={currentPrime}
                primaryColor={primaryColor}
                equippedRunes={equippedRunes}
                availableRunes={availableRunes}
                onRuneEquip={handleRuneEquip}
                onRuneUnequip={handleRuneUnequip}
              />
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