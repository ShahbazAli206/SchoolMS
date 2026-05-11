import React, {useState, useEffect} from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {teacherSubmitComplaintThunk} from '../../redux/slices/complaintSlice';
import {fetchMyClasses, fetchClassStudents} from '../../redux/slices/teacherSlice';

const TeacherSubmitComplaintScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {classes, classStudents} = useSelector(s => s.teacher);
  const {actionLoading} = useSelector(s => s.complaints);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { dispatch(fetchMyClasses()); }, [dispatch]);
  useEffect(() => {
    if (selectedClass) {
      dispatch(fetchClassStudents(selectedClass.id));
      setSelectedStudent(null);
    }
  }, [selectedClass, dispatch]);

  const submit = () => {
    if (!selectedStudent) return Alert.alert('Validation', 'Pick a student');
    if (!title.trim())    return Alert.alert('Validation', 'Title is required');
    if (!description.trim()) return Alert.alert('Validation', 'Description is required');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('student_id', String(selectedStudent.id));

    dispatch(teacherSubmitComplaintThunk(formData)).unwrap()
      .then(() => {
        Alert.alert('Sent', "Your complaint has been sent to the student's parent.", [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      })
      .catch(err => Alert.alert('Error', err || 'Failed'));
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#EEF0FB'}]} edges={['left', 'right']}>
      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notify Parent</Text>
        <View style={{width: 36}} />
      </View>

      <ScrollView contentContainerStyle={{padding: 14, paddingBottom: 40}}>
        <Text style={styles.section}>Class</Text>
        <View style={styles.chipsWrap}>
          {classes.length === 0 && (
            <Text style={styles.muted}>You aren't assigned to any classes yet.</Text>
          )}
          {classes.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedClass(c)}
              style={[styles.chip, selectedClass?.id === c.id && {backgroundColor: '#6C5CE7', borderColor: '#6C5CE7'}]}>
              <Text style={{color: selectedClass?.id === c.id ? '#fff' : '#1F2937', fontWeight: '700', fontSize: 12}}>
                {c.name}{c.section ? ' - ' + c.section : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedClass && (
          <>
            <Text style={styles.section}>Student</Text>
            <View style={styles.chipsWrap}>
              {(classStudents || []).map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedStudent(s)}
                  style={[styles.chip, selectedStudent?.id === s.id && {backgroundColor: '#00B894', borderColor: '#00B894'}]}>
                  <Text style={{color: selectedStudent?.id === s.id ? '#fff' : '#1F2937', fontWeight: '700', fontSize: 12}}>
                    {s.user?.name || `Student #${s.id}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <Text style={styles.section}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Short summary"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          maxLength={200}
        />

        <Text style={styles.section}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue or behaviour…"
          placeholderTextColor="#9CA3AF"
          style={[styles.input, styles.textArea]}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        <TouchableOpacity onPress={submit} disabled={actionLoading} style={styles.submitBtn}>
          {actionLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{color: '#fff', fontWeight: '800', fontSize: 15}}>Send to Parent</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  backBtn: {width: 36, height: 36, alignItems: 'center', justifyContent: 'center'},
  backChevron: {fontSize: 26, color: '#1F2937', marginTop: -3},
  headerTitle: {flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1F2937'},

  section: {fontSize: 13, fontWeight: '800', color: '#1F2937', marginTop: 14, marginBottom: 8},
  muted: {fontSize: 12, color: '#9CA3AF'},

  chipsWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF'},

  input: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2937'},
  textArea: {height: 130},

  submitBtn: {marginTop: 22, backgroundColor: '#6C5CE7', borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
});

export default TeacherSubmitComplaintScreen;
