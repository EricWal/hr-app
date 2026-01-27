import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  StatusBar,
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../../constants/colors";
import { fonts } from "../../constants/fonts";
import { useRequests } from "../../context/RequestsContext";

// Function to convert English numbers to Arabic numbers
const toArabicNumbers = (str) => {
  if (!str) return str;
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = String(str);
  englishNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, 'g'), arabicNumbers[idx]);
  });
  return result;
};

export default function EmployeeHome() {
  const router = useRouter();
  const { requests } = useRequests();
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState(null);

  // Helper to parse date from string (handles formats like 'YYYY-MM-DD' or 'YYYY-MM-DD - يوم: الثلاثاء')
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/); // Extract YYYY-MM-DD part
    return match ? new Date(match[1]) : null;
  };

  // Compute remaining minutes for current month (8 hours quota)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const usedThisMonthMinutes = (requests || [])
    .filter((r) => r.type === "استئذان" && r.date)
    .filter((r) => {
      const parsedDate = parseDate(r.date);
      return (
        parsedDate &&
        parsedDate.getFullYear() === currentYear &&
        parsedDate.getMonth() === currentMonth
      );
    })
    .reduce(
      (s, r) =>
        s + (typeof r.durationMinutes === "number" ? r.durationMinutes : 0),
      0,
    );

  const remainingMonthMinutes = Math.max(0, 8 * 60 - usedThisMonthMinutes);
  const remainingMonthLabel = `${Math.floor(remainingMonthMinutes / 60)} ساعة ${remainingMonthMinutes % 60} دقيقة`;

  // Get submission timestamp: Use id (Date.now() at submission) as reliable submission time
  const getTimestamp = (req) => {
    // Use id as primary (submission timestamp) — fixes bug where old annual leaves show instead of new
    if (req.id) return Number(req.id); // id is Date.now() number
    // Fallbacks if id missing (unlikely)
    if (req.createdDate) return new Date(req.createdDate).getTime();
    if (req.type && req.type.includes("إجازة"))
      return new Date(req.startDate || 0).getTime();
    const parsed = parseDate(req.date);
    return parsed ? parsed.getTime() : 0;
  };

  // Select most recent 3 requests (all types) by submission desc, then sort those 3 ascending by submission date
  const recent = (requests || [])
    .slice()
    .sort((a, b) => getTimestamp(b) - getTimestamp(a)) // الأحدث أولًا
    .slice(0, 3); // أحدث 3 فقطخ

  // Enhanced status color logic with more regex patterns for variations
  const getStatusColor = (status) => {
    if (!status) return colors.warning;
    const s = String(status).toLowerCase(); // Normalize to lowercase for matching
    if (/موافق|مواف|approved|accept/i.test(s)) return colors.success;
    if (/رفض|مرفوض|rejected|deny/i.test(s)) return colors.error;
    return colors.warning; // Pending or other
  };

  // Pull-to-refresh handler
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a small delay for visual feedback
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Reusable QuickAction component
  const QuickAction = ({ emoji, label, onPress, bg }) => (
    <TouchableOpacity
      style={[styles.action, { backgroundColor: bg || colors.primaryLight }]}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityLabel={label} // Added for accessibility
    >
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Render item for recent requests (all types: leave, annual leave, etc.)
  const renderRequest = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    // Display date based on request type
    let displayDate = "";
    if (item.type && item.type.includes("إجازة")) {
      // Annual leave: show startDate or range
      displayDate =
        item.startDate && item.endDate
          ? `${item.startDate} الى ${item.endDate}`
          : item.startDate || "—";
    } else {
      // Leave/Absence: show single date
      displayDate = item.date ? item.date.split(" - ")[0] : "—";
    }

    return (
      <TouchableOpacity
        style={styles.requestRow}
        onPress={() => setSelectedRequest(item)}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.requestType}>رقم الطلب الإلكتروني: {item.id}</Text>
          <Text style={styles.requestType}>{item.type || "طلب"}</Text>
          <Text style={styles.requestDate}>
            تاريخ الطلب:{" "}
            {toArabicNumbers(new Date(Number(item.id)).toLocaleDateString("ar-SA")) || "—"}
          </Text>
          {/* <Text style={styles.requestDate}>التاريخ: {displayDate}</Text> */}
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}>
          <Text style={[styles.statusText, { color: colors.text.inverse }]}>
            {item.status || "قيد المراجعة"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          // Added pull-to-refresh
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with greeting and avatar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحبا 👋</Text>
            <Text style={styles.name}>الموظف</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/(employee)/profile")} // Made clickable to profile (add route if needed)
            accessibilityLabel="الملف الشخصي"
          >
            <Text style={styles.avatarText}>م</Text>
          </TouchableOpacity>
        </View>

        {/* Remaining balance card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الرصيد المتبقي لهذا الشهر</Text>
          <Text style={styles.cardValue}>{remainingMonthLabel}</Text>
          <Text style={styles.cardSubtitle}>من أصل 8 ساعات</Text>
        </View>

        {/* Quick Actions – Added one more for annual leave */}
        <View style={styles.actionsRow}>
          <QuickAction
            emoji="📝"
            label="طلب استئذان"
            bg={colors.primary}
            onPress={() => router.push("/(employee)/requests/leave")}
          />
          <QuickAction
            emoji="📋"
            label="طلباتي"
            bg={colors.primary}
            onPress={() => router.push("/(employee)/requests/list")}
          />
          <QuickAction
            emoji="🏖️"
            label="طلب إجازة"
            bg={colors.success} // Different color for variety
            onPress={() => router.push("/(employee)/requests/annual-leave")} // Add this route in your app
          />
        </View>

        {/* Recent Requests section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>أحدث الطلبات</Text>
        </View>

        {refreshing ? ( // Simple loading state during refresh
          <Text style={styles.emptyText}>جاري التحميل...</Text>
        ) : recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>لا توجد طلبات حتى الآن</Text>
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: 12 }]} // Added button to create first request
              onPress={() => router.push("/(employee)/requests/leave")}
            >
              <Text style={styles.submitText}>إنشاء طلب جديد</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={renderRequest}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </ScrollView>

      {/* Quick Summary Modal for selected request */}
      <Modal
        visible={!!selectedRequest}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelectedRequest(null)}
            >
              <Text style={{ fontSize: 24, color: colors.text.primary }}>
                ✕
              </Text>
            </TouchableOpacity>

            {selectedRequest && (
              <>
                <Text style={styles.modalTitle}>ملخص الطلب</Text>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>رقم الطلب الإلكتروني:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.id}</Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>تاريخ التقديم:</Text>
                  <Text style={styles.modalValue}>
                    {toArabicNumbers(new Date(Number(selectedRequest.id)).toLocaleDateString("ar-SA"))}
                  </Text>
                </View>

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>النوع:</Text>
                  <Text style={styles.modalValue}>{selectedRequest.type}</Text>
                </View>

                {selectedRequest.startDate && selectedRequest.endDate && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>تاريخ الإجازة:</Text>
                    <Text style={styles.modalValue}>
                      {`${toArabicNumbers(selectedRequest.startDate)} إلى ${toArabicNumbers(selectedRequest.endDate)}`}
                    </Text>
                  </View>
                )}

                {selectedRequest.fromTime && selectedRequest.toTime && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>التاريخ والوقت:</Text>
                    <Text style={styles.modalValue}>
                      📅 {selectedRequest.date && toArabicNumbers(selectedRequest.date)}
                    </Text>
                    <Text style={[styles.modalValue, { marginTop: 8 }]}>
                      ⏰ من الساعة: {selectedRequest.fromTime}
                    </Text>
                    <Text style={[styles.modalValue, { marginTop: 4 }]}>
                      الى الساعة: {selectedRequest.toTime}
                    </Text>
                  </View>
                )}

                {selectedRequest.durationMinutes && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>المدة:</Text>
                    <Text style={styles.modalValue}>
                      {Math.floor(selectedRequest.durationMinutes / 60)} ساعة{" "}
                      {selectedRequest.durationMinutes % 60} دقيقة
                    </Text>
                  </View>
                )}

                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>الحالة:</Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: getStatusColor(selectedRequest.status),
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.text.inverse,
                        fontFamily: fonts.semiBold,
                      }}
                    >
                      {selectedRequest.status}
                    </Text>
                  </View>
                </View>

                {selectedRequest.status === "مرفوض" && selectedRequest.rejectionReason && (
                  <View style={styles.modalRow}>
                    <Text style={[styles.modalLabel, { color: colors.error }]}>
                      سبب الرفض:
                    </Text>
                    <Text style={[styles.modalValue, { color: colors.error }]}>
                      {selectedRequest.rejectionReason}
                    </Text>
                  </View>
                )}

                {selectedRequest.reason && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>سبب التقديم:</Text>
                    <Text style={styles.modalValue}>
                      {selectedRequest.reason}
                    </Text>
                  </View>
                )}

                {selectedRequest.notes && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>ملاحظات:</Text>
                    <Text style={styles.modalValue}>
                      {selectedRequest.notes}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles remain mostly unchanged, with minor tweaks for consistency
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  greeting: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text.tertiary,
  },
  name: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.text.primary,
    marginTop: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 18,
  },
  card: {
    backgroundColor: colors.background.card, // Changed to card background for consistency
    borderRadius: 14,
    padding: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 18,
  },
  cardTitle: {
    fontFamily: fonts.medium,
    color: colors.text.secondary,
    fontSize: 14,
  },
  cardValue: {
    fontFamily: fonts.bold,
    color: colors.text.primary,
    fontSize: 28,
    marginTop: 6,
  },
  cardSubtitle: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    fontSize: 13,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  action: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  actionEmoji: {
    fontSize: 20,
    marginBottom: 8,
  },
  actionLabel: {
    fontFamily: fonts.medium,
    color: colors.text.inverse,
    fontSize: 13,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  emptyBox: {
    backgroundColor: colors.background.card,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
  },
  requestRow: {
    backgroundColor: colors.background.card, // Changed to card background
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  requestType: {
    fontFamily: fonts.medium,
    color: colors.text.primary,
    fontSize: 15,
  },
  requestDate: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    color: colors.text.inverse,
    fontSize: 12,
  },
  // Added for empty state button
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  submitText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 14,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  closeBtn: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "right",
  },
  modalRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalLabel: {
    fontFamily: fonts.semiBold,
    color: colors.text.secondary,
    fontSize: 13,
  },
  modalValue: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
    fontSize: 14,
    marginTop: 4,
  },
});
