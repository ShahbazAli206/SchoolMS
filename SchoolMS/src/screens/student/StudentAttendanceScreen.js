import React, {useEffect, useCallback, useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentAttendance} from '../../redux/slices/studentSlice';

const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
];

const STATUS_COLORS = {
  present: 'success', absent: 'error', late: 'warning', excused: 'info',
};

const StudentAttendanceScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {attendance, attendanceSummary, loading} = useSelector(s => s.student);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year]  = useState(now.getFullYear());

  const load = useCallback(() => {
    dispatch(fetchStudentAttendance({month, year}));
  }, [dispatch, month, year]);

  useEffect(() => { load(); }, [load]);

  const colorFor = key => colors[STATUS_COLORS[key]] ?? colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>My Attendance</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* Month selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
          {MONTHS.map((m, i) => {
            const mNum = i + 1;
            const active = month === mNum;
            return (
              <TouchableOpacity key={mNum} onPress={() => setMonth(mNum)}
                style={[styles.monthChip, {
                  backgroundColor: active ? colors.primary : colors.inputBg,
                  borderRadius: borderRadius.full,
                  borderWidth: 1, borderColor: active ? colors.primary : colors.border,
                }]}>
                <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary, fontWeight: active ? '700' : '400'}]}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Summary card */}
        {attendanceSummary && (
          <View style={[styles.summaryCard, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
            <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.sm}]}>
              {MONTHS[month - 1]} {year} Summary
            </Text>
            <View style={styles.summaryRow}>
              {[
                {label: 'Present', value: attendanceSummary.present, color: colors.success},
                {label: 'Absent',  value: attendanceSummary.absent,  color: colors.error},
                {label: 'Late',    value: attendanceSummary.late,    color: colors.warning},
                {label: 'Total',   value: attendanceSummary.total,   color: colors.textSecondary},
              ].map(s => (
                <View key={s.label} style={{alignItems: 'center'}}>
                  <Text style={[textStyles.h4, {color: s.color, fontWeight: '800'}]}>{s.value ?? 0}</Text>
                  <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{s.label}</Text>
                </View>
              ))}
            </View>
            {attendanceSummary.percentage != null && (
              <>
                <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
                  <View style={[
                    styles.progressFill,
                    {
                      width: `${attendanceSummary.percentage}%`,
                      backgroundColor: attendanceSummary.percentage >= 75 ? colors.success : colors.error,
                      borderRadius: borderRadius.full,
                    },
                  ]} />
                </View>
                <Text style={[textStyles.caption, {
                  color: attendanceSummary.percentage >= 75 ? colors.success : colors.error,
                  marginTop: 4, fontWeight: '700',
                }]}>
                  {attendanceSummary.percentage}% attendance
                  {attendanceSummary.percentage < 75 ? ' — ⚠️ Below 75%' : ' — ✅ Good'}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Daily records */}
        {attendance.length === 0 && !loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>📅</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>
              No records for {MONTHS[month - 1]}
            </Text>
          </View>
        ) : (
          attendance.map(r => {
            const c = colorFor(r.status);
            return (
              <View key={r.id} style={[
                styles.recordRow,
                {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: c, ...shadow.sm, shadowColor: colors.shadowColor},
              ]}>
                <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600', flex: 1}]}>
                  {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'short'})}
                </Text>
                <Text style={[textStyles.caption, {color: c, fontWeight: '700', textTransform: 'capitalize'}]}>
                  {r.status}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  monthChip: {paddingHorizontal: 14, paddingVertical: 7, marginRight: 8},
  summaryCard: {},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-around'},
  progressTrack: {height: 8, overflow: 'hidden'},
  progressFill: {height: '100%'},
  recordRow: {flexDirection: 'row', alignItems: 'center'},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
});

export default StudentAttendanceScreen;
