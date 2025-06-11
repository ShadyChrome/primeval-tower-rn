import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Chip } from 'react-native-paper'
import { UIInventoryItem } from '../../services/inventoryService'
import { colors, spacing } from '../../theme/designSystem'

interface ItemCardProps {
  item: UIInventoryItem
  onPress?: () => void
  primaryColor?: string
  compact?: boolean
}

export default function ItemCard({ 
  item, 
  onPress, 
  primaryColor = colors.primary,
  compact = false
}: ItemCardProps) {
  const getRarityColor = (rarity?: string) => {
    const rarityColors = {
      'Common': '#ADB5BD',
      'Rare': '#74C0FC',
      'Epic': '#B197FC',
      'Legendary': '#FFCC8A',
      'Mythical': '#FFA8A8'
    }
    return rarityColors[rarity as keyof typeof rarityColors] || colors.surfaceVariant
  }

  const getItemTypeIcon = (type: string, itemId: string) => {
    // XP Potions
    if (itemId.includes('xp_potion')) {
      if (itemId.includes('small')) return '🧪'
      if (itemId.includes('medium')) return '⚗️'
      if (itemId.includes('large')) return '🍶'
      if (itemId.includes('huge')) return '🏺'
      return '🧪'
    }

    // Other item types
    const iconMap: Record<string, string> = {
      'Consumable': '💊',
      'Hatchable': '🥚',
      'Enhancer': '✨',
      'Currency': '💎'
    }
    
    // Special cases for specific items
    if (itemId.includes('ability_scroll')) return '📜'
    if (itemId.includes('egg')) return '🥚'
    if (itemId.includes('enhancer')) return '🌟'
    
    return iconMap[type] || '📦'
  }

  const Component = onPress ? TouchableOpacity : View

  return (
    <Component
      style={[
        styles.container,
        compact && styles.containerCompact,
        item.rarity && { borderColor: getRarityColor(item.rarity) }
      ]}
      onPress={onPress}
    >
      {/* Item Header */}
      <View style={[styles.header, compact && styles.headerCompact]}>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemIcon, compact && styles.itemIconCompact]}>
            {getItemTypeIcon(item.type, item.itemId)}
          </Text>
          <View style={styles.itemDetails}>
            <Text variant={compact ? "bodyMedium" : "titleSmall"} style={styles.itemName}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.itemType}>
              {item.type}
              {item.xpValue && ` • ${item.xpValue} XP`}
            </Text>
          </View>
        </View>
        
        <View style={styles.quantityContainer}>
          <Text variant={compact ? "titleMedium" : "headlineSmall"} style={styles.quantity}>
            {item.quantity}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text variant="bodyMedium" style={[styles.description, compact && styles.descriptionCompact]}>
        {item.description}
      </Text>

      {/* Rarity Chip */}
      {item.rarity && (
        <View style={styles.bottomSection}>
          <Chip 
            style={[
              styles.rarityChip, 
              compact && styles.rarityChipCompact,
              { backgroundColor: getRarityColor(item.rarity) }
            ]}
            textStyle={[styles.rarityText, compact && styles.rarityTextCompact]}
          >
            {item.rarity}
          </Chip>
        </View>
      )}
    </Component>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceVariant,
    padding: spacing.md,
    marginBottom: spacing.sm,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerCompact: {
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerCompact: {
    marginBottom: spacing.xs,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  itemIconCompact: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  itemType: {
    color: colors.textSecondary,
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 20,
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.sm,
  },
  quantity: {
    color: colors.surface,
    fontWeight: '700',
  },
  description: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  descriptionCompact: {
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rarityChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
  },
  rarityChipCompact: {
    borderRadius: 12,
  },
  rarityText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 11,
  },
  rarityTextCompact: {
    fontSize: 10,
  },
}) 