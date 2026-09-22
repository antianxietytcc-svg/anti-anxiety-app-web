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
import { ModalMensagem } from "../src/components/ModalMensagem";
import { COLORS } from "../src/constants/theme";
import { LayoutContext } from "../src/contexts/LayoutContext";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Login() {
  const router = useRouter();
  const { login, usuarioLogado, estaCarregando } = useContext(LayoutContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [modalDemo, setModalDemo] = useState(false);
  const [textoModal, setTextoModal] = useState("");

  // Se já tiver sessão salva, redireciona direto
  useEffect(() => {
    if (!estaCarregando && usuarioLogado) {
      router.replace("/(tabs)/home");
    }
  }, [estaCarregando, usuarioLogado]);

  async function handleLogin() {
    setErro("");

    if (!email.trim()) { setErro("O e-mail é obrigatório."); return; }
    if (!validarEmail(email.trim())) { setErro("Informe um e-mail válido."); return; }
    if (!senha) { setErro("A senha é obrigatória."); return; }
    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }

    setCarregando(true);
    const resultado = await login(email.trim().toLowerCase(), senha);
    setCarregando(false);

    if (resultado.sucesso) {
      setTextoModal(`E-mail: ${email.trim().toLowerCase()}\nLogin realizado com sucesso.`);
      setModalDemo(true);
    } else {
      setErro(resultado.erro ?? "Erro ao entrar.");
    }
  }

  if (estaCarregando) return null;

  const inputStyle = {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "rgba(240,249,255,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.sky800,
    fontSize: 15,
  } as const;

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: "#bfdbfe",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: 24,
          }}
        >
          {/* Logo */}
          <View style={{ alignItems: "center", marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Cloud size={32} color={COLORS.sky400} strokeWidth={1.5} />
              <Heart size={24} color={COLORS.sky300} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 28, color: COLORS.sky700, marginBottom: 4 }}>
              anti-anxiety
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
              Respire fundo e relaxe
            </Text>
          </View>

          {/* Campos */}
          <View style={{ gap: 14 }}>
            <View>
              <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.sky300}
                accessibilityLabel="Campo de e-mail"
                style={inputStyle}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>Senha</Text>
              <TextInput
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={COLORS.sky300}
                accessibilityLabel="Campo de senha"
                style={inputStyle}
              />
            </View>

            {erro ? (
              <Text
                style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}
                accessibilityRole="alert"
              >
                {erro}
              </Text>
            ) : null}

            <Pressable
              onPress={handleLogin}
              disabled={carregando}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
              style={({ pressed }) => ({
                marginTop: 4,
                borderRadius: 14,
                backgroundColor: pressed ? COLORS.sky600 : COLORS.sky400,
                paddingVertical: 14,
                alignItems: "center",
                opacity: carregando ? 0.7 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 15 }}>
                {carregando ? "Entrando…" : "Entrar"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/cadastro")}
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
              style={({ pressed }) => ({
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.sky300,
                paddingVertical: 14,
                alignItems: "center",
                backgroundColor: pressed ? COLORS.sky50 : "transparent",
              })}
            >
              <Text style={{ color: COLORS.sky600, fontSize: 15 }}>Criar conta</Text>
            </Pressable>
          </View>

          {/* Esqueceu a senha */}
          <Pressable
            onPress={() => router.push("/esqueceu-senha")}
            style={{ marginTop: 16, alignItems: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Esqueceu a senha?"
          >
            <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
              Esqueceu a senha?
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <ModalMensagem
        exibir={modalDemo}
        titulo="Login efetuado!"
        texto={textoModal}
        ocultar={() => {
          setModalDemo(false);
          router.replace("/(tabs)/home");
        }}
      />
    </GradientBackground>
  );
}
