import React, {useState} from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';
import {authAPI} from '../../services/authService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import {validateRegisterForm} from '../../utils/validators';
import {getErrorMessage} from '../../utils/errorHandler';

const ROLES = [
  {label: 'Student', value: 'student'},
  {label: 'Parent', value: 'parent'},
  {label: 'Teacher', value: 'teacher'},
  {label: 'Staff', value: 'staff'},
];

const RegisterScreen = ({navigation}) => {
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', username: '',
    password: '', confirmPassword: '', role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm(prev => ({...prev, [key]: val}));
    if (errors[key]) setErrors(prev => ({...prev, [key]: ''}));
  };

  const handleRegister = async () => {
    const validationErrors = validateRegisterForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        username: form.username.trim() || undefined,
        password: form.password,
        role: form.role,
      });
      Alert.alert('Registration Successful', 'Account created. Please login.', [
        {text: 'Login Now', onPress: () => navigation.navigate('Login')},
      ]);
    } catch (error) {
      Alert.alert('Registration Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing['2xl'], paddingBottom: 40}]}
          showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Text style={[textStyles.h2, {color: colors.primary, fontWeight: '800'}]}>SchoolMS</Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 4}]}>Create your account</Text>
          </View>

          <AppCard>
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Personal Info</Text>

            <AppInput label="Full Name *" value={form.name} onChangeText={v => set('name', v)}
              placeholder="Enter your full name" autoCapitalize="words" error={errors.name} />

            <AppInput label="Email Address *" value={form.email} onChangeText={v => set('email', v)}
              placeholder="example@email.com" keyboardType="email-address" error={errors.email} />

            <AppInput label="Phone Number (optional)" value={form.phone} onChangeText={v => set('phone', v)}
              placeholder="+92-300-0000000" keyboardType="phone-pad" error={errors.phone} />

            <AppInput label="Username (optional)" value={form.username} onChangeText={v => set('username', v)}
              placeholder="Choose a username" error={errors.username} />

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: colors.divider}]} />
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Account Security</Text>

            <AppInput label="Password *" value={form.password} onChangeText={v => set('password', v)}
              placeholder="Minimum 8 characters" secureTextEntry error={errors.password} />

            <AppInput label="Confirm Password *" value={form.confirmPassword}
              onChangeText={v => set('confirmPassword', v)}
              placeholder="Re-enter your password" secureTextEntry error={errors.confirmPassword} />

            {/* Role Selector */}
            <View style={[styles.divider, {backgroundColor: colors.divider}]} />
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: 4}]}>I am a:</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => {
                const active = form.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => set('role', r.value)}
                    style={[
                      styles.roleChip,
                      {
                        borderRadius: borderRadius.full,
                        backgroundColor: active ? colors.primary : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={[textStyles.label, {color: active ? colors.white : colors.textSecondary}]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AppButton title="Create Account" onPress={handleRegister} loading={loading}
              style={{marginTop: spacing.sm}} />
          </AppCard>

          <View style={[styles.loginRow, {marginTop: spacing.xl}]}>
            <Text style={[textStyles.body2, {color: colors.textSecondary}]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[textStyles.body2, {color: colors.primary, fontWeight: '600'}]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scroll: {},
  logoWrap: {alignItems: 'center', marginBottom: 28},
  divider: {height: 1, marginVertical: 16},
  roleRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14, marginTop: 8},
  roleChip: {paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1.5},
  loginRow: {flexDirection: 'row', justifyContent: 'center'},
});

export default RegisterScreen;
