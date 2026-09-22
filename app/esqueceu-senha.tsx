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
import { Mail, ArrowLeft } from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { COLORS } from "../src/constants/theme";
import { enviarRedefinicaoSenha } from "../src/lib/firestore";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function EsqueceuSenha() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleEnviar() {
    setErro("");
    if (!email.trim()) { setErro("O e-mail é obrigatório."); return; }
    if (!validarEmail(email.trim())) { setErro("Informe um e-mail válido."); return; }

    setCarregando(true);
    const res = await enviarRedefinicaoSenha(email.trim().toLowerCase());
    setCarregando(false);

    if (res.sucesso) {
      setSucesso(true);
    } else {
      setErro(res.erro ?? "Erro ao enviar e-mail.");
    }
  }

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
            padding: 28,
          }}
        >
          {/* Ícone */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: COLORS.sky100,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Mail size={30} color={COLORS.sky500} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 22, color: COLORS.sky700, marginBottom: 6 }}>
              Recuperar senha
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.sky500, textAlign: "center", lineHeight: 20 }}>
              Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
            </Text>
          </View>

          {sucesso ? (
            <View
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: "#bbf7d0",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: "#166534", fontSize: 14, textAlign: "center", lineHeight: 20 }}>
                ✅ E-mail enviado com sucesso!{"\n"}Verifique sua caixa de entrada (e spam) para o link de redefinição.
              </Text>
            </View>
          ) : (
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
                  accessibilityLabel="E-mail cadastrado"
                  style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    backgroundColor: "rgba(240,249,255,0.5)",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    color: COLORS.sky800,
                    fontSize: 15,
                  }}
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
                onPress={handleEnviar}
                disabled={carregando}
                accessibilityRole="button"
                accessibilityLabel="Enviar link de recuperação"
                style={({ pressed }) => ({
                  borderRadius: 14,
                  backgroundColor: pressed ? COLORS.sky600 : COLORS.sky400,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: carregando ? 0.7 : 1,
                })}
              >
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  {carregando ? "Enviando…" : "Enviar link"}
                </Text>
              </Pressable>
            </View>
          )}

          {/* Voltar */}
          <Pressable
            onPress={() => router.back()}
            style={{ marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Voltar ao login"
          >
            <ArrowLeft size={16} color={COLORS.sky500} strokeWidth={1.5} />
            <Text style={{ fontSize: 13, color: COLORS.sky500 }}>Voltar ao login</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
