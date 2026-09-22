import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { X, Send } from "lucide-react-native";
import { LayoutContext, type MensagemEmergencia } from "../contexts/LayoutContext";
import { COLORS } from "../constants/theme";

interface Props {
  visivel: boolean;
  aoFechar: () => void;
}

const NOME_TERAPEUTA = "Dra. Sofia";

function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Respostas automáticas da Dra. Sofia (bot simples de suporte)
// ---------------------------------------------------------------------------
const RESPOSTAS_BOT: { palavras: string[]; resposta: string }[] = [
  {
    palavras: ["ansiedade", "ansioso", "ansiosa", "crise", "pânico", "panic", "ataque"],
    resposta: "Entendo, isso pode ser muito assustador. Vamos respirar juntos? Inspire profundamente por 4 segundos, segure por 4, e expire por 4. Tente algumas vezes. Eu estou aqui com você. 💙",
  },
  {
    palavras: ["triste", "tristeza", "choro", "chorando", "mal", "péssimo", "péssima"],
    resposta: "Sinto muito que esteja se sentindo assim. É completamente válido sentir essas emoções. Você não está sozinho(a). Quer me contar um pouco mais sobre o que está acontecendo?",
  },
  {
    palavras: ["sozinho", "sozinha", "abandonado", "abandonada", "ninguém", "isolado"],
    resposta: "Você não está sozinho(a). Estou aqui, e há psicólogos disponíveis para te apoiar. Gostaria que eu te conectasse com um profissional agora disponível?",
  },
  {
    palavras: ["psicologo", "psicólogo", "ajuda", "profissional", "terapeuta", "sessão", "sessao"],
    resposta: "Posso te ajudar a encontrar um psicólogo disponível. Acesse a aba 'Psicólogos' no menu principal para ver os profissionais e agendar uma consulta. Deseja que eu te direcione?",
  },
  {
    palavras: ["suicidio", "suicídio", "morrer", "morte", "matar", "matar-me", "acabar"],
    resposta: "Estou aqui e me importo com você. Em caso de emergência, ligue imediatamente para o CVV: 188 (24h) ou acesse cvv.org.br. Você é importante. Por favor, procure ajuda agora. 💙",
  },
  {
    palavras: ["obrigado", "obrigada", "valeu", "thanks", "grato", "grata"],
    resposta: "Fico feliz em poder estar aqui para você! Se precisar de mais apoio, não hesite. Cuide-se! 💙",
  },
  {
    palavras: ["tudo bem", "bem", "melhor", "ok", "certo", "tranquilo"],
    resposta: "Que bom ouvir isso! Continue se cuidando. Lembre-se que você pode contar com a nossa rede de apoio sempre que precisar. 😊",
  },
];

function gerarRespostaSofia(mensagemUsuario: string): string | null {
  const msg = mensagemUsuario.toLowerCase();
  for (const item of RESPOSTAS_BOT) {
    if (item.palavras.some((p) => msg.includes(p))) {
      return item.resposta;
    }
  }
  // Resposta padrão se não há match
  return "Estou te ouvindo. Pode falar mais sobre o que está sentindo? Estou aqui para apoiar você. Se precisar de ajuda profissional imediata, acesse a aba de Psicólogos. 💙";
}

export function ModalChatEmergencia({ visivel, aoFechar }: Props) {
  const { nomeUsuario, mensagensEmergencia, adicionarMensagemEmergencia } =
    useContext(LayoutContext);

  const [texto, setTexto] = useState("");
  const flatRef = useRef<FlatList>(null);
  const [respondendoBot, setRespondendoBot] = useState(false);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const [mensagensLocais, setMensagensLocais] = useState<MensagemEmergencia[]>([]);

  useEffect(() => {
    if (visivel) {
      const saudacao: MensagemEmergencia = {
        id: "terapeuta-0",
        texto: `Olá, ${nomeUsuario || "você"}! 💙 Eu sou a Sofia, sua assistente de apoio emocional. Como você está se sentindo agora?`,
        autor: "terapeuta",
        hora: horaAgora(),
        timestamp: 0,
      };
      const userMsgs = mensagensEmergencia.filter((m) => m.autor === "usuario");
      setMensagensLocais([saudacao, ...userMsgs]);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      backdropOpacity.setValue(0);
      slideY.setValue(60);
      scaleAnim.setValue(0.92);
    }
  }, [visivel]);

  useEffect(() => {
    if (!visivel) return;
    const saudacao: MensagemEmergencia = {
      id: "terapeuta-0",
      texto: `Olá, ${nomeUsuario || "você"}! 💙 Eu sou a Sofia, sua assistente de apoio emocional. Como você está se sentindo agora?`,
      autor: "terapeuta",
      hora: horaAgora(),
      timestamp: 0,
    };
    const userMsgs = mensagensEmergencia.filter((m) => m.autor === "usuario");
    setMensagensLocais([saudacao, ...userMsgs]);
  }, [mensagensEmergencia]);

  useEffect(() => {
    if (mensagensLocais.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [mensagensLocais]);

  async function enviar() {
    const t = texto.trim();
    if (!t || respondendoBot) return;
    setTexto("");

    // Salva mensagem do usuário
    await adicionarMensagemEmergencia(t);

    // Gera resposta automática da Sofia com delay realista
    setRespondendoBot(true);
    const respostaSofia = gerarRespostaSofia(t);
    setTimeout(async () => {
      // Adiciona a mensagem da Sofia como "terapeuta" (localmente para o bot)
      const msgBot: MensagemEmergencia = {
        id: `sofia-${Date.now()}`,
        texto: respostaSofia ?? "Estou aqui para você. 💙",
        autor: "terapeuta",
        hora: horaAgora(),
        timestamp: Date.now(),
      };
      setMensagensLocais((prev) => [...prev, msgBot]);
      setRespondendoBot(false);
    }, 1200);
  }

  if (!visivel) return null;

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="none"
      onRequestClose={aoFechar}
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "flex-end",
          opacity: backdropOpacity,
        }}
      >
        <Pressable
          style={{ position: "absolute", inset: 0 } as any}
          onPress={aoFechar}
        />

        <Animated.View
          style={{
            transform: [{ translateY: slideY }, { scale: scaleAnim }],
            backgroundColor: "#f0f9ff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "85%",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#bae6fd",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.sky300,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>DS</Text>
              </View>
              <View>
                <Text style={{ color: COLORS.sky800, fontSize: 15, fontWeight: "600" }}>
                  {NOME_TERAPEUTA}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#22c55e" }} />
                  <Text style={{ color: "#22c55e", fontSize: 12 }}>Assistente de apoio • online</Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={aoFechar}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "#e0f2fe",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={COLORS.sky600} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Aviso */}
          <View style={{ backgroundColor: "#fffbeb", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#fde68a" }}>
            <Text style={{ fontSize: 11, color: "#92400e", textAlign: "center" }}>
              🤖 Este é um assistente automatizado. Para suporte profissional, acesse a aba Psicólogos.
            </Text>
          </View>

          {/* Messages */}
          <FlatList
            ref={flatRef}
            data={mensagensLocais}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            renderItem={({ item }) => (
              <View
                style={{
                  alignSelf: item.autor === "usuario" ? "flex-end" : "flex-start",
                  maxWidth: "78%",
                }}
              >
                <View
                  style={{
                    backgroundColor: item.autor === "usuario" ? COLORS.sky400 : "#fff",
                    borderRadius: 18,
                    borderBottomRightRadius: item.autor === "usuario" ? 4 : 18,
                    borderBottomLeftRadius: item.autor === "terapeuta" ? 4 : 18,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: item.autor === "usuario" ? "#fff" : COLORS.sky800,
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {item.texto}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.sky500,
                    marginTop: 3,
                    alignSelf: item.autor === "usuario" ? "flex-end" : "flex-start",
                    paddingHorizontal: 4,
                  }}
                >
                  {item.hora}
                </Text>
              </View>
            )}
          />

          {/* Indicador "Sofia está digitando..." */}
          {respondendoBot && (
            <View style={{ paddingHorizontal: 20, paddingBottom: 4 }}>
              <Text style={{ fontSize: 12, color: COLORS.sky500, fontStyle: "italic" }}>
                Sofia está digitando...
              </Text>
            </View>
          )}

          {/* Input */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 10,
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#bae6fd",
              }}
            >
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Como você está se sentindo?"
                placeholderTextColor={COLORS.sky300}
                multiline
                style={{
                  flex: 1,
                  backgroundColor: "#f0f9ff",
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  color: COLORS.sky800,
                  fontSize: 14,
                  maxHeight: 100,
                }}
              />
              <Pressable
                onPress={enviar}
                disabled={respondendoBot}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: texto.trim() ? COLORS.sky400 : COLORS.sky200,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={18} color="#fff" strokeWidth={2} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
