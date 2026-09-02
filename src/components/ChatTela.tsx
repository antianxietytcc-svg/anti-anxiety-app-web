/**
 * Componente de chat reutilizado por doutor e paciente.
 * Recebe chatId, emailAtual e nomeAtual e mostra as mensagens em tempo real.
 */
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChevronLeft, Send } from "lucide-react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "./GradientBackground";
import { COLORS } from "../constants/theme";
import { enviarMensagem, ouvirMensagens, type MensagemFirestore } from "../lib/firestore";

interface Props {
  chatId: string;
  emailAtual: string;
  nomeAtual: string;
  nomeOutro: string;
  onVoltar?: () => void;
}

export function ChatTela({ chatId, emailAtual, nomeAtual, nomeOutro, onVoltar }: Props) {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<MensagemFirestore[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsub = ouvirMensagens(chatId, setMensagens);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [mensagens]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setTexto("");
    setEnviando(true);
    await enviarMensagem(chatId, t, emailAtual, nomeAtual);
    setEnviando(false);
  }

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "rgba(255,255,255,0.9)",
          borderBottomWidth: 1,
          borderBottomColor: "#bae6fd",
        }}
      >
        <Pressable onPress={onVoltar ?? (() => router.back())}>
          <ChevronLeft size={26} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
        <View>
          <Text style={{ fontSize: 16, color: COLORS.sky800, fontWeight: "600" }}>
            {nomeOutro}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>online</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={mensagens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
            <Text style={{ color: COLORS.sky400, fontSize: 14 }}>
              Nenhuma mensagem ainda. Diga olá!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const minha = item.autorEmail === emailAtual;
          return (
            <View style={{ alignSelf: minha ? "flex-end" : "flex-start", maxWidth: "78%" }}>
              <View
                style={{
                  backgroundColor: minha ? COLORS.sky400 : "#fff",
                  borderRadius: 18,
                  borderBottomRightRadius: minha ? 4 : 18,
                  borderBottomLeftRadius: minha ? 18 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {!minha && (
                  <Text style={{ fontSize: 11, color: COLORS.sky500, marginBottom: 2 }}>
                    {item.autorNome}
                  </Text>
                )}
                <Text style={{ color: minha ? "#fff" : COLORS.sky800, fontSize: 14, lineHeight: 20 }}>
                  {item.texto}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.sky500,
                  marginTop: 3,
                  alignSelf: minha ? "flex-end" : "flex-start",
                  paddingHorizontal: 4,
                }}
              >
                {item.hora}
              </Text>
            </View>
          );
        }}
      />

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
            placeholder="Digite uma mensagem…"
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
            disabled={enviando}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: texto.trim() ? COLORS.sky400 : COLORS.sky200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={18} color="#fff" strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
