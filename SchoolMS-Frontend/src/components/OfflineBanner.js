import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const OfflineBanner = () => {
  const [isOnline, setIsOnline]     = useState(true);
  const [visible,  setVisible]      = useState(false);
  const slideAnim                   = useState(new Animated.Value(-48))[0];

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const online = !!(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      if (!online) {
        setVisible(true);
        Animated.spring(slideAnim, {toValue: 0, useNativeDriver: true}).start();
      } else {
        Animated.timing(slideAnim, {toValue: -48, duration: 300, useNativeDriver: true}).start(() => {
          setVisible(false);
        });
      }
    });
    return unsub;
  }, [slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, {transform: [{translateY: slideAnim}]}]}>
      <Text style={styles.text}>
        {isOnline ? '✓  Back online' : '⚠  No internet connection'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    alignItems: 'center',
  },
  text: {color: '#fff', fontWeight: '600', fontSize: 13},
});

export default OfflineBanner;
