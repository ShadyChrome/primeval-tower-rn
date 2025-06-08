import React, { useState, useEffect } from 'react'
import { Image, ImageStyle, ViewStyle, ActivityIndicator, View } from 'react-native'
import { ImageAssets, ElementType } from '../src/assets/ImageAssets'

interface OptimizedImageProps {
  element: ElementType
  style?: ImageStyle
  containerStyle?: ViewStyle
  size?: number
  showLoadingIndicator?: boolean
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center'
  lazy?: boolean
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  element,
  style,
  containerStyle,
  size = 50,
  showLoadingIndicator = true,
  resizeMode = 'contain',
  lazy = false,
}) => {
  const [isLoading, setIsLoading] = useState(lazy)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (lazy) {
      // Simulate lazy loading delay
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [lazy])

  const imageSource = ImageAssets.getElementImage(element)

  const imageStyles: ImageStyle = {
    width: size,
    height: size,
    ...style,
  }

  const containerStyles: ViewStyle = {
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
    ...containerStyle,
  }

  if (isLoading && showLoadingIndicator) {
    return (
      <View style={containerStyles}>
        <ActivityIndicator size="small" color="#A0C49D" />
      </View>
    )
  }

  if (hasError) {
    return (
      <View style={containerStyles}>
        <View style={[imageStyles, { backgroundColor: '#E0E0E0', borderRadius: 4 }]} />
      </View>
    )
  }

  return (
    <View style={containerStyles}>
      <Image
        source={imageSource}
        style={imageStyles}
        resizeMode={resizeMode}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        // Performance optimizations
        fadeDuration={200}
        borderRadius={style?.borderRadius as number}
      />
    </View>
  )
}

// Element Icon component for consistent sizing
export const ElementIcon: React.FC<{
  element: ElementType
  size?: 'small' | 'medium' | 'large'
  style?: ImageStyle
}> = ({ element, size = 'medium', style }) => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 48,
  }

  return (
    <OptimizedImage
      element={element}
      size={sizeMap[size]}
      style={style}
      lazy={false}
      showLoadingIndicator={false}
    />
  )
} 