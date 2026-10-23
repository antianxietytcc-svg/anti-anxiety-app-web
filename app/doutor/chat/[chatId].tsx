/**
 * Chat do doutor — exibe ChatTela com opções de sessão (chamada de vídeo/áudio).
 * O doutor pode iniciar uma sessão imediatamente ou agendá-la.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChatTela } from "../../../src/components/ChatTela";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../../../src/constants/theme";
import {
  Video,
  Phone,
  MicOff,
  Mic,
  CameraOff,
  Camera,
  Volume2,
  VolumeX,
  PhoneOff,
  CalendarClock,
  X,
} from "lucide-react-native";
import { criarAgendamento } from "../../../src/lib/firestore";

const KEY_DOUTOR_SESSAO = "aa_doutor_sessao";

function lerSessao(): { email: string; nome: string; uid: string } | null {
  try {
    const raw = localStorage.getItem(KEY_DOUTOR_SESSAO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Modal de chamada ativa (vídeo ou áudio simulado)
// ---------------------------------------------------------------------------
interface ModalChamadaProps {
  tipo: "video" | "audio";
  nomeOutro: string;
  aoEncerrar: () => void;
}

function ModalChamadaAtiva({ tipo, nomeOutro, aoEncerrar }: ModalChamadaProps) {
  const [mutado, setMutado] = useState(false);
  const [cameraDesligada, setCameraDesligada] = useState(false);
  const [volume, setVolume] = useState(true);
  const [duracao, setDuracao] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setDuracao((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  function formatarDuracao(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "#0f172a", alignItems: "center", justifyContent: "center", gap: 32 }}>
        {/* Avatar / câmera */}
        <View style={{ alignItems: "center", gap: 12 }}>
          {tipo === "video" && !cameraDesligada ? (
            <View style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: "#1e3a5f", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#38bdf8" }}>
              <Video size={64} color="#38bdf8" strokeWidth={1.5} />
              <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Câmera ativa</Text>
            </View>
          ) : (
            <View style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: "#1e293b", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#475569" }}>
              <Text style={{ color: "#fff", fontSize: 60 }}>{nomeOutro?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
          )}
          <Text style={{ color: "#fff", fontSize: 22 }}>{nomeOutro}</Text>
          <Text style={{ color: "#94a3b8", fontSize: 15 }}>🔴 {formatarDuracao(duracao)}</Text>
        </View>

        {/* Controles */}
        <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
          {/* Mudo */}
          <Pressable
            onPress={() => setMutado(!mutado)}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: mutado ? "#ef4444" : "#1e293b", alignItems: "center", justifyContent: "center" }}
          >
            {mutado ? <MicOff size={24} color="#fff" strokeWidth={1.5} /> : <Mic size={24} color="#fff" strokeWidth={1.5} />}
          </Pressable>

          {/* Câmera (apenas vídeo) */}
          {tipo === "video" && (
            <Pressable
              onPress={() => setCameraDesligada(!cameraDesligada)}
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: cameraDesligada ? "#ef4444" : "#1e293b", alignItems: "center", justifyContent: "center" }}
            >
              {cameraDesligada ? <CameraOff size={24} color="#fff" strokeWidth={1.5} /> : <Camera size={24} color="#fff" strokeWidth={1.5} />}
            </Pressable>
          )}

          {/* Volume */}
          <Pressable
            onPress={() => setVolume(!volume)}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: volume ? "#1e293b" : "#78716c", alignItems: "center", justifyContent: "center" }}
          >
            {volume ? <Volume2 size={24} color="#fff" strokeWidth={1.5} /> : <VolumeX size={24} color="#fff" strokeWidth={1.5} />}
          </Pressable>

          {/* Encerrar */}
          <Pressable
            onPress={() => {
              Alert.alert("Encerrar sessão?", "Deseja encerrar esta chamada?", [
                { text: "Cancelar", style: "cancel" },
                { text: "Encerrar", style: "destructive", onPress: aoEncerrar },
              ]);
            }}
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center" }}
          >
            <PhoneOff size={28} color="#fff" strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Modal agendamento de sessão
// ---------------------------------------------------------------------------
interface ModalAgendarSessaoProps {
  visivel: boolean;
  aoFechar: () => void;
  sessao: { email: string; nome: string; uid: string };
  pacienteId: string;
  pacienteNome: string;
}

function ModalAgendarSessao({ visivel, aoFechar, sessao, pacienteId, pacienteNome }: ModalAgendarSessaoProps) {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function agendar() {
    if (!data.trim() || !hora.trim()) {
      Alert.alert("Preencha data e horário.");
      return;
    }
    setSalvando(true);
    await criarAgendamento(pacienteId, pacienteNome, sessao.uid, sessao.nome, data.trim(), hora.trim());
    setSalvando(false);
    setSucesso(true);
    setTimeout(() => { setSucesso(false); aoFechar(); }, 1500);
  }

  return (
    <Modal visible={visivel} transparent animationType="slide" onRequestClose={aoFechar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <Pressable style={{ position: "absolute", inset: 0 } as any} onPress={aoFechar} />
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 18, color: COLORS.sky700 }}>Agendar sessão</Text>
            <Pressable onPress={aoFechar}><X size={20} color={COLORS.sky500} /></Pressable>
          </View>
          <Text style={{ fontSize: 13, color: COLORS.sky600 }}>Com: {pacienteNome}</Text>
          {sucesso ? (
            <Text style={{ textAlign: "center", color: "#22c55e", fontSize: 15, paddingVertical: 10 }}>✅ Sessão agendada com sucesso!</Text>
          ) : (
            <>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Data (ex: 25/12/2025)</Text>
                <TextInput value={data} onChangeText={setData} placeholder="DD/MM/AAAA" placeholderTextColor={COLORS.sky300} style={{ borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 14, paddingVertical: 11, color: COLORS.sky800 }} />
              </View>
              <View>
                <Text style={{ fontSize: 12, color: COLORS.sky600, marginBottom: 4 }}>Horário (ex: 14:30)</Text>
                <TextInput value={hora} onChangeText={setHora} placeholder="HH:MM" placeholderTextColor={COLORS.sky300} style={{ borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd", backgroundColor: "#f0f9ff", paddingHorizontal: 14, paddingVertical: 11, color: COLORS.sky800 }} />
              </View>
              <Pressable
                onPress={agendar}
                disabled={salvando}
                style={{ backgroundColor: COLORS.sky400, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}
              >
                {salvando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 15 }}>Confirmar agendamento</Text>}
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export default function DoutorChatPage() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const sessao = lerSessao();
  const router = useRouter();

  const [nomeOutro, setNomeOutro] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [pronto, setPronto] = useState(false);
  const [chamadaAtiva, setChamadaAtiva] = useState<"video" | "audio" | null>(null);
  const [modalAgendar, setModalAgendar] = useState(false);
  const [menuSessao, setMenuSessao] = useState(false);

  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, "chats", chatId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNomeOutro(data.pacienteNome ?? "Paciente");
        setPacienteId(data.pacienteEmail ?? "");
      }
      setPronto(true);
    });
  }, [chatId]);

  if (!pronto || !sessao) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORS.sky400} />
      </View>
    );
  }

  function iniciarChamada(tipo: "video" | "audio") {
    setMenuSessao(false);
    Alert.alert(
      tipo === "video" ? "Iniciar chamada de vídeo" : "Iniciar chamada de áudio",
      `Iniciar ${tipo === "video" ? "vídeo" : "chamada de voz"} com ${nomeOutro}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Iniciar", onPress: () => setChamadaAtiva(tipo) },
      ]
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ChatTela
        chatId={chatId!}
        emailAtual={sessao.email}
        nomeAtual={sessao.nome}
        nomeOutro={nomeOutro}
        headerExtra={
          <View style={{ flexDirection: "row", gap: 4 }}>
            <Pressable
              onPress={() => setMenuSessao(!menuSessao)}
              style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center" }}
              accessibilityLabel="Iniciar sessão"
            >
              <Phone size={18} color={COLORS.sky600} strokeWidth={1.5} />
            </Pressable>
          </View>
        }
      />

      {/* Menu de sessão */}
      {menuSessao && (
        <View style={{ position: "absolute", top: 64, right: 16, backgroundColor: "#fff", borderRadius: 16, padding: 8, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, elevation: 8, gap: 4, zIndex: 100 }}>
          <Pressable onPress={() => iniciarChamada("audio")} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}>
            <Phone size={18} color={COLORS.sky600} strokeWidth={1.5} />
            <Text style={{ fontSize: 14, color: COLORS.sky800 }}>Chamada de áudio</Text>
          </Pressable>
          <Pressable onPress={() => iniciarChamada("video")} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}>
            <Video size={18} color={COLORS.sky600} strokeWidth={1.5} />
            <Text style={{ fontSize: 14, color: COLORS.sky800 }}>Chamada de vídeo</Text>
          </Pressable>
          <Pressable onPress={() => { setMenuSessao(false); setModalAgendar(true); }} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 }}>
            <CalendarClock size={18} color={COLORS.sky600} strokeWidth={1.5} />
            <Text style={{ fontSize: 14, color: COLORS.sky800 }}>Agendar sessão</Text>
          </Pressable>
          <Pressable onPress={() => setMenuSessao(false)} style={{ paddingHorizontal: 16, paddingVertical: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: COLORS.sky400 }}>Cancelar</Text>
          </Pressable>
        </View>
      )}

      {/* Chamada ativa */}
      {chamadaAtiva && (
        <ModalChamadaAtiva
          tipo={chamadaAtiva}
          nomeOutro={nomeOutro}
          aoEncerrar={() => setChamadaAtiva(null)}
        />
      )}

      {/* Agendar sessão */}
      <ModalAgendarSessao
        visivel={modalAgendar}
        aoFechar={() => setModalAgendar(false)}
        sessao={sessao}
        pacienteId={pacienteId}
        pacienteNome={nomeOutro}
      />
    </View>
  );
}
