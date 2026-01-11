import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useRequests } from "../../../context/RequestsContext";

export default function LeaveRequest() {
  const router = useRouter();
  const { addRequest } = useRequests();
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [reason, setReason] = useState("");

  const submitRequest = () => {
    const request = {
      id: Date.now(),
      date,
      fromTime,
      toTime,
      reason,
      status: "قيد المراجعة",
    };
    addRequest(request);
    console.log("Leave Request:", request);
    alert("تم إرسال الطلب بنجاح");
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>طلب استئذان</Text>

      <TextInput
        placeholder="التاريخ (2026-01-11)"
        style={styles.input}
        onChangeText={setDate}
      />

      <TextInput
        placeholder="من الساعة"
        style={styles.input}
        onChangeText={setFromTime}
      />

      <TextInput
        placeholder="إلى الساعة"
        style={styles.input}
        onChangeText={setToTime}
      />

      <TextInput
        placeholder="سبب الاستئذان"
        style={styles.input}
        multiline
        onChangeText={setReason}
      />

      <Button title="إرسال الطلب" onPress={submitRequest} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    padding: 10,
  },
});
