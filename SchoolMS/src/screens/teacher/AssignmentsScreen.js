import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, Alert, RefreshControl, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {
  fetchAssignments, createAssignmentThunk, deleteAssignmentThunk,
  fetchMyClasses, fetchClassStudents, fetchSubjects,
} from '../../redux/slices/teacherSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import {shareAssignmentToWhatsApp} from '../../utils/whatsAppShare';

const EXAM_TYPES = ['unit_test', 'mid_term', 'final', 'assignment', 'quiz'];

// Formats ISO date to readable string
const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});
};

const isDueSoon = iso => {
  if (!iso) return false;
  const diff = new Date(iso) - new Date();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

const isOverdue = iso => iso && new Date(iso) < new Date();

// ── Assignment Card ────────────────────────────────────────────────────────
const AssignmentCard = ({item, onDelete}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const due  = item.due_date;
  const soon = isDueSoon(due);
  const over = isOverdue(due);
  const borderColor = over ? colors.error : soon ? colors.warning : colors.border;

  const handleShare = () => {
    shareAssignmentToWhatsApp(item);
  };

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface, borderRadius: borderRadius.xl,
        padding: spacing.md, marginBottom: spacing.sm,
        borderLeftWidth: 4, borderLeftColor: borderColor,
        ...shadow.sm, shadowColor: colors.shadowColor,
      },
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', flex: 1}]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.shareBtn, {backgroundColor: '#25D366', borderRadius: borderRadius.sm}]}>
            <Text style={[textStyles.caption, {color: '#fff', fontWeight: '600'}]}>📱 Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.deleteBtn, {backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm}]}>
            <Text style={[textStyles.caption, {color: colors.error, fontWeight: '600'}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        {item.student?.user?.name && (
          <View style={[styles.badge, {backgroundColor: colors.successFaded, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: colors.success}]}>👤 {item.student.user.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={[
          textStyles.caption,
          {color: over ? colors.error : soon ? colors.warning : colors.textSecondary, fontWeight: over || soon ? '700' : '400'},
        ]}>
          {over ? '⚠️ Overdue: ' : soon ? '⏰ Due soon: ' : '📅 Due: '}
          {fmtDate(due)}
        </Text>
        <Text style={[textStyles.caption, {color: colors.textTertiary}]}>
          Max: {item.max_marks} marks
        </Text>
      </View>
    </View>
  );
};

// ── Create Modal ───────────────────────────────────────────────────────────
const CreateModal = ({visible, onClose}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {classes, classStudents, subjects, actionLoading} = useSelector(s => s.teacher);

  const [form, setForm] = useState({
    title: '', description: '', due_date: '', max_marks: '100',
    assignTo: 'class',   // 'class' | 'student'
    class_id: '', student_id: '', subject_id: '',
  });
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(p => ({...p, [k]: v})); if (errors[k]) setErrors(p => ({...p, [k]: ''})); };

  useEffect(() => {
    if (visible) {
      dispatch(fetchMyClasses());
      dispatch(fetchSubjects({}));
    }
  }, [visible]);

  const onClassChange = v => {
    set('class_id', v);
    set('student_id', '');
    if (v) dispatch(fetchClassStudents(v));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.due_date.trim()) e.due_date = 'Due date required (YYYY-MM-DD)';
    if (form.assignTo === 'class' && !form.class_id) e.class_id = 'Select a class';
    if (form.assignTo === 'student' && !form.student_id) e.student_id = 'Select a student';
    return e;
  };

  const handleCreate = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    // Build FormData (no file attachment in this screen — use UploadMaterial for files)
    const payload = new FormData();
    payload.append('title', form.title.trim());
    if (form.description) payload.append('description', form.description.trim());
    payload.append('due_date', form.due_date.trim());
    payload.append('max_marks', form.max_marks || '100');
    if (form.assignTo === 'class' && form.class_id) payload.append('class_id', form.class_id);
    if (form.assignTo === 'student' && form.student_id) payload.append('student_id', form.student_id);
    if (form.subject_id) payload.append('subject_id', form.subject_id);

    const result = await dispatch(createAssignmentThunk(payload));
    if (createAssignmentThunk.fulfilled.match(result)) {
      setForm({title: '', description: '', due_date: '', max_marks: '100', assignTo: 'class', class_id: '', student_id: '', subject_id: ''});
      onClose();
    } else {
      Alert.alert('Error', result.payload || 'Failed to create assignment');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modal, {backgroundColor: colors.background}]}>
        <View style={[styles.modalHeader, {backgroundColor: colors.headerBg, padding: spacing.base}]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[textStyles.body1, {color: colors.white}]}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={[textStyles.h5, {color: colors.white}]}>New Assignment</Text>
          <View style={{width: 60}} />
        </View>

        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={[styles.modalScroll, {padding: spacing.base}]}
            showsVerticalScrollIndicator={false}>

            <AppInput label="Title *" value={form.title} onChangeText={v => set('title', v)}
              placeholder="Assignment title" error={errors.title} />
            <AppInput label="Description" value={form.description} onChangeText={v => set('description', v)}
              placeholder="Instructions (optional)" multiline numberOfLines={3} />
            <AppInput label="Due Date * (YYYY-MM-DD)" value={form.due_date}
              onChangeText={v => set('due_date', v)} placeholder="2025-12-31"
              keyboardType="numbers-and-punctuation" error={errors.due_date} />
            <AppInput label="Max Marks" value={form.max_marks} onChangeText={v => set('max_marks', v)}
              placeholder="100" keyboardType="numeric" />

            {/* Assign to */}
            <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 8}]}>Assign To</Text>
            <View style={[styles.toggleRow, {marginBottom: spacing.md}]}>
              {['class', 'student'].map(t => (
                <TouchableOpacity key={t} onPress={() => set('assignTo', t)}
                  style={[styles.toggleBtn, {
                    backgroundColor: form.assignTo === t ? colors.primary : colors.inputBg,
                    borderRadius: borderRadius.md, borderColor: form.assignTo === t ? colors.primary : colors.border, borderWidth: 1,
                  }]}>
                  <Text style={[textStyles.label, {color: form.assignTo === t ? colors.white : colors.textSecondary}]}>
                    {t === 'class' ? '🏫 Whole Class' : '👤 Individual'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Class picker */}
            {(form.assignTo === 'class' || form.assignTo === 'student') && (
              <>
                <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                  {classes.map(c => (
                    <TouchableOpacity key={c.id} onPress={() => onClassChange(String(c.id))}
                      style={[styles.chip, {
                        backgroundColor: form.class_id === String(c.id) ? colors.primary : colors.inputBg,
                        borderRadius: borderRadius.full, borderColor: form.class_id === String(c.id) ? colors.primary : colors.border, borderWidth: 1, marginRight: 8,
                      }]}>
                      <Text style={[textStyles.caption, {color: form.class_id === String(c.id) ? colors.white : colors.textSecondary}]}>
                        {c.name} {c.section || ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.class_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.class_id}</Text> : null}
              </>
            )}

            {/* Student picker (only for individual) */}
            {form.assignTo === 'student' && classStudents.length > 0 && (
              <>
                <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Student</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                  {classStudents.map(s => (
                    <TouchableOpacity key={s.id} onPress={() => set('student_id', String(s.id))}
                      style={[styles.chip, {
                        backgroundColor: form.student_id === String(s.id) ? colors.success : colors.inputBg,
                        borderRadius: borderRadius.full, borderColor: form.student_id === String(s.id) ? colors.success : colors.border, borderWidth: 1, marginRight: 8,
                      }]}>
                      <Text style={[textStyles.caption, {color: form.student_id === String(s.id) ? colors.white : colors.textSecondary}]}>
                        {s.user?.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {errors.student_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.student_id}</Text> : null}
              </>
            )}

            {/* Subject picker */}
            {subjects.length > 0 && (
              <>
                <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Subject (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                  {subjects.map(sub => (
                    <TouchableOpacity key={sub.id} onPress={() => set('subject_id', form.subject_id === String(sub.id) ? '' : String(sub.id))}
                      style={[styles.chip, {
                        backgroundColor: form.subject_id === String(sub.id) ? colors.warning : colors.inputBg,
                        borderRadius: borderRadius.full, borderColor: form.subject_id === String(sub.id) ? colors.warning : colors.border, borderWidth: 1, marginRight: 8,
                      }]}>
                      <Text style={[textStyles.caption, {color: form.subject_id === String(sub.id) ? colors.white : colors.textSecondary}]}>
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <AppButton title="Create Assignment" onPress={handleCreate} loading={actionLoading} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────
const AssignmentsScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {assignments, loading} = useSelector(s => s.teacher);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(() => dispatch(fetchAssignments({})), [dispatch]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = item => {
    Alert.alert('Delete Assignment', `Delete "${item.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteAssignmentThunk(item.id))},
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Assignments</Text>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[styles.addBtn, {backgroundColor: colors.whiteAlpha20, borderRadius: borderRadius.md}]}>
          <Text style={[textStyles.label, {color: colors.white}]}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignments}
        keyExtractor={a => String(a.id)}
        renderItem={({item}) => <AssignmentCard item={item} onDelete={() => handleDelete(item)} />}
        contentContainerStyle={[styles.list, {padding: spacing.base}]}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>📝</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No assignments yet</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />

      <CreateModal visible={showModal} onClose={() => setShowModal(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addBtn: {paddingHorizontal: 14, paddingVertical: 6},
  list: {paddingBottom: 40},
  card: {},
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  actionButtons: {flexDirection: 'row', gap: 6},
  shareBtn: {paddingHorizontal: 8, paddingVertical: 4},
  deleteBtn: {paddingHorizontal: 8, paddingVertical: 4},
  metaRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  badge: {paddingHorizontal: 10, paddingVertical: 3},
  footer: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
  modal: {flex: 1},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  modalScroll: {paddingBottom: 40},
  toggleRow: {flexDirection: 'row', gap: 10},
  toggleBtn: {flex: 1, alignItems: 'center', paddingVertical: 10},
  chip: {paddingHorizontal: 14, paddingVertical: 7},
});

export default AssignmentsScreen;
