/**
 * Tela de Conversas — lista chats existentes e permite iniciar novas conversas.
 * Inclui busca por nome de usuário com autocomplete.
 */
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Plus, Search, X, MessageCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Avatar } from "../../src/components/Avatar";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import {
  listarChatsPaciente,
  buscarUsuariosPorNome,
  garantirChat,
  type ChatFirestore,
  type PerfilFirestore,
} from "../../src/lib/firestore";
import type { TipoConta } from "../../src/types";

// ---------------------------------------------------------------------------
// Modal para adicionar nova conversa
// ---------------------------------------------------------------------------
interface ModalAdicionarProps {
  visivel: boolean;
  aoFechar: () => void;
  uidAtual: string;
  nomeAtual: string;
  emailAtual: string;
}

function ModalAdicionarConversa({ visivel, aoFechar, uidAtual, nomeAtual, emailAtual }: ModalAdicionarProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<{ uid: string; email: string; nome: string; tipo_conta: TipoConta }[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abrindo, setAbrindo] = useState<string | null>(null);

  useEffect(() => {
    if (busca.trim().length < 2) {
      setResultados([]);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscando(true);
      const lista = await buscarUsuariosPorNome(busca.trim());
      // Exclui o próprio usuário
      setResultados(lista.filter((u) => u.uid !== uidAtual));
      setBuscando(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca, uidAtual]);

  async function iniciarConversa(usuario: { uid: string; email: string; nome: string; tipo_conta: TipoConta }) {
    setAbrindo(usuario.uid);
    // Para chat entre paciente e psicólogo: psicólogo é o primeiro parâmetro
    let chatId: string;
    if (usuario.tipo_conta === "psicologo") {
      chatId = await garantirChat(usuario.email, usuario.nome, emailAtual, nomeAtual);
    } else {
      chatId = await garantirChat(emailAtual, nomeAtual, usuario.email, usuario.nome);
    }
    setAbrindo(null);
    aoFechar();
    setBusca("");
    router.push(`/paciente/chat/${chatId}`);
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={aoFechar} />
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 40,
            maxHeight: "75%",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Nova conversa</Text>
            <Pressable onPress={() => { aoFechar(); setBusca(""); }}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>

          {/* Campo de busca */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#f0f9ff",
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#bae6fd",
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 12,
            }}
          >
            <Search size={18} color={COLORS.sky400} strokeWidth={1.5} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome ou e-mail..."
              placeholderTextColor={COLORS.sky300}
              autoFocus
              style={{ flex: 1, color: COLORS.sky800, fontSize: 14 }}
            />
            {buscando && <ActivityIndicator size="small" color={COLORS.sky400} />}
          </View>

          {busca.trim().length < 2 ? (
            <Text style={{ color: COLORS.sky400, fontSize: 13, textAlign: "center", paddingVertical: 20 }}>
              Digite pelo menos 2 caracteres para buscar
            </Text>
          ) : resultados.length === 0 && !buscando ? (
            <Text style={{ color: COLORS.sky400, fontSize: 13, textAlign: "center", paddingVertical: 20 }}>
              Nenhum usuário encontrado
            </Text>
          ) : (
            <FlatList
              data={resultados}
              keyExtractor={(item) => item.uid}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => iniciarConversa(item)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#f1f5f9",
                  }}
                >
                  <Avatar nome={item.nome} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, color: COLORS.sky800 }}>{item.nome}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.sky500 }}>
                      {item.tipo_conta === "psicologo" ? "🩺 Psicólogo" : "👤 Paciente"} · {item.email}
                    </Text>
                  </View>
                  {abrindo === item.uid ? (
                    <ActivityIndicator size="small" color={COLORS.sky400} />
                  ) : (
                    <MessageCircle size={20} color={COLORS.sky400} strokeWidth={1.5} />
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Tela principal de chat
// ---------------------------------------------------------------------------
export default function Chat() {
  const router = useRouter();
  const { usuarioLogado, mensagensEmergencia, nomeUsuario } = useContext(LayoutContext);

  const [chatsFirebase, setChatsFirebase] = useState<ChatFirestore[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAdicionar, setModalAdicionar] = useState(false);

  const carregar = useCallback(async () => {
    if (!usuarioLogado) return;
    setCarregando(true);
    const lista = await listarChatsPaciente(usuarioLogado.email);
    setChatsFirebase(lista);
    setCarregando(false);
  }, [usuarioLogado]);

  useEffect(() => { carregar(); }, [carregar]);

  // Item de emergência (chat local com Dra. Sofia)
  const itemEmergencia =
    mensagensEmergencia.length > 0
      ? {
          id: "emergencia",
          name: "Dra. Sofia",
          role: "(Emergência)",
          lastMessage: mensagensEmergencia[mensagensEmergencia.length - 1].texto,
          time: mensagensEmergencia[mensagensEmergencia.length - 1].hora,
          unread: true,
          chatId: null as string | null,
        }
      : null;

  // Chats reais do Firebase
  const itensFirebase = chatsFirebase.map((c) => ({
    id: c.chatId,
    name: c.psicoNome ?? c.doutorNome ?? "Psicólogo",
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
          onPress={() => setModalAdicionar(true)}
          style={{
            height: 44,
            width: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: COLORS.sky400,
          }}
          accessibilityLabel="Adicionar conversa"
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
                Nenhuma conversa ainda.{"\n"}Toque em + para iniciar uma conversa.
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

      {/* Modal adicionar conversa */}
      {usuarioLogado && (
        <ModalAdicionarConversa
          visivel={modalAdicionar}
          aoFechar={() => setModalAdicionar(false)}
          uidAtual={usuarioLogado.uid}
          nomeAtual={usuarioLogado.nome}
          emailAtual={usuarioLogado.email}
        />
      )}
    </GradientBackground>
  );
}
