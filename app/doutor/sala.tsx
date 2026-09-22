/**
 * Sala do Psicólogo — interface unificada com abas:
 * Pacientes | Feed | Agendamentos | Perfil
 */
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  LogOut,
  MessageCircle,
  Users,
  CalendarDays,
  User,
  Plus,
  Check,
  X,
  Clock,
  Image as ImageIcon,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { GradientBackground } from "../../src/components/GradientBackground";
import { Avatar } from "../../src/components/Avatar";
import { COLORS } from "../../src/constants/theme";
import {
  garantirChat,
  listarPacientes,
  ouvirPosts,
  criarPost,
  ouvirAgendamentosPsicologo,
  atualizarStatusAgendamento,
  getPerfil,
  atualizarPerfil,
  type PostFirestore,
  type AgendamentoFirestore,
  type PerfilFirestore,
} from "../../src/lib/firestore";

const KEY_DOUTOR_SESSAO = "aa_doutor_sessao";

function lerSessaoDoutor(): { email: string; nome: string; uid: string } | null {
  try {
    const raw = localStorage.getItem(KEY_DOUTOR_SESSAO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

type AbaDoutor = "pacientes" | "feed" | "agendamentos" | "perfil";

const STATUS_CORES: Record<AgendamentoFirestore["status"], string> = {
  pendente: "#f59e0b",
  confirmado: "#22c55e",
  cancelado: "#ef4444",
  concluído: "#94a3b8",
};

// ---------------------------------------------------------------------------
// Aba Pacientes
// ---------------------------------------------------------------------------
function AbaPacientes({ sessao }: { sessao: { email: string; nome: string; uid: string } }) {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<{ uid: string; email: string; nome: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abrindo, setAbrindo] = useState<string | null>(null);

  useEffect(() => {
    listarPacientes().then((lista) => {
      setPacientes(lista);
      setCarregando(false);
    });
  }, []);

  async function abrirChat(paciente: { uid: string; email: string; nome: string }) {
    setAbrindo(paciente.email);
    const chatId = await garantirChat(sessao.email, sessao.nome, paciente.email, paciente.nome);
    setAbrindo(null);
    router.push(`/doutor/chat/${chatId}`);
  }

  if (carregando) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  if (pacientes.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Users size={48} color={COLORS.sky300} strokeWidth={1} />
        <Text style={{ color: COLORS.sky500, marginTop: 16, textAlign: "center", fontSize: 15 }}>
          Nenhum paciente cadastrado ainda.{"\n"}Peça que eles criem uma conta.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={pacientes}
      keyExtractor={(item) => item.email}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => abrirChat(item)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: "rgba(186,230,253,0.3)",
          }}
        >
          <Avatar nome={item.nome} size={50} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: COLORS.sky800 }}>{item.nome}</Text>
            <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{item.email}</Text>
          </View>
          {abrindo === item.email ? (
            <ActivityIndicator size="small" color={COLORS.sky400} />
          ) : (
            <MessageCircle size={22} color={COLORS.sky400} strokeWidth={1.5} />
          )}
        </Pressable>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Aba Feed
// ---------------------------------------------------------------------------
function AbaFeed({ sessao }: { sessao: { email: string; nome: string; uid: string } }) {
  const [posts, setPosts] = useState<PostFirestore[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalPost, setModalPost] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemUri, setImagemUri] = useState<string | undefined>();

  useEffect(() => {
    const unsub = ouvirPosts((lista) => {
      setPosts(lista);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  async function publicar() {
    if (!titulo.trim() || !conteudo.trim()) return;
    await criarPost(titulo.trim(), conteudo.trim(), sessao.uid, sessao.nome, "psicologo", imagemUri);
    setModalPost(false);
    setTitulo("");
    setConteudo("");
    setImagemUri(undefined);
  }

  async function escolherImagem() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!r.canceled) setImagemUri(r.assets[0].uri);
  }

  if (carregando) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  return (
    <>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => setModalPost(true)}
            style={{ backgroundColor: COLORS.sky400, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 4 }}
          >
            <Text style={{ color: "#fff", fontSize: 15 }}>+ Nova publicação</Text>
          </Pressable>
        }
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.sky400, paddingTop: 40 }}>Nenhuma publicação ainda.</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {item.autorTipo === "psicologo" && (
                <View style={{ backgroundColor: "#e0f2fe", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: COLORS.sky600 }}>Psicólogo</Text>
                </View>
              )}
              <Text style={{ fontSize: 13, color: COLORS.sky700 }}>{item.autorNome}</Text>
            </View>
            <Text style={{ fontSize: 15, color: COLORS.sky800, marginBottom: 4 }}>{item.titulo}</Text>
            <Text style={{ fontSize: 13, color: COLORS.sky600, lineHeight: 20 }}>{item.conteudo}</Text>
            {item.imagem_url ? (
              <Image source={{ uri: item.imagem_url }} style={{ width: "100%", height: 160, borderRadius: 10, marginTop: 10 }} contentFit="cover" />
            ) : null}
          </View>
        )}
      />

      {/* Modal nova publicação */}
      <Modal visible={modalPost} transparent animationType="slide" onRequestClose={() => setModalPost(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Nova publicação</Text>
              <Pressable onPress={() => setModalPost(false)}><X size={20} color={COLORS.sky500} /></Pressable>
            </View>
            <View style={{ gap: 12 }}>
              <TextInput value={titulo} onChangeText={setTitulo} placeholder="Título" placeholderTextColor={COLORS.sky300} style={{ borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 14, paddingVertical: 11, color: COLORS.sky800 }} />
              <TextInput value={conteudo} onChangeText={setConteudo} placeholder="Conteúdo..." placeholderTextColor={COLORS.sky300} multiline numberOfLines={4} style={{ borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 14, paddingVertical: 11, color: COLORS.sky800, minHeight: 100, textAlignVertical: "top" }} />
              <Pressable onPress={escolherImagem} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10 }}>
                <ImageIcon size={18} color={COLORS.sky500} strokeWidth={1.5} />
                <Text style={{ fontSize: 13, color: COLORS.sky600 }}>{imagemUri ? "Imagem selecionada ✓" : "Adicionar imagem"}</Text>
              </Pressable>
              <Pressable onPress={publicar} style={{ backgroundColor: COLORS.sky400, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontSize: 15 }}>Publicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Aba Agendamentos
// ---------------------------------------------------------------------------
function AbaAgendamentos({ sessao }: { sessao: { email: string; nome: string; uid: string } }) {
  const [agendamentos, setAgendamentos] = useState<AgendamentoFirestore[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  useEffect(() => {
    if (!sessao.uid) return;
    const unsub = ouvirAgendamentosPsicologo(sessao.uid, (ags) => {
      setAgendamentos(ags);
      setCarregando(false);
    });
    return () => unsub();
  }, [sessao.uid]);

  async function atualizar(id: string, status: AgendamentoFirestore["status"]) {
    setAtualizando(id);
    await atualizarStatusAgendamento(id, status);
    setAtualizando(null);
  }

  if (carregando) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  if (agendamentos.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <CalendarDays size={48} color={COLORS.sky300} strokeWidth={1} />
        <Text style={{ color: COLORS.sky500, marginTop: 16, textAlign: "center", fontSize: 15 }}>
          Nenhum agendamento ainda.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={agendamentos}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 1,
            borderLeftWidth: 4,
            borderLeftColor: STATUS_CORES[item.status],
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <View>
              <Text style={{ fontSize: 15, color: COLORS.sky800 }}>{item.pacienteNome}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                <Clock size={13} color={COLORS.sky500} strokeWidth={1.5} />
                <Text style={{ fontSize: 13, color: COLORS.sky500 }}>{item.data} às {item.horario}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: STATUS_CORES[item.status] + "20", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, color: STATUS_CORES[item.status] }}>{item.status}</Text>
            </View>
          </View>

          {item.status === "pendente" && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Pressable
                onPress={() => atualizar(item.id, "confirmado")}
                disabled={atualizando === item.id}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#dcfce7", borderRadius: 10, paddingVertical: 10 }}
              >
                {atualizando === item.id ? <ActivityIndicator size="small" color="#166534" /> : (
                  <>
                    <Check size={16} color="#166534" strokeWidth={2} />
                    <Text style={{ color: "#166534", fontSize: 13 }}>Confirmar</Text>
                  </>
                )}
              </Pressable>
              <Pressable
                onPress={() => atualizar(item.id, "cancelado")}
                disabled={atualizando === item.id}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#fee2e2", borderRadius: 10, paddingVertical: 10 }}
              >
                <X size={16} color="#991b1b" strokeWidth={2} />
                <Text style={{ color: "#991b1b", fontSize: 13 }}>Recusar</Text>
              </Pressable>
            </View>
          )}

          {item.status === "confirmado" && (
            <Pressable
              onPress={() => atualizar(item.id, "concluído")}
              disabled={atualizando === item.id}
              style={{ marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#e0f2fe", borderRadius: 10, paddingVertical: 10 }}
            >
              <Check size={16} color={COLORS.sky700} strokeWidth={2} />
              <Text style={{ color: COLORS.sky700, fontSize: 13 }}>Marcar como concluída</Text>
            </Pressable>
          )}
        </View>
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Aba Perfil do Psicólogo
// ---------------------------------------------------------------------------
function AbaPerfil({ sessao, aoSair }: { sessao: { email: string; nome: string; uid: string }; aoSair: () => void }) {
  const [perfil, setPerfil] = useState<PerfilFirestore | null>(null);
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [novaDescricao, setNovaDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (sessao.uid) {
      getPerfil(sessao.uid).then((p) => {
        if (p) {
          setPerfil(p);
          setNovoNome(p.nome);
          setNovaDescricao(p.descricao ?? "");
        }
      });
    }
  }, [sessao.uid]);

  async function salvarNome() {
    if (!novoNome.trim() || !sessao.uid) return;
    setSalvando(true);
    await atualizarPerfil(sessao.uid, { nome: novoNome.trim() });
    setPerfil((prev) => prev ? { ...prev, nome: novoNome.trim() } : prev);
    setEditandoNome(false);
    setSalvando(false);
  }

  async function salvarDescricao() {
    if (!sessao.uid) return;
    setSalvando(true);
    await atualizarPerfil(sessao.uid, { descricao: novaDescricao.trim() });
    setPerfil((prev) => prev ? { ...prev, descricao: novaDescricao.trim() } : prev);
    setEditandoDescricao(false);
    setSalvando(false);
  }

  async function escolherFoto() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setSalvando(true);
      await atualizarPerfil(sessao.uid, { foto_url: result.assets[0].uri });
      setPerfil((prev) => prev ? { ...prev, foto_url: result.assets[0].uri } : prev);
      setSalvando(false);
    }
  }

  if (!perfil) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 80 }}>
      {/* Foto */}
      <View style={{ alignItems: "center", gap: 8 }}>
        <Pressable onPress={escolherFoto}>
          {perfil.foto_url ? (
            <Image source={{ uri: perfil.foto_url }} style={{ width: 90, height: 90, borderRadius: 45 }} contentFit="cover" />
          ) : (
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.sky300, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontSize: 30 }}>{perfil.nome[0]}</Text>
            </View>
          )}
        </Pressable>
        <Text style={{ fontSize: 12, color: COLORS.sky500 }}>Toque para trocar foto</Text>
      </View>

      {/* Nome */}
      <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
        <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 4 }}>Nome</Text>
        {editandoNome ? (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput value={novoNome} onChangeText={setNovoNome} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 12, paddingVertical: 8, color: COLORS.sky800 }} />
            <Pressable onPress={salvarNome} style={{ backgroundColor: COLORS.sky400, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" }}>
              <Text style={{ color: "#fff" }}>OK</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditandoNome(true)}>
            <Text style={{ fontSize: 16, color: COLORS.sky800 }}>{perfil.nome}</Text>
          </Pressable>
        )}
      </View>

      {/* Especialidade e CRM */}
      <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 8 }}>
        <View>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>CRM/CFP</Text>
          <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{perfil.crm ?? "–"}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>Especialidade</Text>
          <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{perfil.especialidade ?? "–"}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>Avaliação</Text>
          <Text style={{ fontSize: 14, color: COLORS.sky800 }}>⭐ {perfil.media_avaliacao?.toFixed(1) ?? "–"} ({perfil.qtd_avaliacoes ?? 0} avaliações)</Text>
        </View>
      </View>

      {/* Descrição */}
      <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
        <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 4 }}>Sobre mim</Text>
        {editandoDescricao ? (
          <View style={{ gap: 8 }}>
            <TextInput value={novaDescricao} onChangeText={setNovaDescricao} multiline numberOfLines={3} style={{ borderRadius: 10, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 12, paddingVertical: 8, color: COLORS.sky800, minHeight: 80, textAlignVertical: "top" }} />
            <Pressable onPress={salvarDescricao} style={{ backgroundColor: COLORS.sky400, borderRadius: 10, paddingVertical: 10, alignItems: "center" }}>
              <Text style={{ color: "#fff" }}>Salvar</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditandoDescricao(true)}>
            <Text style={{ fontSize: 14, color: perfil.descricao ? COLORS.sky800 : COLORS.sky300 }}>
              {perfil.descricao || "Adicione uma descrição..."}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Sair */}
      <Pressable onPress={aoSair} style={{ backgroundColor: "#fff", borderRadius: 16, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#fee2e2" }}>
        <Text style={{ color: "#ef4444", fontSize: 15 }}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function DoutorSala() {
  const router = useRouter();
  const sessao = lerSessaoDoutor();
  const [aba, setAba] = useState<AbaDoutor>("pacientes");

  useEffect(() => {
    if (!sessao) {
      router.replace("/doutor");
    }
  }, []);

  function sair() {
    try { localStorage.removeItem(KEY_DOUTOR_SESSAO); } catch {}
    router.replace("/doutor");
  }

  if (!sessao) return null;

  const ABAS: { key: AbaDoutor; label: string; Icon: typeof Users }[] = [
    { key: "pacientes", label: "Pacientes", Icon: Users },
    { key: "feed", label: "Feed", Icon: MessageCircle },
    { key: "agendamentos", label: "Agenda", Icon: CalendarDays },
    { key: "perfil", label: "Perfil", Icon: User },
  ];

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderBottomWidth: 1,
          borderBottomColor: "#bae6fd",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>Área do Psicólogo</Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{sessao.nome}</Text>
        </View>
        <Pressable onPress={sair} accessibilityLabel="Sair">
          <LogOut size={22} color={COLORS.sky500} strokeWidth={1.5} />
        </Pressable>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderBottomWidth: 1,
          borderBottomColor: "#e0f2fe",
        }}
      >
        {ABAS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setAba(item.key)}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: aba === item.key ? COLORS.sky400 : "transparent",
            }}
          >
            <item.Icon size={20} color={aba === item.key ? COLORS.sky600 : COLORS.sky300} strokeWidth={aba === item.key ? 2 : 1.5} />
            <Text style={{ fontSize: 11, color: aba === item.key ? COLORS.sky600 : COLORS.sky400, marginTop: 2 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Conteúdo das abas */}
      <View style={{ flex: 1 }}>
        {aba === "pacientes" && <AbaPacientes sessao={sessao} />}
        {aba === "feed" && <AbaFeed sessao={sessao} />}
        {aba === "agendamentos" && <AbaAgendamentos sessao={sessao} />}
        {aba === "perfil" && <AbaPerfil sessao={sessao} aoSair={sair} />}
      </View>
    </GradientBackground>
  );
}
