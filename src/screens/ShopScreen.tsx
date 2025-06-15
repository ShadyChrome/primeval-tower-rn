import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Surface } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { colors, spacing, shadows } from '../theme/designSystem'
import { useNavigation } from '@react-navigation/native'

interface ShopScreenProps {
  playerData?: {
    player: {
      gems: number | null
      [key: string]: any
    }
    [key: string]: any
  }
  onPlayerDataUpdate?: () => void
}

interface ShopCategory {
  id: string
  title: string
  subtitle: string
  icon: string
  iconColor: string
  backgroundColor: string
  onPress: () => void
  isPlaceholder?: boolean
}

export default function ShopScreen({ playerData, onPlayerDataUpdate }: ShopScreenProps) {
  const navigation = useNavigation()

  const shopCategories: ShopCategory[] = [
    {
      id: 'eggs',
      title: 'Eggs',
      subtitle: 'Hatch new Primes',
      icon: 'egg',
      iconColor: colors.primary,
      backgroundColor: colors.gradients.coral[0],
      onPress: () => {
        navigation.navigate('EggsShop' as never, { 
          playerData, 
          onPlayerDataUpdate 
        } as never)
      }
    },
    {
      id: 'items',
      title: 'Items',
      subtitle: 'Enhancers & Amplifiers',
      icon: 'star-outline',
      iconColor: colors.secondary,
      backgroundColor: colors.gradients.lavender[0],
      onPress: () => {
        navigation.navigate('ItemsShop' as never, { 
          playerData, 
          onPlayerDataUpdate 
        } as never)
      }
    },
    {
      id: 'gems',
      title: 'Gems',
      subtitle: 'Premium Currency',
      icon: 'diamond',
      iconColor: colors.accent,
      backgroundColor: colors.gradients.mint[0],
      onPress: () => {
        console.log('Gem purchase coming soon!')
      },
      isPlaceholder: true
    },
    {
      id: 'special',
      title: 'Special',
      subtitle: 'Limited Offers',
      icon: 'gift',
      iconColor: colors.pastelPeach,
      backgroundColor: colors.gradients.peach[0],
      onPress: () => {
        console.log('Special offers coming soon!')
      },
      isPlaceholder: true
    }
  ]

  const renderShopCategory = (category: ShopCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        { backgroundColor: category.backgroundColor },
        category.isPlaceholder && styles.placeholderCard
      ]}
      onPress={category.onPress}
      activeOpacity={0.8}
      disabled={category.isPlaceholder}
    >
      <View style={styles.categoryContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons 
            name={category.icon as any} 
            size={32} 
            color={category.iconColor} 
          />
        </View>
        
        <View style={styles.textContent}>
          <Text variant="titleMedium" style={styles.categoryTitle}>
            {category.title}
          </Text>
          <Text variant="bodySmall" style={styles.categorySubtitle}>
            {category.subtitle}
          </Text>
        </View>

        {category.isPlaceholder && (
          <View style={styles.placeholderBadge}>
            <Text variant="labelSmall" style={styles.placeholderText}>
              Coming Soon
            </Text>
          </View>
        )}

        {!category.isPlaceholder && (
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={colors.textSecondary} 
            style={styles.arrowIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Surface style={styles.headerSection} elevation={1}>
        <Text variant="headlineSmall" style={styles.screenTitle}>
          Shop
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Purchase items to enhance your collection
        </Text>
      </Surface>

      <View style={styles.contentContainer}>
        <View style={styles.categoriesGrid}>
          {/* First Row */}
          <View style={styles.gridRow}>
            {shopCategories.slice(0, 2).map(renderShopCategory)}
          </View>
          
          {/* Second Row */}
          <View style={styles.gridRow}>
            {shopCategories.slice(2, 4).map(renderShopCategory)}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            Tip: Use eggs to hatch new Primes and items to enhance them!
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  screenTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  categoriesGrid: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: '47%',
    aspectRatio: 1.1,
    borderRadius: 20,
    padding: spacing.md,
    ...shadows.medium,
  },
  placeholderCard: {
    opacity: 0.7,
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    ...shadows.light,
  },
  textContent: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  categoryTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  categorySubtitle: {
    color: colors.textSecondary,
    lineHeight: 16,
  },
  placeholderBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  arrowIcon: {
    alignSelf: 'flex-end',
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
})