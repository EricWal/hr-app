import { Stack } from "expo-router";
import { RequestsProvider } from "../context/RequestsContext";
import { useFonts } from 'expo-font';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Cairo-Regular': require('../assets/fonts/Cairo-Regular.ttf'),
    'Cairo-Medium': require('../assets/fonts/Cairo-Medium.ttf'),
    'Cairo-Bold': require('../assets/fonts/Cairo-Bold.ttf'),
    'Cairo-SemiBold': require('../assets/fonts/Cairo-SemiBold.ttf'),
  });

  // Prevent rendering until fonts are loaded
  if (!fontsLoaded) return null;

  return (
    <RequestsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RequestsProvider>
  );
}
