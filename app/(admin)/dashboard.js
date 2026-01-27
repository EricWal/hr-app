// استيراد مكونات الواجهة من React Native
import { SafeAreaView, View, Text, FlatList, Button, StyleSheet, Platform, StatusBar, Modal, TextInput, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

// استيراد hook خاص بالطلبات من Context
import { useRequests } from '../../context/RequestsContext';

// هذا هو الـ component الرئيسي للوحة الإدارة
export default function AdminDashboard() {

  // جلب الطلبات + دالة تحديث الحالة من الـ Context
  const { requests, updateStatus } = useRequests();

  // Search and filter state
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  // Modal state for rejection with reason
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // دالة عند الضغط على "موافقة"
  const approveRequest = (id) => {
    // نغير حالة الطلب إلى "موافق عليه"
    updateStatus(id, 'موافق عليه');
  };

  // دالة لبدء عملية الرفض مع طلب سبب
  const rejectRequest = (id) => {
    setRejectId(id);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmReject = () => {
    if (rejectId != null) {
      updateStatus(rejectId, 'مرفوض', rejectReason);
    }
    setRejectModalVisible(false);
    setRejectId(null);
    setRejectReason('');
  };

  // Dynamic search & filter
  const filtered = useMemo(() => {
    let result = [...requests];

    // filter by status
    if (filterStatus) {
      result = result.filter(r => r.status === filterStatus);
    }

    // search by type, date, or employee name
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(r =>
        (r.type && r.type.toLowerCase().includes(query)) ||
        (r.date && r.date.includes(query)) ||
        (r.employeeName && r.employeeName.toLowerCase().includes(query)) ||
        (r.reason && r.reason.toLowerCase().includes(query))
      );
    }

    return result.reverse();
  }, [requests, searchText, filterStatus]);

  const statuses = ['موافق عليه', 'مرفوض', 'قيد المراجعة'];

  return (
    // الحاوية الرئيسية للصفحة
    <SafeAreaView style={styles.container}>

      {/* عنوان الصفحة */}
      <Text style={styles.title}>لوحة الإدارة - الطلبات</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن طلب..."
          placeholderTextColor={colors.text.tertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter by Status */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filterStatus === null && styles.filterBtnActive]}
          onPress={() => setFilterStatus(null)}
        >
          <Text style={[styles.filterBtnText, filterStatus === null && styles.filterBtnTextActive]}>
            الكل
          </Text>
        </TouchableOpacity>

        {statuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterBtn, filterStatus === status && styles.filterBtnActive]}
            onPress={() => setFilterStatus(filterStatus === status ? null : status)}
          >
            <Text style={[styles.filterBtnText, filterStatus === status && styles.filterBtnTextActive]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FlatList لعرض قائمة الطلبات */}
      <FlatList
        // البيانات التي سيتم عرضها (كل الطلبات المفلترة)
        data={filtered}

        // مفتاح فريد لكل عنصر
        keyExtractor={(item) => item.id.toString()}

        // كيف يتم عرض كل طلب
        renderItem={({ item }) => (
          // كرت الطلب
          <View style={styles.card}>

            {/* نوع الطلب */}
            <Text style={styles.cardText}>النوع: {item.type}</Text>

            {/* تاريخ الطلب */}
            <Text style={styles.cardText}>التاريخ: {item.date}</Text>

            {/* وقت الاستئذان */}
            <Text style={styles.cardText}>
              الوقت: {item.fromTime} - {item.toTime}
            </Text>

            {/* سبب الطلب */}
            <Text style={styles.cardText}>السبب: {item.reason}</Text>

            {/* حالة الطلب الحالية */}
            <Text style={[styles.status, styles.cardText]}>
              الحالة: {item.status}
            </Text>

            {/* إذا كان الطلب قيد المراجعة فقط */}
            {item.status === 'قيد المراجعة' && (
              <View style={styles.actions}>

                {/* زر الموافقة */}
                <Button
                  title="موافقة"
                  onPress={() => approveRequest(item.id)}
                />

                {/* زر الرفض */}
                <Button
                  title="رفض"
                  color={colors.error}
                  onPress={() => rejectRequest(item.id)}
                />

              </View>
            )}
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />

      {/* Rejection Reason Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="slide"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', backgroundColor: colors.background.card, padding: 16, borderRadius: 12 }}>
            <Text style={{ fontFamily: fonts.semiBold, color: colors.text.primary, marginBottom: 8 }}>سبب الرفض</Text>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="اكتب سبب الرفض..."
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, backgroundColor: colors.background.subtle }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={{ marginRight: 12 }}>
                <Text style={{ color: colors.text.secondary }}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmReject}>
                <Text style={{ color: colors.error }}>تأكيد الرفض</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// تنسيقات الصفحة
const styles = StyleSheet.create({
  // الحاوية الرئيسية
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0
  },

  // عنوان الصفحة
  title: {
    fontSize: 20,
    marginBottom: 12,
    fontFamily: fonts.bold,
    color: colors.text.primary,
    paddingHorizontal: 20,
    paddingTop: 12
  },

  // كرت الطلب
  card: {
    backgroundColor: colors.background.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 20
  },

  // نص الحالة
  status: {
    marginTop: 6,
    fontFamily: fonts.semiBold,
    color: colors.text.primary
  },

  cardText: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
    marginTop: 4
  },

  // أزرار الموافقة / الرفض
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  // Search and Filter styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.background.subtle,
    fontFamily: fonts.regular,
    color: colors.text.primary,
  },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexWrap: 'wrap',
  },
  filterBtn: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterBtnText: {
    fontFamily: fonts.regular,
    color: colors.text.secondary,
    fontSize: 12,
  },
  filterBtnTextActive: {
    color: colors.text.inverse,
    fontFamily: fonts.semiBold,
  },
});
