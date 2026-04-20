import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchMyFees} from '../../redux/slices/feeSlice';

const FEE_TYPE_ICONS = {
  tuition: '🎓', transport: '🚌', exam: '📝',
  library: '📚', sports: '⚽', other: '💰',
};

const STATUS_CONFIG = {
  paid:    {label: 'Paid',    bg: 'successFaded', text: 'success'},
  partial: {label: 'Partial', bg: 'warningFaded', text: 'warning'},
  pending: {label: 'Pending', bg: 'errorFaded',   text: 'error'},
};

const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'});
};

const isOverdue = (dueDate, status) =>
  status !== 'paid' && dueDate && new Date(dueDate) < new Date();

const FeeCard = ({item}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const cfg     = STATUS_CONFIG[item.paymentStatus] || STATUS_CONFIG.pending;
  const overdue = isOverdue(item.due_date, item.paymentStatus);
  const icon    = FEE_TYPE_ICONS[item.fee_type] || '💰';
  const borderColor = overdue ? colors.error : item.paymentStatus === 'paid' ? colors.success : colors.warning;

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.surface, borderRadius: borderRadius.xl,
        padding: spacing.md, marginBottom: spacing.sm,
        borderLeftWidth: 4, borderLeftColor: borderColor,
        ...shadow.sm, shadowColor: colors.shadowColor,
      },
    ]}>
      <View style={styles.cardRow}>
        <Text style={{fontSize: 26, marginRight: spacing.sm}}>{icon}</Text>
        <View style={{flex: 1}}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.month && (
            <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{item.month} {item.academic_year || ''}</Text>
          )}
        </View>
        <View style={[styles.badge, {backgroundColor: colors[cfg.bg], borderRadius: borderRadius.full}]}>
          <Text style={[textStyles.caption, {color: colors[cfg.text], fontWeight: '700'}]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={[styles.amountRow, {marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border}]}>
        <View style={styles.amountItem}>
          <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Total</Text>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]}>
            Rs. {parseFloat(item.amount).toLocaleString()}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Paid</Text>
          <Text style={[textStyles.body1, {color: colors.success, fontWeight: '700'}]}>
            Rs. {parseFloat(item.totalPaid || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[textStyles.caption, {color: colors.textTertiary}]}>Balance</Text>
          <Text style={[textStyles.body1, {color: item.balance > 0 ? colors.error : colors.success, fontWeight: '700'}]}>
            Rs. {parseFloat(item.balance || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={[textStyles.caption, {
        color: overdue ? colors.error : colors.textTertiary,
        fontWeight: overdue ? '700' : '400',
        marginTop: 6,
      }]}>
        {overdue ? '⚠️ Overdue — ' : '📅 Due: '}
        {fmtDate(item.due_date)}
      </Text>
    </View>
  );
};

const SummaryBar = ({summary, colors, spacing, borderRadius, textStyles, shadow}) => (
  <View style={[
    styles.summaryBar,
    {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor},
  ]}>
    {[
      {label: 'Total Due',     value: summary.totalDue,         color: colors.textPrimary},
      {label: 'Paid',          value: summary.totalPaid,        color: colors.success},
      {label: 'Outstanding',   value: summary.totalOutstanding, color: colors.error},
    ].map(s => (
      <View key={s.label} style={styles.summaryItem}>
        <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{s.label}</Text>
        <Text style={[textStyles.body1, {color: s.color, fontWeight: '800'}]}>
          Rs. {parseFloat(s.value || 0).toLocaleString()}
        </Text>
      </View>
    ))}
  </View>
);

const StudentFeesScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {myLedger, mySummary, loading} = useSelector(s => s.fees);

  const load = useCallback(() => dispatch(fetchMyFees()), [dispatch]);
  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>My Fees</Text>
        {mySummary?.pendingCount > 0 && (
          <View style={[styles.pendingBadge, {backgroundColor: colors.error, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: colors.white, fontWeight: '700'}]}>
              {mySummary.pendingCount} pending
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={myLedger}
        keyExtractor={f => String(f.id)}
        renderItem={({item}) => <FeeCard item={item} />}
        ListHeaderComponent={
          mySummary ? (
            <SummaryBar summary={mySummary} colors={colors} spacing={spacing} borderRadius={borderRadius} textStyles={textStyles} shadow={shadow} />
          ) : null
        }
        contentContainerStyle={[styles.list, {padding: spacing.base}]}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>💰</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No fee records yet</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  pendingBadge: {paddingHorizontal: 10, paddingVertical: 4},
  list: {paddingBottom: 40},
  card: {},
  cardRow: {flexDirection: 'row', alignItems: 'center'},
  badge: {paddingHorizontal: 10, paddingVertical: 4},
  amountRow: {flexDirection: 'row', justifyContent: 'space-between'},
  amountItem: {alignItems: 'center'},
  summaryBar: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryItem: {alignItems: 'center'},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
});

export default StudentFeesScreen;
