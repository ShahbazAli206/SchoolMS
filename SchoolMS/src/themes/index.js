/**
 * THEME BARREL EXPORT
 * Import everything from '@/themes' in components.
 */

import {lightColors, darkColors} from './colors';
import {fontFamily, fontSize, fontWeight, lineHeight, textStyles} from './typography';
import {spacing, borderRadius, shadow, zIndex} from './spacing';

export const lightTheme = {
  colors: lightColors,
  fonts: fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  shadow,
  zIndex,
  dark: false,
};

export const darkTheme = {
  colors: darkColors,
  fonts: fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  shadow,
  zIndex,
  dark: true,
};

export {lightColors, darkColors} from './colors';
export {fontFamily, fontSize, fontWeight, lineHeight, textStyles} from './typography';
export {spacing, borderRadius, shadow, zIndex} from './spacing';
