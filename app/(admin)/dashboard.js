// استيراد مكونات الواجهة من React Native
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

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
    <View style={styles.container}>

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
            <Text>النوع: {item.type}</Text>

            {/* تاريخ الطلب */}
            <Text>التاريخ: {item.date}</Text>

            {/* وقت الاستئذان */}
            <Text>
              الوقت: {item.fromTime} - {item.toTime}
            </Text>

            {/* سبب الطلب */}
            <Text>السبب: {item.reason}</Text>

            {/* حالة الطلب الحالية */}
            <Text style={styles.status}>
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
                  color="red"
                  onPress={() => rejectRequest(item.id)}
                />

              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

// تنسيقات الصفحة
const styles = StyleSheet.create({
  // الحاوية الرئيسية
  container: {
    padding: 20
  },

  // عنوان الصفحة
  title: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold'
  },

  // كرت الطلب
  card: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },

  // نص الحالة
  status: {
    marginTop: 5,
    fontWeight: 'bold'
  },

  // أزرار الموافقة / الرفض
  actions: {
    marginTop: 10
  }
});
