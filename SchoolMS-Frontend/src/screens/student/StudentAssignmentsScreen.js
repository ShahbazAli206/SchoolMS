import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentAssignments} from '../../redux/slices/studentSlice';

const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});
};
const isDueSoon = iso => { const d = new Date(iso) - new Date(); return d > 0 && d < 7 * 86400000; };
const isOverdue = iso => iso && new Date(iso) < new Date();

const FILTERS = [
  {key: 'all',      label: 'All'},
  {key: 'upcoming', label: 'Upcoming'},
  {key: 'overdue',  label: 'Overdue'},
];

const AssignmentCard = ({item}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const over  = isOverdue(item.due_date);
  const soon  = isDueSoon(item.due_date);
  const borderColor = over ? colors.error : soon ? colors.warning : colors.border;

  return (
    <View style={[
      styles.card,
      {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: borderColor, ...shadow.sm, shadowColor: colors.shadowColor},
    ]}>
      <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={2}>
        {item.title}
      </Text>
      {item.description ? (
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 4}]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <View style={[styles.metaRow, {marginTop: spacing.sm}]}>
        {item.class?.name && (
          <View style={[styles.badge, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: colors.primary}]}>🏫 {item.class.name}</Text>
          </View>
        )}
        {item.subject?.name && (
          <View style={[styles.badge, {backgroundColor: colors.infoFaded, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: colors.info ?? colors.primary}]}>📚 {item.subject.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[textStyles.caption, {color: over ? colors.error : soon ? colors.warning : colors.textSecondary, fontWeight: over || soon ? '700' : '400'}]}>
          {over ? '⚠️ Overdue: ' : soon ? '⏰ Due soon: ' : '📅 Due: '}
          {fmtDate(item.due_date)}
        </Text>
        <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Max: {item.max_marks}</Text>
      </View>
    </View>
  );
};

const StudentAssignmentsScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {assignments, loading} = useSelector(s => s.student);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    dispatch(fetchStudentAssignments(filter !== 'all' ? {status: filter} : {}));
  }, [dispatch, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>My Assignments</Text>
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, {backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border}]}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
            style={[styles.filterChip, {
              backgroundColor: filter === f.key ? colors.primary : colors.inputBg,
              borderRadius: borderRadius.full,
              borderWidth: 1,
              borderColor: filter === f.key ? colors.primary : colors.border,
            }]}>
            <Text style={[textStyles.caption, {color: filter === f.key ? colors.white : colors.textSecondary, fontWeight: '600'}]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={assignments}
        keyExtractor={a => String(a.id)}
        renderItem={({item}) => <AssignmentCard item={item} />}
        contentContainerStyle={[styles.list, {padding: spacing.base}]}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>📝</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No assignments found</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  filterRow: {flexDirection: 'row', gap: 8},
  filterChip: {paddingHorizontal: 14, paddingVertical: 6},
  list: {paddingBottom: 40},
  card: {},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  badge: {paddingHorizontal: 10, paddingVertical: 3},
  footer: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
});

export default StudentAssignmentsScreen;
