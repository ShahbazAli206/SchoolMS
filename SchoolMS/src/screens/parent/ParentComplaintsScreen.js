import React, {useEffect, useCallback} from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchMyComplaints, deleteComplaintThunk, clearComplaintError} from '../../redux/slices/complaintSlice';

const STATUS_STYLE = {
  pending:   {bg: '#fff3cd', text: '#856404'},
  in_review: {bg: '#cce5ff', text: '#004085'},
  resolved:  {bg: '#d4edda', text: '#155724'},
  rejected:  {bg: '#f8d7da', text: '#721c24'},
};

const STATUS_LABEL = {
  pending: 'Pending', in_review: 'In Review', resolved: 'Resolved', rejected: 'Rejected',
};

const ComplaintCard = ({item, onDelete, colors, spacing, borderRadius, textStyles}) => {
  const s = STATUS_STYLE[item.status] || STATUS_STYLE.pending;

  return (
    <View style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.md, marginBottom: spacing.sm}]}>
      <View style={styles.row}>
        <Text style={[textStyles.body1, {color: colors.textPrimary, flex: 1, fontWeight: '600'}]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.badge, {backgroundColor: s.bg}]}>
          <Text style={[textStyles.caption, {color: s.text, fontWeight: '700'}]}>{STATUS_LABEL[item.status]}</Text>
        </View>
      </View>

      <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 4}]} numberOfLines={2}>
        {item.description}
      </Text>

      {!!item.admin_reply && (
        <View style={[styles.replyBox, {backgroundColor: colors.background, borderRadius: borderRadius.sm, marginTop: spacing.sm}]}>
          <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '700', marginBottom: 2}]}>Admin Reply</Text>
          <Text style={[textStyles.body2, {color: colors.textPrimary}]}>{item.admin_reply}</Text>
        </View>
      )}

      <View style={[styles.row, {marginTop: spacing.sm}]}>
        <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        {item.status === 'pending' && (
          <TouchableOpacity onPress={() => onDelete(item.id)}>
            <Text style={[textStyles.caption, {color: colors.error, fontWeight: '600'}]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const ParentComplaintsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {myList, loading, error} = useSelector(s => s.complaints);

  const load = useCallback(() => dispatch(fetchMyComplaints({page: 1, limit: 50})), [dispatch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{text: 'OK', onPress: () => dispatch(clearComplaintError())}]);
  }, [error, dispatch]);

  const handleDelete = useCallback(id => {
    Alert.alert('Delete', 'Remove this complaint?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteComplaintThunk(id))},
    ]);
  }, [dispatch]);

  const renderItem = useCallback(({item}) => (
    <ComplaintCard item={item} onDelete={handleDelete}
      colors={colors} spacing={spacing} borderRadius={borderRadius} textStyles={textStyles} />
  ), [handleDelete, colors, spacing, borderRadius, textStyles]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Complaints</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SubmitComplaint')}>
          <Text style={[textStyles.body1, {color: colors.white, fontWeight: '700'}]}>＋ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={myList}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: spacing.base, paddingBottom: 40, flexGrow: 1}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={loading ? null : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: spacing.sm}]}>No complaints yet</Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary}]}>Tap "+ New" to submit one</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header:    {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  card:      {padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: {width: 0, height: 2}},
  row:       {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  badge:     {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12},
  replyBox:  {padding: 10},
  empty:     {flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80},
  emptyIcon: {fontSize: 48},
});

export default ParentComplaintsScreen;
