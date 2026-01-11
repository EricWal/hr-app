// استيراد أدوات React
import { createContext, useContext, useEffect, useState } from 'react';

// استيراد AsyncStorage للتخزين المحلي
import AsyncStorage from '@react-native-async-storage/async-storage';

// إنشاء Context للطلبات
const RequestsContext = createContext();

// Provider يلف التطبيق ويعطيه البيانات
export function RequestsProvider({ children }) {

  // State لتخزين كل الطلبات
  const [requests, setRequests] = useState([]);

  // 🔹 تحميل الطلبات من التخزين عند تشغيل التطبيق
  useEffect(() => {
    loadRequests();
  }, []);

  // دالة تحميل الطلبات
  const loadRequests = async () => {
    try {
      // جلب البيانات المخزنة
      const storedRequests = await AsyncStorage.getItem('requests');

      // إذا فيه بيانات
      if (storedRequests) {
        // نحول النص إلى Array
        setRequests(JSON.parse(storedRequests));
      }
    } catch (error) {
      console.log('خطأ في تحميل الطلبات', error);
    }
  };

  // دالة حفظ الطلبات في التخزين
  const saveRequests = async (newRequests) => {
    try {
      // نحول البيانات إلى نص ونحفظها
      await AsyncStorage.setItem(
        'requests',
        JSON.stringify(newRequests)
      );
    } catch (error) {
      console.log('خطأ في حفظ الطلبات', error);
    }
  };

  // إضافة طلب جديد
  const addRequest = (request) => {
    // نضيف الطلب للقائمة
    const newRequests = [...requests, request];

    // نحدّث الـ state
    setRequests(newRequests);

    // نحفظ في AsyncStorage
    saveRequests(newRequests);
  };

  // تغيير حالة الطلب (موافقة / رفض)
  const updateStatus = (id, status) => {
    // نعدّل الطلب المطلوب فقط
    const updatedRequests = requests.map((r) =>
      r.id === id ? { ...r, status } : r
    );

    // نحدّث الـ state
    setRequests(updatedRequests);

    // نحفظ التغيير
    saveRequests(updatedRequests);
  };

  return (
    // توفير البيانات لكل التطبيق
    <RequestsContext.Provider
      value={{ requests, addRequest, updateStatus }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

// Hook مخصص لاستخدام الطلبات
export function useRequests() {
  return useContext(RequestsContext);
}
