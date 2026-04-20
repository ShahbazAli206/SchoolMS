import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const AppHeader = ({title, subtitle, onBack, rightElement, transparent = false}) => {
  const {colors, spacing, textStyles} = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: transparent ? colors.transparent : colors.headerBg,
          paddingHorizontal: spacing.base,
          paddingTop: spacing.base,
          paddingBottom: spacing.md,
        },
      ]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={{fontSize: 22, color: transparent ? colors.textPrimary : colors.headerIcon}}>
              ←
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.titleWrap}>
          <Text
            style={[textStyles.h5, {color: transparent ? colors.textPrimary : colors.headerText}]}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                textStyles.caption,
                {color: transparent ? colors.textSecondary : colors.whiteAlpha80},
              ]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightWrap}>{rightElement || null}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
  row: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {width: 36},
  titleWrap: {flex: 1, alignItems: 'center'},
  rightWrap: {width: 36, alignItems: 'flex-end'},
});

export default AppHeader;
