import { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import { listarChatsPaciente, type ChatFirestore } from "../../src/lib/firestore";

export default function Chat() {
  const router = useRouter();
  const { usuarioLogado, mensagensEmergencia, nomeUsuario } = useContext(LayoutContext);

  const [chatsFirebase, setChatsFirebase] = useState<ChatFirestore[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    if (!usuarioLogado) return;
    setCarregando(true);
    const lista = await listarChatsPaciente(usuarioLogado.email);
    setChatsFirebase(lista);
    setCarregando(false);
  }, [usuarioLogado]);

  useEffect(() => { carregar(); }, [carregar]);

  // Item de emergência (chat local)
  const itemEmergencia =
    mensagensEmergencia.length > 0
      ? {
          id: "emergencia",
          name: "Dra. Sofia",
          role: "(Emergência)",
          lastMessage:
            mensagensEmergencia[mensagensEmergencia.length - 1].texto,
          time: mensagensEmergencia[mensagensEmergencia.length - 1].hora,
          unread: true,
          chatId: null as string | null,
        }
      : null;

  // Chats reais do Firebase
  const itensFirebase = chatsFirebase.map((c) => ({
    id: c.chatId,
    name: c.doutorNome,
    role: "(Psicólogo)",
    lastMessage: c.ultimaMensagem ?? "Conversa iniciada",
    time: c.ultimaHora ?? "",
    unread: false,
    chatId: c.chatId,
  }));

  const listaFinal = [
    ...(itemEmergencia ? [itemEmergencia] : []),
    ...itensFirebase,
  ];

  return (
    <GradientBackground>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <Text style={{ fontSize: 22, color: COLORS.sky700 }}>Conversas</Text>
        <Pressable
          onPress={carregar}
          style={{
            height: 44,
            width: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: COLORS.sky400,
          }}
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </Pressable>
      </View>

      {carregando ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.sky400} />
        </View>
      ) : (
        <FlatList
          data={listaFinal}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <Text style={{ color: COLORS.sky400, fontSize: 15, textAlign: "center", paddingHorizontal: 32 }}>
                Nenhuma conversa ainda.{"\n"}Um doutor pode iniciar uma conversa com você.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                if (item.chatId) router.push(`/paciente/chat/${item.chatId}`);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                borderBottomWidth: 1,
                borderBottomColor: "rgba(186,230,253,0.3)",
                paddingHorizontal: 24,
                paddingVertical: 16,
              }}
            >
              <Avatar nome={item.name} size={52} />

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                  <Text style={{ color: COLORS.sky800, fontSize: 15 }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{item.role}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    color: item.unread ? COLORS.sky700 : "rgba(3,105,161,0.6)",
                  }}
                >
                  {item.lastMessage}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end", gap: 6 }}>
                <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{item.time}</Text>
                {item.unread && (
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: COLORS.sky500,
                    }}
                  />
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </GradientBackground>
  );
}
