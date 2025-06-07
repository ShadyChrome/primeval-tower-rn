import React, { useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Text, Card, Button, SegmentedButtons, Surface, Chip } from 'react-native-paper'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number | string
  originalPrice?: number | string
  currency: 'gems' | 'usd'
  category: string
  featured?: boolean
  discount?: number
}

export default function ShopScreen() {
  const [activeCategory, setActiveCategory] = useState('gems')

  const shopItems: ShopItem[] = [
    // Gem packages
    {
      id: 'gems_small',
      name: 'Starter Gems',
      description: '500 Gems + 50 Bonus',
      price: 0.99,
      currency: 'usd',
      category: 'gems',
      featured: true
    },
    {
      id: 'gems_medium',
      name: 'Power Pack',
      description: '1,200 Gems + 200 Bonus',
      price: 4.99,
      currency: 'usd',
      category: 'gems'
    },
    {
      id: 'gems_large',
      name: 'Mega Pack',
      description: '2,500 Gems + 500 Bonus',
      price: 9.99,
      currency: 'usd',
      category: 'gems'
    },
    {
      id: 'gems_huge',
      name: 'Ultimate Pack',
      description: '6,000 Gems + 1,500 Bonus',
      price: 19.99,
      currency: 'usd',
      category: 'gems'
    },
    // Eggs
    {
      id: 'common_egg',
      name: 'Common Egg',
      description: 'Basic Prime hatching',
      price: 100,
      currency: 'gems',
      category: 'eggs'
    },
    {
      id: 'rare_egg',
      name: 'Rare Egg',
      description: 'Better chance for powerful Primes',
      price: 500,
      currency: 'gems',
      category: 'eggs'
    },
    {
      id: 'epic_egg',
      name: 'Epic Egg',
      description: 'High chance for epic Primes',
      price: 1000,
      currency: 'gems',
      category: 'eggs'
    },
    // Enhancers
    {
      id: 'element_enhancer',
      name: 'Element Enhancer Pack',
      description: '3x Random Element Enhancers',
      price: 120,
      currency: 'gems',
      category: 'enhancers'
    },
    {
      id: 'rarity_amplifier',
      name: 'Rarity Amplifier',
      description: 'Increase rarity chances',
      price: 100,
      currency: 'gems',
      category: 'enhancers'
    },
    {
      id: 'rainbow_enhancer',
      name: 'Rainbow Enhancer',
      description: 'Best rarity boost available',
      price: 200,
      currency: 'gems',
      category: 'enhancers'
    },
    // Special offers
    {
      id: 'starter_bundle',
      name: 'Starter Bundle',
      description: '1000 Gems + 2 Rare Eggs + 5 Enhancers',
      price: 2.99,
      originalPrice: 7.99,
      currency: 'usd',
      category: 'special',
      featured: true,
      discount: 63
    },
    {
      id: 'weekly_deal',
      name: 'Weekly Special',
      description: '2500 Gems + Epic Egg + 10 Items',
      price: 7.99,
      originalPrice: 14.99,
      currency: 'usd',
      category: 'special',
      discount: 47
    }
  ]

  const categories = [
    { value: 'gems', label: 'Gems' },
    { value: 'eggs', label: 'Eggs' },
    { value: 'enhancers', label: 'Enhancers' },
    { value: 'special', label: 'Special' },
  ]

  const filteredItems = shopItems.filter(item => item.category === activeCategory)

  const renderShopItem = (item: ShopItem) => (
    <Card 
      key={item.id} 
      style={[styles.itemCard, item.featured && styles.featuredCard]}
    >
      <Card.Content style={styles.itemContent}>
        {item.featured && (
          <Chip style={styles.featuredChip} textStyle={styles.featuredText}>
            Featured
          </Chip>
        )}
        
        {item.discount && (
          <Chip style={styles.discountChip} textStyle={styles.discountText}>
            -{item.discount}%
          </Chip>
        )}
        
        <View style={styles.itemHeader}>
          <Text variant="titleLarge" style={styles.itemName}>
            {item.name}
          </Text>
          <Text variant="bodyMedium" style={styles.itemDescription}>
            {item.description}
          </Text>
        </View>
        
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text variant="bodyMedium" style={styles.originalPrice}>
                {item.currency === 'usd' ? `$${item.originalPrice}` : `💎 ${item.originalPrice}`}
              </Text>
            )}
            <Text variant="headlineSmall" style={[
              styles.price,
              item.currency === 'usd' ? styles.usdPrice : styles.gemPrice
            ]}>
              {item.currency === 'usd' ? `$${item.price}` : `💎 ${item.price}`}
            </Text>
          </View>
          
          <Button 
            mode="contained" 
            style={[
              styles.purchaseButton,
              item.currency === 'usd' ? styles.usdButton : styles.gemButton
            ]}
            contentStyle={styles.buttonContent}
          >
            {item.currency === 'usd' ? 'Purchase' : 'Buy with Gems'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <Surface style={styles.headerSection} elevation={1}>
        <Text variant="headlineSmall" style={styles.screenTitle}>
          Shop
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enhance your journey with premium items
        </Text>
        
        <SegmentedButtons
          value={activeCategory}
          onValueChange={setActiveCategory}
          buttons={categories}
          style={styles.categorySelector}
        />
      </Surface>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.itemsGrid}>
          {filteredItems.map(renderShopItem)}
        </View>
        
        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.footerText}>
            💎 Current Balance: 1,245 Gems
          </Text>
          <Text variant="bodySmall" style={styles.footerNote}>
            Watch ads for free gems!
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7EFE5',
  },
  headerSection: {
    padding: 16,
    backgroundColor: 'white',
  },
  screenTitle: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666666',
    marginBottom: 16,
  },
  categorySelector: {
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#F39C12',
    backgroundColor: '#FEF9E7',
  },
  itemContent: {
    padding: 16,
    position: 'relative',
  },
  featuredChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F39C12',
    zIndex: 1,
  },
  featuredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  discountChip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#E74C3C',
    zIndex: 1,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  itemHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  itemName: {
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  itemDescription: {
    color: '#666666',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  originalPrice: {
    color: '#999999',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  price: {
    fontWeight: '700',
  },
  usdPrice: {
    color: '#27AE60',
  },
  gemPrice: {
    color: '#A0C49D',
  },
  purchaseButton: {
    marginLeft: 16,
  },
  usdButton: {
    backgroundColor: '#27AE60',
  },
  gemButton: {
    backgroundColor: '#A0C49D',
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  footerNote: {
    color: '#666666',
    fontStyle: 'italic',
  },
}) 