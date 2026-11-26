/**
 * Sala do Psicólogo — interface unificada com abas:
 * Pacientes | Feed | Agendamentos | Notas | Perfil
 */
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Share,
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
  FileText,
  Save,
  Trash2,
} from "lucide-react-native";
import { useFotoEditavel } from "../../src/hooks/useFotoEditavel";
import { Image } from "expo-image";
import { GradientBackground } from "../../src/components/GradientBackground";
import { Avatar } from "../../src/components/Avatar";
import { AcoesPublicacao, DescricaoImagem, FiltrosFeed, ImagemPublicacao } from "../../src/components/AcoesPublicacao";
import { usePreferenciasFeed } from "../../src/hooks/usePreferenciasFeed";
import { useFotosAutores } from "../../src/hooks/useFotosAutores";
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
  contarChatsPsicologo,
  type PostFirestore,
  type AgendamentoFirestore,
  type PerfilFirestore,
} from "../../src/lib/firestore";
import { ImagemInvalida, prepararImagem } from "../../src/lib/media";

import { LayoutContext } from "../../src/contexts/LayoutContext";

type AbaDoutor = "pacientes" | "feed" | "agendamentos" | "notas" | "perfil";

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
  const feed = usePreferenciasFeed(sessao.uid, posts);
  const fotosAutores = useFotosAutores(feed.posts);
  const [carregando, setCarregando] = useState(true);
  const [modalPost, setModalPost] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemUri, setImagemUri] = useState<string | undefined>();
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    const unsub = ouvirPosts((lista) => {
      setPosts(lista);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  async function publicar() {
    if (!titulo.trim() || !conteudo.trim()) return;
    try {
      await criarPost(titulo.trim(), conteudo.trim(), sessao.uid, sessao.nome, "psicologo", imagemUri, descricao);
    } catch (erro) {
      const mensagem = erro instanceof ImagemInvalida ? erro.message : "Não foi possível publicar.";
      if (Platform.OS === "web") window.alert(mensagem);
      else Alert.alert("Erro", mensagem);
      return;
    }
    setModalPost(false);
    setTitulo("");
    setConteudo("");
    setImagemUri(undefined);
    setDescricao("");
  }

  const fotoPost = useFotoEditavel();

  async function escolherImagem() {
    const uri = await fotoPost.escolher();
    if (uri) setImagemUri(uri);
  }

  if (carregando || feed.carregando) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  return (
    <>
      {fotoPost.editor}
      <FlatList
        data={feed.posts}
        extraData={fotosAutores}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ gap: 8 }}>
          <FiltrosFeed feed={feed} />
          <Pressable
            onPress={() => setModalPost(true)}
            style={{ backgroundColor: COLORS.sky400, borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 4 }}
          >
            <Text style={{ color: "#fff", fontSize: 15 }}>+ Nova publicação</Text>
          </Pressable>
          </View>
        }
        ListEmptyComponent={<Text style={{ textAlign: "center", color: COLORS.sky400, paddingTop: 40 }}>{feed.filtro === "recentes" ? "Nenhuma publicação para mostrar." : feed.filtro === "salvos" ? "Nenhuma publicação salva." : "Nenhuma publicação oculta."}</Text>}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Avatar nome={item.autorNome} size={34} fotoUrl={fotosAutores.get(item.autorId)} />
              {item.autorTipo === "psicologo" && (
                <View style={{ backgroundColor: "#e0f2fe", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: COLORS.sky600 }}>Psicólogo</Text>
                </View>
              )}
              <Text style={{ fontSize: 13, color: COLORS.sky700 }}>{item.autorNome}</Text>
            </View>
            <Text style={{ fontSize: 15, color: COLORS.sky800, marginBottom: 4 }}>{item.titulo}</Text>
            <Text style={{ fontSize: 13, color: COLORS.sky600, lineHeight: 20 }}>{item.conteudo}</Text>
            {item.imagem_url ? <ImagemPublicacao uri={item.imagem_url} descricao={item.imagem_descricao} /> : null}
            <AcoesPublicacao post={item} uid={sessao.uid} feed={feed} />
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
              {imagemUri ? <DescricaoImagem valor={descricao} alterar={setDescricao} /> : null}
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

  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [erroAtualizacao, setErroAtualizacao] = useState("");

  useEffect(() => {
    setCarregando(true);
    setErro("");
    if (!sessao.uid) {
      setErro("Entre novamente para carregar sua agenda.");
      setCarregando(false);
      return;
    }
    return ouvirAgendamentosPsicologo(sessao.uid, (ags) => {
      setAgendamentos(ags);
      setCarregando(false);
    }, (falha) => {
      setErro(falha.code === "permission-denied"
        ? "Sua conta não tem permissão para consultar a agenda."
        : "Não foi possível carregar a agenda.");
      setCarregando(false);
    });
  }, [sessao.uid, tentativa]);

  async function atualizar(id: string, status: AgendamentoFirestore["status"]) {
    setAtualizando(id);
    setErroAtualizacao("");
    try {
      await atualizarStatusAgendamento(id, status);
    } catch {
      setErroAtualizacao("Não foi possível alterar o agendamento.");
    } finally {
      setAtualizando(null);
    }
  }

  if (carregando) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  if (erro) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text accessibilityRole="alert">{erro}</Text>
        <Pressable accessibilityRole="button" onPress={() => setTentativa((valor) => valor + 1)}>
          <Text style={{ color: COLORS.sky700 }}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

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
      ListHeaderComponent={erroAtualizacao ? <Text accessibilityRole="alert">{erroAtualizacao}</Text> : null}
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
// Aba Notas — editor de texto rico local com exportação
// ---------------------------------------------------------------------------
interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  negrito: boolean;
  destacado: boolean;
  corDestaque: string;
  criado: number;
  atualizado: number;
}

const CORES_DESTAQUE = ["#fef08a", "#bbf7d0", "#bae6fd", "#fecdd3", "#e9d5ff"];

function AbaNotas({ sessao }: { sessao: { email: string; nome: string; uid: string } }) {
  const KEY_NOTAS = `aa_notas_${sessao.uid}`;
  const [notas, setNotas] = useState<Nota[]>([]);
  const [notaAtual, setNotaAtual] = useState<Nota | null>(null);
  const [editandoTitulo, setEditandoTitulo] = useState(false);

  // Carrega notas do localStorage (armazenamento local da máquina do psicólogo)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_NOTAS);
      if (raw) setNotas(JSON.parse(raw));
    } catch {}
  }, [sessao.uid]);

  function salvarNotas(lista: Nota[]) {
    setNotas(lista);
    try { localStorage.setItem(KEY_NOTAS, JSON.stringify(lista)); } catch {}
  }

  function novaNota() {
    const nova: Nota = {
      id: Date.now().toString(),
      titulo: "Nova nota",
      conteudo: "",
      negrito: false,
      destacado: false,
      corDestaque: "#fef08a",
      criado: Date.now(),
      atualizado: Date.now(),
    };
    const lista = [nova, ...notas];
    salvarNotas(lista);
    setNotaAtual(nova);
  }

  function salvarConteudo(nota: Nota, novoConteudo: string) {
    const atualizada = { ...nota, conteudo: novoConteudo, atualizado: Date.now() };
    setNotaAtual(atualizada);
    const lista = notas.map((n) => (n.id === nota.id ? atualizada : n));
    salvarNotas(lista);
  }

  function salvarTitulo(nota: Nota, novoTitulo: string) {
    const atualizada = { ...nota, titulo: novoTitulo, atualizado: Date.now() };
    setNotaAtual(atualizada);
    const lista = notas.map((n) => (n.id === nota.id ? atualizada : n));
    salvarNotas(lista);
    setEditandoTitulo(false);
  }

  function toggleNegrito(nota: Nota) {
    const atualizada = { ...nota, negrito: !nota.negrito, atualizado: Date.now() };
    setNotaAtual(atualizada);
    const lista = notas.map((n) => (n.id === nota.id ? atualizada : n));
    salvarNotas(lista);
  }

  function toggleDestaque(nota: Nota, cor: string) {
    const jaDestacado = nota.destacado && nota.corDestaque === cor;
    const atualizada = { ...nota, destacado: !jaDestacado, corDestaque: cor, atualizado: Date.now() };
    setNotaAtual(atualizada);
    const lista = notas.map((n) => (n.id === nota.id ? atualizada : n));
    salvarNotas(lista);
  }

  function deletarNota(id: string) {
    const lista = notas.filter((n) => n.id !== id);
    salvarNotas(lista);
    if (notaAtual?.id === id) setNotaAtual(null);
  }

  async function exportarNota(nota: Nota) {
    const texto = `${nota.titulo}\n${"=".repeat(nota.titulo.length)}\n\n${nota.conteudo}\n\n— Exportado por Anti-Anxiety em ${new Date(nota.atualizado).toLocaleDateString("pt-BR")}`;
    try {
      await Share.share({ message: texto, title: nota.titulo });
    } catch {}
  }

  if (notaAtual) {
    return (
      <View style={{ flex: 1, backgroundColor: notaAtual.destacado ? notaAtual.corDestaque : "#fff" }}>
        {/* Header da nota */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.9)", borderBottomWidth: 1, borderBottomColor: "#bae6fd" }}>
          <Pressable onPress={() => setNotaAtual(null)} style={{ padding: 4 }}>
            <X size={20} color={COLORS.sky500} strokeWidth={1.5} />
          </Pressable>
          {editandoTitulo ? (
            <TextInput
              value={notaAtual.titulo}
              onChangeText={(t) => setNotaAtual({ ...notaAtual, titulo: t })}
              onBlur={() => salvarTitulo(notaAtual, notaAtual.titulo)}
              autoFocus
              style={{ flex: 1, fontSize: 16, color: COLORS.sky800, borderBottomWidth: 1, borderBottomColor: "#bae6fd", paddingVertical: 2 }}
            />
          ) : (
            <Pressable onPress={() => setEditandoTitulo(true)} style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, color: COLORS.sky800 }}>{notaAtual.titulo}</Text>
            </Pressable>
          )}
          <Pressable onPress={() => exportarNota(notaAtual)} style={{ padding: 4 }}>
            <Save size={20} color={COLORS.sky500} strokeWidth={1.5} />
          </Pressable>
          <Pressable onPress={() => deletarNota(notaAtual.id)} style={{ padding: 4 }}>
            <Trash2 size={20} color="#ef4444" strokeWidth={1.5} />
          </Pressable>
        </View>

        {/* Barra de formatação */}
        <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#f0f9ff", borderBottomWidth: 1, borderBottomColor: "#e0f2fe" }}>
          <Pressable
            onPress={() => toggleNegrito(notaAtual)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: notaAtual.negrito ? COLORS.sky400 : "#e0f2fe" }}
          >
            <Text style={{ fontWeight: "bold", color: notaAtual.negrito ? "#fff" : COLORS.sky700, fontSize: 13 }}>N</Text>
          </Pressable>
          {CORES_DESTAQUE.map((cor) => (
            <Pressable
              key={cor}
              onPress={() => toggleDestaque(notaAtual, cor)}
              style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: cor, borderWidth: notaAtual.destacado && notaAtual.corDestaque === cor ? 2 : 0, borderColor: COLORS.sky600 }}
            />
          ))}
        </View>

        {/* Área de texto */}
        <TextInput
          value={notaAtual.conteudo}
          onChangeText={(t) => salvarConteudo(notaAtual, t)}
          multiline
          textAlignVertical="top"
          placeholder="Digite aqui suas anotações..."
          placeholderTextColor={COLORS.sky300}
          style={{
            flex: 1,
            padding: 20,
            fontSize: 15,
            color: COLORS.sky800,
            fontWeight: notaAtual.negrito ? "bold" : "normal",
            backgroundColor: notaAtual.destacado ? notaAtual.corDestaque : "transparent",
            lineHeight: 24,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={notas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        ListHeaderComponent={
          <Pressable
            onPress={novaNota}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.sky400, borderRadius: 14, paddingVertical: 13, marginBottom: 4 }}
          >
            <Plus size={18} color="#fff" strokeWidth={2} />
            <Text style={{ color: "#fff", fontSize: 14 }}>Nova nota</Text>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60 }}>
            <FileText size={48} color={COLORS.sky300} strokeWidth={1} />
            <Text style={{ color: COLORS.sky400, marginTop: 16, textAlign: "center", fontSize: 14 }}>
              Nenhuma nota ainda.{"\n"}Toque em "Nova nota" para começar.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setNotaAtual(item)}
            style={{ backgroundColor: item.destacado ? item.corDestaque : "#fff", borderRadius: 14, padding: 16, gap: 6, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 15, color: COLORS.sky800, fontWeight: item.negrito ? "bold" : "normal", flex: 1 }} numberOfLines={1}>{item.titulo}</Text>
              <Pressable onPress={() => deletarNota(item.id)} style={{ padding: 4 }}>
                <Trash2 size={16} color="#ef4444" strokeWidth={1.5} />
              </Pressable>
            </View>
            <Text style={{ fontSize: 13, color: COLORS.sky600, fontWeight: item.negrito ? "bold" : "normal" }} numberOfLines={2}>{item.conteudo || "Nota vazia"}</Text>
            <Text style={{ fontSize: 11, color: COLORS.sky400 }}>{new Date(item.atualizado).toLocaleDateString("pt-BR")}</Text>
          </Pressable>
        )}
      />
    </View>
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
  const [editandoEspecialidade, setEditandoEspecialidade] = useState(false);
  const [novaEspecialidade, setNovaEspecialidade] = useState("");
  const [qtdPacientes, setQtdPacientes] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (sessao.uid) {
      getPerfil(sessao.uid).then((p) => {
        if (p) {
          setPerfil(p);
          setNovoNome(p.nome);
          setNovaDescricao(p.descricao ?? "");
          setNovaEspecialidade(p.especialidade ?? "");
        }
      });
      contarChatsPsicologo(sessao.email).then(setQtdPacientes);
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

  async function salvarEspecialidade() {
    if (!sessao.uid) return;
    setSalvando(true);
    await atualizarPerfil(sessao.uid, { especialidade: novaEspecialidade.trim() });
    setPerfil((prev) => prev ? { ...prev, especialidade: novaEspecialidade.trim() } : prev);
    setEditandoEspecialidade(false);
    setSalvando(false);
  }

  const fotoPerfil = useFotoEditavel();

  async function escolherFoto() {
    const uri = await fotoPerfil.escolher();
    if (uri) {
      setSalvando(true);
      try {
        const url = await prepararImagem(uri);
        await atualizarPerfil(sessao.uid, { foto_url: url });
        setPerfil((prev) => prev ? { ...prev, foto_url: url } : prev);
      } catch (erro) {
        const mensagem = erro instanceof ImagemInvalida ? erro.message : "Não foi possível salvar a foto de perfil.";
        if (Platform.OS === "web") window.alert(mensagem);
        else Alert.alert("Erro", mensagem);
      }
      setSalvando(false);
    }
  }

  if (!perfil) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 80 }}>
      {fotoPerfil.editor}
      {/* Foto */}
      <View style={{ alignItems: "center", gap: 8 }}>
        <Pressable onPress={escolherFoto}>
          {salvando ? (
            <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.sky100, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={COLORS.sky400} />
            </View>
          ) : perfil.foto_url ? (
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
              {salvando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff" }}>OK</Text>}
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
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 4 }}>Especialidade</Text>
          {editandoEspecialidade ? (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput value={novaEspecialidade} onChangeText={setNovaEspecialidade} placeholder="Ex: Psicologia Clínica" placeholderTextColor={COLORS.sky300} style={{ flex: 1, borderRadius: 10, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 12, paddingVertical: 8, color: COLORS.sky800 }} />
              <Pressable onPress={salvarEspecialidade} style={{ backgroundColor: COLORS.sky400, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" }}>
                {salvando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff" }}>OK</Text>}
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditandoEspecialidade(true)}>
              <Text style={{ fontSize: 14, color: perfil.especialidade ? COLORS.sky800 : COLORS.sky300 }}>
                {perfil.especialidade || "Toque para adicionar especialidade..."}
              </Text>
            </Pressable>
          )}
        </View>
        <View>
          <Text style={{ fontSize: 12, color: COLORS.sky500 }}>Pacientes ativos</Text>
          <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{qtdPacientes !== null ? qtdPacientes : "–"}</Text>
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
              {salvando ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: "#fff" }}>Salvar</Text>}
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
  const { usuarioLogado, estaCarregando, logout } = useContext(LayoutContext);
  const sessao = usuarioLogado?.tipo_conta === "psicologo" ? usuarioLogado : null;
  const [aba, setAba] = useState<AbaDoutor>("pacientes");

  useEffect(() => {
    if (!estaCarregando && !sessao) router.replace("/");
  }, [estaCarregando, sessao, router]);

  async function sair() {
    await logout();
    router.replace("/");
  }

  if (!sessao) return null;

  const ABAS: { key: AbaDoutor; label: string; Icon: typeof Users }[] = [
    { key: "pacientes", label: "Pacientes", Icon: Users },
    { key: "feed", label: "Feed", Icon: MessageCircle },
    { key: "agendamentos", label: "Agenda", Icon: CalendarDays },
    { key: "notas", label: "Notas", Icon: FileText },
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

      {/* Conteúdo das abas */}
      <View style={{ flex: 1 }}>
        {aba === "pacientes" && <AbaPacientes sessao={sessao} />}
        {aba === "feed" && <AbaFeed sessao={sessao} />}
        {aba === "agendamentos" && <AbaAgendamentos sessao={sessao} />}
        {aba === "notas" && <AbaNotas sessao={sessao} />}
        {aba === "perfil" && <AbaPerfil sessao={sessao} aoSair={sair} />}
      </View>
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderTopWidth: 1,
          borderTopColor: "#e0f2fe",
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
              borderTopWidth: 2,
              borderTopColor: aba === item.key ? COLORS.sky400 : "transparent",
            }}
          >
            <item.Icon size={20} color={aba === item.key ? COLORS.sky600 : COLORS.sky300} strokeWidth={aba === item.key ? 2 : 1.5} />
            <Text style={{ fontSize: 11, color: aba === item.key ? COLORS.sky600 : COLORS.sky400, marginTop: 2 }}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

    </GradientBackground>
  );
}
