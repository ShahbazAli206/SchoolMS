import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {
  fetchMyClasses, fetchClassStudents,
  fetchAttendance, bulkMarkAttendanceThunk,
} from '../../redux/slices/teacherSlice';

const STATUS_OPTIONS = [
  {key: 'present',  label: 'P', color: 'success'},
  {key: 'absent',   label: 'A', color: 'error'},
  {key: 'late',     label: 'L', color: 'warning'},
  {key: 'excused',  label: 'E', color: 'info'},
];

// Format Date → YYYY-MM-DD
const toDateStr = d => d.toISOString().slice(0, 10);

// Increment / decrement a date string by N days
const shiftDate = (str, n) => {
  const d = new Date(str);
  d.setDate(d.getDate() + n);
  return toDateStr(d);
};

const AttendanceScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {classes, classStudents, attendance, loading, actionLoading} = useSelector(s => s.teacher);

  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(toDateStr(new Date()));
  const [statusMap, setStatusMap] = useState({});  // { studentId: 'present'|'absent'|'late'|'excused' }

  const load = useCallback(() => dispatch(fetchMyClasses()), [dispatch]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (classId) dispatch(fetchClassStudents(classId));
  }, [classId]);

  useEffect(() => {
    if (classId && date) {
      dispatch(fetchAttendance({class_id: classId, date}));
    }
  }, [classId, date]);

  // Pre-fill status map from existing attendance records
  useEffect(() => {
    const map = {};
    attendance.forEach(a => { map[String(a.student_id)] = a.status; });
    setStatusMap(map);
  }, [attendance]);

  const toggleStatus = (studentId, status) => {
    setStatusMap(prev => ({...prev, [studentId]: status}));
  };

  // Mark all present / absent shortcuts
  const markAll = status => {
    const map = {};
    classStudents.forEach(s => { map[String(s.id)] = status; });
    setStatusMap(map);
  };

  const handleSubmit = async () => {
    if (!classId) { Alert.alert('No Class', 'Please select a class first.'); return; }
    const records = classStudents.map(s => ({
      student_id: s.id,
      class_id: classId,
      date,
      status: statusMap[String(s.id)] || 'absent',
    }));

    const result = await dispatch(bulkMarkAttendanceThunk({records}));
    if (bulkMarkAttendanceThunk.fulfilled.match(result)) {
      Alert.alert('Saved', `Attendance for ${date} saved!`);
    } else {
      Alert.alert('Error', result.payload || 'Failed to save attendance.');
    }
  };

  const colorFor = (colorKey) => colors[colorKey] ?? colors.primary;
  const fadedFor = (colorKey) => colors[`${colorKey}Faded`] ?? colors.primaryFaded;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Attendance</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* Class chips */}
        <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
          {classes.map(c => {
            const active = classId === String(c.id);
            return (
              <TouchableOpacity key={c.id} onPress={() => { setClassId(String(c.id)); setStatusMap({}); }}
                style={[styles.chip, {
                  backgroundColor: active ? colors.primary : colors.inputBg,
                  borderRadius: borderRadius.full,
                  borderColor: active ? colors.primary : colors.border,
                }]}>
                <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary}]}>
                  {c.name} {c.section || ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Date navigator */}
        <View style={[styles.dateRow, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.sm, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
          <TouchableOpacity onPress={() => setDate(p => shiftDate(p, -1))} style={styles.dateArrow}>
            <Text style={[textStyles.h5, {color: colors.primary}]}>‹</Text>
          </TouchableOpacity>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', flex: 1, textAlign: 'center'}]}>
            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'})}
          </Text>
          <TouchableOpacity
            onPress={() => setDate(p => shiftDate(p, 1))}
            disabled={date >= toDateStr(new Date())}
            style={styles.dateArrow}>
            <Text style={[textStyles.h5, {color: date >= toDateStr(new Date()) ? colors.textTertiary : colors.primary}]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Quick mark all buttons */}
        {classStudents.length > 0 && classId && (
          <View style={[styles.quickRow, {marginBottom: spacing.md}]}>
            <Text style={[textStyles.caption, {color: colors.textSecondary, marginRight: 8}]}>Mark All:</Text>
            {['present', 'absent'].map(s => (
              <TouchableOpacity key={s} onPress={() => markAll(s)}
                style={[styles.quickBtn, {
                  backgroundColor: s === 'present' ? colors.successFaded : colors.errorFaded,
                  borderRadius: borderRadius.md,
                }]}>
                <Text style={[textStyles.caption, {color: s === 'present' ? colors.success : colors.error, fontWeight: '600'}]}>
                  {s === 'present' ? '✅ Present' : '❌ Absent'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Status legend */}
        {classStudents.length > 0 && classId && (
          <View style={[styles.legendRow, {marginBottom: spacing.md}]}>
            {STATUS_OPTIONS.map(opt => (
              <View key={opt.key} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: colorFor(opt.color)}]} />
                <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{opt.label} = {opt.key}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Student rows */}
        {classStudents.length > 0 && classId ? (
          <>
            {classStudents.map(student => {
              const sId = String(student.id);
              const current = statusMap[sId];
              return (
                <View key={student.id} style={[
                  styles.studentRow,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor},
                ]}>
                  <View style={{flex: 1}}>
                    <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]}>{student.user?.name}</Text>
                    {student.student?.roll_number && (
                      <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Roll: {student.student.roll_number}</Text>
                    )}
                  </View>
                  <View style={styles.statusBtns}>
                    {STATUS_OPTIONS.map(opt => {
                      const active = current === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          onPress={() => toggleStatus(sId, opt.key)}
                          style={[styles.statusBtn, {
                            backgroundColor: active ? colorFor(opt.color) : fadedFor(opt.color),
                            borderRadius: borderRadius.md,
                          }]}>
                          <Text style={[textStyles.caption, {color: active ? colors.white : colorFor(opt.color), fontWeight: '700'}]}>
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={actionLoading}
              style={[styles.submitBtn, {
                backgroundColor: actionLoading ? colors.primaryFaded : colors.primary,
                borderRadius: borderRadius.lg,
                marginTop: spacing.md,
              }]}>
              <Text style={[textStyles.body1, {color: colors.white, fontWeight: '700', textAlign: 'center'}]}>
                {actionLoading ? 'Saving…' : 'Submit Attendance'}
              </Text>
            </TouchableOpacity>
          </>
        ) : classId ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 40}}>👥</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No students in this class</Text>
          </View>
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 40}}>✅</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>Select a class to mark attendance</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  chip: {paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, marginRight: 8},
  dateRow: {flexDirection: 'row', alignItems: 'center'},
  dateArrow: {paddingHorizontal: 12, paddingVertical: 4},
  quickRow: {flexDirection: 'row', alignItems: 'center'},
  quickBtn: {paddingHorizontal: 12, paddingVertical: 6, marginRight: 8},
  legendRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  studentRow: {flexDirection: 'row', alignItems: 'center'},
  statusBtns: {flexDirection: 'row', gap: 6},
  statusBtn: {width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  submitBtn: {paddingVertical: 14},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
});

export default AttendanceScreen;
