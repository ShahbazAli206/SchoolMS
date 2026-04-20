import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';

/**
 * Reusable Page Header Component
 * Provides consistent styling with proper status bar padding and action buttons
 */
const PageHeader = ({
  title,
  subtitle,
  onAddPress,
  addLabel = '+ Add',
  onBackPress,
  showBack = false,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius} = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.headerBg,
          paddingTop: spacing.base + insets.top,
          paddingBottom: spacing.lg,
          paddingHorizontal: spacing.base,
        },
      ]}>
      <View style={styles.headerTop}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={[styles.backBtn, {paddingRight: spacing.md}]}>
            <Text style={{fontSize: 18}}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={[textStyles.h4, {color: colors.white, fontWeight: '700'}]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[textStyles.caption, {color: colors.whiteAlpha80, marginTop: 2}]}>
              {subtitle}
            </Text>
          )}
        </View>
        {onAddPress && (
          <TouchableOpacity
            onPress={onAddPress}
            style={[
              styles.addBtn,
              {
                backgroundColor: colors.whiteAlpha20,
                borderRadius: borderRadius.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              },
            ]}>
            <Text style={[textStyles.label, {color: colors.white, fontWeight: '600'}]}>
              {addLabel}
            </Text>
          </TouchableOpacity>
        )}
        {rightAction && <View>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
  headerTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  backBtn: {padding: 4},
  titleWrap: {flex: 1},
  addBtn: {},
});

export default PageHeader;
