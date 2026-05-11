import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

/**
 * Subtle animated background — slowly drifting soft circles.
 * Lightweight (no images / video) and respects light/dark theme.
 */
const AnimatedBackground = ({children, style}) => {
  const {colors, isDark} = useTheme();
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (val, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {toValue: 1, duration, useNativeDriver: true}),
          Animated.timing(val, {toValue: 0, duration, useNativeDriver: true}),
        ]),
      ).start();

    loop(a1, 9000);
    loop(a2, 13000);
    loop(a3, 11000);
  }, [a1, a2, a3]);

  const tx = (val, from, to) => val.interpolate({inputRange: [0, 1], outputRange: [from, to]});

  // soft tints
  const c1 = isDark ? 'rgba(108,92,231,0.18)'  : 'rgba(108,92,231,0.10)';
  const c2 = isDark ? 'rgba(0,206,201,0.12)'   : 'rgba(0,184,148,0.08)';
  const c3 = isDark ? 'rgba(253,203,110,0.10)' : 'rgba(253,203,110,0.10)';

  return (
    <View style={[styles.wrap, {backgroundColor: colors.background}, style]}>
      <Animated.View
        style={[styles.blob, {
          backgroundColor: c1,
          top: -60, left: -40, width: 220, height: 220, borderRadius: 110,
          transform: [{translateX: tx(a1, -10, 30)}, {translateY: tx(a1, 0, 40)}],
        }]}
      />
      <Animated.View
        style={[styles.blob, {
          backgroundColor: c2,
          top: 200, right: -80, width: 260, height: 260, borderRadius: 130,
          transform: [{translateX: tx(a2, 0, -40)}, {translateY: tx(a2, 0, -30)}],
        }]}
      />
      <Animated.View
        style={[styles.blob, {
          backgroundColor: c3,
          bottom: -100, left: -60, width: 240, height: 240, borderRadius: 120,
          transform: [{translateX: tx(a3, 0, 50)}, {translateY: tx(a3, 0, -20)}],
        }]}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {flex: 1, overflow: 'hidden'},
  blob: {position: 'absolute'},
});

export default AnimatedBackground;
