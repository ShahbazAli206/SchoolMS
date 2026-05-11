import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {adminSendThunk, clearNotifError} from '../../redux/slices/notificationSlice';

const TYPES = ['general', 'announcement', 'assignment', 'fee', 'attendance', 'marks'];
const TARGETS = [
  {key: 'all',   label: 'All Users'},
  {key: 'role',  label: 'By Role'},
  {key: 'class', label: 'By Class'},
  {key: 'user',  label: 'By User ID'},
];
const ROLES = ['admin', 'teacher', 'student', 'parent'];

const Chip = ({label, selected, onPress, colors, textStyles}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      {
        backgroundColor: selected ? colors.primary : colors.surface,
        borderColor: selected ? colors.primary : colors.border,
      },
    ]}>
    <Text style={[textStyles.caption, {color: selected ? colors.white : colors.textSecondary, fontWeight: selected ? '600' : '400'}]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AdminSendNotificationScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {actionLoading, error} = useSelector(s => s.notifications);

  const [title, setTitle]   = useState('');
  const [body, setBody]     = useState('');
  const [type, setType]     = useState('general');
  const [target, setTarget] = useState('all');
  const [role, setRole]     = useState('student');
  const [classId, setClassId] = useState('');
  const [userId, setUserId]   = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{text: 'OK', onPress: () => dispatch(clearNotifError())}]);
    }
  }, [error, dispatch]);

  const handleSend = () => {
    if (!title.trim()) { Alert.alert('Validation', 'Title is required'); return; }
    if (!body.trim())  { Alert.alert('Validation', 'Message body is required'); return; }
    if (target === 'class' && !classId.trim()) { Alert.alert('Validation', 'Class ID is required'); return; }
    if (target === 'user'  && !userId.trim())  { Alert.alert('Validation', 'User ID is required'); return; }

    const payload = {title: title.trim(), body: body.trim(), type, target};
    if (target === 'role')  payload.role    = role;
    if (target === 'class') payload.classId = Number(classId);
    if (target === 'user')  payload.userId  = Number(userId);

    dispatch(adminSendThunk(payload)).unwrap()
      .then(() => {
        Alert.alert('Sent', 'Notification sent successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      })
      .catch(() => {});
  };

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[textStyles.body1, {color: colors.white}]}>{'← '}</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white}]}>Send Notification</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.base, paddingBottom: 40}}>
        {/* Title */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginBottom: 6}]}>Title *</Text>
        <TextInput
          style={[styles.input, inputStyle, {color: colors.textPrimary}]}
          value={title}
          onChangeText={setTitle}
          placeholder="Notification title"
          placeholderTextColor={colors.textSecondary}
          maxLength={100}
        />

        {/* Body */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>Message *</Text>
        <TextInput
          style={[styles.input, inputStyle, styles.textArea, {color: colors.textPrimary}]}
          value={body}
          onChangeText={setBody}
          placeholder="Notification message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />

        {/* Type */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>Type</Text>
        <View style={styles.chips}>
          {TYPES.map(t => (
            <Chip key={t} label={t} selected={type === t} onPress={() => setType(t)} colors={colors} textStyles={textStyles} />
          ))}
        </View>

        {/* Target */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>Send To</Text>
        <View style={styles.chips}>
          {TARGETS.map(tg => (
            <Chip key={tg.key} label={tg.label} selected={target === tg.key} onPress={() => setTarget(tg.key)} colors={colors} textStyles={textStyles} />
          ))}
        </View>

        {/* Role picker */}
        {target === 'role' && (
          <>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>Role</Text>
            <View style={styles.chips}>
              {ROLES.map(r => (
                <Chip key={r} label={r} selected={role === r} onPress={() => setRole(r)} colors={colors} textStyles={textStyles} />
              ))}
            </View>
          </>
        )}

        {/* Class ID input */}
        {target === 'class' && (
          <>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>Class ID *</Text>
            <TextInput
              style={[styles.input, inputStyle, {color: colors.textPrimary}]}
              value={classId}
              onChangeText={setClassId}
              placeholder="Enter class ID"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </>
        )}

        {/* User ID input */}
        {target === 'user' && (
          <>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>User ID *</Text>
            <TextInput
              style={[styles.input, inputStyle, {color: colors.textPrimary}]}
              value={userId}
              onChangeText={setUserId}
              placeholder="Enter user ID"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </>
        )}

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={actionLoading}
          style={[
            styles.sendBtn,
            {backgroundColor: actionLoading ? colors.border : colors.primary, borderRadius: borderRadius.md, marginTop: spacing.xl},
          ]}>
          {actionLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[textStyles.body1, {color: colors.white, fontWeight: '600'}]}>Send Notification</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header:    {flexDirection: 'row', alignItems: 'center'},
  backBtn:   {marginRight: 8},
  input:     {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14},
  textArea:  {height: 100},
  chips:     {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip:      {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20},
  sendBtn:   {paddingVertical: 14, alignItems: 'center'},
});

export default AdminSendNotificationScreen;
