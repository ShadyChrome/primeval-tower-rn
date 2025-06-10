import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { Text, IconButton, Surface } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ElementIcon, PrimeImage } from '../../components/OptimizedImage'
import { ElementType, PrimeImageType } from '../assets/ImageAssets'
import StatsSection from '../components/modals/sections/StatsSection'
import AbilitiesSection from '../components/modals/sections/AbilitiesSection'
import ElementAdvantages from '../components/modals/sections/ElementAdvantages'
import { colors, spacing, typography, shadows } from '../theme/designSystem'

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

const { height: screenHeight } = Dimensions.get('window')

const elementColors = {
  Ignis: '#FF6B6B',
  Azur: '#4ECDC4', 
  Vitae: '#95E1A0',
  Geo: '#DDA15E',
  Tempest: '#8D86C9',
  Aeris: '#B8BBD1'
}

const rarityColors = {
  Common: '#B0BEC5',
  Rare: '#42A5F5', 
  Epic: '#AB47BC',
  Legendary: '#FF9800',
  Mythical: '#F44336'
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

  const primaryColor = elementColors[prime.element] || elementColors.Ignis
  const rarityColor = rarityColors[prime.rarity] || rarityColors.Common

  const tabs = [
    { key: 'stats', label: 'Stats' },
    { key: 'abilities', label: 'Abilities' }, 
    { key: 'matchups', label: 'Elements' },
    { key: 'runes', label: 'Runes' }
  ] as const

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom Header */}
      <Surface style={[styles.header, { backgroundColor: primaryColor + '10' }]} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.text}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerInfo}>
            <Text variant="titleLarge" style={[styles.headerTitle, { color: primaryColor }]}>
              {prime.name}
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Level {prime.level} • {prime.rarity} • {prime.power} Power
            </Text>
          </View>
        </View>
      </Surface>

      {/* Prime Image Header */}
      <LinearGradient
        colors={[primaryColor + '20', primaryColor + '05']}
        style={styles.imageSection}
      >
        <View style={styles.imageContainer}>
          <View style={[styles.imageFrame, { borderColor: primaryColor + '40' }]}>
            <PrimeImage 
              primeName={prime.imageName || 'Rathalos'} 
              style={styles.primeImage}
            />
          </View>
          
          <View style={styles.badgeContainer}>
            <View style={[styles.elementBadge, { backgroundColor: primaryColor }]}>
              <ElementIcon element={prime.element} size="small" />
              <Text variant="bodySmall" style={styles.badgeText}>
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
      </LinearGradient>

      {/* Tab Navigation */}
      <Surface style={styles.tabContainer} elevation={1}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {tabs.map((tab) => (
            <View
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: primaryColor + '20' }
              ]}
            >
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? primaryColor : colors.text }
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </Surface>

      {/* Content Area */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  imageSection: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    ...shadows.medium,
  },
  primeImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
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
    borderRadius: 20,
  },
  badgeText: {
    color: colors.surface,
    fontWeight: '600',
  },
  tabContainer: {
    backgroundColor: colors.surface,
  },
  tabScrollContent: {
    paddingHorizontal: spacing.md,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  tabText: {
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
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