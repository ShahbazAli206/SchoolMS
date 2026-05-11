import React, {useEffect, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, Animated, Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import {fetchMyClasses} from '../../redux/slices/teacherSlice';

const CLASS_COLORS = [
  {bar: '#6C5CE7', bg: '#EEEBFF'},
  {bar: '#00B894', bg: '#E5FBF5'},
  {bar: '#FF7675', bg: '#FFE5E5'},
  {bar: '#0984E3', bg: '#EBF5FF'},
  {bar: '#FDCB6E', bg: '#FFF7E0'},
  {bar: '#00CEC9', bg: '#E0F9F8'},
];

const ClassCard = ({item, index, onPress}) => {
  const c = CLASS_COLORS[index % CLASS_COLORS.length];
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  {toValue: 1, duration: 400, delay: index * 70, useNativeDriver: true, easing: Easing.out(Easing.cubic)}),
      Animated.timing(slide, {toValue: 0, duration: 400, delay: index * 70, useNativeDriver: true, easing: Easing.out(Easing.cubic)}),
    ]).start();
  }, [fade, slide, index]);

  return (
    <Animated.View style={{opacity: fade, transform: [{translateY: slide}]}}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, {backgroundColor: c.bg}]}>
        <View style={[styles.bar, {backgroundColor: c.bar}]} />
        <View style={[styles.iconWrap, {backgroundColor: '#FFFFFF'}]}>
          <Text style={{fontSize: 22}}>🏫</Text>
        </View>
        <View style={{flex: 1, marginLeft: 12}}>
          <Text style={styles.name}>{item.name}{item.section ? ` — ${item.section}` : ''}</Text>
          <View style={styles.metaRow}>
            {item.grade && <Text style={styles.meta}>Grade {item.grade}</Text>}
            {item.studentsCount != null && <Text style={[styles.meta, {marginLeft: 10}]}>👥 {item.studentsCount}</Text>}
          </View>
        </View>
        <View style={[styles.chev, {backgroundColor: c.bar + '20'}]}>
          <Text style={{color: c.bar, fontWeight: '700', fontSize: 16}}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TeacherClassesScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {classes, loading} = useSelector(s => s.teacher);

  const load = useCallback(() => dispatch(fetchMyClasses()), [dispatch]);
  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <PageHeader title="My Classes" subtitle={`${classes.length} class${classes.length === 1 ? '' : 'es'} assigned`} />

      <FlatList
        data={classes}
        keyExtractor={c => String(c.id)}
        renderItem={({item, index}) => (
          <ClassCard
            item={item}
            index={index}
            onPress={() => navigation.navigate('Attendance', {classId: item.id, className: item.name})}
          />
        )}
        contentContainerStyle={{padding: 14, paddingBottom: 120}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#6C5CE7" />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{fontSize: 56}}>🏫</Text>
              <Text style={styles.emptyTitle}>No classes assigned yet</Text>
              <Text style={styles.emptySub}>Your principal will assign classes shortly.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6FB'},
  card: {flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, marginBottom: 10, overflow: 'hidden'},
  bar: {position: 'absolute', left: 0, top: 12, bottom: 12, width: 4, borderRadius: 2},
  iconWrap: {width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginLeft: 8},
  name: {fontSize: 15, fontWeight: '800', color: '#1F2937'},
  metaRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  meta: {fontSize: 12, color: '#6B7280'},
  chev: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  empty: {alignItems: 'center', paddingTop: 80},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12},
  emptySub: {fontSize: 13, color: '#9CA3AF', marginTop: 4},
});

export default TeacherClassesScreen;
