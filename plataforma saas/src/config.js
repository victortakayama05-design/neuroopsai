// Configurações Globais da Infraestrutura Cloud e Local
export const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// URL do Gateway de Pagamento e API. 
// Em localhost usa o servidor local. Em producao (Vercel) bate na API do Render.
export const API_URL = IS_PRODUCTION 
    ? 'https://neuroops-api.onrender.com' // [DRAFT URL] Você pode alterar aqui quando criar a conta no Render
    : 'http://localhost:4243';

// Export default object for structured access
export const config = {
  apiUrl: API_URL,
  isProduction: IS_PRODUCTION
};
