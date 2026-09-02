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
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    if (!chatId) return;
    getDoc(doc(db, "chats", chatId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setNomeOutro(data.doutorNome ?? "Doutor");
      }
      setPronto(true);
    });
  }, [chatId]);

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
    />
  );
}
