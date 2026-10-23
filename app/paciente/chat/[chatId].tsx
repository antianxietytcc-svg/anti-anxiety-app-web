/**
 * Chat do paciente — determina o nome do outro usuário com base no chatId e email atual.
 */
import { useLocalSearchParams } from "expo-router";
import { ChatTela } from "../../../src/components/ChatTela";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../src/lib/firebase";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { LayoutContext } from "../../../src/contexts/LayoutContext";
import { COLORS } from "../../../src/constants/theme";

export default function PacienteChatPage() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { usuarioLogado } = useContext(LayoutContext);

  const [nomeOutro, setNomeOutro] = useState("");
  const [uidOutro, setUidOutro] = useState<string | undefined>();
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!chatId || !usuarioLogado) return;
    getDoc(doc(db, "chats", chatId)).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const emailAtual = usuarioLogado.email.trim().toLowerCase();
        // Determina o outro participante com base no email atual
        if (data.psicoEmail === emailAtual || data.doutorEmail === emailAtual) {
          // Usuário atual é o psicólogo → outro é o paciente
          setNomeOutro(data.pacienteNome ?? "Paciente");
        } else {
          // Usuário atual é o paciente → outro é o psicólogo
          setNomeOutro(data.psicoNome ?? data.doutorNome ?? "Psicólogo");
        }
      }
      setPronto(true);
    });
  }, [chatId, usuarioLogado]);

  if (!pronto || !usuarioLogado) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORS.sky400} />
      </View>
    );
  }

  return (
    <ChatTela
      chatId={chatId!}
      emailAtual={usuarioLogado.email}
      nomeAtual={usuarioLogado.nome}
      nomeOutro={nomeOutro}
      uidOutro={uidOutro}
    />
  );
}
