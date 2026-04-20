import React, {useState} from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {createUserThunk} from '../../redux/slices/adminSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import AppHeader from '../../components/common/AppHeader';
import {validators} from '../../utils/validators';

const ROLES = [
  {label: 'Student', value: 'student', icon: '🎓'},
  {label: 'Teacher', value: 'teacher', icon: '👨‍🏫'},
  {label: 'Parent', value: 'parent', icon: '👨‍👩‍👧'},
  {label: 'Staff', value: 'staff', icon: '🏫'},
  {label: 'Admin', value: 'admin', icon: '⚙️'},
];

// Role-specific extra fields
const ROLE_FIELDS = {
  student: ['rollNumber', 'admissionNo', 'dateOfBirth', 'address'],
  teacher: ['employeeId', 'qualification', 'specialization', 'joiningDate'],
  parent:  ['occupation', 'address'],
  staff:   ['address'],
  admin:   [],
};

const AddUserScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {actionLoading} = useSelector(s => s.admin);

  const defaultRole = route?.params?.defaultRole ?? 'student';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', username: '',
    password: '', confirmPassword: '',
    role: defaultRole,
    // Student fields
    rollNumber: '', admissionNo: '', dateOfBirth: '', address: '',
    // Teacher fields
    employeeId: '', qualification: '', specialization: '', joiningDate: '',
    // Parent fields
    occupation: '',
  });
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm(p => ({...p, [key]: val}));
    if (errors[key]) setErrors(p => ({...p, [key]: ''}));
  };

  const validate = () => {
    const e = {};
    if (!validators.required(form.name)) e.name = 'Name is required';
    if (!form.email && !form.phone && !form.username) e.email = 'At least one of email, phone, or username is required';
    if (form.email && !validators.email(form.email)) e.email = 'Invalid email';
    if (form.phone && !validators.phone(form.phone)) e.phone = 'Invalid phone number';
    if (!validators.minLength(form.password, 8)) e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      username: form.username.trim() || undefined,
      password: form.password,
      role: form.role,
    };

    // Attach role-specific fields
    if (form.role === 'student') {
      payload.roll_number = form.rollNumber || undefined;
      payload.admission_no = form.admissionNo || undefined;
      payload.date_of_birth = form.dateOfBirth || undefined;
      payload.address = form.address || undefined;
    } else if (form.role === 'teacher') {
      payload.employee_id = form.employeeId || undefined;
      payload.qualification = form.qualification || undefined;
      payload.specialization = form.specialization || undefined;
      payload.joining_date = form.joiningDate || undefined;
    } else if (form.role === 'parent') {
      payload.occupation = form.occupation || undefined;
      payload.address = form.address || undefined;
    }

    const result = await dispatch(createUserThunk(payload));
    if (createUserThunk.fulfilled.match(result)) {
      Alert.alert('Success', `${form.role.charAt(0).toUpperCase() + form.role.slice(1)} created successfully.`, [
        {text: 'Add Another', onPress: () => setForm({name: '', email: '', phone: '', username: '', password: '', confirmPassword: '', role: form.role, rollNumber: '', admissionNo: '', dateOfBirth: '', address: '', employeeId: '', qualification: '', specialization: '', joiningDate: '', occupation: ''})},
        {text: 'Back to List', onPress: () => navigation.goBack()},
      ]);
    } else {
      Alert.alert('Error', result.payload ?? 'Failed to create user');
    }
  };

  const extraFields = ROLE_FIELDS[form.role] ?? [];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <AppHeader title="Add New User" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing.base, paddingBottom: 40}]}
          showsVerticalScrollIndicator={false}>

          {/* Role Selector */}
          <AppCard style={{marginBottom: spacing.md}}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Select Role</Text>
            <View style={styles.roleGrid}>
              {ROLES.map(r => {
                const active = form.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => set('role', r.value)}
                    style={[
                      styles.roleChip,
                      {
                        borderRadius: borderRadius.lg,
                        backgroundColor: active ? colors.primary : colors.inputBg,
                        borderColor: active ? colors.primary : colors.border,
                        borderWidth: 1.5,
                      },
                    ]}>
                    <Text style={{fontSize: 20, marginBottom: 4}}>{r.icon}</Text>
                    <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary, fontWeight: active ? '700' : '400'}]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AppCard>

          {/* Basic Info */}
          <AppCard style={{marginBottom: spacing.md}}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Basic Information</Text>

            <AppInput label="Full Name *" value={form.name} onChangeText={v => set('name', v)}
              placeholder="Enter full name" autoCapitalize="words" error={errors.name} />
            <AppInput label="Email" value={form.email} onChangeText={v => set('email', v)}
              placeholder="email@example.com" keyboardType="email-address" error={errors.email} />
            <AppInput label="Phone" value={form.phone} onChangeText={v => set('phone', v)}
              placeholder="+92 300 0000000" keyboardType="phone-pad" error={errors.phone} />
            <AppInput label="Username" value={form.username} onChangeText={v => set('username', v)}
              placeholder="Optional username" error={errors.username} />
          </AppCard>

          {/* Password */}
          <AppCard style={{marginBottom: spacing.md}}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Security</Text>
            <AppInput label="Password *" value={form.password} onChangeText={v => set('password', v)}
              placeholder="Min 8 characters" secureTextEntry error={errors.password} />
            <AppInput label="Confirm Password *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)}
              placeholder="Re-enter password" secureTextEntry error={errors.confirmPassword} />
          </AppCard>

          {/* Role-specific fields */}
          {extraFields.length > 0 && (
            <AppCard style={{marginBottom: spacing.md}}>
              <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>
                {form.role.charAt(0).toUpperCase() + form.role.slice(1)} Details
              </Text>

              {extraFields.includes('rollNumber') && (
                <AppInput label="Roll Number" value={form.rollNumber} onChangeText={v => set('rollNumber', v)}
                  placeholder="e.g. 2024-001" />
              )}
              {extraFields.includes('admissionNo') && (
                <AppInput label="Admission No." value={form.admissionNo} onChangeText={v => set('admissionNo', v)}
                  placeholder="e.g. ADM-2024-001" />
              )}
              {extraFields.includes('dateOfBirth') && (
                <AppInput label="Date of Birth" value={form.dateOfBirth} onChangeText={v => set('dateOfBirth', v)}
                  placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
              )}
              {extraFields.includes('employeeId') && (
                <AppInput label="Employee ID" value={form.employeeId} onChangeText={v => set('employeeId', v)}
                  placeholder="e.g. EMP-001" />
              )}
              {extraFields.includes('qualification') && (
                <AppInput label="Qualification" value={form.qualification} onChangeText={v => set('qualification', v)}
                  placeholder="e.g. M.Sc. Mathematics" autoCapitalize="words" />
              )}
              {extraFields.includes('specialization') && (
                <AppInput label="Specialization" value={form.specialization} onChangeText={v => set('specialization', v)}
                  placeholder="e.g. Physics, Chemistry" autoCapitalize="words" />
              )}
              {extraFields.includes('joiningDate') && (
                <AppInput label="Joining Date" value={form.joiningDate} onChangeText={v => set('joiningDate', v)}
                  placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
              )}
              {extraFields.includes('occupation') && (
                <AppInput label="Occupation" value={form.occupation} onChangeText={v => set('occupation', v)}
                  placeholder="e.g. Engineer" autoCapitalize="words" />
              )}
              {extraFields.includes('address') && (
                <AppInput label="Address" value={form.address} onChangeText={v => set('address', v)}
                  placeholder="Home address" multiline numberOfLines={3} autoCapitalize="sentences" />
              )}
            </AppCard>
          )}

          <AppButton
            title={`Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
            onPress={handleSubmit}
            loading={actionLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scroll: {},
  roleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between'},
  roleChip: {width: '30%', alignItems: 'center', paddingVertical: 12},
});

export default AddUserScreen;
