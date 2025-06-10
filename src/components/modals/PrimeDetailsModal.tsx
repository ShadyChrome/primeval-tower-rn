import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import { Text, IconButton } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import CenteredModal from '../../../components/ui/CenteredModal'
import { ElementIcon, PrimeImage } from '../../../components/OptimizedImage'
import StatsSection from './sections/StatsSection'
import AbilitiesSection from './sections/AbilitiesSection'
import ElementAdvantages from './sections/ElementAdvantages'
import { ElementType, PrimeImageType } from '../../assets/ImageAssets'
import { colors, spacing, typography, shadows } from '../../theme/designSystem'

interface Prime {
  id: string
  name: string
  element: ElementType
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical'
  level: number
  experience?: number
  maxExperience?: number
  power: number
  abilities: string[]
  imageName?: PrimeImageType
}

interface PrimeDetailsModalProps {
  visible: boolean
  onDismiss: () => void
  prime: Prime | null
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Element colors for gradients (matching existing design system)
const elementColors = {
  Ignis: '#FF6B6B',      // Red/Fire
  Azur: '#4ECDC4',       // Blue/Water  
  Vitae: '#45B7D1',      // Green/Nature
  Geo: '#96CEB4',        // Brown/Earth
  Tempest: '#FFEAA7',    // Yellow/Electric
  Aeris: '#DDA0DD',      // Purple/Air
}

// Rarity colors 
const rarityColors = {
  Common: '#95A5A6',
  Rare: '#3498DB', 
  Epic: '#9B59B6',
  Legendary: '#F39C12',
  Mythical: '#E74C3C'
}

export default function PrimeDetailsModal({ visible, onDismiss, prime }: PrimeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'matchups' | 'runes'>('stats')

  if (!prime) return null

  const primaryColor = elementColors[prime.element]
  const rarityColor = rarityColors[prime.rarity]

  return (
    <CenteredModal
      visible={visible}
      onDismiss={onDismiss}
      maxWidth={screenWidth * 0.95}
      backgroundColor="rgba(0, 0, 0, 0.7)"
    >
      <View style={styles.modalContent}>
        {/* Header with gradient background */}
        <LinearGradient
          colors={[primaryColor + '20', primaryColor + '10', 'transparent']}
          style={styles.header}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <IconButton
              icon="close"
              size={24}
              iconColor={colors.text}
              style={styles.closeIcon}
            />
          </TouchableOpacity>

          {/* Compact Header Layout */}
          <View style={styles.compactHeader}>
            {/* Left: Prime Image */}
            <View style={styles.primeImageContainer}>
              <View style={[
                styles.primeImageBackground,
                { backgroundColor: primaryColor + '15', borderColor: primaryColor + '40' }
              ]}>
                {prime.imageName ? (
                  <PrimeImage 
                    primeName={prime.imageName}
                    width={80}
                    height={80}
                    style={styles.primeImage}
                  />
                ) : (
                  <ElementIcon 
                    element={prime.element} 
                    size="large" 
                  />
                )}
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

              {/* XP Bar (if experience data available) */}
              {prime.experience !== undefined && prime.maxExperience && (
                <View style={styles.xpContainer}>
                  <View style={styles.xpBarBackground}>
                    <View 
                      style={[
                        styles.xpBarFill,
                        { 
                          width: `${(prime.experience / prime.maxExperience) * 100}%`,
                          backgroundColor: primaryColor
                        }
                      ]} 
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.xpText}>
                    {prime.experience} / {prime.maxExperience} XP
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['stats', 'abilities', 'matchups', 'runes'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: primaryColor + '20' }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text 
                variant="bodyMedium" 
                style={[
                  styles.tabText,
                  activeTab === tab && { color: primaryColor, fontWeight: '600' }
                ]}
              >
                {tab === 'matchups' ? 'Elements' : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                Rune equipment system coming in Phase 3...
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </CenteredModal>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: screenHeight * 0.92,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    position: 'relative',
    flexShrink: 0,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
  },
  closeIcon: {
    backgroundColor: colors.surface + 'AA',
    margin: 0,
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
  primeImage: {
    borderRadius: 20,
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
  rarityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  xpBarBackground: {
    width: '80%',
    height: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpText: {
    color: colors.textTertiary,
    fontSize: 11,
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
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  placeholder: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
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
  badgeText: {
    color: colors.surface,
    fontWeight: '600',
  },
}) 