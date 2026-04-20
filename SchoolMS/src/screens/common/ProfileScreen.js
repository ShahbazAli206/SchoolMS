import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';
import {logoutUser} from '../../redux/slices/authSlice';
import {authAPI} from '../../services/authService';

const ROLE_COLORS = {
  admin:   '#e74c3c',
  teacher: '#2980b9',
  student: '#27ae60',
  parent:  '#8e44ad',
  staff:   '#e67e22',
};

const initials = name =>
  name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'U';

const InfoRow = ({label, value, colors, textStyles}) => (
  <View style={styles.infoRow}>
    <Text style={[textStyles.caption, {color: colors.textSecondary, width: 80}]}>{label}</Text>
    <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>{value || '—'}</Text>
  </View>
);

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles, isDark, toggleTheme, shadow} = useTheme();
  const {user} = useSelector(s => s.auth);

  const [showPwForm, setShowPwForm]   = useState(false);
  const [currentPw,  setCurrentPw]   = useState('');
  const [newPw,      setNewPw]       = useState('');
  const [confirmPw,  setConfirmPw]   = useState('');
  const [pwLoading,  setPwLoading]   = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const roleColor = ROLE_COLORS[user?.role] || colors.primary;

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert('Validation', 'All fields are required'); return;
    }
    if (newPw.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters'); return;
    }
    if (newPw !== confirmPw) {
      Alert.alert('Validation', 'Passwords do not match'); return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword({currentPassword: currentPw, newPassword: newPw});
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setShowPwForm(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logoutUser());
    // Navigation will be handled automatically by RootNavigator when isAuthenticated becomes false
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const inputStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: spacing.base + insets.top}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.base, paddingBottom: 60}}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, {backgroundColor: roleColor}]}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <Text style={[textStyles.h4, {color: colors.textPrimary, marginTop: spacing.sm}]}>
            {user?.name || 'User'}
          </Text>
          <View style={[styles.roleBadge, {backgroundColor: roleColor + '20', borderColor: roleColor}]}>
            <Text style={[textStyles.caption, {color: roleColor, fontWeight: '700', textTransform: 'uppercase'}]}>
              {user?.role}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.base}]}>
          <Text style={[textStyles.body2, {color: colors.textSecondary, marginBottom: spacing.sm, fontWeight: '600'}]}>
            Account Info
          </Text>
          <InfoRow label="Email"    value={user?.email}    colors={colors} textStyles={textStyles} />
          <InfoRow label="Phone"    value={user?.phone}    colors={colors} textStyles={textStyles} />
          <InfoRow label="Username" value={user?.username} colors={colors} textStyles={textStyles} />
        </View>

        {/* Dark mode toggle */}
        <View style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.sm}]}>
          <View style={styles.settingRow}>
            <View>
              <Text style={[textStyles.body1, {color: colors.textPrimary}]}>Dark Mode</Text>
              <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
                {isDark ? 'Currently dark theme' : 'Currently light theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: colors.border, true: colors.primary}}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Change password */}
        <View style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.md, marginTop: spacing.sm}]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowPwForm(p => !p)}>
            <Text style={[textStyles.body1, {color: colors.textPrimary}]}>Change Password</Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary}]}>{showPwForm ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPwForm && (
            <View style={{marginTop: spacing.sm}}>
              {[
                {label: 'Current password', value: currentPw, set: setCurrentPw},
                {label: 'New password',     value: newPw,     set: setNewPw},
                {label: 'Confirm password', value: confirmPw, set: setConfirmPw},
              ].map(({label, value, set}) => (
                <View key={label} style={{marginBottom: spacing.sm}}>
                  <Text style={[textStyles.caption, {color: colors.textSecondary, marginBottom: 4}]}>{label}</Text>
                  <TextInput
                    style={[styles.input, inputStyle]}
                    value={value}
                    onChangeText={set}
                    secureTextEntry
                    placeholder={label}
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={pwLoading}
                style={[styles.pwBtn, {backgroundColor: pwLoading ? colors.border : colors.primary, borderRadius: borderRadius.md}]}>
                {pwLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={[textStyles.body2, {color: colors.white, fontWeight: '600'}]}>Update Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, {backgroundColor: colors.error, borderRadius: borderRadius.md, marginTop: spacing.lg}]}>
          <Text style={[textStyles.body1, {color: colors.white, fontWeight: '600'}]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: isDark ? colors.glassBg : 'rgba(255, 255, 255, 0.95)', borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.glassBorder, ...shadow.lg}]}>
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.sm, textAlign: 'center'}]}>
              Confirm Logout
            </Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg}]}>
              Are you sure you want to logout from your account?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={cancelLogout}
                style={[styles.modalBtn, styles.cancelBtn, {backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border}]}>
                <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '600'}]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                style={[styles.modalBtn, styles.logoutConfirmBtn, {backgroundColor: colors.error, borderRadius: borderRadius.lg}]}>
                <Text style={[textStyles.body1, {color: colors.white, fontWeight: '700'}]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     {flex: 1},
  header:        {flexDirection: 'row', alignItems: 'center'},
  avatarSection: {alignItems: 'center', paddingVertical: 24},
  avatar:        {width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center'},
  avatarText:    {color: '#fff', fontSize: 32, fontWeight: '800'},
  roleBadge:     {marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, borderWidth: 1},
  card:          {padding: 16},
  infoRow:       {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e0e0e0'},
  settingRow:    {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  input:         {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14},
  pwBtn:         {paddingVertical: 12, alignItems: 'center', marginTop: 4},
  logoutBtn:     {paddingVertical: 14, alignItems: 'center'},
  modalOverlay:  {flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20},
  modalContent:  {margin: 20, padding: 24, maxWidth: 320, width: '90%', ...{shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, elevation: 10}},
  modalButtons:  {flexDirection: 'row', gap: 12},
  modalBtn:      {flex: 1, paddingVertical: 12, alignItems: 'center'},
  cancelBtn:     {},
  logoutConfirmBtn: {},
});

export default ProfileScreen;
