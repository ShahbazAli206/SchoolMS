import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
  RefreshControl, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {
  fetchAllUsers, toggleStatusThunk, assignRoleThunk,
  deleteUserThunk, setSelectedUser,
} from '../../redux/slices/adminSlice';

const ROLES = ['all', 'student', 'teacher', 'parent', 'staff', 'admin'];

const ROLE_COLORS = {
  admin:   {badge: 'roleAdmin',   faded: 'roleAdminFaded'},
  teacher: {badge: 'roleTeacher', faded: 'roleTeacherFaded'},
  student: {badge: 'roleStudent', faded: 'roleStudentFaded'},
  parent:  {badge: 'roleParent',  faded: 'roleParentFaded'},
  staff:   {badge: 'roleStaff',   faded: 'roleStaffFaded'},
};

// ── User Row Card ─────────────────────────────────────────────────────────
const UserCard = ({item, onEdit, onToggle, onDelete, onAssignRole}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const rc = ROLE_COLORS[item.role] ?? ROLE_COLORS.staff;
  const badgeColor = colors[rc.badge];
  const fadedColor = colors[rc.faded];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.md,
            marginBottom: spacing.sm,
            ...shadow.sm,
            shadowColor: colors.shadowColor,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
        ]}>
        <LinearGradient
          colors={[fadedColor + '15', colors.surface]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cardGradient}
        />
        <View style={styles.cardTop}>
          {/* Avatar */}
          <View style={[styles.avatar, {backgroundColor: fadedColor, borderRadius: borderRadius.full}]}>
            <Text style={{fontSize: 18, color: badgeColor}}>
              {item.name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '600'}]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[textStyles.caption, {color: colors.textSecondary}]} numberOfLines={1}>
              {item.email ?? item.phone ?? item.username ?? '—'}
            </Text>
          </View>

          {/* Status dot */}
          <View style={[styles.statusDot, {backgroundColor: item.is_active ? colors.success : colors.error}]} />
        </View>

        {/* Role badge + actions row */}
        <View style={[styles.cardBottom, {marginTop: spacing.sm}]}>
          <View style={[styles.roleBadge, {backgroundColor: fadedColor, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: badgeColor, fontWeight: '700'}]}>
              {item.role.toUpperCase()}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              style={[styles.actionBtn, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.sm}]}>
              <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '600'}]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onToggle(item)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: item.is_active ? colors.warningFaded : colors.successFaded,
                  borderRadius: borderRadius.sm,
                },
              ]}>
              <Text style={[textStyles.caption, {color: item.is_active ? colors.warningDark : colors.success, fontWeight: '600'}]}>
                {item.is_active ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDelete(item)}
              style={[styles.actionBtn, {backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm}]}>
              <Text style={[textStyles.caption, {color: colors.error, fontWeight: '600'}]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
const UserManagementScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {users, usersLoading, usersTotal, usersPage} = useSelector(s => s.admin);

  const initialRole = route?.params?.defaultRole || 'all';
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimer = useRef(null);

  // sync incoming role param (e.g. when re-navigating with new role)
  useEffect(() => {
    if (route?.params?.defaultRole) setRoleFilter(route.params.defaultRole);
  }, [route?.params?.defaultRole]);

  const load = useCallback((p = 1, reset = true) => {
    const params = {page: p, limit: 15};
    if (search.trim()) params.search = search.trim();
    if (roleFilter !== 'all') params.role = roleFilter;
    dispatch(fetchAllUsers(params));
  }, [search, roleFilter, dispatch]);

  useEffect(() => {
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1), 400);
    return () => clearTimeout(searchTimer.current);
  }, [search, roleFilter]);

  const handleLoadMore = () => {
    const totalPages = Math.ceil(usersTotal / 15);
    if (page < totalPages && !usersLoading) {
      const next = page + 1;
      setPage(next);
      load(next);
    }
  };

  const handleToggle = (item) => {
    const action = item.is_active ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} ${item.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: () => dispatch(toggleStatusThunk(item.id))},
      ],
    );
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Delete User',
      `This will permanently delete ${item.name}. This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete', style: 'destructive',
          onPress: () => dispatch(deleteUserThunk(item.id)),
        },
      ],
    );
  };

  const handleEdit = (item) => {
    dispatch(setSelectedUser(item));
    navigation.navigate('EditUser', {userId: item.id});
  };

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Text style={{fontSize: 48}}>👥</Text>
      <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>
        {search ? 'No users match your search' : 'No users found'}
      </Text>
    </View>
  );

  const renderFooter = () =>
    loadingMore ? <ActivityIndicator color={colors.primary} style={{marginVertical: 16}} /> : null;

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <PageHeader
        title="User Management"
        showBack={navigation.canGoBack()}
        onBackPress={() => navigation.goBack()}
        onAddPress={() => navigation.navigate('AddUser')}
        addLabel="+ Add"
      />

      {/* Search bar */}
      <View style={[styles.searchBar, {backgroundColor: colors.whiteAlpha20, borderRadius: spacing.md, marginTop: spacing.md, marginHorizontal: spacing.base}]}>
        <Text style={{fontSize: 16, marginRight: 8}}>🔍</Text>
        <TextInput
          style={[textStyles.body2, {color: colors.white, flex: 1}]}
          placeholder="Search by name, email or phone..."
          placeholderTextColor={colors.whiteAlpha40}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{color: colors.whiteAlpha80, fontSize: 18}}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role filter chips */}
      <View style={[styles.filterRow, {backgroundColor: colors.surface, paddingHorizontal: spacing.base, paddingVertical: spacing.sm}]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ROLES}
          keyExtractor={r => r}
          renderItem={({item: r}) => {
            const active = roleFilter === r;
            return (
              <TouchableOpacity
                onPress={() => setRoleFilter(r)}
                style={[
                  styles.filterChip,
                  {
                    borderRadius: spacing.full,
                    backgroundColor: active ? colors.primary : colors.inputBg,
                    marginRight: 8,
                  },
                ]}>
                <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary, fontWeight: active ? '700' : '400'}]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Total count */}
      <View style={[styles.countRow, {paddingHorizontal: spacing.base, paddingTop: spacing.sm}]}>
        <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
          {usersTotal} user{usersTotal !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* User list */}
      <FlatList
        data={users}
        keyExtractor={u => String(u.id)}
        renderItem={({item}) => (
          <UserCard
            item={item}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onAssignRole={(u) => navigation.navigate('EditUser', {userId: u.id})}
          />
        )}
        contentContainerStyle={[styles.list, {padding: spacing.base, paddingBottom: spacing.base + insets.bottom + 120}]}
        ListEmptyComponent={!usersLoading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={usersLoading && page === 1}
            onRefresh={() => {setPage(1); load(1);}}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addBtn: {paddingHorizontal: 14, paddingVertical: 6},
  searchBar: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8},
  filterRow: {flexDirection: 'row'},
  filterChip: {paddingHorizontal: 14, paddingVertical: 6},
  countRow: {},
  list: {paddingBottom: 40},
  card: {},
  cardGradient: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  cardTop: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12},
  cardInfo: {flex: 1},
  statusDot: {width: 10, height: 10, borderRadius: 5},
  cardBottom: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6},
  roleBadge: {paddingHorizontal: 10, paddingVertical: 3},
  actions: {flexDirection: 'row', gap: 6, marginLeft: 'auto'},
  actionBtn: {paddingHorizontal: 10, paddingVertical: 4},
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80},
});

export default UserManagementScreen;
