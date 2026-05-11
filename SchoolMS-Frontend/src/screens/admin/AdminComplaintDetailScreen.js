import React, {useState, useCallback} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {adminUpdateComplaintThunk} from '../../redux/slices/complaintSlice';

const STATUS_OPTIONS = ['pending', 'in_review', 'resolved', 'rejected'];
const STATUS_LABEL   = {pending: 'Pending', in_review: 'In Review', resolved: 'Resolved', rejected: 'Rejected'};
const STATUS_COLOR   = {
  pending:   {bg: '#fff3cd', text: '#856404'},
  in_review: {bg: '#cce5ff', text: '#004085'},
  resolved:  {bg: '#d4edda', text: '#155724'},
  rejected:  {bg: '#f8d7da', text: '#721c24'},
};

const AdminComplaintDetailScreen = ({route, navigation}) => {
  const {complaint: initial} = route.params;
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {actionLoading} = useSelector(s => s.complaints);

  const [status,     setStatus]  = useState(initial.status);
  const [adminReply, setReply]   = useState(initial.admin_reply || '');

  const handleUpdate = useCallback(() => {
    if (!adminReply.trim() && (status === 'resolved' || status === 'rejected')) {
      Alert.alert('Required', 'Please provide an admin reply when resolving or rejecting.');
      return;
    }
    dispatch(adminUpdateComplaintThunk({
      id: initial.id,
      data: {status, admin_reply: adminReply.trim() || undefined},
    })).unwrap()
      .then(() => {
        Alert.alert('Updated', 'Complaint updated successfully.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      })
      .catch(err => Alert.alert('Error', err || 'Failed to update'));
  }, [dispatch, initial.id, status, adminReply, navigation]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
          <Text style={[textStyles.body1, {color: colors.white}]}>←</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white}]}>Complaint Detail</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.base, paddingBottom: 50}}>
        {/* Meta */}
        <View style={[styles.metaCard, {backgroundColor: colors.surface, borderRadius: borderRadius.md}]}>
          <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: 4}]}>{initial.title}</Text>
          <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
            From: {initial.parent?.name || 'Unknown'} · {new Date(initial.created_at).toLocaleDateString()}
          </Text>
          {!!initial.student?.user?.name && (
            <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 2}]}>
              Regarding: {initial.student.user.name}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>
          Description
        </Text>
        <View style={[styles.descBox, {backgroundColor: colors.surface, borderRadius: borderRadius.md}]}>
          <Text style={[textStyles.body2, {color: colors.textPrimary}]}>{initial.description}</Text>
        </View>

        {/* Image */}
        {!!initial.image_url && (
          <>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>
              Attached Image
            </Text>
            <Image
              source={{uri: initial.image_url}}
              style={[styles.image, {borderRadius: borderRadius.md}]}
              resizeMode="cover"
            />
          </>
        )}

        {/* Status selector */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>
          Status
        </Text>
        <View style={styles.chips}>
          {STATUS_OPTIONS.map(opt => {
            const sc = STATUS_COLOR[opt];
            const active = status === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setStatus(opt)}
                style={[styles.chip, {
                  backgroundColor: active ? sc.bg : colors.surface,
                  borderColor: active ? sc.text : colors.border,
                  borderWidth: active ? 1.5 : 1,
                }]}>
                <Text style={[textStyles.caption, {color: active ? sc.text : colors.textSecondary, fontWeight: active ? '700' : '400'}]}>
                  {STATUS_LABEL[opt]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Admin reply */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>
          Admin Reply
        </Text>
        <TextInput
          style={[styles.replyInput, {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: borderRadius.md,
            color: colors.textPrimary,
          }]}
          value={adminReply}
          onChangeText={setReply}
          placeholder="Write your reply to the parent..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={1000}
        />

        {/* Submit */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={actionLoading}
          style={[styles.submitBtn, {
            backgroundColor: actionLoading ? colors.border : colors.primary,
            borderRadius: borderRadius.md,
            marginTop: spacing.xl,
          }]}>
          {actionLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[textStyles.body1, {color: colors.white, fontWeight: '600'}]}>Update Complaint</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  {flex: 1},
  header:     {flexDirection: 'row', alignItems: 'center'},
  metaCard:   {padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: {width: 0, height: 2}},
  descBox:    {padding: 14},
  image:      {width: '100%', height: 200},
  chips:      {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip:       {paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20},
  replyInput: {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, minHeight: 100},
  submitBtn:  {paddingVertical: 14, alignItems: 'center'},
});

export default AdminComplaintDetailScreen;
