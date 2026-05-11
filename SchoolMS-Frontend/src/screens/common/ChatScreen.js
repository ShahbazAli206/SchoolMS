import React, {useEffect, useCallback, useState, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';
import {fetchMessages, sendMessageThunk, markReadThunk} from '../../redux/slices/chatSlice';
import {launchImageLibrary} from 'react-native-image-picker';

const PAGE_SIZE = 30;

const initials = name =>
  name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

const timeStr = dateStr =>
  new Date(dateStr).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

const ChatScreen = ({route, navigation}) => {
  const {convId, conv} = route.params;
  const dispatch       = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const insets = useSafeAreaInsets();
  const {activeMessages, activeTotal, msgLoading, actionLoading} = useSelector(s => s.chat);
  const currentUserId  = useSelector(s => s.auth.user?.id);
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);
  const listRef         = useRef(null);

  const otherParticipant = conv?.type === 'direct'
    ? (conv?.participants || []).find(p => p.id !== currentUserId)
    : null;
  const title = conv?.type === 'group' ? (conv?.name || 'Group') : (otherParticipant?.name || 'Chat');

  const load = useCallback((p = 1) => {
    dispatch(fetchMessages({id: convId, params: {page: p, limit: PAGE_SIZE}}));
  }, [dispatch, convId]);

  useEffect(() => {
    load(1);
    dispatch(markReadThunk(convId));
  }, [load, convId, dispatch]);

  const handleLoadMore = useCallback(() => {
    if (msgLoading || activeMessages.length >= activeTotal) return;
    const next = page + 1;
    setPage(next);
    load(next);
  }, [msgLoading, activeMessages.length, activeTotal, page, load]);

  const handleSend = useCallback(() => {
    const msg = text.trim();
    if (!msg || actionLoading) return;
    setText('');
    dispatch(sendMessageThunk({id: convId, data: {body: msg, type: 'text'}}));
  }, [text, actionLoading, dispatch, convId]);

  const handleImagePick = useCallback(() => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) return;

      const asset = response.assets?.[0];
      if (!asset) return;

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName || 'image.jpg',
      });

      dispatch(sendMessageThunk({id: convId, data: formData}));
    });
  }, [dispatch, convId]);

  const renderMessage = useCallback(({item, index}) => {
    const isMine    = item.sender_id === currentUserId || item.sender?.id === currentUserId;
    const senderName = item.sender?.name || '';
    const showAvatar = !isMine && (index === 0 || activeMessages[index - 1]?.sender_id !== item.sender_id);

    return (
      <View style={[styles.msgRow, isMine ? styles.msgRowRight : styles.msgRowLeft]}>
        {!isMine && (
          <View style={[styles.miniAvatar, {backgroundColor: isMine ? 'transparent' : colors.primary, opacity: showAvatar ? 1 : 0}]}>
            <Text style={styles.miniAvatarText}>{initials(senderName)}</Text>
          </View>
        )}
        <View style={{maxWidth: '75%'}}>
          {!isMine && showAvatar && (
            <Text style={[textStyles.caption, {color: colors.textSecondary, marginLeft: 4, marginBottom: 2}]}>{senderName}</Text>
          )}
          <View
            style={[
              styles.bubble,
              {
                backgroundColor: isMine ? colors.primary : colors.surface,
                borderRadius: borderRadius.lg,
                borderBottomRightRadius: isMine ? 4 : borderRadius.lg,
                borderBottomLeftRadius:  isMine ? borderRadius.lg : 4,
              },
            ]}>
            {item.type === 'image' && item.attachment_url ? (
              <TouchableOpacity onPress={() => {/* Could open full screen image */}}>
                <Image
                  source={{uri: `http://10.0.2.2:3000${item.attachment_url}`}} // Adjust for your backend URL
                  style={styles.messageImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <Text style={[textStyles.body2, {color: isMine ? colors.white : colors.textPrimary}]}>
                {item.type === 'text' ? item.body : '📎 Attachment'}
              </Text>
            )}
            <Text style={[textStyles.caption, {color: isMine ? 'rgba(255,255,255,0.7)' : colors.textSecondary, alignSelf: 'flex-end', marginTop: 2}]}>
              {timeStr(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [currentUserId, activeMessages, colors, borderRadius, textStyles]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: spacing.base + insets.top}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
          <Text style={[textStyles.body1, {color: colors.white}]}>←</Text>
        </TouchableOpacity>
        <View style={[styles.headerAvatar, {backgroundColor: colors.primaryDark || colors.primary}]}>
          <Text style={styles.headerAvatarText}>{initials(title)}</Text>
        </View>
        <Text style={[textStyles.h6 || textStyles.body1, {color: colors.white, fontWeight: '600', flex: 1}]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {msgLoading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={activeMessages}
          keyExtractor={item => String(item.id)}
          renderItem={renderMessage}
          contentContainerStyle={{padding: spacing.base, paddingBottom: 8}}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListHeaderComponent={
            msgLoading && page > 1
              ? <ActivityIndicator color={colors.primary} style={{marginBottom: 8}} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[textStyles.body2, {color: colors.textSecondary}]}>No messages yet. Say hello! 👋</Text>
            </View>
          }
          onContentSizeChange={() => {
            if (page === 1) listRef.current?.scrollToEnd({animated: false});
          }}
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, {backgroundColor: colors.surface, borderTopColor: colors.border}]}>
          <TouchableOpacity
            onPress={handleImagePick}
            disabled={actionLoading}
            style={[styles.imageBtn, {borderColor: colors.border, borderRadius: borderRadius.md}]}>
            <Text style={[styles.imageIcon, {color: colors.primary}]}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, {backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.full, color: colors.textPrimary}]}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || actionLoading}
            style={[styles.sendBtn, {backgroundColor: text.trim() ? colors.primary : colors.border, borderRadius: borderRadius.full}]}>
            {actionLoading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.sendIcon}>➤</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        {flex: 1},
  header:           {flexDirection: 'row', alignItems: 'center'},
  headerAvatar:     {width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 10},
  headerAvatarText: {color: '#fff', fontWeight: '700', fontSize: 13},
  center:           {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40},
  msgRow:           {flexDirection: 'row', marginBottom: 6, alignItems: 'flex-end'},
  msgRowRight:      {justifyContent: 'flex-end'},
  msgRowLeft:       {justifyContent: 'flex-start'},
  miniAvatar:       {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 6},
  miniAvatarText:   {color: '#fff', fontSize: 11, fontWeight: '700'},
  bubble:           {paddingHorizontal: 12, paddingVertical: 8},
  messageImage:     {width: 200, height: 200, borderRadius: 12},
  inputBar:         {flexDirection: 'row', alignItems: 'flex-end', padding: 8, borderTopWidth: StyleSheet.hairlineWidth},
  imageBtn:         {width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 8},
  imageIcon:        {fontSize: 18},
  input:            {flex: 1, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, maxHeight: 100},
  sendBtn:          {width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: 8},
  sendIcon:         {color: '#fff', fontSize: 16},
});

export default ChatScreen;
