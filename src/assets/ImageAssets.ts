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
  Rathalos: require('../../assets/primes/Rathalos.webp'),
  Rathian: require('../../assets/primes/Rathian.webp'),
  Anjanath: require('../../assets/primes/Anjanath.webp'),
  Barroth: require('../../assets/primes/Barroth.webp'),
  Diablos: require('../../assets/primes/Diablos.webp'),
  Teostra: require('../../assets/primes/Teostra.webp'),
  'Silver Rathalos': require('../../assets/primes/Silver_Rathalos.webp'),
  'Gold Rathian': require('../../assets/primes/Gold_Rathian.webp'),
  'Apex Rathalos': require('../../assets/primes/Apex_Rathalos.webp'),
  'Apex Rathian': require('../../assets/primes/Apex_Rathian.webp'),
  Espinas: require('../../assets/primes/Espinas.webp'),
  
  // Vitae Primes
  'Pukei-Pukei': require('../../assets/primes/Pukei-Pukei.webp'),
  'Great Izuchi': require('../../assets/primes/Great_Izuchi.webp'),
  Bishaten: require('../../assets/primes/Bishaten.webp'),
  'Blood Orange Bishaten': require('../../assets/primes/Blood_Orange_Bishaten.webp'),
  Tetranadon: require('../../assets/primes/Tetranadon.webp'),
  'Royal Ludroth': require('../../assets/primes/Royal_Ludroth.webp'),
  'Tobi-Kadachi': require('../../assets/primes/Tobi-Kadachi.webp'),
  'Great Baggi': require('../../assets/primes/Great_Baggi.webp'),
  'Great Wroggi': require('../../assets/primes/Great_Wroggi.webp'),
  
  // Azur Primes
  Mizutsune: require('../../assets/primes/Mizutsune.webp'),
  'Apex Mizutsune': require('../../assets/primes/Apex_Mizutsune.webp'),
  Somnacanth: require('../../assets/primes/Somnacanth.webp'),
  'Aurora Somnacanth': require('../../assets/primes/Aurora_Somnacanth.webp'),
  Jyuratodus: require('../../assets/primes/Jyuratodus.webp'),
  'VioletMizu': require('../../assets/primes/VioletMizu.webp'),
  Almudron: require('../../assets/primes/Almudron.webp'),
  'Magma Almudron': require('../../assets/primes/Magma_Almudron.webp'),
  
  // Geo Primes
  Basarios: require('../../assets/primes/Basarios.webp'),
  'Shogun Ceanataur': require('../../assets/primes/Shogun_Ceanataur.webp'),
  'Daimyo Hermitaur': require('../../assets/primes/Daimyo_Hermitaur.webp'),
  Volvidon: require('../../assets/primes/Volvidon.webp'),
  Garangolm: require('../../assets/primes/Garangolm.webp'),
  
  // Tempest Primes
  Zinogre: require('../../assets/primes/Zinogre.webp'),
  'Apex Zinogre': require('../../assets/primes/Apex_Zinogre.webp'),
  Astalos: require('../../assets/primes/Astalos.webp'),
  'Kulu-Ya-Ku': require('../../assets/primes/Kulu-Ya-Ku.webp'),
  Seregios: require('../../assets/primes/Seregios.webp'),
  'Wind Serpent Ibushi': require('../../assets/primes/Wind_Serpent_Ibushi.webp'),
  Bazelgeuse: require('../../assets/primes/Bazelgeuse.webp'),
  'Seething Bazelgeuse': require('../../assets/primes/Seething_Bazelgeuse.webp'),
  
  // Aeris Primes
  Nargacuga: require('../../assets/primes/Nargacuga.webp'),
  'Lucent Nargacuga': require('../../assets/primes/Lucent_Nargacuga.webp'),
  Barioth: require('../../assets/primes/Barioth.webp'),
  'Kushala Daora': require('../../assets/primes/Kushala_Daora.webp'),
  Tigrex: require('../../assets/primes/Tigrex.webp'),
  Lagombi: require('../../assets/primes/Lagombi.webp'),
  Khezu: require('../../assets/primes/Khezu.webp'),
  
  // Special/Legendary Primes
  Magnamalo: require('../../assets/primes/Magnamalo.webp'),
  'Scorned Magnamalo': require('../../assets/primes/Scorned_Magnamalo.webp'),
  Malzeno: require('../../assets/primes/Malzeno.webp'),
  Gaismagorm: require('../../assets/primes/Gaismagorm.webp'),
  'Gore Magala': require('../../assets/primes/Gore_Magala.webp'),
  Shagaru: require('../../assets/primes/Shagaru.webp'),
  Chameleos: require('../../assets/primes/Chameleos.webp'),
  'Narwa the Allmother': require('../../assets/primes/Narwa_the_Allmother.webp'),
  Narwa: require('../../assets/primes/Narwa.webp'),
  Rajang: require('../../assets/primes/Rajang.webp'),
  'Furious Rajang': require('../../assets/primes/Furious_Rajang.webp'),
  'Crimson Glow Valstrax': require('../../assets/primes/Crimson_Glow_Valstrax.webp'),
  Lunagaron: require('../../assets/primes/Lunagaron.webp'),
  Arzuros: require('../../assets/primes/Arzuros.webp'),
  'Apex Arzuros': require('../../assets/primes/Apex_Arzuros.webp'),
  'Goss Harag': require('../../assets/primes/Goss_Harag.webp'),
  Aknosom: require('../../assets/primes/Aknosom.webp'),
  'Apex Diablos': require('../../assets/primes/Apex_Diablos.webp'),
  Rakna: require('../../assets/primes/Rakna.webp'),
  'Pyre Rakna-Kadaki': require('../../assets/primes/Pyre_Rakna-Kadaki.webp'),
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