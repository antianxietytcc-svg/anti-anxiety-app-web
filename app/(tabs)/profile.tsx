import { useContext, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import {
  Settings,
  Calendar,
  Heart,
  MessageCircle,
  Award,
  Phone,
} from "lucide-react-native";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import { getIniciais } from "../../src/components/Avatar";

type TipoUsuario = "Paciente" | "Psicólogo";

const menuOpcoes: {
  label: string;
  rota?: string;
  acao?: string;
}[] = [
  { label: "Contatos de Emergência", rota: "/contatos-emergencia" },
  { label: "Sons", rota: "/sons" },
  { label: "Sobre", rota: "/sobre" },
  { label: "Ajuda e Suporte" },
  { label: "Privacidade" },
];

export default function Profile() {
  const router = useRouter();
  const {
    nomeUsuario,
    emailUsuario,
    usuarioLogado,
    logout,
  } = useContext(LayoutContext);
  const [userType, setUserType] = useState<TipoUsuario>("Paciente");

  const dataCadastro = "Não disponível";

  const stats =
    userType === "Paciente"
      ? [
          { label: "Dias consecutivos", value: "—", Icon: Calendar },
          { label: "Sessões", value: "—", Icon: MessageCircle },
          { label: "Conquistas", value: "—", Icon: Award },
        ]
      : [
          { label: "Pacientes ativos", value: "—", Icon: MessageCircle },
          { label: "Sessões este mês", value: "—", Icon: Calendar },
          { label: "Avaliação", value: "—", Icon: Heart },
        ];

  return (
    <GradientBackground>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(186,230,253,0.5)",
        }}
      >
        <Text style={{ fontSize: 22, color: COLORS.sky700 }}>Perfil</Text>
        <Pressable accessibilityLabel="Configurações">
          <Settings size={24} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }}
      >
        {/* Avatar e Info */}
        <View
          style={{
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: COLORS.sky300,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 28, color: "#fff" }}>
              {nomeUsuario ? getIniciais(nomeUsuario) : "??"}
            </Text>
          </View>

          <Text style={{ fontSize: 22, color: COLORS.sky800, marginBottom: 4 }}>
            {nomeUsuario || "Usuário"}
          </Text>

          {emailUsuario ? (
            <Text style={{ fontSize: 13, color: COLORS.sky500, marginBottom: 4 }}>
              {emailUsuario}
            </Text>
          ) : null}

          {usuarioLogado && (
            <Text style={{ fontSize: 12, color: COLORS.sky400 }}>
              Membro desde {dataCadastro}
            </Text>
          )}

          {/* Tipo de usuário */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 12,
            }}
          >
            {(["Paciente", "Psicólogo"] as TipoUsuario[]).map((tipo) => (
              <Pressable
                key={tipo}
                onPress={() => setUserType(tipo)}
                accessibilityRole="button"
                accessibilityLabel={tipo}
                style={{
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  backgroundColor:
                    userType === tipo ? COLORS.sky500 : COLORS.sky100,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: userType === tipo ? "#fff" : COLORS.sky600,
                  }}
                >
                  {tipo}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Estatísticas */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Text
            style={{ fontSize: 16, color: COLORS.sky800, marginBottom: 16 }}
          >
            Estatísticas
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {stats.map((stat) => (
              <View key={stat.label} style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: COLORS.sky100,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <stat.Icon size={22} color={COLORS.sky600} strokeWidth={1.5} />
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    color: COLORS.sky800,
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: COLORS.sky500, textAlign: "center" }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {menuOpcoes.map((opcao, index) => (
            <Pressable
              key={opcao.label}
              onPress={() => {
                if (opcao.rota) router.push(opcao.rota as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={opcao.label}
              style={({ pressed }) => ({
                paddingHorizontal: 20,
                paddingVertical: 16,
                backgroundColor: pressed ? "rgba(240,249,255,0.8)" : "transparent",
                borderBottomWidth: index < menuOpcoes.length - 1 ? 1 : 0,
                borderBottomColor: "rgba(186,230,253,0.3)",
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              })}
            >
              {opcao.label === "Contatos de Emergência" && (
                <Phone size={18} color={COLORS.sky500} strokeWidth={1.5} />
              )}
              <Text style={{ fontSize: 15, color: COLORS.sky800 }}>
                {opcao.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sair */}
        <Pressable
          onPress={() => {
            logout();
            router.replace("/");
          }}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.8)",
            borderRadius: 20,
            paddingVertical: 16,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          })}
        >
          <Text style={{ color: "#ef4444", fontSize: 15 }}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </GradientBackground>
  );
}
