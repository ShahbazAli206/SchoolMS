import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, TextInput, RefreshControl, ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {
  fetchMyClasses, fetchSubjects, fetchClassStudents,
  fetchMarks, bulkUpsertMarksThunk,
} from '../../redux/slices/teacherSlice';

const EXAM_TYPES = ['assignment', 'quiz', 'unit_test', 'mid_term', 'final'];

const MarksScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {classes, subjects, classStudents, marks, loading, actionLoading} = useSelector(s => s.teacher);

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examType, setExamType] = useState('assignment');
  const [marksMap, setMarksMap] = useState({});  // { studentId: { obtained, max } }

  const load = useCallback(() => {
    dispatch(fetchMyClasses());
    dispatch(fetchSubjects({}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (classId) {
      dispatch(fetchClassStudents(classId));
    }
  }, [classId]);

  useEffect(() => {
    if (classId && subjectId && examType) {
      dispatch(fetchMarks({class_id: classId, subject_id: subjectId, exam_type: examType}));
    }
  }, [classId, subjectId, examType]);

  // Sync existing marks into marksMap when marks list changes
  useEffect(() => {
    const map = {};
    marks.forEach(m => {
      map[String(m.student_id)] = {obtained: String(m.marks_obtained), max: String(m.max_marks)};
    });
    setMarksMap(map);
  }, [marks]);

  const setStudentMark = (studentId, field, value) => {
    setMarksMap(prev => ({
      ...prev,
      [studentId]: {...(prev[studentId] || {obtained: '', max: '100'}), [field]: value},
    }));
  };

  const handleSubmit = async () => {
    if (!classId || !subjectId) {
      Alert.alert('Incomplete', 'Please select class and subject first.');
      return;
    }
    const entries = classStudents
      .filter(s => marksMap[String(s.id)]?.obtained !== '')
      .map(s => ({
        student_id: s.id,
        subject_id: subjectId,
        class_id: classId,
        exam_type: examType,
        marks_obtained: parseFloat(marksMap[String(s.id)]?.obtained || 0),
        max_marks: parseFloat(marksMap[String(s.id)]?.max || 100),
      }));

    if (!entries.length) { Alert.alert('No Data', 'Enter at least one student\'s marks.'); return; }

    const result = await dispatch(bulkUpsertMarksThunk(entries));
    if (bulkUpsertMarksThunk.fulfilled.match(result)) {
      Alert.alert('Success', 'Marks saved!');
      dispatch(fetchMarks({class_id: classId, subject_id: subjectId, exam_type: examType}));
    } else {
      Alert.alert('Error', result.payload || 'Failed to save marks.');
    }
  };

  const chipStyle = (active) => ({
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: active ? colors.primary : colors.inputBg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    marginRight: 8,
  });
  const chipText = (active) => [textStyles.caption, {color: active ? colors.white : colors.textSecondary}];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <PageHeader title="Enter Marks" />

      <ScrollView style={{flex: 1}} contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* Class selection */}
        <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
          {classes.map(c => (
            <TouchableOpacity key={c.id} onPress={() => { setClassId(String(c.id)); setMarksMap({}); }}
              style={chipStyle(classId === String(c.id))}>
              <Text style={chipText(classId === String(c.id))}>{c.name} {c.section || ''}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subject selection */}
        <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
          {subjects.map(sub => (
            <TouchableOpacity key={sub.id} onPress={() => setSubjectId(String(sub.id))}
              style={chipStyle(subjectId === String(sub.id))}>
              <Text style={chipText(subjectId === String(sub.id))}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exam type */}
        <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Exam Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.lg}}>
          {EXAM_TYPES.map(t => (
            <TouchableOpacity key={t} onPress={() => setExamType(t)} style={chipStyle(examType === t)}>
              <Text style={chipText(examType === t)}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Students marks entry */}
        {classStudents.length > 0 && classId ? (
          <>
            {/* Header row */}
            <View style={[styles.tableHeader, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.sm}]}>
              <Text style={[textStyles.label, {color: colors.primary, flex: 1}]}>Student</Text>
              <Text style={[textStyles.label, {color: colors.primary, width: 80, textAlign: 'center'}]}>Obtained</Text>
              <Text style={[textStyles.label, {color: colors.primary, width: 80, textAlign: 'center'}]}>Max</Text>
            </View>

            {classStudents.map(student => {
              const sId = String(student.id);
              const entry = marksMap[sId] || {obtained: '', max: '100'};
              const obtained = parseFloat(entry.obtained);
              const max = parseFloat(entry.max);
              const pct = !isNaN(obtained) && !isNaN(max) && max > 0 ? obtained / max : null;
              const pctColor = pct === null ? colors.textSecondary : pct >= 0.7 ? colors.success : pct >= 0.4 ? colors.warning : colors.error;

              return (
                <View key={student.id} style={[
                  styles.studentRow,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor},
                ]}>
                  <View style={{flex: 1}}>
                    <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]}>{student.user?.name}</Text>
                    {pct !== null && (
                      <Text style={[textStyles.caption, {color: pctColor}]}>{Math.round(pct * 100)}%</Text>
                    )}
                  </View>
                  <TextInput
                    value={entry.obtained}
                    onChangeText={v => setStudentMark(sId, 'obtained', v)}
                    placeholder="—"
                    keyboardType="numeric"
                    style={[styles.markInput, {
                      backgroundColor: colors.inputBg, color: colors.textPrimary,
                      borderColor: colors.border, borderRadius: borderRadius.md,
                    }]}
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TextInput
                    value={entry.max}
                    onChangeText={v => setStudentMark(sId, 'max', v)}
                    placeholder="100"
                    keyboardType="numeric"
                    style={[styles.markInput, {
                      backgroundColor: colors.inputBg, color: colors.textPrimary,
                      borderColor: colors.border, borderRadius: borderRadius.md,
                    }]}
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              );
            })}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={actionLoading}
              style={[styles.submitBtn, {
                backgroundColor: actionLoading ? colors.primaryFaded : colors.primary,
                borderRadius: borderRadius.lg,
                marginTop: spacing.md,
              }]}>
              <Text style={[textStyles.body1, {color: colors.white, fontWeight: '700', textAlign: 'center'}]}>
                {actionLoading ? 'Saving…' : 'Save Marks'}
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
            <Text style={{fontSize: 40}}>📊</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>Select a class to enter marks</Text>
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
  tableHeader: {flexDirection: 'row', alignItems: 'center'},
  studentRow: {flexDirection: 'row', alignItems: 'center'},
  markInput: {
    width: 72, height: 38, textAlign: 'center', borderWidth: 1,
    marginLeft: 8, fontSize: 14,
  },
  submitBtn: {paddingVertical: 14},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
});

export default MarksScreen;
