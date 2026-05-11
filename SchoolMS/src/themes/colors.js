const palette = {
  // Brand — rich indigo/violet (matches reference UI)
  primaryIndigo: '#6C5CE7',
  primaryIndigoDark: '#4834D4',
  primaryIndigoLight: '#A29BFE',
  primaryIndigoFaded: '#EEF0FF',

  // Secondary — vivid teal
  teal: '#00CEC9',
  tealDark: '#00A8A4',
  tealLight: '#81ECEC',
  tealFaded: '#E0F9F8',

  // Accent coral/orange
  coral: '#FF7675',
  coralDark: '#D63031',
  coralLight: '#FFAAAA',
  coralFaded: '#FFF0F0',

  // Accent amber
  amber: '#FDCB6E',
  amberDark: '#E17055',
  amberLight: '#FEE5A9',
  amberFaded: '#FFFBF0',

  // Accent mint
  mint: '#00B894',
  mintDark: '#00856E',
  mintLight: '#55EFC4',
  mintFaded: '#E5FBF5',

  // Accent sky blue
  sky: '#74B9FF',
  skyDark: '#0984E3',
  skyLight: '#BAD9FF',
  skyFaded: '#EBF5FF',

  // Purple accent
  purple: '#A29BFE',
  purpleDark: '#6C5CE7',
  purpleFaded: '#F0EEFF',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  grey50:  '#F9FAFB',
  grey100: '#F3F4F6',
  grey200: '#E5E7EB',
  grey300: '#D1D5DB',
  grey400: '#9CA3AF',
  grey500: '#6B7280',
  grey600: '#4B5563',
  grey700: '#374151',
  grey800: '#1F2937',
  grey900: '#111827',

  // Transparency
  overlay10: 'rgba(0,0,0,0.10)',
  overlay20: 'rgba(0,0,0,0.20)',
  overlay40: 'rgba(0,0,0,0.40)',
  overlay60: 'rgba(0,0,0,0.60)',
  whiteAlpha10: 'rgba(255,255,255,0.10)',
  whiteAlpha20: 'rgba(255,255,255,0.20)',
  whiteAlpha40: 'rgba(255,255,255,0.40)',
  whiteAlpha80: 'rgba(255,255,255,0.80)',

  glassBg: 'rgba(255,255,255,0.18)',
  glassBorder: 'rgba(255,255,255,0.30)',
  glassBgDark: 'rgba(0,0,0,0.30)',

  transparent: 'transparent',
};

// ─────────────────────────────────────────────────────────
//  LIGHT THEME
// ─────────────────────────────────────────────────────────
export const lightColors = {
  primary: palette.primaryIndigo,
  primaryDark: palette.primaryIndigoDark,
  primaryLight: palette.primaryIndigoLight,
  primaryFaded: palette.primaryIndigoFaded,

  secondary: palette.teal,
  secondaryDark: palette.tealDark,
  secondaryLight: palette.tealLight,
  secondaryFaded: palette.tealFaded,

  success: palette.mint,
  successDark: palette.mintDark,
  successLight: palette.mintLight,
  successFaded: palette.mintFaded,

  warning: palette.amber,
  warningDark: palette.amberDark,
  warningLight: palette.amberLight,
  warningFaded: palette.amberFaded,

  error: palette.coral,
  errorDark: palette.coralDark,
  errorLight: palette.coralLight,
  errorFaded: palette.coralFaded,

  info: palette.sky,
  infoDark: palette.skyDark,
  infoFaded: palette.skyFaded,

  accent: palette.purple,
  accentFaded: palette.purpleFaded,

  // Role badge colors
  roleAdmin: palette.purple,
  roleAdminFaded: palette.purpleFaded,
  roleTeacher: palette.primaryIndigo,
  roleTeacherFaded: palette.primaryIndigoFaded,
  roleStudent: palette.teal,
  roleStudentFaded: palette.tealFaded,
  roleParent: palette.coral,
  roleParentFaded: palette.coralFaded,
  roleStaff: palette.grey600,
  roleStaffFaded: palette.grey200,

  // Backgrounds — soft tint, never pure white
  background: '#EEF0FB',
  surface: '#FBFBFF',
  surfaceElevated: palette.white,
  cardBg: '#FBFBFF',
  inputBg: palette.grey100,

  // Text
  textPrimary: palette.grey900,
  textSecondary: palette.grey600,
  textTertiary: palette.grey400,
  textDisabled: palette.grey300,
  textInverse: palette.white,
  textLink: palette.primaryIndigo,

  // Borders
  border: palette.grey200,
  borderLight: palette.grey100,
  divider: palette.grey100,

  // Navigation
  navBackground: palette.white,
  navBorder: palette.grey200,
  navActive: palette.primaryIndigo,
  navInactive: palette.grey400,

  // Header — unified: light surface in light mode, dark in dark mode
  headerBg: palette.white,
  headerText: palette.grey900,
  headerIcon: palette.grey700,
  headerBorder: palette.grey200,

  // Tab bar
  tabBarBg: palette.white,
  tabBarActive: palette.primaryIndigo,
  tabBarInactive: palette.grey400,

  // Icons
  iconPrimary: palette.grey700,
  iconSecondary: palette.grey400,
  iconDisabled: palette.grey300,

  shadowColor: '#6C5CE7',

  // Gradient stops
  gradientStart: '#6C5CE7',
  gradientMid: '#8E7CF8',
  gradientEnd: '#4834D4',
  gradientAlt1: '#00CEC9',
  gradientAlt2: '#0984E3',
  gradientWarm1: '#FDCB6E',
  gradientWarm2: '#E17055',

  glassBg: palette.glassBg,
  glassBorder: palette.glassBorder,

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
  primary: palette.primaryIndigoLight,
  primaryDark: palette.primaryIndigo,
  primaryLight: '#C7BFFF',
  primaryFaded: 'rgba(108,92,231,0.18)',

  secondary: palette.tealLight,
  secondaryDark: palette.teal,
  secondaryFaded: 'rgba(0,206,201,0.15)',

  success: palette.mintLight,
  successDark: palette.mint,
  successLight: '#A8F0DC',
  successFaded: 'rgba(0,184,148,0.15)',

  warning: palette.amberLight,
  warningDark: palette.amber,
  warningLight: '#FFE9B0',
  warningFaded: 'rgba(253,203,110,0.15)',

  error: palette.coralLight,
  errorDark: palette.coral,
  errorLight: '#FFCCCC',
  errorFaded: 'rgba(255,118,117,0.15)',

  info: palette.skyLight,
  infoDark: palette.sky,
  infoFaded: 'rgba(116,185,255,0.15)',

  accent: palette.purple,
  accentFaded: 'rgba(162,155,254,0.18)',

  roleAdmin: palette.purple,
  roleAdminFaded: 'rgba(162,155,254,0.20)',
  roleTeacher: palette.primaryIndigoLight,
  roleTeacherFaded: 'rgba(108,92,231,0.20)',
  roleStudent: palette.tealLight,
  roleStudentFaded: 'rgba(0,206,201,0.20)',
  roleParent: palette.coralLight,
  roleParentFaded: 'rgba(255,118,117,0.20)',
  roleStaff: palette.grey400,
  roleStaffFaded: 'rgba(75,85,99,0.20)',

  background: '#0F0E17',
  surface: '#1A1928',
  surfaceElevated: '#252338',
  cardBg: '#1A1928',
  inputBg: '#252338',

  textPrimary: '#F0EFFF',
  textSecondary: palette.grey400,
  textTertiary: palette.grey500,
  textDisabled: palette.grey700,
  textInverse: palette.grey900,
  textLink: palette.primaryIndigoLight,

  border: '#2E2C45',
  borderLight: '#1F1E30',
  divider: '#1F1E30',

  navBackground: '#1A1928',
  navBorder: '#2E2C45',
  navActive: palette.primaryIndigoLight,
  navInactive: palette.grey600,

  headerBg: '#1A1928',
  headerText: palette.white,
  headerIcon: palette.grey300,
  headerBorder: '#2E2C45',

  tabBarBg: '#1A1928',
  tabBarActive: palette.primaryIndigoLight,
  tabBarInactive: palette.grey600,

  iconPrimary: palette.grey300,
  iconSecondary: palette.grey500,
  iconDisabled: palette.grey700,

  shadowColor: palette.black,

  gradientStart: '#1A1928',
  gradientMid: '#252338',
  gradientEnd: '#12112A',
  gradientAlt1: '#00CEC9',
  gradientAlt2: '#0984E3',
  gradientWarm1: '#FDCB6E',
  gradientWarm2: '#E17055',

  glassBg: palette.glassBgDark,
  glassBorder: 'rgba(255,255,255,0.08)',

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
