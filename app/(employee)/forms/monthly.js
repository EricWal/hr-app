import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useSearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';
import { useRequests } from '../../../context/RequestsContext';

export default function MonthlyForm() {
  // useSearchParams may not exist in all expo-router versions (it can be undefined)
  // try useSearchParams first, fall back to useLocalSearchParams, then to an empty object
  const _searchParams = (typeof useSearchParams === 'function'
    ? useSearchParams()
    : typeof useLocalSearchParams === 'function'
    ? useLocalSearchParams()
    : {});

  const { month = '1', name = 'يناير' } = _searchParams;
  const router = useRouter();
  const { addRequest } = useRequests();

  // Sample employee data (could be loaded from profile later)
  const [employeeName, setEmployeeName] = useState('عبيد خالد');
  const [role, setRole] = useState('موظف اداري');
  const [department, setDepartment] = useState('إدارة المشاريع');

  const [dayLabel, setDayLabel] = useState('اليوم / الاثنين');
  const [date, setDate] = useState('12-01-2026');
  const [notes, setNotes] = useState('');
  const [fromTime, setFromTime] = useState('8:30 ص');
  const [toTime, setToTime] = useState('9:30 ص');

  const submitForm = () => {
    const request = {
      id: Date.now(),
      type: `استئذان - ${name}`,
      date,
      fromTime,
      toTime,
      reason: notes,
      status: 'قيد المراجعة',
    };

    addRequest(request);
    Alert.alert('تم', 'تم إرسال النموذج كطلب بنجاح');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>نموذج استئذان – شهر {name} ({month})</Text>

        <View style={styles.formCard}>
          {/* Employee info row */}
          <View style={styles.rowTriple}>
            <View style={styles.cell}>
              <Text style={styles.label}>اسم الموظف</Text>
              <TextInput
                value={employeeName}
                onChangeText={setEmployeeName}
                style={styles.inputInline}
                textAlign="right"
              />
            </View>

            <View style={styles.cell}>
              <Text style={styles.label}>الوظيفة</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                style={styles.inputInline}
                textAlign="right"
              />
            </View>

            <View style={styles.cell}>
              <Text style={styles.label}>الإدارة / القسم</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                style={styles.inputInline}
                textAlign="right"
              />
            </View>
          </View>

          {/* Date and notes row */}
          <View style={[styles.row, { marginTop: 10 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelSmall}>{dayLabel}</Text>
              <TextInput value={date} onChangeText={setDate} style={styles.input} textAlign="right" />
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.labelSmall}>الملاحظات</Text>
              <TextInput value={notes} onChangeText={setNotes} style={[styles.input, { height: 60 }]} multiline textAlign="right" />
            </View>
          </View>

          {/* Time row */}
          <View style={[styles.row, { marginTop: 14 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>وقت الاستئذان</Text>
              <View style={styles.timeRow}>
                <View style={styles.timeCell}>
                  <Text style={styles.subLabel}>من</Text>
                  <TextInput value={fromTime} onChangeText={setFromTime} style={styles.inputInline} textAlign="right" />
                </View>

                <View style={[styles.timeCell, { marginLeft: 8 }]}>
                  <Text style={styles.subLabel}>الى</Text>
                  <TextInput value={toTime} onChangeText={setToTime} style={styles.inputInline} textAlign="right" />
                </View>
              </View>
            </View>
          </View>

          {/* Signature lines */}
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>توقيع الموظف</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>توقيع المسئول المباشر</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>توقيع الشئون المالية الإدارية</Text>
              <View style={styles.line} />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={submitForm} activeOpacity={0.85}>
          <Text style={styles.submitText}>إرسال النموذج</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  content: {
    padding: 20,
  },
  header: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'right',
  },
  formCard: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTriple: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 6,
    textAlign: 'right',
  },
  labelSmall: {
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 6,
    textAlign: 'right',
    fontSize: 13,
  },
  inputInline: {
    fontFamily: fonts.regular,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text.primary,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text.primary,
  },
  timeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  timeCell: {
    flex: 1,
  },
  subLabel: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    marginBottom: 4,
    textAlign: 'right',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  signatureBox: {
    flex: 1,
    alignItems: 'center',
  },
  signatureLabel: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    marginBottom: 8,
    textAlign: 'center',
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
    width: '80%',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 16,
  },
});