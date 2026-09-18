/**
 * Rede de Apoio — comunidade de compartilhamento de experiências.
 * Permite visualizar publicações, comentar e publicar.
 */
import { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { MessageCircle, Plus, Send, X, ChevronLeft } from "lucide-react-native";
import { Avatar } from "../../src/components/Avatar";
import { GradientBackground } from "../../src/components/GradientBackground";
import { ModalMensagem } from "../../src/components/ModalMensagem";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import {
  listarPublicacoes,
  adicionarPublicacao,
  listarComentarios,
  adicionarComentario,
  validarPublicacao,
} from "../../src/services/postsService";
import { formatarData } from "../../src/services/mockData";
import type { Publicacao, Comentario } from "../../src/types";

// ---------------------------------------------------------------------------
// Modal de Nova Publicação
// ---------------------------------------------------------------------------
interface ModalPublicacaoProps {
  visivel: boolean;
  aoFechar: () => void;
  aoPublicar: (titulo: string, conteudo: string) => void;
}

function ModalNovaPublicacao({
  visivel,
  aoFechar,
  aoPublicar,
}: ModalPublicacaoProps) {
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [erro, setErro] = useState("");

  function handlePublicar() {
    const validacao = validarPublicacao(titulo, conteudo);
    if (!validacao.valido) {
      setErro(validacao.erro ?? "Verifique os campos.");
      return;
    }
    aoPublicar(titulo, conteudo);
    setTitulo("");
    setConteudo("");
    setErro("");
  }

  function handleFechar() {
    setTitulo("");
    setConteudo("");
    setErro("");
    aoFechar();
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="slide"
      onRequestClose={handleFechar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#f0f9ff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "85%",
              paddingBottom: 32,
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
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderBottomWidth: 1,
                borderBottomColor: "#bae6fd",
              }}
            >
              <Text style={{ fontSize: 17, color: COLORS.sky700 }}>
                Nova publicação
              </Text>
              <Pressable
                onPress={handleFechar}
                accessibilityLabel="Fechar"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#e0f2fe",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color={COLORS.sky600} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
              <View>
                <Text
                  style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}
                >
                  Título *
                </Text>
                <TextInput
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ex: Minha experiência com a técnica..."
                  placeholderTextColor={COLORS.sky300}
                  maxLength={100}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: COLORS.sky800,
                    fontSize: 14,
                  }}
                  accessibilityLabel="Título da publicação"
                />
                <Text
                  style={{ fontSize: 11, color: COLORS.sky400, marginTop: 4, textAlign: "right" }}
                >
                  {titulo.length}/100
                </Text>
              </View>

              <View>
                <Text
                  style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}
                >
                  Conteúdo *
                </Text>
                <TextInput
                  value={conteudo}
                  onChangeText={setConteudo}
                  placeholder="Compartilhe sua experiência de forma construtiva..."
                  placeholderTextColor={COLORS.sky300}
                  multiline
                  maxLength={1000}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    color: COLORS.sky800,
                    fontSize: 14,
                    minHeight: 120,
                    textAlignVertical: "top",
                  }}
                  accessibilityLabel="Conteúdo da publicação"
                />
                <Text
                  style={{ fontSize: 11, color: COLORS.sky400, marginTop: 4, textAlign: "right" }}
                >
                  {conteudo.length}/1000
                </Text>
              </View>

              {erro ? (
                <Text
                  style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}
                  accessibilityRole="alert"
                >
                  {erro}
                </Text>
              ) : null}

              <Pressable
                onPress={handlePublicar}
                accessibilityRole="button"
                accessibilityLabel="Publicar"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? COLORS.sky600 : COLORS.sky500,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 4,
                })}
              >
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  Publicar
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal de Comentários
// ---------------------------------------------------------------------------
interface ModalComentariosProps {
  publicacao: Publicacao | null;
  aoFechar: () => void;
  nomeUsuario: string;
  idUsuario: string;
}

function ModalComentarios({
  publicacao,
  aoFechar,
  nomeUsuario,
  idUsuario,
}: ModalComentariosProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!publicacao) return;
    setCarregando(true);
    listarComentarios(publicacao.id_publicacao)
      .then(setComentarios)
      .finally(() => setCarregando(false));
  }, [publicacao]);

  async function enviarComentario() {
    if (!texto.trim() || !publicacao) return;
    const novo = await adicionarComentario(
      publicacao.id_publicacao,
      texto,
      idUsuario,
      nomeUsuario
    );
    setComentarios((prev) => [...prev, novo]);
    setTexto("");
  }

  if (!publicacao) return null;

  return (
    <Modal
      visible={!!publicacao}
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: "#f0f9ff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "80%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 14,
                backgroundColor: "#fff",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderBottomWidth: 1,
                borderBottomColor: "#bae6fd",
              }}
            >
              <Text
                style={{ fontSize: 15, color: COLORS.sky700 }}
                numberOfLines={1}
              >
                {publicacao.titulo}
              </Text>
              <Pressable
                onPress={aoFechar}
                accessibilityLabel="Fechar comentários"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "#e0f2fe",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} color={COLORS.sky600} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Lista de comentários */}
            {carregando ? (
              <View
                style={{ padding: 32, alignItems: "center" }}
              >
                <ActivityIndicator color={COLORS.sky400} />
              </View>
            ) : (
              <FlatList
                data={comentarios}
                keyExtractor={(item) => item.id_comentario}
                contentContainerStyle={{ padding: 16, gap: 10 }}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      color: COLORS.sky400,
                      fontSize: 14,
                      paddingVertical: 24,
                    }}
                  >
                    Nenhum comentário ainda. Seja o primeiro!
                  </Text>
                }
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: "rgba(186,230,253,0.5)",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Avatar nome={item.nome_usuario} size={28} />
                      <View>
                        <Text style={{ fontSize: 13, color: COLORS.sky700 }}>
                          {item.nome_usuario}
                        </Text>
                        <Text style={{ fontSize: 11, color: COLORS.sky400 }}>
                          {formatarData(item.data_comentario)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: COLORS.sky800,
                        lineHeight: 20,
                      }}
                    >
                      {item.conteudo}
                    </Text>
                  </View>
                )}
              />
            )}

            {/* Input de comentário */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 10,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: "#fff",
                borderTopWidth: 1,
                borderTopColor: "#bae6fd",
              }}
            >
              <TextInput
                value={texto}
                onChangeText={setTexto}
                placeholder="Escreva um comentário…"
                placeholderTextColor={COLORS.sky300}
                multiline
                accessibilityLabel="Campo de comentário"
                style={{
                  flex: 1,
                  backgroundColor: "#f0f9ff",
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  color: COLORS.sky800,
                  fontSize: 14,
                  maxHeight: 80,
                }}
              />
              <Pressable
                onPress={enviarComentario}
                disabled={!texto.trim()}
                accessibilityLabel="Enviar comentário"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: texto.trim() ? COLORS.sky400 : COLORS.sky200,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Send size={18} color="#fff" strokeWidth={2} />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Tela principal — Rede de Apoio
// ---------------------------------------------------------------------------
export default function RedeApoio() {
  const { nomeUsuario, usuarioLogado } = useContext(LayoutContext);
  const idUsuario = usuarioLogado?.email ?? "anonimo";

  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalPublicacao, setModalPublicacao] = useState(false);
  const [publicacaoSelecionada, setPublicacaoSelecionada] =
    useState<Publicacao | null>(null);

  // Modal de confirmação (requisito acadêmico)
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");

  const carregarPublicacoes = useCallback(async () => {
    setCarregando(true);
    const lista = await listarPublicacoes();
    setPublicacoes(lista);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarPublicacoes();
  }, [carregarPublicacoes]);

  async function handlePublicar(titulo: string, conteudo: string) {
    const nova = await adicionarPublicacao(
      titulo,
      conteudo,
      idUsuario,
      nomeUsuario || "Usuário"
    );
    setPublicacoes((prev) => [nova, ...prev]);
    setModalPublicacao(false);
    // Requisito acadêmico: exibir dados submetidos via ModalMensagem
    setTextoConfirmacao(
      `Título: ${nova.titulo}\n\nConteúdo: ${nova.conteudo.substring(0, 120)}${nova.conteudo.length > 120 ? "…" : ""}`
    );
    setModalConfirmacao(true);
  }

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 14,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>
            Rede de Apoio
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
            Compartilhe e acolha experiências
          </Text>
        </View>
        <Pressable
          onPress={() => setModalPublicacao(true)}
          accessibilityRole="button"
          accessibilityLabel="Nova publicação"
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
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={COLORS.sky400} />
        </View>
      ) : (
        <FlatList
          data={publicacoes}
          keyExtractor={(item) => item.id_publicacao}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, gap: 12 }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
              }}
            >
              <Text
                style={{
                  color: COLORS.sky400,
                  fontSize: 15,
                  textAlign: "center",
                  paddingHorizontal: 32,
                  lineHeight: 22,
                }}
              >
                Não há publicações ainda.{"\n"}Seja o primeiro a compartilhar!
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(186,230,253,0.4)",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {/* Autor e data */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Avatar nome={item.nome_usuario} size={36} />
                <View>
                  <Text style={{ fontSize: 14, color: COLORS.sky800 }}>
                    {item.nome_usuario}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.sky400 }}>
                    {formatarData(item.data_publicacao)}
                  </Text>
                </View>
              </View>

              {/* Título */}
              <Text
                style={{
                  fontSize: 15,
                  color: COLORS.sky800,
                  marginBottom: 6,
                }}
              >
                {item.titulo}
              </Text>

              {/* Conteúdo */}
              <Text
                style={{
                  fontSize: 14,
                  color: COLORS.sky700,
                  lineHeight: 20,
                  marginBottom: 12,
                }}
                numberOfLines={4}
              >
                {item.conteudo}
              </Text>

              {/* Rodapé — comentários */}
              <Pressable
                onPress={() => setPublicacaoSelecionada(item)}
                accessibilityRole="button"
                accessibilityLabel={`Ver comentários de ${item.titulo}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(186,230,253,0.4)",
                }}
              >
                <MessageCircle
                  size={16}
                  color={COLORS.sky500}
                  strokeWidth={1.5}
                />
                <Text style={{ fontSize: 13, color: COLORS.sky500 }}>
                  {item.qtd_comentarios}{" "}
                  {item.qtd_comentarios === 1 ? "comentário" : "comentários"}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}

      {/* Modal nova publicação */}
      <ModalNovaPublicacao
        visivel={modalPublicacao}
        aoFechar={() => setModalPublicacao(false)}
        aoPublicar={handlePublicar}
      />

      {/* Modal comentários */}
      <ModalComentarios
        publicacao={publicacaoSelecionada}
        aoFechar={() => setPublicacaoSelecionada(null)}
        nomeUsuario={nomeUsuario || "Usuário"}
        idUsuario={idUsuario}
      />

      {/* Modal de confirmação de publicação (requisito acadêmico) */}
      <ModalMensagem
        exibir={modalConfirmacao}
        titulo="Publicação enviada!"
        texto={textoConfirmacao}
        ocultar={() => setModalConfirmacao(false)}
      />
    </GradientBackground>
  );
}
