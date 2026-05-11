import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentDashboard, fetchStudentAssignments} from '../../redux/slices/studentSlice';
import AnnouncementTicker from '../../components/common/AnnouncementTicker';

const STAT_CONFIG = [
  {key: 'totalAssignments',   label: 'Assignments',  icon: '📝', grad: ['#6C5CE7', '#8E7CF8']},
  {key: 'dueSoonAssignments', label: 'Due Soon',     icon: '⏰', grad: ['#FF7675', '#FF9AA2']},
  {key: 'attendancePct',      label: 'Attendance',   icon: '✅', grad: ['#00B894', '#55EFC4'], suffix: '%'},
  {key: 'totalMarks',         label: 'Marks',        icon: '📊', grad: ['#FDCB6E', '#E17055']},
];

const StatCard = ({label, value, icon, grad}) => {
  const {borderRadius, spacing} = useTheme();
  return (
    <View style={[styles.statCard, {borderRadius: borderRadius.xl, backgroundColor: grad[0]}]}>
      <View style={styles.statIconRow}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statAccentCircle, {backgroundColor: grad[1]}]} />
    </View>
  );
};

const QuickActionBtn = ({icon, label, onPress, colors, borderRadius, spacing}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.quickBtn, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border}]}>
    <View style={[styles.quickIconWrap, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.lg}]}>
      <Text style={{fontSize: 22}}>{icon}</Text>
    </View>
    <Text style={[styles.quickLabel, {color: colors.textPrimary}]}>{label}</Text>
  </TouchableOpacity>
);

const StudentDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius, shadow} = useTheme();
  const {dashboard, assignments, loading} = useSelector(s => s.student);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchStudentDashboard());
    dispatch(fetchStudentAssignments({limit: 5}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const fmtDate = iso => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {day: 'numeric', month: 'short'});
  };
  const isOverdue = iso => iso && new Date(iso) < new Date();
  const isDueSoon = iso => {
    if (!iso) return false;
    const diff = new Date(iso) - new Date();
    return diff > 0 && diff < 7 * 86400000;
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const attendancePct = dashboard?.attendancePct ?? 0;

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      {/* ── HERO HEADER ── */}
      <View style={[styles.hero, {backgroundColor: colors.primary, paddingTop: insets.top + 16}]}>
        <View style={styles.heroContent}>
          <View style={{flex: 1}}>
            <Text style={styles.heroGreeting}>{getGreeting()}!</Text>
            <Text style={styles.heroName}>{user?.name ?? 'Student'}</Text>
            <View style={[styles.heroBadge, {backgroundColor: colors.whiteAlpha20}]}>
              <Text style={styles.heroBadgeText}>Student Portal</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={[styles.heroAvatar, {backgroundColor: colors.whiteAlpha20}]}
            activeOpacity={0.8}>
            <Text style={{fontSize: 30}}>🎓</Text>
          </TouchableOpacity>
        </View>
        {/* decorative circles */}
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingHorizontal: spacing.base, paddingBottom: 40}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* ── ANNOUNCEMENT TICKER ── */}
        <View style={{marginTop: spacing.md}}>
          <AnnouncementTicker accentColor={colors.primary} />
        </View>

        {/* ── STAT CARDS ── */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary, marginTop: spacing.lg}]}>Overview</Text>
        {loading && !dashboard ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 32}} />
        ) : (
          <View style={styles.statGrid}>
            {STAT_CONFIG.map(c => (
              <View key={c.key} style={styles.statWrap}>
                <StatCard
                  icon={c.icon}
                  label={c.label}
                  grad={c.grad}
                  value={
                    c.suffix
                      ? (dashboard?.[c.key] != null ? `${dashboard[c.key]}${c.suffix}` : '—')
                      : dashboard?.[c.key]
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* ── ATTENDANCE PROGRESS ── */}
        {dashboard?.totalDays > 0 && (
          <View style={[styles.attendanceCard, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, ...shadow.sm, shadowColor: colors.shadowColor}]}>
            <View style={styles.attendanceHeader}>
              <Text style={[styles.sectionTitle, {color: colors.textPrimary, marginTop: 0}]}>Attendance</Text>
              <Text style={[styles.attendancePct, {color: attendancePct >= 75 ? colors.success : colors.error}]}>
                {attendancePct}%
              </Text>
            </View>
            <View style={[styles.progressTrack, {backgroundColor: colors.border}]}>
              <View style={[styles.progressFill, {
                width: `${attendancePct}%`,
                backgroundColor: attendancePct >= 75 ? colors.success : colors.error,
              }]} />
            </View>
            <View style={styles.attendanceStats}>
              {[
                {label: 'Present', value: dashboard.presentDays, color: colors.success},
                {label: 'Absent',  value: dashboard.absentDays,  color: colors.error},
                {label: 'Total',   value: dashboard.totalDays,   color: colors.textSecondary},
              ].map(item => (
                <View key={item.label} style={styles.attendanceStat}>
                  <Text style={[styles.attendanceNum, {color: item.color}]}>{item.value ?? 0}</Text>
                  <Text style={[styles.attendanceStatLabel, {color: colors.textSecondary}]}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.attendanceNote, {color: attendancePct >= 75 ? colors.success : colors.error}]}>
              {attendancePct >= 75 ? '✅ Good standing' : '⚠️ Below 75% — at risk'}
            </Text>
          </View>
        )}

        {/* ── QUICK ACCESS ── */}
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>Quick Access</Text>
        <View style={styles.quickRow}>
          {[
            {label: 'Assignments', icon: '📝', screen: 'Assignments'},
            {label: 'My Marks',    icon: '📊', screen: 'Marks'},
            {label: 'Materials',   icon: '📁', screen: 'Materials'},
            {label: 'Attendance',  icon: '✅', screen: 'MyAttendance'},
          ].map(a => (
            <QuickActionBtn
              key={a.label}
              icon={a.icon}
              label={a.label}
              onPress={() => navigation.navigate(a.screen)}
              colors={colors}
              borderRadius={borderRadius}
              spacing={spacing}
            />
          ))}
        </View>

        {/* ── UPCOMING ASSIGNMENTS ── */}
        {assignments.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>Upcoming Tasks</Text>
            {assignments.slice(0, 5).map(item => {
              const over = isOverdue(item.due_date);
              const soon = isDueSoon(item.due_date);
              const accent = over ? colors.error : soon ? colors.warning : colors.primary;
              return (
                <View key={item.id} style={[styles.assignCard, {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.xl,
                  borderLeftColor: accent,
                  ...shadow.sm,
                  shadowColor: colors.shadowColor,
                }]}>
                  <View style={[styles.assignDot, {backgroundColor: accent}]} />
                  <View style={{flex: 1}}>
                    <Text style={[styles.assignTitle, {color: colors.textPrimary}]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.subject?.name && (
                      <Text style={[styles.assignSubject, {color: colors.primary}]}>
                        {item.subject.name}
                      </Text>
                    )}
                  </View>
                  <View style={[styles.assignDateBadge, {backgroundColor: over ? colors.errorFaded : soon ? colors.warningFaded : colors.primaryFaded}]}>
                    <Text style={[styles.assignDateText, {color: accent}]}>
                      {over ? 'Overdue' : fmtDate(item.due_date)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  // Hero
  hero: {paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden'},
  heroContent: {flexDirection: 'row', alignItems: 'center', zIndex: 2},
  heroGreeting: {color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500'},
  heroName: {color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2},
  heroBadge: {alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8},
  heroBadgeText: {color: '#FFFFFF', fontSize: 11, fontWeight: '600'},
  heroAvatar: {width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center'},
  heroBubble1: {position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', top: -30, right: -20},
  heroBubble2: {position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -20, right: 60},

  // Scroll
  scroll: {},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 20},

  // Stats
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  statWrap: {width: '50%', padding: 6},
  statCard: {padding: 16, overflow: 'hidden', position: 'relative', minHeight: 110},
  statIconRow: {marginBottom: 8},
  statIcon: {fontSize: 24},
  statValue: {color: '#FFFFFF', fontSize: 26, fontWeight: '800'},
  statLabel: {color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500', marginTop: 2},
  statAccentCircle: {position: 'absolute', width: 70, height: 70, borderRadius: 35, right: -15, bottom: -15, opacity: 0.5},

  // Attendance
  attendanceCard: {padding: 16, marginTop: 8},
  attendanceHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  attendancePct: {fontSize: 22, fontWeight: '800'},
  progressTrack: {height: 8, borderRadius: 4, overflow: 'hidden', marginVertical: 10},
  progressFill: {height: '100%', borderRadius: 4},
  attendanceStats: {flexDirection: 'row', justifyContent: 'space-around', marginTop: 4},
  attendanceStat: {alignItems: 'center'},
  attendanceNum: {fontSize: 20, fontWeight: '800'},
  attendanceStatLabel: {fontSize: 11, fontWeight: '500', marginTop: 2},
  attendanceNote: {fontSize: 12, fontWeight: '600', marginTop: 10},

  // Quick access
  quickRow: {flexDirection: 'row', gap: 10},
  quickBtn: {flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8},
  quickIconWrap: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  quickLabel: {fontSize: 11, fontWeight: '600', textAlign: 'center'},

  // Assignments
  assignCard: {flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, borderLeftWidth: 4},
  assignDot: {width: 8, height: 8, borderRadius: 4, marginRight: 12},
  assignTitle: {fontSize: 14, fontWeight: '600'},
  assignSubject: {fontSize: 12, marginTop: 2},
  assignDateBadge: {borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4},
  assignDateText: {fontSize: 11, fontWeight: '700'},
});

export default StudentDashboardScreen;
