import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl, ScrollView,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchChildFees} from '../../redux/slices/feeSlice';
import {fetchChildren, selectChild} from '../../redux/slices/parentSlice';

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

const FeeCard = ({item, colors, spacing, borderRadius, textStyles, shadow}) => {
  const cfg     = STATUS_CONFIG[item.paymentStatus] || STATUS_CONFIG.pending;
  const overdue = item.paymentStatus !== 'paid' && item.due_date && new Date(item.due_date) < new Date();
  const icon    = FEE_TYPE_ICONS[item.fee_type] || '💰';
  const borderColor = overdue ? colors.error : item.paymentStatus === 'paid' ? colors.success : colors.warning;

  return (
    <View style={[
      styles.card,
      {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 4, borderLeftColor: borderColor, ...shadow.sm, shadowColor: colors.shadowColor},
    ]}>
      <View style={styles.cardRow}>
        <Text style={{fontSize: 24, marginRight: spacing.sm}}>{icon}</Text>
        <View style={{flex: 1}}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={1}>{item.title}</Text>
          {item.month && (
            <Text style={[textStyles.caption, {color: colors.textSecondary}]}>{item.month} {item.academic_year || ''}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, {backgroundColor: colors[cfg.bg], borderRadius: borderRadius.full}]}>
          <Text style={[textStyles.caption, {color: colors[cfg.text], fontWeight: '700'}]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={[styles.amountRow, {marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border}]}>
        {[
          {label: 'Total',   value: item.amount,       color: colors.textPrimary},
          {label: 'Paid',    value: item.totalPaid,    color: colors.success},
          {label: 'Balance', value: item.balance,      color: item.balance > 0 ? colors.error : colors.success},
        ].map(s => (
          <View key={s.label} style={{alignItems: 'center'}}>
            <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{s.label}</Text>
            <Text style={[textStyles.body2, {color: s.color, fontWeight: '700'}]}>
              Rs. {parseFloat(s.value || 0).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[textStyles.caption, {color: overdue ? colors.error : colors.textTertiary, fontWeight: overdue ? '700' : '400', marginTop: 6}]}>
        {overdue ? '⚠️ Overdue — ' : '📅 Due: '}{fmtDate(item.due_date)}
      </Text>
    </View>
  );
};

const ParentFeesScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {children, selectedChildId} = useSelector(s => s.parent);
  const {myLedger, mySummary, loading} = useSelector(s => s.fees);

  const childId = selectedChildId ?? children[0]?.id;

  const load = useCallback(() => {
    dispatch(fetchChildren());
    if (childId) dispatch(fetchChildFees(childId));
  }, [dispatch, childId]);

  useEffect(() => { load(); }, [load]);

  const onSelectChild = id => {
    dispatch(selectChild(id));
    dispatch(fetchChildFees(id));
  };

  const selectedChild = children.find(c => c.id === childId);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>
          {selectedChild ? `${selectedChild.user?.name}'s Fees` : 'Fees'}
        </Text>
      </View>

      <FlatList
        data={myLedger}
        keyExtractor={f => String(f.id)}
        renderItem={({item}) => <FeeCard item={item} colors={colors} spacing={spacing} borderRadius={borderRadius} textStyles={textStyles} shadow={shadow} />}
        ListHeaderComponent={() => (
          <View>
            {/* Child selector chips */}
            {children.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                {children.map(c => {
                  const active = c.id === childId;
                  return (
                    <TouchableOpacity key={c.id} onPress={() => onSelectChild(c.id)}
                      style={[styles.chip, {
                        backgroundColor: active ? colors.primary : colors.inputBg,
                        borderRadius: borderRadius.full,
                        borderWidth: 1,
                        borderColor: active ? colors.primary : colors.border,
                      }]}>
                      <Text style={[textStyles.caption, {color: active ? colors.white : colors.textSecondary}]}>
                        🧒 {c.user?.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Summary bar */}
            {mySummary && (
              <View style={[styles.summaryBar, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
                {[
                  {label: 'Total Due',   value: mySummary.totalDue,         color: colors.textPrimary},
                  {label: 'Paid',        value: mySummary.totalPaid,        color: colors.success},
                  {label: 'Outstanding', value: mySummary.totalOutstanding, color: colors.error},
                ].map(s => (
                  <View key={s.label} style={{alignItems: 'center'}}>
                    <Text style={[textStyles.caption, {color: colors.textTertiary}]}>{s.label}</Text>
                    <Text style={[textStyles.body1, {color: s.color, fontWeight: '800'}]}>
                      Rs. {parseFloat(s.value || 0).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        contentContainerStyle={[styles.list, {padding: spacing.base}]}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>💰</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No fee records found</Text>
          </View>
        ) : null}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  list: {paddingBottom: 40},
  chip: {paddingHorizontal: 14, paddingVertical: 7, marginRight: 8},
  card: {},
  cardRow: {flexDirection: 'row', alignItems: 'center'},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4},
  amountRow: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryBar: {flexDirection: 'row', justifyContent: 'space-between'},
  emptyWrap: {alignItems: 'center', paddingTop: 60},
});

export default ParentFeesScreen;
