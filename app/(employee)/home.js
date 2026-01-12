import React from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';
import { useRequests } from '../../context/RequestsContext';

export default function EmployeeHome() {
  const router = useRouter();
  const { requests } = useRequests();

  // recent requests (latest 3)
  const recent = requests.slice(-3).reverse();

  // Compute remaining minutes for current month (8 hours quota)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const usedThisMonthMinutes = (requests || [])
    .filter(r => r.type === 'استئذان' && r.date)
    .filter(r => {
      // expect date formatted as YYYY-MM-DD
      const parts = (r.date || '').split('-');
      if (parts.length < 3) return false;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === currentYear && m === currentMonth;
    })
    .reduce((s, r) => s + (typeof r.durationMinutes === 'number' ? r.durationMinutes : 0), 0);

  const remainingMonthMinutes = Math.max(0, 8 * 60 - usedThisMonthMinutes);
  const remainingMonthLabel = `${Math.floor(remainingMonthMinutes / 60)} ساعة ${remainingMonthMinutes % 60} دقيقة`;

  const getStatusColor = (status) => {
    if (!status) return colors.warning;
    const s = String(status);
    if (/موافق|مواف/i.test(s) || /approved/i.test(s)) return colors.success;
    if (/رفض|مرفوض|مرفوضة|rejected/i.test(s)) return colors.error;
    return colors.warning; // pending / other
  };

  const QuickAction = ({ emoji, label, onPress, bg }) => (
    <TouchableOpacity
      style={[styles.action, { backgroundColor: bg || colors.primaryLight }]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderRequest = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={styles.requestRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.requestType}>{item.type || 'طلب'}</Text>
          <Text style={styles.requestDate}>{item.date || '—'}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColor }]}> 
          <Text style={[styles.statusText, { color: colors.text.inverse }]}>{item.status || 'قيد المراجعة'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحبا 👋</Text>
            <Text style={styles.name}>الموظف</Text>
          </View>
          <View style={styles.avatar}> 
            <Text style={styles.avatarText}>م</Text>
          </View>
        </View>

        {/* Remaining for current month */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>الرصيد المتبقي لهذا الشهر</Text>
          <Text style={styles.cardValue}>{remainingMonthLabel}</Text>
          <Text style={styles.cardSubtitle}>من أصل 8 ساعات</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <QuickAction
            emoji="📝"
            label="طلب استئذان"
            bg={colors.primary}
            onPress={() => router.push('/(employee)/requests/leave')}
          />

          <QuickAction
            emoji="📋"
            label="طلباتي"
            bg={colors.primary}
            onPress={() => router.push('/(employee)/requests/list')}
          />
        </View>



        {/* Recent Requests */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>أحدث الطلبات</Text>
        </View>

        {recent.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>لا توجد طلبات حتى الآن</Text>
          </View>
        ) : (
          <FlatList
            data={recent}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderRequest}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}

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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 18,
  },
  card: {
    backgroundColor: colors.card,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  action: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
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
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    color: colors.text.tertiary,
  },
  requestRow: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
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
});
