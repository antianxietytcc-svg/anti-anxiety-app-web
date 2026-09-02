import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, MessageCircle, UserCircle2 } from "lucide-react-native";
import { GradientBackground } from "../../src/components/GradientBackground";
import { Avatar } from "../../src/components/Avatar";
import { COLORS } from "../../src/constants/theme";
import {
  garantirChat,
  listarPacientes,
} from "../../src/lib/firestore";

const KEY_DOUTOR_SESSAO = "aa_doutor_sessao";

function lerSessaoDoutor(): { email: string; nome: string } | null {
  try {
    const raw = localStorage.getItem(KEY_DOUTOR_SESSAO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function DoutorSala() {
  const router = useRouter();
  const sessao = lerSessaoDoutor();

  const [pacientes, setPacientes] = useState<{ email: string; nome: string }[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abrindo, setAbrindo] = useState<string | null>(null);

  useEffect(() => {
    if (!sessao) { router.replace("/doutor"); return; }
    listarPacientes().then((lista) => {
      setPacientes(lista);
      setCarregando(false);
    });
  }, []);

  async function abrirChat(paciente: { email: string; nome: string }) {
    if (!sessao) return;
    setAbrindo(paciente.email);
    const chatId = await garantirChat(
      sessao.email,
      sessao.nome,
      paciente.email,
      paciente.nome
    );
    setAbrindo(null);
    router.push(`/doutor/chat/${chatId}`);
  }

  function sair() {
    try { localStorage.removeItem(KEY_DOUTOR_SESSAO); } catch {}
    router.replace("/doutor");
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
          paddingVertical: 16,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderBottomWidth: 1,
          borderBottomColor: "#bae6fd",
        }}
      >
        <View>
          <Text style={{ fontSize: 20, color: COLORS.sky700 }}>Seus Pacientes</Text>
          {sessao && (
            <Text style={{ fontSize: 12, color: COLORS.sky500 }}>{sessao.nome}</Text>
          )}
        </View>
        <Pressable onPress={sair}>
          <LogOut size={22} color={COLORS.sky500} strokeWidth={1.5} />
        </Pressable>
      </View>

      {carregando ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.sky400} />
        </View>
      ) : pacientes.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <UserCircle2 size={48} color={COLORS.sky300} strokeWidth={1} />
          <Text style={{ color: COLORS.sky500, marginTop: 16, textAlign: "center", fontSize: 15 }}>
            Nenhum paciente cadastrado no app ainda.{"\n"}Peça que eles criem uma conta primeiro.
          </Text>
        </View>
      ) : (
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
      )}
    </GradientBackground>
  );
}
