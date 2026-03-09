export const Colors = {
  // Primary brand
  navy: '#0A1628',
  navyLight: '#142240',
  navyMid: '#1C3461',
  gold: '#C9A84C',
  goldLight: '#E8C97A',
  goldDark: '#A07C2E',

  // UI
  white: '#FFFFFF',
  offWhite: '#F8F5EE',
  lightGray: '#E8E4DC',
  midGray: '#9E9E9E',
  darkGray: '#4A4A4A',

  // Highlights
  highlightGold: 'rgba(201, 168, 76, 0.35)',
  highlightRed: 'rgba(220, 53, 69, 0.30)',
  highlightBlue: 'rgba(30, 100, 200, 0.25)',
  highlightGreen: 'rgba(40, 167, 69, 0.28)',

  highlightGoldSolid: '#C9A84C',
  highlightRedSolid: '#DC3545',
  highlightBlueSolid: '#1E64C8',
  highlightGreenSolid: '#28A745',

  // Semantic
  background: '#0A1628',
  surface: '#142240',
  surfaceAlt: '#1C3461',
  border: '#2A4070',
  text: '#F8F5EE',
  textSecondary: '#B8C4D8',
  textMuted: '#6B7FA3',

  // Dark mode
  darkBackground: '#050D1A',
  darkSurface: '#0A1628',
};

export const DarkColors = {
  ...Colors,
  background: '#050D1A',
  surface: '#0A1628',
  surfaceAlt: '#142240',
};

export const LightColors = {
  ...Colors,
  navy: '#1C3461',
  background: '#F8F5EE',
  surface: '#FFFFFF',
  surfaceAlt: '#EEE9DF',
  border: '#D4C9B0',
  text: '#1A2540',
  textSecondary: '#3D4F6B',
  textMuted: '#7A8BA8',
};

export const Typography = {
  // Bible reading font (serif)
  bibleFamily: 'PlayfairDisplay_400Regular',
  bibleFamilyBold: 'PlayfairDisplay_700Bold',

  // UI font (sans-serif)
  uiFamily: 'Inter_400Regular',
  uiFamilyMedium: 'Inter_500Medium',
  uiFamilyBold: 'Inter_700Bold',

  // Sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const HIGHLIGHT_COLORS = [
  { key: 'gold', label: 'Gold', solid: Colors.highlightGoldSolid, bg: Colors.highlightGold },
  { key: 'red', label: 'Red', solid: Colors.highlightRedSolid, bg: Colors.highlightRed },
  { key: 'blue', label: 'Blue', solid: Colors.highlightBlueSolid, bg: Colors.highlightBlue },
  { key: 'green', label: 'Green', solid: Colors.highlightGreenSolid, bg: Colors.highlightGreen },
] as const;

export type HighlightColor = 'gold' | 'red' | 'blue' | 'green';
