import React from 'react';
import {TouchableOpacity, Text, StyleSheet, Linking, Alert, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const PHONE   = '923000000000';   // school WhatsApp number — TODO: pull from config
const MESSAGE = 'Hello, I have a query about Greenfield Public School.';

const FloatingChatButton = ({bottomOffset = 70}) => {
  const insets = useSafeAreaInsets();

  const open = async () => {
    const appUrl = `whatsapp://send?phone=${PHONE}&text=${encodeURIComponent(MESSAGE)}`;
    const webUrl = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

    try {
      await Linking.openURL(appUrl);
    } catch (e1) {
      try {
        await Linking.openURL(webUrl);
      } catch (e2) {
        Alert.alert('WhatsApp unavailable', 'Could not open WhatsApp. Please install it and try again.');
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={open}
      activeOpacity={0.85}
      style={[styles.fab, {bottom: bottomOffset + insets.bottom}]}>
      <Text style={styles.icon}>💬</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#25D366',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
    ...(Platform.OS === 'web' ? {} : {}),
  },
  icon: {fontSize: 26, color: '#FFFFFF'},
});

export default FloatingChatButton;
