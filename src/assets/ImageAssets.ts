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

// Prime Images
const PRIME_IMAGES = {
  // Ignis Primes
  Rathalos: require('../../assets/primes/Rathalos.png'),
  Rathian: require('../../assets/primes/Rathian.png'),
  Anjanath: require('../../assets/primes/Anjanath.png'),
  Barroth: require('../../assets/primes/Barroth.png'),
  Diablos: require('../../assets/primes/Diablos.png'),
  Teostra: require('../../assets/primes/Teostra.png'),
  'Silver Rathalos': require('../../assets/primes/Silver_Rathalos.png'),
  'Gold Rathian': require('../../assets/primes/Gold_Rathian.png'),
  'Apex Rathalos': require('../../assets/primes/Apex_Rathalos.png'),
  'Apex Rathian': require('../../assets/primes/Apex_Rathian.png'),
  
  // Vitae Primes
  'Pukei-Pukei': require('../../assets/primes/Pukei-Pukei.png'),
  'Great Izuchi': require('../../assets/primes/Great_Izuchi.png'),
  Bishaten: require('../../assets/primes/Bishaten.png'),
  'Blood Orange Bishaten': require('../../assets/primes/Blood_Orange_Bishaten.png'),
  Tetranadon: require('../../assets/primes/Tetranadon.png'),
  'Royal Ludroth': require('../../assets/primes/Royal_Ludroth.png'),
  'Tobi-Kadachi': require('../../assets/primes/Tobi-Kadachi.png'),
  
  // Azur Primes
  Mizutsune: require('../../assets/primes/Mizutsune.png'),
  'Apex Mizutsune': require('../../assets/primes/Apex_Mizutsune.png'),
  Somnacanth: require('../../assets/primes/Somnacanth.png'),
  'Aurora Somnacanth': require('../../assets/primes/Aurora_Somnacanth.png'),
  Jyuratodus: require('../../assets/primes/Jyuratodus.png'),
  'VioletMizu': require('../../assets/primes/VioletMizu.png'),
  Almudron: require('../../assets/primes/Almudron.png'),
  'Magma Almudron': require('../../assets/primes/Magma_Almudron.png'),
  
  // Geo Primes
  Basarios: require('../../assets/primes/Basarios.png'),
  'Shogun Ceanataur': require('../../assets/primes/Shogun_Ceanataur.png'),
  'Daimyo Hermitaur': require('../../assets/primes/Daimyo_Hermitaur.png'),
  Volvidon: require('../../assets/primes/Volvidon.png'),
  Garangolm: require('../../assets/primes/Garangolm.png'),
  
  // Tempest Primes
  Zinogre: require('../../assets/primes/Zinogre.png'),
  'Apex Zinogre': require('../../assets/primes/Apex_Zinogre.png'),
  Astalos: require('../../assets/primes/Astalos.png'),
  'Kulu-Ya-Ku': require('../../assets/primes/Kulu-Ya-Ku.png'),
  Seregios: require('../../assets/primes/Seregios.png'),
  'Wind Serpent Ibushi': require('../../assets/primes/Wind_Serpent_Ibushi.png'),
  
  // Aeris Primes
  Nargacuga: require('../../assets/primes/Nargacuga.png'),
  'Lucent Nargacuga': require('../../assets/primes/Lucent_Nargacuga.png'),
  Barioth: require('../../assets/primes/Barioth.png'),
  'Kushala Daora': require('../../assets/primes/Kushala_Daora.png'),
  Tigrex: require('../../assets/primes/Tigrex.png'),
  Lagombi: require('../../assets/primes/Lagombi.png'),
  
  // Special/Legendary Primes
  Magnamalo: require('../../assets/primes/Magnamalo.png'),
  'Scorned Magnamalo': require('../../assets/primes/Scorned_Magnamalo.png'),
  Malzeno: require('../../assets/primes/Malzeno.png'),
  Gaismagorm: require('../../assets/primes/Gaismagorm.png'),
  'Gore Magala': require('../../assets/primes/Gore_Magala.png'),
  Shagaru: require('../../assets/primes/Shagaru.png'),
  Chameleos: require('../../assets/primes/Chameleos.png'),
  'Narwa the Allmother': require('../../assets/primes/Narwa_the_Allmother.png'),
  Narwa: require('../../assets/primes/Narwa.png'),
  Rajang: require('../../assets/primes/Rajang.png'),
  'Furious Rajang': require('../../assets/primes/Furious_Rajang.png'),
  'Crimson Glow Valstrax': require('../../assets/primes/Crimson_Glow_Valstrax.png'),
  Lunagaron: require('../../assets/primes/Lunagaron.png'),
} as const

// Type definitions
export type ElementType = keyof typeof ELEMENT_IMAGES
export type PrimeImageType = keyof typeof PRIME_IMAGES

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
   * Get prime image with caching
   * @param primeName - Prime name
   * @returns ImageRequireSource
   */
  static getPrimeImage(primeName: PrimeImageType): ImageRequireSource {
    const cacheKey = `prime_${primeName}`
    
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!
    }
    
    const image = PRIME_IMAGES[primeName]
    if (image) {
      imageCache.set(cacheKey, image)
      return image
    }
    
    // Fallback to first prime if not found
    console.warn(`Prime image not found for: ${primeName}`)
    return PRIME_IMAGES.Rathalos
  }

  /**
   * Check if prime image exists
   * @param primeName - Prime name to check
   * @returns boolean
   */
  static hasPrimeImage(primeName: string): primeName is PrimeImageType {
    return primeName in PRIME_IMAGES
  }

  /**
   * Preload all images for better performance
   * Call this in your app initialization
   */
  static preloadAllImages(): void {
    // Preload element images
    Object.entries(ELEMENT_IMAGES).forEach(([element, image]) => {
      const cacheKey = `element_${element}`
      imageCache.set(cacheKey, image)
    })
    
    // Preload prime images
    Object.entries(PRIME_IMAGES).forEach(([prime, image]) => {
      const cacheKey = `prime_${prime}`
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
   * Get all available prime names
   */
  static getAvailablePrimes(): PrimeImageType[] {
    return Object.keys(PRIME_IMAGES) as PrimeImageType[]
  }

  /**
   * Get primes by element
   * @param element - Element to filter by
   * @returns Array of prime names for that element
   */
  static getPrimesByElement(element: ElementType): PrimeImageType[] {
    // This is a simplified mapping - in a real app you'd have this in your data model
    const elementPrimeMap: Record<ElementType, PrimeImageType[]> = {
      Ignis: ['Rathalos', 'Rathian', 'Anjanath', 'Barroth', 'Diablos', 'Teostra', 'Silver Rathalos', 'Gold Rathian', 'Apex Rathalos', 'Apex Rathian'],
      Vitae: ['Pukei-Pukei', 'Great Izuchi', 'Bishaten', 'Blood Orange Bishaten', 'Tetranadon', 'Royal Ludroth', 'Tobi-Kadachi'],
      Azur: ['Mizutsune', 'Apex Mizutsune', 'Somnacanth', 'Aurora Somnacanth', 'Jyuratodus', 'VioletMizu', 'Almudron', 'Magma Almudron'],
      Geo: ['Basarios', 'Shogun Ceanataur', 'Daimyo Hermitaur', 'Volvidon', 'Garangolm'],
      Tempest: ['Zinogre', 'Apex Zinogre', 'Astalos', 'Kulu-Ya-Ku', 'Seregios', 'Wind Serpent Ibushi'],
      Aeris: ['Nargacuga', 'Lucent Nargacuga', 'Barioth', 'Kushala Daora', 'Tigrex', 'Lagombi'],
    }
    
    return elementPrimeMap[element] || []
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

// Export the direct images objects for backward compatibility
export { ELEMENT_IMAGES, PRIME_IMAGES } 