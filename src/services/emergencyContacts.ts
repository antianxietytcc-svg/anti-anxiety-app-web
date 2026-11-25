import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { ContatoEmergencia, TipoRelacao } from "../types";

function contatosDoUsuario(uid: string) {
  return collection(db, "usuarios", uid, "contatos");
}

export async function listarContatos(uid: string): Promise<ContatoEmergencia[]> {
  const resultado = await getDocs(contatosDoUsuario(uid));
  return resultado.docs.map((registro) => ({
    ...registro.data() as Pick<ContatoEmergencia, "nome" | "telefone" | "tipo_relacao">,
    id_contato: registro.id,
    id_usuario: uid,
  }));
}

export async function adicionarContato(contato: Omit<ContatoEmergencia, "id_contato">): Promise<ContatoEmergencia> {
  const { id_usuario, ...campos } = contato;
  const referencia = doc(contatosDoUsuario(id_usuario));
  await setDoc(referencia, campos);
  return { ...contato, id_contato: referencia.id };
}

export async function atualizarContato(uid: string, id: string, campos: Pick<ContatoEmergencia, "nome" | "telefone" | "tipo_relacao">) {
  await updateDoc(doc(contatosDoUsuario(uid), id), campos);
}

export async function removerContato(uid: string, id: string) {
  await deleteDoc(doc(contatosDoUsuario(uid), id));
}


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
  if (!numeroWhatsAppBrasil(telefone))
    return { valido: false, erro: "Informe um telefone válido com DDD." };
  return { valido: true };
}

export function numeroWhatsAppBrasil(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return /^55\d{10,11}$/.test(digitos) ? digitos : null;
}
