import React, {useEffect, useCallback, useRef} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl, Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {fetchFeeDashboard, fetchAllFees, deleteFeeThunk} from '../../redux/slices/feeSlice';

const FEE_TYPE_ICONS = {
  tuition: '🎓', transport: '🚌', exam: '📝',
  library: '📚', sports: '⚽', other: '💰',
};

const STATUS_CONFIG = {
  paid:    {label: 'Paid',    bg: 'successFaded', text: 'success'},
  partial: {label: 'Partial', bg: 'warningFaded', text: 'warning'},
  pending: {label: 'Pending', bg: 'errorFaded',   text: 'error'},
};

const AdminFeesDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {dashboard, fees, loading} = useSelector(s => s.fees);

  const load = useCallback(() => {
    dispatch(fetchFeeDashboard());
    dispatch(fetchAllFees({limit: 30}));
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = fee => {
    Alert.alert('Delete Fee', `Delete "${fee.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteFeeThunk(fee.id))},
    ]);
  };

  const StatCard = ({label, value, icon, accent, faded, prefix = ''}) => {
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
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl,
              padding: spacing.md,
              ...shadow.sm,
              shadowColor: colors.shadowColor,
              borderLeftWidth: 4,
              borderLeftColor: accent,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            },
          ]}>
          <LinearGradient
            colors={[faded + '20', colors.surface]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.cardGradient}
          />
          <View style={[styles.iconWrap, {backgroundColor: faded, borderRadius: borderRadius.md}]}>
            <Text style={{fontSize: 20}}>{icon}</Text>
          </View>
          <Text style={[textStyles.h4, {color: colors.textPrimary, fontWeight: '800', marginTop: spacing.sm}]} numberOfLines={1}>
            {prefix}{value != null ? Number(value).toLocaleString() : '—'}
          </Text>
          <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 2}]}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <PageHeader
        title="Fee Management"
        onAddPress={() => navigation.navigate('AdminCreateFee')}
        addLabel="+ New Fee"
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base, paddingBottom: spacing.base + insets.bottom + 120}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* Stats grid */}
        {dashboard && (
          <>
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Overview</Text>
            <View style={styles.grid}>
              <View style={styles.cardWrap}>
                <StatCard label="Collected"    value={dashboard.totalCollected}  icon="✅" accent={colors.success} faded={colors.successFaded} prefix="Rs. " />
              </View>
              <View style={styles.cardWrap}>
                <StatCard label="Outstanding"  value={dashboard.outstanding}     icon="⏳" accent={colors.error}   faded={colors.errorFaded}   prefix="Rs. " />
              </View>
              <View style={styles.cardWrap}>
                <StatCard label="Total Fees"   value={dashboard.totalFees}       icon="📋" accent={colors.primary} faded={colors.primaryFaded} />
              </View>
              <View style={styles.cardWrap}>
                <StatCard label="Collection %"  value={`${dashboard.collectionRate}%`} icon="📊" accent={colors.warning} faded={colors.warningFaded} />
              </View>
            </View>

            {/* Collection progress bar */}
            <View style={[styles.progressCard, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
              <View style={styles.progressHeader}>
                <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '700'}]}>Collection Rate</Text>
                <Text style={[textStyles.body1, {color: dashboard.collectionRate >= 70 ? colors.success : colors.error, fontWeight: '800'}]}>
                  {dashboard.collectionRate}%
                </Text>
              </View>
              <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
                <View style={[
                  styles.progressFill,
                  {width: `${dashboard.collectionRate}%`, backgroundColor: dashboard.collectionRate >= 70 ? colors.success : colors.error, borderRadius: borderRadius.full},
                ]} />
              </View>
              <View style={styles.progressFooter}>
                <Text style={[textStyles.caption, {color: colors.textTertiary}]}>
                  Expected: Rs. {Number(dashboard.totalExpected || 0).toLocaleString()}
                </Text>
                <Text style={[textStyles.caption, {color: colors.success}]}>
                  Collected: Rs. {Number(dashboard.totalCollected || 0).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Recent payments */}
            {dashboard.recentPayments?.length > 0 && (
              <>
                <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Recent Payments</Text>
                {dashboard.recentPayments.map(p => (
                  <View key={p.id} style={[
                    styles.paymentRow,
                    {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.sm, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor},
                  ]}>
                    <View style={{flex: 1}}>
                      <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]}>
                        {p.student?.user?.name || '—'}
                      </Text>
                      <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{p.fee?.title}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={[textStyles.body2, {color: colors.success, fontWeight: '700'}]}>
                        Rs. {Number(p.amount_paid).toLocaleString()}
                      </Text>
                      <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{p.paid_date}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* Fee list */}
        <View style={[styles.sectionHeader, {marginTop: spacing.lg}]}>
          <Text style={[textStyles.h5, {color: colors.textPrimary}]}>All Fees</Text>
        </View>

        {fees.map(fee => {
          const cfg   = STATUS_CONFIG[fee.paymentStatus] || STATUS_CONFIG.pending;
          const icon  = FEE_TYPE_ICONS[fee.fee_type] || '💰';
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
            <Animated.View key={fee.id} style={{transform: [{scale: scaleAnim}]}}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                  styles.feeRow,
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
                  colors={[colors[cfg.bg] + '15', colors.surface]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.cardGradient}
                />
                <View style={styles.feeRowTop}>
                  <Text style={{fontSize: 22, marginRight: spacing.sm}}>{icon}</Text>
                  <View style={{flex: 1}}>
                    <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={1}>
                      {fee.title}
                    </Text>
                    <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
                      {fee.class?.name || fee.student?.user?.name || 'All'}
                      {fee.academic_year ? `  •  ${fee.academic_year}` : ''}
                    </Text>
                  </View>
                  <View style={[{backgroundColor: colors[cfg.bg], borderRadius: borderRadius.full, paddingHorizontal: 10, paddingVertical: 4}]}>
                    <Text style={[textStyles.caption, {color: colors[cfg.text], fontWeight: '700'}]}>{cfg.label}</Text>
                  </View>
                </View>

                <View style={[styles.feeRowBottom, {marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border}]}>
                  <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '700'}]}>
                    Rs. {Number(fee.amount).toLocaleString()}
                  </Text>
                  <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Due: {fee.due_date}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('AdminRecordPayment', {fee})}
                      style={[styles.actionBtn, {backgroundColor: colors.successFaded, borderRadius: borderRadius.sm}]}>
                      <Text style={[textStyles.caption, {color: colors.success, fontWeight: '600'}]}>Pay</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(fee)}
                      style={[styles.actionBtn, {backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm, marginLeft: 6}]}>
                      <Text style={[textStyles.caption, {color: colors.error, fontWeight: '600'}]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {fees.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>💰</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No fees created yet</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AdminCreateFee')}
              style={[styles.emptyBtn, {backgroundColor: colors.primary, borderRadius: borderRadius.lg, marginTop: spacing.md}]}>
              <Text style={[textStyles.body1, {color: colors.white, fontWeight: '700'}]}>+ Create First Fee</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  addBtn: {paddingHorizontal: 14, paddingVertical: 6},
  scroll: {paddingBottom: 40},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, marginBottom: 16},
  cardWrap: {width: '50%', padding: 6},
  statCard: {},
  cardGradient: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  iconWrap: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  progressCard: {},
  progressHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  progressTrack: {height: 10, overflow: 'hidden'},
  progressFill: {height: '100%'},
  progressFooter: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 6},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  paymentRow: {flexDirection: 'row', alignItems: 'center'},
  feeRow: {},
  feeRowTop: {flexDirection: 'row', alignItems: 'center'},
  feeRowBottom: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  actions: {flexDirection: 'row'},
  actionBtn: {paddingHorizontal: 10, paddingVertical: 4},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
  emptyBtn: {paddingHorizontal: 24, paddingVertical: 12},
});

export default AdminFeesDashboardScreen;
