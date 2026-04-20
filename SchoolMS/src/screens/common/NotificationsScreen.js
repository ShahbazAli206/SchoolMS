import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {
  fetchMyNotifications,
  fetchUnreadCount,
  markReadThunk,
  markAllReadThunk,
  deleteNotifThunk,
  clearNotifError,
} from '../../redux/slices/notificationSlice';

const TYPE_META = {
  assignment:   {icon: '📝', label: 'Assignment'},
  fee:          {icon: '💰', label: 'Fee'},
  attendance:   {icon: '✅', label: 'Attendance'},
  marks:        {icon: '📊', label: 'Marks'},
  announcement: {icon: '📢', label: 'Announcement'},
  general:      {icon: '🔔', label: 'General'},
};

const PAGE_SIZE = 20;

const NotifItem = ({item, onRead, onDelete, colors, spacing, borderRadius, textStyles}) => {
  const meta = TYPE_META[item.type] || TYPE_META.general;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: item.is_read ? colors.surface : colors.primaryLight || colors.surface,
          borderRadius: borderRadius.md,
          borderLeftWidth: 4,
          borderLeftColor: item.is_read ? colors.border : colors.primary,
          marginBottom: spacing.sm,
          padding: spacing.base,
          ...{shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: {width: 0, height: 2}, elevation: 2},
        },
      ]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{meta.icon}</Text>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[textStyles.body1, {color: colors.textPrimary, fontWeight: item.is_read ? '400' : '700', flex: 1}]}
              numberOfLines={1}>
              {item.title}
            </Text>
            {!item.is_read && (
              <View style={[styles.dot, {backgroundColor: colors.primary}]} />
            )}
          </View>
          <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 2}]} numberOfLines={2}>
            {item.body}
          </Text>
          <View style={[styles.row, {marginTop: spacing.sm}]}>
            <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
              {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </Text>
            <View style={styles.actions}>
              {!item.is_read && (
                <TouchableOpacity onPress={() => onRead(item.id)} style={[styles.btn, {borderColor: colors.primary}]}>
                  <Text style={[textStyles.caption, {color: colors.primary}]}>Mark read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => onDelete(item.id)} style={[styles.btn, {borderColor: colors.error}]}>
                <Text style={[textStyles.caption, {color: colors.error}]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const NotificationsScreen = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {items, total, unreadCount, loading, actionLoading, error} = useSelector(s => s.notifications);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback((p = 1) => {
    dispatch(fetchMyNotifications({page: p, limit: PAGE_SIZE}));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    load(1);
    setPage(1);
  }, [load]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{text: 'OK', onPress: () => dispatch(clearNotifError())}]);
    }
  }, [error, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || items.length >= total) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    dispatch(fetchMyNotifications({page: next, limit: PAGE_SIZE})).finally(() => setLoadingMore(false));
  }, [loadingMore, items.length, total, page, dispatch]);

  const handleRead = useCallback(id => {
    dispatch(markReadThunk(id));
  }, [dispatch]);

  const handleDelete = useCallback(id => {
    Alert.alert('Delete', 'Remove this notification?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteNotifThunk(id))},
    ]);
  }, [dispatch]);

  const handleMarkAll = useCallback(() => {
    if (unreadCount === 0) return;
    dispatch(markAllReadThunk());
  }, [dispatch, unreadCount]);

  const renderItem = useCallback(({item}) => (
    <NotifItem
      item={item}
      onRead={handleRead}
      onDelete={handleDelete}
      colors={colors}
      spacing={spacing}
      borderRadius={borderRadius}
      textStyles={textStyles}
    />
  ), [handleRead, handleDelete, colors, spacing, borderRadius, textStyles]);

  const renderEmpty = () => (
    loading ? null : (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🔔</Text>
        <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: spacing.sm}]}>No notifications yet</Text>
      </View>
    )
  );

  const renderFooter = () => (
    loadingMore ? <ActivityIndicator color={colors.primary} style={{marginVertical: 16}} /> : null
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAll} disabled={actionLoading} style={{paddingRight: spacing.base}}>
              <Text style={[textStyles.label, {color: colors.primary, opacity: actionLoading ? 0.5 : 1, fontWeight: '600'}]}>
                Mark all
              </Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FlatList
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{padding: spacing.base, paddingBottom: spacing.base + insets.bottom + 120, flexGrow: 1}}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={loading && page === 1} onRefresh={() => { setPage(1); load(1); }} tintColor={colors.primary} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  {flex: 1},
  header:     {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  headerLeft: {flexDirection: 'row', alignItems: 'center'},
  badge:      {marginLeft: 8, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 20, alignItems: 'center'},
  badgeText:  {color: '#fff', fontSize: 11, fontWeight: '700'},
  card:       {},
  row:        {flexDirection: 'row', alignItems: 'flex-start'},
  icon:       {fontSize: 22, marginRight: 10, marginTop: 2},
  content:    {flex: 1},
  titleRow:   {flexDirection: 'row', alignItems: 'center'},
  dot:        {width: 8, height: 8, borderRadius: 4, marginLeft: 6},
  actions:    {flexDirection: 'row', gap: 8, marginLeft: 'auto'},
  btn:        {borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2},
  empty:      {flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80},
  emptyIcon:  {fontSize: 48},
});

export default NotificationsScreen;
