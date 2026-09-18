/**
 * Serviço de publicações da rede de apoio.
 * Utiliza dados mockados e localStorage.
 * Preparado para futura integração com Firestore.
 */

import { Platform } from "react-native";
import type { Publicacao, Comentario } from "../types";
import { PUBLICACOES_MOCK, COMENTARIOS_MOCK } from "./mockData";

const KEY_PUBLICACOES = "aa_publicacoes";
const KEY_COMENTARIOS = "aa_comentarios";

const storage = {
  get: (key: string): string | null => {
    if (Platform.OS !== "web") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string) => {
    if (Platform.OS !== "web") return;
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
};

function lerPublicacoes(): Publicacao[] {
  const raw = storage.get(KEY_PUBLICACOES);
  if (!raw) return [...PUBLICACOES_MOCK];
  try {
    return JSON.parse(raw);
  } catch {
    return [...PUBLICACOES_MOCK];
  }
}

function lerComentarios(): Comentario[] {
  const raw = storage.get(KEY_COMENTARIOS);
  if (!raw) return [...COMENTARIOS_MOCK];
  try {
    return JSON.parse(raw);
  } catch {
    return [...COMENTARIOS_MOCK];
  }
}

export async function listarPublicacoes(): Promise<Publicacao[]> {
  return lerPublicacoes().sort(
    (a, b) =>
      new Date(b.data_publicacao).getTime() -
      new Date(a.data_publicacao).getTime()
  );
}

export async function adicionarPublicacao(
  titulo: string,
  conteudo: string,
  idUsuario: string,
  nomeUsuario: string
): Promise<Publicacao> {
  const todas = lerPublicacoes();
  const nova: Publicacao = {
    id_publicacao: `pub-${Date.now()}`,
    titulo: titulo.trim(),
    conteudo: conteudo.trim(),
    data_publicacao: new Date().toISOString(),
    id_usuario: idUsuario,
    nome_usuario: nomeUsuario,
    qtd_comentarios: 0,
  };
  todas.unshift(nova);
  storage.set(KEY_PUBLICACOES, JSON.stringify(todas));
  return nova;
}

export async function listarComentarios(
  idPublicacao: string
): Promise<Comentario[]> {
  return lerComentarios()
    .filter((c) => c.id_publicacao === idPublicacao)
    .sort(
      (a, b) =>
        new Date(a.data_comentario).getTime() -
        new Date(b.data_comentario).getTime()
    );
}

export async function adicionarComentario(
  idPublicacao: string,
  conteudo: string,
  idUsuario: string,
  nomeUsuario: string
): Promise<Comentario> {
  const todos = lerComentarios();
  const novo: Comentario = {
    id_comentario: `com-${Date.now()}`,
    conteudo: conteudo.trim(),
    data_comentario: new Date().toISOString(),
    id_usuario: idUsuario,
    nome_usuario: nomeUsuario,
    id_publicacao: idPublicacao,
  };
  todos.push(novo);
  storage.set(KEY_COMENTARIOS, JSON.stringify(todos));

  // Atualiza contador na publicação
  const pubs = lerPublicacoes();
  const idx = pubs.findIndex((p) => p.id_publicacao === idPublicacao);
  if (idx !== -1) {
    pubs[idx].qtd_comentarios += 1;
    storage.set(KEY_PUBLICACOES, JSON.stringify(pubs));
  }

  return novo;
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------
export function validarPublicacao(
  titulo: string,
  conteudo: string
): { valido: boolean; erro?: string } {
  if (!titulo.trim()) return { valido: false, erro: "O título é obrigatório." };
  if (titulo.trim().length > 100)
    return { valido: false, erro: "O título deve ter no máximo 100 caracteres." };
  if (!conteudo.trim())
    return { valido: false, erro: "O conteúdo é obrigatório." };
  if (conteudo.trim().length > 1000)
    return {
      valido: false,
      erro: "O conteúdo deve ter no máximo 1000 caracteres.",
    };
  return { valido: true };
}
