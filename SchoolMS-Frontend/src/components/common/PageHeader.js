import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';

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
  const {colors} = useTheme();

  return (
    <>
      <StatusBar
        barStyle="light-content"
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
              <View style={styles.backArrow}>
                <Text style={styles.backArrowText}>←</Text>
              </View>
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
              <Text style={[styles.subtitle, {color: 'rgba(255,255,255,0.7)'}]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.rightWrap}>
            {onAddPress ? (
              <TouchableOpacity
                onPress={onAddPress}
                style={styles.addBtn}>
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
    paddingBottom: 14,
    borderBottomWidth: 0,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrowText: {color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: -1},
  titleWrap: {flex: 1, alignItems: 'center'},
  title:    {fontSize: 17, fontWeight: '800', color: '#FFFFFF'},
  subtitle: {fontSize: 11, marginTop: 1, fontWeight: '500'},
  rightWrap: {minWidth: 40, alignItems: 'flex-end'},
  addBtn:   {paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)'},
  addBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '800'},
});

export default PageHeader;
