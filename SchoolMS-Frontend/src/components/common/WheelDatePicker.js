import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated, Dimensions,
} from 'react-native';

const {height: SCREEN_H} = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const daysInMonth = (year, monthIndex0) => new Date(year, monthIndex0 + 1, 0).getDate();

// One wheel column
const Wheel = ({data, selectedIndex, onChange, formatItem}) => {
  const scrollRef = useRef(null);
  const lastIndex = useRef(selectedIndex);

  // Snap to the selected index when it changes externally (e.g. day clamp on month change)
  useEffect(() => {
    if (scrollRef.current && selectedIndex !== lastIndex.current) {
      scrollRef.current.scrollTo({y: selectedIndex * ITEM_HEIGHT, animated: false});
      lastIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Initial scroll
  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({y: selectedIndex * ITEM_HEIGHT, animated: false});
    }, 10);
    return () => clearTimeout(t);
  }, []);

  const handleMomentumEnd = (e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_HEIGHT)));
    if (idx !== lastIndex.current) {
      lastIndex.current = idx;
      onChange(idx);
    }
    // Snap exactly
    scrollRef.current?.scrollTo({y: idx * ITEM_HEIGHT, animated: true});
  };

  return (
    <View style={{height: WHEEL_HEIGHT, flex: 1, overflow: 'hidden'}}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{paddingVertical: (WHEEL_HEIGHT - ITEM_HEIGHT) / 2}}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleMomentumEnd}>
        {data.map((item, i) => {
          const distance = Math.abs(i - selectedIndex);
          const opacity = 1 - Math.min(0.6, distance * 0.18);
          const fontWeight = distance === 0 ? '800' : '500';
          const color = distance === 0 ? '#1F2937' : '#6B7280';
          const fontSize = distance === 0 ? 19 : 16;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              onPress={() => {
                scrollRef.current?.scrollTo({y: i * ITEM_HEIGHT, animated: true});
                lastIndex.current = i;
                onChange(i);
              }}
              style={{height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center'}}>
              <Text style={{opacity, fontWeight, color, fontSize}}>{formatItem ? formatItem(item) : item}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Slide-up modal date picker
const WheelDatePicker = ({visible, initialDate, minDate, maxDate, onConfirm, onClose, title = 'Pick a date'}) => {
  const now = new Date();
  const init = (() => {
    const d = initialDate instanceof Date ? initialDate : (initialDate ? new Date(initialDate) : now);
    return isNaN(d.getTime()) ? now : d;
  })();

  // Year range: 5 years back, 10 years forward (covers assignment due dates well)
  const baseYear = now.getFullYear();
  const yearStart = (minDate ? minDate.getFullYear() : baseYear - 5);
  const yearEnd   = (maxDate ? maxDate.getFullYear() : baseYear + 10);
  const years = useMemo(() => {
    const out = [];
    for (let y = yearStart; y <= yearEnd; y++) out.push(y);
    return out;
  }, [yearStart, yearEnd]);

  const [year,  setYear]  = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth()); // 0..11
  const [day,   setDay]   = useState(init.getDate());

  // When modal opens, re-seed from initialDate
  useEffect(() => {
    if (visible) {
      const d = initialDate instanceof Date ? initialDate : (initialDate ? new Date(initialDate) : now);
      const safe = isNaN(d.getTime()) ? now : d;
      setYear(safe.getFullYear());
      setMonth(safe.getMonth());
      setDay(safe.getDate());
    }
  }, [visible, initialDate]);

  // Clamp day when month/year change (e.g. Feb 30 → Feb 28)
  useEffect(() => {
    const max = daysInMonth(year, month);
    if (day > max) setDay(max);
  }, [year, month, day]);

  const days = useMemo(() => {
    const max = daysInMonth(year, month);
    return Array.from({length: max}, (_, i) => i + 1);
  }, [year, month]);

  // Slide-up animation
  const slide = useRef(new Animated.Value(SCREEN_H)).current;
  const fade  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,  {toValue: 1, duration: 220, useNativeDriver: true}),
        Animated.spring(slide, {toValue: 0, friction: 8, tension: 65, useNativeDriver: true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,  {toValue: 0, duration: 180, useNativeDriver: true}),
        Animated.timing(slide, {toValue: SCREEN_H, duration: 220, useNativeDriver: true}),
      ]).start();
    }
  }, [visible, slide, fade]);

  const confirm = () => {
    // Format as YYYY-MM-DD (local time, not UTC)
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const iso = `${year}-${mm}-${dd}`;
    onConfirm(iso, new Date(year, month, day));
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, {opacity: fade}]}>
        <TouchableOpacity style={{flex: 1}} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, {transform: [{translateY: slide}]}]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={confirm}>
            <Text style={styles.done}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wheelsWrap}>
          {/* Center selection bar (visual cue) */}
          <View pointerEvents="none" style={styles.selectionBar} />

          <Wheel
            data={days}
            selectedIndex={day - 1}
            onChange={(i) => setDay(days[i])}
          />
          <Wheel
            data={MONTHS}
            selectedIndex={month}
            onChange={(i) => setMonth(i)}
          />
          <Wheel
            data={years}
            selectedIndex={Math.max(0, years.indexOf(year))}
            onChange={(i) => setYear(years[i])}
          />
        </View>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Selected:</Text>
          <Text style={styles.previewValue}>
            {new Date(year, month, day).toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'},
  sheet: {position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: {width: 0, height: -4}, elevation: 24},
  handle: {alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginTop: 10, marginBottom: 6},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  title: {fontSize: 16, fontWeight: '800', color: '#1F2937'},
  cancel: {fontSize: 14, color: '#6B7280', fontWeight: '600'},
  done: {fontSize: 14, color: '#6C5CE7', fontWeight: '800'},
  wheelsWrap: {flexDirection: 'row', position: 'relative', paddingHorizontal: 18, paddingTop: 10},
  selectionBar: {position: 'absolute', left: 14, right: 14, top: 10 + (WHEEL_HEIGHT - ITEM_HEIGHT) / 2, height: ITEM_HEIGHT, backgroundColor: '#EEEBFF', borderRadius: 12, zIndex: -1},
  preview: {alignItems: 'center', paddingTop: 10, paddingHorizontal: 18},
  previewLabel: {color: '#9CA3AF', fontSize: 11, fontWeight: '600'},
  previewValue: {color: '#6C5CE7', fontSize: 14, fontWeight: '800', marginTop: 2},
});

export default WheelDatePicker;
