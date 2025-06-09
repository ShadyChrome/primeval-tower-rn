import { MD3LightTheme } from 'react-native-paper'

// Color palette inspired by the reference design
export const colors = {
  // Primary gradient colors (coral/orange)
  primary: '#FF8A80',
  primaryLight: '#FFB3B3',
  primaryDark: '#E57373',
  
  // Secondary gradient colors (purple/lavender)
  secondary: '#B39DDB',
  secondaryLight: '#D1C4E9',
  secondaryDark: '#9575CD',
  
  // Accent colors (mint/green)
  accent: '#A5D6A7',
  accentLight: '#C8E6C9',
  accentDark: '#81C784',
  
  // Soft pastels
  pastelPink: '#F8BBD9',
  pastelPeach: '#FFCC80',
  pastelMint: '#B2DFDB',
  pastelLavender: '#E1BEE7',
  
  // Neutrals
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  text: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textTertiary: '#9E9E9E',
  
  // Gradients (represented as arrays for LinearGradient)
  gradients: {
    coral: ['#FFB3B3', '#FF8A80'],
    lavender: ['#E1BEE7', '#B39DDB'],
    mint: ['#C8E6C9', '#A5D6A7'],
    peach: ['#FFCC80', '#FFB74D'],
    sunset: ['#FFB3B3', '#FFCC80'],
    aurora: ['#E1BEE7', '#B2DFDB'],
  }
}

// Enhanced theme for React Native Paper
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
  },
  roundness: 16, // Increased for more modern look
}

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

// Shadow styles for depth
export const shadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  }
}

// Typography styles
export const typography = {
  heading: {
    fontSize: 28,
    fontWeight: '700' as '700',
    color: colors.text,
    lineHeight: 34,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600' as '600',
    color: colors.text,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as '400',
    color: colors.textSecondary,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as '400',
    color: colors.textTertiary,
    lineHeight: 18,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as '600',
    lineHeight: 20,
  }
}

// Common card styles inspired by reference design
export const cardStyles = {
  base: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadows.medium,
  },
  compact: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.light,
  },
  large: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    ...shadows.heavy,
  }
}

// Button styles
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.light,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.light,
  }
}

// Common screen patterns
export const screenStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  }
}

// Common header patterns
export const headerStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...shadows.light,
  },
  title: {
    ...typography.subheading,
    color: colors.text,
  },
  backButton: {
    padding: spacing.sm,
  }
} 