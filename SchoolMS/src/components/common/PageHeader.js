import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';

/**
 * Unified themed page header.
 * - Light mode: light surface bg + dark text + dark status-bar text
 * - Dark mode:  dark bg + light text + light status-bar text
 * The bg/text colors come from the theme so all screens stay consistent.
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
  const {colors, isDark} = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBg}
        translucent={false}
      />
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBg,
            paddingTop: insets.top + 10,
            borderBottomColor: colors.headerBorder,
          },
        ]}>
        <View style={styles.row}>
          {showBack ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backBtn}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Text style={[styles.backChevron, {color: colors.headerText}]}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          <View style={styles.titleWrap}>
            <Text
              style={[styles.title, {color: colors.headerText}]}
              numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, {color: colors.textSecondary}]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.rightWrap}>
            {onAddPress ? (
              <TouchableOpacity
                onPress={onAddPress}
                style={[styles.addBtn, {backgroundColor: colors.primary}]}>
                <Text style={styles.addBtnText}>{addLabel}</Text>
              </TouchableOpacity>
            ) : rightAction || null}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  backChevron: {fontSize: 30, fontWeight: '300', marginTop: -4},
  titleWrap: {flex: 1, alignItems: 'center'},
  title:    {fontSize: 16, fontWeight: '800'},
  subtitle: {fontSize: 11, marginTop: 1, fontWeight: '500'},
  rightWrap: {minWidth: 40, alignItems: 'flex-end'},
  addBtn:   {paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10},
  addBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '800'},
});

export default PageHeader;
