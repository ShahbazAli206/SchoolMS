import React, {useEffect, useRef} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated,
  Dimensions, Easing,
} from 'react-native';

const {height: SCREEN_H} = Dimensions.get('window');

const ACTIONS = [
  {key: 'Attendance',              icon: '✅', label: 'Take Attendance',     tint: '#00B894', bg: '#E5FBF5'},
  {key: 'Assignments',             icon: '📝', label: 'New Assignment',      tint: '#6C5CE7', bg: '#EEEBFF'},
  {key: 'Marks',                   icon: '📊', label: 'Enter Marks',         tint: '#0984E3', bg: '#EBF5FF'},
  {key: 'UploadMaterial',          icon: '📁', label: 'Upload Material',     tint: '#FDCB6E', bg: '#FFF7E0'},
  {key: 'TeacherSubmitComplaint',  icon: '⚠️', label: 'Notify Parent',       tint: '#FF7675', bg: '#FFE5E5'},
  {key: 'NewConversation',         icon: '💬', label: 'Start New Chat',      tint: '#00CEC9', bg: '#E0F9F8'},
];

const TeacherActionSheet = ({visible, onClose, navigation}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,  {toValue: 1, duration: 220, useNativeDriver: true}),
        Animated.spring(slide, {toValue: 0, friction: 8, tension: 65, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,  {toValue: 0, duration: 180, useNativeDriver: true}),
        Animated.timing(slide, {toValue: SCREEN_H, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true}),
      ]).start();
    }
  }, [visible, fade, slide]);

  const pick = (key) => {
    onClose();
    // All target screens live inside HomeTab's HomeStack now.
    // The action sheet sits at RootStack level, so we navigate Main → HomeTab → <screen>.
    navigation.navigate('Main', {screen: 'HomeTab', params: {screen: key}});
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, {opacity: fade}]}>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, {transform: [{translateY: slide}]}]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Quick Actions</Text>
        <Text style={styles.subtitle}>What do you want to do?</Text>

        <View style={styles.grid}>
          {ACTIONS.map((a, i) => (
            <ActionItem key={a.key} action={a} index={i} onPress={() => pick(a.key)} />
          ))}
        </View>

        <TouchableOpacity onPress={onClose} style={styles.cancel} activeOpacity={0.8}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const ActionItem = ({action, index, onPress}) => {
  const scale = useRef(new Animated.Value(0.85)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {toValue: 1, friction: 6, delay: 50 + index * 35, useNativeDriver: true}),
      Animated.timing(fade, {toValue: 1, duration: 280, delay: 50 + index * 35, useNativeDriver: true}),
    ]).start();
  }, [scale, fade, index]);

  return (
    <Animated.View style={{width: '33.33%', padding: 6, opacity: fade, transform: [{scale}]}}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.item}>
        <View style={[styles.itemIcon, {backgroundColor: action.bg}]}>
          <Text style={{fontSize: 22, color: action.tint}}>{action.icon}</Text>
        </View>
        <Text style={styles.itemLabel} numberOfLines={2}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'},
  sheet: {position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 26, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: {width: 0, height: -4}, elevation: 24},
  handle: {alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginBottom: 12},
  title: {fontSize: 17, fontWeight: '800', color: '#1F2937', paddingHorizontal: 8},
  subtitle: {fontSize: 12, color: '#9CA3AF', paddingHorizontal: 8, marginTop: 2, marginBottom: 14},
  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  item: {alignItems: 'center', paddingVertical: 10},
  itemIcon: {width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  itemLabel: {fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center', lineHeight: 14},
  cancel: {marginTop: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14},
  cancelText: {color: '#374151', fontWeight: '700', fontSize: 14},
});

export default TeacherActionSheet;
