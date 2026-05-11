import React, {useState} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Alert, ScrollView, Modal, Platform,
} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const DUMMY_ANNOUNCEMENTS = [
  {id: 1, text: '🎉 Annual Sports Day on 30 May 2026 — all students must participate!', expiry: '2026-05-30'},
  {id: 2, text: '📋 Parent-Teacher Meeting: 15 May 2026, 10am–1pm in Main Hall',        expiry: '2026-05-15'},
  {id: 3, text: '📅 Mid-Term Exams: 20–25 May 2026. Revised timetable attached.',       expiry: '2026-05-25'},
  {id: 4, text: '🔔 Fee submission deadline for May: 10 May 2026. Late fee applies.',   expiry: '2026-05-10'},
  {id: 5, text: '🏖️ Summer Holidays: 1 June – 15 July 2026. School reopens 16 July.',  expiry: '2026-07-16'},
];

let nextId = 100;

const TYPE_OPTIONS = [
  {label: '📅 Event',   value: 'event'},
  {label: '🔔 Reminder',value: 'reminder'},
  {label: '📋 Meeting', value: 'meeting'},
  {label: '⚠️ Alert',   value: 'alert'},
  {label: '🎉 Holiday', value: 'holiday'},
];

const isExpired = expiryStr => {
  if (!expiryStr) return false;
  return new Date(expiryStr) < new Date();
};

const AdminAnnouncements = () => {
  const {colors, borderRadius, spacing} = useTheme();
  const [announcements, setAnnouncements] = useState(DUMMY_ANNOUNCEMENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [text,   setText]   = useState('');
  const [expiry, setExpiry] = useState('');
  const [type,   setType]   = useState('event');

  const handleAdd = () => {
    if (!text.trim()) { Alert.alert('Required', 'Announcement text is required'); return; }
    setAnnouncements(prev => [
      {id: nextId++, text: text.trim(), expiry: expiry.trim() || null, type},
      ...prev,
    ]);
    setText(''); setExpiry(''); setType('event');
    setShowAdd(false);
  };

  const handleDelete = id => {
    Alert.alert('Delete Announcement', 'Remove this announcement?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () =>
        setAnnouncements(prev => prev.filter(a => a.id !== id))},
    ]);
  };

  const active  = announcements.filter(a => !isExpired(a.expiry));
  const expired = announcements.filter(a => isExpired(a.expiry));

  return (
    <View style={{marginTop: 8}}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, {color: colors.textPrimary}]}>📢 Announcements</Text>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={[styles.addBtn, {backgroundColor: colors.primary, borderRadius: borderRadius.lg}]}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Active announcements */}
      {active.map(a => (
        <View key={a.id} style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderLeftColor: '#6C5CE7'}]}>
          <View style={{flex: 1}}>
            <Text style={[styles.cardText, {color: colors.textPrimary}]} numberOfLines={3}>{a.text}</Text>
            {a.expiry && (
              <Text style={[styles.expiryText, {color: colors.textTertiary}]}>
                📅 Expires: {new Date(a.expiry).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDelete(a.id)} style={[styles.delBtn, {backgroundColor: 'rgba(255,118,117,0.12)', borderRadius: borderRadius.md}]}>
            <Text style={styles.delIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      {active.length === 0 && (
        <View style={[styles.empty, {backgroundColor: colors.surface, borderRadius: borderRadius.xl}]}>
          <Text style={[styles.emptyText, {color: colors.textTertiary}]}>No active announcements</Text>
        </View>
      )}

      {/* Expired section */}
      {expired.length > 0 && (
        <>
          <Text style={[styles.expiredLabel, {color: colors.textTertiary}]}>Expired</Text>
          {expired.map(a => (
            <View key={a.id} style={[styles.card, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderLeftColor: colors.border, opacity: 0.6}]}>
              <View style={{flex: 1}}>
                <Text style={[styles.cardText, {color: colors.textSecondary}]} numberOfLines={2}>{a.text}</Text>
                <Text style={[styles.expiryText, {color: colors.error}]}>
                  Expired: {new Date(a.expiry).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(a.id)} style={[styles.delBtn, {backgroundColor: 'rgba(255,118,117,0.12)', borderRadius: borderRadius.md}]}>
                <Text style={styles.delIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <View style={[styles.modal, {backgroundColor: colors.surface, borderRadius: borderRadius.xl}]}>
            <Text style={[styles.modalTitle, {color: colors.textPrimary}]}>New Announcement</Text>

            {/* Type chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 14}}>
              <View style={{flexDirection: 'row', gap: 8}}>
                {TYPE_OPTIONS.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    onPress={() => setType(t.value)}
                    style={[styles.typeChip, {
                      backgroundColor: type === t.value ? '#6C5CE7' : colors.inputBg,
                      borderRadius: borderRadius.lg,
                    }]}>
                    <Text style={[styles.typeChipText, {color: type === t.value ? '#fff' : colors.textSecondary}]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.inputLabel, {color: colors.textSecondary}]}>Announcement Text *</Text>
            <TextInput
              style={[styles.textArea, {backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary, borderRadius: borderRadius.lg}]}
              value={text}
              onChangeText={setText}
              placeholder="e.g. Annual Sports Day on 30 May..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, {color: colors.textSecondary, marginTop: 10}]}>Expiry Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.inputField, {backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary, borderRadius: borderRadius.lg}]}
              value={expiry}
              onChangeText={setExpiry}
              placeholder="2026-05-30"
              placeholderTextColor={colors.textTertiary}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            />

            <View style={{flexDirection: 'row', gap: 12, marginTop: 16}}>
              <TouchableOpacity
                onPress={() => setShowAdd(false)}
                style={[styles.modalBtn, {backgroundColor: colors.inputBg, borderRadius: borderRadius.lg}]}>
                <Text style={[styles.modalBtnText, {color: colors.textSecondary}]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAdd}
                style={[styles.modalBtn, {backgroundColor: '#6C5CE7', borderRadius: borderRadius.lg}]}>
                <Text style={[styles.modalBtnText, {color: '#fff'}]}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  sectionTitle:   {fontSize: 16, fontWeight: '700'},
  addBtn:         {paddingHorizontal: 14, paddingVertical: 6},
  addBtnText:     {color: '#fff', fontSize: 13, fontWeight: '700'},

  card:           {flexDirection: 'row', alignItems: 'flex-start', padding: 14, marginBottom: 8, borderLeftWidth: 3, gap: 10},
  cardText:       {fontSize: 13, fontWeight: '500', lineHeight: 19},
  expiryText:     {fontSize: 11, marginTop: 4},

  delBtn:         {padding: 8, alignSelf: 'center'},
  delIcon:        {fontSize: 16},

  empty:          {padding: 18, alignItems: 'center', marginBottom: 8},
  emptyText:      {fontSize: 13},

  expiredLabel:   {fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6, marginTop: 4},

  overlay:        {flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end'},
  modal:          {padding: 22, paddingBottom: 32, margin: 0},
  modalTitle:     {fontSize: 17, fontWeight: '800', marginBottom: 16},

  inputLabel:     {fontSize: 12, fontWeight: '600', marginBottom: 6},
  textArea:       {borderWidth: 1, padding: 12, fontSize: 13, minHeight: 80, textAlignVertical: 'top'},
  inputField:     {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11, fontSize: 13},

  typeChip:       {paddingHorizontal: 12, paddingVertical: 7},
  typeChipText:   {fontSize: 12, fontWeight: '600'},

  modalBtn:       {flex: 1, paddingVertical: 13, alignItems: 'center'},
  modalBtnText:   {fontSize: 14, fontWeight: '700'},
});

export default AdminAnnouncements;
