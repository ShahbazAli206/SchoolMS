import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, TextInput, RefreshControl, Animated, Easing,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import PageHeader from '../../components/common/PageHeader';
import {fetchMyClasses, fetchClassStudents} from '../../redux/slices/teacherSlice';

const initials = name => name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

const AVATAR_PALETTE = ['#6C5CE7','#00B894','#FF7675','#0984E3','#FDCB6E','#00CEC9','#A29BFE'];
const colorFor = id => AVATAR_PALETTE[(id || 0) % AVATAR_PALETTE.length];

const StudentRow = ({item, index, onPress}) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  {toValue: 1, duration: 360, delay: index * 40, useNativeDriver: true}),
      Animated.timing(slide, {toValue: 0, duration: 360, delay: index * 40, useNativeDriver: true, easing: Easing.out(Easing.cubic)}),
    ]).start();
  }, [fade, slide, index]);

  return (
    <Animated.View style={{opacity: fade, transform: [{translateY: slide}]}}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.row}>
        <View style={[styles.avatar, {backgroundColor: colorFor(item.id)}]}>
          <Text style={styles.avatarText}>{initials(item.user?.name)}</Text>
        </View>
        <View style={{flex: 1, marginLeft: 12}}>
          <Text style={styles.name}>{item.user?.name || `Student #${item.id}`}</Text>
          <Text style={styles.meta}>{item.roll_no ? `Roll #${item.roll_no}  ·  ` : ''}{item.class?.name || ''}{item.class?.section ? ` — ${item.class.section}` : ''}</Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const TeacherStudentsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {classes, classStudents, loading} = useSelector(s => s.teacher);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchMyClasses()); }, [dispatch]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (selectedClassId) dispatch(fetchClassStudents(selectedClassId));
  }, [selectedClassId, dispatch]);

  const reload = useCallback(() => {
    if (selectedClassId) dispatch(fetchClassStudents(selectedClassId));
  }, [selectedClassId, dispatch]);

  const filtered = classStudents.filter(s =>
    !search.trim() || (s.user?.name || '').toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <PageHeader title="Students" subtitle={`${filtered.length} student${filtered.length === 1 ? '' : 's'}`} />

      {/* Class filter chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 14}}>
          {classes.map(c => {
            const active = selectedClassId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedClassId(c.id)}
                style={[styles.chip, active ? styles.chipActive : styles.chipInactive]}>
                <Text style={[styles.chipText, {color: active ? '#fff' : '#6B7280'}]}>
                  {c.name}{c.section ? ` ${c.section}` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <Text style={{fontSize: 16, color: '#9CA3AF'}}>🔎</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search students..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{color: '#9CA3AF', fontSize: 16}}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={s => String(s.id)}
        renderItem={({item, index}) => (
          <StudentRow item={item} index={index} onPress={() => {/* future: student detail */}} />
        )}
        contentContainerStyle={{padding: 14, paddingBottom: 120}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor="#6C5CE7" />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={{fontSize: 48}}>🎓</Text>
              <Text style={styles.emptyTitle}>{search ? 'No matching students' : 'No students in this class'}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F6FB'},
  filterSection: {backgroundColor: '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'},
  chip: {paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, marginRight: 8, borderWidth: 1},
  chipActive: {backgroundColor: '#6C5CE7', borderColor: '#6C5CE7'},
  chipInactive: {backgroundColor: '#F9FAFB', borderColor: '#E5E7EB'},
  chipText: {fontSize: 12, fontWeight: '700'},
  searchWrap: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, marginHorizontal: 14, marginTop: 10, paddingHorizontal: 12, height: 40},
  searchInput: {flex: 1, marginLeft: 8, fontSize: 13, color: '#1F2937', padding: 0},
  row: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}, elevation: 1},
  avatar: {width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#fff', fontWeight: '800', fontSize: 14},
  name: {fontSize: 14, fontWeight: '700', color: '#1F2937'},
  meta: {fontSize: 11, color: '#6B7280', marginTop: 2},
  chev: {color: '#9CA3AF', fontSize: 22, marginLeft: 6},
  empty: {alignItems: 'center', paddingTop: 60},
  emptyTitle: {fontSize: 14, color: '#6B7280', marginTop: 8, fontWeight: '600'},
});

export default TeacherStudentsScreen;
