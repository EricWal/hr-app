import { View, Text, FlatList } from 'react-native';
import { useRequests } from '../../../context/RequestsContext';

export default function MyRequests() {
  const { requests } = useRequests();

  return (
    <View style={{ padding: 20 }}>
      <Text>طلباتي</Text>

      <FlatList
        data={requests}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, marginVertical: 5, padding: 10 }}>
            <Text>النوع: {item.type}</Text>
            <Text>التاريخ: {item.date}</Text>
            <Text>الحالة: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}
