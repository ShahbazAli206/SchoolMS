import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchTeacherStats, fetchMyClasses} from '../../redux/slices/teacherSlice';

const STAT_CONFIG = [
  {key: 'myClasses',             label: 'My Classes',       icon: '🏫', bg: '#6C5CE7'},
  {key: 'totalAssignments',      label: 'Assignments',      icon: '📝', bg: '#00B894'},
  {key: 'dueSoonAssignments',    label: 'Due This Week',    icon: '⏰', bg: '#FF7675'},
  {key: 'todayAttendanceMarked', label: "Today Attendance", icon: '✅', bg: '#FDCB6E'},
];

const StatCard = ({label, value, icon, bg}) => {
  const {borderRadius} = useTheme();
  return (
    <View style={[styles.statCard, {borderRadius: borderRadius.xl, backgroundColor: bg}]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBubble} />
    </View>
  );
};

const QuickBtn = ({icon, label, onPress, colors, borderRadius}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.quickBtn, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border}]}>
    <View style={[styles.quickIcon, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.lg}]}>
      <Text style={{fontSize: 22}}>{icon}</Text>
    </View>
    <Text style={[styles.quickLabel, {color: colors.textPrimary}]}>{label}</Text>
  </TouchableOpacity>
);

const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius, shadow} = useTheme();
  const {stats, classes, loading} = useSelector(s => s.teacher);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchTeacherStats());
    dispatch(fetchMyClasses());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B894" translucent={false} />
      {/* ── HERO ── */}
      <View style={[styles.hero, {backgroundColor: '#00B894', paddingTop: insets.top + 16}]}>
        <View style={styles.heroRow}>
          <View style={{flex: 1}}>
            <Text style={styles.heroGreeting}>{getGreeting()}!</Text>
            <Text style={styles.heroName}>{user?.name ?? 'Teacher'}</Text>
            <View style={[styles.heroBadge, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
              <Text style={styles.heroBadgeText}>Teacher Portal</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.heroAvatar, {backgroundColor: 'rgba(255,255,255,0.2)'}]}
            activeOpacity={0.8}>
            <Text style={{fontSize: 30}}>👨‍🏫</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingHorizontal: spacing.base, paddingBottom: 40}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* ── STATS ── */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary, marginTop: spacing.lg}]}>Overview</Text>
        {loading && !stats ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 32}} />
        ) : (
          <View style={styles.statGrid}>
            {STAT_CONFIG.map(c => (
              <View key={c.key} style={styles.statWrap}>
                <StatCard icon={c.icon} label={c.label} bg={c.bg} value={stats?.[c.key]} />
              </View>
            ))}
          </View>
        )}

        {/* ── QUICK ACTIONS ── */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {[
            {label: 'Attendance',  icon: '✅', screen: 'Attendance'},
            {label: 'Assignments', icon: '📝', screen: 'Assignments'},
            {label: 'Materials',   icon: '📁', screen: 'UploadMaterial'},
            {label: 'Marks',       icon: '📊', screen: 'Marks'},
          ].map(a => (
            <QuickBtn
              key={a.label}
              icon={a.icon}
              label={a.label}
              onPress={() => navigation.navigate(a.screen)}
              colors={colors}
              borderRadius={borderRadius}
            />
          ))}
        </View>

        {/* ── MY CLASSES ── */}
        {classes.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>My Classes</Text>
            {classes.map(cls => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => navigation.navigate('Attendance', {classId: cls.id, className: cls.name})}
                style={[styles.classCard, {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.xl,
                  ...shadow.sm,
                  shadowColor: colors.shadowColor,
                  borderLeftWidth: 4,
                  borderLeftColor: '#00B894',
                }]}>
                <View style={[styles.classIconWrap, {backgroundColor: '#E5FBF5', borderRadius: borderRadius.lg}]}>
                  <Text style={{fontSize: 20}}>🏫</Text>
                </View>
                <View style={{flex: 1, marginLeft: 12}}>
                  <Text style={[styles.className, {color: colors.textPrimary}]}>
                    {cls.name}{cls.section ? ` — ${cls.section}` : ''}
                  </Text>
                  {cls.grade && (
                    <Text style={[styles.classGrade, {color: colors.textSecondary}]}>Grade {cls.grade}</Text>
                  )}
                </View>
                <View style={[styles.classArrow, {backgroundColor: colors.primaryFaded}]}>
                  <Text style={{color: colors.primary, fontWeight: '700', fontSize: 16}}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  hero: {paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden'},
  heroRow: {flexDirection: 'row', alignItems: 'center', zIndex: 2},
  heroGreeting: {color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500'},
  heroName: {color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2},
  heroBadge: {alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8},
  heroBadgeText: {color: '#FFFFFF', fontSize: 11, fontWeight: '600'},
  heroAvatar: {width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center'},
  heroBubble1: {position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', top: -30, right: -20},
  heroBubble2: {position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, right: 60},

  scroll: {},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 20},

  statGrid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  statWrap: {width: '50%', padding: 6},
  statCard: {padding: 16, overflow: 'hidden', position: 'relative', minHeight: 110},
  statIcon: {fontSize: 24, marginBottom: 8},
  statValue: {color: '#FFFFFF', fontSize: 26, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500', marginTop: 2},
  statBubble: {position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.12)', right: -15, bottom: -15},

  quickRow: {flexDirection: 'row', gap: 10},
  quickBtn: {flex: 1, alignItems: 'center', paddingVertical: 14},
  quickIcon: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  quickLabel: {fontSize: 11, fontWeight: '600', textAlign: 'center'},

  classCard: {flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10},
  classIconWrap: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  className: {fontSize: 15, fontWeight: '700'},
  classGrade: {fontSize: 12, marginTop: 2},
  classArrow: {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
});

export default TeacherDashboardScreen;
