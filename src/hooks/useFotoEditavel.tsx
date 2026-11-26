import { useEffect, useRef, useState } from "react";
import { Alert, Modal, Platform, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { launchImageLibraryAsync, type ImagePickerAsset } from "expo-image-picker";
import { COLORS } from "../constants/theme";
import { prepararImagem, recorteQuadrado } from "../lib/media";

const centralizado = { zoom: 1, x: 0.5, y: 0.5 };
const limitar = (n: number) => Math.max(0, Math.min(1, n));

export function useFotoEditavel() {
  const [foto, setFoto] = useState<ImagePickerAsset | null>(null);
  const [ajuste, setAjuste] = useState(centralizado);
  const [erro, setErro] = useState("");
  const [processando, setProcessando] = useState(false);
  const resolver = useRef<((uri: string | null) => void) | null>(null);
  const { width } = useWindowDimensions();
  const lado = Math.min(280, width - 56);

  useEffect(() => () => { resolver.current?.(null); resolver.current = null; }, []);

  function fechar(uri: string | null) {
    resolver.current?.(uri);
    resolver.current = null;
    setFoto(null);
  }

  async function escolher(): Promise<string | null> {
    try {
      const resultado = await launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: Platform.OS !== "web",
        aspect: [1, 1],
        quality: 0.7,
      });
      if (resultado.canceled) return null;
      const selecionada = resultado.assets[0];
      if (Platform.OS !== "web") return selecionada.uri;
      if (!selecionada.width || !selecionada.height) throw new Error("Imagem sem dimensões.");
      setAjuste(centralizado);
      setErro("");
      setFoto(selecionada);
      return await new Promise<string | null>((resolve) => { resolver.current = resolve; });
    } catch {
      const mensagem = "Não foi possível abrir a foto. Tente escolher um arquivo JPG ou PNG.";
      if (Platform.OS === "web") window.alert(mensagem);
      else Alert.alert("Foto", mensagem);
      return null;
    }
  }

  async function aplicar() {
    if (!foto || processando) return;
    setProcessando(true);
    setErro("");
    try {
      fechar(await prepararImagem(foto.uri, ajuste));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível aplicar o recorte.");
    } finally {
      setProcessando(false);
    }
  }

  function botao(rotulo: string, acao: () => void, descricao = rotulo) {
    return (
      <Pressable key={rotulo} accessibilityRole="button" accessibilityLabel={descricao}
        onPress={acao} disabled={processando}
        style={{ borderRadius: 8, backgroundColor: COLORS.sky100, paddingHorizontal: 10, minHeight: 36, justifyContent: "center" }}>
        <Text style={{ color: COLORS.sky700 }}>{rotulo}</Text>
      </Pressable>
    );
  }

  const recorte = foto ? recorteQuadrado(foto.width, foto.height, ajuste) : null;
  const escala = recorte ? lado / recorte.lado : 1;
  const mover = (dx: number, dy: number) => setAjuste((a) => ({ ...a, x: limitar(a.x + dx), y: limitar(a.y + dy) }));
  const editor = foto && recorte ? (
    <Modal visible transparent onRequestClose={() => { if (!processando) fechar(null); }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 12, backgroundColor: "#0009" }}>
        <View style={{ maxWidth: 360, backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 8, alignItems: "center" }}>
          <Text style={{ fontSize: 18, color: COLORS.sky800 }}>Ajustar foto</Text>
          <View style={{ width: lado, height: lado, overflow: "hidden", backgroundColor: COLORS.sky100 }}>
            <Image source={{ uri: foto.uri }} contentFit="fill" style={{ position: "absolute",
              width: foto.width * escala, height: foto.height * escala,
              left: -recorte.x * escala, top: -recorte.y * escala }} />
          </View>
          <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
            {botao("−", () => setAjuste((a) => ({ ...a, zoom: Math.max(1, a.zoom - 0.25) })), "Diminuir zoom")}
            {botao("+", () => setAjuste((a) => ({ ...a, zoom: Math.min(3, a.zoom + 0.25) })), "Aumentar zoom")}
            {botao("←", () => mover(-0.1, 0), "Mover recorte para a esquerda")}
            {botao("→", () => mover(0.1, 0), "Mover recorte para a direita")}
            {botao("↑", () => mover(0, -0.1), "Mover recorte para cima")}
            {botao("↓", () => mover(0, 0.1), "Mover recorte para baixo")}
          </View>
          {erro ? <Text accessibilityRole="alert" style={{ color: "#b91c1c" }}>{erro}</Text> : null}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {botao("Cancelar", () => fechar(null))}
            {botao(processando ? "Aplicando..." : "Usar foto", aplicar)}
          </View>
        </View>
      </View>
    </Modal>
  ) : null;

  return { escolher, editor };
}

