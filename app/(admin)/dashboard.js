// استيراد مكونات الواجهة من React Native
import { SafeAreaView, View, Text, FlatList, Button, StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

// استيراد hook خاص بالطلبات من Context
import { useRequests } from '../../context/RequestsContext';

// هذا هو الـ component الرئيسي للوحة الإدارة
export default function AdminDashboard() {

  // جلب الطلبات + دالة تحديث الحالة من الـ Context
  const { requests, updateStatus } = useRequests();

  // دالة عند الضغط على "موافقة"
  const approveRequest = (id) => {
    // نغير حالة الطلب إلى "موافق عليه"
    updateStatus(id, 'موافق عليه');
  };

  // دالة عند الضغط على "رفض"
  const rejectRequest = (id) => {
    // نغير حالة الطلب إلى "مرفوض"
    updateStatus(id, 'مرفوض');
  };

  return (
    // الحاوية الرئيسية للصفحة
    <SafeAreaView style={styles.container}>

      {/* عنوان الصفحة */}
      <Text style={styles.title}>لوحة الإدارة - الطلبات</Text>

      {/* FlatList لعرض قائمة الطلبات */}
      <FlatList
        // البيانات التي سيتم عرضها (كل الطلبات)
        data={requests}

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
  }
});
