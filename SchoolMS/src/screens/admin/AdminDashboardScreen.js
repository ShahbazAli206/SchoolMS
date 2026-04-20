import React, {useEffect, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchDashboardStats} from '../../redux/slices/adminSlice';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({label, value, icon, color, bgColor, onPress}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
        onPress={onPress}
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.statCard,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            padding: spacing.base,
            ...shadow.sm,
            shadowColor: colors.shadowColor,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
        ]}>
        <LinearGradient
          colors={[bgColor, colors.surface]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientOverlay}
        />
        <View style={[styles.statIcon, {backgroundColor: color + '20', borderRadius: borderRadius.lg}]}>
          <Text style={{fontSize: 24}}>{icon}</Text>
        </View>
        <Text style={[textStyles.h2, {color: colors.textPrimary, fontWeight: '800', marginTop: spacing.sm}]} numberOfLines={1}>
          {value ?? '—'}
        </Text>
        <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 2, fontWeight: '600'}]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Simple Bar Chart ─────────────────────────────────────────────────────
const BarChart = ({data, colors, spacing, borderRadius, textStyles}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  return (
    <View style={[styles.chartContainer, {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginTop: spacing.lg}]}>
      <Text style={[textStyles.h6, {color: colors.textPrimary, marginBottom: spacing.sm}]}>User Growth (Last 6 Months)</Text>
      <View style={styles.chartBars}>
        {data.map((item, i) => (
          <View key={i} style={styles.barWrap}>
            <View style={[styles.bar, {height: (item.value / maxValue) * 100, backgroundColor: item.color}]} />
            <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 4}]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ── Quick Action Button ───────────────────────────────────────────────────
const QuickAction = ({label, icon, onPress, color}) => {
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.quickAction,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: color,
        },
      ]}>
      <Text style={{fontSize: 20, marginBottom: 4}}>{icon}</Text>
      <Text style={[textStyles.label, {color: colors.textPrimary}]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────
const AdminDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius} = useTheme();
  const {stats, statsLoading} = useSelector(s => s.admin);
  const {user} = useSelector(s => s.auth);

  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, {toValue: 1, duration: 5000, useNativeDriver: false}),
        Animated.timing(bgAnim, {toValue: 0, duration: 5000, useNativeDriver: false}),
      ])
    ).start();
  }, [bgAnim]);

  const bgColor1 = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, colors.primaryFaded || '#f0f0f0'],
  });
  const bgColor2 = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, colors.secondaryFaded || '#e0e0e0'],
  });

  const load = useCallback(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  useEffect(() => {load();}, [load]);

  const userStats = stats?.users;

  const statCards = [
    {label: 'Total Students', value: userStats?.totalStudents, icon: '🎓', color: colors.roleStudent, bgColor: colors.roleStudentFaded},
    {label: 'Total Teachers', value: userStats?.totalTeachers, icon: '👨‍🏫', color: colors.roleTeacher, bgColor: colors.roleTeacherFaded},
    {label: 'Total Parents', value: userStats?.totalParents, icon: '👨‍👩‍👧', color: colors.roleParent, bgColor: colors.roleParentFaded},
    {label: 'Staff Members', value: userStats?.totalStaff, icon: '🏫', color: colors.roleStaff, bgColor: colors.roleStaffFaded},
    {label: 'Active Users', value: userStats?.totalActive, icon: '✅', color: colors.success, bgColor: colors.successFaded},
    {label: 'New This Month', value: userStats?.newThisMonth, icon: '🆕', color: colors.primary, bgColor: colors.primaryFaded},
  ];

  const chartData = [
    {label: 'Jan', value: 120, color: colors.primary},
    {label: 'Feb', value: 150, color: colors.success},
    {label: 'Mar', value: 180, color: colors.warning},
    {label: 'Apr', value: 200, color: colors.error},
    {label: 'May', value: 220, color: colors.accentPurple || colors.primary},
    {label: 'Jun', value: 250, color: colors.secondary},
  ];

  return (
    <AnimatedLinearGradient
      colors={[bgColor1, bgColor2]}
      style={{flex: 1}}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
    >
      <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]}>
        {/* Header */}
        <View style={[styles.header, {
          backgroundColor: colors.headerBg,
          paddingHorizontal: spacing.base,
          paddingTop: spacing.base + insets.top,
          paddingBottom: spacing.lg,
        }]}>
          <View style={{flex: 1}}>
            <Text style={[textStyles.caption, {color: colors.whiteAlpha80, fontSize: 14}]}>Welcome back,</Text>
            <Text style={[textStyles.h3, {color: colors.white, fontWeight: '800', fontSize: 28, marginTop: 4}]}>
              {user?.name ?? 'Admin'}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, {padding: spacing.base, paddingBottom: spacing.base + insets.bottom + 120}]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={statsLoading} onRefresh={load} tintColor={colors.primary} />
          }>

          {/* Stats section */}
          <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>
            Overview
          </Text>

          {statsLoading && !stats ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <View style={styles.statsGrid}>
              {statCards.map((card, i) => (
                <View key={i} style={styles.statCardWrap}>
                  <StatCard {...card} />
                </View>
              ))}
            </View>
          )}

          {/* Bar Chart */}
          <BarChart data={chartData} colors={colors} spacing={spacing} borderRadius={borderRadius} textStyles={textStyles} />

          {/* Inactive users alert */}
          {userStats?.totalInactive > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Users')}
              style={[
                styles.alertBanner,
                {
                  backgroundColor: colors.warningFaded,
                  borderRadius: borderRadius.md,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                  padding: spacing.md,
                  marginTop: spacing.sm,
                },
              ]}>
              <Text style={[textStyles.body2, {color: colors.warningDark}]}>
                ⚠️  {userStats.totalInactive} user{userStats.totalInactive !== 1 ? 's' : ''} are currently inactive.
                Tap to review.
              </Text>
            </TouchableOpacity>
          )}

          {/* Quick Actions */}
          <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>
            Quick Actions
          </Text>

          <View style={styles.quickGrid}>
            <QuickAction label="Add Student" icon="🎓" color={colors.roleStudent}
              onPress={() => navigation.navigate('Users', {screen: 'AddUser', params: {defaultRole: 'student'}})} />
            <QuickAction label="Add Teacher" icon="👨‍🏫" color={colors.roleTeacher}
              onPress={() => navigation.navigate('Users', {screen: 'AddUser', params: {defaultRole: 'teacher'}})} />
            <QuickAction label="Manage Users" icon="👥" color={colors.primary}
              onPress={() => navigation.navigate('Users')} />
            <QuickAction label="Notifications" icon="🔔" color={colors.accentPurple ?? colors.primary}
              onPress={() => navigation.navigate('Notifications')} />
          </View>

          {/* Summary row */}
          <View
            style={[
              styles.summaryRow,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.xl,
                padding: spacing.base,
                marginTop: spacing.xl,
              },
            ]}>
            <View style={styles.summaryItem}>
              <Text style={[textStyles.h4, {color: colors.primary, fontWeight: '800'}]}>
                {(userStats?.totalActive ?? 0) + (userStats?.totalInactive ?? 0)}
              </Text>
              <Text style={[textStyles.caption, {color: colors.textSecondary}]}>Total Users</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[textStyles.h4, {color: colors.success, fontWeight: '800'}]}>
                {userStats?.totalActive ?? 0}
              </Text>
              <Text style={[textStyles.caption, {color: colors.textSecondary}]}>Active</Text>
            </View>
            <View style={[styles.summaryDivider, {backgroundColor: colors.divider}]} />
            <View style={styles.summaryItem}>
              <Text style={[textStyles.h4, {color: colors.error, fontWeight: '800'}]}>
                {userStats?.totalInactive ?? 0}
              </Text>
              <Text style={[textStyles.caption, {color: colors.textSecondary}]}>Inactive</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AnimatedLinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20},
  contactIcon: {},
  scroll: {paddingBottom: 40},
  loadingWrap: {height: 200, alignItems: 'center', justifyContent: 'center'},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  statCardWrap: {width: '50%', padding: 6},
  chartContainer: {},
  chartBars: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, marginTop: 10},
  barWrap: {alignItems: 'center'},
  bar: {width: 30, minHeight: 10, borderRadius: 4},
  statCard: {},
  gradientOverlay: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  statIcon: {width: 48, height: 48, alignItems: 'center', justifyContent: 'center'},
  quickGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  quickAction: {width: '47%'},
  alertBanner: {},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'},
  summaryItem: {flex: 1, alignItems: 'center'},
  summaryDivider: {width: 1, height: 40},
});

export default AdminDashboardScreen;
