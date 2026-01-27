import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export default function EmployeeProfile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Employee data (can be fetched from context/API later)
  const [profile, setProfile] = useState({
    name: 'عبيد خالد',
    email: 'obaid@company.com',
    phone: '+966 50 123 4567',
    role: 'موظف اداري',
    department: 'إدارة المشاريع',
    joinDate: '2023-01-15',
    employeeId: 'EMP-2023-001',
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    Alert.alert('نجح', 'تم تحديث البيانات بنجاح');
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const ProfileField = ({ label, value, field }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.fieldInput}
          value={editedProfile[field]}
          onChangeText={(text) =>
            setEditedProfile({ ...editedProfile, [field]: text })
          }
          editable={field !== 'employeeId'}
          placeholderTextColor={colors.text.tertiary}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>
              {profile.name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.nameText}>{profile.name}</Text>
          <Text style={styles.roleText}>{profile.role}</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          <ProfileField label="رقم الموظف" value={profile.employeeId} field="employeeId" />
          <ProfileField label="البريد الإلكتروني" value={profile.email} field="email" />
          <ProfileField label="رقم الهاتف" value={profile.phone} field="phone" />
          <ProfileField label="الوظيفة" value={profile.role} field="role" />
          <ProfileField label="الإدارة / القسم" value={profile.department} field="department" />
          <ProfileField label="تاريخ الالتحاق" value={profile.joinDate} field="joinDate" />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          {!isEditing ? (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>تعديل البيانات</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>حفظ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.buttonTextCancel}>إلغاء</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert('تسجيل الخروج', 'هل أنت متأكد؟', [
              { text: 'إلغاء', onPress: () => {} },
              {
                text: 'تسجيل الخروج',
                onPress: () => router.replace('/(auth)/login'),
              },
            ]);
          }}
        >
          <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.text.primary,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  largeAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    fontFamily: fonts.bold,
    fontSize: 40,
    color: colors.text.inverse,
  },
  nameText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 4,
  },
  roleText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text.secondary,
  },
  fieldsContainer: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  fieldValue: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text.primary,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background.subtle,
    fontFamily: fonts.regular,
    color: colors.text.primary,
  },
  buttonsContainer: {
    marginBottom: 16,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  saveButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 15,
  },
  buttonTextCancel: {
    fontFamily: fonts.bold,
    color: colors.text.secondary,
    fontSize: 15,
  },
  logoutButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.error,
  },
  logoutButtonText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 15,
  },
});
