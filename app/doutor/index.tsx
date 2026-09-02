import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Stethoscope } from "lucide-react-native";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { loginDoutor, cadastrarDoutor } from "../../src/lib/firestore";

const KEY_DOUTOR_SESSAO = "aa_doutor_sessao";

function salvarSessaoDoutor(email: string, nome: string) {
  try { localStorage.setItem(KEY_DOUTOR_SESSAO, JSON.stringify({ email, nome })); } catch {}
}

export default function DoutorLogin() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [crm, setCrm] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleLogin() {
    setErro("");
    setCarregando(true);
    const res = await loginDoutor(email, senha);
    setCarregando(false);
    if (res.sucesso && res.doutor) {
      salvarSessaoDoutor(res.doutor.email, res.doutor.nome);
      router.replace("/doutor/sala");
    } else {
      setErro(res.erro ?? "Erro ao entrar.");
    }
  }

  async function handleCadastro() {
    setErro("");
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return; }
    if (senha.length < 6) { setErro("Senha deve ter mínimo 6 caracteres."); return; }
    setCarregando(true);
    const res = await cadastrarDoutor(nome, email, crm, senha);
    setCarregando(false);
    if (res.sucesso) {
      salvarSessaoDoutor(email.trim().toLowerCase(), nome.trim());
      router.replace("/doutor/sala");
    } else {
      setErro(res.erro ?? "Erro ao cadastrar.");
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 24,
            backgroundColor: "rgba(255,255,255,0.85)",
            padding: 28,
            borderWidth: 1,
            borderColor: "#bae6fd",
          }}
        >
          {/* Header */}
          <View style={{ alignItems: "center", marginBottom: 24 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: "#e0f2fe",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Stethoscope size={28} color={COLORS.sky500} strokeWidth={1.5} />
            </View>
            <Text style={{ fontSize: 22, color: COLORS.sky700 }}>
              {modo === "login" ? "Acesso de Doutor" : "Cadastro de Doutor"}
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.sky500, marginTop: 4 }}>
              Portal exclusivo para profissionais de saúde
            </Text>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: "row",
              borderRadius: 12,
              backgroundColor: "#f0f9ff",
              padding: 4,
              marginBottom: 20,
            }}
          >
            {(["login", "cadastro"] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setModo(m); setErro(""); }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: modo === m ? "#fff" : "transparent",
                  alignItems: "center",
                  shadowColor: modo === m ? "#000" : "transparent",
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: modo === m ? 2 : 0,
                }}
              >
                <Text style={{ color: modo === m ? COLORS.sky700 : COLORS.sky400, fontSize: 14 }}>
                  {m === "login" ? "Entrar" : "Cadastrar"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Fields */}
          <View style={{ gap: 14 }}>
            {modo === "cadastro" && (
              <>
                <View>
                  <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 4 }}>Nome completo</Text>
                  <TextInput
                    value={nome}
                    onChangeText={setNome}
                    autoCapitalize="words"
                    placeholder="Dr. João Silva"
                    placeholderTextColor={COLORS.sky300}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#bae6fd",
                      backgroundColor: "#f0f9ff",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: COLORS.sky800,
                      fontSize: 15,
                    }}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 4 }}>CRM</Text>
                  <TextInput
                    value={crm}
                    onChangeText={setCrm}
                    placeholder="CRM/SP 123456"
                    placeholderTextColor={COLORS.sky300}
                    style={{
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#bae6fd",
                      backgroundColor: "#f0f9ff",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      color: COLORS.sky800,
                      fontSize: 15,
                    }}
                  />
                </View>
              </>
            )}

            <View>
              <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 4 }}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="doutor@hospital.com"
                placeholderTextColor={COLORS.sky300}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  backgroundColor: "#f0f9ff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: COLORS.sky800,
                  fontSize: 15,
                }}
              />
            </View>

            <View>
              <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 4 }}>Senha</Text>
              <TextInput
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor={COLORS.sky300}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  backgroundColor: "#f0f9ff",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: COLORS.sky800,
                  fontSize: 15,
                }}
              />
            </View>

            {modo === "cadastro" && (
              <View>
                <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 4 }}>Confirmar senha</Text>
                <TextInput
                  value={confirmar}
                  onChangeText={setConfirmar}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.sky300}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    backgroundColor: "#f0f9ff",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: COLORS.sky800,
                    fontSize: 15,
                  }}
                />
              </View>
            )}

            {erro ? (
              <Text style={{ color: "#ef4444", textAlign: "center", fontSize: 13 }}>{erro}</Text>
            ) : null}

            <Pressable
              onPress={modo === "login" ? handleLogin : handleCadastro}
              disabled={carregando}
              style={{
                backgroundColor: COLORS.sky400,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 4,
              }}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                  {modo === "login" ? "Entrar" : "Criar conta"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
