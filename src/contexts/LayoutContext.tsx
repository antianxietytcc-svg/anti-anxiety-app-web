import { createContext, useEffect, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import {
  cadastrarPaciente,
  loginPaciente,
  getPaciente,
  atualizarPaciente,
  adicionarMensagemEmergenciaFS,
  listarMensagensEmergencia,
  limparEmergenciaFS,
  type PacienteFirestore,
  type MensagemEmergenciaFirestore,
} from "../lib/firestore";

// ---------------------------------------------------------------------------
// localStorage — apenas para sessão e preferências locais
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
// Re-export do tipo de mensagem de emergência com o mesmo nome que o resto do
// app usa (para não quebrar ModalChatEmergencia etc.)
// ---------------------------------------------------------------------------
export type MensagemEmergencia = MensagemEmergenciaFirestore;
export type { PacienteFirestore as Usuario };

// ---------------------------------------------------------------------------
// Types
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

interface LayoutContextType {
  // auth
  usuarioLogado: PacienteFirestore | null;
  estaCarregando: boolean;
  login: (email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<{ sucesso: boolean; erro?: string }>;
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
  adicionarMensagemEmergencia: (texto: string) => Promise<void>;
  limparMensagensEmergencia: () => Promise<void>;
  // sons
  sonSelecionado: NomeSom;
  setSonSelecionado: (som: NomeSom) => void;
  secretosDesbloqueados: boolean;
  desbloquearSecretos: () => void;
}

// ---------------------------------------------------------------------------
// Storage keys (apenas sessão e preferências locais)
// ---------------------------------------------------------------------------
const KEY_SESSAO = "aa_sessao";
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
  logout: () => {},
  emailUsuario: "",
  nomeUsuario: "",
  setEmailUsuario: () => {},
  setNomeUsuario: () => {},
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
  const [usuarioLogado, setUsuarioLogado] = useState<PacienteFirestore | null>(null);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [mensagensEmergencia, setMensagensEmergencia] = useState<MensagemEmergencia[]>([]);

  // Preferências locais (não faz sentido sincronizar entre browsers)
  const [sonSelecionado, setSonSelecionadoState] = useState<NomeSom>("Default");
  const [secretosDesbloqueados, setSecretosDesbloqueados] = useState(false);

  // Restore session on mount
  useEffect(() => {
    async function restaurar() {
      // Preferências locais
      const somSalvo = storage.get(KEY_SOM) as NomeSom | null;
      if (somSalvo) setSonSelecionadoState(somSalvo);
      if (storage.get(KEY_SECRETOS) === "true") setSecretosDesbloqueados(true);

      // Sessão de paciente
      const emailSessao = storage.get(KEY_SESSAO);
      if (emailSessao) {
        try {
          const paciente = await getPaciente(emailSessao);
          if (paciente) {
            setUsuarioLogado(paciente);
            const msgs = await listarMensagensEmergencia(emailSessao);
            setMensagensEmergencia(msgs);
          } else {
            // usuário removido do Firestore — limpa sessão
            storage.remove(KEY_SESSAO);
          }
        } catch {
          // Firebase ainda não configurado ou sem rede — não trava o app
        }
      }

      setEstaCarregando(false);
    }
    restaurar();
  }, []);

  // ---------------------------------------------------------------------------
  async function login(
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    const res = await loginPaciente(email, senha);
    if (!res.sucesso || !res.paciente) return { sucesso: false, erro: res.erro };
    setUsuarioLogado(res.paciente);
    storage.set(KEY_SESSAO, res.paciente.email);
    // carrega mensagens de emergência do Firebase
    const msgs = await listarMensagensEmergencia(res.paciente.email);
    setMensagensEmergencia(msgs);
    return { sucesso: true };
  }

  async function cadastrar(
    nome: string,
    email: string,
    senha: string
  ): Promise<{ sucesso: boolean; erro?: string }> {
    const res = await cadastrarPaciente(nome, email, senha);
    if (!res.sucesso || !res.paciente) return { sucesso: false, erro: res.erro };
    setUsuarioLogado(res.paciente);
    storage.set(KEY_SESSAO, res.paciente.email);
    setMensagensEmergencia([]);
    return { sucesso: true };
  }

  function logout() {
    setUsuarioLogado(null);
    setMensagensEmergencia([]);
    storage.remove(KEY_SESSAO);
  }

  // ---------------------------------------------------------------------------
  async function adicionarMensagemEmergencia(texto: string): Promise<void> {
    if (!usuarioLogado) return;
    const nova = await adicionarMensagemEmergenciaFS(usuarioLogado.email, texto, "usuario");
    setMensagensEmergencia((prev) => [...prev, nova]);
  }

  async function limparMensagensEmergencia(): Promise<void> {
    if (!usuarioLogado) return;
    await limparEmergenciaFS(usuarioLogado.email);
    setMensagensEmergencia([]);
  }

  // ---------------------------------------------------------------------------
  function setSonSelecionado(som: NomeSom) {
    setSonSelecionadoState(som);
    storage.set(KEY_SOM, som);
    // persiste no perfil do Firestore também, sem bloquear a UI
    if (usuarioLogado) {
      atualizarPaciente(usuarioLogado.email, { sonSelecionado: som }).catch(() => {});
    }
  }

  function desbloquearSecretos() {
    setSecretosDesbloqueados(true);
    storage.set(KEY_SECRETOS, "true");
    if (usuarioLogado) {
      atualizarPaciente(usuarioLogado.email, { secretosDesbloqueados: true }).catch(() => {});
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
