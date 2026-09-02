import { createContext, useEffect, useState, type ReactNode } from "react";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// localStorage helpers (web-only; no-op on native)
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
// Types
// ---------------------------------------------------------------------------
export interface Usuario {
  nome: string;
  email: string;
  senha: string; // stored locally for demo — never do this in production
}

export interface MensagemEmergencia {
  id: string;
  texto: string;
  autor: "usuario" | "terapeuta";
  hora: string;
}

interface LayoutContextType {
  // auth
  usuarioLogado: Usuario | null;
  estaCarregando: boolean;
  login: (email: string, senha: string) => { sucesso: boolean; erro?: string };
  cadastrar: (nome: string, email: string, senha: string) => { sucesso: boolean; erro?: string };
  logout: () => void;
  // compat aliases
  emailUsuario: string;
  nomeUsuario: string;
  setEmailUsuario: (email: string) => void;
  setNomeUsuario: (nome: string) => void;
  // layout
  menuAberto: boolean;
  setMenuAberto: (aberto: boolean) => void;
  // emergency chat
  mensagensEmergencia: MensagemEmergencia[];
  adicionarMensagemEmergencia: (texto: string) => void;
  limparMensagensEmergencia: () => void;
}

// ---------------------------------------------------------------------------
// Storage keys
// ---------------------------------------------------------------------------
const KEY_USUARIOS = "aa_usuarios";
const KEY_SESSAO = "aa_sessao";
const KEY_MSGS = "aa_msgs_emergencia";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const LayoutContext = createContext<LayoutContextType>({
  usuarioLogado: null,
  estaCarregando: true,
  login: () => ({ sucesso: false }),
  cadastrar: () => ({ sucesso: false }),
  logout: () => {},
  emailUsuario: "",
  nomeUsuario: "",
  setEmailUsuario: () => {},
  setNomeUsuario: () => {},
  menuAberto: false,
  setMenuAberto: () => {},
  mensagensEmergencia: [],
  adicionarMensagemEmergencia: () => {},
  limparMensagensEmergencia: () => {},
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function lerUsuarios(): Usuario[] {
  try {
    const raw = storage.get(KEY_USUARIOS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarUsuarios(lista: Usuario[]) {
  storage.set(KEY_USUARIOS, JSON.stringify(lista));
}

function lerMensagens(): MensagemEmergencia[] {
  try {
    const raw = storage.get(KEY_MSGS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarMensagens(msgs: MensagemEmergencia[]) {
  storage.set(KEY_MSGS, JSON.stringify(msgs));
}

function horaAgora() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagensEmergencia, setMensagensEmergencia] = useState<MensagemEmergencia[]>([]);

  // Restore session on mount
  useEffect(() => {
    const emailSessao = storage.get(KEY_SESSAO);
    if (emailSessao) {
      const usuarios = lerUsuarios();
      const encontrado = usuarios.find((u) => u.email === emailSessao) ?? null;
      setUsuarioLogado(encontrado);
    }
    setMensagensEmergencia(lerMensagens());
    setEstaCarregando(false);
  }, []);

  // ---------------------------------------------------------------------------
  function login(email: string, senha: string): { sucesso: boolean; erro?: string } {
    const normalizado = email.trim().toLowerCase();
    const usuarios = lerUsuarios();
    const usuario = usuarios.find(
      (u) => u.email === normalizado && u.senha === senha
    );
    if (!usuario) return { sucesso: false, erro: "Email ou senha incorretos." };
    setUsuarioLogado(usuario);
    storage.set(KEY_SESSAO, normalizado);
    return { sucesso: true };
  }

  function cadastrar(
    nome: string,
    email: string,
    senha: string
  ): { sucesso: boolean; erro?: string } {
    const normalizado = email.trim().toLowerCase();
    const nomeTrimado = nome.trim();
    if (!nomeTrimado) return { sucesso: false, erro: "O nome é obrigatório." };
    if (!normalizado.includes("@")) return { sucesso: false, erro: "Email inválido." };
    if (senha.length < 6) return { sucesso: false, erro: "A senha deve ter pelo menos 6 caracteres." };

    const usuarios = lerUsuarios();
    if (usuarios.find((u) => u.email === normalizado)) {
      return { sucesso: false, erro: "Este email já está cadastrado." };
    }

    const novoUsuario: Usuario = { nome: nomeTrimado, email: normalizado, senha };
    salvarUsuarios([...usuarios, novoUsuario]);
    setUsuarioLogado(novoUsuario);
    storage.set(KEY_SESSAO, normalizado);
    return { sucesso: true };
  }

  function logout() {
    setUsuarioLogado(null);
    storage.remove(KEY_SESSAO);
  }

  // ---------------------------------------------------------------------------
  function adicionarMensagemEmergencia(texto: string) {
    setMensagensEmergencia((prev) => {
      const nova: MensagemEmergencia = {
        id: String(Date.now()),
        texto,
        autor: "usuario",
        hora: horaAgora(),
      };
      const atualizadas = [...prev, nova];
      salvarMensagens(atualizadas);
      return atualizadas;
    });
  }

  function limparMensagensEmergencia() {
    setMensagensEmergencia([]);
    storage.remove(KEY_MSGS);
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
        // compat
        emailUsuario: usuarioLogado?.email ?? "",
        nomeUsuario: usuarioLogado?.nome ?? "",
        setEmailUsuario: () => {},
        setNomeUsuario: () => {},
        menuAberto,
        setMenuAberto,
        mensagensEmergencia,
        adicionarMensagemEmergencia,
        limparMensagensEmergencia,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
