/**
 * Tipos centralizados da aplicação Anti-Anxiety.
 * Representa os modelos de dados do sistema.
 */

// ---------------------------------------------------------------------------
// Tipo de conta
// ---------------------------------------------------------------------------
export type TipoConta = "paciente" | "psicologo";

// ---------------------------------------------------------------------------
// Usuário (perfil completo)
// ---------------------------------------------------------------------------
export interface Usuario {
  id_usuario: string;
  nome: string;
  email: string;
  telefone?: string;
  data_cadastro: string;
  tipo_conta: TipoConta;
  foto_url?: string;
  // privacidade
  ocultar_perfil?: boolean;
  ocultar_foto?: boolean;
  ocultar_nome?: boolean;
  restringir_mensagens?: boolean;
  // preferências
  sonSelecionado?: string;
  secretosDesbloqueados?: boolean;
}

// ---------------------------------------------------------------------------
// Psicólogo
// ---------------------------------------------------------------------------
export interface Psicologo {
  id_psicologo: string;
  nome: string;
  email: string;
  telefone?: string;
  registro_profissional: string;
  descricao: string;
  foto?: string;
  disponivel: boolean;
  especialidade: string;
  // avaliações
  media_avaliacao?: number;
  qtd_avaliacoes?: number;
}

// ---------------------------------------------------------------------------
// Avaliação de psicólogo
// ---------------------------------------------------------------------------
export interface Avaliacao {
  id_avaliacao: string;
  id_psicologo: string;
  id_usuario: string;
  nome_usuario: string;
  estrelas: number; // 1-5
  comentario?: string;
  data_avaliacao: string;
}

// ---------------------------------------------------------------------------
// Contato de Emergência
// ---------------------------------------------------------------------------
export type TipoRelacao =
  | "mãe"
  | "pai"
  | "amigo"
  | "irmão"
  | "responsável"
  | "cônjuge"
  | "outro";

export interface ContatoEmergencia {
  id_contato: string;
  nome: string;
  telefone: string;
  tipo_relacao: TipoRelacao;
  id_usuario: string;
}

// ---------------------------------------------------------------------------
// Publicação (Rede de Apoio)
// ---------------------------------------------------------------------------
export interface Publicacao {
  id_publicacao: string;
  titulo: string;
  conteudo: string;
  data_publicacao: string;
  id_usuario: string;
  nome_usuario: string;
  qtd_comentarios: number;
  imagem_url?: string;   // suporte a imagem opcional
  tipo_autor?: TipoConta;
}

// ---------------------------------------------------------------------------
// Comentário
// ---------------------------------------------------------------------------
export interface Comentario {
  id_comentario: string;
  conteudo: string;
  data_comentario: string;
  id_usuario: string;
  nome_usuario: string;
  id_publicacao: string;
}

// ---------------------------------------------------------------------------
// Conversa
// ---------------------------------------------------------------------------
export interface Conversa {
  id_conversa: string;
  data_criacao: string;
  participantes: string[]; // lista de id_usuario
  ultima_mensagem?: string;
  ultima_hora?: string;
}

// ---------------------------------------------------------------------------
// Mensagem
// ---------------------------------------------------------------------------
export type TipoMensagem = "texto" | "imagem" | "audio" | "video";

export interface Mensagem {
  id_mensagem: string;
  conteudo: string;
  tipo: TipoMensagem;
  data_envio: string;
  id_conversa: string;
  id_usuario: string;
  nome_usuario: string;
  media_url?: string;
}

// ---------------------------------------------------------------------------
// Agendamento
// ---------------------------------------------------------------------------
export type StatusAgendamento =
  | "pendente"
  | "confirmado"
  | "cancelado"
  | "concluído";

export interface Agendamento {
  id_agendamento: string;
  data_agendamento: string;
  horario: string;
  status: StatusAgendamento;
  id_usuario: string;
  id_psicologo: string;
  nome_psicologo?: string;
  nome_usuario?: string;
}

// ---------------------------------------------------------------------------
// Nota (planilha do psicólogo)
// ---------------------------------------------------------------------------
export interface NotaPsicologo {
  id_nota: string;
  titulo: string;
  conteudo: string;  // texto rico (markdown simples)
  posicao_x: number;
  posicao_y: number;
  cor?: string;
  id_psicologo: string;
  data_criacao: string;
  data_atualizacao: string;
  // conexões para mapa mental
  conexoes?: string[]; // ids de outras notas
}

// ---------------------------------------------------------------------------
// Resultado de operação
// ---------------------------------------------------------------------------
export interface ResultadoOperacao {
  sucesso: boolean;
  erro?: string;
}
