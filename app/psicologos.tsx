/**
 * Tela de Psicólogos — lista de profissionais do Firebase + mock.
 * Inclui sistema de avaliação com estrelas (1-5) e busca por nome.
 *
 * AVISO: Os profissionais mock são fictícios e apenas para demonstração.
 */
import { useContext, useEffect, useState } from "react";
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
import { ChevronLeft, Star, Calendar, X, CheckCircle, Search } from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { Avatar } from "../src/components/Avatar";
import { COLORS } from "../src/constants/theme";
import { PSICOLOGOS_MOCK, HORARIOS_DISPONIVEIS } from "../src/services/mockData";
import { LayoutContext } from "../src/contexts/LayoutContext";
import {
  listarPsicologos,
  avaliarPsicologo,
  criarAgendamento,
  type PerfilFirestore,
} from "../src/lib/firestore";
import type { Psicologo } from "../src/types";

// Tipo unificado para exibição
interface PsicologoDisplay {
  id: string;
  nome: string;
  crm: string;
  especialidade: string;
  descricao: string;
  disponivel: boolean;
  media_avaliacao: number;
  qtd_avaliacoes: number;
  uid?: string;
  email?: string;
}

// ---------------------------------------------------------------------------
// Componente de estrelas
// ---------------------------------------------------------------------------
function Estrelas({
  valor,
  aoSelecionar,
  tamanho = 22,
  editavel = false,
}: {
  valor: number;
  aoSelecionar?: (n: number) => void;
  tamanho?: number;
  editavel?: boolean;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => editavel && aoSelecionar?.(n)}
          disabled={!editavel}
        >
          <Star
            size={tamanho}
            color={n <= valor ? "#f59e0b" : "#e2e8f0"}
            fill={n <= valor ? "#f59e0b" : "none"}
            strokeWidth={1.5}
          />
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Modal de Avaliação
// ---------------------------------------------------------------------------
interface ModalAvaliacaoProps {
  psicologo: PsicologoDisplay;
  aoFechar: () => void;
  uidPaciente: string;
  nomePaciente: string;
}

function ModalAvaliacao({ psicologo, aoFechar, uidPaciente, nomePaciente }: ModalAvaliacaoProps) {
  const [estrelas, setEstrelas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function enviar() {
    if (estrelas === 0) { setErro("Selecione pelo menos 1 estrela."); return; }
    if (!psicologo.uid) { setErro("Este psicólogo não pode ser avaliado ainda."); return; }
    setEnviando(true);
    const res = await avaliarPsicologo(psicologo.uid, uidPaciente, nomePaciente, estrelas, comentario);
    setEnviando(false);
    if (res.sucesso) {
      setSucesso(true);
      setTimeout(() => { setSucesso(false); aoFechar(); }, 1500);
    } else {
      setErro(res.erro ?? "Erro ao enviar avaliação.");
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{ width: "100%", maxWidth: 400, backgroundColor: "#fff", borderRadius: 20, padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Avaliar {psicologo.nome}</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>

          {sucesso ? (
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <CheckCircle size={48} color="#22c55e" strokeWidth={1.5} />
              <Text style={{ fontSize: 16, color: COLORS.sky700, marginTop: 12 }}>Avaliação enviada!</Text>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <Text style={{ fontSize: 13, color: COLORS.sky600, textAlign: "center" }}>
                Como foi sua experiência?
              </Text>
              <View style={{ alignItems: "center" }}>
                <Estrelas valor={estrelas} aoSelecionar={setEstrelas} editavel tamanho={36} />
              </View>
              <TextInput
                value={comentario}
                onChangeText={setComentario}
                placeholder="Deixe um comentário (opcional)..."
                placeholderTextColor={COLORS.sky300}
                multiline
                numberOfLines={3}
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#bae6fd",
                  backgroundColor: "#f0f9ff",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: COLORS.sky800,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: "top",
                }}
              />
              {erro ? <Text style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>{erro}</Text> : null}
              <Pressable
                onPress={enviar}
                disabled={enviando}
                style={{ backgroundColor: COLORS.sky400, borderRadius: 12, paddingVertical: 13, alignItems: "center", opacity: enviando ? 0.7 : 1 }}
              >
                {enviando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15 }}>Enviar avaliação</Text>}
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Card de psicólogo
// ---------------------------------------------------------------------------
interface CardPsicologoProps {
  psicologo: PsicologoDisplay;
  onAgendar: (p: PsicologoDisplay) => void;
  onAvaliar: (p: PsicologoDisplay) => void;
}

function CardPsicologo({ psicologo, onAgendar, onAvaliar }: CardPsicologoProps) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.85)",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(186,230,253,0.4)",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <Avatar nome={psicologo.nome} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: COLORS.sky800 }}>{psicologo.nome}</Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>{psicologo.crm}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: psicologo.disponivel ? "#22c55e" : "#94a3b8" }} />
            <Text style={{ fontSize: 12, color: psicologo.disponivel ? "#16a34a" : "#64748b" }}>
              {psicologo.disponivel ? "Disponível" : "Indisponível"}
            </Text>
          </View>
        </View>
      </View>

      {/* Especialidade */}
      <View style={{ backgroundColor: COLORS.sky100, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: COLORS.sky600 }}>{psicologo.especialidade || "Psicólogo Clínico"}</Text>
      </View>

      {/* Avaliação */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Estrelas valor={Math.round(psicologo.media_avaliacao)} tamanho={16} />
        <Text style={{ fontSize: 12, color: COLORS.sky500 }}>
          {psicologo.media_avaliacao > 0
            ? `${psicologo.media_avaliacao.toFixed(1)} (${psicologo.qtd_avaliacoes} avaliações)`
            : "Sem avaliações ainda"}
        </Text>
      </View>

      {/* Descrição */}
      <Text style={{ fontSize: 13, color: COLORS.sky700, lineHeight: 19, marginBottom: 12 }}>
        {psicologo.descricao}
      </Text>

      {/* Botões */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={() => onAgendar(psicologo)}
          disabled={!psicologo.disponivel}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: psicologo.disponivel ? (pressed ? COLORS.sky600 : COLORS.sky500) : COLORS.sky200,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
          })}
        >
          <Calendar size={16} color={psicologo.disponivel ? "#fff" : COLORS.sky400} strokeWidth={1.5} />
          <Text style={{ color: psicologo.disponivel ? "#fff" : COLORS.sky400, fontSize: 13 }}>
            {psicologo.disponivel ? "Agendar" : "Indisponível"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onAvaliar(psicologo)}
          style={({ pressed }) => ({
            paddingVertical: 12,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#bae6fd",
            backgroundColor: pressed ? COLORS.sky50 : "transparent",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Star size={18} color="#f59e0b" fill="#f59e0b" strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Modal de Agendamento
// ---------------------------------------------------------------------------
interface ModalAgendamentoProps {
  psicologo: PsicologoDisplay;
  aoFechar: () => void;
  uidPaciente: string;
  nomePaciente: string;
}

function ModalAgendamento({ psicologo, aoFechar, uidPaciente, nomePaciente }: ModalAgendamentoProps) {
  const hoje = new Date();
  const diasDisponiveis: { label: string; value: string }[] = [];
  let d = new Date(hoje);
  d.setDate(d.getDate() + 1);
  while (diasDisponiveis.length < 5) {
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) {
      diasDisponiveis.push({
        label: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
        value: d.toLocaleDateString("pt-BR"),
      });
    }
    d.setDate(d.getDate() + 1);
  }

  const [diaSelecionado, setDiaSelecionado] = useState<{ label: string; value: string } | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    if (!diaSelecionado || !horarioSelecionado) return;
    setEnviando(true);

    // Se o psicólogo tem uid real, cria agendamento no Firestore
    if (psicologo.uid) {
      await criarAgendamento(
        uidPaciente, nomePaciente,
        psicologo.uid, psicologo.nome,
        diaSelecionado.value, horarioSelecionado
      );
    } else {
      // Simula para dados mock
      await new Promise((r) => setTimeout(r, 1000));
    }
    setEnviando(false);
    setConfirmado(true);
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <View style={{ backgroundColor: "#f0f9ff", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%" }}>
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
            <Text style={{ fontSize: 17, color: COLORS.sky700 }}>Agendar com {psicologo.nome}</Text>
            <Pressable onPress={aoFechar} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color={COLORS.sky600} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
            {confirmado ? (
              <View style={{ alignItems: "center", paddingVertical: 32, gap: 16 }}>
                <CheckCircle size={56} color="#22c55e" strokeWidth={1.5} />
                <Text style={{ fontSize: 18, color: COLORS.sky700, textAlign: "center" }}>Solicitação enviada!</Text>
                <Text style={{ fontSize: 14, color: COLORS.sky500, textAlign: "center", lineHeight: 20 }}>
                  {psicologo.nome} receberá sua solicitação para{" "}
                  <Text style={{ color: COLORS.sky600 }}>{diaSelecionado?.label} às {horarioSelecionado}</Text>.{"\n\n"}
                  Status: <Text style={{ color: "#f59e0b" }}>Pendente de confirmação</Text>
                </Text>
                <Pressable onPress={aoFechar} style={{ backgroundColor: COLORS.sky500, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32 }}>
                  <Text style={{ color: "#fff", fontSize: 15 }}>Fechar</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Seleção de dia */}
                <View>
                  <Text style={{ fontSize: 14, color: COLORS.sky700, marginBottom: 10 }}>Selecione um dia</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {diasDisponiveis.map((dia) => (
                      <Pressable
                        key={dia.value}
                        onPress={() => setDiaSelecionado(dia)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: diaSelecionado?.value === dia.value ? COLORS.sky500 : "#fff",
                          borderWidth: 1,
                          borderColor: diaSelecionado?.value === dia.value ? COLORS.sky500 : "#bae6fd",
                        }}
                      >
                        <Text style={{ fontSize: 13, color: diaSelecionado?.value === dia.value ? "#fff" : COLORS.sky600 }}>
                          {dia.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Seleção de horário */}
                <View>
                  <Text style={{ fontSize: 14, color: COLORS.sky700, marginBottom: 10 }}>Selecione um horário</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {HORARIOS_DISPONIVEIS.map((h) => (
                      <Pressable
                        key={h}
                        onPress={() => setHorarioSelecionado(h)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: horarioSelecionado === h ? COLORS.sky500 : "#fff",
                          borderWidth: 1,
                          borderColor: horarioSelecionado === h ? COLORS.sky500 : "#bae6fd",
                          minWidth: 72,
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontSize: 14, color: horarioSelecionado === h ? "#fff" : COLORS.sky600 }}>{h}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  onPress={confirmar}
                  disabled={!diaSelecionado || !horarioSelecionado || enviando}
                  style={({ pressed }) => ({
                    backgroundColor: !diaSelecionado || !horarioSelecionado ? COLORS.sky200 : pressed ? COLORS.sky600 : COLORS.sky500,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                  })}
                >
                  {enviando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: !diaSelecionado || !horarioSelecionado ? COLORS.sky400 : "#fff", fontSize: 15 }}>
                      Confirmar agendamento
                    </Text>
                  )}
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function Psicologos() {
  const router = useRouter();
  const { usuarioLogado } = useContext(LayoutContext);

  const [lista, setLista] = useState<PsicologoDisplay[]>([]);
  const [filtrado, setFiltrado] = useState<PsicologoDisplay[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [agendando, setAgendando] = useState<PsicologoDisplay | null>(null);
  const [avaliando, setAvaliando] = useState<PsicologoDisplay | null>(null);

  useEffect(() => {
    async function carregar() {
      // Carrega psicólogos reais do Firestore
      const reais = await listarPsicologos();
      const convertidos: PsicologoDisplay[] = reais.map((p) => ({
        id: p.uid,
        uid: p.uid,
        email: p.email,
        nome: p.nome,
        crm: p.crm ?? "",
        especialidade: p.especialidade ?? "",
        descricao: p.descricao ?? "",
        disponivel: p.disponivel ?? true,
        media_avaliacao: p.media_avaliacao ?? 0,
        qtd_avaliacoes: p.qtd_avaliacoes ?? 0,
      }));

      // Adiciona mock apenas se não há psicólogos reais
      const mockConvertidos: PsicologoDisplay[] = PSICOLOGOS_MOCK.map((p) => ({
        id: p.id_psicologo,
        nome: p.nome,
        crm: p.registro_profissional,
        especialidade: p.especialidade,
        descricao: p.descricao,
        disponivel: p.disponivel,
        media_avaliacao: p.media_avaliacao ?? 0,
        qtd_avaliacoes: p.qtd_avaliacoes ?? 0,
      }));

      const combinados = [...convertidos, ...mockConvertidos];
      setLista(combinados);
      setFiltrado(combinados);
      setCarregando(false);
    }
    carregar();
  }, []);

  useEffect(() => {
    if (!busca.trim()) {
      setFiltrado(lista);
      return;
    }
    const t = busca.toLowerCase();
    setFiltrado(lista.filter((p) =>
      p.nome.toLowerCase().includes(t) ||
      p.especialidade.toLowerCase().includes(t) ||
      p.descricao.toLowerCase().includes(t)
    ));
  }, [busca, lista]);

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
        <Pressable onPress={() => router.back()} style={{ marginRight: 12 }}>
          <ChevronLeft size={26} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>Psicólogos</Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
            Encontre apoio profissional
          </Text>
        </View>
      </View>

      {/* Busca */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          backgroundColor: "rgba(255,255,255,0.8)",
          margin: 16,
          marginBottom: 4,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#bae6fd",
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Search size={18} color={COLORS.sky400} strokeWidth={1.5} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar por nome ou especialidade..."
          placeholderTextColor={COLORS.sky300}
          style={{ flex: 1, color: COLORS.sky800, fontSize: 14 }}
        />
      </View>

      {/* Aviso dados demonstrativos */}
      <View style={{ backgroundColor: "#eff6ff", borderRadius: 10, padding: 10, marginHorizontal: 16, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: "#bfdbfe" }}>
        <Text style={{ fontSize: 12, color: "#1e40af", textAlign: "center", lineHeight: 18 }}>
          ℹ️ Profissionais com ⭐ são psicólogos cadastrados no app. Os demais são dados <Text style={{ fontWeight: "bold" }}>fictícios</Text> para demonstração.
        </Text>
      </View>

      {carregando ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.sky400} size="large" />
        </View>
      ) : filtrado.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ color: COLORS.sky400, fontSize: 15, textAlign: "center" }}>
            Nenhum psicólogo encontrado para "{busca}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtrado}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <CardPsicologo
              psicologo={item}
              onAgendar={setAgendando}
              onAvaliar={setAvaliando}
            />
          )}
        />
      )}

      {/* Modal de agendamento */}
      {agendando && (
        <ModalAgendamento
          psicologo={agendando}
          aoFechar={() => setAgendando(null)}
          uidPaciente={usuarioLogado?.uid ?? ""}
          nomePaciente={usuarioLogado?.nome ?? "Paciente"}
        />
      )}

      {/* Modal de avaliação */}
      {avaliando && (
        <ModalAvaliacao
          psicologo={avaliando}
          aoFechar={() => setAvaliando(null)}
          uidPaciente={usuarioLogado?.uid ?? ""}
          nomePaciente={usuarioLogado?.nome ?? "Paciente"}
        />
      )}
    </GradientBackground>
  );
}
