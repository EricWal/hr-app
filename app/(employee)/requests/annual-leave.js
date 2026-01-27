import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  Platform,
  StatusBar,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRequests } from '../../../context/RequestsContext';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';

const { width } = Dimensions.get('window');

export default function AnnualLeaveRequest() {
  const router = useRouter();
  const { addRequest } = useRequests();

  // Form state
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const [errors, setErrors] = useState({});

  // Pre-filled employee data
  const employeeName = 'عبيد خالد';
  const role = 'موظف اداري';
  const department = 'إدارة المشاريع';

  const leaveTypes = [
    { label: 'إجازة سنوية', value: 'سنوية' },
    { label: 'إجازة مرضية', value: 'مرضية' },
    { label: 'إجازة استثنائية', value: 'استثنائية' },
  ];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const onDateSelect = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (datePickerMode === 'start') {
      setStartDate(dateStr);
      setEndDate(''); // Clear end date when start date changes
      setDatePickerMode('end');
    } else {
      setEndDate(dateStr);
      setShowDateModal(false);
      setDatePickerMode('start');
    }
  };

  const validateAndSubmit = () => {
    const newErrors = {};

    if (!leaveType) newErrors.leaveType = 'اختر نوع الإجازة';
    if (!startDate) newErrors.startDate = 'حدد تاريخ البداية';
    if (!endDate) newErrors.endDate = 'حدد تاريخ النهاية';
    if (!reason) newErrors.reason = 'اكتب سبب الإجازة';

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.date = 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const request = {
      id: Date.now(),
      type: `إجازة ${leaveType}`,
      startDate,
      endDate,
      reason,
      employeeName,
      role,
      department,
      status: 'قيد المراجعة',
      createdDate: new Date().toISOString().split('T')[0],
    };

    addRequest(request);
    alert('تم إرسال طلب الإجازة بنجاح');
    router.back();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Get current month/year for calendar display
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => 
    new Date(currentYear, currentMonth, i + 1)
  );
  const firstWeekday = new Date(currentYear, currentMonth, 1).getDay();
  const calendarGrid = [...Array(firstWeekday).fill(null), ...days];

  // Function to format date for display
  function formatDateDisplay(year, month, day) {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  // Get calendar grid with proper weekday alignment
  const getCalendarGrid = () => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const daysInSelectedMonth = getDaysInMonth(selectedYear, selectedMonth);
    
    // Create array with empty placeholders for days before the 1st
    const grid = Array(firstDayOfMonth).fill(null);
    
    // Add the actual days of the month
    for (let i = 1; i <= daysInSelectedMonth; i++) {
      grid.push(i);
    }
    
    return grid;
  };

  // Check if a day should be disabled (for end date picker)
  const isDayDisabled = (day) => {
    if (!day || datePickerMode !== 'end' || !startDate) return false;
    
    const startDateObj = new Date(startDate);
    const currentDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return new Date(currentDateStr) <= startDateObj;
  };

  // Check if a date is special and return details
  const getSpecialDateInfo = (month, day) => {
    const specialDates = {
      '01-30': { name: 'Rusev Day', icon: '🎖️', color: '#DC2626' },
      '02-25': { name: 'National Day', icon: '✅', color: '#059669' },
      '02-26': { name: 'Liberation Day', icon: '🏆', color: '#D97706' },
      '06-22': { name: 'Special Day', icon: '⭐', color: '#7C3AED' },
    };
    const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return specialDates[key];
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>طلب إجازة سنوية</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Employee info - disabled */}
        <View style={styles.rowTriple}>
          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>اسم الموظف</Text>
            <TextInput
              value={employeeName}
              editable={false}
              style={[styles.input, styles.disabled]}
            />
          </View>
          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>الوظيفة</Text>
            <TextInput
              value={role}
              editable={false}
              style={[styles.input, styles.disabled]}
            />
          </View>
          <View style={styles.cellSmall}>
            <Text style={styles.labelSmall}>الإدارة</Text>
            <TextInput
              value={department}
              editable={false}
              style={[styles.input, styles.disabled]}
            />
          </View>
        </View>

        {/* Leave Type Dropdown */}
        <Text style={styles.labelSmall}>نوع الإجازة</Text>
        <View style={styles.dropdownContainer}>
          {leaveTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.dropdownOption,
                leaveType === type.value && styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                setLeaveType(type.value);
                setErrors((e) => ({ ...e, leaveType: undefined }));
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  leaveType === type.value && styles.dropdownOptionTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.leaveType && (
          <Text style={styles.errorText}>{errors.leaveType}</Text>
        )}

        {/* Date Pickers */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.labelSmall}>تاريخ النهاية</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setDatePickerMode('end');
                setShowDateModal(true);
              }}
            >
              <Text
                style={{
                  textAlign: 'right',
                  color: endDate ? colors.text.primary : colors.text.tertiary,
                }}
              >
                {endDate || 'اختر...'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.labelSmall}>تاريخ البداية</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setDatePickerMode('start');
                setShowDateModal(true);
              }}
            >
              <Text
                style={{
                  textAlign: 'right',
                  color: startDate ? colors.text.primary : colors.text.tertiary,
                }}
              >
                {startDate || 'اختر...'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

        {/* Reason */}
        <Text style={styles.labelSmall}>سبب الإجازة</Text>
        <TextInput
          value={reason}
          onChangeText={(text) => {
            setReason(text);
            setErrors((e) => ({ ...e, reason: undefined }));
          }}
          placeholder="اكتب سبب طلب الإجازة..."
          placeholderTextColor={colors.text.tertiary}
          style={styles.input}
          multiline
          numberOfLines={4}
        />
        {errors.reason && (
          <Text style={styles.errorText}>{errors.reason}</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={validateAndSubmit}
        >
          <Text style={styles.submitText}>إرسال طلب الإجازة</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
      {/* Date Picker Modal */}
      <Modal visible={showDateModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.datePickerModal}>
            <Text style={styles.dateModalTitle}>
              اختر {datePickerMode === 'start' ? 'تاريخ البداية' : 'تاريخ النهاية'}
            </Text>

            <View style={styles.monthYearPicker}>
              <View style={styles.navButtonContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMonth(selectedMonth === 1 ? 12 : selectedMonth - 1)
                  }
                >
                  <Text style={styles.pickerButton}>◀</Text>
                  <Text style={styles.navButtonLabel}>السابق</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.monthYearText}>
                {new Date(selectedYear, selectedMonth - 1).toLocaleString(
                  'ar-SA',
                  { month: 'long', year: 'numeric' }
                )}
              </Text>

              <View style={styles.navButtonContainer}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMonth(selectedMonth === 12 ? 1 : selectedMonth + 1)
                  }
                >
                  <Text style={styles.pickerButton}>▶</Text>
                  <Text style={styles.navButtonLabel}>التالي</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Day names header */}
            <View style={[styles.daysHeaderRow, { flexDirection: 'row' }]}>
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((dayName, idx) => (
                <Text key={idx} style={styles.dayNameHeader}>{dayName}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getCalendarGrid().map((day, idx) => {
                if (!day) {
                  return <View key={`empty-${idx}`} style={styles.dayButton} />;
                }
                
                const disabled = isDayDisabled(day);
                const specialInfo = getSpecialDateInfo(selectedMonth, day);
                
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      disabled && styles.disabledDayButton,
                      specialInfo && !disabled && { backgroundColor: specialInfo.color, borderWidth: 2, borderColor: specialInfo.color }
                    ]}
                    onPress={() => !disabled && onDateSelect(day)}
                    disabled={disabled}
                  >
                    {specialInfo && !disabled && (
                      <Text style={styles.specialDayIcon}>{specialInfo.icon}</Text>
                    )}
                    <Text style={[
                      styles.dayButtonText,
                      disabled && styles.disabledDayText,
                      specialInfo && !disabled && { color: colors.text.inverse, fontFamily: fonts.bold }
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title="إغلاق"
              onPress={() => setShowDateModal(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text.primary,
  },
  rowTriple: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cellSmall: {
    flex: 1,
    marginHorizontal: 4,
  },
  labelSmall: {
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    marginBottom: 6,
    fontSize: 13,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderColor: colors.border,
    backgroundColor: colors.background.subtle,
    fontFamily: fonts.regular,
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.6,
    backgroundColor: colors.background.card,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.background.subtle,
  },
  dropdownOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dropdownOptionText: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
    textAlign: 'right',
  },
  dropdownOptionTextSelected: {
    color: colors.text.inverse,
    fontFamily: fonts.semiBold,
  },
  errorText: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  dateModalTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  monthYearPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthYearText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  pickerButton: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.primary,
    paddingHorizontal: 12,
  },
  navButtonContainer: {
    alignItems: 'center',
  },
  navButtonLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 2,
  },
  daysHeaderRow: {
    marginBottom: 12,
    marginHorizontal: 0,
  },
  dayNameHeader: {
    width: '14%',
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.text.secondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: '14%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.background.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  disabledDayButton: {
    backgroundColor: colors.background.subtle,
    opacity: 0.4,
  },
  dayButtonText: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
    fontSize: 12,
  },
  disabledDayText: {
    color: colors.text.tertiary,
  },
  specialDayIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 12,
  },
});
