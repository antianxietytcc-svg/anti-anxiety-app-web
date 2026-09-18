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

export function ModalChatEmergencia({ visivel, aoFechar }: Props) {
  const { nomeUsuario, mensagensEmergencia, adicionarMensagemEmergencia } =
    useContext(LayoutContext);

  const [texto, setTexto] = useState("");
  const flatRef = useRef<FlatList>(null);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  // Mensagem automática do terapeuta (apenas quando ainda não há nenhuma)
  const [mensagensLocais, setMensagensLocais] = useState<MensagemEmergencia[]>([]);

  useEffect(() => {
    if (visivel) {
      // Build local list: terapeuta greeting + persisted user messages
      const saudacao: MensagemEmergencia = {
        id: "terapeuta-0",
        texto: `Tudo bem ${nomeUsuario || "você"}? Eu estou aqui, do que você precisa?`,
        autor: "terapeuta",
        hora: horaAgora(),
        timestamp: 0,
      };
      const userMsgs = mensagensEmergencia.filter((m) => m.autor === "usuario");
      setMensagensLocais([saudacao, ...userMsgs]);

      // Enter animation
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
      // Exit animation (instant reset for next open)
      backdropOpacity.setValue(0);
      slideY.setValue(60);
      scaleAnim.setValue(0.92);
    }
  }, [visivel]);

  // Keep local list in sync whenever persisted messages change
  useEffect(() => {
    if (!visivel) return;
    const saudacao: MensagemEmergencia = {
      id: "terapeuta-0",
      texto: `Tudo bem ${nomeUsuario || "você"}? Eu estou aqui, do que você precisa?`,
      autor: "terapeuta",
      hora: horaAgora(),
      timestamp: 0,
    };
    const userMsgs = mensagensEmergencia.filter((m) => m.autor === "usuario");
    setMensagensLocais([saudacao, ...userMsgs]);
  }, [mensagensEmergencia]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (mensagensLocais.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [mensagensLocais]);

  function enviar() {
    const t = texto.trim();
    if (!t) return;
    setTexto("");
    adicionarMensagemEmergencia(t);
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
        {/* Toque no backdrop fecha */}
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
              {/* Avatar terapeuta */}
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
                <Text style={{ color: COLORS.sky500, fontSize: 12 }}>Terapeuta • online</Text>
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
                    backgroundColor:
                      item.autor === "usuario" ? COLORS.sky400 : "#fff",
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

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
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
