import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {fetchStaffStats, fetchStaffComplaints} from '../../redux/slices/complaintSlice';
import AnimatedBackground from '../../components/common/AnimatedBackground';

const StatTile = ({bg, iconBg, iconTint, icon, value, label}) => (
  <View style={[styles.tile, {backgroundColor: bg}]}>
    <View style={[styles.tileIcon, {backgroundColor: iconBg}]}>
      <Text style={{fontSize: 16, color: iconTint}}>{icon}</Text>
    </View>
    <Text style={styles.tileValue}>{value}</Text>
    <Text style={styles.tileLabel}>{label}</Text>
  </View>
);

const StaffDashboardScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {user} = useSelector(s => s.auth);
  const {stats, staffList, loading} = useSelector(s => s.complaints);

  const load = useCallback(() => {
    dispatch(fetchStaffStats());
    dispatch(fetchStaffComplaints({limit: 5}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const s = stats || {};
  const recent = (staffList || []).slice(0, 5);

  return (
    <AnimatedBackground style={{flex: 1}}>
    <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={[styles.header, {paddingTop: insets.top + 8}]}>
        <Text style={styles.headerTitle}>Staff Panel</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <View style={styles.avatar}>
            <Text style={{color: '#fff', fontWeight: '800'}}>{(user?.name || 'S').charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{padding: 14, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#6C5CE7" />}>

        <LinearGradient colors={['#7B6CF0', '#5A4ED9']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.hero}>
          <View style={{flex: 1}}>
            <Text style={styles.heroSmall}>Welcome,</Text>
            <Text style={styles.heroName}>{user?.name || 'Staff'} 👋</Text>
            <Text style={styles.heroDesc}>Manage complaints assigned to school staff.</Text>
          </View>
          <Text style={{fontSize: 50}}>💼</Text>
        </LinearGradient>

        <Text style={styles.section}>Complaints Overview</Text>
        <View style={styles.tilesRow}>
          <StatTile bg="#FFF1F1" iconBg="#FFE0E0" iconTint="#D63031" icon="😟"
            value={s.pending ?? 0} label="Pending" />
          <StatTile bg="#FFF8E5" iconBg="#FFEFC2" iconTint="#E1A800" icon="⏳"
            value={s.in_review ?? 0} label="In Review" />
          <StatTile bg="#E8F8EF" iconBg="#CFEFD9" iconTint="#00B894" icon="✅"
            value={s.resolved ?? 0} label="Resolved" />
        </View>

        <View style={[styles.sectionHeader, {marginTop: 18}]}>
          <Text style={styles.section}>Recent Complaints</Text>
          <TouchableOpacity onPress={() => navigation.navigate('StaffComplaintsList')}>
            <Text style={styles.link}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recent.length === 0 ? (
          <Text style={{color: '#9CA3AF', fontSize: 12}}>No complaints yet.</Text>
        ) : recent.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => navigation.navigate('StaffComplaintsList')}
            style={styles.card}>
            <View style={{flex: 1}}>
              <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>{c.description}</Text>
            </View>
            <View style={[styles.statusPill, {backgroundColor: c.status === 'resolved' ? '#E8F8EF' : c.status === 'in_review' ? '#FFF8E5' : '#FFF1F1'}]}>
              <Text style={{fontSize: 9, fontWeight: '800', color: c.status === 'resolved' ? '#00B894' : c.status === 'in_review' ? '#E1A800' : '#D63031', textTransform: 'uppercase'}}>
                {c.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EFEFF4'},
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#1F2937'},
  avatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#A29BFE', alignItems: 'center', justifyContent: 'center'},

  hero: {flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 18, marginBottom: 16},
  heroSmall: {color: 'rgba(255,255,255,0.85)', fontSize: 12},
  heroName:  {color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginVertical: 2},
  heroDesc:  {color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 17},

  section: {fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 10},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  link: {color: '#6C5CE7', fontSize: 12, fontWeight: '700'},

  tilesRow: {flexDirection: 'row', gap: 8},
  tile: {flex: 1, borderRadius: 12, padding: 12, alignItems: 'flex-start'},
  tileIcon: {width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  tileValue: {fontSize: 22, fontWeight: '800', color: '#1F2937'},
  tileLabel: {fontSize: 11, color: '#6B7280', fontWeight: '600'},

  card: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1},
  cardTitle: {fontSize: 13, fontWeight: '800', color: '#1F2937'},
  cardSub: {fontSize: 11, color: '#6B7280', marginTop: 2},
  statusPill: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 8},
});

export default StaffDashboardScreen;
