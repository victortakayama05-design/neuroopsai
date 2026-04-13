// Catálogo de serviços NeuroOps.ai
export const services = [
  {
    id: 'automacao-workflows',
    icon: '<span class="material-symbols-rounded gradient-emoji">settings</span>',
    name: 'Automação de Workflows',
    shortDesc: 'Conexão de ferramentas e automação de processos com N8N, Make, Zapier + IA.',
    fullDesc: 'Conexão de ferramentas e automação de processos repetitivos. N8N, Make, Zapier integrados com IA para workflows inteligentes que reduzem custos e aumentam velocidade.',
    platforms: ['N8N', 'Make', 'Zapier'],
  },
  {
    id: 'agentes-ia',
    icon: '<span class="material-symbols-rounded gradient-emoji">robot_2</span>',
    name: 'Agentes de IA',
    shortDesc: 'Agentes autônomos para atendimento, análise, relatórios e mais.',
    fullDesc: 'Agentes autônomos que executam tarefas complexas: atendimento, análise de dados, geração de relatórios e mais. IA que trabalha 24/7 para você.',
    platforms: ['N8N', 'Custom'],
  },
  {
    id: 'business-intelligence',
    icon: '<span class="material-symbols-rounded gradient-emoji">monitoring</span>',
    name: 'Business Intelligence',
    shortDesc: 'Dashboards inteligentes com insights automáticos e alertas em tempo real.',
    fullDesc: 'Dashboards inteligentes com insights automáticos. Análises preditivas e alertas em tempo real para tomada de decisão baseada em dados.',
    platforms: ['N8N', 'Custom'],
  },
  {
    id: 'prevencao-fraudes',
    icon: '<span class="material-symbols-rounded gradient-emoji">shield_person</span>',
    name: 'Prevenção a Fraudes',
    shortDesc: 'Detecção de fraude com IA, rules engine e modelos ML em tempo real.',
    fullDesc: 'Sistemas de detecção de fraude com IA. Modelos treinados para identificar padrões suspeitos em tempo real, protegendo sua operação.',
    platforms: ['N8N', 'Custom'],
  },
  {
    id: 'chatbots-inteligentes',
    icon: '<span class="material-symbols-rounded gradient-emoji">forum</span>',
    name: 'Chatbots Inteligentes',
    shortDesc: 'Atendimento 24/7 com IA conversacional multi-canal.',
    fullDesc: 'Atendimento 24/7 com IA conversacional. Chatbots que entendem contexto, aprendem e resolvem problemas reais em múltiplos canais.',
    platforms: ['N8N', 'Make', 'Custom'],
  },
  {
    id: 'integracao-dados',
    icon: '<span class="material-symbols-rounded gradient-emoji">folder_data</span>',
    name: 'Integração de Dados',
    shortDesc: 'ETL automatizado, data lakes e pipelines inteligentes.',
    fullDesc: 'Unificação de dados dispersos em múltiplas plataformas. ETL automatizado, data lakes e pipelines inteligentes para dados sempre acessíveis.',
    platforms: ['N8N', 'Make', 'Zapier'],
  },
];

export const platforms = [
  {
    id: 'n8n',
    name: 'N8N',
    icon: '<span class="material-symbols-rounded gradient-emoji">account_tree</span>',
    description: 'Plataforma open-source de automação com total controle e flexibilidade.',
  },
  {
    id: 'make',
    name: 'Make',
    icon: '<span class="material-symbols-rounded gradient-emoji">bolt</span>',
    description: 'Automação visual no-code com centenas de integrações prontas.',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: '<span class="material-symbols-rounded gradient-emoji">power</span>',
    description: 'A maior plataforma de integração com +6.000 apps conectados.',
  },
];

// Status possíveis de uma solicitação
export const requestStatuses = {
  pending: { label: 'Pendente', color: 'amber', dot: 'pending' },
  analysis: { label: 'Em Análise', color: 'blue', dot: 'pending' },
  development: { label: 'Em Desenvolvimento', color: 'violet', dot: 'active' },
  testing: { label: 'Em Testes', color: 'blue', dot: 'active' },
  completed: { label: 'Concluído', color: 'emerald', dot: 'active' },
  cancelled: { label: 'Cancelado', color: 'red', dot: 'error' },
  canceled: { label: 'Operação Abortada', color: 'rose', dot: 'inactive' },
  paused: { label: 'Retenção (CountDown)', color: 'orange', dot: 'inactive' },
};
