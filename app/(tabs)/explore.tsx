/**
 * Rede de Apoio — feed de publicações em tempo real via Firestore.
 * Usa onSnapshot para atualizar o feed automaticamente sem recarregar.
 * Suporte a imagens nas publicações.
 * Psicólogos e pacientes podem publicar.
 */
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MessageCircle, Plus, X, Image as ImageIcon, Star } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { GradientBackground } from "../../src/components/GradientBackground";
import { Avatar } from "../../src/components/Avatar";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import {
  ouvirPosts,
  criarPost,
  ouvirComentariosPost,
  adicionarComentarioPost,
  getPerfil,
  avaliarPsicologo,
  type PostFirestore,
  type ComentarioFirestore,
  type PerfilFirestore,
} from "../../src/lib/firestore";
import { formatarData } from "../../src/services/mockData";

// ---------------------------------------------------------------------------
// Modal Nova Publicação
// ---------------------------------------------------------------------------
interface ModalPublicacaoProps {
  visivel: boolean;
  aoFechar: () => void;
  aoPublicar: (titulo: string, conteudo: string, imagemUri?: string) => void;
}

function ModalNovaPublicacao({ visivel, aoFechar, aoPublicar }: ModalPublicacaoProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [imagemUri, setImagemUri] = useState<string | undefined>();
  const [erro, setErro] = useState("");

  function handlePublicar() {
    if (!titulo.trim()) { setErro("O título é obrigatório."); return; }
    if (titulo.trim().length > 100) { setErro("Título muito longo (máx. 100 caracteres)."); return; }
    if (!conteudo.trim()) { setErro("O conteúdo é obrigatório."); return; }
    if (conteudo.trim().length > 1000) { setErro("Conteúdo muito longo (máx. 1000 caracteres)."); return; }
    aoPublicar(titulo.trim(), conteudo.trim(), imagemUri);
    setTitulo("");
    setConteudo("");
    setImagemUri(undefined);
    setErro("");
  }

  function handleFechar() {
    setTitulo("");
    setConteudo("");
    setImagemUri(undefined);
    setErro("");
    aoFechar();
  }

  async function escolherImagem() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImagemUri(result.assets[0].uri);
    }
  }

  const inputStyle = {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.sky800,
    fontSize: 14,
  } as const;

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={handleFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={handleFechar} />
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            paddingBottom: 40,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Nova publicação</Text>
            <Pressable onPress={handleFechar}><X size={22} color={COLORS.sky500} /></Pressable>
          </View>

          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Título *</Text>
              <TextInput
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Dê um título à sua publicação"
                placeholderTextColor={COLORS.sky300}
                style={inputStyle}
                maxLength={100}
              />
              <Text style={{ fontSize: 11, color: COLORS.sky400, marginTop: 2, textAlign: "right" }}>{titulo.length}/100</Text>
            </View>

            <View>
              <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Conteúdo *</Text>
              <TextInput
                value={conteudo}
                onChangeText={setConteudo}
                placeholder="Compartilhe sua experiência..."
                placeholderTextColor={COLORS.sky300}
                multiline
                numberOfLines={5}
                style={{ ...inputStyle, minHeight: 100, textAlignVertical: "top" }}
                maxLength={1000}
              />
              <Text style={{ fontSize: 11, color: COLORS.sky400, marginTop: 2, textAlign: "right" }}>{conteudo.length}/1000</Text>
            </View>

            {/* Imagem opcional */}
            <Pressable
              onPress={escolherImagem}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#bae6fd",
                borderStyle: "dashed",
                backgroundColor: "#f0f9ff",
              }}
            >
              <ImageIcon size={18} color={COLORS.sky500} strokeWidth={1.5} />
              <Text style={{ fontSize: 13, color: COLORS.sky600 }}>
                {imagemUri ? "Imagem selecionada ✓" : "Adicionar imagem (opcional)"}
              </Text>
            </Pressable>

            {imagemUri && (
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: imagemUri }}
                  style={{ width: "100%", height: 140, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => setImagemUri(undefined)}
                  style={{ position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12, padding: 4 }}
                >
                  <X size={14} color="#fff" />
                </Pressable>
              </View>
            )}

            {erro ? <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{erro}</Text> : null}

            <Pressable
              onPress={handlePublicar}
              style={({ pressed }) => ({
                backgroundColor: pressed ? COLORS.sky600 : COLORS.sky400,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: "center",
              })}
            >
              <Text style={{ color: "#fff", fontSize: 15 }}>Publicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal Comentários (tempo real)
// ---------------------------------------------------------------------------
interface ModalComentariosProps {
  post: PostFirestore | null;
  aoFechar: () => void;
  nomeUsuario: string;
  uidUsuario: string;
}

function ModalComentarios({ post, aoFechar, nomeUsuario, uidUsuario }: ModalComentariosProps) {
  const [comentarios, setComentarios] = useState<ComentarioFirestore[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!post) return;
    const unsub = ouvirComentariosPost(post.id, setComentarios);
    return () => unsub();
  }, [post?.id]);

  useEffect(() => {
    if (comentarios.length > 0) {
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [comentarios]);

  async function enviarComentario() {
    if (!texto.trim() || !post || enviando) return;
    setEnviando(true);
    await adicionarComentarioPost(post.id, texto.trim(), uidUsuario, nomeUsuario);
    setTexto("");
    setEnviando(false);
  }

  if (!post) return null;

  return (
    <Modal visible={!!post} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={aoFechar} />
        <View
          style={{
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
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: "#fff",
              borderBottomWidth: 1,
              borderBottomColor: "#bae6fd",
            }}
          >
            <Text style={{ fontSize: 16, color: COLORS.sky700 }}>
              Comentários ({post.qtd_comentarios})
            </Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>

          {/* Post resumido */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e0f2fe" }}>
            <Text style={{ fontSize: 14, color: COLORS.sky800, marginBottom: 2 }}>{post.titulo}</Text>
            <Text style={{ fontSize: 12, color: COLORS.sky500 }} numberOfLines={2}>{post.conteudo}</Text>
          </View>

          {/* Lista de comentários */}
          <FlatList
            ref={flatRef}
            data={comentarios}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 30 }}>
                <Text style={{ color: COLORS.sky400, fontSize: 14 }}>
                  Nenhum comentário ainda. Seja o primeiro!
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  padding: 14,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                  elevation: 1,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Avatar nome={item.autorNome} size={30} />
                  <Text style={{ fontSize: 13, color: COLORS.sky700 }}>{item.autorNome}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.sky400, marginLeft: "auto" }}>
                    {formatarData(item.data_comentario)}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: COLORS.sky800, lineHeight: 20 }}>{item.conteudo}</Text>
              </View>
            )}
          />

          {/* Input */}
          <View
            style={{
              flexDirection: "row",
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
              placeholder="Escreva um comentário..."
              placeholderTextColor={COLORS.sky300}
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
              }}
            />
            <Pressable
              onPress={enviarComentario}
              disabled={enviando || !texto.trim()}
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
                <Text style={{ color: "#fff", fontSize: 13 }}>→</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal Perfil do Usuário (com avaliação para psicólogos)
// ---------------------------------------------------------------------------
interface ModalPerfilUsuarioProps {
  autorId: string | null;
  aoFechar: () => void;
  uidAtual: string;
  nomeAtual: string;
  tipoConta: string;
}

function ModalPerfilUsuario({ autorId, aoFechar, uidAtual, nomeAtual, tipoConta }: ModalPerfilUsuarioProps) {
  const [perfil, setPerfil] = useState<PerfilFirestore | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

  useEffect(() => {
    if (!autorId) { setPerfil(null); return; }
    setCarregando(true);
    setEstrelas(0);
    setComentarioAvaliacao("");
    setAvaliacaoEnviada(false);
    getPerfil(autorId).then((p) => { setPerfil(p); setCarregando(false); });
  }, [autorId]);

  async function enviarAvaliacao() {
    if (!perfil || estrelas === 0) return;
    setEnviandoAvaliacao(true);
    await avaliarPsicologo(perfil.uid, uidAtual, nomeAtual, estrelas, comentarioAvaliacao);
    setEnviandoAvaliacao(false);
    setAvaliacaoEnviada(true);
  }

  if (!autorId) return null;

  return (
    <Modal visible={!!autorId} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={aoFechar} />
        <View
          style={{
            backgroundColor: "#f0f9ff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: "80%",
            overflow: "hidden",
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#bae6fd" }}>
            <Text style={{ fontSize: 16, color: COLORS.sky700 }}>Perfil do usuário</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>

          {carregando ? (
            <View style={{ padding: 40, alignItems: "center" }}><ActivityIndicator color={COLORS.sky400} /></View>
          ) : !perfil ? (
            <View style={{ padding: 40, alignItems: "center" }}><Text style={{ color: COLORS.sky400 }}>Perfil não encontrado.</Text></View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
              {/* Foto e nome */}
              <View style={{ alignItems: "center", gap: 8 }}>
                {perfil.foto_url && !perfil.ocultar_foto ? (
                  <Image source={{ uri: perfil.foto_url }} style={{ width: 80, height: 80, borderRadius: 40 }} resizeMode="cover" />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.sky300, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 28 }}>{perfil.nome?.[0] ?? "?"}</Text>
                  </View>
                )}
                <Text style={{ fontSize: 18, color: COLORS.sky800 }}>{perfil.ocultar_nome ? "Usuário" : perfil.nome}</Text>
                <View style={{ backgroundColor: perfil.tipo_conta === "psicologo" ? "#e0f2fe" : COLORS.sky100, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 12, color: COLORS.sky600 }}>{perfil.tipo_conta === "psicologo" ? "🩺 Psicólogo(a)" : "👤 Paciente"}</Text>
                </View>
              </View>

              {/* Dados do psicólogo */}
              {perfil.tipo_conta === "psicologo" && (
                <>
                  {perfil.especialidade ? (
                    <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                      <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 2 }}>Especialidade</Text>
                      <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{perfil.especialidade}</Text>
                    </View>
                  ) : null}
                  {perfil.crm ? (
                    <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                      <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 2 }}>CRM/CFP</Text>
                      <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{perfil.crm}</Text>
                    </View>
                  ) : null}
                  {perfil.descricao ? (
                    <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                      <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 2 }}>Sobre</Text>
                      <Text style={{ fontSize: 14, color: COLORS.sky700, lineHeight: 20 }}>{perfil.descricao}</Text>
                    </View>
                  ) : null}
                  <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                    <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 2 }}>Avaliação</Text>
                    <Text style={{ fontSize: 14, color: COLORS.sky800 }}>
                      ⭐ {perfil.media_avaliacao?.toFixed(1) ?? "–"} ({perfil.qtd_avaliacoes ?? 0} avaliações)
                    </Text>
                  </View>

                  {/* Avaliação — apenas para pacientes avaliando psicólogos */}
                  {tipoConta === "paciente" && perfil.uid !== uidAtual && (
                    <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 10 }}>
                      <Text style={{ fontSize: 14, color: COLORS.sky700 }}>
                        {avaliacaoEnviada ? "Avaliação enviada! ✅" : "Avaliar este psicólogo"}
                      </Text>
                      {!avaliacaoEnviada && (
                        <>
                          <View style={{ flexDirection: "row", gap: 6 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Pressable key={n} onPress={() => setEstrelas(n)}>
                                <Star size={28} color="#f59e0b" fill={n <= estrelas ? "#f59e0b" : "transparent"} strokeWidth={1.5} />
                              </Pressable>
                            ))}
                          </View>
                          <TextInput
                            value={comentarioAvaliacao}
                            onChangeText={setComentarioAvaliacao}
                            placeholder="Comentário (opcional)"
                            placeholderTextColor={COLORS.sky300}
                            multiline
                            style={{ borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 14, paddingVertical: 10, color: COLORS.sky800, fontSize: 13, minHeight: 60, textAlignVertical: "top" }}
                          />
                          <Pressable
                            onPress={enviarAvaliacao}
                            disabled={estrelas === 0 || enviandoAvaliacao}
                            style={{ backgroundColor: estrelas > 0 ? COLORS.sky400 : COLORS.sky200, borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
                          >
                            {enviandoAvaliacao ? <ActivityIndicator color="#fff" size="small" /> : (
                              <Text style={{ color: "#fff", fontSize: 14 }}>Enviar avaliação</Text>
                            )}
                          </Pressable>
                        </>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* Contato/email — se não ocultar perfil */}
              {!perfil.ocultar_perfil && perfil.email && (
                <View style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}>
                  <Text style={{ fontSize: 12, color: COLORS.sky500, marginBottom: 2 }}>Contato</Text>
                  <Text style={{ fontSize: 14, color: COLORS.sky600 }}>{perfil.email}</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function RedeApoio() {
  const { usuarioLogado, nomeUsuario } = useContext(LayoutContext);
  const [posts, setPosts] = useState<PostFirestore[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalPub, setModalPub] = useState(false);
  const [postSelecionado, setPostSelecionado] = useState<PostFirestore | null>(null);
  const [autorSelecionadoId, setAutorSelecionadoId] = useState<string | null>(null);

  // Ouvir posts em tempo real
  useEffect(() => {
    const unsub = ouvirPosts((lista) => {
      setPosts(lista);
      setCarregando(false);
    });
    return () => unsub();
  }, []);

  async function handlePublicar(titulo: string, conteudo: string, imagemUri?: string) {
    if (!usuarioLogado) return;
    setModalPub(false);
    await criarPost(
      titulo,
      conteudo,
      usuarioLogado.uid,
      usuarioLogado.nome,
      usuarioLogado.tipo_conta,
      imagemUri
    );
    // O onSnapshot atualiza automaticamente
  }

  function abrirComentarios(post: PostFirestore) {
    setPostSelecionado(post);
  }

  return (
    <GradientBackground>
      {/* Header */}
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
        <View>
          <Text style={{ fontSize: 22, color: COLORS.sky700 }}>Rede de Apoio</Text>
          <Text style={{ fontSize: 12, color: COLORS.sky400 }}>Feed ao vivo 🔴</Text>
        </View>
        <Pressable
          onPress={() => setModalPub(true)}
          style={{
            height: 44,
            width: 44,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 22,
            backgroundColor: COLORS.sky400,
          }}
          accessibilityLabel="Nova publicação"
        >
          <Plus size={24} color="white" strokeWidth={2.5} />
        </Pressable>
      </View>

      {carregando ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.sky400} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <Text style={{ color: COLORS.sky400, fontSize: 15, textAlign: "center", paddingHorizontal: 32 }}>
                Nenhuma publicação ainda.{"\n"}Seja o primeiro a compartilhar!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 20,
                padding: 20,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Autor — clicável para ver perfil */}
              <Pressable
                onPress={() => setAutorSelecionadoId(item.autorId)}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}
              >
                <Avatar nome={item.autorNome} size={38} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ fontSize: 14, color: COLORS.sky800 }}>{item.autorNome}</Text>
                    {item.autorTipo === "psicologo" && (
                      <View style={{ backgroundColor: "#e0f2fe", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 10, color: COLORS.sky600 }}>Psicólogo</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.sky400 }}>{formatarData(item.data_publicacao)}</Text>
                </View>
              </Pressable>

              {/* Conteúdo */}
              <Text style={{ fontSize: 16, color: COLORS.sky800, marginBottom: 6 }}>{item.titulo}</Text>
              <Text style={{ fontSize: 14, color: COLORS.sky700, lineHeight: 21 }}>{item.conteudo}</Text>

              {/* Imagem */}
              {item.imagem_url ? (
                <Image
                  source={{ uri: item.imagem_url }}
                  style={{ width: "100%", height: 180, borderRadius: 12, marginTop: 12 }}
                  resizeMode="cover"
                />
              ) : null}

              {/* Footer com comentários */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e0f2fe" }}>
                <Pressable
                  onPress={() => abrirComentarios(item)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <MessageCircle size={18} color={COLORS.sky500} strokeWidth={1.5} />
                  <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
                    {item.qtd_comentarios} comentário{item.qtd_comentarios !== 1 ? "s" : ""}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Modais */}
      <ModalNovaPublicacao
        visivel={modalPub}
        aoFechar={() => setModalPub(false)}
        aoPublicar={handlePublicar}
      />

      <ModalComentarios
        post={postSelecionado}
        aoFechar={() => setPostSelecionado(null)}
        nomeUsuario={nomeUsuario}
        uidUsuario={usuarioLogado?.uid ?? ""}
      />

      <ModalPerfilUsuario
        autorId={autorSelecionadoId}
        aoFechar={() => setAutorSelecionadoId(null)}
        uidAtual={usuarioLogado?.uid ?? ""}
        nomeAtual={nomeUsuario}
        tipoConta={usuarioLogado?.tipo_conta ?? "paciente"}
      />
    </GradientBackground>
  );
}
