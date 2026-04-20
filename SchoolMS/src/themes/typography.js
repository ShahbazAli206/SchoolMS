/**
 * GLOBAL TYPOGRAPHY
 * Change font families, sizes, or weights here to update the entire app.
 */

export const fontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  light: 'System',
};

export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const textStyles = {
  h1: {fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['4xl'] * 1.2},
  h2: {fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['3xl'] * 1.2},
  h3: {fontSize: fontSize['2xl'], fontWeight: fontWeight.semiBold, lineHeight: fontSize['2xl'] * 1.3},
  h4: {fontSize: fontSize.xl, fontWeight: fontWeight.semiBold, lineHeight: fontSize.xl * 1.3},
  h5: {fontSize: fontSize.lg, fontWeight: fontWeight.medium, lineHeight: fontSize.lg * 1.4},
  h6: {fontSize: fontSize.md, fontWeight: fontWeight.medium, lineHeight: fontSize.md * 1.4},
  body1: {fontSize: fontSize.base, fontWeight: fontWeight.regular, lineHeight: fontSize.base * 1.5},
  body2: {fontSize: fontSize.sm, fontWeight: fontWeight.regular, lineHeight: fontSize.sm * 1.5},
  caption: {fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: fontSize.xs * 1.4},
  label: {fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: fontSize.sm * 1.4},
  button: {fontSize: fontSize.base, fontWeight: fontWeight.semiBold, lineHeight: fontSize.base * 1.2},
  overline: {fontSize: fontSize.xs, fontWeight: fontWeight.medium, letterSpacing: 1.5},
};
