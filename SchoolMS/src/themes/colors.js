/**
 * GLOBAL COLOR PALETTE
 * Change any value here to update the entire app's color scheme.
 * All components import from this file — never hardcode colors elsewhere.
 */

const palette = {
  // Brand
  primaryBlue: '#7B5BFF',
  primaryBlueDark: '#5036EA',
  primaryBlueLight: '#A78CFF',
  primaryBlueFaded: '#EFE7FF',

  // Accent
  accentGreen: '#14D2B8',
  accentGreenDark: '#0FA982',
  accentGreenLight: '#87E7D1',
  accentGreenFaded: '#E9F8F4',

  accentOrange: '#FF8B3B',
  accentOrangeDark: '#E56D2B',
  accentOrangeLight: '#FFB97A',
  accentOrangeFaded: '#FFF2E6',

  accentRed: '#FF4F60',
  accentRedDark: '#D5394A',
  accentRedLight: '#FF9AA2',
  accentRedFaded: '#FFE8EB',

  accentYellow: '#FFD166',
  accentYellowDark: '#E6AC3E',
  accentYellowLight: '#FFE699',
  accentYellowFaded: '#FFF5D9',

  accentPurple: '#8C6FF7',
  accentPurpleLight: '#C8B5FF',
  accentPurpleFaded: '#F3EBFF',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey200: '#EEEEEE',
  grey300: '#E0E0E0',
  grey400: '#BDBDBD',
  grey500: '#9E9E9E',
  grey600: '#757575',
  grey700: '#616161',
  grey800: '#424242',
  grey900: '#212121',

  // Transparency
  overlay10: 'rgba(0,0,0,0.10)',
  overlay20: 'rgba(0,0,0,0.20)',
  overlay40: 'rgba(0,0,0,0.40)',
  overlay60: 'rgba(0,0,0,0.60)',
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha20: 'rgba(255,255,255,0.20)',
  whiteAlpha40: 'rgba(255,255,255,0.40)',
  whiteAlpha80: 'rgba(255,255,255,0.80)',

  // Glassmorphism
  glassBg: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.25)',
  glassBgDark: 'rgba(0,0,0,0.25)',

  // Transparent
  transparent: 'transparent',
};

// ─────────────────────────────────────────────────────────
//  LIGHT THEME  (default)
// ─────────────────────────────────────────────────────────
export const lightColors = {
  // Core brand
  primary: palette.primaryBlue,
  primaryDark: palette.primaryBlueDark,
  primaryLight: palette.primaryBlueLight,
  primaryFaded: palette.primaryBlueFaded,

  // Status
  success: palette.accentGreen,
  successDark: palette.accentGreenDark,
  successLight: palette.accentGreenLight,
  successFaded: palette.accentGreenFaded,

  warning: palette.accentOrange,
  warningDark: palette.accentOrangeDark,
  warningLight: palette.accentOrangeLight,
  warningFaded: palette.accentOrangeFaded,

  error: palette.accentRed,
  errorDark: palette.accentRedDark,
  errorLight: palette.accentRedLight,
  errorFaded: palette.accentRedFaded,

  info: palette.accentYellow,
  infoFaded: palette.accentYellowFaded,

  // Role badge colors
  roleAdmin: palette.accentPurple,
  roleAdminFaded: palette.accentPurpleFaded,
  roleTeacher: palette.primaryBlue,
  roleTeacherFaded: palette.primaryBlueFaded,
  roleStudent: palette.accentGreen,
  roleStudentFaded: palette.accentGreenFaded,
  roleParent: palette.accentOrange,
  roleParentFaded: palette.accentOrangeFaded,
  roleStaff: palette.grey700,
  roleStaffFaded: palette.grey200,

  // Backgrounds
  background: palette.grey50,
  surface: palette.white,
  surfaceElevated: palette.white,
  cardBg: palette.white,
  inputBg: palette.grey100,

  // Text
  textPrimary: palette.grey900,
  textSecondary: palette.grey600,
  textTertiary: palette.grey500,
  textDisabled: palette.grey400,
  textInverse: palette.white,
  textLink: palette.primaryBlue,

  // Borders & dividers
  border: palette.grey300,
  borderLight: palette.grey200,
  divider: palette.grey200,

  // Navigation
  navBackground: palette.white,
  navBorder: palette.grey200,
  navActive: palette.primaryBlue,
  navInactive: palette.grey500,

  // Header
  headerBg: palette.primaryBlue,
  headerText: palette.white,
  headerIcon: palette.white,

  // Tab bar
  tabBarBg: palette.white,
  tabBarActive: palette.primaryBlue,
  tabBarInactive: palette.grey400,

  // Icons
  iconPrimary: palette.grey700,
  iconSecondary: palette.grey500,
  iconDisabled: palette.grey300,

  // Shadows
  shadowColor: palette.black,

  // Gradient stops (used with LinearGradient)
  gradientStart: palette.primaryBlue,
  gradientEnd: palette.primaryBlueDark,
  gradientAlt1: '#4A90E2',
  gradientAlt2: '#1A73E8',

  // Glass
  glassBg: palette.glassBg,
  glassBorder: palette.glassBorder,

  // Misc
  overlay: palette.overlay20,
  transparent: palette.transparent,
  white: palette.white,
  black: palette.black,
  whiteAlpha10: palette.whiteAlpha10,
  whiteAlpha20: palette.whiteAlpha20,
  whiteAlpha40: palette.whiteAlpha40,
  whiteAlpha80: palette.whiteAlpha80,
};

// ─────────────────────────────────────────────────────────
//  DARK THEME
// ─────────────────────────────────────────────────────────
export const darkColors = {
  primary: palette.primaryBlueLight,
  primaryDark: palette.primaryBlue,
  primaryLight: '#90CAF9',
  primaryFaded: 'rgba(74,144,226,0.15)',

  success: palette.accentGreenLight,
  successDark: palette.accentGreen,
  successLight: '#A5D6A7',
  successFaded: 'rgba(52,168,83,0.15)',

  warning: palette.accentOrangeLight,
  warningDark: palette.accentOrange,
  warningLight: '#FFCC80',
  warningFaded: 'rgba(255,109,0,0.15)',

  error: palette.accentRedLight,
  errorDark: palette.accentRed,
  errorLight: '#FFCDD2',
  errorFaded: 'rgba(234,67,53,0.15)',

  info: palette.accentYellowLight,
  infoFaded: 'rgba(251,188,4,0.15)',

  roleAdmin: palette.accentPurpleLight,
  roleAdminFaded: 'rgba(123,31,162,0.20)',
  roleTeacher: palette.primaryBlueLight,
  roleTeacherFaded: 'rgba(74,144,226,0.20)',
  roleStudent: palette.accentGreenLight,
  roleStudentFaded: 'rgba(52,168,83,0.20)',
  roleParent: palette.accentOrangeLight,
  roleParentFaded: 'rgba(255,109,0,0.20)',
  roleStaff: palette.grey400,
  roleStaffFaded: 'rgba(97,97,97,0.20)',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2C2C2C',
  cardBg: '#1E1E1E',
  inputBg: '#2C2C2C',

  textPrimary: palette.grey100,
  textSecondary: palette.grey400,
  textTertiary: palette.grey500,
  textDisabled: palette.grey700,
  textInverse: palette.grey900,
  textLink: palette.primaryBlueLight,

  border: palette.grey700,
  borderLight: palette.grey800,
  divider: '#2C2C2C',

  navBackground: '#1E1E1E',
  navBorder: palette.grey800,
  navActive: palette.primaryBlueLight,
  navInactive: palette.grey600,

  headerBg: '#1A1A2E',
  headerText: palette.white,
  headerIcon: palette.white,

  tabBarBg: '#1E1E1E',
  tabBarActive: palette.primaryBlueLight,
  tabBarInactive: palette.grey600,

  iconPrimary: palette.grey300,
  iconSecondary: palette.grey500,
  iconDisabled: palette.grey700,

  shadowColor: palette.black,

  gradientStart: '#1A1A2E',
  gradientEnd: '#16213E',
  gradientAlt1: '#0F3460',
  gradientAlt2: '#1A73E8',

  glassBg: palette.glassBgDark,
  glassBorder: 'rgba(255,255,255,0.10)',

  overlay: palette.overlay40,
  transparent: palette.transparent,
  white: palette.white,
  black: palette.black,
  whiteAlpha10: palette.whiteAlpha10,
  whiteAlpha20: palette.whiteAlpha20,
  whiteAlpha40: palette.whiteAlpha40,
  whiteAlpha80: palette.whiteAlpha80,
};

export default palette;
