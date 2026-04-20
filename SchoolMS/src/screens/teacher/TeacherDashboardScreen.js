import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchTeacherStats, fetchMyClasses} from '../../redux/slices/teacherSlice';

const StatCard = ({label, value, icon, faded, accent, onPress}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.statCard,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          ...shadow.sm,
          shadowColor: colors.shadowColor,
          borderLeftWidth: 4,
          borderLeftColor: accent,
        },
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: faded, borderRadius: borderRadius.md}]}>
        <Text style={{fontSize: 20}}>{icon}</Text>
      </View>
      <Text style={[textStyles.h3, {color: colors.textPrimary, fontWeight: '800', marginTop: spacing.sm}]}>
        {value ?? '—'}
      </Text>
      <Text style={[textStyles.caption, {color: colors.textSecondary, marginTop: 2}]}>{label}</Text>
    </TouchableOpacity>
  );
};

const TeacherDashboardScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles, borderRadius, shadow} = useTheme();
  const {stats, classes, loading} = useSelector(s => s.teacher);
  const {user} = useSelector(s => s.auth);

  const load = useCallback(() => {
    dispatch(fetchTeacherStats());
    dispatch(fetchMyClasses());
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  const statCards = [
    {label: 'My Classes',       value: stats?.myClasses,              icon: '🏫', accent: colors.primary,  faded: colors.primaryFaded},
    {label: 'Total Assignments', value: stats?.totalAssignments,       icon: '📝', accent: colors.warning,  faded: colors.warningFaded},
    {label: 'Due This Week',     value: stats?.dueSoonAssignments,     icon: '⏰', accent: colors.error,    faded: colors.errorFaded},
    {label: "Today's Attendance",value: stats?.todayAttendanceMarked,  icon: '✅', accent: colors.success,  faded: colors.successFaded},
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.headerBg, paddingHorizontal: spacing.base, paddingBottom: spacing.lg}]}>
        <View>
          <Text style={[textStyles.caption, {color: colors.whiteAlpha80}]}>Good day,</Text>
          <Text style={[textStyles.h4, {color: colors.white, fontWeight: '700'}]}>{user?.name ?? 'Teacher'}</Text>
        </View>
        <View style={[styles.avatarCircle, {backgroundColor: colors.whiteAlpha20, borderRadius: borderRadius.full}]}>
          <Text style={{fontSize: 22}}>👨‍🏫</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        <Text style={[textStyles.h5, {color: colors.textPrimary, marginBottom: spacing.md}]}>Overview</Text>

        {loading && !stats ? (
          <ActivityIndicator color={colors.primary} size="large" style={{marginTop: 40}} />
        ) : (
          <View style={styles.grid}>
            {statCards.map((c, i) => (
              <View key={i} style={styles.cardWrap}>
                <StatCard {...c} />
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>
          Quick Actions
        </Text>
        <View style={styles.actionsRow}>
          {[
            {label: 'Mark Attendance', icon: '✅', screen: 'Attendance'},
            {label: 'New Assignment',  icon: '📝', screen: 'Assignments'},
            {label: 'Upload Material', icon: '📁', screen: 'UploadMaterial'},
            {label: 'Enter Marks',     icon: '📊', screen: 'Marks'},
          ].map(a => (
            <TouchableOpacity
              key={a.label}
              onPress={() => navigation.navigate(a.screen)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.lg,
                  padding: spacing.md,
                  ...shadow.sm,
                  shadowColor: colors.shadowColor,
                },
              ]}>
              <Text style={{fontSize: 26, marginBottom: 6}}>{a.icon}</Text>
              <Text style={[textStyles.caption, {color: colors.textPrimary, fontWeight: '600', textAlign: 'center'}]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Classes list */}
        {classes.length > 0 && (
          <>
            <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>
              My Classes
            </Text>
            {classes.map(cls => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => navigation.navigate('Attendance', {classId: cls.id, className: cls.name})}
                style={[
                  styles.classRow,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.lg,
                    padding: spacing.md,
                    marginBottom: spacing.sm,
                    ...shadow.sm,
                    shadowColor: colors.shadowColor,
                  },
                ]}>
                <View style={[styles.classIcon, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.md}]}>
                  <Text style={{fontSize: 18}}>🏫</Text>
                </View>
                <View style={{flex: 1, marginLeft: spacing.sm}}>
                  <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '600'}]}>
                    {cls.name} {cls.section ? `- ${cls.section}` : ''}
                  </Text>
                  {cls.grade && (
                    <Text style={[textStyles.caption, {color: colors.textSecondary}]}>Grade {cls.grade}</Text>
                  )}
                </View>
                <Text style={{color: colors.textTertiary, fontSize: 16}}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20},
  avatarCircle: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  scroll: {paddingBottom: 40},
  grid: {flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6},
  cardWrap: {width: '50%', padding: 6},
  statCard: {},
  iconWrap: {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  actionsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  actionBtn: {width: '22%', alignItems: 'center', minWidth: 76},
  classRow: {flexDirection: 'row', alignItems: 'center'},
  classIcon: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
});

export default TeacherDashboardScreen;
