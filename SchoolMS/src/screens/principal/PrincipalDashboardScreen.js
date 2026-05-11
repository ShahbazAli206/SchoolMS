import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDashboardStats} from '../../redux/slices/adminSlice';
import {fetchPrincipalStats, fetchPrincipalComplaints} from '../../redux/slices/complaintSlice';
import AnimatedBackground from '../../components/common/AnimatedBackground';

const StatCard = ({iconBg, iconTint, icon, value, label}) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconWrap, {backgroundColor: iconBg}]}>
      <Text style={[styles.statIcon, {color: iconTint}]}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const PrincipalDashboardScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {user} = useSelector(s => s.auth);
  const {stats: adminStats, statsLoading} = useSelector(s => s.admin);
  const {stats: cmpStats, principalList, loading} = useSelector(s => s.complaints);

  const load = useCallback(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchPrincipalStats());
    dispatch(fetchPrincipalComplaints({limit: 5}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const u = adminStats?.users || {};
  const cs = cmpStats || {};

  return (
    <AnimatedBackground style={{flex: 1}}>
    <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.headerTitle}>Principal Panel</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <View style={styles.avatar}>
            <Text style={{color: '#fff', fontWeight: '800'}}>{(user?.name || 'P').charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{padding: 14, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={statsLoading || loading} onRefresh={load} tintColor="#6C5CE7" />}>

        <LinearGradient colors={['#7B6CF0', '#5A4ED9']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.hero}>
          <View style={{flex: 1}}>
            <Text style={styles.heroSmall}>Welcome,</Text>
            <Text style={styles.heroName}>{user?.name || 'Principal'} 👋</Text>
            <Text style={styles.heroDesc}>School-wide overview and complaints.</Text>
          </View>
          <Text style={{fontSize: 50}}>🎓</Text>
        </LinearGradient>

        <Text style={styles.section}>School Overview</Text>
        <View style={styles.statsRow}>
          <StatCard icon="👥" iconBg="#EEEBFF" iconTint="#6C5CE7"
            value={(u.totalStudents ?? 0).toLocaleString('en-IN')} label="Students" />
          <StatCard icon="👨‍🏫" iconBg="#E5F8F1" iconTint="#00B894"
            value={u.totalTeachers ?? 0} label="Teachers" />
          <StatCard icon="👪" iconBg="#FFEDDA" iconTint="#E17055"
            value={u.totalParents ?? 0} label="Parents" />
          <StatCard icon="💼" iconBg="#E5F0FF" iconTint="#0984E3"
            value={u.totalStaff ?? 0} label="Staff" />
        </View>

        <Text style={[styles.section, {marginTop: 18}]}>Complaints</Text>
        <View style={styles.complaintsRow}>
          <View style={[styles.cmpCard, {backgroundColor: '#FFF1F1'}]}>
            <Text style={[styles.cmpValue, {color: '#D63031'}]}>{cs.pending ?? 0}</Text>
            <Text style={styles.cmpLabel}>Pending</Text>
          </View>
          <View style={[styles.cmpCard, {backgroundColor: '#FFF8E5'}]}>
            <Text style={[styles.cmpValue, {color: '#E1A800'}]}>{cs.in_review ?? 0}</Text>
            <Text style={styles.cmpLabel}>In Review</Text>
          </View>
          <View style={[styles.cmpCard, {backgroundColor: '#E8F8EF'}]}>
            <Text style={[styles.cmpValue, {color: '#00B894'}]}>{cs.resolved ?? 0}</Text>
            <Text style={styles.cmpLabel}>Resolved</Text>
          </View>
        </View>

        <View style={[styles.sectionHeader, {marginTop: 18}]}>
          <Text style={styles.section}>Recent Complaints</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrincipalComplaintsList')}>
            <Text style={styles.link}>View All →</Text>
          </TouchableOpacity>
        </View>

        {(principalList || []).slice(0, 5).map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => navigation.navigate('PrincipalComplaintsList')}
            style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{c.description}</Text>
              <Text style={styles.cardMeta}>
                from {c.submitter?.name || 'User'} {c.tagged_role ? `• ${c.tagged_role}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {(!principalList || principalList.length === 0) && (
          <Text style={{color: '#9CA3AF', fontSize: 12}}>No complaints.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#1F2937'},
  avatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#6C5CE7', alignItems: 'center', justifyContent: 'center'},

  hero: {flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, marginBottom: 16},
  heroSmall: {color: 'rgba(255,255,255,0.85)', fontSize: 12},
  heroName:  {color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginVertical: 2},
  heroDesc:  {color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 17},

  section: {fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 10},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  link: {color: '#6C5CE7', fontSize: 12, fontWeight: '700'},

  statsRow: {flexDirection: 'row', gap: 6},
  statCard: {flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  statIconWrap: {width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  statIcon: {fontSize: 14},
  statValue: {fontSize: 16, fontWeight: '800', color: '#1F2937'},
  statLabel: {fontSize: 10, color: '#6B7280', fontWeight: '600'},

  complaintsRow: {flexDirection: 'row', gap: 8},
  cmpCard: {flex: 1, borderRadius: 12, padding: 14, alignItems: 'center'},
  cmpValue: {fontSize: 22, fontWeight: '800'},
  cmpLabel: {fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2},

  card: {backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  cardTitle: {fontSize: 13, fontWeight: '800', color: '#1F2937'},
  cardSub: {fontSize: 11, color: '#6B7280', marginTop: 2},
  cardMeta: {fontSize: 10, color: '#9CA3AF', marginTop: 4},
});

export default PrincipalDashboardScreen;
