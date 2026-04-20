import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity, Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {updateUserThunk, assignRoleThunk, toggleStatusThunk, clearSelectedUser} from '../../redux/slices/adminSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import AppHeader from '../../components/common/AppHeader';

const ROLES = [
  {label: 'Student', value: 'student', icon: '🎓'},
  {label: 'Teacher', value: 'teacher', icon: '👨‍🏫'},
  {label: 'Parent', value: 'parent', icon: '👨‍👩‍👧'},
  {label: 'Staff', value: 'staff', icon: '🏫'},
  {label: 'Admin', value: 'admin', icon: '⚙️'},
];

const EditUserScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {selectedUser, actionLoading} = useSelector(s => s.admin);
  const currentAdminId = useSelector(s => s.auth.user?.id);

  const user = selectedUser;

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    username: user?.username ?? '',
    role: user?.role ?? 'student',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Pre-fill from selectedUser if coming via navigation without explicit set
    if (user) {
      setForm({
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        username: user.username ?? '',
        role: user.role ?? 'student',
      });
    }
  }, [user]);

  // Cleanup when unmounting
  useEffect(() => () => dispatch(clearSelectedUser()), []);

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <AppHeader title="Edit User" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={[textStyles.body1, {color: colors.textSecondary}]}>User not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const set = (key, val) => {
    setForm(p => ({...p, [key]: val}));
    if (errors[key]) setErrors(p => ({...p, [key]: ''}));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Role change if different
    if (form.role !== user.role) {
      if (user.id === currentAdminId) {
        Alert.alert('Error', 'You cannot change your own role.');
        return;
      }
      const roleResult = await dispatch(assignRoleThunk({userId: user.id, role: form.role}));
      if (!assignRoleThunk.fulfilled.match(roleResult)) {
        Alert.alert('Error', roleResult.payload ?? 'Failed to assign role');
        return;
      }
    }

    const result = await dispatch(updateUserThunk({
      id: user.id,
      data: {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        username: form.username.trim() || undefined,
        role: form.role,
      },
    }));

    if (updateUserThunk.fulfilled.match(result)) {
      Alert.alert('Success', 'User updated successfully.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } else {
      Alert.alert('Error', result.payload ?? 'Failed to update user');
    }
  };

  const handleToggleStatus = () => {
    if (user.id === currentAdminId) {
      Alert.alert('Error', 'You cannot deactivate your own account.');
      return;
    }
    const action = user.is_active ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Account`,
      `Are you sure you want to ${action} ${user.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            await dispatch(toggleStatusThunk(user.id));
            navigation.goBack();
          },
        },
      ],
    );
  };

  const isSelf = user.id === currentAdminId;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <AppHeader
        title="Edit User"
        subtitle={user.name}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing.base, paddingBottom: 40}]}
          showsVerticalScrollIndicator={false}>

          {/* Status banner */}
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: user.is_active ? colors.successFaded : colors.errorFaded,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                marginBottom: spacing.md,
                borderLeftWidth: 4,
                borderLeftColor: user.is_active ? colors.success : colors.error,
              },
            ]}>
            <Text style={[textStyles.body2, {color: user.is_active ? colors.success : colors.error, fontWeight: '600'}]}>
              {user.is_active ? '✅ Active Account' : '❌ Account Deactivated'}
            </Text>
            {!isSelf && (
              <TouchableOpacity onPress={handleToggleStatus} style={{marginTop: 4}}>
                <Text style={[textStyles.caption, {color: user.is_active ? colors.error : colors.success, fontWeight: '600'}]}>
                  Tap to {user.is_active ? 'deactivate' : 'activate'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Basic info */}
          <AppCard style={{marginBottom: spacing.md}}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Basic Information</Text>
            <AppInput label="Full Name *" value={form.name} onChangeText={v => set('name', v)}
              placeholder="Full name" autoCapitalize="words" error={errors.name} />
            <AppInput label="Email" value={form.email} onChangeText={v => set('email', v)}
              placeholder="email@example.com" keyboardType="email-address" error={errors.email} />
            <AppInput label="Phone" value={form.phone} onChangeText={v => set('phone', v)}
              placeholder="+92 300 0000000" keyboardType="phone-pad" />
            <AppInput label="Username" value={form.username} onChangeText={v => set('username', v)}
              placeholder="Username" />
          </AppCard>

          {/* Role assignment */}
          {!isSelf && (
            <AppCard style={{marginBottom: spacing.md}}>
              <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Role Assignment</Text>
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
                      <Text style={{fontSize: 18, marginBottom: 3}}>{r.icon}</Text>
                      <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary, fontWeight: active ? '700' : '400'}]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {form.role !== user.role && (
                <View style={[styles.roleWarning, {backgroundColor: colors.warningFaded, borderRadius: borderRadius.sm, marginTop: 8}]}>
                  <Text style={[textStyles.caption, {color: colors.warningDark}]}>
                    ⚠️ Role will change from {user.role} → {form.role}
                  </Text>
                </View>
              )}
            </AppCard>
          )}

          {/* Account meta */}
          <AppCard style={{marginBottom: spacing.md}}>
            <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>Account Info</Text>
            <View style={styles.metaRow}>
              <Text style={[textStyles.label, {color: colors.textSecondary, flex: 1}]}>User ID</Text>
              <Text style={[textStyles.body2, {color: colors.textPrimary}]}>#{user.id}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[textStyles.label, {color: colors.textSecondary, flex: 1}]}>Current Role</Text>
              <Text style={[textStyles.body2, {color: colors.primary, fontWeight: '600'}]}>{user.role?.toUpperCase()}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[textStyles.label, {color: colors.textSecondary, flex: 1}]}>Last Login</Text>
              <Text style={[textStyles.body2, {color: colors.textPrimary}]}>
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
              </Text>
            </View>
          </AppCard>

          <AppButton title="Save Changes" onPress={handleSave} loading={actionLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  scroll: {},
  statusBanner: {},
  roleGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between'},
  roleChip: {width: '30%', alignItems: 'center', paddingVertical: 10},
  roleWarning: {padding: 8},
  metaRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E0E0'},
});

export default EditUserScreen;
