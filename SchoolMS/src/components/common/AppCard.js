import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const AppCard = ({children, style, padding, elevated = true}) => {
  const {colors, borderRadius, shadow, spacing} = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBg,
          borderRadius: borderRadius.xl,
          padding: padding ?? spacing.xl,
          ...(elevated ? shadow.md : {}),
          shadowColor: colors.shadowColor,
        },
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({card: {}});

export default AppCard;
