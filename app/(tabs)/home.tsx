/**
 * Tela Home — tela principal após autenticação.
 * Dá acesso rápido às funcionalidades do app.
 */
import { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Users,
  MessageCircle,
  UserCheck,
  User,
  Info,
} from "lucide-react-native";
import { GradientBackground } from "../../src/components/GradientBackground";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import { COLORS } from "../../src/constants/theme";

interface CardAcesso {
  titulo: string;
  descricao: string;
  rota: string;
  Icon: typeof AlertCircle;
  destaque?: boolean;
  cor: string;
  corFundo: string;
}

const cardsAcesso: CardAcesso[] = [
  {
    titulo: "Emergência",
    descricao: "Acione seu botão de apoio e entre em contato com sua rede.",
    rota: "/emergencia",
    Icon: AlertCircle,
    destaque: true,
    cor: "#fff",
    corFundo: COLORS.sky500,
  },
  {
    titulo: "Rede de Apoio",
    descricao: "Leia e compartilhe experiências com outras pessoas.",
    rota: "/(tabs)/explore",
    Icon: Users,
    cor: COLORS.sky700,
    corFundo: COLORS.sky100,
  },
  {
    titulo: "Chat",
    descricao: "Converse com psicólogos e sua rede de apoio.",
    rota: "/(tabs)/chat",
    Icon: MessageCircle,
    cor: COLORS.sky700,
    corFundo: COLORS.sky100,
  },
  {
    titulo: "Psicólogos",
    descricao: "Encontre profissionais e agende uma consulta.",
    rota: "/psicologos",
    Icon: UserCheck,
    cor: COLORS.sky700,
    corFundo: COLORS.sky100,
  },
  {
    titulo: "Perfil",
    descricao: "Gerencie seus dados e contatos de emergência.",
    rota: "/(tabs)/profile",
    Icon: User,
    cor: COLORS.sky700,
    corFundo: COLORS.sky100,
  },
  {
    titulo: "Sobre",
    descricao: "Saiba mais sobre o projeto Anti-Anxiety.",
    rota: "/sobre",
    Icon: Info,
    cor: COLORS.sky700,
    corFundo: COLORS.sky100,
  },
];

export default function Home() {
  const router = useRouter();
  const { nomeUsuario } = useContext(LayoutContext);

  const primeiroNome = nomeUsuario
    ? nomeUsuario.split(" ")[0]
    : "Usuário";

  return (
    <GradientBackground>
      {/* Cabeçalho */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 16,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <Text style={{ fontSize: 13, color: COLORS.sky500, marginBottom: 2 }}>
          Bem-vindo(a),
        </Text>
        <Text style={{ fontSize: 24, color: COLORS.sky700 }}>
          {primeiroNome} 👋
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.sky600, marginTop: 4 }}>
          Como você está se sentindo hoje?
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          gap: 12,
        }}
      >
        {/* Aviso informativo */}
        <View
          style={{
            backgroundColor: "#fffbeb",
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: "#fde68a",
          }}
        >
          <Text style={{ fontSize: 12, color: "#92400e", textAlign: "center", lineHeight: 18 }}>
            ⚠️ Este aplicativo é um recurso complementar de apoio e acolhimento.{"\n"}
            Não substitui acompanhamento médico ou psicológico.
          </Text>
        </View>

        {/* Cards de acesso rápido */}
        {cardsAcesso.map((card) => (
          <Pressable
            key={card.titulo}
            onPress={() => router.push(card.rota as any)}
            style={({ pressed }) => ({
              backgroundColor: card.corFundo,
              borderRadius: 16,
              padding: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              opacity: pressed ? 0.85 : 1,
              borderWidth: card.destaque ? 0 : 1,
              borderColor: "rgba(186,230,253,0.4)",
              shadowColor: "#000",
              shadowOpacity: card.destaque ? 0.15 : 0.05,
              shadowRadius: card.destaque ? 12 : 4,
              elevation: card.destaque ? 4 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={`Ir para ${card.titulo}`}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: card.destaque
                  ? "rgba(255,255,255,0.25)"
                  : COLORS.sky200,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <card.Icon
                size={24}
                color={card.cor}
                strokeWidth={1.5}
                aria-hidden
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: card.cor,
                  marginBottom: 3,
                }}
              >
                {card.titulo}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: card.destaque ? "rgba(255,255,255,0.85)" : COLORS.sky500,
                  lineHeight: 18,
                }}
              >
                {card.descricao}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </GradientBackground>
  );
}
