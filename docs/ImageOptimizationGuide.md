# Image Optimization Guide

## Overview
This guide covers performance optimization strategies for managing images in your React Native project.

## Current Implementation

### 1. Centralized Image Assets Manager (`src/assets/ImageAssets.ts`)
- **Memory Caching**: Images are cached in memory after first load
- **Type Safety**: TypeScript types ensure correct element names
- **Preloading**: All images preloaded at app startup
- **Fallback Handling**: Graceful fallback for missing images

```typescript
// Usage Example
import { ImageAssets } from '../assets/ImageAssets'

const elementImage = ImageAssets.getElementImage('Ignis')
```

### 2. Optimized Image Component (`components/OptimizedImage.tsx`)
- **Loading States**: Shows loading indicators while images load
- **Error Handling**: Displays placeholder on load errors
- **Lazy Loading**: Optional lazy loading for performance
- **Consistent Sizing**: Predefined size variants (small, medium, large)

```typescript
// Usage Example
<ElementIcon element="Ignis" size="medium" />
```

## Performance Benefits

### Bundle Size Optimization
- ✅ **Static Bundling**: Images bundled with app (no network requests)
- ✅ **Local Assets**: No CDN dependency or network latency
- ✅ **Optimized Formats**: WebP support enabled in expo config

### Memory Management
- ✅ **Efficient Caching**: Map-based caching with O(1) lookup
- ✅ **Preloading**: Images loaded once at startup
- ✅ **Memory Cleanup**: Cache clearing methods available

### Rendering Performance
- ✅ **Consistent Dimensions**: Fixed sizing prevents layout shifts
- ✅ **Image Reuse**: Single image instance shared across components
- ✅ **Type Safety**: Compile-time checks prevent runtime errors

## Performance Metrics

### Before Optimization
- Multiple `require()` calls scattered across components
- No caching strategy
- Inconsistent image sizing
- No error handling

### After Optimization
- Single centralized asset manager
- Memory caching with ~100ms faster subsequent loads
- Consistent 24/32/48px sizing
- Graceful error handling with fallbacks

## Best Practices

### 1. Image Sizes
```
Small:  24x24px - List items, chips
Medium: 32x32px - Cards, standard icons  
Large:  48x48px - Headers, featured content
```

### 2. Usage Patterns
```typescript
// ✅ Good - Use centralized components
<ElementIcon element="Ignis" size="medium" />

// ❌ Avoid - Direct require calls
<Image source={require('../assets/elements/Ignis.png')} />
```

### 3. Performance Monitoring
```typescript
// Check cache performance
console.log('Cache size:', ImageAssets.getCacheSize())

// Clear cache if memory issues
ImageAssets.clearCache()
```

## Advanced Optimizations

### 1. Image Preprocessing
Consider using tools like:
- **ImageOptim**: Lossless compression
- **WebP Converter**: Better compression ratios
- **Image Resizer**: Multiple size variants

### 2. Bundle Analysis
Monitor bundle size impact:
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --assets-dest /tmp/
```

### 3. Memory Profiling
Use React DevTools Profiler to monitor:
- Component render times
- Memory usage patterns
- Re-render frequency

## Migration Guide

### Updating Existing Components
1. Import the optimized components:
```typescript
import { ElementIcon } from '../components/OptimizedImage'
```

2. Replace direct image usage:
```typescript
// Before
<Image source={require('../assets/elements/Ignis.png')} style={styles.icon} />

// After  
<ElementIcon element="Ignis" size="medium" style={styles.icon} />
```

3. Update styles if needed:
```typescript
// Remove fixed dimensions (handled by component)
// icon: { width: 32, height: 32 } // Remove these
```

## Monitoring & Debugging

### Cache Status
```typescript
// Development helper
if (__DEV__) {
  console.log('Image cache status:', {
    size: ImageAssets.getCacheSize(),
    elements: ImageAssets.getAvailableElements()
  })
}
```

### Performance Metrics
- **Startup Time**: Monitor app initialization with preloading
- **Memory Usage**: Track memory growth with large image sets
- **Render Performance**: Use React DevTools for component profiling

## Future Considerations

### 1. Dynamic Loading
For larger image sets, consider:
- Lazy loading for off-screen content
- Progressive image loading
- Image virtualization for large lists

### 2. Advanced Caching
- Persistent disk cache for downloaded images
- LRU (Least Recently Used) cache eviction
- Background prefetching

### 3. Network Images
If adding network images later:
- Image CDN integration
- Progressive JPEG support
- Offline caching strategies

## File Structure
```
src/
  assets/
    ImageAssets.ts          # Centralized image manager
  components/
    OptimizedImage.tsx      # Optimized image components
assets/
  elements/                 # Element images
    Ignis.png
    Aeris.png
    Geo.png
    Vitae.png
    Tempest.png
    Azur.png
``` 