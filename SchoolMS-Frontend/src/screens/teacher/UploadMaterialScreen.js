import React, {useEffect, useState, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal,
  TouchableOpacity, Alert, Animated, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {fetchMyClasses, fetchSubjects, fetchMaterials} from '../../redux/slices/teacherSlice';
import {teacherAPI} from '../../services/teacherService';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import {pick, types as docTypes, errorCodes, isErrorWithCode} from '@react-native-documents/picker';

const FILE_TYPE_ICONS = {pdf: '📄', video: '🎬', image: '🖼️', document: '📃', other: '📎'};

const resolveIcon = item =>
  FILE_TYPE_ICONS[item?.file_type] ??
  (item?.type?.includes('pdf')   ? '📄'
  : item?.type?.includes('video') ? '🎬'
  : item?.type?.includes('image') ? '🖼️' : '📎');

// ── Edit modal ────────────────────────────────────────────────────────────────
const EditModal = ({visible, item, onClose, onSaved, colors, spacing, borderRadius, textStyles, shadow}) => {
  const [title,  setTitle]  = useState('');
  const [desc,   setDesc]   = useState('');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  useEffect(() => {
    if (item) { setTitle(item.title); setDesc(item.description || ''); setErr(''); }
  }, [item]);

  const save = async () => {
    if (!title.trim()) { setErr('Title is required'); return; }
    setSaving(true);
    try {
      await teacherAPI.updateMaterial(item.id, {title: title.trim(), description: desc.trim()});
      onSaved();
    } catch {
      Alert.alert('Error', 'Could not update material.');
    } finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.modalSheet, {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          ...shadow.md,
          shadowColor: colors.shadowColor,
        }]}>
          <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md, fontSize: 18}]}>
            Edit Material
          </Text>
          <AppInput label="Title *" value={title} onChangeText={v => { setTitle(v); setErr(''); }} placeholder="Material title" error={err} />
          <AppInput label="Description" value={desc} onChangeText={setDesc} placeholder="Optional description" multiline numberOfLines={3} />
          <View style={{flexDirection: 'row', gap: 10, marginTop: spacing.md}}>
            <View style={{flex: 1}}>
              <AppButton title="Cancel" onPress={onClose} style={{backgroundColor: colors.inputBg}} textStyle={{color: colors.textPrimary}} />
            </View>
            <View style={{flex: 1}}>
              <AppButton title="Save Changes" onPress={save} loading={saving} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ── Material card ─────────────────────────────────────────────────────────────
const MaterialCard = ({item, onDelete, onEdit, colors, spacing, borderRadius, textStyles, shadow}) => (
  <View style={[styles.card, {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
    shadowColor: colors.shadowColor,
  }]}>
    <View style={styles.cardRow}>
      <Text style={{fontSize: 28, marginRight: spacing.sm}}>{resolveIcon(item)}</Text>
      <View style={{flex: 1}}>
        <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700'}]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[textStyles.caption, {color: colors.textSecondary}]} numberOfLines={1}>{item.description}</Text>
        ) : null}
        <View style={styles.metaRow}>
          {item.class?.name && (
            <Text style={[textStyles.caption, {color: colors.primary}]}>🏫 {item.class.name}  </Text>
          )}
          {item.subject?.name && (
            <Text style={[textStyles.caption, {color: colors.info ?? colors.primary}]}>📚 {item.subject.name}</Text>
          )}
        </View>
      </View>
      <View style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}>
        <TouchableOpacity onPress={onEdit}
          style={{backgroundColor: colors.primaryFaded, borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4}}>
          <Text style={[textStyles.caption, {color: colors.primary, fontWeight: '600'}]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}
          style={{backgroundColor: colors.errorFaded, borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4}}>
          <Text style={[textStyles.caption, {color: colors.error, fontWeight: '600'}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ── Main screen ───────────────────────────────────────────────────────────────
const UploadMaterialScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles, shadow} = useTheme();
  const {classes, subjects, materials, loading} = useSelector(s => s.teacher);

  const [form, setForm]           = useState({title: '', description: '', class_id: '', subject_id: ''});
  const [pickedFile, setPickedFile] = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [progress,   setProgress]   = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [errors, setErrors] = useState({});
  const [editItem,  setEditItem]  = useState(null);
  const [showEdit,  setShowEdit]  = useState(false);

  useEffect(() => {
    dispatch(fetchMyClasses());
    dispatch(fetchSubjects({}));
    dispatch(fetchMaterials({}));
  }, []);

  const set = (k, v) => {
    setForm(p => ({...p, [k]: v}));
    if (errors[k]) setErrors(p => ({...p, [k]: ''}));
  };

  const animateProgress = pct => {
    setProgress(pct);
    Animated.timing(progressAnim, {toValue: pct / 100, duration: 200, useNativeDriver: false}).start();
  };

  const pickFile = async () => {
    try {
      const [res] = await pick({
        type: [
          docTypes.pdf,
          docTypes.video,
          docTypes.images,
          docTypes.doc,
          docTypes.docx,
          docTypes.ppt,
          docTypes.pptx,
        ],
      });
      setPickedFile(res);
      if (errors.file) setErrors(p => ({...p, file: ''}));
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Error', 'Could not pick file.');
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!pickedFile)        e.file  = 'Please pick a file';
    if (!form.class_id)     e.class_id = 'Select a class';
    return e;
  };

  const handleUpload = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const data = new FormData();
    data.append('title', form.title.trim());
    if (form.description) data.append('description', form.description.trim());
    data.append('class_id', form.class_id);
    if (form.subject_id) data.append('subject_id', form.subject_id);
    data.append('file', {
      uri: Platform.OS === 'android' ? pickedFile.uri : pickedFile.uri.replace('file://', ''),
      type: pickedFile.type,
      name: pickedFile.name,
    });

    setUploading(true);
    animateProgress(0);
    try {
      await teacherAPI.uploadMaterial(data, pct => animateProgress(pct));
      animateProgress(100);
      setTimeout(() => {
        setUploading(false); setProgress(0); progressAnim.setValue(0);
        setForm({title: '', description: '', class_id: '', subject_id: ''});
        setPickedFile(null);
        dispatch(fetchMaterials({}));
      }, 600);
    } catch (err) {
      setUploading(false);
      Alert.alert('Upload Failed', err?.response?.data?.message || 'Something went wrong.');
    }
  };

  const handleDelete = item => {
    Alert.alert('Delete Material', `Delete "${item.title}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: async () => {
        try { await teacherAPI.deleteMaterial(item.id); dispatch(fetchMaterials({})); }
        catch { Alert.alert('Error', 'Could not delete material.'); }
      }},
    ]);
  };

  const barWidth  = progressAnim.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});
  const themePass = {colors, spacing, borderRadius, textStyles, shadow};

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['left','right','bottom']}>
      <PageHeader
        title="Upload Material"
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing.base}]} showsVerticalScrollIndicator={false}>

          {/* Upload form */}
          <View style={[styles.formCard, {backgroundColor: colors.surface, borderRadius: borderRadius.xl, padding: spacing.md, ...shadow.sm, shadowColor: colors.shadowColor}]}>
            <Text style={[textStyles.body1, {color: colors.textPrimary, fontWeight: '700', marginBottom: spacing.md, fontSize: 17}]}>
              New Material
            </Text>

            <AppInput label="Title *" value={form.title} onChangeText={v => set('title', v)} placeholder="Material title" error={errors.title} />
            <AppInput label="Description" value={form.description} onChangeText={v => set('description', v)} placeholder="Optional description" multiline numberOfLines={2} />

            {/* Class chips */}
            <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Class *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
              {classes.map(cl => (
                <TouchableOpacity key={cl.id} onPress={() => set('class_id', String(cl.id))}
                  style={[styles.chip, {
                    backgroundColor: form.class_id === String(cl.id) ? colors.primary : colors.inputBg,
                    borderRadius: borderRadius.full,
                    borderColor: form.class_id === String(cl.id) ? colors.primary : colors.border,
                    borderWidth: 1, marginRight: 8,
                  }]}>
                  <Text style={[textStyles.caption, {color: form.class_id === String(cl.id) ? colors.white : colors.textSecondary}]}>
                    {cl.name} {cl.section || ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.class_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.class_id}</Text> : null}

            {/* Subject chips */}
            {subjects.length > 0 && (
              <>
                <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Subject (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
                  {subjects.map(sub => (
                    <TouchableOpacity key={sub.id}
                      onPress={() => set('subject_id', form.subject_id === String(sub.id) ? '' : String(sub.id))}
                      style={[styles.chip, {
                        backgroundColor: form.subject_id === String(sub.id) ? colors.warning : colors.inputBg,
                        borderRadius: borderRadius.full,
                        borderColor: form.subject_id === String(sub.id) ? colors.warning : colors.border,
                        borderWidth: 1, marginRight: 8,
                      }]}>
                      <Text style={[textStyles.caption, {color: form.subject_id === String(sub.id) ? colors.white : colors.textSecondary}]}>
                        {sub.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* File picker */}
            <TouchableOpacity onPress={pickFile} style={[styles.filePicker, {
              backgroundColor: colors.inputBg, borderRadius: borderRadius.lg,
              borderWidth: 1.5, borderStyle: 'dashed',
              borderColor: errors.file ? colors.error : pickedFile ? colors.success : colors.border,
            }]}>
              <Text style={{fontSize: 32}}>{resolveIcon(pickedFile ?? {})}</Text>
              <Text style={[textStyles.body2, {color: pickedFile ? colors.success : colors.textSecondary, marginTop: 6, textAlign: 'center'}]}>
                {pickedFile ? pickedFile.name : 'Tap to pick a file\n(PDF, Video, Image, Doc)'}
              </Text>
              {pickedFile?.size ? (
                <Text style={[textStyles.caption, {color: colors.textTertiary, marginTop: 2}]}>
                  {(pickedFile.size / 1024).toFixed(1)} KB
                </Text>
              ) : null}
            </TouchableOpacity>
            {errors.file ? <Text style={[textStyles.caption, {color: colors.error, marginTop: 4, marginBottom: 8}]}>{errors.file}</Text> : null}

            {uploading && (
              <View style={[styles.progressTrack, {backgroundColor: colors.border, borderRadius: borderRadius.full, marginTop: spacing.md}]}>
                <Animated.View style={[styles.progressFill, {width: barWidth, backgroundColor: colors.primary, borderRadius: borderRadius.full}]} />
              </View>
            )}
            {uploading && (
              <Text style={[textStyles.caption, {color: colors.textSecondary, textAlign: 'center', marginTop: 4}]}>
                Uploading… {progress}%
              </Text>
            )}

            <View style={{marginTop: spacing.md}}>
              <AppButton title="Upload Material" onPress={handleUpload} loading={uploading} />
            </View>
          </View>

          {/* My uploaded materials list */}
          <Text style={[textStyles.h5, {color: colors.textPrimary, marginTop: spacing.xl, marginBottom: spacing.md}]}>
            My Uploaded Materials
          </Text>
          {materials.length === 0 && !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={{fontSize: 48}}>📁</Text>
              <Text style={[textStyles.body1, {color: colors.textSecondary, marginTop: 12}]}>No materials uploaded yet</Text>
            </View>
          ) : (
            materials.map(item => (
              <MaterialCard
                key={item.id}
                item={item}
                onDelete={() => handleDelete(item)}
                onEdit={() => { setEditItem(item); setShowEdit(true); }}
                {...themePass}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <EditModal
        visible={showEdit}
        item={editItem}
        onClose={() => { setShowEdit(false); setEditItem(null); }}
        onSaved={() => { setShowEdit(false); setEditItem(null); dispatch(fetchMaterials({})); }}
        {...themePass}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:     {flex: 1},
  scroll:        {paddingBottom: 40},
  formCard:      {},
  chip:          {paddingHorizontal: 14, paddingVertical: 7},
  filePicker:    {alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 4},
  progressTrack: {height: 8, overflow: 'hidden'},
  progressFill:  {height: '100%'},
  card:          {},
  cardRow:       {flexDirection: 'row', alignItems: 'center'},
  metaRow:       {flexDirection: 'row', marginTop: 4, flexWrap: 'wrap'},
  emptyWrap:     {alignItems: 'center', paddingTop: 40},
  modalOverlay:  {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end'},
  modalSheet:    {margin: 12, marginBottom: 24},
});

export default UploadMaterialScreen;
