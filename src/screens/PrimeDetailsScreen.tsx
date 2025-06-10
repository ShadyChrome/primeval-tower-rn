import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ElementIcon, PrimeImage } from '../../components/OptimizedImage'
import { ElementType, PrimeImageType } from '../assets/ImageAssets'
import StatsSection from '../components/modals/sections/StatsSection'
import AbilitiesSection from '../components/modals/sections/AbilitiesSection'
import ElementAdvantages from '../components/modals/sections/ElementAdvantages'
import { colors, spacing, typography } from '../theme/designSystem'

interface Prime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  power: number
  abilities: string[]
  imageName?: PrimeImageType
}

type RootStackParamList = {
  MainTabs: undefined
  PrimeDetails: { prime: Prime }
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
  const navigation = useNavigation<PrimeDetailsScreenNavigationProp>()
  const route = useRoute<PrimeDetailsScreenRouteProp>()
  const insets = useSafeAreaInsets()
  
  const { prime } = route.params
  
  if (!prime) {
    navigation.goBack()
    return null
  }

  const primaryColor = elementColors[prime.element]
  const rarityColor = rarityColors[prime.rarity]

  const tabs = [
    { key: 'stats', label: 'Stats' },
    { key: 'abilities', label: 'Abilities' }, 
    { key: 'matchups', label: 'Elements' },
    { key: 'runes', label: 'Runes' }
  ] as const

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

        {/* Compact Header Layout */}
        <View style={styles.compactHeader}>
          {/* Left: Prime Image */}
          <View style={styles.primeImageContainer}>
            <View style={[
              styles.primeImageBackground,
              { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }
            ]}>
              <PrimeImage 
                primeName={prime.imageName || 'Rathalos'} 
                width={80}
                height={80}
                style={styles.primeImage}
              />
            </View>
          </View>

          {/* Right: Prime Info */}
          <View style={styles.primeInfo}>
            <Text variant="headlineSmall" style={[styles.primeName, { color: primaryColor }]}>
              {prime.name}
            </Text>
            
            <Text variant="titleMedium" style={styles.levelText}>
              Level {prime.level} • {prime.rarity} • {prime.power} Power
            </Text>

            <View style={styles.badgeContainer}>
              <View style={[styles.elementBadge, { backgroundColor: primaryColor + '10' }]}>
                <ElementIcon element={prime.element} size="small" />
                <Text variant="bodySmall" style={[styles.badgeText, { color: primaryColor }]}>
                  {prime.element}
                </Text>
              </View>
              
              <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                <Text variant="bodySmall" style={styles.badgeText}>
                  {prime.rarity}
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
          <StatsSection prime={prime} primaryColor={primaryColor} />
        )}

        {activeTab === 'abilities' && (
          <AbilitiesSection prime={prime} primaryColor={primaryColor} />
        )}

        {activeTab === 'matchups' && (
          <ElementAdvantages element={prime.element} primaryColor={primaryColor} />
        )}

        {activeTab === 'runes' && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Rune Equipment</Text>
            <Text variant="bodyMedium" style={styles.placeholder}>
              Rune equipment system coming soon...
            </Text>
          </View>
        )}
      </ScrollView>
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
}) 