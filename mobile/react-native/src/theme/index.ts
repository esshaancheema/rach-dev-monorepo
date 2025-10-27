import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Color palette
const colors = {
  // Primary colors
  primary: '#667eea',
  primaryVariant: '#5a6fd8',
  onPrimary: '#ffffff',
  primaryContainer: '#e8eaff',
  onPrimaryContainer: '#1e2875',

  // Secondary colors
  secondary: '#764ba2',
  secondaryVariant: '#6a4190',
  onSecondary: '#ffffff',
  secondaryContainer: '#f3e8ff',
  onSecondaryContainer: '#2e1065',

  // Tertiary colors
  tertiary: '#36d1dc',
  tertiaryVariant: '#2bc4cf',
  onTertiary: '#ffffff',
  tertiaryContainer: '#e6fffe',
  onTertiaryContainer: '#003b3f',

  // Error colors
  error: '#ff5722',
  onError: '#ffffff',
  errorContainer: '#ffede8',
  onErrorContainer: '#d32f2f',

  // Success colors
  success: '#4caf50',
  onSuccess: '#ffffff',
  successContainer: '#e8f5e8',
  onSuccessContainer: '#2e7d32',

  // Warning colors
  warning: '#ff9800',
  onWarning: '#ffffff',
  warningContainer: '#fff3e0',
  onWarningContainer: '#f57c00',

  // Info colors
  info: '#2196f3',
  onInfo: '#ffffff',
  infoContainer: '#e3f2fd',
  onInfoContainer: '#1976d2',

  // Surface colors
  background: '#fefbff',
  onBackground: '#1c1b1f',
  surface: '#ffffff',
  onSurface: '#1c1b1f',
  surfaceVariant: '#f4f0f7',
  onSurfaceVariant: '#49454e',
  surfaceDisabled: 'rgba(28, 27, 31, 0.12)',

  // Outline colors
  outline: '#7a757f',
  outlineVariant: '#cac5cd',

  // Shadow and other colors
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#f4eff4',
  inversePrimary: '#cfbcff',

  // Additional colors
  backdrop: 'rgba(0, 0, 0, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#f7f5fa',
    level2: '#f1eff4',
    level3: '#ebeaef',
    level4: '#e7e5ea',
    level5: '#e1dfe5',
  },
};

const darkColors = {
  // Primary colors
  primary: '#cfbcff',
  primaryVariant: '#b8a7f5',
  onPrimary: '#2e2875',
  primaryContainer: '#45398b',
  onPrimaryContainer: '#e8eaff',

  // Secondary colors
  secondary: '#d1b3ff',
  secondaryVariant: '#c49aff',
  onSecondary: '#3e1f7a',
  secondaryContainer: '#572e91',
  onSecondaryContainer: '#f3e8ff',

  // Tertiary colors
  tertiary: '#4fd8eb',
  tertiaryVariant: '#36d1dc',
  onTertiary: '#003b3f',
  tertiaryContainer: '#005356',
  onTertiaryContainer: '#e6fffe',

  // Error colors
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  // Success colors
  success: '#81c784',
  onSuccess: '#003911',
  successContainer: '#1b5e20',
  onSuccessContainer: '#a5d6a7',

  // Warning colors
  warning: '#ffcc80',
  onWarning: '#4a2800',
  warningContainer: '#6a3c00',
  onWarningContainer: '#ffe0b2',

  // Info colors
  info: '#90caf9',
  onInfo: '#002c69',
  infoContainer: '#004494',
  onInfoContainer: '#bbdefb',

  // Surface colors
  background: '#141218',
  onBackground: '#e6e1e5',
  surface: '#141218',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454e',
  onSurfaceVariant: '#cac5cd',
  surfaceDisabled: 'rgba(230, 225, 229, 0.12)',

  // Outline colors
  outline: '#948f96',
  outlineVariant: '#49454e',

  // Shadow and other colors
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#e6e1e5',
  inverseOnSurface: '#313033',
  inversePrimary: '#667eea',

  // Additional colors
  backdrop: 'rgba(0, 0, 0, 0.4)',
  elevation: {
    level0: 'transparent',
    level1: '#1f1d23',
    level2: '#26242a',
    level3: '#2e2c32',
    level4: '#323034',
    level5: '#373539',
  },
};

// Typography
const fonts = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: 57,
    fontWeight: '400' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: 45,
    fontWeight: '400' as const,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: 36,
    fontWeight: '400' as const,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

// Light theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  fonts,
  roundness: 12,
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...darkColors,
  },
  fonts,
  roundness: 12,
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Elevation levels
export const elevation = {
  none: 0,
  small: 2,
  medium: 4,
  large: 8,
  xlarge: 12,
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Screen sizes
export const breakpoints = {
  small: 360,
  medium: 768,
  large: 1024,
  xlarge: 1440,
};

// Z-index levels
export const zIndex = {
  hide: -1,
  base: 0,
  elevated: 1,
  sticky: 10,
  overlay: 100,
  modal: 1000,
  popover: 1010,
  tooltip: 1020,
  notification: 1030,
};

export type Theme = typeof theme;
export type ThemeColors = typeof colors;