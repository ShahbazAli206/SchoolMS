import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';

const AppHeader = ({title, subtitle, onBack, rightElement, transparent = false}) => {
  const {colors, spacing, textStyles} = useTheme();
  const insets = useSafeAreaInsets();

  const bg = transparent ? colors.transparent : '#1A1535';
  const titleColor = transparent ? colors.textPrimary : '#FFFFFF';
  const subColor   = transparent ? colors.textSecondary : 'rgba(255,255,255,0.65)';

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={bg} translucent={false} />
      <View style={[styles.header, {backgroundColor: bg, paddingHorizontal: spacing.base, paddingTop: insets.top + 12, paddingBottom: 14}]}>
        <View style={styles.row}>
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backBtn}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <View style={styles.backPill}>
                <Text style={styles.backChevron}>‹</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}

          <View style={styles.titleWrap}>
            <Text style={[textStyles.h5, {color: titleColor}]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[textStyles.caption, {color: subColor}]}>{subtitle}</Text>
            ) : null}
          </View>

          <View style={styles.rightWrap}>{rightElement || null}</View>
        </View>
        {/* decorative bubble */}
        <View style={styles.bubble} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header:    {overflow: 'hidden'},
  row:       {flexDirection: 'row', alignItems: 'center', zIndex: 2},
  backBtn:   {width: 40},
  backPill:  {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  backChevron: {color: '#FFFFFF', fontSize: 26, fontWeight: '300', lineHeight: 30, marginLeft: -2},
  titleWrap: {flex: 1, alignItems: 'center'},
  rightWrap: {width: 40, alignItems: 'flex-end'},
  bubble:    {position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(162,155,254,0.1)', top: -20, right: -10},
});

export default AppHeader;
