import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Settings, Calendar, Heart, MessageCircle, Award } from "lucide-react-native";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";

type TipoUsuario = "Paciente" | "Psicólogo";

const menuOpcoes = [
  "Editar Perfil",
  "Histórico",
  "Privacidade",
  "Notificações",
  "Ajuda e Suporte",
  "Sobre",
] as const;

export default function Profile() {
  const router = useRouter();
  const [userType, setUserType] = useState<TipoUsuario>("Paciente");

  const stats =
    userType === "Paciente"
      ? [
          { label: "Dias consecutivos", value: "15", Icon: Calendar },
          { label: "Sessões", value: "8", Icon: MessageCircle },
          { label: "Conquistas", value: "12", Icon: Award },
        ]
      : [
          { label: "Pacientes ativos", value: "24", Icon: MessageCircle },
          { label: "Sessões este mês", value: "47", Icon: Calendar },
          { label: "Avaliação", value: "4.9", Icon: Heart },
        ];

  return (
    <GradientBackground>
      <View className="flex-row items-center justify-between border-b border-sky-200/50 bg-white/80 px-6 py-4">
        <Text className="text-2xl text-sky-700">Perfil</Text>
        <Pressable>
          <Settings size={24} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 24 }}>
        {/* Avatar e Info */}
        <View className="items-center rounded-2xl bg-white/80 p-6 shadow-md">
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-sky-300 shadow-lg">
            <Text className="text-3xl text-white">JS</Text>
          </View>

          <Text className="mb-1 text-2xl text-sky-800">João Silva</Text>

          <View className="mt-3 flex-row gap-2">
            {(["Paciente", "Psicólogo"] as TipoUsuario[]).map((tipo) => (
              <Pressable
                key={tipo}
                onPress={() => setUserType(tipo)}
                className={`rounded-full px-4 py-2 ${
                  userType === tipo ? "bg-sky-500" : "bg-sky-100"
                }`}
              >
                <Text className={userType === tipo ? "text-sm text-white" : "text-sm text-sky-600"}>
                  {tipo}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mt-4 text-center text-sm text-sky-600">
            {userType === "Paciente"
              ? "Em busca de equilíbrio e paz interior 🌸"
              : "Especialista em Terapia Cognitivo-Comportamental 🧠"}
          </Text>
        </View>

        {/* Estatísticas */}
        <View className="rounded-2xl bg-white/80 p-6 shadow-md">
          <Text className="mb-4 text-lg text-sky-800">Estatísticas</Text>
          <View className="flex-row justify-between">
            {stats.map((stat) => (
              <View key={stat.label} className="items-center">
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                  <stat.Icon size={22} color={COLORS.sky600} strokeWidth={1.5} />
                </View>
                <Text className="mb-1 text-2xl text-sky-800">{stat.value}</Text>
                <Text className="text-xs text-sky-600/70">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View className="overflow-hidden rounded-2xl bg-white/80 shadow-md">
          {menuOpcoes.map((opcao, index) => (
            <Pressable
              key={opcao}
              onPress={() => {
                if (opcao === "Sobre") router.push("/sobre");
              }}
              className={`px-6 py-4 active:bg-white/60 ${
                index < menuOpcoes.length - 1 ? "border-b border-sky-200/30" : ""
              }`}
            >
              <Text className="text-sky-800">{opcao}</Text>
            </Pressable>
          ))}
        </View>

        {/* Sair */}
        <Pressable
          onPress={() => router.replace("/")}
          className="rounded-2xl bg-white/80 px-6 py-4 shadow-md active:bg-white/90"
        >
          <Text className="text-center text-red-500">Sair da Conta</Text>
        </Pressable>
      </ScrollView>
    </GradientBackground>
  );
}
