import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {
  fetchChildren, fetchChildMarks, fetchChildAttendance,
  fetchChildAssignments, selectChild,
} from '../../redux/slices/parentSlice';

const TABS = [
  {key: 'marks',       label: '📊 Marks'},
  {key: 'attendance',  label: '✅ Attendance'},
  {key: 'assignments', label: '📝 Assignments'},
];

const pctColor = (pct, colors) => {
  if (pct == null) return colors.textSecondary;
  if (pct >= 75) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.error;
};

const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {day: 'numeric', month: 'short'});
};

const ParentChildProgressScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {
    children, selectedChildId,
    childMarks, childMarksSummary,
    childAttendance, childAttendanceSummary,
    childAssignments, loading,
  } = useSelector(s => s.parent);

  const [activeTab, setActiveTab] = useState('marks');

  const childId = selectedChildId ?? children[0]?.id;

  const loadData = useCallback(() => {
    if (!childId) return;
    dispatch(fetchChildren());
    if (activeTab === 'marks')       dispatch(fetchChildMarks({id: childId, params: {}}));
    if (activeTab === 'attendance')  dispatch(fetchChildAttendance({id: childId, params: {}}));
    if (activeTab === 'assignments') dispatch(fetchChildAssignments({id: childId, params: {}}));
  }, [dispatch, childId, activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedChild = children.find(c => c.id === childId);

  const chipStyle = active => ({
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: active ? colors.primary : colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: active ? colors.primary : colors.border,
    marginRight: 8,
  });

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Child Progress</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={colors.primary} />}>

        {/* Child selector */}
        {children.length > 1 && (
          <>
            <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Select Child</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
              {children.map(c => (
                <TouchableOpacity key={c.id} onPress={() => dispatch(selectChild(c.id))} style={chipStyle(c.id === childId)}>
                  <Text style={[textStyles.caption, {color: c.id === childId ? colors.white : colors.textSecondary}]}>
                    🧒 {c.user?.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Selected child info */}
        {selectedChild && (
          <View style={[styles.childBanner, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md}]}>
            <Text style={[textStyles.body1, {color: colors.primary, fontWeight: '700'}]}>
              🧒 {selectedChild.user?.name}
            </Text>
            {selectedChild.class && (
              <Text style={[textStyles.caption, {color: colors.primary}]}>
                🏫 {selectedChild.class?.name} {selectedChild.class?.section || ''}
              </Text>
            )}
          </View>
        )}

        {/* Tab selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.lg}}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={chipStyle(activeTab === t.key)}>
              <Text style={[textStyles.caption, {color: activeTab === t.key ? colors.white : colors.textSecondary, fontWeight: '600'}]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── MARKS ─────────────────────────────────────── */}
        {activeTab === 'marks' && (
          childMarksSummary.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 48}}>📊</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No marks recorded</Text>
            </View>
          ) : (
            childMarksSummary.map((item, i) => {
              const pct = item.percentage;
              const color = pctColor(pct, colors);
              return (
                <View key={i} style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor}]}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', flex: 1}]}>{item.subject}</Text>
                    <Text style={[textStyles.h5, {color, fontWeight: '800'}]}>{pct != null ? `${pct}%` : '—'}</Text>
                  </View>
                  <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
                    <View style={[styles.progressFill, {width: `${pct ?? 0}%`, backgroundColor: color, borderRadius: borderRadius.full}]} />
                  </View>
                  <Text style={[textStyles.caption, {color: colors.textTertiary, marginTop: 4}]}>
                    {item.totalObtained} / {item.totalMax} marks  •  {item.count} test{item.count !== 1 ? 's' : ''}
                  </Text>
                </View>
              );
            })
          )
        )}

        {/* ── ATTENDANCE ────────────────────────────────── */}
        {activeTab === 'attendance' && (
          <>
            {childAttendanceSummary && (
              <View style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
                <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm}]}>Summary</Text>
                <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                  {[
                    {label: 'Present', value: childAttendanceSummary.present, color: colors.success},
                    {label: 'Absent',  value: childAttendanceSummary.absent,  color: colors.error},
                    {label: 'Late',    value: childAttendanceSummary.late,    color: colors.warning},
                    {label: 'Total',   value: childAttendanceSummary.total,   color: colors.textSecondary},
                  ].map(s => (
                    <View key={s.label} style={{alignItems: 'center'}}>
                      <Text style={[textStyles.h4, {color: s.color, fontWeight: '800'}]}>{s.value ?? 0}</Text>
                      <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                {childAttendanceSummary.percentage != null && (
                  <>
                    <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
                      <View style={[
                        styles.progressFill,
                        {width: `${childAttendanceSummary.percentage}%`, backgroundColor: pctColor(childAttendanceSummary.percentage, colors), borderRadius: borderRadius.full},
                      ]} />
                    </View>
                    <Text style={[textStyles.caption, {color: pctColor(childAttendanceSummary.percentage, colors), marginTop: 4, fontWeight: '700'}]}>
                      {childAttendanceSummary.percentage}% attendance
                      {childAttendanceSummary.percentage < 75 ? ' — ⚠️ Below 75%' : ' — ✅ Good'}
                    </Text>
                  </>
                )}
              </View>
            )}
            {childAttendance.length === 0 && !loading ? (
              <View style={styles.emptyWrap}>
                <Text style={{fontSize: 48}}>✅</Text>
                <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No attendance records</Text>
              </View>
            ) : (
              childAttendance.map(r => {
                const statusColors = {present: colors.success, absent: colors.error, late: colors.warning, excused: colors.info ?? colors.primary};
                const c = statusColors[r.status] ?? colors.textSecondary;
                return (
                  <View key={r.id} style={[
                    styles.rowCard,
                    {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: c, ...shadow.sm, shadowColor: colors.shadowColor},
                  ]}>
                    <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600', flex: 1}]}>
                      {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short'})}
                    </Text>
                    <Text style={[textStyles.caption, {color: c, fontWeight: '700', textTransform: 'capitalize'}]}>{r.status}</Text>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── ASSIGNMENTS ───────────────────────────────── */}
        {activeTab === 'assignments' && (
          childAssignments.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 48}}>📝</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No assignments</Text>
            </View>
          ) : (
            childAssignments.map(a => {
              const over = a.due_date && new Date(a.due_date) < new Date();
              const soon = !over && a.due_date && (new Date(a.due_date) - new Date()) < 7 * 86400000;
              const bc   = over ? colors.error : soon ? colors.warning : colors.border;
              return (
                <View key={a.id} style={[
                  styles.rowCard,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: bc, ...shadow.sm, shadowColor: colors.shadowColor},
                ]}>
                  <View style={{flex: 1}}>
                    <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]} numberOfLines={1}>{a.title}</Text>
                    {a.subject?.name && <Text style={[textStyles.caption, {color: colors.info ?? colors.primary}]}>📚 {a.subject.name}</Text>}
                  </View>
                  <Text style={[textStyles.caption, {color: over ? colors.error : soon ? colors.warning : colors.textTertiary, fontWeight: over || soon ? '700' : '400'}]}>
                    {over ? '⚠️ Overdue' : fmtDate(a.due_date)}
                  </Text>
                </View>
              );
            })
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  childBanner: {},
  card: {},
  rowCard: {flexDirection: 'row', alignItems: 'center'},
  progressTrack: {height: 8, overflow: 'hidden'},
  progressFill: {height: '100%'},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
});

export default ParentChildProgressScreen;
