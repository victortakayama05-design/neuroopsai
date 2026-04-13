export function getLocale() {
  return 'pt-BR';
}

export function setLocale(lang) {
  localStorage.setItem('neuroOpsLang', lang);
  window.location.reload();
}

export function getCurrency() {
  const lang = getLocale();
  return lang === 'en-US' ? 'USD' : 'BRL';
}

export function formatPrice(valueBRL, valueUSD) {
  const lang = getLocale();
  if (lang === 'en-US') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(valueUSD);
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valueBRL);
}

// Dicionário básico
const dict = {
  'pt-BR': {
    services: 'Serviços', platform: 'Plataforma', pricing: 'Preços', blog: 'Blog', login: 'Entrar', register: 'Começar Grátis',
    req_btn: 'Solicitar Setup', dashboard: 'Dashboard', requests: 'Solicitações', new_auto: 'Nova Automação',
    good_morning: 'Bom dia', good_afternoon: 'Boa tarde', good_evening: 'Boa noite',
    total_req: 'Total de Solicitações', in_progress: 'Em Andamento', completed: 'Concluídas', current_plan: 'Plano Atual'
  },
  'en-US': {
    services: 'Services', platform: 'Platform', pricing: 'Pricing', blog: 'Blog', login: 'Log In', register: 'Start Free',
    req_btn: 'Request Setup', dashboard: 'Dashboard', requests: 'Requests', new_auto: 'New Automation',
    good_morning: 'Good morning', good_afternoon: 'Good afternoon', good_evening: 'Good evening',
    total_req: 'Total Requests', in_progress: 'In Progress', completed: 'Completed', current_plan: 'Current Plan'
  }
};

export function t(key) {
  const lang = getLocale();
  return dict[lang]?.[key] || key;
}
