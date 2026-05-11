import React, {useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';
import {adminAPI} from '../../services/adminService';

const ROLE_OPTIONS = [
  {key: 'class_teacher',   label: 'Class Teacher',   emoji: '🎓'},
  {key: 'subject_teacher', label: 'Subject Teacher', emoji: '📚'},
];

const Chip = ({active, label, onPress, color}) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, {backgroundColor: active ? color : '#F3F4F6', borderColor: active ? color : '#E5E7EB'}]}>
    <Text style={{color: active ? '#fff' : '#1F2937', fontSize: 12, fontWeight: '700'}}>{label}</Text>
  </TouchableOpacity>
);

const AssignTeacherScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const [classes,      setClasses]      = useState([]);
  const [teachers,     setTeachers]     = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [role,         setRole]         = useState('subject_teacher');
  const [subjectId,    setSubjectId]    = useState('');
  const [assignments,  setAssignments]  = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  const loadCore = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([
        adminAPI.listClasses(),
        adminAPI.getTeachers({limit: 100}),
      ]);
      setClasses(cRes.data?.data || []);
      const tList = (tRes.data?.data || []).map(t => ({
        id: t.user_id || t.user?.id,
        teacherRowId: t.id,
        name: t.user?.name || `Teacher #${t.id}`,
      })).filter(t => t.id);
      setTeachers(tList);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAssignments = useCallback(async classId => {
    if (!classId) return;
    try {
      const res = await adminAPI.getClassTeachers(classId);
      setAssignments(res.data?.data || []);
    } catch (e) {
      setAssignments([]);
    }
  }, []);

  useEffect(() => { loadCore(); }, [loadCore]);
  useEffect(() => { loadAssignments(selectedClass?.id); }, [selectedClass, loadAssignments]);

  const handleAssign = async () => {
    if (!selectedClass)   return Alert.alert('Validation', 'Pick a class');
    if (!selectedTeacher) return Alert.alert('Validation', 'Pick a teacher');
    setSubmitting(true);
    try {
      await adminAPI.assignTeachers(selectedClass.id, {
        teacher_id: selectedTeacher.id,
        role,
        subject_id: subjectId ? Number(subjectId) : null,
      });
      setSelectedTeacher(null);
      setSubjectId('');
      await loadAssignments(selectedClass.id);
      Alert.alert('Saved', 'Teacher assigned to class.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async assignmentId => {
    Alert.alert('Remove?', 'Remove this teacher from the class?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: async () => {
        try {
          await adminAPI.removeAssignment(assignmentId);
          await loadAssignments(selectedClass.id);
        } catch (e) {
          Alert.alert('Error', e.response?.data?.message || 'Failed');
        }
      }},
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#EEF0FB'}]} edges={['left', 'right']}>
      <View style={[styles.header, {paddingTop: insets.top + 8, backgroundColor: '#FFFFFF'}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Teachers to Class</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        contentContainerStyle={{padding: 14, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCore} tintColor="#6C5CE7" />}>

        {/* Pick class */}
        <Text style={styles.section}>Class</Text>
        <View style={styles.chipsWrap}>
          {classes.length === 0 && !loading && (
            <Text style={styles.muted}>No classes found. Create one first.</Text>
          )}
          {classes.map(c => (
            <Chip
              key={c.id}
              active={selectedClass?.id === c.id}
              color="#6C5CE7"
              label={`${c.name}${c.section ? ' - ' + c.section : ''}`}
              onPress={() => setSelectedClass(c)}
            />
          ))}
        </View>

        {/* Pick teacher */}
        <Text style={styles.section}>Teacher</Text>
        <View style={styles.chipsWrap}>
          {teachers.map(t => (
            <Chip
              key={t.id}
              active={selectedTeacher?.id === t.id}
              color="#00B894"
              label={t.name}
              onPress={() => setSelectedTeacher(t)}
            />
          ))}
        </View>

        {/* Role */}
        <Text style={styles.section}>Role</Text>
        <View style={styles.chipsWrap}>
          {ROLE_OPTIONS.map(r => (
            <Chip
              key={r.key}
              active={role === r.key}
              color="#0984E3"
              label={`${r.emoji} ${r.label}`}
              onPress={() => setRole(r.key)}
            />
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleAssign}
          disabled={submitting}
          style={[styles.assignBtn, {opacity: submitting ? 0.7 : 1}]}>
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.assignBtnText}>+ Assign</Text>}
        </TouchableOpacity>

        {/* Existing assignments for the class */}
        {selectedClass && (
          <>
            <Text style={[styles.section, {marginTop: 24}]}>
              Current assignments — {selectedClass.name}
            </Text>
            {assignments.length === 0 ? (
              <Text style={styles.muted}>No teachers assigned yet.</Text>
            ) : assignments.map(a => (
              <View key={a.id} style={styles.assignCard}>
                <View style={{flex: 1}}>
                  <Text style={styles.assignName}>{a.teacher?.name || `Teacher #${a.teacher_id}`}</Text>
                  <Text style={styles.assignRole}>
                    {a.role === 'class_teacher' ? '🎓 Class Teacher' : '📚 Subject Teacher'}
                    {a.subject ? ` — ${a.subject.name}` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemove(a.id)} style={styles.removeBtn}>
                  <Text style={{color: '#D63031', fontWeight: '700', fontSize: 12}}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  backBtn: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  backChevron: {fontSize: 26, color: '#1F2937', marginTop: -3},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1F2937'},

  section: {fontSize: 13, fontWeight: '800', color: '#1F2937', marginTop: 14, marginBottom: 8},
  muted:   {fontSize: 12, color: '#9CA3AF'},

  chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1},

  assignBtn: {marginTop: 18, backgroundColor: '#6C5CE7', borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
  assignBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},

  assignCard: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1},
  assignName: {fontSize: 14, fontWeight: '700', color: '#1F2937'},
  assignRole: {fontSize: 11, color: '#6B7280', marginTop: 2},
  removeBtn:  {paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FFE5E5', borderRadius: 8},
});

export default AssignTeacherScreen;
