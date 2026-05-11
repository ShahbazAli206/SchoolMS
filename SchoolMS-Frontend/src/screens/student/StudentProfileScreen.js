import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {authAPI} from '../../services/authService';
import {logoutUser, updateUser} from '../../redux/slices/authSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LogoutModal from '../../components/common/LogoutModal';

const ROLE_COLORS = {
  admin:   '#e74c3c',
  teacher: '#2980b9',
  student: '#27ae60',
  parent:  '#8e44ad',
  staff:   '#e67e22',
};

const initials = name =>
  name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'U';

const StudentProfileScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, isDark, toggleTheme} = useTheme();
  const {user} = useSelector(s => s.auth);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const roleColor = ROLE_COLORS[user?.role] || colors.primary;

  const handleUpdateProfile = async () => {
    if (!form.name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.updateProfile({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      });

      dispatch(updateUser(result.data.user));
      setShowEditForm(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      Alert.alert('Validation', 'All fields are required');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      Alert.alert('Validation', 'Passwords do not match');
      return;
    }

    setPwLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      Alert.alert('Success', 'Password changed successfully');
      setPwForm({currentPassword: '', newPassword: '', confirmPassword: ''});
      setShowPwForm(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => setShowLogout(true);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.base, paddingBottom: 60}}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, {backgroundColor: roleColor}]}>
            <Text style={styles.avatarText}>{initials(user?.name)}</Text>
          </View>
          <Text style={[textStyles.h4, {color: colors.textPrimary, marginTop: spacing.sm}]}>
            {user?.name || 'Student'}
          </Text>
          <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
            {user?.role?.toUpperCase() || 'STUDENT'}
          </Text>
        </View>

        {/* Profile Info */}
        <View style={[styles.section, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md}]}>
          <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Profile Information</Text>

          <View style={styles.infoRow}>
            <Text style={[textStyles.caption, {color: colors.textSecondary, width: 80}]}>Name</Text>
            <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>{user?.name || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[textStyles.caption, {color: colors.textSecondary, width: 80}]}>Email</Text>
            <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>{user?.email || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[textStyles.caption, {color: colors.textSecondary, width: 80}]}>Phone</Text>
            <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>{user?.phone || '—'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[textStyles.caption, {color: colors.textSecondary, width: 80}]}>Username</Text>
            <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>{user?.username || '—'}</Text>
          </View>

          <TouchableOpacity
            onPress={() => setShowEditForm(!showEditForm)}
            style={[styles.editBtn, {backgroundColor: colors.primary, borderRadius: borderRadius.md}]}>
            <Text style={[textStyles.body2, {color: colors.white}]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Form */}
        {showEditForm && (
          <View style={[styles.section, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md}]}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Edit Profile</Text>

            <AppInput
              label="Full Name *"
              value={form.name}
              onChangeText={v => setForm({...form, name: v})}
              placeholder="Enter your full name"
            />

            <AppInput
              label="Email"
              value={form.email}
              onChangeText={v => setForm({...form, email: v})}
              placeholder="Enter your email"
              keyboardType="email-address"
            />

            <AppInput
              label="Phone"
              value={form.phone}
              onChangeText={v => setForm({...form, phone: v})}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />

            <View style={styles.buttonRow}>
              <AppButton
                title="Cancel"
                onPress={() => setShowEditForm(false)}
                style={{flex: 1, marginRight: spacing.sm}}
                variant="outline"
              />
              <AppButton
                title="Save"
                onPress={handleUpdateProfile}
                loading={loading}
                style={{flex: 1, marginLeft: spacing.sm}}
              />
            </View>
          </View>
        )}

        {/* Password Change */}
        <View style={[styles.section, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md}]}>
          <TouchableOpacity
            onPress={() => setShowPwForm(!showPwForm)}
            style={[styles.pwToggle, {borderColor: colors.border, borderRadius: borderRadius.md}]}>
            <Text style={[textStyles.body2, {color: colors.textPrimary}]}>Change Password</Text>
            <Text style={[textStyles.body1, {color: colors.primary}]}>{showPwForm ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showPwForm && (
            <View style={{marginTop: spacing.md}}>
              <AppInput
                label="Current Password"
                value={pwForm.currentPassword}
                onChangeText={v => setPwForm({...pwForm, currentPassword: v})}
                placeholder="Enter current password"
                secureTextEntry
              />

              <AppInput
                label="New Password"
                value={pwForm.newPassword}
                onChangeText={v => setPwForm({...pwForm, newPassword: v})}
                placeholder="Enter new password"
                secureTextEntry
              />

              <AppInput
                label="Confirm New Password"
                value={pwForm.confirmPassword}
                onChangeText={v => setPwForm({...pwForm, confirmPassword: v})}
                placeholder="Confirm new password"
                secureTextEntry
              />

              <AppButton
                title="Change Password"
                onPress={handleChangePassword}
                loading={pwLoading}
                style={{marginTop: spacing.sm}}
              />
            </View>
          )}
        </View>

        {/* Dark Mode */}
        <View style={[styles.settingRow, {backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm}]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text style={{fontSize: 20}}>{isDark ? '🌙' : '☀️'}</Text>
            <View>
              <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]}>Dark Mode</Text>
              <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{isDark ? 'Dark theme active' : 'Light theme active'}</Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{false: colors.border, true: '#6C5CE7'}}
            thumbColor="#fff"
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, {backgroundColor: colors.errorFaded, borderRadius: borderRadius.md}]}>
          <Text style={[textStyles.body2, {color: colors.error, fontWeight: '600'}]}>🚪  Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={() => { setShowLogout(false); dispatch(logoutUser()); }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  avatarSection: {alignItems: 'center', marginBottom: 16},
  avatar: {width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#fff', fontWeight: '700', fontSize: 28},
  section: {marginBottom: 12},
  infoRow: {flexDirection: 'row', marginBottom: 8},
  editBtn: {paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 8},
  buttonRow: {flexDirection: 'row', marginTop: 12},
  pwToggle: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderWidth: 1},
  settingRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  logoutBtn: {padding: 12, alignItems: 'center'},
});

export default StudentProfileScreen;