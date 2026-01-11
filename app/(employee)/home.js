import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function EmployeeHome() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text>مرحبا 👋 الموظف</Text>

      <Button
        title="طلب استئذان"
        onPress={() => router.push("/(employee)/requests/leave")}
      />

      <Button title="طلب إجازة" onPress={() => alert("قريبًا")} />

      <Button
        title="طلباتي"
        onPress={() => router.push("/(employee)/requests/list")}
      />
    </View>
  );
}
