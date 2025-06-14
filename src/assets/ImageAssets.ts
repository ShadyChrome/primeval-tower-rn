// Centralized Image Assets Manager for Performance Optimization
import { ImageRequireSource } from 'react-native'

// Element Images
const ELEMENT_IMAGES = {
  Ignis: require('./elements/Ignis.png'),
  Aeris: require('./elements/Aeris.png'),
  Geo: require('./elements/Geo.png'),
  Vitae: require('./elements/Vitae.png'),
  Tempest: require('./elements/Tempest.png'),
  Azur: require('./elements/Azur.png'),
} as const

// Prime Images
const PRIME_IMAGES = {
  // Ignis Primes
  Rathalos: require('./primes/Rathalos.webp'),
  Rathian: require('./primes/Rathian.webp'),
  Anjanath: require('./primes/Anjanath.webp'),
  Barroth: require('./primes/Barroth.webp'),
  Diablos: require('./primes/Diablos.webp'),
  Teostra: require('./primes/Teostra.webp'),
  'Silver Rathalos': require('./primes/Silver_Rathalos.webp'),
  'Gold Rathian': require('./primes/Gold_Rathian.webp'),
  'Apex Rathalos': require('./primes/Apex_Rathalos.webp'),
  'Apex Rathian': require('./primes/Apex_Rathian.webp'),
  Espinas: require('./primes/Espinas.webp'),
  
  // Vitae Primes
  'Pukei-Pukei': require('./primes/Pukei-Pukei.webp'),
  'Great Izuchi': require('./primes/Great_Izuchi.webp'),
  Bishaten: require('./primes/Bishaten.webp'),
  'Blood Orange Bishaten': require('./primes/Blood_Orange_Bishaten.webp'),
  Tetranadon: require('./primes/Tetranadon.webp'),
  'Royal Ludroth': require('./primes/Royal_Ludroth.webp'),
  'Tobi-Kadachi': require('./primes/Tobi-Kadachi.webp'),
  'Great Baggi': require('./primes/Great_Baggi.webp'),
  'Great Wroggi': require('./primes/Great_Wroggi.webp'),
  
  // Azur Primes
  Mizutsune: require('./primes/Mizutsune.webp'),
  'Apex Mizutsune': require('./primes/Apex_Mizutsune.webp'),
  Somnacanth: require('./primes/Somnacanth.webp'),
  'Aurora Somnacanth': require('./primes/Aurora_Somnacanth.webp'),
  Jyuratodus: require('./primes/Jyuratodus.webp'),
  'VioletMizu': require('./primes/VioletMizu.webp'),
  Almudron: require('./primes/Almudron.webp'),
  'Magma Almudron': require('./primes/Magma_Almudron.webp'),
  
  // Geo Primes
  Basarios: require('./primes/Basarios.webp'),
  'Shogun Ceanataur': require('./primes/Shogun_Ceanataur.webp'),
  'Daimyo Hermitaur': require('./primes/Daimyo_Hermitaur.webp'),
  Volvidon: require('./primes/Volvidon.webp'),
  Garangolm: require('./primes/Garangolm.webp'),
  
  // Tempest Primes
  Zinogre: require('./primes/Zinogre.webp'),
  'Apex Zinogre': require('./primes/Apex_Zinogre.webp'),
  Astalos: require('./primes/Astalos.webp'),
  'Kulu-Ya-Ku': require('./primes/Kulu-Ya-Ku.webp'),
  Seregios: require('./primes/Seregios.webp'),
  'Wind Serpent Ibushi': require('./primes/Wind_Serpent_Ibushi.webp'),
  Bazelgeuse: require('./primes/Bazelgeuse.webp'),
  'Seething Bazelgeuse': require('./primes/Seething_Bazelgeuse.webp'),
  
  // Aeris Primes
  Nargacuga: require('./primes/Nargacuga.webp'),
  'Lucent Nargacuga': require('./primes/Lucent_Nargacuga.webp'),
  Barioth: require('./primes/Barioth.webp'),
  'Kushala Daora': require('./primes/Kushala_Daora.webp'),
  Tigrex: require('./primes/Tigrex.webp'),
  Lagombi: require('./primes/Lagombi.webp'),
  Khezu: require('./primes/Khezu.webp'),
  
  // Special/Legendary Primes
  Magnamalo: require('./primes/Magnamalo.webp'),
  'Scorned Magnamalo': require('./primes/Scorned_Magnamalo.webp'),
  Malzeno: require('./primes/Malzeno.webp'),
  Gaismagorm: require('./primes/Gaismagorm.webp'),
  'Gore Magala': require('./primes/Gore_Magala.webp'),
  Shagaru: require('./primes/Shagaru.webp'),
  Chameleos: require('./primes/Chameleos.webp'),
  'Narwa the Allmother': require('./primes/Narwa_the_Allmother.webp'),
  Narwa: require('./primes/Narwa.webp'),
  Rajang: require('./primes/Rajang.webp'),
  'Furious Rajang': require('./primes/Furious_Rajang.webp'),
  'Crimson Glow Valstrax': require('./primes/Crimson_Glow_Valstrax.webp'),
  Lunagaron: require('./primes/Lunagaron.webp'),
  Arzuros: require('./primes/Arzuros.webp'),
  'Apex Arzuros': require('./primes/Apex_Arzuros.webp'),
  'Goss Harag': require('./primes/Goss_Harag.webp'),
  Aknosom: require('./primes/Aknosom.webp'),
  'Apex Diablos': require('./primes/Apex_Diablos.webp'),
  Rakna: require('./primes/Rakna.webp'),
  'Pyre Rakna-Kadaki': require('./primes/Pyre_Rakna-Kadaki.webp'),
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
      Ignis: ['Rathalos', 'Rathian', 'Anjanath', 'Barroth', 'Diablos', 'Teostra', 'Silver Rathalos', 'Gold Rathian', 'Apex Rathalos', 'Apex Rathian', 'Espinas', 'Apex Diablos'],
      Vitae: ['Pukei-Pukei', 'Great Izuchi', 'Bishaten', 'Blood Orange Bishaten', 'Tetranadon', 'Royal Ludroth', 'Tobi-Kadachi', 'Great Baggi', 'Great Wroggi', 'Arzuros', 'Apex Arzuros'],
      Azur: ['Mizutsune', 'Apex Mizutsune', 'Somnacanth', 'Aurora Somnacanth', 'Jyuratodus', 'VioletMizu', 'Almudron', 'Magma Almudron'],
      Geo: ['Basarios', 'Shogun Ceanataur', 'Daimyo Hermitaur', 'Volvidon', 'Garangolm', 'Goss Harag'],
      Tempest: ['Zinogre', 'Apex Zinogre', 'Astalos', 'Kulu-Ya-Ku', 'Seregios', 'Wind Serpent Ibushi', 'Bazelgeuse', 'Seething Bazelgeuse', 'Aknosom'],
      Aeris: ['Nargacuga', 'Lucent Nargacuga', 'Barioth', 'Kushala Daora', 'Tigrex', 'Lagombi', 'Khezu'],
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