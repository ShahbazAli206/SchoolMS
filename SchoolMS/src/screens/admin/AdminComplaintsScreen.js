import React, {useEffect, useCallback, useState, useRef} from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, RefreshControl, Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import PageHeader from '../../components/common/PageHeader';
import {fetchAdminComplaints, clearComplaintError} from '../../redux/slices/complaintSlice';

const STATUS_STYLE = {
  pending:   {bg: '#fff3cd', text: '#856404'},
  in_review: {bg: '#cce5ff', text: '#004085'},
  resolved:  {bg: '#d4edda', text: '#155724'},
  rejected:  {bg: '#f8d7da', text: '#721c24'},
};
const STATUS_LABEL = {pending: 'Pending', in_review: 'In Review', resolved: 'Resolved', rejected: 'Rejected'};
const FILTERS = ['all', 'pending', 'in_review', 'resolved', 'rejected'];

const ComplaintCard = ({item, onPress, colors, spacing, borderRadius, textStyles, shadow}) => {
  const s = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
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
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item)}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.xl,
            marginBottom: spacing.sm,
            ...shadow.sm,
            shadowColor: colors.shadowColor,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          },
        ]}>
        <LinearGradient
          colors={[s.bg + '20', colors.surface]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.cardGradient}
        />
        <View style={styles.row}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, flex: 1, fontWeight: '600'}]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.badge, {backgroundColor: s.bg, borderRadius: borderRadius.full}]}>
            <Text style={[textStyles.caption, {color: s.text, fontWeight: '700'}]}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </View>

        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.xs}]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={[styles.row, {marginTop: spacing.sm}]}>
          <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
            {item.parent?.name || 'Unknown'} · {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '600'}]}>View →</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AdminComplaintsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {adminList, loading, error} = useSelector(s => s.complaints);
  const [activeFilter, setFilter] = useState('all');

  const load = useCallback(() => {
    const params = {page: 1, limit: 50};
    if (activeFilter !== 'all') params.status = activeFilter;
    dispatch(fetchAdminComplaints(params));
  }, [dispatch, activeFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{text: 'OK', onPress: () => dispatch(clearComplaintError())}]);
  }, [error, dispatch]);

  const renderItem = useCallback(({item}) => (
    <ComplaintCard
      item={item}
      onPress={c => navigation.navigate('AdminComplaintDetail', {complaint: c})}
      colors={colors} spacing={spacing} borderRadius={borderRadius} textStyles={textStyles} shadow={shadow}
    />
  ), [navigation, colors, spacing, borderRadius, textStyles, shadow]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <PageHeader title="Complaints" />

      <View style={[styles.filterRow, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, {
              backgroundColor: activeFilter === f ? colors.primary : 'transparent',
              borderColor: activeFilter === f ? colors.primary : colors.border,
            }]}>
            <Text style={[textStyles.caption, {
              color: activeFilter === f ? colors.white : colors.textSecondary,
              fontWeight: activeFilter === f ? '700' : '400',
              textTransform: 'capitalize',
            }]}>
              {f === 'in_review' ? 'In Review' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={adminList}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: spacing.base, paddingBottom: spacing.base + insets.bottom + 120, flexGrow: 1}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={loading ? null : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: spacing.sm}]}>No complaints</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:  {flex: 1},
  header:     {flexDirection: 'row', alignItems: 'center'},
  filterRow:  {flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10, borderBottomWidth: 1},
  filterChip: {borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16},
  card:       {padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: {width: 0, height: 2}},
  cardGradient: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  row:        {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  badge:      {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12},
  empty:      {flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80},
  emptyIcon:  {fontSize: 48},
});

export default AdminComplaintsScreen;
