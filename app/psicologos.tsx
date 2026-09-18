/**
 * Tela de Psicólogos — lista de profissionais disponíveis.
 *
 * AVISO: Os profissionais listados são fictícios e apenas para demonstração.
 * Não representam profissionais reais.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, UserCheck, Calendar, X, CheckCircle } from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { Avatar } from "../src/components/Avatar";
import { COLORS } from "../src/constants/theme";
import { PSICOLOGOS_MOCK } from "../src/services/mockData";
import type { Psicologo } from "../src/types";

// Aviso de dados demonstrativos
function AvisoDemonstrativos() {
  return (
    <View
      style={{
        backgroundColor: "#eff6ff",
        borderRadius: 10,
        padding: 10,
        marginHorizontal: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#bfdbfe",
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: "#1e40af",
          textAlign: "center",
          lineHeight: 18,
        }}
      >
        ℹ️ Os profissionais abaixo são{" "}
        <Text style={{ fontWeight: "bold" }}>dados fictícios</Text> para
        demonstração do protótipo. Não representam psicólogos reais.
      </Text>
    </View>
  );
}

// Card de psicólogo
interface CardPsicologoProps {
  psicologo: Psicologo;
  onAgendar: (p: Psicologo) => void;
}

function CardPsicologo({ psicologo, onAgendar }: CardPsicologoProps) {
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
      {/* Header do card */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <Avatar nome={psicologo.nome} size={52} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, color: COLORS.sky800 }}>
            {psicologo.nome}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
            {psicologo.registro_profissional}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              marginTop: 4,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: psicologo.disponivel ? "#22c55e" : "#94a3b8",
              }}
            />
            <Text
              style={{
                fontSize: 12,
                color: psicologo.disponivel ? "#16a34a" : "#64748b",
              }}
            >
              {psicologo.disponivel ? "Disponível" : "Indisponível"}
            </Text>
          </View>
        </View>
      </View>

      {/* Especialidade */}
      <View
        style={{
          backgroundColor: COLORS.sky100,
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: COLORS.sky600 }}>
          {psicologo.especialidade}
        </Text>
      </View>

      {/* Descrição */}
      <Text
        style={{
          fontSize: 13,
          color: COLORS.sky700,
          lineHeight: 19,
          marginBottom: 12,
        }}
      >
        {psicologo.descricao}
      </Text>

      {/* Botão agendar */}
      <Pressable
        onPress={() => onAgendar(psicologo)}
        disabled={!psicologo.disponivel}
        accessibilityRole="button"
        accessibilityLabel={`Agendar consulta com ${psicologo.nome}`}
        style={({ pressed }) => ({
          backgroundColor: psicologo.disponivel
            ? pressed
              ? COLORS.sky600
              : COLORS.sky500
            : COLORS.sky200,
          borderRadius: 12,
          paddingVertical: 12,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        })}
      >
        <Calendar
          size={16}
          color={psicologo.disponivel ? "#fff" : COLORS.sky400}
          strokeWidth={1.5}
        />
        <Text
          style={{
            color: psicologo.disponivel ? "#fff" : COLORS.sky400,
            fontSize: 14,
          }}
        >
          {psicologo.disponivel ? "Agendar consulta" : "Indisponível no momento"}
        </Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tela principal
// ---------------------------------------------------------------------------
export default function Psicologos() {
  const router = useRouter();
  const [psicologoSelecionado, setPsicologoSelecionado] =
    useState<Psicologo | null>(null);

  function handleAgendar(psicologo: Psicologo) {
    setPsicologoSelecionado(psicologo);
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
        <View>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>Psicólogos</Text>
          <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
            Encontre apoio profissional
          </Text>
        </View>
      </View>

      <AvisoDemonstrativos />

      <FlatList
        data={PSICOLOGOS_MOCK}
        keyExtractor={(item) => item.id_psicologo}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <CardPsicologo psicologo={item} onAgendar={handleAgendar} />
        )}
      />

      {/* Modal de agendamento */}
      {psicologoSelecionado && (
        <ModalAgendamento
          psicologo={psicologoSelecionado}
          aoFechar={() => setPsicologoSelecionado(null)}
        />
      )}
    </GradientBackground>
  );
}

// ---------------------------------------------------------------------------
// Modal de Agendamento (inline, protótipo)
// ---------------------------------------------------------------------------
import { HORARIOS_DISPONIVEIS } from "../src/services/mockData";

interface ModalAgendamentoProps {
  psicologo: Psicologo;
  aoFechar: () => void;
}

function ModalAgendamento({ psicologo, aoFechar }: ModalAgendamentoProps) {
  const hoje = new Date();
  // Gera próximos 7 dias úteis (seg–sex)
  const diasDisponiveis: string[] = [];
  let d = new Date(hoje);
  d.setDate(d.getDate() + 1);
  while (diasDisponiveis.length < 5) {
    const dia = d.getDay();
    if (dia !== 0 && dia !== 6) {
      diasDisponiveis.push(
        d.toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        })
      );
    }
    d.setDate(d.getDate() + 1);
  }

  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  function confirmar() {
    if (!diaSelecionado || !horarioSelecionado) return;
    setEnviando(true);
    // Simula envio (protótipo)
    setTimeout(() => {
      setEnviando(false);
      setConfirmado(true);
    }, 1000);
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={aoFechar}
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
              Agendar com {psicologo.nome}
            </Text>
            <Pressable
              onPress={aoFechar}
              accessibilityLabel="Fechar agendamento"
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

          <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
            {confirmado ? (
              /* Confirmação */
              <View style={{ alignItems: "center", paddingVertical: 32, gap: 16 }}>
                <CheckCircle size={56} color="#22c55e" strokeWidth={1.5} />
                <Text
                  style={{
                    fontSize: 18,
                    color: COLORS.sky700,
                    textAlign: "center",
                  }}
                >
                  Solicitação enviada!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.sky500,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {psicologo.nome} receberá sua solicitação de agendamento para{" "}
                  <Text style={{ color: COLORS.sky600 }}>
                    {diaSelecionado} às {horarioSelecionado}
                  </Text>
                  .{"\n\n"}
                  Status: <Text style={{ color: "#f59e0b" }}>Pendente de confirmação</Text>
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.sky400,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  (Funcionalidade de demonstração — o agendamento real será implementado com o backend)
                </Text>
                <Pressable
                  onPress={aoFechar}
                  style={{
                    backgroundColor: COLORS.sky500,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    marginTop: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 15 }}>Fechar</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Seleção de dia */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.sky700,
                      marginBottom: 10,
                    }}
                  >
                    Selecione um dia
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {diasDisponiveis.map((dia) => (
                      <Pressable
                        key={dia}
                        onPress={() => setDiaSelecionado(dia)}
                        accessibilityRole="button"
                        accessibilityLabel={`Dia ${dia}`}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor:
                            diaSelecionado === dia ? COLORS.sky500 : "#fff",
                          borderWidth: 1,
                          borderColor:
                            diaSelecionado === dia ? COLORS.sky500 : "#bae6fd",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            color:
                              diaSelecionado === dia ? "#fff" : COLORS.sky600,
                          }}
                        >
                          {dia}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Seleção de horário */}
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: COLORS.sky700,
                      marginBottom: 10,
                    }}
                  >
                    Selecione um horário
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {HORARIOS_DISPONIVEIS.map((h) => (
                      <Pressable
                        key={h}
                        onPress={() => setHorarioSelecionado(h)}
                        accessibilityRole="button"
                        accessibilityLabel={`Horário ${h}`}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor:
                            horarioSelecionado === h ? COLORS.sky500 : "#fff",
                          borderWidth: 1,
                          borderColor:
                            horarioSelecionado === h ? COLORS.sky500 : "#bae6fd",
                          minWidth: 72,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color:
                              horarioSelecionado === h ? "#fff" : COLORS.sky600,
                          }}
                        >
                          {h}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  onPress={confirmar}
                  disabled={!diaSelecionado || !horarioSelecionado || enviando}
                  accessibilityRole="button"
                  accessibilityLabel="Confirmar agendamento"
                  style={({ pressed }) => ({
                    backgroundColor:
                      !diaSelecionado || !horarioSelecionado
                        ? COLORS.sky200
                        : pressed
                        ? COLORS.sky600
                        : COLORS.sky500,
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                    marginTop: 8,
                  })}
                >
                  {enviando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color:
                          !diaSelecionado || !horarioSelecionado
                            ? COLORS.sky400
                            : "#fff",
                        fontSize: 15,
                      }}
                    >
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
