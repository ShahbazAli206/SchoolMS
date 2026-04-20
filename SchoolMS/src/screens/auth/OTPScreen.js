import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {setCredentials} from '../../redux/slices/authSlice';
import {authAPI} from '../../services/authService';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import {getErrorMessage} from '../../utils/errorHandler';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

const OTPScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();

  // identifier and loginType are passed from LoginScreen
  const {identifier = '', loginType = 'email', purpose = 'login'} = route?.params ?? {};

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Start countdown on mount
  useEffect(() => {
    startCountdown();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    setCanResend(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next box
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (cleaned && index === OTP_LENGTH - 1 && newOtp.every(d => d)) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyOTP({identifier, otp: otpCode});
      const {user, accessToken, refreshToken: rt, sessionExpiresAt} = response.data.data;

      dispatch(setCredentials({user, accessToken, refreshToken: rt, sessionExpiresAt}));
      // RootNavigator will auto-redirect based on role
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      // Clear OTP boxes on error
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }, [otp, identifier]);

  const handleResend = async () => {
    if (!canResend) return;
    setResendLoading(true);
    try {
      await authAPI.resendOTP({identifier});
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      startCountdown();
      Alert.alert('OTP Sent', `A new OTP has been sent to ${identifier}`);
    } catch (err) {
      Alert.alert('Resend Failed', getErrorMessage(err));
    } finally {
      setResendLoading(false);
    }
  };

  const maskedIdentifier =
    identifier.includes('@')
      ? identifier.replace(/(.{2}).+(@.+)/, '$1****$2')
      : identifier.replace(/(\d{3})\d+(\d{2})/, '$1****$2');

  const purposeLabel = {
    login: 'Daily Login Verification',
    new_device: 'New Device Verification',
    forgot_password: 'Password Reset',
  }[purpose] || 'Verification';

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inner, {padding: spacing['2xl']}]}>

          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, {marginBottom: spacing.xl}]}>
            <Text style={[textStyles.body1, {color: colors.primary}]}>← Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={[styles.header, {marginBottom: spacing['2xl']}]}>
            <View style={[styles.iconCircle, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.full}]}>
              <Text style={{fontSize: 36}}>📱</Text>
            </View>
            <Text style={[textStyles.h3, {color: colors.textPrimary, marginTop: spacing.md}]}>
              {purposeLabel}
            </Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
              Enter the 6-digit code sent to
            </Text>
            <Text style={[textStyles.body1, {color: colors.primary, fontWeight: '600', marginTop: 2}]}>
              {maskedIdentifier}
            </Text>
          </View>

          <AppCard>
            {/* OTP Input Boxes */}
            <View style={styles.otpRow}>
              {otp.map((digit, index) => {
                const isActive = digit !== '';
                return (
                  <TextInput
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={[
                      styles.otpBox,
                      {
                        borderRadius: borderRadius.md,
                        borderColor: error
                          ? colors.error
                          : isActive
                          ? colors.primary
                          : colors.border,
                        backgroundColor: isActive ? colors.primaryFaded : colors.inputBg,
                        color: colors.textPrimary,
                        fontSize: 22,
                        fontWeight: '700',
                      },
                    ]}
                    value={digit}
                    onChangeText={text => handleChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                    caretHidden
                  />
                );
              })}
            </View>

            {/* Error */}
            {error ? (
              <Text style={[textStyles.body2, {color: colors.error, textAlign: 'center', marginTop: 8}]}>
                {error}
              </Text>
            ) : null}

            {/* Verify Button */}
            <AppButton
              title="Verify OTP"
              onPress={() => handleVerify()}
              loading={loading}
              style={{marginTop: spacing.lg}}
              disabled={otp.some(d => !d)}
            />

            {/* Resend */}
            <View style={[styles.resendRow, {marginTop: spacing.lg}]}>
              <Text style={[textStyles.body2, {color: colors.textSecondary}]}>
                Didn't receive the code?{' '}
              </Text>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                  <Text style={[textStyles.body2, {color: colors.primary, fontWeight: '600'}]}>
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[textStyles.body2, {color: colors.textTertiary}]}>
                  Resend in {countdown}s
                </Text>
              )}
            </View>
          </AppCard>

          {/* Security note */}
          <Text style={[textStyles.caption, {color: colors.textTertiary, textAlign: 'center', marginTop: spacing.xl}]}>
            🔒 OTP expires in 10 minutes. Do not share it with anyone.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  inner: {flex: 1},
  backBtn: {},
  header: {alignItems: 'center'},
  iconCircle: {width: 80, height: 80, alignItems: 'center', justifyContent: 'center'},
  otpRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    textAlignVertical: 'center',
  },
  resendRow: {flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap'},
});

export default OTPScreen;
