import React, {useState, useRef} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';
import {authAPI} from '../../services/authService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import {getErrorMessage} from '../../utils/errorHandler';
import {validators} from '../../utils/validators';

const STEP = {EMAIL: 1, OTP: 2, RESET: 3, DONE: 4};
const OTP_LENGTH = 6;

const ForgotPasswordScreen = ({navigation}) => {
  const {colors, spacing, textStyles, borderRadius} = useTheme();

  const [step, setStep] = useState(STEP.EMAIL);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef([]);

  // ── Step 1: Send OTP to email ────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!validators.email(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setStep(STEP.OTP);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  const handleOtpChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError('');
    if (cleaned && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    if (cleaned && index === OTP_LENGTH - 1 && newOtp.every(d => d)) handleVerifyOTP(newOtp.join(''));
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOTP({identifier: email, otp: otpCode, purpose: 'forgot_password'});
      setStep(STEP.RESET);
    } catch (err) {
      setOtpError(getErrorMessage(err));
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset password ───────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!validators.minLength(newPassword, 8)) {
      setPassError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match');
      return;
    }
    setPassError('');
    setLoading(true);
    try {
      await authAPI.resetPassword({email, otp: otp.join(''), newPassword});
      setStep(STEP.DONE);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {

      // ── Step 1: Email input ─────────────────────────────────────────────
      case STEP.EMAIL:
        return (
          <>
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.full}]}>
                <Text style={{fontSize: 36}}>🔑</Text>
              </View>
              <Text style={[textStyles.h3, {color: colors.textPrimary, marginTop: spacing.md}]}>
                Forgot Password?
              </Text>
              <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
                Enter your registered email and we'll send a reset OTP.
              </Text>
            </View>

            <AppCard style={{marginTop: spacing.xl}}>
              <AppInput
                label="Registered Email"
                value={email}
                onChangeText={v => {setEmail(v); setEmailError('');}}
                placeholder="your@email.com"
                keyboardType="email-address"
                error={emailError}
              />
              <AppButton title="Send Reset OTP" onPress={handleSendOTP} loading={loading} />
            </AppCard>
          </>
        );

      // ── Step 2: OTP verification ────────────────────────────────────────
      case STEP.OTP:
        return (
          <>
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.full}]}>
                <Text style={{fontSize: 36}}>📧</Text>
              </View>
              <Text style={[textStyles.h3, {color: colors.textPrimary, marginTop: spacing.md}]}>
                Check Your Email
              </Text>
              <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
                OTP sent to{' '}
                <Text style={{color: colors.primary, fontWeight: '600'}}>
                  {email.replace(/(.{2}).+(@.+)/, '$1****$2')}
                </Text>
              </Text>
            </View>

            <AppCard style={{marginTop: spacing.xl}}>
              <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 10, textAlign: 'center'}]}>
                Enter 6-digit OTP
              </Text>
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={r => (otpRefs.current[idx] = r)}
                    style={[
                      styles.otpBox,
                      {
                        borderRadius: borderRadius.md,
                        borderColor: otpError ? colors.error : digit ? colors.primary : colors.border,
                        backgroundColor: digit ? colors.primaryFaded : colors.inputBg,
                        color: colors.textPrimary,
                      },
                    ]}
                    value={digit}
                    onChangeText={t => handleOtpChange(t, idx)}
                    onKeyPress={e => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    caretHidden
                  />
                ))}
              </View>
              {otpError ? (
                <Text style={[textStyles.body2, {color: colors.error, textAlign: 'center', marginTop: 6}]}>
                  {otpError}
                </Text>
              ) : null}

              <AppButton
                title="Verify OTP"
                onPress={() => handleVerifyOTP()}
                loading={loading}
                style={{marginTop: spacing.lg}}
                disabled={otp.some(d => !d)}
              />

              <TouchableOpacity
                onPress={() => {setStep(STEP.EMAIL); setOtp(Array(OTP_LENGTH).fill(''));}}
                style={{alignItems: 'center', marginTop: spacing.md}}>
                <Text style={[textStyles.label, {color: colors.primary}]}>← Change Email</Text>
              </TouchableOpacity>
            </AppCard>
          </>
        );

      // ── Step 3: New password ────────────────────────────────────────────
      case STEP.RESET:
        return (
          <>
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, {backgroundColor: colors.successFaded, borderRadius: borderRadius.full}]}>
                <Text style={{fontSize: 36}}>🔒</Text>
              </View>
              <Text style={[textStyles.h3, {color: colors.textPrimary, marginTop: spacing.md}]}>
                Set New Password
              </Text>
              <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
                Choose a strong password for your account.
              </Text>
            </View>

            <AppCard style={{marginTop: spacing.xl}}>
              <AppInput
                label="New Password"
                value={newPassword}
                onChangeText={v => {setNewPassword(v); setPassError('');}}
                placeholder="Minimum 8 characters"
                secureTextEntry
                error={passError}
              />
              <AppInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={v => {setConfirmPassword(v); setPassError('');}}
                placeholder="Re-enter new password"
                secureTextEntry
                error={passError ? ' ' : ''}
              />
              <AppButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
                style={{marginTop: spacing.sm}}
              />
            </AppCard>
          </>
        );

      // ── Step 4: Success ─────────────────────────────────────────────────
      case STEP.DONE:
        return (
          <View style={styles.iconWrap}>
            <View style={[styles.iconCircle, {backgroundColor: colors.successFaded, borderRadius: borderRadius.full}]}>
              <Text style={{fontSize: 48}}>✅</Text>
            </View>
            <Text style={[textStyles.h3, {color: colors.textPrimary, marginTop: spacing.md}]}>
              Password Reset!
            </Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
              Your password has been reset successfully. Please login with your new password.
            </Text>
            <AppButton
              title="Back to Login"
              onPress={() => navigation.navigate('Login')}
              style={{marginTop: spacing['2xl']}}
            />
          </View>
        );
    }
  };

  // Progress indicator
  const steps = ['Email', 'OTP', 'Password', 'Done'];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing['2xl']}]}
          showsVerticalScrollIndicator={false}>

          {/* Back button */}
          {step < STEP.DONE && (
            <TouchableOpacity onPress={() => step === STEP.EMAIL ? navigation.goBack() : setStep(s => s - 1)}
              style={{marginBottom: spacing.xl}}>
              <Text style={[textStyles.body1, {color: colors.primary}]}>← Back</Text>
            </TouchableOpacity>
          )}

          {/* Step indicator */}
          <View style={[styles.stepRow, {marginBottom: spacing.xl}]}>
            {steps.map((label, idx) => {
              const s = idx + 1;
              const done = step > s;
              const active = step === s;
              return (
                <React.Fragment key={label}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          borderRadius: borderRadius.full,
                          backgroundColor: done || active ? colors.primary : colors.inputBg,
                          borderColor: done || active ? colors.primary : colors.border,
                          borderWidth: 1.5,
                        },
                      ]}>
                      <Text style={[textStyles.caption, {color: done || active ? colors.white : colors.textTertiary, fontWeight: '700'}]}>
                        {done ? '✓' : s}
                      </Text>
                    </View>
                    <Text style={[textStyles.caption, {color: active ? colors.primary : colors.textTertiary, marginTop: 4}]}>
                      {label}
                    </Text>
                  </View>
                  {idx < steps.length - 1 && (
                    <View style={[styles.stepLine, {backgroundColor: step > s ? colors.primary : colors.border}]} />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scroll: {},
  iconWrap: {alignItems: 'center'},
  iconCircle: {width: 80, height: 80, alignItems: 'center', justifyContent: 'center'},
  otpRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 6},
  otpBox: {width: 44, height: 54, borderWidth: 1.5, fontSize: 20, fontWeight: '700'},
  stepRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  stepItem: {alignItems: 'center'},
  stepCircle: {width: 28, height: 28, alignItems: 'center', justifyContent: 'center'},
  stepLine: {flex: 1, height: 2, marginHorizontal: 4, marginBottom: 18},
});

export default ForgotPasswordScreen;
