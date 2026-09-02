import { useContext, useEffect, useState } from "react";
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
import { COLORS } from "../src/constants/theme";
import { LayoutContext } from "../src/contexts/LayoutContext";

export default function Login() {
  const router = useRouter();
  const { login, usuarioLogado, estaCarregando } = useContext(LayoutContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  // Se já tiver sessão salva, redireciona direto
  useEffect(() => {
    if (!estaCarregando && usuarioLogado) {
      router.replace("/(tabs)/home");
    }
  }, [estaCarregando, usuarioLogado]);

  async function handleLogin() {
    setErro("");
    const resultado = await login(email, senha);
    if (resultado.sucesso) {
      router.replace("/(tabs)/home");
    } else {
      setErro(resultado.erro ?? "Erro ao entrar.");
    }
  }

  if (estaCarregando) return null;

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
            <Text className="text-sm text-sky-600/70">Respire fundo e relaxe</Text>
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

            {erro ? (
              <Text className="text-center text-sm text-red-500">{erro}</Text>
            ) : null}

            <Pressable
              onPress={handleLogin}
              className="mt-2 rounded-xl bg-sky-400 py-3.5 active:bg-sky-500"
            >
              <Text className="text-center text-base text-white">Entrar</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/cadastro")}
              className="rounded-xl border border-sky-300 py-3.5 active:bg-sky-50"
            >
              <Text className="text-center text-base text-sky-600">Criar conta</Text>
            </Pressable>
          </View>

          <Pressable className="mt-5 items-center">
            <Text className="text-sm text-sky-600">Esqueceu a senha?</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
