import { useContext, useState } from "react";
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

export default function Cadastro() {
  const router = useRouter();
  const { cadastrar } = useContext(LayoutContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro() {
    setErro("");
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    setCarregando(true);
    const resultado = await cadastrar(nome, email, senha);
    setCarregando(false);
    if (resultado.sucesso) {
      router.replace("/(tabs)/home");
    } else {
      setErro(resultado.erro ?? "Erro ao cadastrar.");
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center px-4"
      >
        <View className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/80 p-6 shadow-2xl sm:p-8">
          <View className="mb-6 items-center">
            <View className="mb-3 flex-row items-center justify-center gap-2">
              <Cloud size={28} color={COLORS.sky400} strokeWidth={1.5} />
              <Heart size={20} color={COLORS.sky300} strokeWidth={1.5} />
            </View>
            <Text className="mb-1 text-2xl text-sky-700">Criar conta</Text>
            <Text className="text-sm text-sky-600/70">Comece sua jornada de bem-estar</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="mb-1 text-sm text-sky-700">Nome</Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                className="rounded-xl border border-sky-200 bg-sky-50/50 px-4 py-3 text-sky-800"
                placeholder="Seu nome"
                placeholderTextColor={COLORS.sky300}
              />
            </View>

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
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={COLORS.sky300}
              />
            </View>

            <View>
              <Text className="mb-1 text-sm text-sky-700">Confirmar senha</Text>
              <TextInput
                value={confirmar}
                onChangeText={setConfirmar}
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
              onPress={handleCadastro}
              disabled={carregando}
              className="mt-2 rounded-xl bg-sky-400 py-3.5 active:bg-sky-500"
            >
              <Text className="text-center text-base text-white">
                {carregando ? "Criando conta…" : "Criar conta"}
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.back()} className="mt-5 items-center">
            <Text className="text-sm text-sky-600">Já tem uma conta? Entrar</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
