import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, RefreshControl, TextInput,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../../themes/ThemeContext';
import {teacherAPI} from '../../services/teacherService';

const FILE_TYPE_ICONS = {pdf: '📄', video: '🎬', image: '🖼️', document: '📃', other: '📎'};

const TYPE_LABELS = {pdf: 'PDF', video: 'Video', image: 'Image', document: 'Document'};

const FILTER_TABS = ['All', 'video', 'pdf', 'image', 'document'];

const MaterialRow = ({item, onDelete, colors, spacing, borderRadius, textStyles, shadow}) => (
  <View style={[styles.card, {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
    shadowColor: colors.shadowColor,
  }]}>
    <View style={styles.rowTop}>
      <View style={[styles.iconWrap, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.md}]}>
        <Text style={{fontSize: 22}}>{FILE_TYPE_ICONS[item.file_type] ?? '📎'}</Text>
      </View>
      <View style={{flex: 1, marginLeft: spacing.sm}}>
        <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[textStyles.caption, {color: colors.textSecondary}]} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={onDelete}
        style={{backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm, paddingHorizontal: 12, paddingVertical: 5, marginLeft: 6}}>
        <Text style={[textStyles.caption, {color: colors.error, fontWeight: '700'}]}>Delete</Text>
      </TouchableOpacity>
    </View>

    <View style={[styles.tagRow, {marginTop: spacing.sm}]}>
      {item.teacher?.name && (
        <View style={[styles.tag, {backgroundColor: colors.primaryFaded}]}>
          <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '600'}]}>
            👨‍🏫 {item.teacher.name}
          </Text>
        </View>
      )}
      {item.class?.name && (
        <View style={[styles.tag, {backgroundColor: colors.secondaryFaded ?? colors.inputBg}]}>
          <Text style={[textStyles.caption, {color: colors.secondary ?? colors.primary, fontWeight: '600'}]}>
            🏫 {item.class.name} {item.class.section || ''}
          </Text>
        </View>
      )}
      {item.subject?.name && (
        <View style={[styles.tag, {backgroundColor: colors.warningFaded ?? colors.inputBg}]}>
          <Text style={[textStyles.caption, {color: colors.warningDark ?? colors.textSecondary, fontWeight: '600'}]}>
            📚 {item.subject.name}
          </Text>
        </View>
      )}
      <View style={[styles.tag, {backgroundColor: colors.accentFaded ?? colors.inputBg}]}>
        <Text style={[textStyles.caption, {color: colors.accent ?? colors.textSecondary, fontWeight: '600'}]}>
          {TYPE_LABELS[item.file_type] ?? item.file_type}
        </Text>
      </View>
    </View>
  </View>
);

const AdminMaterialsScreen = ({navigation}) => {
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const [materials,  setMaterials]  = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState('');
  const [activeTab,  setActiveTab]  = useState('All');

  const themePass = {colors, spacing, borderRadius, textStyles, shadow};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherAPI.getMaterials({limit: 200});
      const data = res.data?.data?.rows ?? res.data?.data ?? [];
      setMaterials(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert('Error', 'Could not load materials.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = materials.filter(m => {
    const matchTab    = activeTab === 'All' || m.file_type === activeTab;
    const matchSearch = !search.trim() ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.teacher?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.class?.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleDelete = item => {
    Alert.alert(
      'Delete Material',
      `Delete "${item.title}" uploaded by ${item.teacher?.name ?? 'unknown'}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await teacherAPI.deleteMaterial(item.id);
              setMaterials(prev => prev.filter(m => m.id !== item.id));
            } catch {
              Alert.alert('Error', 'Could not delete material.');
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.headerBg, paddingHorizontal: spacing.base, paddingVertical: spacing.md, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: spacing.sm}}>
          <Text style={{color: colors.white, fontSize: 22}}>←</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white, flex: 1}]}>All Materials</Text>
        <View style={[styles.countBadge, {backgroundColor: colors.primaryFaded}]}>
          <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '700'}]}>
            {filtered.length} items
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        <Text style={{fontSize: 16, marginRight: 8}}>🔍</Text>
        <TextInput
          style={[styles.searchInput, {color: colors.textPrimary}]}
          placeholder="Search by title, teacher or class…"
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{color: colors.textTertiary, fontSize: 18, paddingLeft: 8}}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Type filter tabs */}
      <View style={[styles.tabWrap, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, {
              backgroundColor: activeTab === tab ? colors.primary : 'transparent',
              borderRadius: borderRadius.full,
            }]}>
            <Text style={[textStyles.caption, {
              color: activeTab === tab ? colors.white : colors.textSecondary,
              fontWeight: activeTab === tab ? '700' : '500',
            }]}>
              {tab === 'All' ? 'All' : (FILE_TYPE_ICONS[tab] + ' ' + TYPE_LABELS[tab])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => String(m.id)}
        renderItem={({item}) => (
          <MaterialRow item={item} onDelete={() => handleDelete(item)} {...themePass} />
        )}
        contentContainerStyle={{padding: spacing.base, paddingBottom: 40}}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 52}}>📁</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 14}]}>
                {search ? 'No matching materials' : 'No materials uploaded yet'}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:   {flex: 1},
  header:      {flexDirection: 'row', alignItems: 'center'},
  countBadge:  {paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12},
  searchWrap:  {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1},
  searchInput: {flex: 1, fontSize: 14, paddingVertical: 0},
  tabWrap:     {flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, gap: 6},
  tabBtn:      {paddingHorizontal: 12, paddingVertical: 5},
  card:        {},
  rowTop:      {flexDirection: 'row', alignItems: 'flex-start'},
  iconWrap:    {width: 44, height: 44, alignItems: 'center', justifyContent: 'center'},
  tagRow:      {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  tag:         {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8},
  emptyWrap:   {alignItems: 'center', paddingTop: 60},
});

export default AdminMaterialsScreen;
