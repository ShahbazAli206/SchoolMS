import React, {useState, useEffect, useCallback} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useTheme} from '../../themes/ThemeContext';
import {submitComplaintThunk, clearComplaintError} from '../../redux/slices/complaintSlice';
import {fetchChildren} from '../../redux/slices/parentSlice';

const SubmitComplaintScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {actionLoading, error} = useSelector(s => s.complaints);
  const {children}             = useSelector(s => s.parent);

  const [title,      setTitle]      = useState('');
  const [description, setDesc]      = useState('');
  const [selectedChild, setChild]   = useState(null);
  const [image,      setImage]      = useState(null);

  useEffect(() => { dispatch(fetchChildren()); }, [dispatch]);

  useEffect(() => {
    if (error) Alert.alert('Error', error, [{text: 'OK', onPress: () => dispatch(clearComplaintError())}]);
  }, [error, dispatch]);

  const pickFromGallery = useCallback(() => {
    launchImageLibrary({mediaType: 'photo', quality: 0.7, includeBase64: false}, res => {
      if (!res.didCancel && !res.errorCode && res.assets?.[0]) {
        setImage(res.assets[0]);
      }
    });
  }, []);

  const pickFromCamera = useCallback(() => {
    launchCamera({mediaType: 'photo', quality: 0.7, includeBase64: false, saveToPhotos: false}, res => {
      if (!res.didCancel && !res.errorCode && res.assets?.[0]) {
        setImage(res.assets[0]);
      }
    });
  }, []);

  const handleImagePick = useCallback(() => {
    Alert.alert('Attach Image', 'Choose source', [
      {text: 'Camera',  onPress: pickFromCamera},
      {text: 'Gallery', onPress: pickFromGallery},
      {text: 'Cancel',  style: 'cancel'},
    ]);
  }, [pickFromCamera, pickFromGallery]);

  const handleSubmit = useCallback(() => {
    if (!title.trim())       { Alert.alert('Validation', 'Title is required'); return; }
    if (!description.trim()) { Alert.alert('Validation', 'Description is required'); return; }

    const formData = new FormData();
    formData.append('title',       title.trim());
    formData.append('description', description.trim());
    if (selectedChild) formData.append('student_id', String(selectedChild.id));
    if (image) {
      formData.append('image', {
        uri:  image.uri,
        type: image.type || 'image/jpeg',
        name: image.fileName || 'complaint.jpg',
      });
    }

    dispatch(submitComplaintThunk(formData)).unwrap()
      .then(() => {
        Alert.alert('Submitted', 'Your complaint has been submitted successfully.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      })
      .catch(() => {});
  }, [title, description, selectedChild, image, dispatch, navigation]);

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    color: colors.textPrimary,
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 10}}>
          <Text style={[textStyles.body1, {color: colors.white}]}>←</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white}]}>New Complaint</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: spacing.base, paddingBottom: 50}}>
        {/* Title */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginBottom: 6}]}>Title *</Text>
        <TextInput
          style={[styles.input, inputStyle]}
          value={title}
          onChangeText={setTitle}
          placeholder="Brief title of your complaint"
          placeholderTextColor={colors.textSecondary}
          maxLength={200}
        />

        {/* Description */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 6}]}>
          Description *
        </Text>
        <TextInput
          style={[styles.input, inputStyle, styles.textArea]}
          value={description}
          onChangeText={setDesc}
          placeholder="Describe your complaint in detail..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={2000}
        />

        {/* Child selector */}
        {children?.length > 0 && (
          <>
            <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>
              Regarding child (optional)
            </Text>
            <View style={styles.chips}>
              <TouchableOpacity
                onPress={() => setChild(null)}
                style={[styles.chip, {
                  backgroundColor: !selectedChild ? colors.primary : colors.surface,
                  borderColor: !selectedChild ? colors.primary : colors.border,
                }]}>
                <Text style={[textStyles.caption, {color: !selectedChild ? colors.white : colors.textSecondary}]}>
                  General
                </Text>
              </TouchableOpacity>
              {children.map(child => (
                <TouchableOpacity
                  key={child.id}
                  onPress={() => setChild(child)}
                  style={[styles.chip, {
                    backgroundColor: selectedChild?.id === child.id ? colors.primary : colors.surface,
                    borderColor: selectedChild?.id === child.id ? colors.primary : colors.border,
                  }]}>
                  <Text style={[textStyles.caption, {
                    color: selectedChild?.id === child.id ? colors.white : colors.textSecondary,
                  }]}>
                    {child.user?.name || `Child ${child.id}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Image attachment */}
        <Text style={[textStyles.body2, {color: colors.textSecondary, marginTop: spacing.base, marginBottom: 8}]}>
          Attach Image (optional)
        </Text>

        {image ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{uri: image.uri}} style={[styles.imagePreview, {borderRadius: borderRadius.md}]} />
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={[styles.removeImg, {backgroundColor: colors.error}]}>
              <Text style={{color: '#fff', fontWeight: '700', fontSize: 12}}>✕ Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleImagePick}
            style={[styles.imagePicker, {
              borderColor: colors.border,
              borderRadius: borderRadius.md,
              backgroundColor: colors.surface,
            }]}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={[textStyles.body2, {color: colors.textSecondary}]}>Tap to attach image</Text>
          </TouchableOpacity>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={actionLoading}
          style={[styles.submitBtn, {
            backgroundColor: actionLoading ? colors.border : colors.primary,
            borderRadius: borderRadius.md,
            marginTop: spacing.xl,
          }]}>
          {actionLoading
            ? <ActivityIndicator color="#fff" />
            : <Text style={[textStyles.body1, {color: colors.white, fontWeight: '600'}]}>Submit Complaint</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        {flex: 1},
  header:           {flexDirection: 'row', alignItems: 'center'},
  input:            {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14},
  textArea:         {height: 120},
  chips:            {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip:             {borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20},
  imagePicker:      {borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 8},
  imagePickerIcon:  {fontSize: 32},
  imagePreviewWrap: {alignItems: 'flex-start'},
  imagePreview:     {width: '100%', height: 180, resizeMode: 'cover'},
  removeImg:        {marginTop: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8},
  submitBtn:        {paddingVertical: 14, alignItems: 'center'},
});

export default SubmitComplaintScreen;
