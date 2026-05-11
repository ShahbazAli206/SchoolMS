import React, {useState} from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {createUserThunk} from '../../redux/slices/adminSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import PageHeader from '../../components/common/PageHeader';
import {validators} from '../../utils/validators';

const ROLES = [
  {label: 'Student',   value: 'student',   icon: '🎓',   color: '#6C5CE7'},
  {label: 'Teacher',   value: 'teacher',   icon: '👨‍🏫',  color: '#00B894'},
  {label: 'Parent',    value: 'parent',    icon: '👨‍👩‍👧', color: '#FDCB6E'},
  {label: 'Staff',     value: 'staff',     icon: '🏫',   color: '#74B9FF'},
  {label: 'Principal', value: 'principal', icon: '🏛️',  color: '#0984E3'},
  {label: 'Admin',     value: 'admin',     icon: '⚙️',   color: '#A29BFE'},
];

const ROLE_FIELDS = {
  student:   ['rollNumber', 'admissionNo', 'dateOfBirth', 'address'],
  teacher:   ['employeeId', 'qualification', 'specialization', 'joiningDate'],
  parent:    ['occupation', 'address'],
  staff:     ['address'],
  principal: [],
  admin:     [],
};

const GlassSection = ({title, icon, children, borderColor}) => {
  const {colors, borderRadius} = useTheme();
  return (
    <View style={[styles.section, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderLeftWidth: 3, borderLeftColor: borderColor || '#6C5CE7', borderWidth: 1, borderColor: colors.border}]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, {backgroundColor: (borderColor || '#6C5CE7') + '18', borderRadius: 10}]}>
          <Text style={{fontSize: 16}}>{icon}</Text>
        </View>
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const AddUserScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {actionLoading} = useSelector(s => s.admin);

  const defaultRole = route?.params?.defaultRole ?? 'student';

  const [form, setForm] = useState({
    name: '', email: '', phone: '', username: '',
    password: '', confirmPassword: '',
    role: defaultRole,
    rollNumber: '', admissionNo: '', dateOfBirth: '', address: '',
    employeeId: '', qualification: '', specialization: '', joiningDate: '',
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
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      username: form.username.trim() || undefined,
      password: form.password,
      role: form.role,
    };

    if (form.role === 'student') {
      payload.roll_number  = form.rollNumber   || undefined;
      payload.admission_no = form.admissionNo  || undefined;
      payload.date_of_birth= form.dateOfBirth  || undefined;
      payload.address      = form.address      || undefined;
    } else if (form.role === 'teacher') {
      payload.employee_id    = form.employeeId    || undefined;
      payload.qualification  = form.qualification || undefined;
      payload.specialization = form.specialization|| undefined;
      payload.joining_date   = form.joiningDate   || undefined;
    } else if (form.role === 'parent') {
      payload.occupation = form.occupation || undefined;
      payload.address    = form.address    || undefined;
    }

    const result = await dispatch(createUserThunk(payload));
    if (createUserThunk.fulfilled.match(result)) {
      Alert.alert('Success', `${form.role.charAt(0).toUpperCase() + form.role.slice(1)} created successfully.`, [
        {text: 'Add Another', onPress: () => setForm({name:'', email:'', phone:'', username:'', password:'', confirmPassword:'', role: form.role, rollNumber:'', admissionNo:'', dateOfBirth:'', address:'', employeeId:'', qualification:'', specialization:'', joiningDate:'', occupation:''})},
        {text: 'Back to List', onPress: () => navigation.goBack()},
      ]);
    } else {
      Alert.alert('Error', result.payload ?? 'Failed to create user');
    }
  };

  const selectedRole = ROLES.find(r => r.value === form.role);
  const extraFields  = ROLE_FIELDS[form.role] ?? [];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <PageHeader title="Add New User" showBack onBackPress={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, {padding: spacing.base, paddingBottom: 60}]}
          showsVerticalScrollIndicator={false}>

          {/* ── ROLE SELECTOR ── */}
          <GlassSection title="Select Role" icon="🎭" borderColor={selectedRole?.color}>
            <View style={styles.roleGrid}>
              {ROLES.map(r => {
                const active = form.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => set('role', r.value)}
                    style={[styles.roleChip, {
                      backgroundColor: active ? r.color : colors.inputBg,
                      borderColor: active ? r.color : colors.border,
                      borderWidth: 1.5,
                      borderRadius: borderRadius.xl,
                    }]}>
                    <Text style={{fontSize: 22, marginBottom: 4}}>{r.icon}</Text>
                    <Text style={[styles.roleChipLabel, {color: active ? '#fff' : colors.textSecondary, fontWeight: active ? '700' : '500'}]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassSection>

          {/* ── BASIC INFO ── */}
          <GlassSection title="Basic Information" icon="👤" borderColor="#6C5CE7">
            <AppInput label="Full Name *" value={form.name} onChangeText={v => set('name', v)}
              placeholder="Enter full name" autoCapitalize="words" error={errors.name} />
            <AppInput label="Email" value={form.email} onChangeText={v => set('email', v)}
              placeholder="email@example.com" keyboardType="email-address" error={errors.email} />
            <AppInput label="Phone" value={form.phone} onChangeText={v => set('phone', v)}
              placeholder="+92 300 0000000" keyboardType="phone-pad" error={errors.phone} />
            <AppInput label="Username" value={form.username} onChangeText={v => set('username', v)}
              placeholder="Optional username" error={errors.username} />
          </GlassSection>

          {/* ── SECURITY ── */}
          <GlassSection title="Security" icon="🔐" borderColor="#A29BFE">
            <AppInput label="Password *" value={form.password} onChangeText={v => set('password', v)}
              placeholder="Min 8 characters" secureTextEntry error={errors.password} />
            <AppInput label="Confirm Password *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)}
              placeholder="Re-enter password" secureTextEntry error={errors.confirmPassword} />
          </GlassSection>

          {/* ── ROLE-SPECIFIC ── */}
          {extraFields.length > 0 && (
            <GlassSection
              title={`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} Details`}
              icon={selectedRole?.icon || '📋'}
              borderColor={selectedRole?.color}>
              {extraFields.includes('rollNumber') && (
                <AppInput label="Roll Number" value={form.rollNumber} onChangeText={v => set('rollNumber', v)} placeholder="e.g. 2024-001" />
              )}
              {extraFields.includes('admissionNo') && (
                <AppInput label="Admission No." value={form.admissionNo} onChangeText={v => set('admissionNo', v)} placeholder="e.g. ADM-2024-001" />
              )}
              {extraFields.includes('dateOfBirth') && (
                <AppInput label="Date of Birth" value={form.dateOfBirth} onChangeText={v => set('dateOfBirth', v)} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
              )}
              {extraFields.includes('employeeId') && (
                <AppInput label="Employee ID" value={form.employeeId} onChangeText={v => set('employeeId', v)} placeholder="e.g. EMP-001" />
              )}
              {extraFields.includes('qualification') && (
                <AppInput label="Qualification" value={form.qualification} onChangeText={v => set('qualification', v)} placeholder="e.g. M.Sc. Mathematics" autoCapitalize="words" />
              )}
              {extraFields.includes('specialization') && (
                <AppInput label="Specialization" value={form.specialization} onChangeText={v => set('specialization', v)} placeholder="e.g. Physics, Chemistry" autoCapitalize="words" />
              )}
              {extraFields.includes('joiningDate') && (
                <AppInput label="Joining Date" value={form.joiningDate} onChangeText={v => set('joiningDate', v)} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" />
              )}
              {extraFields.includes('occupation') && (
                <AppInput label="Occupation" value={form.occupation} onChangeText={v => set('occupation', v)} placeholder="e.g. Engineer" autoCapitalize="words" />
              )}
              {extraFields.includes('address') && (
                <AppInput label="Address" value={form.address} onChangeText={v => set('address', v)} placeholder="Home address" multiline numberOfLines={3} autoCapitalize="sentences" />
              )}
            </GlassSection>
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

  header:    {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16},
  headerTitle:{color: '#fff', fontSize: 17, fontWeight: '800'},
  backBtn:   {},
  backPill:  {width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center'},
  backIcon:  {color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 30},

  scroll:    {},

  section:       {padding: 16, marginBottom: 14},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14},
  sectionIconWrap:{width: 32, height: 32, alignItems: 'center', justifyContent: 'center'},
  sectionTitle:  {fontSize: 14, fontWeight: '700'},

  roleGrid:      {flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-start'},
  roleChip:      {width: '28%', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4},
  roleChipLabel: {fontSize: 12},
});

export default AddUserScreen;
