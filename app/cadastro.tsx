import { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import type { TipoConta } from "../src/types";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Cadastro() {
  const router = useRouter();
  const { cadastrar } = useContext(LayoutContext);

  const [tipoConta, setTipoConta] = useState<TipoConta>("paciente");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [crm, setCrm] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const [modalDemo, setModalDemo] = useState(false);
  const [textoModal, setTextoModal] = useState("");

  const inputStyle = {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "rgba(240,249,255,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.sky800,
    fontSize: 15,
  } as const;

  function validar(): string | null {
    if (!nome.trim()) return "O nome é obrigatório.";
    if (!email.trim()) return "O e-mail é obrigatório.";
    if (!validarEmail(email.trim())) return "Informe um e-mail válido.";
    if (tipoConta === "psicologo" && !crm.trim()) return "O CRM/CFP é obrigatório para psicólogos.";
    if (!senha) return "A senha é obrigatória.";
    if (senha.length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (senha !== confirmar) return "As senhas não coincidem.";
    return null;
  }

  async function handleCadastro() {
    setErro("");
    const errMsg = validar();
    if (errMsg) { setErro(errMsg); return; }
    setCarregando(true);
    const resultado = await cadastrar(
      nome.trim(),
      email.trim().toLowerCase(),
      senha,
      tipoConta,
      { crm: crm.trim(), especialidade: especialidade.trim() }
    );
    setCarregando(false);
    if (resultado.sucesso) {
      setTextoModal(
        `Nome: ${nome.trim()}\nTipo: ${tipoConta === "paciente" ? "Paciente" : "Psicólogo"}\nE-mail: ${email.trim().toLowerCase()}\n\nConta criada com sucesso!`
      );
      setModalDemo(true);
    } else {
      setErro(resultado.erro ?? "Erro ao cadastrar.");
    }
  }

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
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
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <Cloud size={28} color={COLORS.sky400} strokeWidth={1.5} />
                <Heart size={20} color={COLORS.sky300} strokeWidth={1.5} />
              </View>
              <Text style={{ fontSize: 22, color: COLORS.sky700, marginBottom: 2 }}>
                Criar conta
              </Text>
              <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
                Comece sua jornada de bem-estar
              </Text>
            </View>

            {/* Seleção de tipo de conta */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 8 }}>
                Tipo de conta
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  overflow: "hidden",
                }}
              >
                {([
                  { value: "paciente", label: "Paciente" },
                  { value: "psicologo", label: "Psicólogo" },
                ] as { value: TipoConta; label: string }[]).map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => { setTipoConta(opt.value); setErro(""); }}
                    accessibilityRole="button"
                    accessibilityLabel={opt.label}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      alignItems: "center",
                      backgroundColor: tipoConta === opt.value ? COLORS.sky400 : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: tipoConta === opt.value ? "#fff" : COLORS.sky600,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Campos */}
            <View style={{ gap: 12 }}>
              <View>
                <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>Nome completo</Text>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  autoCapitalize="words"
                  placeholder="Seu nome"
                  placeholderTextColor={COLORS.sky300}
                  accessibilityLabel="Nome completo"
                  style={inputStyle}
                />
              </View>

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
                  accessibilityLabel="E-mail"
                  style={inputStyle}
                />
              </View>

              {/* Campos exclusivos para psicólogo */}
              {tipoConta === "psicologo" && (
                <>
                  <View>
                    <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>CRM / CFP *</Text>
                    <TextInput
                      value={crm}
                      onChangeText={setCrm}
                      placeholder="CRM/SP 123456 ou CFP 06/000001"
                      placeholderTextColor={COLORS.sky300}
                      accessibilityLabel="CRM ou CFP"
                      style={inputStyle}
                    />
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>Especialidade</Text>
                    <TextInput
                      value={especialidade}
                      onChangeText={setEspecialidade}
                      placeholder="Ex: Terapia Cognitivo-Comportamental"
                      placeholderTextColor={COLORS.sky300}
                      accessibilityLabel="Especialidade"
                      style={inputStyle}
                    />
                  </View>
                </>
              )}

              <View>
                <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>Senha</Text>
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={COLORS.sky300}
                  accessibilityLabel="Senha"
                  style={inputStyle}
                />
              </View>

              <View>
                <Text style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}>Confirmar senha</Text>
                <TextInput
                  value={confirmar}
                  onChangeText={setConfirmar}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.sky300}
                  accessibilityLabel="Confirmar senha"
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
                onPress={handleCadastro}
                disabled={carregando}
                accessibilityRole="button"
                accessibilityLabel="Criar conta"
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
                  {carregando ? "Criando conta…" : "Criar conta"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => router.back()}
              style={{ marginTop: 16, alignItems: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Já tenho conta — fazer login"
            >
              <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
                Já tem uma conta? Entrar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalMensagem
        exibir={modalDemo}
        titulo="Conta criada!"
        texto={textoModal}
        ocultar={() => {
          setModalDemo(false);
          router.replace("/(tabs)/home");
        }}
      />
    </GradientBackground>
  );
}
