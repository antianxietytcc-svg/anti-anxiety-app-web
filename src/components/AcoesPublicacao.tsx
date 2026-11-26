import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { COLORS } from "../constants/theme";
import { excluirPost, type PostFirestore } from "../lib/firestore";
import { type FiltroFeed, type usePreferenciasFeed } from "../hooks/usePreferenciasFeed";

const filtros: { valor: FiltroFeed; nome: string }[] = [
  { valor: "recentes", nome: "Recentes" },
  { valor: "salvos", nome: "Salvos" },
  { valor: "ocultos", nome: "Ocultos" },
];

export function FiltrosFeed({ feed }: { feed: ReturnType<typeof usePreferenciasFeed> }) {
  return (
    <View style={{ gap: 6, paddingVertical: 6 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {filtros.map(({ valor, nome }) => (
          <Pressable key={valor} accessibilityRole="button" accessibilityState={{ selected: feed.filtro === valor }}
            onPress={() => feed.setFiltro(valor)} style={{ padding: 8, borderRadius: 8, backgroundColor: feed.filtro === valor ? "#bae6fd" : "#fff" }}>
            <Text style={{ color: COLORS.sky800 }}>{nome}</Text>
          </Pressable>
        ))}
      </View>
      {feed.erro ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{feed.erro}</Text> : null}
    </View>
  );
}

export function AcoesPublicacao({ post, uid, feed }: { post: PostFirestore; uid: string; feed: ReturnType<typeof usePreferenciasFeed> }) {
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const p = feed.preferencias.get(post.id);

  async function executar(acao: () => Promise<void>, mensagem: string) {
    setErro("");
    setOcupado(true);
    try {
      await acao();
      setConfirmar(false);
    } catch {
      setErro(mensagem);
    } finally {
      setOcupado(false);
    }
  }
  function botao(rotulo: string, acao: () => void, destrutivo = false) {
    return <Pressable accessibilityRole="button" onPress={acao} disabled={ocupado} style={{ paddingVertical: 8, paddingRight: 12 }}>
      <Text style={{ color: destrutivo ? "#b91c1c" : COLORS.sky800 }}>{rotulo}</Text>
    </Pressable>;
  }
  if (!uid) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {botao(p?.salvo ? "Remover dos salvos" : "Salvar", () => executar(() => feed.alternar(post.id, "salvo"), "Não foi possível alterar os posts salvos."))}
        {botao(p?.oculto ? "Mostrar no feed" : "Ocultar", () => executar(() => feed.alternar(post.id, "oculto"), "Não foi possível alterar a visibilidade no seu feed."))}
        {post.autorId === uid && botao("Excluir", () => { setErro(""); setConfirmar(true); }, true)}
      </View>
      {!confirmar && erro ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{erro}</Text> : null}
      {confirmar ? (
        <Modal visible transparent onRequestClose={() => { if (!ocupado) setConfirmar(false); }}>
          <View style={{ flex: 1, backgroundColor: "#0009", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={{ width: "100%", maxWidth: 360, backgroundColor: "#fff", padding: 20, borderRadius: 16, gap: 8 }}>
              <Text style={{ fontSize: 18, color: COLORS.sky800 }}>Excluir publicação?</Text>
              <Text>Ela será removida do feed de todos. Essa ação é permanente.</Text>
              {erro ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{erro}</Text> : null}
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                {botao("Cancelar", () => setConfirmar(false))}
                {botao(ocupado ? "Excluindo..." : "Excluir publicação", () => executar(() => excluirPost(post.id), "Não foi possível excluir. Confira a permissão ou tente novamente."), true)}
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

export function ImagemPublicacao({ uri, descricao }: { uri: string; descricao?: string }) {
  const [ampliada, setAmpliada] = useState(false);
  const { height, width } = useWindowDimensions();
  const texto = descricao?.trim() || "Imagem da publicação";
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={"Ampliar: " + texto} onPress={() => setAmpliada(true)} style={{ marginTop: 12 }}>
        <Image source={{ uri }} style={{ width: "100%", aspectRatio: 1, borderRadius: 12 }} contentFit="contain" />
      </Pressable>
      {ampliada ? <Modal visible onRequestClose={() => setAmpliada(false)}>
        <View style={{ flex: 1, backgroundColor: "#111827", justifyContent: "center", alignItems: "center", padding: 12, gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => setAmpliada(false)} style={{ padding: 10 }}>
            <Text style={{ color: "#fff" }}>Fechar imagem</Text>
          </Pressable>
          <Image source={{ uri }} accessible accessibilityLabel={texto} contentFit="contain"
            style={{ width: Math.max(1, width - 24), height: height * 0.7 }} />
          {descricao ? <Text numberOfLines={3} style={{ color: "#fff", textAlign: "center" }}>{descricao}</Text> : null}
        </View>
      </Modal> : null}
    </>
  );
}

export function DescricaoImagem({ valor, alterar }: { valor: string; alterar: (texto: string) => void }) {
  return <TextInput value={valor} onChangeText={alterar} maxLength={300} multiline
    accessibilityLabel="Descrição acessível da foto, opcional"
    placeholder="Descreva a foto para quem usa leitor de tela (opcional)"
    style={{ borderWidth: 1, borderColor: "#bae6fd", borderRadius: 10, padding: 10, color: COLORS.sky800 }} />;
}

