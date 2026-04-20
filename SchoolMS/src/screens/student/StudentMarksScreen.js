import React, {useEffect, useCallback, useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentMarks} from '../../redux/slices/studentSlice';

const EXAM_TYPES = ['all', 'assignment', 'quiz', 'unit_test', 'mid_term', 'final'];

const pctColor = (pct, colors) => {
  if (pct === null) return colors.textSecondary;
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.error;
};

const StudentMarksScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {marks, marksSummary, loading} = useSelector(s => s.student);
  const [examType, setExamType] = useState('all');
  const [view, setView] = useState('summary');   // 'summary' | 'detail'

  const load = useCallback(() => {
    dispatch(fetchStudentMarks(examType !== 'all' ? {exam_type: examType} : {}));
  }, [dispatch, examType]);

  useEffect(() => { load(); }, [load]);

  const chipStyle = active => ({
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: active ? colors.primary : colors.inputBg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: active ? colors.primary : colors.border,
    marginRight: 8,
  });

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>My Marks</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, {padding: spacing.base}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}>

        {/* Exam type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
          {EXAM_TYPES.map(t => (
            <TouchableOpacity key={t} onPress={() => setExamType(t)} style={chipStyle(examType === t)}>
              <Text style={[textStyles.caption, {color: examType === t ? colors.white : colors.textSecondary}]}>
                {t === 'all' ? 'All Types' : t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View toggle */}
        <View style={[styles.viewToggle, {marginBottom: spacing.md}]}>
          {['summary', 'detail'].map(v => (
            <TouchableOpacity key={v} onPress={() => setView(v)}
              style={[styles.toggleBtn, {
                backgroundColor: view === v ? colors.primary : colors.inputBg,
                borderRadius: borderRadius.md,
                borderWidth: 1,
                borderColor: view === v ? colors.primary : colors.border,
              }]}>
              <Text style={[textStyles.label, {color: view === v ? colors.white : colors.textSecondary}]}>
                {v === 'summary' ? '📊 Summary' : '📋 Detailed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary view */}
        {view === 'summary' && (
          marksSummary.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 48}}>📊</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No marks recorded yet</Text>
            </View>
          ) : (
            marksSummary.map((item, i) => {
              const pct = item.percentage;
              const color = pctColor(pct, colors);
              return (
                <View key={i} style={[
                  styles.summaryCard,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor},
                ]}>
                  <View style={styles.summaryHeader}>
                    <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', flex: 1}]}>{item.subject}</Text>
                    <Text style={[textStyles.h4, {color, fontWeight: '800'}]}>
                      {pct != null ? `${pct}%` : '—'}
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.sm}]}>
                    <View style={[styles.progressFill, {width: `${pct ?? 0}%`, backgroundColor: color, borderRadius: borderRadius.full}]} />
                  </View>
                  <View style={styles.summaryFooter}>
                    <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
                      {item.totalObtained} / {item.totalMax} marks  •  {item.count} test{item.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              );
            })
          )
        )}

        {/* Detail view */}
        {view === 'detail' && (
          marks.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 48}}>📋</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No marks recorded yet</Text>
            </View>
          ) : (
            marks.map(m => {
              const pct = m.max_marks > 0 ? Math.round((m.marks / m.max_marks) * 100) : null;
              const color = pctColor(pct, colors);
              return (
                <View key={m.id} style={[
                  styles.detailCard,
                  {backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor, borderLeftWidth: 3, borderLeftColor: color},
                ]}>
                  <View style={styles.detailHeader}>
                    <View style={{flex: 1}}>
                      <Text style={[textStyles.body2, {color: colors.textPrimary, fontWeight: '600'}]}>
                        {m.subject?.name}
                      </Text>
                      <Text style={[textStyles.caption, {color: colors.textSecondary}]}>
                        {m.exam_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        {m.exam_date ? `  •  ${new Date(m.exam_date).toLocaleDateString('en-US', {day: 'numeric', month: 'short'})}` : ''}
                      </Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={[textStyles.h5, {color, fontWeight: '800'}]}>
                        {m.marks}/{m.max_marks}
                      </Text>
                      {pct != null && (
                        <Text style={[textStyles.caption, {color}]}>{pct}%</Text>
                      )}
                    </View>
                  </View>
                  {m.remarks ? (
                    <Text style={[textStyles.caption, {color: colors.textTertiary, marginTop: 4}]}>
                      📝 {m.remarks}
                    </Text>
                  ) : null}
                </View>
              );
            })
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  viewToggle: {flexDirection: 'row', gap: 10},
  toggleBtn: {flex: 1, alignItems: 'center', paddingVertical: 10},
  summaryCard: {},
  summaryHeader: {flexDirection: 'row', alignItems: 'center'},
  progressTrack: {height: 8, overflow: 'hidden'},
  progressFill: {height: '100%'},
  summaryFooter: {marginTop: 6},
  detailCard: {},
  detailHeader: {flexDirection: 'row', alignItems: 'center'},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
});

export default StudentMarksScreen;
