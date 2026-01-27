import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { useRequests } from "../../../context/RequestsContext";
import { colors } from "../../../constants/colors";
import { fonts } from "../../../constants/fonts";
import React, { useMemo, useState } from "react";

// Function to convert English numbers to Arabic numbers
const toArabicNumbers = (str) => {
  if (!str) return str;
  const englishNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let result = String(str);
  englishNumbers.forEach((num, idx) => {
    result = result.replace(new RegExp(num, "g"), arabicNumbers[idx]);
  });
  return result;
};

export default function MyRequests() {
  const { requests } = useRequests();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const ITEMS_PER_PAGE = 3;

  // Dynamic search & filter
  const filtered = useMemo(() => {
    let result = [...requests];

    // filter by status
    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus);
    }

    // search by type, date, notes, or order id
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      result = result.filter(
        (r) =>
          (r.type && r.type.toLowerCase().includes(query)) ||
          (r.date && r.date.includes(query)) ||
          (r.startDate && r.startDate.includes(query)) ||
          (r.endDate && r.endDate.includes(query)) ||
          (r.notes && r.notes.toLowerCase().includes(query)) ||
          (r.id && r.id.toString().includes(query)),
      );
    }

    return result.reverse();
  }, [requests, searchText, filterStatus]);

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterStatus]);

  const statuses = ["موافق عليه", "مرفوض", "قيد المراجعة"];

  const getStatusColor = (status) => {
    if (!status) return colors.warning;
    const s = String(status);
    if (/موافق|مواف/i.test(s)) return colors.success;
    if (/رفض|مرفوض/i.test(s)) return colors.error;
    return colors.warning;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>طلباتي</Text>

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
          style={[
            styles.filterBtn,
            filterStatus === null && styles.filterBtnActive,
          ]}
          onPress={() => setFilterStatus(null)}
        >
          <Text
            style={[
              styles.filterBtnText,
              filterStatus === null && styles.filterBtnTextActive,
            ]}
          >
            الكل
          </Text>
        </TouchableOpacity>

        {statuses.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              filterStatus === status && styles.filterBtnActive,
            ]}
            onPress={() =>
              setFilterStatus(filterStatus === status ? null : status)
            }
          >
            <Text
              style={[
                styles.filterBtnText,
                filterStatus === status && styles.filterBtnTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Requests List */}
      <FlatList
        data={paginatedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // Extract date based on request type
          let displayDate = "";
          if (item.type && item.type.includes("إجازة")) {
            // For annual leave: show startDate - endDate
            displayDate =
              item.startDate && item.endDate
                ? `${item.startDate} الى ${item.endDate}`
                : item.startDate || "N/A";
          } else {
            // For استئذان: show the single date
            displayDate = item.date ? item.date.split(" - ")[0] : "N/A";
          }

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedRequest(item)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.cardText}>
                  رقم الطلب الإلكتروني: {toArabicNumbers(item.id.toString())}
                </Text>
                <Text style={styles.cardText}>
                  تاريخ التقديم: {toArabicNumbers(item.createdDate || "N/A")}
                </Text>
                <Text style={styles.cardText}>النوع: {item.type}</Text>
                <Text style={styles.cardText}>
                  التاريخ: {toArabicNumbers(displayDate)}
                </Text>
                {item.notes && (
                  <Text style={styles.cardText}>ملاحظات: {item.notes}</Text>
                )}
                {item.status === "مرفوض" && item.rejectionReason && (
                  <Text style={[styles.cardText, { color: colors.error }]}>
                    سبب الرفض: {item.rejectionReason}
                  </Text>
                )}
                {item.reason &&
                  item.status !== "مرفوض" &&
                  item.type &&
                  item.type.includes("إجازة") && (
                    <Text style={styles.cardText}>السبب: {item.reason}</Text>
                  )}
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontFamily: fonts.semiBold,
                    fontSize: 12,
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 100,
        }}
        scrollEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>لا توجد طلبات</Text>
          </View>
        }
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === 1 && styles.pageButtonDisabled,
            ]}
            onPress={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage === 1 && styles.pageButtonTextDisabled,
              ]}
            >
              ←
            </Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>
            صفحة {toArabicNumbers(currentPage.toString())} من{" "}
            {toArabicNumbers(totalPages.toString())}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPage === totalPages && styles.pageButtonDisabled,
            ]}
            onPress={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.pageButtonText,
                currentPage === totalPages && styles.pageButtonTextDisabled,
              ]}
            >
              →
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
                    {toArabicNumbers(
                      new Date(Number(selectedRequest.id)).toLocaleDateString(
                        "ar-SA",
                      ),
                    )}
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
                      📅{" "}
                      {selectedRequest.date &&
                        toArabicNumbers(selectedRequest.date)}
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

                {selectedRequest.status === "مرفوض" &&
                  selectedRequest.rejectionReason && (
                    <View style={styles.modalRow}>
                      <Text
                        style={[styles.modalLabel, { color: colors.error }]}
                      >
                        سبب الرفض:
                      </Text>
                      <Text
                        style={[styles.modalValue, { color: colors.error }]}
                      >
                        {selectedRequest.rejectionReason}
                      </Text>
                    </View>
                  )}

                {selectedRequest.reason && (
                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>السبب:</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    paddingHorizontal: 20,
    paddingTop: 12,
    color: colors.text.primary,
  },

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
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexWrap: "wrap",
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

  card: {
    backgroundColor: colors.background.card,
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardText: {
    fontFamily: fonts.regular,
    color: colors.text.primary,
    marginTop: 4,
  },
  status: { marginTop: 6, fontFamily: fonts.semiBold },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingBottom: 65,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background.card,
  },
  pageButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pageButtonDisabled: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  pageButtonText: {
    fontFamily: fonts.semiBold,
    color: colors.text.inverse,
    fontSize: 16,
  },
  pageButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  pageText: {
    fontFamily: fonts.medium,
    color: colors.text.primary,
    fontSize: 13,
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
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
});
