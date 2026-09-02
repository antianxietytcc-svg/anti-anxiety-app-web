/**
 * Firestore helpers compartilhados entre paciente e doutor.
 *
 * Estrutura:
 *   pacientes/{sanitizedEmail}                      → { nome, email, senha, sonSelecionado, secretosDesbloqueados }
 *   pacientes/{id}/emergencia/{msgId}               → { texto, autor, hora, timestamp }
 *   doutores/{sanitizedEmail}                       → { nome, email, crm, senha }
 *   chats/{chatId}                                  → { doutorEmail, pacienteEmail, doutorNome, pacienteNome, ultimaMensagem, ultimaHora }
 *   chats/{chatId}/mensagens/{msgId}                → { texto, autorEmail, autorNome, hora, timestamp }
 *
 * chatId = `${sanitize(doutorEmail)}__${sanitize(pacienteEmail)}`
 */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
export interface PacienteFirestore {
  nome: string;
  email: string;
  senha: string;
  sonSelecionado: string;
  secretosDesbloqueados: boolean;
}

export interface DoutorFirestore {
  nome: string;
  email: string;
  crm: string;
  senha: string;
}

export interface ChatFirestore {
  chatId: string;
  doutorEmail: string;
  doutorNome: string;
  pacienteEmail: string;
  pacienteNome: string;
  ultimaMensagem?: string;
  ultimaHora?: string;
}

export interface MensagemFirestore {
  id: string;
  texto: string;
  autorEmail: string;
  autorNome: string;
  hora: string;
  timestamp: number;
}

export interface MensagemEmergenciaFirestore {
  id: string;
  texto: string;
  autor: "usuario" | "terapeuta";
  hora: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function sanitizeId(s: string) {
  return s.trim().toLowerCase().replace(/[@.]/g, "_");
}

export function makeChatId(doutorEmail: string, pacienteEmail: string) {
  return `${sanitizeId(doutorEmail)}__${sanitizeId(pacienteEmail)}`;
}

function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Pacientes
// ---------------------------------------------------------------------------
export async function cadastrarPaciente(
  nome: string,
  email: string,
  senha: string
): Promise<{ sucesso: boolean; paciente?: PacienteFirestore; erro?: string }> {
  const nomeTrimado = nome.trim();
  const emailNorm = email.trim().toLowerCase();

  if (!nomeTrimado) return { sucesso: false, erro: "O nome é obrigatório." };
  if (!emailNorm.includes("@")) return { sucesso: false, erro: "Email inválido." };
  if (senha.length < 6) return { sucesso: false, erro: "A senha deve ter pelo menos 6 caracteres." };

  const id = sanitizeId(emailNorm);
  const ref = doc(db, "pacientes", id);
  const snap = await getDoc(ref);
  if (snap.exists()) return { sucesso: false, erro: "Este email já está cadastrado." };

  const paciente: PacienteFirestore = {
    nome: nomeTrimado,
    email: emailNorm,
    senha,
    sonSelecionado: "Default",
    secretosDesbloqueados: false,
  };
  await setDoc(ref, paciente);
  return { sucesso: true, paciente };
}

export async function loginPaciente(
  email: string,
  senha: string
): Promise<{ sucesso: boolean; paciente?: PacienteFirestore; erro?: string }> {
  const id = sanitizeId(email);
  const ref = doc(db, "pacientes", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { sucesso: false, erro: "Email ou senha incorretos." };
  const paciente = snap.data() as PacienteFirestore;
  if (paciente.senha !== senha) return { sucesso: false, erro: "Email ou senha incorretos." };
  return { sucesso: true, paciente };
}

export async function getPaciente(
  email: string
): Promise<PacienteFirestore | null> {
  const snap = await getDoc(doc(db, "pacientes", sanitizeId(email)));
  return snap.exists() ? (snap.data() as PacienteFirestore) : null;
}

export async function atualizarPaciente(
  email: string,
  campos: Partial<Omit<PacienteFirestore, "email">>
): Promise<void> {
  await setDoc(doc(db, "pacientes", sanitizeId(email)), campos, { merge: true });
}

export async function listarPacientes(): Promise<{ email: string; nome: string }[]> {
  const snap = await getDocs(collection(db, "pacientes"));
  return snap.docs.map((d) => {
    const p = d.data() as PacienteFirestore;
    return { email: p.email, nome: p.nome };
  });
}

// ---------------------------------------------------------------------------
// Mensagens de emergência (por paciente)
// ---------------------------------------------------------------------------
export async function listarMensagensEmergencia(
  pacienteEmail: string
): Promise<MensagemEmergenciaFirestore[]> {
  const ref = collection(db, "pacientes", sanitizeId(pacienteEmail), "emergencia");
  const q = query(ref, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MensagemEmergenciaFirestore, "id">) }));
}

export async function adicionarMensagemEmergenciaFS(
  pacienteEmail: string,
  texto: string,
  autor: "usuario" | "terapeuta"
): Promise<MensagemEmergenciaFirestore> {
  const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const hora = horaAgora();
  const msg: Omit<MensagemEmergenciaFirestore, "id"> = {
    texto,
    autor,
    hora,
    timestamp: Date.now(),
  };
  await setDoc(
    doc(db, "pacientes", sanitizeId(pacienteEmail), "emergencia", id),
    msg
  );
  return { id, ...msg };
}

export async function limparEmergenciaFS(pacienteEmail: string): Promise<void> {
  const ref = collection(db, "pacientes", sanitizeId(pacienteEmail), "emergencia");
  const snap = await getDocs(ref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// ---------------------------------------------------------------------------
// Doutores
// ---------------------------------------------------------------------------
export async function cadastrarDoutor(
  nome: string,
  email: string,
  crm: string,
  senha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const id = sanitizeId(email);
  const ref = doc(db, "doutores", id);
  const snap = await getDoc(ref);
  if (snap.exists()) return { sucesso: false, erro: "Este email já está cadastrado." };
  await setDoc(ref, { nome: nome.trim(), email: email.trim().toLowerCase(), crm: crm.trim(), senha });
  return { sucesso: true };
}

export async function loginDoutor(
  email: string,
  senha: string
): Promise<{ sucesso: boolean; doutor?: DoutorFirestore; erro?: string }> {
  const id = sanitizeId(email);
  const ref = doc(db, "doutores", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { sucesso: false, erro: "Email ou senha incorretos." };
  const doutor = snap.data() as DoutorFirestore;
  if (doutor.senha !== senha) return { sucesso: false, erro: "Email ou senha incorretos." };
  return { sucesso: true, doutor };
}

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------
export async function garantirChat(
  doutorEmail: string,
  doutorNome: string,
  pacienteEmail: string,
  pacienteNome: string
): Promise<string> {
  const chatId = makeChatId(doutorEmail, pacienteEmail);
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { chatId, doutorEmail, doutorNome, pacienteEmail, pacienteNome });
  }
  return chatId;
}

export async function listarChatsPaciente(pacienteEmail: string): Promise<ChatFirestore[]> {
  const norm = sanitizeId(pacienteEmail);
  const snap = await getDocs(collection(db, "chats"));
  return snap.docs
    .map((d) => d.data() as ChatFirestore)
    .filter((c) => sanitizeId(c.pacienteEmail) === norm);
}

export async function listarChatsDoutor(doutorEmail: string): Promise<ChatFirestore[]> {
  const norm = sanitizeId(doutorEmail);
  const snap = await getDocs(collection(db, "chats"));
  return snap.docs
    .map((d) => d.data() as ChatFirestore)
    .filter((c) => sanitizeId(c.doutorEmail) === norm);
}

export async function enviarMensagem(
  chatId: string,
  texto: string,
  autorEmail: string,
  autorNome: string
): Promise<void> {
  const msgId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await setDoc(doc(db, "chats", chatId, "mensagens", msgId), {
    texto,
    autorEmail,
    autorNome,
    hora: horaAgora(),
    timestamp: Date.now(),
  });
  await setDoc(
    doc(db, "chats", chatId),
    { ultimaMensagem: texto, ultimaHora: horaAgora() },
    { merge: true }
  );
}

export function ouvirMensagens(
  chatId: string,
  callback: (msgs: MensagemFirestore[]) => void
): Unsubscribe {
  const ref = collection(db, "chats", chatId, "mensagens");
  const q = query(ref, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const msgs: MensagemFirestore[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MensagemFirestore, "id">),
    }));
    callback(msgs);
  });
}
