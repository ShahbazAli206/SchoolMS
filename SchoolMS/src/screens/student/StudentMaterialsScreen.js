import React, {useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  RefreshControl,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchStudentMaterials} from '../../redux/slices/studentSlice';

const FILE_TYPE_ICONS = {pdf: '📄', video: '🎬', image: '🖼️', document: '📃', other: '📎'};

const MaterialCard = ({item}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const icon = FILE_TYPE_ICONS[item.file_type] ?? '📎';
  return (
    <View style={[
      styles.card,
      {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.sm, ...shadow.sm, shadowColor: colors.shadowColor},
    ]}>
      <View style={styles.cardRow}>
        <Text style={{fontSize: 28, marginRight: spacing.sm}}>{icon}</Text>
        <View style={{flex: 1}}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={1}>{item.title}</Text>
          {item.description ? (
            <Text style={[textStyles.caption, {color: colors.textSecondary}]} numberOfLines={1}>{item.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.subject?.name && (
              <Text style={[textStyles.caption, {color: colors.info ?? colors.primary}]}>📚 {item.subject.name}  </Text>
            )}
            {item.teacher?.name && (
              <Text style={[textStyles.caption, {color: colors.textTertiary}]}>👨‍🏫 {item.teacher.name}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const StudentMaterialsScreen = () => {
  const dispatch = useDispatch();
  const {colors, spacing, textStyles} = useTheme();
  const {materials, loading} = useSelector(s => s.student);

  const load = useCallback(() => dispatch(fetchStudentMaterials({})), [dispatch]);
  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <Text style={[textStyles.h5, {color: colors.white}]}>Study Materials</Text>
      </View>
      <FlatList
        data={materials}
        keyExtractor={m => String(m.id)}
        renderItem={({item}) => <MaterialCard item={item} />}
        contentContainerStyle={[styles.list, {padding: spacing.base}]}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyWrap}>
            <Text style={{fontSize: 48}}>📁</Text>
            <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No materials uploaded yet</Text>
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
  card: {},
  cardRow: {flexDirection: 'row', alignItems: 'center'},
  metaRow: {flexDirection: 'row', marginTop: 4},
  emptyWrap: {alignItems: 'center', paddingTop: 80},
});

export default StudentMaterialsScreen;
