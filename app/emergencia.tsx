/**
 * Tela de Emergência — funcionalidade principal do app.
 *
 * Fluxo:
 * 1. Usuário vê o botão grande e claramente identificável.
 * 2. Ao pressionar, aparece confirmação para evitar acionamento acidental.
 * 3. Após confirmar, inicia o fluxo de emergência:
 *    - Toca o som selecionado.
 *    - Abre o chat de apoio (Dra. Sofia).
 *    - Lista os contatos de emergência cadastrados.
 *
 * IMPORTANTE: As integrações com WhatsApp/ligação são preparadas mas
 * exibem claramente que ainda não estão implementadas.
 */
import { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { AlertCircle, Phone, MessageSquare, X, ChevronLeft, PhoneCall } from "lucide-react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "../src/components/GradientBackground";
import { ModalChatEmergencia } from "../src/components/ModalChatEmergencia";
import { LayoutContext } from "../src/contexts/LayoutContext";
import { useSom } from "../src/hooks/useSom";
import { useKonami } from "../src/hooks/useKonami";
import { GRADIENTS, COLORS } from "../src/constants/theme";
import { listarContatos } from "../src/services/emergencyContacts";
import type { ContatoEmergencia } from "../src/types";

// Números de emergência nacionais (dados reais e públicos)
const EMERGENCIAS_NACIONAIS = [
  { nome: "SAMU", numero: "192", descricao: "Serviço de Atendimento Móvel de Urgência" },
  { nome: "Bombeiros", numero: "193", descricao: "Corpo de Bombeiros" },
  { nome: "CVV", numero: "188", descricao: "Centro de Valorização da Vida" },
  { nome: "Polícia", numero: "190", descricao: "Polícia Militar" },
];

export default function Emergencia() {
  const router = useRouter();
  const { sonSelecionado, secretosDesbloqueados, desbloquearSecretos, usuarioLogado } =
    useContext(LayoutContext);

  const [chatAberto, setChatAberto] = useState(false);
  const [modalKonami, setModalKonami] = useState(false);
  const [modalConfirmacao, setModalConfirmacao] = useState(false);
  const [contatos, setContatos] = useState<ContatoEmergencia[]>([]);

  const { tocar } = useSom(sonSelecionado);
  const { tocar: tocarSecret } = useSom("Secret");

  // Carrega contatos de emergência do usuário
  useEffect(() => {
    if (usuarioLogado) {
      listarContatos(usuarioLogado.email).then(setContatos).catch(() => {});
    }
  }, [usuarioLogado]);

  // Konami code easter egg
  const handleKonami = useCallback(() => {
    tocarSecret();
    if (!secretosDesbloqueados) desbloquearSecretos();
    setModalKonami(true);
  }, [secretosDesbloqueados, tocarSecret, desbloquearSecretos]);

  useKonami(handleKonami);

  // Confirma e aciona emergência
  function confirmarEmergencia() {
    setModalConfirmacao(false);
    tocar();
    setChatAberto(true);
  }

  // Tenta ligar (funciona em mobile nativo)
  function ligar(numero: string, nome: string) {
    Linking.openURL(`tel:${numero}`).catch(() => {
      Alert.alert(
        "Não foi possível abrir o discador",
        `Para ligar para ${nome}, disque ${numero}.`
      );
    });
  }

  // WhatsApp — aviso de limitação
  function avisarWhatsApp() {
    Alert.alert(
      "Integração em desenvolvimento",
      "O envio automático de mensagens via WhatsApp ainda não está implementado nesta versão.\n\nVocê pode ligar ou enviar mensagem manualmente.",
      [{ text: "Entendido" }]
    );
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
        <Text style={{ fontSize: 20, color: COLORS.sky700 }}>Emergência</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Botão de emergência */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
            paddingHorizontal: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: COLORS.sky600,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            Pressione o botão abaixo para acionar sua rede de apoio.
          </Text>

          <Pressable
            onPress={() => setModalConfirmacao(true)}
            accessibilityRole="button"
            accessibilityLabel="Botão de emergência — pressione para acionar apoio"
          >
            {({ pressed }) => (
              <View
                style={{
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  overflow: "hidden",
                  elevation: 12,
                  shadowColor: COLORS.sky400,
                  shadowOpacity: 0.4,
                  shadowRadius: 30,
                }}
              >
                <LinearGradient
                  colors={GRADIENTS.emergencyButton}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Pulso externo */}
                  <MotiView
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: 120,
                      backgroundColor: "rgba(255,255,255,0.2)",
                    }}
                    from={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.18, opacity: 0.8 }}
                    transition={{
                      type: "timing",
                      duration: 1500,
                      loop: true,
                      repeatReverse: true,
                    }}
                  />

                  <AlertCircle
                    size={40}
                    color="#fff"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 22,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    Preciso de{"\n"}apoio
                  </Text>
                </LinearGradient>
              </View>
            )}
          </Pressable>

          <Text
            style={{
              fontSize: 12,
              color: COLORS.sky500,
              textAlign: "center",
              marginTop: 20,
              paddingHorizontal: 32,
            }}
          >
            Este recurso é complementar. Em risco imediato à vida, ligue 192 (SAMU).
          </Text>
        </View>

        {/* Contatos de emergência cadastrados */}
        {contatos.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 15,
                color: COLORS.sky700,
                marginBottom: 12,
              }}
            >
              Meus contatos de apoio
            </Text>
            {contatos.map((contato) => (
              <View
                key={contato.id_contato}
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(186,230,253,0.5)",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, color: COLORS.sky800 }}>
                    {contato.nome}
                  </Text>
                  <Text style={{ fontSize: 12, color: COLORS.sky500, marginTop: 2 }}>
                    {contato.tipo_relacao} • {contato.telefone}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => ligar(contato.telefone, contato.nome)}
                    accessibilityLabel={`Ligar para ${contato.nome}`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.sky100,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Phone size={18} color={COLORS.sky600} strokeWidth={1.5} />
                  </Pressable>
                  <Pressable
                    onPress={avisarWhatsApp}
                    accessibilityLabel={`Enviar mensagem para ${contato.nome} (em desenvolvimento)`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.sky100,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MessageSquare size={18} color={COLORS.sky600} strokeWidth={1.5} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {contatos.length === 0 && (
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 24,
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: COLORS.sky500,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Você ainda não tem contatos de emergência cadastrados.{"\n"}
              Adicione contatos em Perfil → Contatos de Emergência.
            </Text>
          </View>
        )}

        {/* Serviços de emergência nacionais */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 15,
              color: COLORS.sky700,
              marginBottom: 12,
            }}
          >
            Serviços de emergência
          </Text>
          {EMERGENCIAS_NACIONAIS.map((servico) => (
            <Pressable
              key={servico.nome}
              onPress={() => ligar(servico.numero, servico.nome)}
              accessibilityRole="button"
              accessibilityLabel={`Ligar para ${servico.nome}, ${servico.numero}`}
              style={({ pressed }) => ({
                backgroundColor: pressed
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(255,255,255,0.8)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "rgba(186,230,253,0.5)",
              })}
            >
              <PhoneCall size={20} color={COLORS.sky500} strokeWidth={1.5} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: COLORS.sky800 }}>
                  {servico.nome}
                </Text>
                <Text style={{ fontSize: 12, color: COLORS.sky500 }}>
                  {servico.descricao}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  color: COLORS.sky600,
                }}
              >
                {servico.numero}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Modal de confirmação */}
      <Modal
        visible={modalConfirmacao}
        transparent
        animationType="fade"
        onRequestClose={() => setModalConfirmacao(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 24,
              backgroundColor: "#fff",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#bae6fd",
            }}
          >
            <LinearGradient
              colors={GRADIENTS.emergencyButton}
              style={{ paddingVertical: 20, alignItems: "center" }}
            >
              <AlertCircle size={36} color="#fff" strokeWidth={1.5} />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Confirmar acionamento?
              </Text>
            </LinearGradient>

            <View style={{ padding: 24, alignItems: "center" }}>
              <Text
                style={{
                  color: COLORS.sky800,
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Você está acionando o recurso de apoio de emergência.{"\n\n"}
                Isso abrirá o chat de apoio e irá alertar seus contatos de emergência.
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: 20,
                paddingBottom: 20,
              }}
            >
              <Pressable
                onPress={() => setModalConfirmacao(false)}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: COLORS.sky100,
                  borderWidth: 1,
                  borderColor: COLORS.sky200,
                }}
                accessibilityLabel="Cancelar"
              >
                <Text style={{ color: COLORS.sky600, fontSize: 15 }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmarEmergencia}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: COLORS.sky500,
                }}
                accessibilityLabel="Confirmar acionamento de emergência"
              >
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  Confirmar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat de apoio */}
      <ModalChatEmergencia
        visivel={chatAberto}
        aoFechar={() => setChatAberto(false)}
      />

      {/* Modal Konami */}
      <Modal
        visible={modalKonami}
        transparent
        animationType="fade"
        onRequestClose={() => setModalKonami(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 24,
              backgroundColor: "#fff",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#bae6fd",
            }}
          >
            <LinearGradient
              colors={GRADIENTS.emergencyButton}
              style={{ paddingVertical: 20, alignItems: "center" }}
            >
              <Text style={{ fontSize: 36 }}>🎮</Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  marginTop: 6,
                }}
              >
                Código Konami!
              </Text>
            </LinearGradient>

            <View style={{ padding: 24, alignItems: "center" }}>
              <Text
                style={{
                  color: COLORS.sky800,
                  fontSize: 15,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Você desbloqueou sons secretos! 🔓{"\n"}Acesse{" "}
                <Text style={{ color: COLORS.sky500 }}>
                  Perfil → Sons
                </Text>{" "}
                para escolher.
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <Pressable
                onPress={() => setModalKonami(false)}
                style={{
                  backgroundColor: COLORS.sky400,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  Entendido!
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}
