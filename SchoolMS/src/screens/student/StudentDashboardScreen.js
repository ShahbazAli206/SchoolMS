import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentDashboard, fetchStudentAssignments} from '../../redux/slices/studentSlice';

const StatCard = ({label, value, icon, accent, faded}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  return (
    <View style={[
      styles.statCard,
      {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.base, ...shadow.sm, shadowColor: colors.shadowColor, borderLeftWidth: 4, borderLeftColor: accent},
    ]}>
      <View style={[styles.iconWrap, {backgroundColor: faded, borderRadius: borderRadius.md}]}>
        <Text style={{fontSize: 20}}>{icon}</Text>
      </View>
      <Text style={[textStyles.h3, {color: colors.textPrimary, fontWeight: '800', marginTop: spacing.sm}]}>
        {value ?? '—'}
      </Text>
      <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 2}]}>{label}</Text>
    </View>
  );
};

const StudentDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius, shadow} = useTheme();
  const {dashboard, assignments, loading} = useSelector(s => s.student);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchStudentAssignments({limit: 5}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const fmtDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {day: 'numeric', month: 'short'});
  };

  const isDueSoon = iso => {
    if (!iso) return false;
    const diff = new Date(iso) - new Date();
    return diff > 0 && diff < 7 * 86400000;
  };

  const isOverdue = iso => iso && new Date(iso) < new Date();

  const statCards = [
    {label: 'My Assignments',  value: dashboard?.totalAssignments,   icon: '📝', accent: colors.primary,  faded: colors.primaryFaded},
    {label: 'Due This Week',   value: dashboard?.dueSoonAssignments, icon: '⏰', accent: colors.error,    faded: colors.errorFaded},
    {label: 'Attendance %',    value: dashboard?.attendancePct != null ? `${dashboard.attendancePct}%` : '—', icon: '✅', accent: colors.success, faded: colors.successFaded},
    {label: 'Marks Recorded',  value: dashboard?.totalMarks,         icon: '📊', accent: colors.warning,  faded: colors.warningFaded},
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, paddingHorizontal: spacing.base, paddingBottom: spacing.lg}]}>
        <View>
          <Text style={[textStyles.caption, {color: colors.whiteAlpha80}]}>Welcome back,</Text>
          <Text style={[textStyles.h4, {color: colors.white, fontWeight: '700'}]}>{user?.name ?? 'Student'}</Text>
        </View>
        <View style={[styles.avatarCircle, {backgroundColor: colors.whiteAlpha20, borderRadius: borderRadius.full}]}>
          <Text style={{fontSize: 22}}>🎒</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Overview</Text>

        {loading && !dashboard ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 40}} />
        ) : (
          <View style={styles.grid}>
            {statCards.map((c, i) => (
              <View key={i} style={styles.cardWrap}>
                <StatCard {...c} />
              </View>
            ))}
          </View>
        )}

        {/* Attendance summary bar */}
        {dashboard?.totalDays > 0 && (
          <View style={[styles.attendanceBar, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginTop: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
            <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm}]}>Attendance Summary</Text>
            <View style={styles.attendanceRow}>
              {[
                {label: 'Present', value: dashboard.presentDays, color: colors.success},
                {label: 'Absent',  value: dashboard.absentDays,  color: colors.error},
                {label: 'Total',   value: dashboard.totalDays,   color: colors.textSecondary},
              ].map(item => (
                <View key={item.label} style={styles.attendanceStat}>
                  <Text style={[textStyles.h4, {color: item.color, fontWeight: '800'}]}>{item.value ?? 0}</Text>
                  <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{item.label}</Text>
                </View>
              ))}
            </View>
            {/* Progress bar */}
            <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
              <View style={[
                styles.progressFill,
                {
                  width: `${dashboard?.attendancePct ?? 0}%`,
                  backgroundColor: (dashboard?.attendancePct ?? 0) >= 75 ? colors.success : colors.error,
                  borderRadius: borderRadius.full,
                },
              ]} />
            </View>
            <Text style={[textStyles.caption, {color: colors.textTertiary, marginTop: 4}]}>
              {(dashboard?.attendancePct ?? 0) >= 75 ? '✅ Good standing' : '⚠️ Below 75% — at risk'}
            </Text>
          </View>
        )}

        {/* Quick navigation */}
        <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>Quick Access</Text>
        <View style={styles.actionsRow}>
          {[
            {label: 'Assignments', icon: '📝', screen: 'Assignments'},
            {label: 'My Marks',    icon: '📊', screen: 'Marks'},
            {label: 'Materials',   icon: '📁', screen: 'Materials'},
            {label: 'Attendance',  icon: '✅', screen: 'MyAttendance'},
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              onPress={() => navigation.navigate(a.screen)}
              style={[styles.actionBtn, {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
              <Text style={{fontSize: 26, marginBottom: 6}}>{a.icon}</Text>
              <Text style={[textStyles.caption, {color: colors.textPrimary, fontWeight: '600', textAlign: 'center'}]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming assignments */}
        {assignments.length > 0 && (
          <>
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>
              Upcoming Assignments
            </Text>
            {assignments.slice(0, 5).map(item => {
              const over = isOverdue(item.due_date);
              const soon = isDueSoon(item.due_date);
              const borderColor = over ? colors.error : soon ? colors.warning : colors.border;
              return (
                <View key={item.id} style={[
                  styles.assignRow,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: borderColor, ...shadow.sm, shadowColor: colors.shadowColor},
                ]}>
                  <View style={{flex: 1}}>
                    <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.subject?.name && (
                      <Text style={[textStyles.caption, {color: colors.info ?? colors.primary}]}>📚 {item.subject.name}</Text>
                    )}
                  </View>
                  <Text style={[textStyles.caption, {color: over ? colors.error : soon ? colors.warning : colors.textTertiary, fontWeight: over || soon ? '700' : '400'}]}>
                    {over ? '⚠️ Overdue' : fmtDate(item.due_date)}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20},
  avatarCircle: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  scroll: {paddingBottom: 40},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  cardWrap: {width: '50%', padding: 6},
  statCard: {},
  iconWrap: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  attendanceBar: {},
  attendanceRow: {flexDirection: 'row', justifyContent: 'space-around'},
  attendanceStat: {alignItems: 'center'},
  progressTrack: {height: 8, overflow: 'hidden'},
  progressFill: {height: '100%'},
  actionsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  actionBtn: {width: '22%', alignItems: 'center', minWidth: 76},
  assignRow: {flexDirection: 'row', alignItems: 'center'},
});

export default StudentDashboardScreen;
