// Centralized Image Assets Manager for Performance Optimization
import { ImageRequireSource } from 'react-native'

// Element Images
const ELEMENT_IMAGES = {
  Ignis: require('../../assets/elements/Ignis.png'),
  Aeris: require('../../assets/elements/Aeris.png'),
  Geo: require('../../assets/elements/Geo.png'),
  Vitae: require('../../assets/elements/Vitae.png'),
  Tempest: require('../../assets/elements/Tempest.png'),
  Azur: require('../../assets/elements/Azur.png'),
} as const

// Type for element names
export type ElementType = keyof typeof ELEMENT_IMAGES

// Image cache for performance optimization
const imageCache = new Map<string, ImageRequireSource>()

export class ImageAssets {
  /**
   * Get element image with caching
   * @param element - Element name
   * @returns ImageRequireSource
   */
  static getElementImage(element: ElementType): ImageRequireSource {
    const cacheKey = `element_${element}`
    
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!
    }
    
    const image = ELEMENT_IMAGES[element]
    if (image) {
      imageCache.set(cacheKey, image)
      return image
    }
    
    // Fallback to first element if not found
    console.warn(`Element image not found for: ${element}`)
    return ELEMENT_IMAGES.Ignis
  }

  /**
   * Preload all element images for better performance
   * Call this in your app initialization
   */
  static preloadElementImages(): void {
    Object.entries(ELEMENT_IMAGES).forEach(([element, image]) => {
      const cacheKey = `element_${element}`
      imageCache.set(cacheKey, image)
    })
  }

  /**
   * Get all available element types
   */
  static getAvailableElements(): ElementType[] {
    return Object.keys(ELEMENT_IMAGES) as ElementType[]
  }

  /**
   * Clear image cache (useful for memory management)
   */
  static clearCache(): void {
    imageCache.clear()
  }

  /**
   * Get cache size for debugging
   */
  static getCacheSize(): number {
    return imageCache.size
  }
}

// Export the direct images object for backward compatibility
export { ELEMENT_IMAGES } 