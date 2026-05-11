import React, {useEffect, useCallback, useState} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {fetchTeacherInbox, replyComplaintThunk} from '../../redux/slices/complaintSlice';

const STATUS_COLORS = {
  pending:   {bg: '#FFE5E5', fg: '#D63031'},
  in_review: {bg: '#FFF4D6', fg: '#E1A800'},
  resolved:  {bg: '#E5F8F1', fg: '#00B894'},
  rejected:  {bg: '#F3F4F6', fg: '#6B7280'},
};

const StatusBadge = ({status}) => {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <View style={[styles.badge, {backgroundColor: c.bg}]}>
      <Text style={{color: c.fg, fontSize: 10, fontWeight: '800', textTransform: 'uppercase'}}>{status}</Text>
    </View>
  );
};

const TeacherComplaintsScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {inboxList, loading} = useSelector(s => s.complaints);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    const params = filter === 'all' ? {} : {status: filter};
    dispatch(fetchTeacherInbox(params));
  }, [dispatch, filter]);

  useEffect(() => { load(); }, [load]);

  const handleQuickReview = item => {
    Alert.alert('Update status', `Set "${item.title}" to:`, [
      {text: 'In Review', onPress: () => dispatch(replyComplaintThunk({id: item.id, data: {status: 'in_review'}}))},
      {text: 'Resolved',  onPress: () => dispatch(replyComplaintThunk({id: item.id, data: {status: 'resolved'}}))},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const renderItem = ({item}) => {
    const fromTeacher = item.complaint_type === 'teacher_to_parent' && item.submitter_id;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaItem}>
            {fromTeacher ? '➡️ Sent by you' : `👤 ${item.submitter?.name || 'Parent'}`}
          </Text>
          {item.student?.user?.name && (
            <Text style={styles.metaItem}>🎓 {item.student.user.name}</Text>
          )}
        </View>
        {!fromTeacher && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => handleQuickReview(item)} style={[styles.actionBtn, {backgroundColor: '#EEEBFF'}]}>
              <Text style={{color: '#6C5CE7', fontWeight: '700', fontSize: 12}}>Update Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#EEF0FB'}]} edges={['left', 'right']}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.headerTitle}>Complaints Inbox</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TeacherSubmitComplaint')}
          style={styles.newBtn}>
          <Text style={{color: '#fff', fontWeight: '800'}}>+ New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {['all', 'pending', 'in_review', 'resolved', 'rejected'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && {backgroundColor: '#6C5CE7', borderColor: '#6C5CE7'}]}>
            <Text style={{color: filter === f ? '#fff' : '#6B7280', fontSize: 11, fontWeight: '700', textTransform: 'capitalize'}}>
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={inboxList}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: 14, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#6C5CE7" />}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', color: '#9CA3AF', marginTop: 60}}>
            {loading ? 'Loading…' : 'No complaints yet.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  headerTitle: {flex: 1, fontSize: 18, fontWeight: '800', color: '#1F2937'},
  newBtn: {backgroundColor: '#6C5CE7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10},

  filterRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  filterChip: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF'},

  card: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  cardTop: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6},
  title: {flex: 1, fontSize: 14, fontWeight: '800', color: '#1F2937', paddingRight: 8},
  desc: {fontSize: 12, color: '#6B7280', lineHeight: 17},
  meta: {flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8},
  metaItem: {fontSize: 11, color: '#6B7280'},

  badge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},

  actions: {flexDirection: 'row', marginTop: 10},
  actionBtn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8},
});

export default TeacherComplaintsScreen;
