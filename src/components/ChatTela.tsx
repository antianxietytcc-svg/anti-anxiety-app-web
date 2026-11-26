/**
 * Componente de chat reutilizado por doutor e paciente.
 * Recebe chatId, emailAtual e nomeAtual e mostra as mensagens em tempo real.
 * Inclui:
 *   - Status online do interlocutor (via coleção presenca/)
 *   - Separadores de data entre dias diferentes
 *   - Suporte a envio de imagens, áudios e vídeos
 */
import { useEffect, useRef, useState } from "react";
import type React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChevronLeft, Send, Image as ImageIcon, Mic } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ImagemInvalida } from "../lib/media";
import { GradientBackground } from "./GradientBackground";
import { COLORS } from "../constants/theme";
import {
  enviarMensagem,
  ouvirMensagens,
  ouvirPresenca,
  type MensagemFirestore,
  type TipoMensagem,
} from "../lib/firestore";

interface Props {
  chatId: string;
  emailAtual: string;
  nomeAtual: string;
  nomeOutro: string;
  uidOutro?: string;
  onVoltar?: () => void;
  headerExtra?: React.ReactNode;
}

// Formata o timestamp para data legível pt-BR
function formatarDataMensagem(timestamp: number): string {
  const d = new Date(timestamp);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function isMesmaData(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export function ChatTela({ chatId, emailAtual, nomeAtual, nomeOutro, uidOutro, onVoltar, headerExtra }: Props) {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<MensagemFirestore[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [online, setOnline] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    const unsub = ouvirMensagens(chatId, setMensagens, () => setErro("Não foi possível carregar as mensagens."));
    return () => unsub();
  }, [chatId]);

  // Ouve status online do interlocutor
  useEffect(() => {
    if (!uidOutro) return;
    const unsub = ouvirPresenca(uidOutro, setOnline);
    return () => unsub();
  }, [uidOutro]);

  useEffect(() => {
    if (mensagens.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [mensagens]);

  async function enviar() {
    const t = texto.trim();
    if (!t || enviando) return;
    setErro("");
    setEnviando(true);
    try {
      await enviarMensagem(chatId, t, emailAtual, nomeAtual, "texto");
      setTexto((atual) => atual.trim() === t ? "" : atual);
    } catch {
      setErro("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarImagem() {
    if (enviando) return;
    setErro("");
    setEnviando(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      const arquivo = result.canceled ? undefined : result.assets[0];
      if (arquivo) {
        await enviarMensagem(chatId, "Imagem", emailAtual, nomeAtual, "imagem", arquivo.uri);
      }
    } catch (erro) {
      setErro(erro instanceof ImagemInvalida ? erro.message : "Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
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
        <Pressable accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={10} onPress={onVoltar ?? (() => router.back())}>
          <ChevronLeft size={26} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, color: COLORS.sky800, fontWeight: "600" }}>
            {nomeOutro}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: uidOutro ? (online ? "#22c55e" : "#94a3b8") : "#94a3b8",
              }}
            />
            <Text style={{ fontSize: 12, color: uidOutro ? (online ? "#22c55e" : COLORS.sky500) : COLORS.sky500 }}>
              {uidOutro ? (online ? "online" : "offline") : "–"}
            </Text>
          </View>
        </View>
        {headerExtra}
      </View>

      {erro ? <Text accessibilityRole="alert" style={{ padding: 12, color: "#b91c1c" }}>{erro}</Text> : null}

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
        renderItem={({ item, index }) => {
          const minha = item.autorEmail === emailAtual;
          // Mostrar separador de data se for primeiro ou dia diferente do anterior
          const mostrarData =
            index === 0 || !isMesmaData(mensagens[index - 1].timestamp, item.timestamp);

          return (
            <View>
              {/* Separador de data */}
              {mostrarData && (
                <View style={{ alignItems: "center", marginVertical: 10 }}>
                  <View
                    style={{
                      backgroundColor: "rgba(186,230,253,0.6)",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: COLORS.sky600 }}>
                      {formatarDataMensagem(item.timestamp)}
                    </Text>
                  </View>
                </View>
              )}

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
                    overflow: "hidden",
                  }}
                >
                  {!minha && (
                    <Text style={{ fontSize: 11, color: COLORS.sky500, marginBottom: 2 }}>
                      {item.autorNome}
                    </Text>
                  )}

                  {/* Conteúdo por tipo */}
                  {item.tipo === "imagem" && item.media_url ? (
                    <Image
                      source={{ uri: item.media_url }}
                      style={{ width: 200, height: 150, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  ) : item.tipo === "video" && item.media_url ? (
                    <Pressable onPress={() => Linking.openURL(item.media_url!).catch(() => setErro("Não foi possível abrir o vídeo."))}>
                        <Text style={{ textDecorationLine: "underline" }}>Abrir vídeo</Text>
                      </Pressable>
                  ) : (
                    <Text style={{ color: minha ? "#fff" : COLORS.sky800, fontSize: 14, lineHeight: 20 }}>
                      {item.texto}
                    </Text>
                  )}
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
            gap: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#bae6fd",
          }}
        >
          {/* Botão enviar imagem */}
          <Pressable
            onPress={enviarImagem}
              disabled={enviando}
              accessibilityLabel="Enviar imagem"
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: COLORS.sky100,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon size={18} color={COLORS.sky600} strokeWidth={1.5} />
          </Pressable>


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
