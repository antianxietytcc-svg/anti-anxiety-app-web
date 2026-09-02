import { useLocalSearchParams } from "expo-router";
import { ChatTela } from "../../../src/components/ChatTela";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "../../../src/constants/theme";

const KEY_DOUTOR_SESSAO = "aa_doutor_sessao";

function lerSessao(): { email: string; nome: string } | null {
  try {
    const raw = localStorage.getItem(KEY_DOUTOR_SESSAO);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function DoutorChatPage() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const sessao = lerSessao();

  const [nomeOutro, setNomeOutro] = useState("");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, "chats", chatId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNomeOutro(data.pacienteNome ?? "Paciente");
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

  return (
    <ChatTela
      chatId={chatId!}
      emailAtual={sessao.email}
      nomeAtual={sessao.nome}
      nomeOutro={nomeOutro}
    />
  );
}
