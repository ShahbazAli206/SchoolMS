import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';
import {createConversationThunk, setActiveConv} from '../../redux/slices/chatSlice';
import {fetchUsers} from '../../redux/slices/usersSlice';

const initials = name =>
  name ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : '?';

const ROLE_COLORS = {admin: '#e74c3c', teacher: '#2980b9', student: '#27ae60', parent: '#8e44ad', staff: '#e67e22'};

const NewConversationScreen = ({navigation}) => {
  const dispatch   = useDispatch();
  const insets     = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {users, loading}    = useSelector(s => s.users);
  const currentUserId       = useSelector(s => s.auth.user?.id);
  const {actionLoading}     = useSelector(s => s.chat);

  const [search,     setSearch]     = useState('');
  const [selected,   setSelected]   = useState([]);
  const [isGroup,    setIsGroup]    = useState(false);
  const [groupName,  setGroupName]  = useState('');

  useEffect(() => {
    dispatch(fetchUsers({page: 1, limit: 100}));
  }, [dispatch]);

  const filtered = (users || []).filter(u =>
    u.id !== currentUserId &&
    (u.name?.toLowerCase().includes(search.toLowerCase()) ||
     u.role?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = useCallback(user => {
    setSelected(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  }, []);

  const handleStart = useCallback(() => {
    if (!selected.length) { Alert.alert('Select', 'Please select at least one user'); return; }
    if (isGroup && !groupName.trim()) { Alert.alert('Group Name', 'Please enter a group name'); return; }

    const payload = {
      type:           isGroup ? 'group' : 'direct',
      name:           isGroup ? groupName.trim() : undefined,
      participantIds: selected.map(u => u.id),
    };

    dispatch(createConversationThunk(payload)).unwrap()
      .then(conv => {
        dispatch(setActiveConv(conv.id));
        navigation.replace('Chat', {convId: conv.id, conv});
      })
      .catch(err => Alert.alert('Error', err));
  }, [selected, isGroup, groupName, dispatch, navigation]);

  const renderUser = useCallback(({item}) => {
    const sel = !!selected.find(u => u.id === item.id);
    return (
      <TouchableOpacity
        onPress={() => isGroup ? toggleSelect(item) : handleStartDirect(item)}
        style={[
          styles.userRow,
          {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.base,
            backgroundColor: sel ? (colors.primaryLight || colors.surface) : 'transparent',
            borderBottomColor: colors.border,
          },
        ]}>
        <View style={[styles.avatar, {backgroundColor: ROLE_COLORS[item.role] || colors.primary}]}>
          <Text style={styles.avatarText}>{initials(item.name)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[textStyles.body1, {color: colors.textPrimary}]}>{item.name}</Text>
          <Text style={[textStyles.caption, {color: ROLE_COLORS[item.role] || colors.textSecondary, textTransform: 'capitalize'}]}>{item.role}</Text>
        </View>
        {isGroup && (
          <View style={[styles.checkbox, {borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary : 'transparent'}]}>
            {sel && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selected, isGroup, toggleSelect, colors, spacing, textStyles]);

  const handleStartDirect = user => {
    const payload = {type: 'direct', participantIds: [user.id]};
    dispatch(createConversationThunk(payload)).unwrap()
      .then(conv => {
        dispatch(setActiveConv(conv.id));
        navigation.replace('Chat', {convId: conv.id, conv});
      })
      .catch(err => Alert.alert('Error', err));
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: spacing.base + insets.top}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
          <Text style={[textStyles.body1, {color: colors.white}]}>←</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white, flex: 1}]}>New Chat</Text>
        {isGroup && selected.length > 0 && (
          <TouchableOpacity onPress={handleStart} disabled={actionLoading}>
            {actionLoading
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={[textStyles.body1, {color: colors.white, fontWeight: '600'}]}>Create</Text>}
          </TouchableOpacity>
        )}
      </View>

      <View style={{padding: spacing.base, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border}}>
        <View style={[styles.row, {marginBottom: spacing.sm}]}>
          <Text style={[textStyles.body2, {color: colors.textPrimary, flex: 1}]}>Group Chat</Text>
          <Switch
            value={isGroup}
            onValueChange={v => { setIsGroup(v); setSelected([]); }}
            trackColor={{false: colors.border, true: colors.primary}}
            thumbColor="#fff"
          />
        </View>
        {isGroup && (
          <TextInput
            style={[styles.groupInput, {borderColor: colors.border, borderRadius: borderRadius.md, color: colors.textPrimary, backgroundColor: colors.surface}]}
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Group name..."
            placeholderTextColor={colors.textSecondary}
          />
        )}
        <TextInput
          style={[styles.search, {borderColor: colors.border, borderRadius: borderRadius.full, color: colors.textPrimary, backgroundColor: colors.surface, marginTop: isGroup ? spacing.sm : 0}]}
          value={search}
          onChangeText={setSearch}
          placeholder="Search users..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {isGroup && selected.length > 0 && (
        <View style={[styles.selectedBar, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
          <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
            {selected.map(u => u.name.split(' ')[0]).join(', ')}
          </Text>
        </View>
      )}

      {loading
        ? <ActivityIndicator color={colors.primary} style={{marginTop: 40}} />
        : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={renderUser}
            contentContainerStyle={{flexGrow: 1}}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={[textStyles.body2, {color: colors.textSecondary}]}>No users found</Text>
              </View>
            }
          />
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   {flex: 1},
  header:      {flexDirection: 'row', alignItems: 'center'},
  row:         {flexDirection: 'row', alignItems: 'center'},
  groupInput:  {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 4},
  search:      {borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14},
  selectedBar: {paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth},
  userRow:     {flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth},
  avatar:      {width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  avatarText:  {color: '#fff', fontWeight: '700', fontSize: 16},
  userInfo:    {flex: 1},
  checkbox:    {width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center'},
  checkmark:   {color: '#fff', fontSize: 13, fontWeight: '700'},
  empty:       {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40},
});

export default NewConversationScreen;
