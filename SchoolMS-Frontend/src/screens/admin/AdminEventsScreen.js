import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, RefreshControl, ScrollView, Platform,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {fetchEvents, createEventThunk, deleteEventThunk} from '../../redux/slices/eventSlice';

const TYPE_META = {
  holiday:  {emoji: '🏖️', color: '#00B894', bg: '#E5F8F1'},
  exam:     {emoji: '📝', color: '#D63031', bg: '#FFE5E5'},
  meeting:  {emoji: '📋', color: '#0984E3', bg: '#E5F0FF'},
  event:    {emoji: '🎉', color: '#6C5CE7', bg: '#EEEBFF'},
  reminder: {emoji: '🔔', color: '#E1A800', bg: '#FFF4D6'},
  other:    {emoji: '📌', color: '#6B7280', bg: '#F3F4F6'},
};

const AUDIENCES = [
  {key: 'all',      label: 'Everyone'},
  {key: 'students', label: 'Students'},
  {key: 'teachers', label: 'Teachers'},
  {key: 'parents',  label: 'Parents'},
  {key: 'staff',    label: 'Staff'},
];

const TYPES = Object.keys(TYPE_META);

const fmtDate = iso => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'}) +
         ' · ' + d.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});
};

const AdminEventsScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {list, loading, actionLoading} = useSelector(s => s.events);

  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  // form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('event');
  const [audience, setAudience] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [location, setLocation] = useState('');

  const load = useCallback(() => {
    const params = filter === 'all' ? {limit: 50} : {limit: 50, event_type: filter};
    dispatch(fetchEvents(params));
  }, [dispatch, filter]);

  useEffect(() => { load(); }, [load]);

  const reset = () => {
    setTitle(''); setDescription(''); setEventType('event');
    setAudience('all'); setStartDate(''); setLocation('');
  };

  const validateDate = s => {
    // accept YYYY-MM-DD or YYYY-MM-DD HH:mm
    if (!s) return false;
    const re = /^\d{4}-\d{2}-\d{2}(\s+\d{2}:\d{2})?$/;
    if (!re.test(s.trim())) return false;
    return !isNaN(new Date(s.replace(' ', 'T')).getTime());
  };

  const submit = () => {
    if (!title.trim())             return Alert.alert('Required', 'Title is required');
    if (!validateDate(startDate))  return Alert.alert('Invalid date', 'Use format YYYY-MM-DD or YYYY-MM-DD HH:mm');
    const isoStart = new Date(startDate.replace(' ', 'T')).toISOString();

    dispatch(createEventThunk({
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType,
      audience,
      start_date: isoStart,
      location: location.trim() || null,
    })).unwrap()
      .then(() => { reset(); setShowModal(false); })
      .catch(err => Alert.alert('Error', err || 'Failed'));
  };

  const handleDelete = ev => {
    Alert.alert('Delete event?', `Remove "${ev.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteEventThunk(ev.id))},
    ]);
  };

  const renderItem = ({item}) => {
    const m = TYPE_META[item.event_type] || TYPE_META.other;
    return (
      <View style={styles.card}>
        <View style={[styles.iconBox, {backgroundColor: m.bg}]}>
          <Text style={{fontSize: 22}}>{m.emoji}</Text>
        </View>
        <View style={{flex: 1}}>
          <View style={styles.cardTop}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <View style={[styles.typePill, {backgroundColor: m.bg}]}>
              <Text style={{color: m.color, fontSize: 9, fontWeight: '800', textTransform: 'uppercase'}}>{item.event_type}</Text>
            </View>
          </View>
          {item.description ? <Text style={styles.desc} numberOfLines={2}>{item.description}</Text> : null}
          <View style={styles.metaRow}>
            <Text style={styles.metaTxt}>📅 {fmtDate(item.start_date)}</Text>
            <Text style={styles.metaTxt}>👥 {item.audience}</Text>
            {item.location ? <Text style={styles.metaTxt}>📍 {item.location}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.delBtn}>
            <Text style={{color: '#D63031', fontSize: 11, fontWeight: '700'}}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#EEF0FB'}]} edges={['left', 'right']}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Events & Schedule</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.newBtn}>
          <Text style={{color: '#fff', fontWeight: '800', fontSize: 13}}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', ...TYPES].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)}
              style={[styles.chip, filter === f && {backgroundColor: '#6C5CE7', borderColor: '#6C5CE7'}]}>
              <Text style={{color: filter === f ? '#fff' : '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'capitalize'}}>
                {f === 'all' ? 'All' : `${TYPE_META[f]?.emoji || ''} ${f}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: 14, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#6C5CE7" />}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', color: '#9CA3AF', marginTop: 60}}>
            {loading ? 'Loading…' : 'No events yet. Tap + New to schedule one.'}
          </Text>
        }
      />

      {/* ── Create modal ── */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Event</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Title *</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle}
                placeholder="e.g. Annual Sports Day" placeholderTextColor="#9CA3AF" maxLength={200} />

              <Text style={styles.label}>Description</Text>
              <TextInput style={[styles.input, {height: 90}]} value={description} onChangeText={setDescription}
                placeholder="Details, instructions, etc." placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" />

              <Text style={styles.label}>Type</Text>
              <View style={styles.chipsWrap}>
                {TYPES.map(t => (
                  <TouchableOpacity key={t} onPress={() => setEventType(t)}
                    style={[styles.modalChip, eventType === t && {backgroundColor: '#6C5CE7', borderColor: '#6C5CE7'}]}>
                    <Text style={{color: eventType === t ? '#fff' : '#1F2937', fontSize: 11, fontWeight: '700', textTransform: 'capitalize'}}>
                      {TYPE_META[t].emoji} {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Audience</Text>
              <View style={styles.chipsWrap}>
                {AUDIENCES.map(a => (
                  <TouchableOpacity key={a.key} onPress={() => setAudience(a.key)}
                    style={[styles.modalChip, audience === a.key && {backgroundColor: '#0984E3', borderColor: '#0984E3'}]}>
                    <Text style={{color: audience === a.key ? '#fff' : '#1F2937', fontSize: 11, fontWeight: '700'}}>
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Start date * (YYYY-MM-DD HH:mm)</Text>
              <TextInput style={styles.input} value={startDate} onChangeText={setStartDate}
                placeholder="2026-06-15 09:00" placeholderTextColor="#9CA3AF"
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'} />

              <Text style={styles.label}>Location (optional)</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation}
                placeholder="Main Hall" placeholderTextColor="#9CA3AF" maxLength={200} />
            </ScrollView>

            <View style={{flexDirection: 'row', gap: 10, marginTop: 14}}>
              <TouchableOpacity onPress={() => { setShowModal(false); reset(); }} style={[styles.modalBtn, {backgroundColor: '#F3F4F6'}]}>
                <Text style={{color: '#1F2937', fontWeight: '700'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submit} disabled={actionLoading} style={[styles.modalBtn, {backgroundColor: '#6C5CE7'}]}>
                <Text style={{color: '#fff', fontWeight: '800'}}>{actionLoading ? 'Saving…' : 'Schedule'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  backBtn: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  backChevron: {fontSize: 26, color: '#1F2937', marginTop: -3},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1F2937'},
  newBtn: {backgroundColor: '#6C5CE7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10},

  filterRow: {paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  chip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 6, backgroundColor: '#FFFFFF'},

  card: {flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  iconBox: {width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  cardTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  title: {flex: 1, fontSize: 14, fontWeight: '800', color: '#1F2937', paddingRight: 6},
  typePill: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6},
  desc: {fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 17},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6},
  metaTxt: {fontSize: 11, color: '#6B7280'},
  delBtn: {alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#FFE5E5', borderRadius: 6},

  overlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end'},
  modal: {backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%'},
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 16},

  label: {fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 10, marginBottom: 6},
  input: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1F2937', backgroundColor: '#F9FAFB'},

  chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  modalChip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF'},

  modalBtn: {flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center'},
});

export default AdminEventsScreen;
