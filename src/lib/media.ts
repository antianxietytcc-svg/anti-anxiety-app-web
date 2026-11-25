import { File } from "expo-file-system";
import { Platform } from "react-native";

const LIMITE_BASE64 = 240_000;

export class ImagemInvalida extends Error {}

export function validarImagemBase64(base64: string): string {
  const tipo = base64.startsWith("/9j/") ? "jpeg"
    : base64.startsWith("iVBORw0KGgo") ? "png"
    : base64.startsWith("UklGR") && base64.slice(11, 16) === "XRUJQ" ? "webp"
    : null;
  if (!tipo) throw new ImagemInvalida("Selecione uma imagem JPG ou PNG compatível.");
  if (base64.length > LIMITE_BASE64) {
    throw new ImagemInvalida("A imagem ficou grande demais. Selecione uma foto menor.");
  }
  return "data:image/" + tipo + ";base64," + base64;
}

export async function prepararImagem(uri: string): Promise<string> {
  if (/^https?:\/\//i.test(uri)) return uri;
  if (Platform.OS !== "web") {
    const dados = uri.match(/^data:image\/[^;]+;base64,(.+)$/i)?.[1];
    if (dados) return validarImagemBase64(dados);
    const arquivo = new File(uri);
    if (arquivo.size > 180_000) {
      throw new ImagemInvalida("A imagem ficou grande demais. Selecione uma foto menor.");
    }
    return validarImagemBase64(await arquivo.base64());
  }

  const imagem = new window.Image();
  imagem.src = uri;
  try {
    await imagem.decode();
  } catch {
    throw new ImagemInvalida("Não foi possível abrir a imagem. Selecione um arquivo JPG ou PNG.");
  }
  const escala = Math.min(1, 640 / Math.max(imagem.naturalWidth, imagem.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imagem.naturalWidth * escala));
  canvas.height = Math.max(1, Math.round(imagem.naturalHeight * escala));
  const contexto = canvas.getContext("2d");
  if (!contexto) throw new ImagemInvalida("Este navegador não conseguiu preparar a imagem.");
  contexto.fillStyle = "#fff";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  for (const qualidade of [0.75, 0.5, 0.3]) {
    const url = canvas.toDataURL("image/jpeg", qualidade);
    if (url.startsWith("data:image/jpeg;base64,") && url.length <= LIMITE_BASE64) return url;
  }
  throw new ImagemInvalida("A imagem ficou grande demais. Selecione uma foto menor.");
}

