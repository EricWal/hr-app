import { SafeAreaView, View, Text, FlatList, StyleSheet, Platform, StatusBar } from 'react-native';
import { useRequests } from '../../../context/RequestsContext';
import { colors } from '../../../constants/colors';
import { fonts } from '../../../constants/fonts';

export default function MyRequests() {
  const { requests } = useRequests();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>طلباتي</Text>

      <FlatList
        data={requests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>النوع: {item.type}</Text>
            <Text style={styles.cardText}>التاريخ: {item.date}</Text>
            <Text style={[styles.cardText, styles.status]}>الحالة: {item.status}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0 },
  title: { fontFamily: fonts.semiBold, fontSize: 18, paddingHorizontal: 20, paddingTop: 12, color: colors.text.primary },
  card: { backgroundColor: colors.background.card, borderRadius: 10, padding: 12, marginVertical: 6, marginHorizontal: 20 },
  cardText: { fontFamily: fonts.regular, color: colors.text.primary },
  status: { marginTop: 6, fontFamily: fonts.semiBold }
});
