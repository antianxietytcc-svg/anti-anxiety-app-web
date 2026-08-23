import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Cloud, Heart } from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { ModalMensagem } from "../src/components/ModalMensagem";
import { COLORS } from "../src/constants/theme";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [exibirModal, setExibirModal] = useState(false);

  function handleLogin() {
    // Quando implementar o login real (Firebase Auth), substitua pela validação.
    setExibirModal(true);
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center px-4"
      >
        <View className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-2xl sm:p-8">
          <View className="mb-8 items-center">
            <View className="mb-3 flex-row items-center justify-center gap-2">
              <Cloud size={32} color={COLORS.sky400} strokeWidth={1.5} />
              <Heart size={24} color={COLORS.sky300} strokeWidth={1.5} />
            </View>

            <Text className="mb-2 text-3xl text-sky-700">anti-anxiety</Text>
            <Text className="text-sm text-sky-600/70">
              Respire fundo e relaxe
            </Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-1 text-sm text-sky-700">Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-sky-800"
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.sky300}
              />
            </View>

            <View>
              <Text className="mb-1 text-sm text-sky-700">Senha</Text>
              <TextInput
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-sky-800"
                placeholder="••••••••"
                placeholderTextColor={COLORS.sky300}
              />
            </View>

            <Pressable
              onPress={handleLogin}
              className="mt-2 rounded-xl bg-sky-400 py-3.5 active:bg-sky-500"
            >
              <Text className="text-center text-base text-white">Entrar</Text>
            </Pressable>
          </View>

          <Pressable className="mt-6 items-center">
            <Text className="text-sm text-sky-600">Esqueceu a senha?</Text>
          </Pressable>
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-sky-700/70">Não tem uma conta? </Text>
          <Pressable>
            <Text className="text-sm text-sky-600">Cadastre-se</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ModalMensagem
        exibir={exibirModal}
        titulo="Login"
        texto="Login realizado com sucesso."
        ocultar={() => {
          setExibirModal(false);
          router.replace("/home");
        }}
      />
    </GradientBackground>
  );
}
