import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LayoutProvider } from "../src/contexts/LayoutContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LayoutProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="cadastro" />
          <Stack.Screen name="esqueceu-senha" />
          <Stack.Screen name="sons" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sobre" />
          <Stack.Screen name="doutor" />
          <Stack.Screen name="paciente" />
          <Stack.Screen name="emergencia" />
          <Stack.Screen name="psicologos" />
          <Stack.Screen name="contatos-emergencia" />
        </Stack>
      </LayoutProvider>
    </GestureHandlerRootView>
  );
}
