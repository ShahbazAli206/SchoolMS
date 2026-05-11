import React, {useEffect, useRef} from 'react';
import {Animated, Text, StyleSheet, View} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const AppToast = ({visible, message, type = 'info', duration = 3000, onHide}) => {
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  const bg = {
    success: colors.success,
    error:   colors.error,
    warning: colors.warning,
    info:    colors.primary,
  }[type] || colors.primary;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 250, useNativeDriver: true}),
        Animated.delay(duration),
        Animated.timing(opacity, {toValue: 0, duration: 300, useNativeDriver: true}),
      ]).start(() => onHide?.());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: bg,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.base,
          paddingVertical: spacing.sm + 2,
          opacity,
          bottom: 60,
        },
      ]}>
      <Text style={[textStyles.body2, {color: colors.white}]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignSelf: 'center',
    zIndex: 9999,
    alignItems: 'center',
  },
});

export default AppToast;
