import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // بيانات وهمية مؤقتًا
    if (email === 'employee@test.com') {
      router.replace('/(employee)/home');
    } else if (email === 'admin@test.com') {
      router.replace('/(admin)/dashboard');
    } else {
      alert('بيانات غير صحيحة');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>

      <TextInput
        placeholder="البريد الإلكتروني"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="كلمة المرور"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      <Button title="دخول" onPress={handleLogin} />
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
    padding: 10
  }
});
