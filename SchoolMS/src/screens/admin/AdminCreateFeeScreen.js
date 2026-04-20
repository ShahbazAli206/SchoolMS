import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {createFeeThunk, fetchAllFees} from '../../redux/slices/feeSlice';
import {fetchMyClasses, fetchClassStudents} from '../../redux/slices/teacherSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';

const FEE_TYPES = ['tuition', 'transport', 'exam', 'library', 'sports', 'other'];
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const AdminCreateFeeScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {classes, classStudents} = useSelector(s => s.teacher);
  const {actionLoading} = useSelector(s => s.fees);

  const [form, setForm] = useState({
    title: '', description: '',
    fee_type: 'tuition',
    amount: '', due_date: '',
    academic_year: '', month: '',
    assignTo: 'class',   // 'class' | 'student'
    class_id: '', student_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchMyClasses());
  }, []);

  const set = (k, v) => {
    setForm(p => ({...p, [k]: v}));
    if (errors[k]) setErrors(p => ({...p, [k]: ''}));
  };

  const onClassChange = id => {
    set('class_id', id);
    set('student_id', '');
    if (id) dispatch(fetchClassStudents(id));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title required';
    if (!form.amount.trim())   e.amount   = 'Amount required';
    if (!form.due_date.trim()) e.due_date = 'Due date required (YYYY-MM-DD)';
    if (form.assignTo === 'class'   && !form.class_id)   e.class_id   = 'Select a class';
    if (form.assignTo === 'student' && !form.student_id) e.student_id = 'Select a student';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const payload = {
      title:         form.title.trim(),
      description:   form.description.trim() || undefined,
      fee_type:      form.fee_type,
      amount:        parseFloat(form.amount),
      due_date:      form.due_date.trim(),
      academic_year: form.academic_year.trim() || undefined,
      month:         form.month || undefined,
    };
    if (form.assignTo === 'class')   payload.class_id   = form.class_id;
    if (form.assignTo === 'student') payload.student_id = form.student_id;

    const result = await dispatch(createFeeThunk(payload));
    if (createFeeThunk.fulfilled.match(result)) {
      dispatch(fetchAllFees({limit: 30}));
      navigation.goBack();
    } else {
      Alert.alert('Error', result.payload || 'Failed to create fee');
    }
  };

  const chipStyle = active => ({
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: active ? colors.primary : colors.inputBg,
    borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: active ? colors.primary : colors.border,
    marginRight: 8, marginBottom: 8,
  });

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[textStyles.body1, {color: colors.white}]}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white}]}>New Fee</Text>
        <View style={{width: 60}} />
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing.base}]} showsVerticalScrollIndicator={false}>

          <AppInput label="Title *" value={form.title} onChangeText={v => set('title', v)}
            placeholder="e.g. Monthly Tuition Fee" error={errors.title} />

          <AppInput label="Description" value={form.description} onChangeText={v => set('description', v)}
            placeholder="Optional details" multiline numberOfLines={2} />

          <AppInput label="Amount (Rs.) *" value={form.amount} onChangeText={v => set('amount', v)}
            placeholder="5000" keyboardType="numeric" error={errors.amount} />

          <AppInput label="Due Date * (YYYY-MM-DD)" value={form.due_date} onChangeText={v => set('due_date', v)}
            placeholder="2025-12-31" keyboardType="numbers-and-punctuation" error={errors.due_date} />

          <AppInput label="Academic Year" value={form.academic_year} onChangeText={v => set('academic_year', v)}
            placeholder="2024-25" />

          {/* Fee Type */}
          <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 8}]}>Fee Type</Text>
          <View style={styles.chipWrap}>
            {FEE_TYPES.map(t => (
              <TouchableOpacity key={t} onPress={() => set('fee_type', t)} style={chipStyle(form.fee_type === t)}>
                <Text style={[textStyles.caption, {color: form.fee_type === t ? colors.white : colors.textSecondary, textTransform: 'capitalize'}]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month */}
          <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 8, marginTop: spacing.sm}]}>Month (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
            {MONTHS.map(m => (
              <TouchableOpacity key={m} onPress={() => set('month', form.month === m ? '' : m)} style={chipStyle(form.month === m)}>
                <Text style={[textStyles.caption, {color: form.month === m ? colors.white : colors.textSecondary}]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Assign To toggle */}
          <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 8}]}>Assign To</Text>
          <View style={[styles.toggleRow, {marginBottom: spacing.md}]}>
            {[{k: 'class', label: '🏫 Whole Class'}, {k: 'student', label: '👤 Individual'}].map(t => (
              <TouchableOpacity key={t.k} onPress={() => set('assignTo', t.k)}
                style={[styles.toggleBtn, {
                  backgroundColor: form.assignTo === t.k ? colors.primary : colors.inputBg,
                  borderRadius: borderRadius.md,
                  borderWidth: 1, borderColor: form.assignTo === t.k ? colors.primary : colors.border,
                }]}>
                <Text style={[textStyles.label, {color: form.assignTo === t.k ? colors.white : colors.textSecondary}]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Class picker */}
          <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.sm}}>
            {classes.map(c => (
              <TouchableOpacity key={c.id} onPress={() => onClassChange(String(c.id))}
                style={chipStyle(form.class_id === String(c.id))}>
                <Text style={[textStyles.caption, {color: form.class_id === String(c.id) ? colors.white : colors.textSecondary}]}>
                  {c.name} {c.section || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.class_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.class_id}</Text> : null}

          {/* Student picker */}
          {form.assignTo === 'student' && classStudents.length > 0 && (
            <>
              <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Student</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.sm}}>
                {classStudents.map(s => (
                  <TouchableOpacity key={s.id} onPress={() => set('student_id', String(s.id))}
                    style={chipStyle(form.student_id === String(s.id))}>
                    <Text style={[textStyles.caption, {color: form.student_id === String(s.id) ? colors.white : colors.textSecondary}]}>
                      {s.user?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.student_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.student_id}</Text> : null}
            </>
          )}

          <AppButton title="Create Fee" onPress={handleSubmit} loading={actionLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap'},
  toggleRow: {flexDirection: 'row', gap: 10},
  toggleBtn: {flex: 1, alignItems: 'center', paddingVertical: 10},
});

export default AdminCreateFeeScreen;
