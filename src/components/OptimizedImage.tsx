import React from 'react'
import { ImageStyle } from 'react-native'
import { Image } from 'expo-image'
import { ImageAssets, ElementType, PrimeImageType } from '../assets/ImageAssets'

interface ElementIconProps {
  element: ElementType
  size?: 'small' | 'medium' | 'large'
  style?: ImageStyle
}

interface PrimeImageProps {
  primeName: PrimeImageType
  style?: ImageStyle
  width?: number
  height?: number
}

const sizeMap = {
  small: 20,
  medium: 32,
  large: 48,
}

export function ElementIcon({ element, size = 'medium', style }: ElementIconProps) {
  const imageSize = sizeMap[size]
  
  return (
    <Image
      source={ImageAssets.getElementImage(element)}
      style={[
        {
          width: imageSize,
          height: imageSize,
        },
        style,
      ]}
      contentFit="contain"
      cachePolicy="memory-disk"
      priority="high"
    />
  )
}

export function PrimeImage({ primeName, style, width = 100, height = 100 }: PrimeImageProps) {
  return (
    <Image
      source={ImageAssets.getPrimeImage(primeName)}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
      contentFit="contain"
      cachePolicy="memory-disk"
      priority="normal"
    />
  )
}

// Performance optimization: Preload images on app start
export const preloadImages = () => {
  ImageAssets.preloadAllImages()
}

// Export individual components
export default {
  ElementIcon,
  PrimeImage,
  preloadImages,
} 