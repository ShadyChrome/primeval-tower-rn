import React, { useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import FastImage from '@d11/react-native-fast-image'
import { ElementType, PrimeImageType, ImageAssets } from '../assets/ImageAssets'
import { colors } from '../theme/designSystem'

// Element Icon Component with FastImage optimization
interface ElementIconProps {
  element: ElementType
  size?: 'small' | 'medium' | 'large'
  style?: any
}

export function ElementIcon({ element, size = 'medium', style }: ElementIconProps) {
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  }

  return (
    <FastImage
      source={ImageAssets.getElementImage(element)}
      style={[
        {
          width: sizeMap[size],
          height: sizeMap[size],
        },
        style,
      ]}
      resizeMode={FastImage.resizeMode.contain}
    />
  )
}

// Optimized Prime Image Component
interface PrimeImageProps {
  primeName: PrimeImageType
  width?: number
  height?: number
  style?: any
  showLoader?: boolean
  priority?: 'low' | 'normal' | 'high'
}

export function PrimeImage({ 
  primeName, 
  style, 
  width = 100, 
  height = 100, 
  showLoader = true,
  priority = 'normal'
}: PrimeImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoadStart = () => {
    setIsLoading(true)
    setHasError(false)
  }

  const handleLoadEnd = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <View style={[{ width, height }, style]}>
      <FastImage
        source={ImageAssets.getPrimeImage(primeName)}
        style={{
          width,
          height,
        }}
        resizeMode={FastImage.resizeMode.contain}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      
      {/* Loading indicator */}
      {isLoading && showLoader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      
      {/* Error state */}
      {hasError && (
        <View style={styles.errorContainer}>
          <Text variant="bodySmall" style={styles.errorText}>
            Failed to load
          </Text>
        </View>
      )}
    </View>
  )
}

// Preload function for critical images
export const preloadImages = (imageNames: PrimeImageType[]) => {
  // For local assets, FastImage doesn't need explicit preloading
  // as they're bundled with the app. This function is kept for API compatibility
  console.log(`Preloading ${imageNames.length} prime images`)
}

// Clear cache function
export const clearImageCache = () => {
  FastImage.clearMemoryCache()
  FastImage.clearDiskCache()
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface + '80',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
}) 