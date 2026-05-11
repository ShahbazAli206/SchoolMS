import React, {useEffect, useState} from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTheme} from '../../themes/ThemeContext';
import {recordPaymentThunk, fetchAllFees, fetchFeeDashboard} from '../../redux/slices/feeSlice';
import {fetchClassStudents} from '../../redux/slices/teacherSlice';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';

const PAYMENT_METHODS = [
  {key: 'cash',          label: '💵 Cash'},
  {key: 'bank_transfer', label: '🏦 Bank Transfer'},
  {key: 'online',        label: '📱 Online'},
  {key: 'cheque',        label: '📄 Cheque'},
  {key: 'other',         label: '💳 Other'},
];

const AdminRecordPaymentScreen = ({navigation, route}) => {
  const dispatch = useDispatch();
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const {actionLoading} = useSelector(s => s.fees);
  const {classStudents} = useSelector(s => s.teacher);

  // fee may be passed from AdminFeesDashboard
  const preselectedFee = route.params?.fee || null;

  const [form, setForm] = useState({
    student_id:     '',
    amount_paid:    preselectedFee ? String(preselectedFee.balance ?? preselectedFee.amount) : '',
    paid_date:      new Date().toISOString().slice(0, 10),
    payment_method: 'cash',
    reference_no:   '',
    remarks:        '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load students for the fee's class if a fee is preselected
    if (preselectedFee?.class?.id) {
      dispatch(fetchClassStudents(String(preselectedFee.class.id)));
    }
  }, []);

  const set = (k, v) => {
    setForm(p => ({...p, [k]: v}));
    if (errors[k]) setErrors(p => ({...p, [k]: ''}));
  };

  const validate = () => {
    const e = {};
    if (!form.student_id)          e.student_id  = 'Select a student';
    if (!form.amount_paid.trim())  e.amount_paid = 'Amount required';
    if (!form.paid_date.trim())    e.paid_date   = 'Date required';
    if (!preselectedFee)           e.fee         = 'No fee selected — go back and tap Pay on a fee';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    const result = await dispatch(recordPaymentThunk({
      feeId: preselectedFee.id,
      data: {
        student_id:     parseInt(form.student_id),
        amount_paid:    parseFloat(form.amount_paid),
        paid_date:      form.paid_date.trim(),
        payment_method: form.payment_method,
        reference_no:   form.reference_no.trim() || undefined,
        remarks:        form.remarks.trim() || undefined,
      },
    }));

    if (recordPaymentThunk.fulfilled.match(result)) {
      Alert.alert('Success', 'Payment recorded successfully!', [
        {text: 'OK', onPress: () => {
          dispatch(fetchAllFees({limit: 30}));
          dispatch(fetchFeeDashboard());
          navigation.goBack();
        }},
      ]);
    } else {
      Alert.alert('Error', result.payload || 'Failed to record payment');
    }
  };

  const chipStyle = active => ({
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: active ? colors.primary : colors.inputBg,
    borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: active ? colors.primary : colors.border,
    marginRight: 8,
  });

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={[styles.header, {backgroundColor: colors.headerBg, padding: spacing.base, paddingTop: 20}]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[textStyles.body1, {color: colors.white}]}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={[textStyles.h5, {color: colors.white}]}>Record Payment</Text>
        <View style={{width: 60}} />
      </View>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scroll, {padding: spacing.base}]} showsVerticalScrollIndicator={false}>

          {/* Fee summary card */}
          {preselectedFee ? (
            <View style={[styles.feeInfo, {backgroundColor: colors.primaryFaded, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md}]}>
              <Text style={[textStyles.body1, {color: colors.primary, fontWeight: '700'}]}>{preselectedFee.title}</Text>
              <View style={styles.feeInfoRow}>
                <Text style={[textStyles.caption, {color: colors.primary}]}>
                  Total: Rs. {Number(preselectedFee.amount).toLocaleString()}
                </Text>
                <Text style={[textStyles.caption, {color: colors.primary}]}>
                  Balance: Rs. {Number(preselectedFee.balance || 0).toLocaleString()}
                </Text>
              </View>
            </View>
          ) : (
            <View style={[{backgroundColor: colors.errorFaded, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.md}]}>
              <Text style={[textStyles.body2, {color: colors.error}]}>
                ⚠️ No fee selected. Go back to the Fee list and tap "Pay" on a fee.
              </Text>
            </View>
          )}

          {/* Student picker */}
          {classStudents.length > 0 ? (
            <>
              <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 6}]}>Student *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.sm}}>
                {classStudents.map(s => (
                  <TouchableOpacity key={s.id} onPress={() => set('student_id', String(s.id))} style={chipStyle(form.student_id === String(s.id))}>
                    <Text style={[textStyles.caption, {color: form.student_id === String(s.id) ? colors.white : colors.textSecondary}]}>
                      {s.user?.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.student_id ? <Text style={[textStyles.caption, {color: colors.error, marginBottom: 8}]}>{errors.student_id}</Text> : null}
            </>
          ) : (
            // Individual fee — show the student name directly
            preselectedFee?.student?.user?.name ? (
              <View style={[{backgroundColor: colors.inputBg, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.md}]}>
                <Text style={[textStyles.body2, {color: colors.textPrimary}]}>
                  👤 {preselectedFee.student.user.name}
                </Text>
              </View>
            ) : null
          )}

          <AppInput
            label="Amount Paid (Rs.) *"
            value={form.amount_paid}
            onChangeText={v => set('amount_paid', v)}
            keyboardType="numeric"
            placeholder="5000"
            error={errors.amount_paid}
          />

          <AppInput
            label="Payment Date * (YYYY-MM-DD)"
            value={form.paid_date}
            onChangeText={v => set('paid_date', v)}
            placeholder="2025-01-15"
            keyboardType="numbers-and-punctuation"
            error={errors.paid_date}
          />

          {/* Payment method */}
          <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 8}]}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: spacing.md}}>
            {PAYMENT_METHODS.map(m => (
              <TouchableOpacity key={m.key} onPress={() => set('payment_method', m.key)} style={chipStyle(form.payment_method === m.key)}>
                <Text style={[textStyles.caption, {color: form.payment_method === m.key ? colors.white : colors.textSecondary}]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <AppInput
            label="Reference No."
            value={form.reference_no}
            onChangeText={v => set('reference_no', v)}
            placeholder="Transaction / receipt number"
          />

          <AppInput
            label="Remarks"
            value={form.remarks}
            onChangeText={v => set('remarks', v)}
            placeholder="Optional notes"
            multiline
            numberOfLines={2}
          />

          <AppButton title="Record Payment" onPress={handleSubmit} loading={actionLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  scroll: {paddingBottom: 40},
  feeInfo: {},
  feeInfoRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
});

export default AdminRecordPaymentScreen;
