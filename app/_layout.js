import { Stack } from "expo-router";
import { RequestsProvider } from "../context/RequestsContext";

export default function Layout() {
  return (
    <RequestsProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RequestsProvider>
  );
}
