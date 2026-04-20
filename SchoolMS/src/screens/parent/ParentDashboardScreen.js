import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchParentDashboard, fetchChildren, selectChild} from '../../redux/slices/parentSlice';

const ParentDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {dashboard, children, loading} = useSelector(s => s.parent);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchParentDashboard());
    dispatch(fetchChildren());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const onViewChild = child => {
    dispatch(selectChild(child.id));
    navigation.navigate('Progress');
  };

  const attendanceBadgeColor = pct => {
    if (pct == null) return colors.textTertiary;
    if (pct >= 75) return colors.success;
    return colors.error;
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, paddingHorizontal: spacing.base, paddingBottom: spacing.lg}]}>
        <View>
          <Text style={[textStyles.caption, {color: colors.whiteAlpha80}]}>Hello,</Text>
          <Text style={[textStyles.h4, {color: colors.white, fontWeight: '700'}]}>{user?.name ?? 'Parent'}</Text>
        </View>
        <View style={[styles.avatarCircle, {backgroundColor: colors.whiteAlpha20, borderRadius: borderRadius.full}]}>
          <Text style={{fontSize: 22}}>👨‍👩‍👧</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>
          My Children
        </Text>

        {loading && !dashboard ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 40}} />
        ) : children.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>👶</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>
              No children linked to your account yet
            </Text>
            <Text style={[textStyles.caption, {color: colors.textTertiary, marginTop: 6, textAlign: 'center'}]}>
              Ask the school admin to link your children's profiles
            </Text>
          </View>
        ) : (
          (dashboard?.children ?? children.map(c => ({id: c.id, name: c.user?.name, class: null, presentToday: null, dueSoonAssignments: null}))).map(child => (
            <TouchableOpacity
              key={child.id}
              onPress={() => onViewChild(child)}
              style={[
                styles.childCard,
                {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.md, shadowColor: colors.shadowColor},
              ]}>
              {/* Child header */}
              <View style={styles.childHeader}>
                <View style={[styles.childAvatar, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.full}]}>
                  <Text style={{fontSize: 24}}>🧒</Text>
                </View>
                <View style={{flex: 1, marginLeft: spacing.sm}}>
                  <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]}>{child.name}</Text>
                  {child.class && (
                    <Text style={[textStyles.caption, {color: colors.textSecondary}]}>🏫 {child.class}</Text>
                  )}
                </View>
                <Text style={{color: colors.primary, fontSize: 18}}>›</Text>
              </View>

              {/* Quick stats row */}
              <View style={[styles.statsRow, {marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border}]}>
                <View style={styles.statItem}>
                  <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Today</Text>
                  <Text style={[textStyles.body2, {
                    color: child.presentToday === true ? colors.success : child.presentToday === false ? colors.error : colors.textTertiary,
                    fontWeight: '700',
                  }]}>
                    {child.presentToday === true ? '✅ Present' : child.presentToday === false ? '❌ Absent' : '—'}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Due Soon</Text>
                  <Text style={[textStyles.body2, {color: (child.dueSoonAssignments ?? 0) > 0 ? colors.warning : colors.success, fontWeight: '700'}]}>
                    {child.dueSoonAssignments ?? 0} tasks
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Marks</Text>
                  <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '700'}]}>
                    {child.totalMarks ?? '—'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => onViewChild(child)}
                style={[styles.viewBtn, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.md, marginTop: spacing.sm}]}>
                <Text style={[textStyles.label, {color: colors.primary, textAlign: 'center'}]}>View Full Progress →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20},
  avatarCircle: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  scroll: {paddingBottom: 40},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
  childCard: {},
  childHeader: {flexDirection: 'row', alignItems: 'center'},
  childAvatar: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  statsRow: {flexDirection: 'row', justifyContent: 'space-around'},
  statItem: {alignItems: 'center'},
  viewBtn: {paddingVertical: 10},
});

export default ParentDashboardScreen;
