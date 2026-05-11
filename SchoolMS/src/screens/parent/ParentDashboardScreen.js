import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchParentDashboard, fetchChildren, selectChild} from '../../redux/slices/parentSlice';
import AnnouncementTicker from '../../components/common/AnnouncementTicker';

const ChildCard = ({child, onPress, colors, borderRadius, shadow}) => {
  const isPresent = child.presentToday === true;
  const isAbsent  = child.presentToday === false;
  const attendColor = isPresent ? '#00B894' : isAbsent ? '#FF7675' : colors.textTertiary;
  const attendLabel = isPresent ? '✅ Present' : isAbsent ? '❌ Absent' : '—';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.childCard, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, ...shadow.md, shadowColor: colors.shadowColor}]}>
      {/* Card top accent bar */}
      <View style={[styles.childAccent, {backgroundColor: '#FDCB6E', borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl}]} />

      <View style={{padding: 16}}>
        {/* Child header */}
        <View style={styles.childHeader}>
          <View style={[styles.childAvatar, {backgroundColor: '#FFF0D0'}]}>
            <Text style={{fontSize: 26}}>🧒</Text>
          </View>
          <View style={{flex: 1, marginLeft: 12}}>
            <Text style={[styles.childName, {color: colors.textPrimary}]}>{child.name}</Text>
            {child.class && (
              <Text style={[styles.childClass, {color: colors.textSecondary}]}>🏫 {child.class}</Text>
            )}
          </View>
          <View style={[styles.arrowBadge, {backgroundColor: colors.primaryFaded}]}>
            <Text style={{color: colors.primary, fontSize: 16, fontWeight: '700'}}>›</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, {borderTopColor: colors.border}]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: attendColor}]}>{attendLabel}</Text>
            <Text style={[styles.statKey, {color: colors.textTertiary}]}>Today</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: (child.dueSoonAssignments ?? 0) > 0 ? '#FDCB6E' : '#00B894'}]}>
              {child.dueSoonAssignments ?? 0} tasks
            </Text>
            <Text style={[styles.statKey, {color: colors.textTertiary}]}>Due Soon</Text>
          </View>
          <View style={[styles.statDivider, {backgroundColor: colors.border}]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: colors.textPrimary}]}>{child.totalMarks ?? '—'}</Text>
            <Text style={[styles.statKey, {color: colors.textTertiary}]}>Marks</Text>
          </View>
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={onPress}
          style={[styles.ctaBtn, {backgroundColor: colors.primary, borderRadius: borderRadius.lg}]}>
          <Text style={styles.ctaBtnText}>View Full Progress →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const ParentDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, textStyles, borderRadius, shadow} = useTheme();
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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const childList = dashboard?.children
    ?? children.map(c => ({id: c.id, name: c.user?.name, class: null, presentToday: null, dueSoonAssignments: null, totalMarks: null}));

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB6E" translucent={false} />
      {/* ── HERO ── */}
      <View style={[styles.hero, {backgroundColor: '#FDCB6E', paddingTop: insets.top + 16}]}>
        <View style={styles.heroRow}>
          <View style={{flex: 1}}>
            <Text style={styles.heroGreeting}>{getGreeting()}!</Text>
            <Text style={styles.heroName}>{user?.name ?? 'Parent'}</Text>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Parent Portal</Text>
            </View>
          </View>
          <View style={styles.heroAvatar}>
            <Text style={{fontSize: 30}}>👨‍👩‍👧</Text>
          </View>
        </View>
        <View style={styles.heroBubble1} />
        <View style={styles.heroBubble2} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {paddingHorizontal: spacing.base, paddingBottom: 40}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        <View style={{marginTop: spacing.md}}>
          <AnnouncementTicker accentColor="#FDCB6E" />
        </View>

        <Text style={[styles.sectionTitle, {color: colors.textPrimary, marginTop: spacing.lg}]}>My Children</Text>

        {loading && !dashboard ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 32}} />
        ) : childList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 56}}>👶</Text>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>No children linked yet</Text>
            <Text style={[styles.emptyHint, {color: colors.textTertiary}]}>
              Ask the school admin to link your children's profiles
            </Text>
          </View>
        ) : (
          childList.map(child => (
            <ChildCard
              key={child.id}
              child={child}
              onPress={() => onViewChild(child)}
              colors={colors}
              borderRadius={borderRadius}
              shadow={shadow}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  hero: {paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden'},
  heroRow: {flexDirection: 'row', alignItems: 'center', zIndex: 2},
  heroGreeting: {color: 'rgba(0,0,0,0.55)', fontSize: 13, fontWeight: '500'},
  heroName: {color: '#1A1A1A', fontSize: 22, fontWeight: '800', marginTop: 2},
  heroBadge: {alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8, backgroundColor: 'rgba(0,0,0,0.12)'},
  heroBadgeText: {color: '#1A1A1A', fontSize: 11, fontWeight: '600'},
  heroAvatar: {width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.35)'},
  heroBubble1: {position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', top: -30, right: -20},
  heroBubble2: {position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', bottom: -20, right: 60},

  scroll: {},
  sectionTitle: {fontSize: 16, fontWeight: '700', marginBottom: 12},

  // Child card
  childCard: {marginBottom: 16, overflow: 'hidden'},
  childAccent: {height: 5},
  childHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  childAvatar: {width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center'},
  childName: {fontSize: 16, fontWeight: '700'},
  childClass: {fontSize: 12, marginTop: 2},
  arrowBadge: {width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},

  statsRow: {flexDirection: 'row', borderTopWidth: 1, paddingTop: 12, marginBottom: 14},
  statItem: {flex: 1, alignItems: 'center'},
  statValue: {fontSize: 14, fontWeight: '700'},
  statKey: {fontSize: 11, marginTop: 2},
  statDivider: {width: 1, height: 36},

  ctaBtn: {paddingVertical: 12, alignItems: 'center'},
  ctaBtnText: {color: '#FFFFFF', fontSize: 14, fontWeight: '700'},

  emptyWrap: {alignItems: 'center', paddingTop: 80, paddingHorizontal: 24},
  emptyText: {fontSize: 16, fontWeight: '600', marginTop: 16},
  emptyHint: {fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20},
});

export default ParentDashboardScreen;
