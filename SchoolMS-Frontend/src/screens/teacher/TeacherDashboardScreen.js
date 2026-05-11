import React, {useEffect, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
  Animated, StatusBar, Easing,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchTeacherStats, fetchMyClasses} from '../../redux/slices/teacherSlice';
import {fetchMyNotifications, fetchUnreadCount} from '../../redux/slices/notificationSlice';

// ── Static config ────────────────────────────────────────────────────────────
const STAT_TILES = [
  {key: 'myClasses',             label: 'My Classes',       sub: 'View and manage\nyour classes',         icon: '🏫', tint: '#6C5CE7', bg: '#EEEBFF', highlight: true},
  {key: 'totalAssignments',      label: 'Assignments',      sub: 'Create and evaluate\nassignments',       icon: '📝', tint: '#00B894', bg: '#E5FBF5'},
  {key: 'dueSoonAssignments',    label: 'Due This Week',    sub: 'Assignments & tasks\ndue this week',     icon: '⏰', tint: '#FF7675', bg: '#FFE5E5'},
  {key: 'todayAttendancePct',    label: 'Today Attendance', sub: 'Students present today\nin your classes', icon: '✅', tint: '#FDCB6E', bg: '#FFF7E0', suffix: '%'},
];

const QUICK_ACTIONS = [
  {label: 'Take\nAttendance',    icon: '✅', tint: '#00B894', bg: '#E5FBF5', screen: 'Attendance'},
  {label: 'Assignments',          icon: '📝',  tint: '#6C5CE7', bg: '#EEEBFF', screen: 'Assignments'},
  {label: 'Study\nMaterials',     icon: '📁',  tint: '#FDCB6E', bg: '#FFF7E0', screen: 'UploadMaterial'},
  {label: 'Marks\nEntry',         icon: '📊',  tint: '#0984E3', bg: '#EBF5FF', screen: 'Marks'},
  {label: 'Class\nNotes',         icon: '📋',  tint: '#FF7675', bg: '#FFE5E5', screen: 'TeacherComplaints'},
  {label: 'Communicate\nParents', icon: '💬',  tint: '#00CEC9', bg: '#E0F9F8', screen: 'Chat'},
];

// ── Tile components ──────────────────────────────────────────────────────────
const StatTile = ({tile, value, delay, onPress}) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  {toValue: 1, duration: 450, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic)}),
      Animated.timing(slide, {toValue: 0, duration: 450, delay, useNativeDriver: true, easing: Easing.out(Easing.cubic)}),
    ]).start();
  }, [fade, slide, delay]);

  const display = value ?? '—';
  return (
    <Animated.View style={{width: '50%', padding: 6, opacity: fade, transform: [{translateY: slide}]}}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.statCard,
          {backgroundColor: tile.bg, borderColor: tile.highlight ? tile.tint : 'transparent'},
        ]}>
        <View style={[styles.statIconWrap, {backgroundColor: '#FFFFFF'}]}>
          <Text style={styles.statIcon}>{tile.icon}</Text>
        </View>
        <Text style={[styles.statValue, {color: '#1F2937'}]}>
          {display === '—' ? '—' : `${display}${tile.suffix || ''}`}
        </Text>
        <Text style={styles.statLabel}>{tile.label}</Text>
        <Text style={styles.statSub} numberOfLines={2}>{tile.sub}</Text>
        <View style={[styles.statChev, {backgroundColor: tile.tint + '22'}]}>
          <Text style={{color: tile.tint, fontWeight: '700', fontSize: 14}}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const QuickAction = ({action, delay, onPress}) => {
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  {toValue: 1, duration: 380, delay, useNativeDriver: true}),
      Animated.spring(scale, {toValue: 1, friction: 6, delay, useNativeDriver: true}),
    ]).start();
  }, [fade, scale, delay]);

  return (
    <Animated.View style={{opacity: fade, transform: [{scale}]}}>
      <TouchableOpacity
        onPressIn={() => Animated.spring(press, {toValue: 0.92, useNativeDriver: true}).start()}
        onPressOut={() => Animated.spring(press, {toValue: 1, friction: 4, useNativeDriver: true}).start()}
        onPress={onPress}
        activeOpacity={1}>
        <Animated.View style={[styles.quickCard, {transform: [{scale: press}]}]}>
          <View style={[styles.quickIconWrap, {backgroundColor: action.bg}]}>
            <Text style={{fontSize: 18, color: action.tint}}>{action.icon}</Text>
          </View>
          <Text style={styles.quickLabel} numberOfLines={2}>{action.label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ScheduleCard = ({cls, onPress}) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, {toValue: 1, duration: 500, delay: 400, useNativeDriver: true}).start(); }, [fade]);
  const subject = cls?.next_subject || cls?.subject || 'Class Session';
  const className = cls ? `${cls.name}${cls.section ? ` — ${cls.section}` : ''}` : '—';
  return (
    <Animated.View style={{opacity: fade}}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.scheduleCard}>
        <View style={styles.scheduleBar} />
        <View style={{paddingHorizontal: 12, alignItems: 'center'}}>
          <Text style={styles.scheduleTimeTop}>09:00 <Text style={styles.scheduleTimeUnit}>AM</Text></Text>
          <Text style={styles.scheduleSep}>—</Text>
          <Text style={styles.scheduleTimeTop}>09:45 <Text style={styles.scheduleTimeUnit}>AM</Text></Text>
        </View>
        <View style={{flex: 1, marginLeft: 4}}>
          <Text style={styles.scheduleSubject} numberOfLines={1}>{subject}</Text>
          <Text style={styles.scheduleClass} numberOfLines={1}>{className}</Text>
        </View>
        <View style={styles.scheduleStatus}>
          <Text style={styles.scheduleStatusText}>In Progress</Text>
        </View>
        <Text style={styles.scheduleChev}>›</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnnouncementCard = ({item, onPress}) => {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fade, {toValue: 1, duration: 500, delay: 500, useNativeDriver: true}).start(); }, [fade]);
  return (
    <Animated.View style={{opacity: fade}}>
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.annCard}>
        <View style={styles.annIconWrap}>
          <Text style={{fontSize: 22}}>📣</Text>
        </View>
        <View style={{flex: 1, marginLeft: 12}}>
          <Text style={styles.annTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.annBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.annMeta}>
            Posted by {item.sender || 'Admin'}  ·  {new Date(item.createdAt).toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})}
          </Text>
        </View>
        <TouchableOpacity hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={styles.annMenu}>⋮</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Main screen ──────────────────────────────────────────────────────────────
const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const {stats, classes, loading} = useSelector(s => s.teacher);
  const {items: notifs, unreadCount} = useSelector(s => s.notifications);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchTeacherStats());
    dispatch(fetchMyClasses());
    dispatch(fetchMyNotifications({page: 1, limit: 10}));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return {text: 'Good Morning!', emoji: '☀️'};
    if (h < 17) return {text: 'Good Afternoon!', emoji: '🌤️'};
    return {text: 'Good Evening!', emoji: '🌙'};
  })();

  const todayDate = new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});

  // pick latest announcement (notifications of type 'announcement', else any notif)
  const announcement = (notifs || []).find(n => n.type === 'announcement') || (notifs || [])[0];

  const goAction = (screen) => {
    // Tabs: switch to a sibling tab (Classes/Students/Profile).
    // Quick-action "Chat" → open Conversations (lives in HomeStack now).
    const TAB_TARGETS = {
      TeacherClasses:  'ClassesTab',
      TeacherStudents: 'StudentsTab',
      ProfileTab:      'ProfileTab',
    };
    if (TAB_TARGETS[screen]) {
      navigation.getParent()?.navigate(TAB_TARGETS[screen]);
      return;
    }
    if (screen === 'Chat') {
      navigation.navigate('Conversations');
      return;
    }
    // Everything else is a screen inside the current HomeStack
    navigation.navigate(screen);
  };

  const statValue = (key) => {
    if (!stats) return null;
    if (key === 'todayAttendancePct') {
      const t = stats.todayAttendanceMarked || 0;
      const total = stats.totalStudents || 0;
      return total > 0 ? Math.round((t / total) * 100) : 0;
    }
    return stats[key];
  };

  return (
    <View style={[styles.container, {backgroundColor: '#F5F6FB'}]}>
      <StatusBar barStyle="light-content" backgroundColor="#2F5BFF" translucent={false} />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#2F5BFF', '#1A8FE3', '#00B5A5']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.hero, {paddingTop: insets.top + 14}]}>
        <View style={styles.heroPattern} pointerEvents="none">
          <Text style={[styles.heroPatternIcon, {top: 30, left: 240, fontSize: 22}]}>📘</Text>
          <Text style={[styles.heroPatternIcon, {top: 60, left: 290, fontSize: 18}]}>✏️</Text>
          <Text style={[styles.heroPatternIcon, {top: 110, left: 220, fontSize: 20}]}>🧪</Text>
          <Text style={[styles.heroPatternIcon, {top: 100, left: 300, fontSize: 16}]}>📐</Text>
        </View>

        <View style={styles.heroTop}>
          <View style={styles.heroLogo}>
            <Text style={{fontSize: 26}}>🛡️</Text>
          </View>

          <View style={{flex: 1, marginLeft: 6}}>
            <Text style={styles.heroGreet}>{greeting.text} {greeting.emoji}</Text>
            <Text style={styles.heroName} numberOfLines={1}>{user?.name ?? 'Teacher'}</Text>
            <Text style={styles.heroWelcome} numberOfLines={1}>Welcome back, have a great day!</Text>
            <View style={styles.heroPill}>
              <Text style={{fontSize: 11, marginRight: 4}}>👤</Text>
              <Text style={styles.heroPillText}>Teacher Portal</Text>
            </View>
          </View>

          <View style={styles.heroRight}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Notifications')}
              style={styles.heroBellWrap}>
              <Text style={{fontSize: 22, color: '#fff'}}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.heroBadge}>
                  <Text style={styles.heroBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.getParent()?.navigate('ProfileTab')}
              style={styles.heroAvatarWrap}>
              <View style={styles.heroAvatar}>
                <Text style={{fontSize: 28}}>👨‍🏫</Text>
              </View>
              <View style={styles.heroAvatarDot} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: insets.bottom + 120}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#6C5CE7" />}>

        {/* Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.dateChip}>
              <Text style={styles.dateChipText}>📅 {todayDate}</Text>
              <Text style={{color: '#9CA3AF', marginLeft: 6}}>▾</Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            {STAT_TILES.map((tile, i) => (
              <StatTile
                key={tile.key}
                tile={tile}
                value={statValue(tile.key)}
                delay={i * 80}
                onPress={() => {
                  const map = {myClasses: 'TeacherClasses', totalAssignments: 'Assignments', dueSoonAssignments: 'Assignments', todayAttendancePct: 'Attendance'};
                  goAction(map[tile.key]);
                }}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('ClassesTab')}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 12, paddingVertical: 4}}>
            {QUICK_ACTIONS.map((a, i) => (
              <View key={a.label} style={{marginRight: 6}}>
                <QuickAction action={a} delay={150 + i * 60} onPress={() => goAction(a.screen)} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('ClassesTab')}>
              <Text style={styles.viewAll}>View Timetable →</Text>
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 14}}>
            <ScheduleCard
              cls={classes?.[0]}
              onPress={() => navigation.getParent()?.navigate('ClassesTab')}
            />
          </View>
        </View>

        {/* Recent Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Announcements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={{paddingHorizontal: 14}}>
            {announcement ? (
              <AnnouncementCard item={announcement} onPress={() => navigation.navigate('Notifications')} />
            ) : loading ? (
              <ActivityIndicator color="#6C5CE7" style={{marginTop: 20}} />
            ) : (
              <View style={styles.annEmpty}>
                <Text style={{fontSize: 28}}>🔕</Text>
                <Text style={{color: '#9CA3AF', marginTop: 8}}>No announcements yet</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1},

  // Hero
  hero: {paddingHorizontal: 18, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: 'hidden'},
  heroPattern: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.18},
  heroPatternIcon: {position: 'absolute'},
  heroTop: {flexDirection: 'row', alignItems: 'center'},
  heroLogo: {width: 50, height: 50, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)'},
  heroGreet: {color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '500'},
  heroName: {color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginTop: 2},
  heroWelcome: {color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2},
  heroPill: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8},
  heroPillText: {color: '#FFFFFF', fontSize: 11, fontWeight: '600'},
  heroRight: {alignItems: 'flex-end'},
  heroBellWrap: {padding: 6, marginBottom: 6},
  heroBadge: {position: 'absolute', top: 2, right: 0, backgroundColor: '#FF4757', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff'},
  heroBadgeText: {color: '#fff', fontSize: 10, fontWeight: '800'},
  heroAvatarWrap: {},
  heroAvatar: {width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'},
  heroAvatarDot: {position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34D399', borderWidth: 2, borderColor: '#fff'},

  // Sections
  section: {marginTop: 16},
  sectionHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginBottom: 10},
  sectionTitle: {fontSize: 17, fontWeight: '800', color: '#1F2937'},
  viewAll: {color: '#6C5CE7', fontWeight: '700', fontSize: 12},
  dateChip: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: {width: 0, height: 1}, elevation: 1},
  dateChipText: {color: '#1F2937', fontSize: 11, fontWeight: '600'},

  // Stat tiles (2x2)
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12},
  statCard: {borderRadius: 18, padding: 14, position: 'relative', minHeight: 130, borderWidth: 1.5, overflow: 'hidden'},
  statIconWrap: {width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 6, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: {width: 0, height: 1}},
  statIcon: {fontSize: 20},
  statValue: {fontSize: 24, fontWeight: '800'},
  statLabel: {fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 1},
  statSub: {fontSize: 10.5, color: '#6B7280', marginTop: 4, lineHeight: 14},
  statChev: {position: 'absolute', right: 10, bottom: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center'},

  // Quick Actions
  quickCard: {width: 58, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 2, backgroundColor: '#FFFFFF', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: {width: 0, height: 2}, elevation: 2},
  quickIconWrap: {width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 5},
  quickLabel: {fontSize: 9.5, fontWeight: '700', color: '#374151', textAlign: 'center', lineHeight: 12},

  // Schedule card
  scheduleCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, paddingRight: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: {width: 0, height: 2}, elevation: 2},
  scheduleBar: {width: 4, height: 50, borderRadius: 2, backgroundColor: '#34D399', marginLeft: 12},
  scheduleTimeTop: {color: '#1F2937', fontSize: 12, fontWeight: '700'},
  scheduleTimeUnit: {color: '#9CA3AF', fontSize: 10, fontWeight: '500'},
  scheduleSep: {color: '#D1D5DB', fontSize: 10, marginVertical: 2},
  scheduleSubject: {color: '#1F2937', fontSize: 15, fontWeight: '800'},
  scheduleClass: {color: '#6B7280', fontSize: 12, marginTop: 2},
  scheduleStatus: {backgroundColor: '#E5FBF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10},
  scheduleStatusText: {color: '#00B894', fontSize: 11, fontWeight: '700'},
  scheduleChev: {color: '#9CA3AF', fontSize: 22, marginLeft: 6},

  // Announcement card
  annCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: {width: 0, height: 2}, elevation: 2},
  annIconWrap: {width: 48, height: 48, borderRadius: 14, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center'},
  annTitle: {fontSize: 14, fontWeight: '800', color: '#1F2937'},
  annBody: {fontSize: 12, color: '#4B5563', marginTop: 2, lineHeight: 17},
  annMeta: {fontSize: 10.5, color: '#9CA3AF', marginTop: 6},
  annMenu: {color: '#9CA3AF', fontSize: 18, fontWeight: '700', paddingHorizontal: 4},
  annEmpty: {alignItems: 'center', paddingVertical: 30, backgroundColor: '#FFFFFF', borderRadius: 14},
});

export default TeacherDashboardScreen;
