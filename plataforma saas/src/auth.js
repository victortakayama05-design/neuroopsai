// Auth state management with localStorage
// Will be replaced with Supabase in production

const AUTH_KEY = 'neuroops_auth';
const USERS_KEY = 'neuroops_users';

// Sample demo requests
function createDemoRequests(userId) {
  return [
    {
      id: 'req_001',
      userId,
      service: 'automacao-workflows',
      serviceName: 'Automação de Workflows',
      complexity: 'pro',
      complexityName: 'Pro',
      platform: 'n8n',
      platformName: 'N8N',
      title: 'Automação de Onboarding de Clientes',
      description: 'Criar workflow completo de onboarding automatizado com verificação de identidade, envio de documentos e aprovação via agentes de IA.',
      status: 'development',
      createdAt: '2026-04-05T14:30:00Z',
      updatedAt: '2026-04-08T10:15:00Z',
      price: 9997,
    },
    {
      id: 'req_002',
      userId,
      service: 'chatbots-inteligentes',
      serviceName: 'Chatbots Inteligentes',
      complexity: 'basico',
      complexityName: 'Básico',
      platform: 'n8n',
      platformName: 'N8N',
      title: 'Chatbot de Suporte WhatsApp',
      description: 'Chatbot inteligente para atendimento 24/7 no WhatsApp com integração ao CRM da empresa.',
      status: 'completed',
      createdAt: '2026-03-20T09:00:00Z',
      updatedAt: '2026-04-03T16:45:00Z',
      price: 3997,
    },
    {
      id: 'req_003',
      userId,
      service: 'business-intelligence',
      serviceName: 'Business Intelligence',
      complexity: 'basico',
      complexityName: 'Básico',
      platform: 'n8n',
      platformName: 'N8N',
      title: 'Dashboard de Vendas em Tempo Real',
      description: 'Dashboard inteligente com métricas de vendas, alertas automáticos e relatório diário.',
      status: 'pending',
      createdAt: '2026-04-10T08:30:00Z',
      updatedAt: '2026-04-10T08:30:00Z',
      price: 3997,
    },
  ];
}

export function initAuth() {
  // Initialize empty users list if not exists
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
}

export function getUser() {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  try {
    return JSON.parse(authData);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getUser();
}

export function login(email, password) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userData } = user;
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    return { success: true, user: userData };
  }
  return { success: false, error: 'Email ou senha incorretos.' };
}

export function register({ name, email, password, company, phone }) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

  if (users.find(u => u.email === email)) {
    return { success: false, error: 'Este email já está cadastrado.' };
  }

  const newUser = {
    id: 'user_' + Date.now(),
    name,
    email,
    password,
    company: company || '',
    phone: phone || '',
    plan: null,
    planName: null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  const { password: _, ...userData } = newUser;
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));

  return { success: true, user: userData };
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function updateUser(updates) {
  const user = getUser();
  if (!user) return false;

  const updatedUser = { ...user, ...updates };
  localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));

  // Also update in users list
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  return true;
}

// Request management
export function getRequests() {
  const user = getUser();
  if (!user) return [];
  const key = `neuroops_requests_${user.id}`;
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function addRequest(request, paymentIntentId) {
  const user = getUser();
  if (!user) return null;
  const key = `neuroops_requests_${user.id}`;
  const requests = getRequests();
  const newRequest = {
    id: 'req_' + Date.now(),
    userId: user.id,
    ...request,
    paymentIntentId,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  requests.unshift(newRequest);
  localStorage.setItem(key, JSON.stringify(requests));
  return newRequest;
}

export function getRequestById(id) {
  const requests = getRequests();
  return requests.find(r => r.id === id) || null;
}

export function updateRequest(id, updates) {
  const user = getUser();
  if (!user) return false;
  const key = `neuroops_requests_${user.id}`;
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx !== -1) {
    requests[idx] = { ...requests[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(requests));
    return true;
  }
  return false;
}
