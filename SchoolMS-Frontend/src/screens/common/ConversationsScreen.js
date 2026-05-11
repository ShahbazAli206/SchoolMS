import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {fetchConversations, setActiveConv} from '../../redux/slices/chatSlice';

const initials = name =>
  name
    ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?';

const timeLabel = dateStr => {
  if (!dateStr) return '';
  const d   = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1)   return 'now';
  if (diffMin < 60)  return `${diffMin}m`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`;
  return d.toLocaleDateString([], {month: 'short', day: 'numeric'});
};

const Avatar = ({name, size = 44, colors}) => (
  <View style={[styles.avatar, {width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary}]}>
    <Text style={[styles.avatarText, {fontSize: size * 0.38, color: colors.white}]}>{initials(name)}</Text>
  </View>
);

const ConvItem = ({item, currentUserId, onPress, colors, textStyles, spacing}) => {
  const otherParticipant = item.type === 'direct'
    ? (item.participants || []).find(p => p.id !== currentUserId)
    : null;
  const displayName = item.type === 'group' ? (item.name || 'Group') : (otherParticipant?.name || 'Unknown');
  const lastMsg     = item.lastMessage;
  const unread      = item.unreadCount || 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.convRow, {borderBottomColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.base}]}
      activeOpacity={0.7}>
      <Avatar name={displayName} colors={colors} />
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: unread ? '700' : '400', flex: 1}]} numberOfLines={1}>
            {displayName}
          </Text>
          {lastMsg && (
            <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
              {timeLabel(lastMsg.createdAt)}
            </Text>
          )}
        </View>
        <View style={styles.convFooter}>
          <Text style={[textStyles.body2, {color: unread ? colors.textPrimary : colors.textSecondary, flex: 1, fontWeight: unread ? '600' : '400'}]} numberOfLines={1}>
            {lastMsg ? (lastMsg.type === 'text' ? lastMsg.body : '📎 Attachment') : 'No messages yet'}
          </Text>
          {unread > 0 && (
            <View style={[styles.unreadBadge, {backgroundColor: colors.primary}]}>
              <Text style={styles.unreadText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ConversationsScreen = ({navigation}) => {
  const dispatch    = useDispatch();
  const {colors, spacing, textStyles} = useTheme();
  const {conversations, loading}      = useSelector(s => s.chat);
  const currentUserId = useSelector(s => s.auth.user?.id);

  const load = useCallback(() => dispatch(fetchConversations()), [dispatch]);
  useEffect(() => { load(); }, [load]);

  const openChat = useCallback(conv => {
    dispatch(setActiveConv(conv.id));
    navigation.navigate('Chat', {convId: conv.id, conv});
  }, [dispatch, navigation]);

  const renderItem = useCallback(({item}) => (
    <ConvItem
      item={item}
      currentUserId={currentUserId}
      onPress={() => openChat(item)}
      colors={colors}
      textStyles={textStyles}
      spacing={spacing}
    />
  ), [currentUserId, openChat, colors, textStyles, spacing]);

  const renderEmpty = () => (
    loading ? null : (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: spacing.sm}]}>No conversations yet</Text>
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: 4}]}>Tap + to start a new chat</Text>
      </View>
    )
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <PageHeader
        title="Messages"
        rightAction={
          <TouchableOpacity onPress={() => navigation.navigate('NewConversation')} style={styles.fab}>
            <Text style={{color: '#fff', fontSize: 22, fontWeight: '300'}}>＋</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={conversations}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    {flex: 1},
  header:       {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fab:          {padding: 4},
  convRow:      {flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth},
  avatar:       {alignItems: 'center', justifyContent: 'center', marginRight: 12},
  avatarText:   {fontWeight: '700'},
  convInfo:     {flex: 1},
  convHeader:   {flexDirection: 'row', alignItems: 'center', marginBottom: 2},
  convFooter:   {flexDirection: 'row', alignItems: 'center'},
  unreadBadge:  {borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: 'center', marginLeft: 8},
  unreadText:   {color: '#fff', fontSize: 11, fontWeight: '700'},
  empty:        {flex: 1, alignItems: 'center', justifyContent: 'center'},
  emptyIcon:    {fontSize: 52},
});

export default ConversationsScreen;
