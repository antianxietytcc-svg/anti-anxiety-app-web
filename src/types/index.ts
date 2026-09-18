/**
 * Tipos centralizados da aplicação Anti-Anxiety.
 * Representa os modelos de dados do sistema.
 */

// ---------------------------------------------------------------------------
// Usuário
// ---------------------------------------------------------------------------
export interface Usuario {
  id_usuario: string;
  nome: string;
  email: string;
  telefone?: string;
  data_cadastro: string;
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
export interface Mensagem {
  id_mensagem: string;
  conteudo: string;
  data_envio: string;
  id_conversa: string;
  id_usuario: string;
  nome_usuario: string;
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
// Resultado de operação
// ---------------------------------------------------------------------------
export interface ResultadoOperacao {
  sucesso: boolean;
  erro?: string;
}
