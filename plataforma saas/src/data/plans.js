import { getLocale, formatPrice as locFormat } from '../locale.js';

export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 497,
    priceBRL: 497,
    priceUSD: 97,
    period: '/mês',
    description: 'Ideal para quem está começando com automações e quer monitoramento básico.',
    features: [
      'Até 5 workflows monitorados',
      'Alertas automáticos',
      'Relatório mensal de performance',
      'Suporte via email',
      'Resposta em até 48h',
    ],
    featured: false,
    badge: null,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 1497,
    priceBRL: 1497,
    priceUSD: 297,
    period: '/mês',
    description: 'Para empresas em crescimento que precisam de otimização contínua.',
    features: [
      'Até 20 workflows monitorados',
      'Otimização mensal de workflows',
      '2h de suporte mensal com Victor',
      'Relatório semanal de performance',
      'Prioridade no atendimento',
      'Sugestões de automação com IA',
    ],
    featured: false,
    badge: null,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 3997,
    priceBRL: 3997,
    priceUSD: 697,
    period: '/mês',
    description: 'Para operações maduras que exigem otimização contínua e novos workflows.',
    features: [
      'Workflows ilimitados',
      'Otimização semanal de workflows',
      '4h de suporte mensal com Victor',
      'Novos workflows inclusos',
      'Relatório diário de performance',
      'Monitoramento 24/7 com agente IA',
      'Dashboard personalizado',
    ],
    featured: true,
    badge: 'Mais Popular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 7997,
    priceBRL: 7997,
    priceUSD: 1497,
    period: '/mês',
    description: 'Para grandes operações com necessidades específicas e SLA garantido.',
    features: [
      'Tudo do plano Scale',
      'Advisory mensal estratégico',
      'SLA de 4 horas para incidentes',
      'Agentes de IA dedicados',
      'Suporte prioritário 24/7',
      'Integrações personalizadas',
      'Treinamento da equipe',
      'Account manager dedicado',
    ],
    featured: false,
    badge: null,
  },
];

// Níveis de complexidade para projetos avulsos
export const complexityLevels = [
  {
    id: 'basico',
    name: 'Básico',
    price: 3997,
    priceBRL: 3997,
    priceUSD: 697,
    description: 'Automações simples com até 5 integrações. Prazo: 1-2 semanas.',
    features: ['Até 5 integrações', 'Fluxo linear simples', 'Documentação básica', '1 rodada de revisão'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9997,
    priceBRL: 9997,
    priceUSD: 1697,
    description: 'Automações intermediárias com lógica condicional. Prazo: 2-4 semanas.',
    features: ['Até 15 integrações', 'Lógica condicional avançada', 'Tratamento de erros', '3 rodadas de revisão', 'Documentação completa'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 25000,
    priceBRL: 25000,
    priceUSD: 4500,
    description: 'Automações complexas sob medida com múltiplos agentes. Prazo: 4-8 semanas.',
    features: ['Integrações ilimitadas', 'Múltiplos agentes de IA', 'Arquitetura personalizada', 'Revisões ilimitadas', 'Treinamento incluso', 'Suporte à implantação'],
  },
];

export function getPlanPrice(planInfo) {
  return locFormat(planInfo.priceBRL, planInfo.priceUSD);
}

export function formatPrice(price) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
