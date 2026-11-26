import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LayoutProvider } from "../src/contexts/LayoutContext";
import { Platform, Text, View } from "react-native";
import { firebaseConfigurado } from "../src/lib/firebase";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web" || __DEV__ || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/service-worker.js").catch((erro) => {
      console.warn("Modo offline indisponível:", erro);
    });
  }, []);

  if (!firebaseConfigurado) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 8 }}>
        <Text style={{ fontSize: 22 }}>Configuração do Firebase pendente</Text>
        <Text>Preencha o arquivo .env.local com os dados do projeto e reinicie o Expo.</Text>
      </View>
    );
  }

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
          <Stack.Screen name="emergencia" />
          <Stack.Screen name="psicologos" />
          <Stack.Screen name="contatos-emergencia" />
        </Stack>
      </LayoutProvider>
    </GestureHandlerRootView>
  );
}
