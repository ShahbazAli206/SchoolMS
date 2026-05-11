import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const AppButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary | secondary | outline | danger | ghost
  size = 'md',         // sm | md | lg
  fullWidth = true,
  style,
  textStyle,
}) => {
  const {colors, borderRadius, textStyles, spacing} = useTheme();

  const bg = {
    primary:   colors.primary,
    secondary: colors.surface,
    outline:   colors.transparent,
    danger:    colors.error,
    ghost:     colors.transparent,
  }[variant];

  const textColor = {
    primary:   colors.white,
    secondary: colors.textPrimary,
    outline:   colors.primary,
    danger:    colors.white,
    ghost:     colors.primary,
  }[variant];

  const borderColor = variant === 'outline' ? colors.primary : colors.transparent;

  const padV = {sm: spacing.xs + 2, md: spacing.sm + 4, lg: spacing.md}[size];
  const fs   = {sm: 13, md: 15, lg: 16}[size];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderRadius: borderRadius.md,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor,
          paddingVertical: padV,
          paddingHorizontal: spacing.lg,
          width: fullWidth ? '100%' : undefined,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, {color: textColor, fontSize: fs, fontWeight: '600'}, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {alignItems: 'center', justifyContent: 'center', flexDirection: 'row'},
  text: {textAlign: 'center'},
});

export default AppButton;
