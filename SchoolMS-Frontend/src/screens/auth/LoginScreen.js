import React, {useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {loginUser, clearError} from '../../redux/slices/authSlice';
import {validateLoginForm} from '../../utils/validators';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';

const LOGIN_TYPES = ['email', 'phone', 'username'];

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {isLoading, error} = useSelector(state => state.auth);
  const {colors, spacing, textStyles, borderRadius} = useTheme();

  const [loginType, setLoginType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const placeholder = {email: 'Email address', phone: 'Phone number', username: 'Username'}[loginType];
  const kbType = {email: 'email-address', phone: 'phone-pad', username: 'default'}[loginType];

  const handleLogin = async () => {
    const errors = validateLoginForm({identifier, password});
    if (Object.keys(errors).length > 0) {setFieldErrors(errors); return;}
    setFieldErrors({});
    dispatch(clearError());
    const result = await dispatch(loginUser({identifier, password, loginType}));
    if (loginUser.fulfilled.match(result) && result.payload?.otpRequired) {
      navigation.navigate('OTP', {identifier: result.payload.identifier || identifier, loginType});
    }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inner, {padding: spacing['2xl']}]}>

          {/* Logo */}
          <View style={[styles.logoWrap, {marginBottom: spacing['3xl']}]}>
            <Text style={[textStyles.h2, {color: colors.primary, fontWeight: '800'}]}>SchoolMS</Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 4}]}>
              School Management System
            </Text>
          </View>

          <AppCard>
            <Text style={[textStyles.h4, {color: colors.textPrimary, marginBottom: spacing.lg}]}>Sign In</Text>

            {/* Login type tab switcher */}
            <View style={[styles.tabRow, {backgroundColor: colors.inputBg, borderRadius: borderRadius.md, marginBottom: spacing.lg}]}>
              {LOGIN_TYPES.map(t => {
                const active = loginType === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.tab,
                      {borderRadius: borderRadius.md, backgroundColor: active ? colors.primary : colors.transparent},
                    ]}
                    onPress={() => {setLoginType(t); setIdentifier('');}}>
                    <Text style={[textStyles.label, {color: active ? colors.white : colors.textSecondary}]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* API error banner */}
            {error ? (
              <View style={[styles.errorBanner, {backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm, marginBottom: spacing.md}]}>
                <Text style={[textStyles.body2, {color: colors.error}]}>{error}</Text>
              </View>
            ) : null}

            <AppInput
              label={placeholder}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder={placeholder}
              keyboardType={kbType}
              error={fieldErrors.identifier}
            />

            <AppInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={fieldErrors.password}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={[styles.forgotBtn, {marginBottom: spacing.md}]}>
              <Text style={[textStyles.label, {color: colors.primary}]}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton title="Sign In" onPress={handleLogin} loading={isLoading} />
          </AppCard>

          <View style={[styles.registerRow, {marginTop: spacing.xl}]}>
            <Text style={[textStyles.body2, {color: colors.textSecondary}]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[textStyles.body2, {color: colors.primary, fontWeight: '600'}]}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  inner: {flex: 1, justifyContent: 'center'},
  logoWrap: {alignItems: 'center'},
  tabRow: {flexDirection: 'row', padding: 3},
  tab: {flex: 1, paddingVertical: 8, alignItems: 'center'},
  errorBanner: {padding: 10},
  forgotBtn: {alignSelf: 'flex-end'},
  registerRow: {flexDirection: 'row', justifyContent: 'center'},
});

export default LoginScreen;
