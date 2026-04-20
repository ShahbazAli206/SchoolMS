import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';

const SplashScreen = () => (
  <View style={styles.container}>
    <Text style={styles.logo}>SchoolMS</Text>
    <Text style={styles.tagline}>School Management System</Text>
    <ActivityIndicator size="large" color="#fff" style={{marginTop: 32}} />
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4A90D9'},
  logo: {fontSize: 40, fontWeight: '800', letterSpacing: 2, color: '#fff'},
  tagline: {fontSize: 14, marginTop: 8, color: 'rgba(255,255,255,0.8)'},
});

export default SplashScreen;
