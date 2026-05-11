import React, {useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated, Easing, TouchableOpacity} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const DEFAULT_ANNOUNCEMENTS = [
  {id: 1, text: '📅 Mid-Term Exams: 20 May – 25 May 2026'},
  {id: 2, text: '🎉 Annual Sports Day: 30 May 2026 — All students participate!'},
  {id: 3, text: '📋 Parent-Teacher Meeting: 15 May 2026, 10am–1pm'},
  {id: 4, text: '🏖️ Summer Holidays: 1 June – 15 July 2026'},
  {id: 5, text: '🔔 Fee submission deadline: 10 May 2026'},
];

const AnnouncementTicker = ({announcements = DEFAULT_ANNOUNCEMENTS, accentColor}) => {
  const {colors, borderRadius} = useTheme();
  const [idx, setIdx] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const accent = accentColor || colors.primary;

  const advance = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  {toValue: 0, duration: 300, useNativeDriver: true}),
      Animated.timing(slideAnim, {toValue: -8, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease)}),
    ]).start(() => {
      setIdx(i => (i + 1) % announcements.length);
      slideAnim.setValue(8);
      Animated.parallel([
        Animated.timing(fadeAnim,  {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.timing(slideAnim, {toValue: 0, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease)}),
      ]).start();
    });
  };

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(advance, 4000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcements.length]);

  if (!announcements.length) return null;

  return (
    <TouchableOpacity onPress={advance} activeOpacity={0.9}
      style={[styles.ticker, {backgroundColor: accent + '15', borderRadius: borderRadius.lg, borderLeftWidth: 3, borderLeftColor: accent}]}>
      <View style={[styles.badge, {backgroundColor: accent}]}>
        <Text style={styles.badgeText}>NEWS</Text>
      </View>
      <Animated.Text
        style={[styles.text, {color: colors.textPrimary, opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}
        numberOfLines={1}>
        {announcements[idx]?.text}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ticker:  {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, gap: 10, overflow: 'hidden'},
  badge:   {borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2},
  badgeText: {color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.6},
  text:    {flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 16},
});

export default AnnouncementTicker;
