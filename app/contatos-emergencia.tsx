/**
 * Gerenciamento de contatos de emergência.
 * O usuário pode adicionar, visualizar, editar e remover contatos.
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
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Phone,
  X,
  Check,
  Edit3,
} from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { ModalMensagem } from "../src/components/ModalMensagem";
import { COLORS } from "../src/constants/theme";
import { LayoutContext } from "../src/contexts/LayoutContext";
import {
  listarContatos,
  adicionarContato,
  atualizarContato,
  removerContato,
  validarContato,
  TIPOS_RELACAO,
} from "../src/services/emergencyContacts";
import type { ContatoEmergencia, TipoRelacao } from "../src/types";

// ---------------------------------------------------------------------------
// Modal de adicionar/editar contato
// ---------------------------------------------------------------------------
interface ModalContatoProps {
  visivel: boolean;
  contatoEditar?: ContatoEmergencia | null;
  aoFechar: () => void;
  aoSalvar: (nome: string, telefone: string, tipo: TipoRelacao) => void;
}

function ModalContato({
  visivel,
  contatoEditar,
  aoFechar,
  aoSalvar,
}: ModalContatoProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoRelacao>("outro");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (contatoEditar) {
      setNome(contatoEditar.nome);
      setTelefone(contatoEditar.telefone);
      setTipoSelecionado(contatoEditar.tipo_relacao);
    } else {
      setNome("");
      setTelefone("");
      setTipoSelecionado("outro");
    }
    setErro("");
  }, [contatoEditar, visivel]);

  function handleSalvar() {
    const validacao = validarContato(nome, telefone);
    if (!validacao.valido) {
      setErro(validacao.erro ?? "Verifique os campos.");
      return;
    }
    aoSalvar(nome.trim(), telefone.trim(), tipoSelecionado);
  }

  return (
    <Modal
      visible={visivel}
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
                {contatoEditar ? "Editar contato" : "Novo contato"}
              </Text>
              <Pressable
                onPress={aoFechar}
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

            <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
              {/* Nome */}
              <View>
                <Text
                  style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}
                >
                  Nome *
                </Text>
                <TextInput
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Nome do contato"
                  placeholderTextColor={COLORS.sky300}
                  autoCapitalize="words"
                  accessibilityLabel="Nome do contato de emergência"
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: COLORS.sky800,
                    fontSize: 15,
                  }}
                />
              </View>

              {/* Telefone */}
              <View>
                <Text
                  style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 6 }}
                >
                  Telefone com DDD *
                </Text>
                <TextInput
                  value={telefone}
                  onChangeText={setTelefone}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor={COLORS.sky300}
                  keyboardType="phone-pad"
                  accessibilityLabel="Telefone do contato de emergência"
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#bae6fd",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    color: COLORS.sky800,
                    fontSize: 15,
                  }}
                />
              </View>

              {/* Tipo de relação */}
              <View>
                <Text
                  style={{ fontSize: 13, color: COLORS.sky700, marginBottom: 8 }}
                >
                  Tipo de relação
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {TIPOS_RELACAO.map((tipo) => (
                    <Pressable
                      key={tipo.value}
                      onPress={() => setTipoSelecionado(tipo.value)}
                      accessibilityRole="button"
                      accessibilityLabel={tipo.label}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor:
                          tipoSelecionado === tipo.value
                            ? COLORS.sky500
                            : "#fff",
                        borderWidth: 1,
                        borderColor:
                          tipoSelecionado === tipo.value
                            ? COLORS.sky500
                            : "#bae6fd",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color:
                            tipoSelecionado === tipo.value
                              ? "#fff"
                              : COLORS.sky600,
                        }}
                      >
                        {tipo.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {erro ? (
                <Text
                  style={{
                    color: "#ef4444",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                  accessibilityRole="alert"
                >
                  {erro}
                </Text>
              ) : null}

              <Pressable
                onPress={handleSalvar}
                accessibilityRole="button"
                accessibilityLabel="Salvar contato"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? COLORS.sky600 : COLORS.sky500,
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 6,
                  marginTop: 4,
                })}
              >
                <Check size={18} color="#fff" strokeWidth={2} />
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  Salvar contato
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
// Tela principal
// ---------------------------------------------------------------------------
export default function ContatosEmergencia() {
  const router = useRouter();
  const { usuarioLogado } = useContext(LayoutContext);
  const idUsuario = usuarioLogado?.email ?? "demo";

  const [contatos, setContatos] = useState<ContatoEmergencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalContato, setModalContato] = useState(false);
  const [contatoEditar, setContatoEditar] = useState<ContatoEmergencia | null>(
    null
  );

  // Modal de confirmação (requisito acadêmico)
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [textoConfirmacao, setTextoConfirmacao] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await listarContatos(idUsuario);
    setContatos(lista);
    setCarregando(false);
  }, [idUsuario]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSalvar(
    nome: string,
    telefone: string,
    tipo: TipoRelacao
  ) {
    if (contatoEditar) {
      await atualizarContato(contatoEditar.id_contato, {
        nome,
        telefone,
        tipo_relacao: tipo,
      });
      setContatos((prev) =>
        prev.map((c) =>
          c.id_contato === contatoEditar.id_contato
            ? { ...c, nome, telefone, tipo_relacao: tipo }
            : c
        )
      );
    } else {
      const novo = await adicionarContato({
        nome,
        telefone,
        tipo_relacao: tipo,
        id_usuario: idUsuario,
      });
      setContatos((prev) => [...prev, novo]);
    }

    setModalContato(false);
    setContatoEditar(null);

    // Exibe confirmação (requisito acadêmico)
    setTextoConfirmacao(
      `Nome: ${nome}\nTelefone: ${telefone}\nRelação: ${tipo}`
    );
    setModalConfirmacao(true);
  }

  async function handleRemover(idContato: string) {
    await removerContato(idContato);
    setContatos((prev) => prev.filter((c) => c.id_contato !== idContato));
  }

  function abrirEditar(contato: ContatoEmergencia) {
    setContatoEditar(contato);
    setModalContato(true);
  }

  function abrirNovo() {
    setContatoEditar(null);
    setModalContato(true);
  }

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
          style={{ marginRight: 12 }}
        >
          <ChevronLeft size={26} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>
            Contatos de Emergência
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
            Pessoas que serão alertadas em caso de crise
          </Text>
        </View>
        <Pressable
          onPress={abrirNovo}
          accessibilityRole="button"
          accessibilityLabel="Adicionar contato"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.sky400,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={22} color="#fff" strokeWidth={2.5} />
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
          data={contatos}
          keyExtractor={(item) => item.id_contato}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
                gap: 16,
              }}
            >
              <Phone size={40} color={COLORS.sky300} strokeWidth={1} />
              <Text
                style={{
                  color: COLORS.sky400,
                  fontSize: 15,
                  textAlign: "center",
                  paddingHorizontal: 32,
                  lineHeight: 22,
                }}
              >
                Nenhum contato cadastrado.{"\n"}Adicione pessoas de confiança
                para a sua rede de apoio.
              </Text>
              <Pressable
                onPress={abrirNovo}
                accessibilityRole="button"
                accessibilityLabel="Adicionar primeiro contato"
                style={{
                  backgroundColor: COLORS.sky500,
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
                <Text style={{ color: "#fff", fontSize: 14 }}>
                  Adicionar contato
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: 14,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(186,230,253,0.4)",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              {/* Ícone de tipo */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.sky100,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Phone size={20} color={COLORS.sky600} strokeWidth={1.5} />
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: COLORS.sky800 }}>
                  {item.nome}
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.sky500, marginTop: 2 }}>
                  {item.telefone}
                </Text>
                <View
                  style={{
                    marginTop: 4,
                    backgroundColor: COLORS.sky100,
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontSize: 11, color: COLORS.sky600 }}>
                    {item.tipo_relacao}
                  </Text>
                </View>
              </View>

              {/* Ações */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => abrirEditar(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${item.nome}`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#e0f2fe",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Edit3 size={16} color={COLORS.sky600} strokeWidth={1.5} />
                </Pressable>
                <Pressable
                  onPress={() => handleRemover(item.id_contato)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${item.nome}`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: "#fee2e2",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={16} color="#ef4444" strokeWidth={1.5} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal adicionar/editar */}
      <ModalContato
        visivel={modalContato}
        contatoEditar={contatoEditar}
        aoFechar={() => {
          setModalContato(false);
          setContatoEditar(null);
        }}
        aoSalvar={handleSalvar}
      />

      {/* Modal de confirmação (requisito acadêmico) */}
      <ModalMensagem
        exibir={modalConfirmacao}
        titulo={contatoEditar ? "Contato atualizado!" : "Contato adicionado!"}
        texto={textoConfirmacao}
        ocultar={() => {
          setModalConfirmacao(false);
          setContatoEditar(null);
        }}
      />
    </GradientBackground>
  );
}
