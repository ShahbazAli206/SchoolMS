import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Image, Alert,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {fetchDashboardStats} from '../../redux/slices/adminSlice';
import {fetchFeeDashboard} from '../../redux/slices/feeSlice';
import {fetchAdminStats} from '../../redux/slices/complaintSlice';
import {useTheme} from '../../themes/ThemeContext';
import AnimatedBackground from '../../components/common/AnimatedBackground';

const fmtINR = n => {
  if (n == null) return '₹0';
  const num = Number(n) || 0;
  return '₹' + num.toLocaleString('en-IN');
};

const TodayPill = () => {
  const d = new Date();
  const txt = d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});
  return (
    <View style={styles.datePill}>
      <Text style={styles.datePillIcon}>📅</Text>
      <Text style={styles.datePillText}>{txt}</Text>
    </View>
  );
};

const StatBox = ({iconBg, iconTint, icon, value, label, delta, deltaColor}) => (
  <View style={styles.statBox}>
    <View style={[styles.statIconWrap, {backgroundColor: iconBg}]}>
      <Text style={[styles.statIcon, {color: iconTint}]}>{icon}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    <View style={styles.statDeltaRow}>
      <Text style={[styles.statDelta, {color: deltaColor}]}>↑ {delta} this month</Text>
    </View>
  </View>
);

const FeeMetric = ({iconBg, iconTint, icon, amount, label, sub, subColor}) => (
  <View style={styles.feeMetric}>
    <View style={[styles.feeIconWrap, {backgroundColor: iconBg}]}>
      <Text style={[styles.feeIcon, {color: iconTint}]}>{icon}</Text>
    </View>
    <Text style={styles.feeAmount}>{amount}</Text>
    <Text style={styles.feeLabel}>{label}</Text>
    {sub ? <Text style={[styles.feeSub, {color: subColor}]}>{sub}</Text> : null}
  </View>
);

const ModuleCard = ({iconBg, iconTint, icon, title, subtitle, onPress}) => (
  <TouchableOpacity style={styles.moduleCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.moduleIconWrap, {backgroundColor: iconBg}]}>
      <Text style={[styles.moduleIcon, {color: iconTint}]}>{icon}</Text>
    </View>
    <Text style={styles.moduleTitle}>{title}</Text>
    <Text style={styles.moduleSubtitle} numberOfLines={2}>{subtitle}</Text>
  </TouchableOpacity>
);

const ComplaintStat = ({bg, iconBg, iconTint, icon, value, label}) => (
  <View style={[styles.complaintCard, {backgroundColor: bg}]}>
    <View style={[styles.complaintIconWrap, {backgroundColor: iconBg}]}>
      <Text style={[styles.complaintIcon, {color: iconTint}]}>{icon}</Text>
    </View>
    <View style={{flex: 1}}>
      <Text style={styles.complaintValue}>{value}</Text>
      <Text style={styles.complaintLabel}>{label}</Text>
    </View>
  </View>
);

const AdminDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, isDark} = useTheme();
  const {stats, statsLoading} = useSelector(s => s.admin);
  const feeDash = useSelector(s => s.fees?.dashboard);
  const complaintStats = useSelector(s => s.complaints?.adminStats || s.complaints?.stats);
  const {user} = useSelector(s => s.auth);
  const unreadCount = useSelector(s => s.notifications?.unreadCount ?? 0);

  const load = useCallback(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchFeeDashboard());
    dispatch(fetchAdminStats());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const u = stats?.users || {};
  const totalStudents = u.totalStudents ?? 1245;
  const totalTeachers = u.totalTeachers ?? 87;
  const totalParents  = u.totalParents  ?? 312;
  const totalStaff    = u.totalStaff    ?? 45;

  const feeStats = feeDash?.stats || {};
  const totalFees = feeStats.totalFees ?? 1245000;
  const collected = feeStats.collected ?? 875000;
  const pending   = feeStats.pending   ?? 245000;
  const overdue   = feeStats.overdue   ?? 125000;
  const pct = (n, d) => (d > 0 ? ((n / d) * 100) : 0);
  const collectedPct = pct(collected, totalFees);
  const pendingPct   = pct(pending,   totalFees);
  const overduePct   = pct(overdue,   totalFees);

  const cmp = complaintStats || {};
  const cmpPending  = cmp.pending  ?? 12;
  const cmpReview   = cmp.in_review ?? 8;
  const cmpResolved = cmp.resolved ?? 25;

  const goUsers = roleFilter => {
    navigation.navigate('Dashboard', {
      screen: 'UserManagementMain',
      params: {defaultRole: roleFilter || 'all'},
    });
  };

  const greeting = user?.name ?? 'Admin';

  return (
    <AnimatedBackground style={{flex: 1}}>
    <SafeAreaView style={[styles.container, {backgroundColor: 'transparent'}]} edges={['left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBg}
        translucent={false}
      />

      {/* ─── HEADER ─── */}
      <View style={[styles.headerBar, {
        paddingTop: insets.top + 10,
        backgroundColor: colors.headerBg,
        borderBottomColor: colors.headerBorder,
      }]}>
        <View style={styles.brandRow}>
          <View style={styles.schoolLogo}>
            <Text style={styles.schoolLogoText}>🏫</Text>
          </View>
          <View style={styles.brandTextWrap}>
            <Text style={[styles.brandTitle, {color: colors.headerText}]} numberOfLines={1}>Greenfield Public School</Text>
            <Text style={[styles.brandSubtitle, {color: colors.textSecondary}]} numberOfLines={1}>School Management System</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Text style={styles.headerIconText}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileWrap}
            onPress={() => navigation.navigate('Settings')}>
            {user?.profile_image ? (
              <Image source={{uri: user.profile_image}} style={styles.profileImg} />
            ) : (
              <View style={[styles.profileImg, {backgroundColor: '#A29BFE', alignItems: 'center', justifyContent: 'center'}]}>
                <Text style={{color: '#fff', fontWeight: '800', fontSize: 14}}>
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{paddingBottom: 140}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={statsLoading} onRefresh={load} tintColor="#6C5CE7" />
        }>

        {/* ─── WELCOME HERO ─── */}
        <View style={styles.heroOuter}>
          <LinearGradient
            colors={['#7B6CF0', '#5A4ED9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.heroCard}>
            <View style={{flex: 1, paddingRight: 8}}>
              <Text style={styles.heroSmall}>Welcome back,</Text>
              <Text style={styles.heroName}>{greeting} <Text style={{fontSize: 22}}>👋</Text></Text>
              <Text style={styles.heroDesc}>Here's what's happening in your school today.</Text>
            </View>
            <View style={styles.heroRight}>
              <TodayPill />
              <View style={styles.heroIllustration}>
                <Text style={styles.heroIllustrationText}>🏫</Text>
              </View>
            </View>
            {/* clouds */}
            <View style={[styles.cloud, {top: 18, right: 78, opacity: 0.55}]} />
            <View style={[styles.cloud, {top: 38, right: 110, opacity: 0.4, width: 28, height: 12}]} />
          </LinearGradient>
        </View>

        {/* ─── STAT CARDS ─── */}
        <View style={styles.statsRow}>
          <StatBox icon="👥" iconBg="#EEEBFF" iconTint="#6C5CE7"
            value={totalStudents.toLocaleString('en-IN')} label="Students"
            delta={u.studentsThisMonth ?? 12} deltaColor="#00B894" />
          <StatBox icon="👨‍🏫" iconBg="#E5F8F1" iconTint="#00B894"
            value={String(totalTeachers)} label="Teachers"
            delta={u.teachersThisMonth ?? 3} deltaColor="#00B894" />
          <StatBox icon="👪" iconBg="#FFEDDA" iconTint="#E17055"
            value={String(totalParents)} label="Parents"
            delta={u.parentsThisMonth ?? 8} deltaColor="#00B894" />
          <StatBox icon="💼" iconBg="#E5F0FF" iconTint="#0984E3"
            value={String(totalStaff)} label="Staff"
            delta={u.staffThisMonth ?? 2} deltaColor="#00B894" />
        </View>

        {/* ─── FEE OVERVIEW ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Fee Overview</Text>
            <TouchableOpacity style={styles.monthChip}>
              <Text style={styles.monthChipText}>
                {new Date().toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}
              </Text>
              <Text style={styles.monthChipChevron}>▾</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.feeMetricsRow}>
            <FeeMetric icon="💼" iconBg="#E5F8F1" iconTint="#00B894"
              amount={fmtINR(totalFees)} label="Total Fees" sub="This Month" subColor="#9CA3AF" />
            <View style={styles.feeDivider} />
            <FeeMetric icon="✅" iconBg="#E5F0FF" iconTint="#0984E3"
              amount={fmtINR(collected)} label="Collected"
              sub={`${collectedPct.toFixed(2)}%`} subColor="#0984E3" />
            <View style={styles.feeDivider} />
            <FeeMetric icon="⏰" iconBg="#FFEDDA" iconTint="#E17055"
              amount={fmtINR(pending)} label="Pending"
              sub={`${pendingPct.toFixed(2)}%`} subColor="#E17055" />
            <View style={styles.feeDivider} />
            <FeeMetric icon="❌" iconBg="#FFE5E5" iconTint="#D63031"
              amount={fmtINR(overdue)} label="Overdue"
              sub={`${overduePct.toFixed(2)}%`} subColor="#D63031" />
          </View>

          {/* multi-segment progress */}
          <View style={styles.progressBar}>
            <View style={{flex: collectedPct, backgroundColor: '#00B894'}} />
            <View style={{flex: pendingPct, backgroundColor: '#0984E3'}} />
            <View style={{flex: overduePct, backgroundColor: '#FDCB6E'}} />
            <View style={{flex: Math.max(0, 100 - collectedPct - pendingPct - overduePct), backgroundColor: '#FF7675'}} />
          </View>

          <View style={styles.collectionFooter}>
            <View style={styles.collectionFooterLeft}>
              <Text style={styles.collectionFooterIcon}>📈</Text>
              <Text style={styles.collectionFooterText}>
                Overall Collection: <Text style={{fontWeight: '800'}}>{collectedPct.toFixed(2)}%</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewReportBtn}
              onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.viewReportText}>View Full Report</Text>
              <Text style={styles.viewReportArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── MODULES ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Modules</Text>
            <TouchableOpacity onPress={() => goUsers()}>
              <Text style={styles.linkText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modulesGrid}>
            <ModuleCard icon="🎓" iconBg="#EEEBFF" iconTint="#6C5CE7"
              title="Students" subtitle="Manage student records"
              onPress={() => goUsers('student')} />
            <ModuleCard icon="📚" iconBg="#E5F8F1" iconTint="#00B894"
              title="Teachers" subtitle="Manage teacher records"
              onPress={() => goUsers('teacher')} />
            <ModuleCard icon="👨‍👩‍👧" iconBg="#FFEDDA" iconTint="#E17055"
              title="Parents" subtitle="Manage parent records"
              onPress={() => goUsers('parent')} />

            <ModuleCard icon="💼" iconBg="#E5F0FF" iconTint="#0984E3"
              title="Staff" subtitle="Manage staff records"
              onPress={() => goUsers('staff')} />
            <ModuleCard icon="💳" iconBg="#E0F9F8" iconTint="#00A8A4"
              title="Fees" subtitle="Fee collection & management"
              onPress={() => navigation.navigate('Reports')} />
            <ModuleCard icon="💬" iconBg="#FFE5E5" iconTint="#D63031"
              title="Complaints" subtitle="View all complaints & their status"
              onPress={() => navigation.navigate('Complaints')} />

            <ModuleCard icon="🔗" iconBg="#F0EEFF" iconTint="#A29BFE"
              title="Assignments" subtitle="Assign teachers to classes"
              onPress={() => navigation.navigate('AssignTeacher')} />
            <ModuleCard icon="📋" iconBg="#E5F0FF" iconTint="#0984E3"
              title="Exams" subtitle="Manage exams & results"
              onPress={() => Alert.alert('Coming soon', 'Exams module coming soon.')} />
            <ModuleCard icon="🗓️" iconBg="#FFFBE5" iconTint="#E1A800"
              title="Events" subtitle="Holidays, exams, PTM & alerts"
              onPress={() => navigation.navigate('AdminEvents')} />
            <ModuleCard icon="🎬" iconBg="#F0EEFF" iconTint="#6C5CE7"
              title="Materials" subtitle="View & manage all teacher uploads"
              onPress={() => navigation.navigate('AdminMaterials')} />
          </View>
        </View>

        {/* ─── COMPLAINT OVERVIEW ─── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Complaint Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Complaints')}>
              <Text style={styles.linkText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.complaintRow}>
            <ComplaintStat bg="#FFF1F1" icon="😟" iconBg="#FFE0E0" iconTint="#D63031"
              value={cmpPending} label="Pending" />
            <ComplaintStat bg="#FFF8E5" icon="⏳" iconBg="#FFEFC2" iconTint="#E1A800"
              value={cmpReview} label="Under Action" />
            <ComplaintStat bg="#E8F8EF" icon="✅" iconBg="#CFEFD9" iconTint="#00B894"
              value={cmpResolved} label="Closed" />
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  /* ─── HEADER ─── */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerIconBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 4,
  },
  menuIcon: {alignItems: 'flex-start', justifyContent: 'center', height: 18},
  menuLine: {height: 2, backgroundColor: '#1F2937', borderRadius: 1, marginVertical: 2},
  brandRow: {flex: 1, flexDirection: 'row', alignItems: 'center'},
  schoolLogo: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#EEEBFF',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  schoolLogoText: {fontSize: 20},
  brandTextWrap: {flex: 1},
  brandTitle: {fontSize: 13, fontWeight: '800', color: '#1F2937'},
  brandSubtitle: {fontSize: 10, color: '#9CA3AF', marginTop: 1},
  headerActions: {flexDirection: 'row', alignItems: 'center'},
  headerIconText: {fontSize: 18},
  bellBadge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: '#6C5CE7',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellBadgeText: {color: '#fff', fontSize: 10, fontWeight: '800'},
  profileWrap: {marginLeft: 4},
  profileImg: {width: 36, height: 36, borderRadius: 18},

  /* ─── HERO ─── */
  heroOuter: {paddingHorizontal: 14, paddingTop: 14},
  heroCard: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 18,
    minHeight: 150,
    overflow: 'hidden',
  },
  heroSmall: {color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500'},
  heroName: {color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginTop: 2, marginBottom: 8},
  heroDesc: {color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 17, maxWidth: 200},
  heroRight: {alignItems: 'flex-end', justifyContent: 'space-between'},
  datePill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  datePillIcon: {fontSize: 11, marginRight: 4, color: '#FFFFFF'},
  datePillText: {color: '#FFFFFF', fontSize: 11, fontWeight: '700'},
  heroIllustration: {
    width: 70, height: 70, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 10,
  },
  heroIllustrationText: {fontSize: 38},
  cloud: {
    position: 'absolute',
    width: 40, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },

  /* ─── STAT CARDS ─── */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  statIcon: {fontSize: 16},
  statValue: {fontSize: 18, fontWeight: '800', color: '#1F2937'},
  statLabel: {fontSize: 11, color: '#6B7280', marginTop: 1, fontWeight: '500'},
  statDeltaRow: {marginTop: 6},
  statDelta: {fontSize: 9, fontWeight: '700'},

  /* ─── CARD ─── */
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {fontSize: 16, fontWeight: '800', color: '#1F2937'},
  linkText: {color: '#6C5CE7', fontSize: 13, fontWeight: '700'},

  monthChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  monthChipText: {color: '#1F2937', fontSize: 12, fontWeight: '700'},
  monthChipChevron: {color: '#6B7280', fontSize: 10, marginLeft: 6},

  /* ─── FEE METRICS ─── */
  feeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  feeMetric: {flex: 1, alignItems: 'center', paddingHorizontal: 2},
  feeIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  feeIcon: {fontSize: 16},
  feeAmount: {fontSize: 12, fontWeight: '800', color: '#1F2937', textAlign: 'center'},
  feeLabel: {fontSize: 10, color: '#6B7280', marginTop: 2, fontWeight: '500'},
  feeSub: {fontSize: 10, fontWeight: '700', marginTop: 1},
  feeDivider: {width: 1, alignSelf: 'stretch', backgroundColor: '#F3F4F6', marginVertical: 6},

  progressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },

  collectionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  collectionFooterLeft: {flexDirection: 'row', alignItems: 'center', flex: 1},
  collectionFooterIcon: {fontSize: 14, marginRight: 6},
  collectionFooterText: {fontSize: 12, color: '#1F2937', fontWeight: '600'},
  viewReportBtn: {flexDirection: 'row', alignItems: 'center'},
  viewReportText: {color: '#6C5CE7', fontSize: 12, fontWeight: '800'},
  viewReportArrow: {color: '#6C5CE7', fontSize: 14, marginLeft: 4, fontWeight: '800'},

  /* ─── MODULES ─── */
  modulesGrid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4},
  moduleCard: {
    width: '33.33%',
    padding: 4,
  },
  moduleIconWrap: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  moduleIcon: {fontSize: 18},
  moduleTitle: {fontSize: 13, fontWeight: '800', color: '#1F2937'},
  moduleSubtitle: {fontSize: 10, color: '#9CA3AF', marginTop: 2, lineHeight: 13},

  /* ─── COMPLAINTS ─── */
  complaintRow: {flexDirection: 'row', gap: 10},
  complaintCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
  },
  complaintIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  complaintIcon: {fontSize: 16},
  complaintValue: {fontSize: 18, fontWeight: '800', color: '#1F2937'},
  complaintLabel: {fontSize: 10, color: '#6B7280', fontWeight: '600', marginTop: 1},

  /* ─── FLOATING WHATSAPP ─── */
  fabWhatsApp: {
    position: 'absolute',
    left: 18,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#25D366',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
  fabWhatsAppIcon: {fontSize: 22, color: '#FFFFFF'},
});

export default AdminDashboardScreen;
