import React, {useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  Modal, FlatList,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {loginUser, clearError} from '../../redux/slices/authSlice';
import {validateLoginForm} from '../../utils/validators';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';

const LOGIN_TYPES = ['email', 'phone', 'username'];

// ─────────────────────────────────────────────────────────────────────────────
// DEV ONLY — remove this whole block (DEV_USERS, DEV_PASSWORD, the picker
// modal in JSX, and the "Quick login" button) before production release.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_PASSWORD = 'School@123';
const DEV_USERS = [
  {role: 'Admin',   name: 'Sarah Ahmed',       email: 'admin@schoolms.com'},
  {role: 'Teacher', name: 'Mr. Ali Hassan',    email: 'ali.hassan@schoolms.com'},
  {role: 'Teacher', name: 'Ms. Ayesha Khan',   email: 'ayesha.khan@schoolms.com'},
  {role: 'Teacher', name: 'Mr. Bilal Raza',    email: 'bilal.raza@schoolms.com'},
  {role: 'Student', name: 'Zain Malik',        email: 'zain@schoolms.com'},
  {role: 'Student', name: 'Sara Iqbal',        email: 'sara@schoolms.com'},
  {role: 'Student', name: 'Omar Sheikh',       email: 'omar@schoolms.com'},
  {role: 'Student', name: 'Fatima Butt',       email: 'fatima@schoolms.com'},
  {role: 'Student', name: 'Hamza Javed',       email: 'hamza@schoolms.com'},
  {role: 'Parent',  name: 'Mr. Tariq Malik',   email: 'tariq@schoolms.com'},
  {role: 'Parent',  name: 'Mrs. Nadia Iqbal',  email: 'nadia@schoolms.com'},
  {role: 'Parent',  name: 'Mr. Kamran Sheikh', email: 'kamran@schoolms.com'},
];
const ROLE_COLORS = {
  Admin:   '#A29BFE',
  Teacher: '#6C5CE7',
  Student: '#00CEC9',
  Parent:  '#FF7675',
};

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {isLoading, error} = useSelector(state => state.auth);
  const {colors, spacing, textStyles, borderRadius} = useTheme();

  const [loginType, setLoginType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // DEV ONLY — remove with the rest of the dev block before production
  const [showDevPicker, setShowDevPicker] = useState(false);
  const pickDevUser = u => {
    setLoginType('email');
    setIdentifier(u.email);
    setPassword(DEV_PASSWORD);
    setFieldErrors({});
    setShowDevPicker(false);
  };

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

          {/* DEV ONLY — remove this block before production */}
          <TouchableOpacity
            onPress={() => setShowDevPicker(true)}
            style={[styles.devBtn, {borderColor: colors.warning, marginBottom: spacing.md}]}>
            <Text style={[textStyles.label, {color: colors.warning}]}>
              🛠️  DEV: Quick login (pick a user)
            </Text>
          </TouchableOpacity>

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

      {/* DEV ONLY — remove this Modal before production */}
      <Modal
        visible={showDevPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDevPicker(false)}>
        <TouchableOpacity
          style={styles.devOverlay}
          activeOpacity={1}
          onPress={() => setShowDevPicker(false)}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[styles.devSheet, {backgroundColor: colors.surface, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl}]}>
            <View style={styles.devHandle} />
            <Text style={[textStyles.h4, {color: colors.textPrimary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm}]}>
              Pick a user
            </Text>
            <Text style={[textStyles.caption, {color: colors.textSecondary, paddingHorizontal: spacing.lg, marginBottom: spacing.md}]}>
              Autofills email + password ({DEV_PASSWORD})
            </Text>
            <FlatList
              data={DEV_USERS}
              keyExtractor={item => item.email}
              contentContainerStyle={{paddingBottom: spacing['2xl']}}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => pickDevUser(item)}
                  style={[styles.devRow, {borderBottomColor: colors.border, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm}]}>
                  <View style={[styles.devRoleDot, {backgroundColor: ROLE_COLORS[item.role] || colors.primary}]}>
                    <Text style={{color: '#fff', fontSize: 10, fontWeight: '800'}}>{item.role[0]}</Text>
                  </View>
                  <View style={{flex: 1, marginLeft: spacing.md}}>
                    <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]}>{item.name}</Text>
                    <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
                      {item.role} · {item.email}
                    </Text>
                  </View>
                  <Text style={{color: colors.primary, fontSize: 22, fontWeight: '300'}}>›</Text>
                </TouchableOpacity>
              )}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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

  // DEV ONLY — remove these styles with the rest of the dev block
  devBtn: {borderWidth: 1, borderStyle: 'dashed', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center'},
  devOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end'},
  devSheet: {maxHeight: '75%', paddingTop: 10},
  devHandle: {alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', marginBottom: 12},
  devRow: {flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1},
  devRoleDot: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
});

export default LoginScreen;
