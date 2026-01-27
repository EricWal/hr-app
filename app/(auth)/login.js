import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {

    // Dummy Login Details
    if (email === 'employee@test.com') {
      router.replace('/(employee)/home');
    } else if (email === 'admin@test.com' && password === '123') {
      router.replace('/(admin)/dashboard');
    } else {
      alert('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* اللوجو / العنوان */}
          <Text style={styles.appTitle}>نظام الحضور</Text>
          <Text style={styles.welcomeText}>مرحباً بعودتك!</Text>

          {/* حقل البريد */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <TextInput
              style={styles.input}
              placeholder="example@company.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* حقل كلمة المرور */}
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>كلمة المرور</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* زر الدخول */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>تسجيل الدخول</Text>
          </TouchableOpacity>

          {/* نسيت كلمة المرور؟ */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>نسيت كلمة المرور؟</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  appTitle: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 48,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.regular,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    fontFamily: fonts.bold,
    color: colors.text.inverse,
    fontSize: 18,
  },
  forgotPassword: {
    marginTop: 24,
    alignSelf: 'center',
  },
  forgotText: {
    fontFamily: fonts.medium,
    color: colors.text.tertiary,
    fontSize: 15,
  },
});