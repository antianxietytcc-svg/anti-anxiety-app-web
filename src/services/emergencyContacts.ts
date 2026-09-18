/**
 * Serviço de contatos de emergência.
 * Utiliza AsyncStorage para persistência local (mobile) ou localStorage (web).
 * Preparado para futura integração com Firestore.
 */

import { Platform } from "react-native";
import type { ContatoEmergencia, TipoRelacao } from "../types";
import { CONTATOS_EMERGENCIA_MOCK } from "./mockData";

const STORAGE_KEY = "aa_contatos_emergencia";

// ---------------------------------------------------------------------------
// Camada de storage compatível com web e mobile
// ---------------------------------------------------------------------------
const storage = {
  get: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    // Para mobile nativo, retorna os dados mock pois AsyncStorage não está
    // instalado — preparado para futura integração
    return null;
  },
  set: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch {}
    }
  },
};

// ---------------------------------------------------------------------------
// CRUD de contatos
// ---------------------------------------------------------------------------
export async function listarContatos(
  idUsuario: string
): Promise<ContatoEmergencia[]> {
  const raw = await storage.get(STORAGE_KEY);
  if (!raw) return CONTATOS_EMERGENCIA_MOCK.filter((c) => c.id_usuario === idUsuario);
  try {
    const todos: ContatoEmergencia[] = JSON.parse(raw);
    const filtrados = todos.filter((c) => c.id_usuario === idUsuario);
    return filtrados;
  } catch {
    return [];
  }
}

export async function adicionarContato(
  contato: Omit<ContatoEmergencia, "id_contato">
): Promise<ContatoEmergencia> {
  const raw = await storage.get(STORAGE_KEY);
  const todos: ContatoEmergencia[] = raw ? JSON.parse(raw) : [];
  const novo: ContatoEmergencia = {
    ...contato,
    id_contato: `cont-${Date.now()}`,
  };
  todos.push(novo);
  await storage.set(STORAGE_KEY, JSON.stringify(todos));
  return novo;
}

export async function atualizarContato(
  idContato: string,
  campos: Partial<Omit<ContatoEmergencia, "id_contato">>
): Promise<void> {
  const raw = await storage.get(STORAGE_KEY);
  const todos: ContatoEmergencia[] = raw ? JSON.parse(raw) : [];
  const idx = todos.findIndex((c) => c.id_contato === idContato);
  if (idx !== -1) {
    todos[idx] = { ...todos[idx], ...campos };
    await storage.set(STORAGE_KEY, JSON.stringify(todos));
  }
}

export async function removerContato(idContato: string): Promise<void> {
  const raw = await storage.get(STORAGE_KEY);
  const todos: ContatoEmergencia[] = raw ? JSON.parse(raw) : [];
  const filtrados = todos.filter((c) => c.id_contato !== idContato);
  await storage.set(STORAGE_KEY, JSON.stringify(filtrados));
}

// ---------------------------------------------------------------------------
// Tipos de relação disponíveis
// ---------------------------------------------------------------------------
export const TIPOS_RELACAO: { label: string; value: TipoRelacao }[] = [
  { label: "Mãe", value: "mãe" },
  { label: "Pai", value: "pai" },
  { label: "Irmão/Irmã", value: "irmão" },
  { label: "Cônjuge/Parceiro(a)", value: "cônjuge" },
  { label: "Amigo(a)", value: "amigo" },
  { label: "Responsável", value: "responsável" },
  { label: "Outro", value: "outro" },
];

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------
export function validarContato(
  nome: string,
  telefone: string
): { valido: boolean; erro?: string } {
  if (!nome.trim()) return { valido: false, erro: "O nome é obrigatório." };
  if (!telefone.trim()) return { valido: false, erro: "O telefone é obrigatório." };
  const somenteNumeros = telefone.replace(/\D/g, "");
  if (somenteNumeros.length < 10)
    return { valido: false, erro: "Informe um telefone válido com DDD." };
  return { valido: true };
}
