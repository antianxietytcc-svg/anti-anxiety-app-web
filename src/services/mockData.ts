/**
 * Dados mockados para desenvolvimento e demonstração.
 * ATENÇÃO: Estes dados são fictícios e apenas para fins de prototipagem.
 * Nenhum profissional listado é real.
 */

import type {
  Psicologo,
  Publicacao,
  Comentario,
  ContatoEmergencia,
  Agendamento,
} from "../types";

// ---------------------------------------------------------------------------
// Psicólogos (dados demonstrativos — não são profissionais reais)
// ---------------------------------------------------------------------------
export const PSICOLOGOS_MOCK: Psicologo[] = [
  {
    id_psicologo: "psi-001",
    nome: "Dra. Ana Lima",
    email: "ana.lima@exemplo.com",
    telefone: "(11) 99999-0001",
    registro_profissional: "CRP 06/000001",
    descricao:
      "Especialista em Terapia Cognitivo-Comportamental com foco em transtornos de ansiedade e ataques de pânico.",
    disponivel: true,
    especialidade: "Terapia Cognitivo-Comportamental",
  },
  {
    id_psicologo: "psi-002",
    nome: "Dr. Carlos Mendes",
    email: "carlos.mendes@exemplo.com",
    telefone: "(11) 99999-0002",
    registro_profissional: "CRP 06/000002",
    descricao:
      "Psicólogo clínico com experiência em ansiedade, depressão e desenvolvimento pessoal.",
    disponivel: true,
    especialidade: "Psicologia Clínica",
  },
  {
    id_psicologo: "psi-003",
    nome: "Dra. Fernanda Rocha",
    email: "fernanda.rocha@exemplo.com",
    telefone: "(11) 99999-0003",
    registro_profissional: "CRP 06/000003",
    descricao:
      "Especialista em mindfulness e técnicas de relaxamento para manejo do estresse.",
    disponivel: false,
    especialidade: "Mindfulness e Meditação",
  },
  {
    id_psicologo: "psi-004",
    nome: "Dr. Rafael Alves",
    email: "rafael.alves@exemplo.com",
    telefone: "(11) 99999-0004",
    registro_profissional: "CRP 06/000004",
    descricao:
      "Terapeuta integrativo com abordagem humanista. Atende adolescentes e adultos.",
    disponivel: true,
    especialidade: "Terapia Integrativa",
  },
];

// Horários disponíveis para agendamento (mock)
export const HORARIOS_DISPONIVEIS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

// ---------------------------------------------------------------------------
// Publicações da rede de apoio (mock)
// ---------------------------------------------------------------------------
export const PUBLICACOES_MOCK: Publicacao[] = [
  {
    id_publicacao: "pub-001",
    titulo: "Minha primeira semana sem crises",
    conteudo:
      "Depois de meses lutando, consegui passar uma semana inteira sem nenhuma crise de pânico. A técnica de respiração 4-7-8 foi fundamental. Compartilhando para quem também estiver buscando caminhos.",
    data_publicacao: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-001",
    nome_usuario: "Camila Rodrigues",
    qtd_comentarios: 3,
  },
  {
    id_publicacao: "pub-002",
    titulo: "Caminhadas como recurso de apoio",
    conteudo:
      "Comecei a caminhar todos os dias pela manhã. Não é milagre, mas percebo que meu nível de ansiedade diminuiu bastante. O contato com a natureza ajuda muito na minha rotina.",
    data_publicacao: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-002",
    nome_usuario: "Lucas Ferreira",
    qtd_comentarios: 1,
  },
  {
    id_publicacao: "pub-003",
    titulo: "Terapia mudou minha perspectiva",
    conteudo:
      "Relutei muito em procurar ajuda profissional, mas foi a melhor decisão da minha vida. Após 6 meses de acompanhamento, consigo identificar gatilhos que antes passavam despercebidos.",
    data_publicacao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-003",
    nome_usuario: "Beatriz Souza",
    qtd_comentarios: 5,
  },
  {
    id_publicacao: "pub-004",
    titulo: "Escrever ajuda a externalizar",
    conteudo:
      "Comecei a escrever um diário dos meus sentimentos. Ver os pensamentos no papel me ajuda a perceber que muitos medos são amplificados pela ansiedade. Recomendo experimentar.",
    data_publicacao: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-004",
    nome_usuario: "Rafael Santos",
    qtd_comentarios: 2,
  },
];

// ---------------------------------------------------------------------------
// Comentários mock
// ---------------------------------------------------------------------------
export const COMENTARIOS_MOCK: Comentario[] = [
  {
    id_comentario: "com-001",
    conteudo: "Muito inspirador! Estou tentando usar essa técnica também.",
    data_comentario: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-002",
    nome_usuario: "Lucas Ferreira",
    id_publicacao: "pub-001",
  },
  {
    id_comentario: "com-002",
    conteudo: "Que conquista! Parabéns pela persistência.",
    data_comentario: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    id_usuario: "u-003",
    nome_usuario: "Beatriz Souza",
    id_publicacao: "pub-001",
  },
  {
    id_comentario: "com-003",
    conteudo: "Concordo completamente. A caminhada ajuda muito a regular o humor.",
    data_comentario: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-001",
    nome_usuario: "Camila Rodrigues",
    id_publicacao: "pub-002",
  },
  {
    id_comentario: "com-004",
    conteudo: "Também demorei a buscar ajuda. Que bom que você deu esse passo!",
    data_comentario: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-004",
    nome_usuario: "Rafael Santos",
    id_publicacao: "pub-003",
  },
  {
    id_comentario: "com-005",
    conteudo: "O diário mudou muito minha relação com os pensamentos ansiosos.",
    data_comentario: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    id_usuario: "u-003",
    nome_usuario: "Beatriz Souza",
    id_publicacao: "pub-004",
  },
];

// ---------------------------------------------------------------------------
// Contatos de emergência mock (para o usuário demo)
// ---------------------------------------------------------------------------
export const CONTATOS_EMERGENCIA_MOCK: ContatoEmergencia[] = [
  {
    id_contato: "cont-001",
    nome: "Contato Exemplo",
    telefone: "(11) 99000-0001",
    tipo_relacao: "outro",
    id_usuario: "demo",
  },
];

// ---------------------------------------------------------------------------
// Agendamentos mock
// ---------------------------------------------------------------------------
export const AGENDAMENTOS_MOCK: Agendamento[] = [
  {
    id_agendamento: "ag-001",
    data_agendamento: "2025-08-10",
    horario: "10:00",
    status: "confirmado",
    id_usuario: "demo",
    id_psicologo: "psi-001",
    nome_psicologo: "Dra. Ana Lima",
    nome_usuario: "Usuário Demo",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatarData(isoString: string): string {
  const data = new Date(isoString);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias === 1) return "ontem";
  return `${diffDias} dias atrás`;
}
