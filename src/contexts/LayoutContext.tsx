import { createContext, useEffect, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  getPerfil,
  atualizarPerfil,
  adicionarMensagemEmergenciaFS,
  listarMensagensEmergencia,
  limparEmergenciaFS,
  loginUsuario,
  cadastrarUsuario,
  setOnline,
  setOffline,
  type PerfilFirestore,
  type MensagemEmergenciaFirestore,
} from "../lib/firestore";
import type { TipoConta } from "../types";

// ---------------------------------------------------------------------------
// localStorage — apenas para preferências locais
// ---------------------------------------------------------------------------
const storage = {
  get: (key: string): string | null => {
    if (Platform.OS !== "web") return null;
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, value: string) => {
    if (Platform.OS !== "web") return;
    try { localStorage.setItem(key, value); } catch {}
  },
  remove: (key: string) => {
    if (Platform.OS !== "web") return;
    try { localStorage.removeItem(key); } catch {}
  },
};

// ---------------------------------------------------------------------------
// Re-export de tipos para compatibilidade
// ---------------------------------------------------------------------------
export type MensagemEmergencia = MensagemEmergenciaFirestore;
export type { PerfilFirestore as Usuario };

// ---------------------------------------------------------------------------
// Types de sons
// ---------------------------------------------------------------------------
export type NomeSom =
  | "Default"
  | "Minecraft"
  | "Splash"
  | "Secret"
  | "Secret2"
  | "Secret3"
  | "Secret4"
  | "Secret5"
  | "Secret6"
  | "Secret7"
  | "Secret8"
  | "Secret9";

export const SONS_PUBLICOS: { id: NomeSom; label: string }[] = [
  { id: "Default", label: "Padrão" },
  { id: "Minecraft", label: "Minecraft" },
  { id: "Splash", label: "Splash" },
];

export const SONS_SECRETOS: { id: NomeSom; label: string }[] = [
  { id: "Secret", label: "Secreto 1" },
  { id: "Secret2", label: "Secreto 2" },
  { id: "Secret3", label: "Secreto 3" },
  { id: "Secret4", label: "Secreto 4" },
  { id: "Secret5", label: "Secreto 5" },
  { id: "Secret6", label: "Secreto 6" },
  { id: "Secret7", label: "Secreto 7" },
  { id: "Secret8", label: "Secreto 8" },
  { id: "Secret9", label: "Secreto 9" },
];

// ---------------------------------------------------------------------------
// Context Type
// ---------------------------------------------------------------------------
interface LayoutContextType {
  // auth
  usuarioLogado: PerfilFirestore | null;
  estaCarregando: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  cadastrar: (
    nome: string,
    email: string,
    senha: string,
    tipoConta: TipoConta,
    extras?: { crm?: string; especialidade?: string }
  ) => Promise<{ sucesso: boolean; erro?: string }>;
  logout: () => Promise<void>;
  // compat aliases
  emailUsuario: string;
  nomeUsuario: string;
  setEmailUsuario: (email: string) => void;
  setNomeUsuario: (nome: string) => void;
  // perfil
  atualizarPerfilLocal: (campos: Partial<Omit<PerfilFirestore, "uid" | "email">>) => Promise<void>;
  // layout
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
  // emergency chat
  mensagensEmergencia: MensagemEmergencia[];
  adicionarMensagemEmergencia: (texto: string) => Promise<void>;
  limparMensagensEmergencia: () => Promise<void>;
  // sons
  sonSelecionado: NomeSom;
  setSonSelecionado: (som: NomeSom) => void;
  secretosDesbloqueados: boolean;
  desbloquearSecretos: () => void;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const KEY_SOM = "aa_som_selecionado";
const KEY_SECRETOS = "aa_secretos_desbloqueados";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const LayoutContext = createContext<LayoutContextType>({
  usuarioLogado: null,
  estaCarregando: true,
  login: async () => ({ sucesso: false }),
  cadastrar: async () => ({ sucesso: false }),
  logout: async () => {},
  emailUsuario: "",
  nomeUsuario: "",
  setEmailUsuario: () => {},
  setNomeUsuario: () => {},
  atualizarPerfilLocal: async () => {},
  menuAberto: false,
  setMenuAberto: () => {},
  mensagensEmergencia: [],
  adicionarMensagemEmergencia: async () => {},
  limparMensagensEmergencia: async () => {},
  sonSelecionado: "Default",
  setSonSelecionado: () => {},
  secretosDesbloqueados: false,
  desbloquearSecretos: () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<PerfilFirestore | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagensEmergencia, setMensagensEmergencia] = useState<MensagemEmergencia[]>([]);

  const [sonSelecionado, setSonSelecionadoState] = useState<NomeSom>("Default");
  const [secretosDesbloqueados, setSecretosDesbloqueados] = useState(false);

  // Restaurar preferências locais
  useEffect(() => {
    const somSalvo = storage.get(KEY_SOM) as NomeSom | null;
    if (somSalvo) setSonSelecionadoState(somSalvo);
    if (storage.get(KEY_SECRETOS) === "true") setSecretosDesbloqueados(true);
  }, []);

  // Escuta o estado de autenticação do Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const perfil = await getPerfil(user.uid);
          if (perfil) {
            setUsuarioLogado(perfil);
            // Carrega mensagens de emergência
            const msgs = await listarMensagensEmergencia(user.uid);
            setMensagensEmergencia(msgs);
            // Marca como online
            setOnline(user.uid).catch(() => {});
          } else {
            setUsuarioLogado(null);
          }
        } catch {
          setUsuarioLogado(null);
        }
      } else {
        setUsuarioLogado(null);
        setMensagensEmergencia([]);
      }
      setEstaCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------------------------------
 async function login(
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    const res = await loginUsuario(email, senha);
    if (!res.sucesso) return { sucesso: false, erro: res.erro };
    
    // O useEffect com onAuthStateChanged já cuida de carregar o perfil e marcar online!
    return { sucesso: true };
  }

  async function cadastrar(
    nome: string,
    email: string,
    senha: string,
    tipoConta: TipoConta = "paciente",
    extras: { crm?: string; especialidade?: string } = {}
  ): Promise<{ sucesso: boolean; erro?: string }> {
    const res = await cadastrarUsuario(nome, email, senha, tipoConta, extras);
    if (!res.sucesso || !res.perfil) return { sucesso: false, erro: res.erro };
    setUsuarioLogado(res.perfil);
    setMensagensEmergencia([]);
    setOnline(res.perfil.uid).catch(() => {});
    return { sucesso: true };
  }

  async function logout(): Promise<void> {
    if (usuarioLogado) {
      setOffline(usuarioLogado.uid).catch(() => {});
    }
    await signOut(auth);
    setUsuarioLogado(null);
    setMensagensEmergencia([]);
  }

  // ---------------------------------------------------------------------------
  async function atualizarPerfilLocal(
    campos: Partial<Omit<PerfilFirestore, "uid" | "email">>
  ): Promise<void> {
    if (!usuarioLogado) return;
    await atualizarPerfil(usuarioLogado.uid, campos);
    setUsuarioLogado((prev) => prev ? { ...prev, ...campos } : prev);
  }

  // ---------------------------------------------------------------------------
  async function adicionarMensagemEmergencia(texto: string): Promise<void> {
    if (!usuarioLogado) return;
    const nova = await adicionarMensagemEmergenciaFS(usuarioLogado.uid, texto, "usuario");
    setMensagensEmergencia((prev) => [...prev, nova]);
  }

  async function limparMensagensEmergencia(): Promise<void> {
    if (!usuarioLogado) return;
    await limparEmergenciaFS(usuarioLogado.uid);
    setMensagensEmergencia([]);
  }

  // ---------------------------------------------------------------------------
  function setSonSelecionado(som: NomeSom) {
    setSonSelecionadoState(som);
    storage.set(KEY_SOM, som);
    if (usuarioLogado) {
      atualizarPerfil(usuarioLogado.uid, { sonSelecionado: som }).catch(() => {});
    }
  }

  function desbloquearSecretos() {
    setSecretosDesbloqueados(true);
    storage.set(KEY_SECRETOS, "true");
    if (usuarioLogado) {
      atualizarPerfil(usuarioLogado.uid, { secretosDesbloqueados: true }).catch(() => {});
    }
  }

  // ---------------------------------------------------------------------------
  return (
    <LayoutContext.Provider
      value={{
        usuarioLogado,
        estaCarregando,
        login,
        cadastrar,
        logout,
        emailUsuario: usuarioLogado?.email ?? "",
        nomeUsuario: usuarioLogado?.nome ?? "",
        setEmailUsuario: () => {},
        setNomeUsuario: () => {},
        atualizarPerfilLocal,
        menuAberto,
        setMenuAberto,
        mensagensEmergencia,
        adicionarMensagemEmergencia,
        limparMensagensEmergencia,
        sonSelecionado,
        setSonSelecionado,
        secretosDesbloqueados,
        desbloquearSecretos,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
