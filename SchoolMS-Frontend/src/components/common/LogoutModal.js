import React, {useRef, useEffect} from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const {width} = Dimensions.get('window');

const LogoutModal = ({visible, onCancel, onConfirm}) => {
  const {colors, borderRadius, textStyles} = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {toValue: 1, friction: 7, tension: 60, useNativeDriver: true}),
        Animated.timing(opacityAnim, {toValue: 1, duration: 200, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {toValue: 0.85, friction: 7, useNativeDriver: true}),
        Animated.timing(opacityAnim, {toValue: 0, duration: 150, useNativeDriver: true}),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}>

      {/* Layered blur simulation — dark + tinted overlay */}
      <View style={styles.backdropBase} />
      <View style={styles.backdropMid} />
      <View style={styles.backdropTop} />

      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              borderColor: 'rgba(108,92,231,0.25)',
              transform: [{scale: scaleAnim}],
              opacity: opacityAnim,
            },
          ]}>

          {/* Icon circle */}
          <View style={[styles.iconCircle, {backgroundColor: 'rgba(108,92,231,0.12)'}]}>
            <Text style={styles.iconEmoji}>🚪</Text>
          </View>

          {/* Title */}
          <Text style={[textStyles.h5 ?? styles.title, {color: colors.textPrimary, textAlign: 'center', marginTop: 16, fontWeight: '800', fontSize: 20}]}>
            Sign Out?
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
            You'll be logged out of your account. Any unsaved changes will be lost.
          </Text>

          {/* Divider */}
          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              style={[styles.btn, styles.btnCancel, {backgroundColor: colors.inputBg, borderRadius: borderRadius.lg, borderColor: colors.border}]}>
              <Text style={[styles.btnText, {color: colors.textPrimary}]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              style={[styles.btn, styles.btnConfirm, {borderRadius: borderRadius.lg}]}>
              <View style={[StyleSheet.absoluteFill, {borderRadius: borderRadius.lg, backgroundColor: '#6C5CE7'}]} />
              <Text style={[styles.btnText, {color: '#fff'}]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backdropMid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,10,40,0.30)',
  },
  backdropTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(108,92,231,0.08)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnConfirm: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
});

export default LogoutModal;
