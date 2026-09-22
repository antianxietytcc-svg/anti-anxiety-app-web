/**
 * Firestore helpers compartilhados entre paciente e psicólogo.
 *
 * Estrutura das coleções:
 *   usuarios/{uid}                              → perfil completo do usuário (paciente ou psicólogo)
 *   usuarios/{uid}/emergencia/{msgId}           → mensagens de emergência
 *   chats/{chatId}                              → metadados da conversa
 *   chats/{chatId}/mensagens/{msgId}            → mensagens em tempo real
 *   posts/{postId}                              → publicações da rede de apoio
 *   posts/{postId}/comentarios/{comentId}       → comentários de publicações
 *   agendamentos/{agId}                         → agendamentos entre paciente e psicólogo
 *   avaliacoes/{avalId}                         → avaliações de psicólogos
 *   notas/{uid}/{notaId}                        → notas do psicólogo (planilha)
 *   presenca/{uid}                              → status online dos usuários
 *
 * chatId = `${sanitize(psicoEmail)}__${sanitize(pacienteEmail)}`
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
  updateDoc,
  where,
  serverTimestamp,
  type Unsubscribe,
  limit,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { db, auth } from "./firebase";
import type { TipoConta } from "../types";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------
export interface PerfilFirestore {
  uid: string;
  nome: string;
  email: string;
  tipo_conta: TipoConta;
  foto_url?: string;
  crm?: string;          // apenas para psicólogos
  especialidade?: string;
  descricao?: string;
  disponivel?: boolean;
  // privacidade
  ocultar_perfil?: boolean;
  ocultar_foto?: boolean;
  ocultar_nome?: boolean;
  restringir_mensagens?: boolean;
  // preferências
  sonSelecionado?: string;
  secretosDesbloqueados?: boolean;
  // avaliações (psicólogos)
  media_avaliacao?: number;
  qtd_avaliacoes?: number;
  data_cadastro?: string;
}

// Compatibilidade retroativa para código que usa PacienteFirestore
export type PacienteFirestore = PerfilFirestore;
export type DoutorFirestore = PerfilFirestore & { crm: string };

export interface ChatFirestore {
  chatId: string;
  psicoEmail: string;
  psicoNome: string;
  pacienteEmail: string;
  pacienteNome: string;
  ultimaMensagem?: string;
  ultimaHora?: string;
  // retrocompat
  doutorEmail?: string;
  doutorNome?: string;
}

export type TipoMensagem = "texto" | "imagem" | "audio" | "video";

export interface MensagemFirestore {
  id: string;
  texto: string;
  tipo: TipoMensagem;
  media_url?: string;
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

export interface PostFirestore {
  id: string;
  titulo: string;
  conteudo: string;
  autorId: string;
  autorNome: string;
  autorTipo: TipoConta;
  imagem_url?: string;
  qtd_comentarios: number;
  timestamp: number;
  data_publicacao: string;
}

export interface ComentarioFirestore {
  id: string;
  conteudo: string;
  autorId: string;
  autorNome: string;
  timestamp: number;
  data_comentario: string;
}

export interface AgendamentoFirestore {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  psicoId: string;
  psicoNome: string;
  data: string;
  horario: string;
  status: "pendente" | "confirmado" | "cancelado" | "concluído";
  timestamp: number;
}

export interface AvaliacaoFirestore {
  id: string;
  psicoId: string;
  pacienteId: string;
  pacienteNome: string;
  estrelas: number;
  comentario?: string;
  timestamp: number;
}

export interface NotaFirestore {
  id: string;
  titulo: string;
  conteudo: string;
  pos_x: number;
  pos_y: number;
  cor: string;
  conexoes: string[];
  timestamp: number;
  atualizado: number;
}

export interface PresencaFirestore {
  online: boolean;
  ultimaVez: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function sanitizeId(s: string): string {
  return s.trim().toLowerCase().replace(/[@.]/g, "_");
}

export function makeChatId(psicoEmail: string, pacienteEmail: string): string {
  return `${sanitizeId(psicoEmail)}__${sanitizeId(pacienteEmail)}`;
}

function horaAgora(): string {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function gerarId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Firebase Auth — Cadastro
// ---------------------------------------------------------------------------
export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
  tipo_conta: TipoConta,
  extras: { crm?: string; especialidade?: string; descricao?: string } = {}
): Promise<{ sucesso: boolean; perfil?: PerfilFirestore; erro?: string }> {
  const nomeTrimado = nome.trim();
  const emailNorm = email.trim().toLowerCase();

  if (!nomeTrimado) return { sucesso: false, erro: "O nome é obrigatório." };
  if (!emailNorm.includes("@")) return { sucesso: false, erro: "Email inválido." };
  if (senha.length < 6) return { sucesso: false, erro: "A senha deve ter pelo menos 6 caracteres." };
  if (tipo_conta === "psicologo" && !extras.crm?.trim()) {
    return { sucesso: false, erro: "O CRM/CFP é obrigatório para psicólogos." };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, emailNorm, senha);
    const uid = cred.user.uid;

    const perfil: PerfilFirestore = {
      uid,
      nome: nomeTrimado,
      email: emailNorm,
      tipo_conta,
      foto_url: "",
      ocultar_perfil: false,
      ocultar_foto: false,
      ocultar_nome: false,
      restringir_mensagens: false,
      sonSelecionado: "Default",
      secretosDesbloqueados: false,
      data_cadastro: new Date().toISOString(),
      ...(tipo_conta === "psicologo" ? {
        crm: extras.crm?.trim() ?? "",
        especialidade: extras.especialidade?.trim() ?? "",
        descricao: extras.descricao?.trim() ?? "",
        disponivel: true,
        media_avaliacao: 0,
        qtd_avaliacoes: 0,
      } : {}),
    };

    await setDoc(doc(db, "usuarios", uid), perfil);
    return { sucesso: true, perfil };
  } catch (e: any) {
    if (e?.code === "auth/email-already-in-use") {
      return { sucesso: false, erro: "Este email já está cadastrado." };
    }
    return { sucesso: false, erro: e?.message ?? "Erro ao cadastrar." };
  }
}

// ---------------------------------------------------------------------------
// Firebase Auth — Login
// ---------------------------------------------------------------------------
export async function loginUsuario(
  email: string,
  senha: string
): Promise<{ sucesso: boolean; perfil?: PerfilFirestore; erro?: string }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    const uid = cred.user.uid;
    const snap = await getDoc(doc(db, "usuarios", uid));
    if (!snap.exists()) return { sucesso: false, erro: "Perfil não encontrado." };
    const perfil = snap.data() as PerfilFirestore;
    return { sucesso: true, perfil };
  } catch (e: any) {
    if (e?.code === "auth/invalid-credential" || e?.code === "auth/wrong-password" || e?.code === "auth/user-not-found") {
      return { sucesso: false, erro: "Email ou senha incorretos." };
    }
    return { sucesso: false, erro: e?.message ?? "Erro ao entrar." };
  }
}

// ---------------------------------------------------------------------------
// Retrocompat: loginPaciente / loginDoutor / cadastrarPaciente / cadastrarDoutor
// Mantidos para não quebrar código existente que ainda usa esses nomes.
// ---------------------------------------------------------------------------
export async function cadastrarPaciente(
  nome: string, email: string, senha: string
): Promise<{ sucesso: boolean; paciente?: PerfilFirestore; erro?: string }> {
  const r = await cadastrarUsuario(nome, email, senha, "paciente");
  return { sucesso: r.sucesso, paciente: r.perfil, erro: r.erro };
}

export async function loginPaciente(
  email: string, senha: string
): Promise<{ sucesso: boolean; paciente?: PerfilFirestore; erro?: string }> {
  const r = await loginUsuario(email, senha);
  return { sucesso: r.sucesso, paciente: r.perfil, erro: r.erro };
}

export async function cadastrarDoutor(
  nome: string, email: string, crm: string, senha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const r = await cadastrarUsuario(nome, email, senha, "psicologo", { crm });
  return { sucesso: r.sucesso, erro: r.erro };
}

export async function loginDoutor(
  email: string, senha: string
): Promise<{ sucesso: boolean; doutor?: DoutorFirestore; erro?: string }> {
  const r = await loginUsuario(email, senha);
  if (r.sucesso && r.perfil?.tipo_conta !== "psicologo") {
    return { sucesso: false, erro: "Esta conta não é de psicólogo." };
  }
  return { sucesso: r.sucesso, doutor: r.perfil as DoutorFirestore, erro: r.erro };
}

// ---------------------------------------------------------------------------
// Firebase Auth — Redefinir Senha
// ---------------------------------------------------------------------------
export async function enviarRedefinicaoSenha(
  email: string
): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { sucesso: true };
  } catch (e: any) {
    if (e?.code === "auth/user-not-found") {
      return { sucesso: false, erro: "Não encontramos uma conta com este email." };
    }
    return { sucesso: false, erro: e?.message ?? "Erro ao enviar email." };
  }
}

// ---------------------------------------------------------------------------
// Firebase Auth — Alterar Senha
// ---------------------------------------------------------------------------
export async function alterarSenha(
  senhaAtual: string,
  novaSenha: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const user = auth.currentUser;
  if (!user?.email) return { sucesso: false, erro: "Usuário não autenticado." };
  try {
    const cred = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, novaSenha);
    return { sucesso: true };
  } catch (e: any) {
    if (e?.code === "auth/wrong-password") {
      return { sucesso: false, erro: "Senha atual incorreta." };
    }
    return { sucesso: false, erro: e?.message ?? "Erro ao alterar senha." };
  }
}

// ---------------------------------------------------------------------------
// Firebase Auth — Alterar Email
// ---------------------------------------------------------------------------
export async function alterarEmail(
  senhaAtual: string,
  novoEmail: string
): Promise<{ sucesso: boolean; erro?: string }> {
  const user = auth.currentUser;
  if (!user?.email) return { sucesso: false, erro: "Usuário não autenticado." };
  try {
    const cred = EmailAuthProvider.credential(user.email, senhaAtual);
    await reauthenticateWithCredential(user, cred);
    await updateEmail(user, novoEmail.trim().toLowerCase());
    // atualiza no Firestore também
    const snap = await getDoc(doc(db, "usuarios", user.uid));
    if (snap.exists()) {
      await updateDoc(doc(db, "usuarios", user.uid), { email: novoEmail.trim().toLowerCase() });
    }
    return { sucesso: true };
  } catch (e: any) {
    if (e?.code === "auth/wrong-password") {
      return { sucesso: false, erro: "Senha atual incorreta." };
    }
    if (e?.code === "auth/email-already-in-use") {
      return { sucesso: false, erro: "Este email já está em uso." };
    }
    return { sucesso: false, erro: e?.message ?? "Erro ao alterar email." };
  }
}

// ---------------------------------------------------------------------------
// Perfil / Usuários
// ---------------------------------------------------------------------------
export async function getPerfil(uid: string): Promise<PerfilFirestore | null> {
  const snap = await getDoc(doc(db, "usuarios", uid));
  return snap.exists() ? (snap.data() as PerfilFirestore) : null;
}

// Retrocompat
export async function getPaciente(email: string): Promise<PerfilFirestore | null> {
  // Tenta buscar pelo uid do auth atual (que tem o email)
  const user = auth.currentUser;
  if (user && user.email === email.trim().toLowerCase()) {
    return getPerfil(user.uid);
  }
  // Fallback: busca por email na coleção
  const snap = await getDocs(query(collection(db, "usuarios"), where("email", "==", email.trim().toLowerCase()), limit(1)));
  if (snap.empty) return null;
  return snap.docs[0].data() as PerfilFirestore;
}

export async function atualizarPerfil(
  uid: string,
  campos: Partial<Omit<PerfilFirestore, "uid" | "email">>
): Promise<void> {
  await updateDoc(doc(db, "usuarios", uid), campos as any);
}

// Retrocompat
export async function atualizarPaciente(
  email: string,
  campos: Partial<Omit<PerfilFirestore, "uid" | "email">>
): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    await atualizarPerfil(user.uid, campos);
  }
}

export async function listarPacientes(): Promise<{ uid: string; email: string; nome: string }[]> {
  const snap = await getDocs(query(collection(db, "usuarios"), where("tipo_conta", "==", "paciente")));
  return snap.docs.map((d) => {
    const p = d.data() as PerfilFirestore;
    return { uid: p.uid, email: p.email, nome: p.nome };
  });
}

export async function listarPsicologos(): Promise<PerfilFirestore[]> {
  const snap = await getDocs(query(collection(db, "usuarios"), where("tipo_conta", "==", "psicologo")));
  return snap.docs.map((d) => d.data() as PerfilFirestore);
}

export async function buscarUsuariosPorNome(
  termoBusca: string
): Promise<{ uid: string; email: string; nome: string; tipo_conta: TipoConta }[]> {
  // Firestore não suporta LIKE, então buscamos todos e filtramos
  const snap = await getDocs(collection(db, "usuarios"));
  const termo = termoBusca.toLowerCase();
  return snap.docs
    .map((d) => d.data() as PerfilFirestore)
    .filter((p) => p.nome.toLowerCase().includes(termo) || p.email.toLowerCase().includes(termo))
    .map((p) => ({ uid: p.uid, email: p.email, nome: p.nome, tipo_conta: p.tipo_conta }));
}

// ---------------------------------------------------------------------------
// Presença (status online)
// ---------------------------------------------------------------------------
export async function setOnline(uid: string): Promise<void> {
  await setDoc(doc(db, "presenca", uid), { online: true, ultimaVez: Date.now() }, { merge: true });
}

export async function setOffline(uid: string): Promise<void> {
  await setDoc(doc(db, "presenca", uid), { online: false, ultimaVez: Date.now() }, { merge: true });
}

export function ouvirPresenca(uid: string, callback: (online: boolean) => void): Unsubscribe {
  return onSnapshot(doc(db, "presenca", uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data() as PresencaFirestore;
      callback(data.online === true);
    } else {
      callback(false);
    }
  });
}

// ---------------------------------------------------------------------------
// Mensagens de emergência (por usuário)
// ---------------------------------------------------------------------------
export async function listarMensagensEmergencia(
  uid: string
): Promise<MensagemEmergenciaFirestore[]> {
  const ref = collection(db, "usuarios", uid, "emergencia");
  const q = query(ref, orderBy("timestamp", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MensagemEmergenciaFirestore, "id">) }));
}

export async function adicionarMensagemEmergenciaFS(
  uid: string,
  texto: string,
  autor: "usuario" | "terapeuta"
): Promise<MensagemEmergenciaFirestore> {
  const id = gerarId();
  const hora = horaAgora();
  const msg: Omit<MensagemEmergenciaFirestore, "id"> = { texto, autor, hora, timestamp: Date.now() };
  await setDoc(doc(db, "usuarios", uid, "emergencia", id), msg);
  return { id, ...msg };
}

export async function limparEmergenciaFS(uid: string): Promise<void> {
  const ref = collection(db, "usuarios", uid, "emergencia");
  const snap = await getDocs(ref);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
}

// ---------------------------------------------------------------------------
// Chats
// ---------------------------------------------------------------------------
export async function garantirChat(
  psicoEmail: string,
  psicoNome: string,
  pacienteEmail: string,
  pacienteNome: string
): Promise<string> {
  const chatId = makeChatId(psicoEmail, pacienteEmail);
  const ref = doc(db, "chats", chatId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      chatId,
      psicoEmail,
      psicoNome,
      pacienteEmail,
      pacienteNome,
      // retrocompat aliases
      doutorEmail: psicoEmail,
      doutorNome: psicoNome,
    });
  }
  return chatId;
}

export async function listarChatsPaciente(pacienteEmail: string): Promise<ChatFirestore[]> {
  const norm = pacienteEmail.trim().toLowerCase();
  const snap = await getDocs(query(collection(db, "chats"), where("pacienteEmail", "==", norm)));
  return snap.docs.map((d) => d.data() as ChatFirestore);
}

export async function listarChatsDoutor(doutorEmail: string): Promise<ChatFirestore[]> {
  const norm = doutorEmail.trim().toLowerCase();
  const snap = await getDocs(query(collection(db, "chats"), where("psicoEmail", "==", norm)));
  return snap.docs.map((d) => d.data() as ChatFirestore);
}

export async function enviarMensagem(
  chatId: string,
  texto: string,
  autorEmail: string,
  autorNome: string,
  tipo: TipoMensagem = "texto",
  media_url?: string
): Promise<void> {
  const msgId = gerarId();
  const hora = horaAgora();
  await setDoc(doc(db, "chats", chatId, "mensagens", msgId), {
    texto,
    tipo,
    media_url: media_url ?? null,
    autorEmail,
    autorNome,
    hora,
    timestamp: Date.now(),
  });
  await setDoc(doc(db, "chats", chatId), { ultimaMensagem: texto, ultimaHora: hora }, { merge: true });
}

export function ouvirMensagens(
  chatId: string,
  callback: (msgs: MensagemFirestore[]) => void
): Unsubscribe {
  const ref = collection(db, "chats", chatId, "mensagens");
  const q = query(ref, orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const msgs: MensagemFirestore[] = snap.docs.map((d) => {
      const { tipo, ...rest } = d.data() as Omit<MensagemFirestore, "id">;
      return {
        id: d.id,
        tipo: (tipo ?? "texto") as TipoMensagem,
        ...rest,
      };
    });
    callback(msgs);
  });
}

// ---------------------------------------------------------------------------
// Posts (Rede de Apoio — Firestore em tempo real)
// ---------------------------------------------------------------------------
export function ouvirPosts(callback: (posts: PostFirestore[]) => void): Unsubscribe {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"), limit(50));
  return onSnapshot(q, (snap) => {
    const posts: PostFirestore[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<PostFirestore, "id">),
    }));
    callback(posts);
  });
}

export async function criarPost(
  titulo: string,
  conteudo: string,
  autorId: string,
  autorNome: string,
  autorTipo: TipoConta,
  imagem_url?: string
): Promise<PostFirestore> {
  const id = gerarId();
  const post: Omit<PostFirestore, "id"> = {
    titulo: titulo.trim(),
    conteudo: conteudo.trim(),
    autorId,
    autorNome,
    autorTipo,
    imagem_url: imagem_url ?? "",
    qtd_comentarios: 0,
    timestamp: Date.now(),
    data_publicacao: new Date().toISOString(),
  };
  await setDoc(doc(db, "posts", id), post);
  return { id, ...post };
}

export function ouvirComentariosPost(
  postId: string,
  callback: (comentarios: ComentarioFirestore[]) => void
): Unsubscribe {
  const q = query(collection(db, "posts", postId, "comentarios"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    const comentarios: ComentarioFirestore[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ComentarioFirestore, "id">),
    }));
    callback(comentarios);
  });
}

export async function adicionarComentarioPost(
  postId: string,
  conteudo: string,
  autorId: string,
  autorNome: string
): Promise<void> {
  const id = gerarId();
  await setDoc(doc(db, "posts", postId, "comentarios", id), {
    conteudo: conteudo.trim(),
    autorId,
    autorNome,
    timestamp: Date.now(),
    data_comentario: new Date().toISOString(),
  });
  // Incrementa contador
  const postRef = doc(db, "posts", postId);
  const snap = await getDoc(postRef);
  if (snap.exists()) {
    const atual = (snap.data() as PostFirestore).qtd_comentarios ?? 0;
    await updateDoc(postRef, { qtd_comentarios: atual + 1 });
  }
}

// ---------------------------------------------------------------------------
// Agendamentos
// ---------------------------------------------------------------------------
export async function criarAgendamento(
  pacienteId: string,
  pacienteNome: string,
  psicoId: string,
  psicoNome: string,
  data: string,
  horario: string
): Promise<AgendamentoFirestore> {
  const id = gerarId();
  const ag: Omit<AgendamentoFirestore, "id"> = {
    pacienteId,
    pacienteNome,
    psicoId,
    psicoNome,
    data,
    horario,
    status: "pendente",
    timestamp: Date.now(),
  };
  await setDoc(doc(db, "agendamentos", id), ag);
  return { id, ...ag };
}

export async function atualizarStatusAgendamento(
  id: string,
  status: AgendamentoFirestore["status"]
): Promise<void> {
  await updateDoc(doc(db, "agendamentos", id), { status });
}

export function ouvirAgendamentosPsicologo(
  psicoId: string,
  callback: (ags: AgendamentoFirestore[]) => void
): Unsubscribe {
  const q = query(collection(db, "agendamentos"), where("psicoId", "==", psicoId), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AgendamentoFirestore, "id">) })));
  });
}

export function ouvirAgendamentosPaciente(
  pacienteId: string,
  callback: (ags: AgendamentoFirestore[]) => void
): Unsubscribe {
  const q = query(collection(db, "agendamentos"), where("pacienteId", "==", pacienteId), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AgendamentoFirestore, "id">) })));
  });
}

// ---------------------------------------------------------------------------
// Avaliações de Psicólogos
// ---------------------------------------------------------------------------
export async function avaliarPsicologo(
  psicoId: string,
  pacienteId: string,
  pacienteNome: string,
  estrelas: number,
  comentario?: string
): Promise<{ sucesso: boolean; erro?: string }> {
  if (estrelas < 1 || estrelas > 5) return { sucesso: false, erro: "Avaliação deve ser entre 1 e 5 estrelas." };
  const id = `${psicoId}_${pacienteId}`;
  const avaliacao: Omit<AvaliacaoFirestore, "id"> = {
    psicoId,
    pacienteId,
    pacienteNome,
    estrelas,
    comentario: comentario ?? "",
    timestamp: Date.now(),
  };
  await setDoc(doc(db, "avaliacoes", id), avaliacao);

  // Recalcula média
  const snap = await getDocs(query(collection(db, "avaliacoes"), where("psicoId", "==", psicoId)));
  const todas = snap.docs.map((d) => d.data() as AvaliacaoFirestore);
  const media = todas.reduce((acc, a) => acc + a.estrelas, 0) / todas.length;
  await updateDoc(doc(db, "usuarios", psicoId), {
    media_avaliacao: Math.round(media * 10) / 10,
    qtd_avaliacoes: todas.length,
  });

  return { sucesso: true };
}

export async function listarAvaliacoes(psicoId: string): Promise<AvaliacaoFirestore[]> {
  const snap = await getDocs(query(collection(db, "avaliacoes"), where("psicoId", "==", psicoId), orderBy("timestamp", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AvaliacaoFirestore, "id">) }));
}

// ---------------------------------------------------------------------------
// Notas do Psicólogo (Planilha)
// ---------------------------------------------------------------------------
export function ouvirNotas(uid: string, callback: (notas: NotaFirestore[]) => void): Unsubscribe {
  const q = query(collection(db, "notas", uid, "itens"), orderBy("timestamp", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotaFirestore, "id">) })));
  });
}

export async function salvarNota(uid: string, nota: NotaFirestore): Promise<void> {
  const { id, ...resto } = nota;
  await setDoc(doc(db, "notas", uid, "itens", id), { ...resto, atualizado: Date.now() });
}

export async function deletarNota(uid: string, notaId: string): Promise<void> {
  await deleteDoc(doc(db, "notas", uid, "itens", notaId));
}
