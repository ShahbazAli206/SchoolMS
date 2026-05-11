import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, Switch,
  Alert, ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {logoutUser} from '../../redux/slices/authSlice';
import {authAPI} from '../../services/authService';
import PageHeader from '../../components/common/PageHeader';
import LogoutModal from '../../components/common/LogoutModal';

const ROLE_META = {
  admin:   {color: '#A29BFE', bg: 'rgba(162,155,254,0.15)', label: 'Administrator', icon: '👑'},
  teacher: {color: '#81ECEC', bg: 'rgba(129,236,236,0.15)', label: 'Teacher',       icon: '👨‍🏫'},
  student: {color: '#55EFC4', bg: 'rgba(85,239,196,0.15)',  label: 'Student',       icon: '🎓'},
  parent:  {color: '#FDCB6E', bg: 'rgba(253,203,110,0.15)',label: 'Parent',        icon: '👨‍👩‍👧'},
  staff:   {color: '#B2BEC3', bg: 'rgba(178,190,195,0.15)',label: 'Staff',         icon: '🏫'},
};

const initials = name =>
  name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'U';

const GlassCard = ({children, style}) => {
  const {colors, borderRadius} = useTheme();
  return (
    <View style={[
      styles.glassCard,
      {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderColor: colors.border,
      },
      style,
    ]}>
      {children}
    </View>
  );
};

const InfoRow = ({icon, label, value, colors}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoIcon}>{icon}</Text>
    <View style={{flex: 1}}>
      <Text style={[styles.infoLabel, {color: colors.textTertiary}]}>{label}</Text>
      <Text style={[styles.infoValue, {color: colors.textPrimary}]}>{value || '—'}</Text>
    </View>
  </View>
);

const ProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles, isDark, toggleTheme} = useTheme();
  const {user} = useSelector(s => s.auth);

  const handleBack = () => {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else navigation?.getParent?.()?.navigate?.('Home');
  };

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw,  setCurrentPw] = useState('');
  const [newPw,      setNewPw]     = useState('');
  const [confirmPw,  setConfirmPw] = useState('');
  const [pwLoading,  setPwLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const meta = ROLE_META[user?.role] || ROLE_META.staff;

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert('Validation', 'All fields are required'); return; }
    if (newPw.length < 6) { Alert.alert('Validation', 'New password must be at least 6 characters'); return; }
    if (newPw !== confirmPw) { Alert.alert('Validation', 'Passwords do not match'); return; }
    setPwLoading(true);
    try {
      await authAPI.changePassword({currentPassword: currentPw, newPassword: newPw});
      Alert.alert('Success', 'Password changed successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPwForm(false);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <PageHeader title="Profile" showBack onBackPress={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingHorizontal: spacing.base, paddingBottom: 80}]}
        showsVerticalScrollIndicator={false}>

        {/* ── AVATAR CARD ── */}
        <View style={[styles.avatarCard, {backgroundColor: colors.primary, borderRadius: borderRadius.xl}]}>
          <View style={[styles.avatarRing, {borderColor: meta.color}]}>
            <View style={[styles.avatar, {backgroundColor: meta.bg}]}>
              <Text style={styles.avatarIcon}>{meta.icon}</Text>
              <Text style={[styles.avatarInitials, {color: meta.color}]}>{initials(user?.name)}</Text>
            </View>
          </View>
          <Text style={styles.avatarName}>{user?.name || 'User'}</Text>
          <View style={[styles.roleBadge, {backgroundColor: meta.bg, borderColor: meta.color}]}>
            <Text style={[styles.roleBadgeText, {color: meta.color}]}>{meta.label}</Text>
          </View>
        </View>

        {/* ── ACCOUNT INFO ── */}
        <GlassCard style={{marginTop: spacing.md}}>
          <Text style={[styles.cardTitle, {color: colors.textSecondary}]}>Account Info</Text>
          <InfoRow icon="✉️" label="Email"    value={user?.email}    colors={colors} />
          <InfoRow icon="📱" label="Phone"    value={user?.phone}    colors={colors} />
          <InfoRow icon="👤" label="Username" value={user?.username} colors={colors} />
        </GlassCard>

        {/* ── DARK MODE ── */}
        <GlassCard style={{marginTop: spacing.sm}}>
          <View style={styles.settingRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={{fontSize: 20}}>{isDark ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>Dark Mode</Text>
                <Text style={[styles.settingHint, {color: colors.textTertiary}]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{false: colors.border, true: '#6C5CE7'}}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>

        {/* ── CHANGE PASSWORD ── */}
        <GlassCard style={{marginTop: spacing.sm}}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowPwForm(p => !p)}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <Text style={{fontSize: 20}}>🔐</Text>
              <Text style={[styles.settingLabel, {color: colors.textPrimary}]}>Change Password</Text>
            </View>
            <Text style={[styles.chevron, {color: colors.textTertiary}]}>{showPwForm ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showPwForm && (
            <View style={{marginTop: 14}}>
              {[
                {label: 'Current password', value: currentPw, set: setCurrentPw},
                {label: 'New password',     value: newPw,     set: setNewPw},
                {label: 'Confirm password', value: confirmPw, set: setConfirmPw},
              ].map(({label, value, set}) => (
                <View key={label} style={{marginBottom: 10}}>
                  <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>{label}</Text>
                  <TextInput
                    style={[styles.input, {backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary, borderRadius: borderRadius.lg}]}
                    value={value}
                    onChangeText={set}
                    secureTextEntry
                    placeholder={label}
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={pwLoading}
                style={[styles.updateBtn, {backgroundColor: '#6C5CE7', borderRadius: borderRadius.lg}]}>
                {pwLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.updateBtnText}>Update Password</Text>}
              </TouchableOpacity>
            </View>
          )}
        </GlassCard>

        {/* ── LOGOUT ── */}
        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          style={[styles.logoutBtn, {borderRadius: borderRadius.xl, borderColor: '#A29BFE', backgroundColor: 'rgba(108,92,231,0.08)'}]}>
          <Text style={{fontSize: 20}}>🚪</Text>
          <Text style={[styles.logoutText, {color: '#A29BFE'}]}>Sign Out</Text>
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
  container:    {flex: 1},
  header:       {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 20, overflow: 'hidden'},
  backBtn:      {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  backChevron:  {color: '#FFFFFF', fontSize: 30, fontWeight: '300', marginTop: -3},
  headerTitle:  {flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '800', textAlign: 'center'},
  heroBubble:   {position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(162,155,254,0.12)', top: -20, right: -10},
  scroll:       {paddingTop: 0},

  avatarCard:   {alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, marginTop: 0},
  avatarRing:   {width: 96, height: 96, borderRadius: 48, borderWidth: 3, alignItems: 'center', justifyContent: 'center'},
  avatar:       {width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center'},
  avatarIcon:   {fontSize: 20, position: 'absolute', top: 8, right: 10},
  avatarInitials:{fontSize: 28, fontWeight: '800', marginTop: 10},
  avatarName:   {color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 12},
  roleBadge:    {marginTop: 6, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20, borderWidth: 1},
  roleBadgeText:{fontSize: 11, fontWeight: '700', textTransform: 'uppercase'},

  glassCard:    {padding: 16, borderWidth: 1, marginHorizontal: 0},

  cardTitle:    {fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12},

  infoRow:      {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12,
                 borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.06)'},
  infoIcon:     {fontSize: 18, width: 26, textAlign: 'center'},
  infoLabel:    {fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5},
  infoValue:    {fontSize: 14, fontWeight: '600', marginTop: 1},

  settingRow:   {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  settingLabel: {fontSize: 14, fontWeight: '600'},
  settingHint:  {fontSize: 11, marginTop: 1},
  chevron:      {fontSize: 12},

  inputLabel:   {fontSize: 12, fontWeight: '600', marginBottom: 4},
  input:        {borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14},
  updateBtn:    {paddingVertical: 12, alignItems: 'center', marginTop: 4},
  updateBtnText:{color: '#fff', fontSize: 14, fontWeight: '700'},

  logoutBtn:    {flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 gap: 10, paddingVertical: 14, marginTop: 16, borderWidth: 1.5},
  logoutText:   {fontSize: 15, fontWeight: '700'},

});

export default ProfileScreen;
