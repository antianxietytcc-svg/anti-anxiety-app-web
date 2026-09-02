import { useContext } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import { Avatar } from "../../src/components/Avatar";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";

interface ChatItem {
  id: string;
  name: string;
  role: "Psicólogo" | "Paciente";
  lastMessage: string;
  time: string;
  unread?: boolean;
}

const CHATS_DEMO: ChatItem[] = [
  { id: "1", name: "Dra. Ana Silva", role: "Psicólogo", lastMessage: "Como você está se sentindo hoje?", time: "10:30", unread: true },
  { id: "2", name: "Carlos Mendes", role: "Paciente", lastMessage: "Obrigado pela sessão de ontem!", time: "09:15" },
  { id: "3", name: "Dr. Pedro Costa", role: "Psicólogo", lastMessage: "Vamos remarcar nossa conversa?", time: "Ontem" },
  { id: "4", name: "Marina Santos", role: "Paciente", lastMessage: "Consegui fazer os exercícios!", time: "Ontem", unread: true },
  { id: "5", name: "Dra. Julia Alves", role: "Psicólogo", lastMessage: "Que ótimo progresso!", time: "Ter" },
  { id: "6", name: "Roberto Lima", role: "Paciente", lastMessage: "Preciso conversar sobre algo importante", time: "Seg" },
];

export default function Chat() {
  const { mensagensEmergencia, nomeUsuario } = useContext(LayoutContext);

  // Se houver histórico da sessão de emergência, monta um item no topo
  const itemEmergencia: ChatItem | null =
    mensagensEmergencia.length > 0
      ? {
          id: "emergencia",
          name: "Dra. Sofia",
          role: "Psicólogo",
          lastMessage:
            mensagensEmergencia[mensagensEmergencia.length - 1].autor === "usuario"
              ? mensagensEmergencia[mensagensEmergencia.length - 1].texto
              : `Tudo bem ${nomeUsuario || "você"}? Eu estou aqui, do que você precisa?`,
          time: mensagensEmergencia[mensagensEmergencia.length - 1].hora,
          unread: true,
        }
      : null;

  const chats: ChatItem[] = itemEmergencia
    ? [itemEmergencia, ...CHATS_DEMO]
    : CHATS_DEMO;

  return (
    <GradientBackground>
      <View className="border-b border-sky-200/50 bg-white/80 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl text-sky-700">Conversas</Text>
          <Pressable
            onPress={() => {
              // TODO: abrir mini-tela de adicionar contato/psicólogo
            }}
            className="h-11 w-11 items-center justify-center rounded-full bg-sky-400 active:bg-sky-500"
          >
            <Plus size={24} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {}}
            className="flex-row items-center gap-4 border-b border-sky-200/30 px-6 py-4 active:bg-white/40"
          >
            <Avatar nome={item.name} size={52} />

            <View className="flex-1">
              <View className="mb-1 flex-row items-baseline gap-2">
                <Text className="text-sky-800" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-xs text-sky-500">({item.role})</Text>
              </View>
              <Text
                numberOfLines={1}
                className={item.unread ? "text-sm text-sky-700" : "text-sm text-sky-600/70"}
              >
                {item.lastMessage}
              </Text>
            </View>

            <View className="items-end gap-2">
              <Text className="text-xs text-sky-500">{item.time}</Text>
              {item.unread && (
                <View style={{ backgroundColor: COLORS.sky500 }} className="h-2 w-2 rounded-full" />
              )}
            </View>
          </Pressable>
        )}
      />
    </GradientBackground>
  );
}
