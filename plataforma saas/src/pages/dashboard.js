// Dashboard page
import { getUser, isLoggedIn, getRequests, updateUser } from '../auth.js';
import { navigateTo } from '../router.js';
import { requestStatuses } from '../data/services.js';
import { t } from '../locale.js';
import { showToast } from '../components/modal.js';
import { API_URL } from '../config.js';

export async function renderDashboard() {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:50vh;"><span class="material-symbols-rounded spin gradient-emoji" style="font-size:3rem;">sync</span></div>';

  if (!(await isLoggedIn())) {
    navigateTo('/login');
    return;
  }
  
  // Verify Stripe Return
  if (window.location.hash.includes('payment=success')) {
     const pNames = window.location.hash.split('plan_name=');
     if (pNames.length > 1) {
       const planRealName = decodeURIComponent(pNames[1].split('&')[0]);
       updateUser({ planName: planRealName, plan: planRealName.toLowerCase() });
       showToast(`Agente Hera: Pagamento via Stripe Aprovado com sucesso! Plano ${planRealName} ativo.`, 'success');
       // Limpar URL
       window.history.replaceState(null, '', window.location.pathname + '#/dashboard');
     }
  }

  const user = await getUser();
  const requests = await getRequests();

  const activeRequests = requests.filter(r => !['completed', 'cancelled'].includes(r.status));
  const completedRequests = requests.filter(r => r.status === 'completed');

  const hour = new Date().getHours();
  let greeting = t('good_morning');
  if (hour >= 12 && hour < 18) greeting = t('good_afternoon');
  else if (hour >= 18) greeting = t('good_evening');

  main.innerHTML = `
    <div class="dashboard-page">
      <div class="container">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="dashboard-greeting">
            <h1>${greeting}, <span class="text-gradient">${user.name.split(' ')[0]}</span> <span class="material-symbols-rounded gradient-emoji" style="font-size:2rem; vertical-align:middle;">waving_hand</span></h1>
            <p>Acompanhe suas automações e solicitações.</p>
          </div>
          <button class="btn btn-primary" id="dash-new-request" style="display:flex; align-items:center; gap:0.5rem;">
            <span class="material-symbols-rounded gradient-emoji">magic_button</span> ${t('new_auto')}
          </button>
        </div>

        <!-- Stats -->
        <div class="dashboard-stats">
          <div class="stats-card">
            <div class="stats-card-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:2rem;">bar_chart</span></div>
            <div class="stats-card-value">${requests.length}</div>
            <div class="stats-card-label">${t('total_req')}</div>
          </div>
          <div class="stats-card">
            <div class="stats-card-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:2rem;">published_with_changes</span></div>
            <div class="stats-card-value">${activeRequests.length}</div>
            <div class="stats-card-label">${t('in_progress')}</div>
          </div>
          <div class="stats-card">
            <div class="stats-card-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:2rem;">check_circle</span></div>
            <div class="stats-card-value">${completedRequests.length}</div>
            <div class="stats-card-label">${t('completed')}</div>
          </div>
          <div class="stats-card">
            <div class="stats-card-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:2rem;">bolt</span></div>
            <div class="stats-card-value">${user.planName || '—'}</div>
            <div class="stats-card-label">${t('current_plan')}</div>
          </div>
        </div>

        <!-- Plano Atual -->
        ${user.plan ? `
          <div class="dashboard-section">
            <div class="glass-card-static" style="background:var(--gradient-card); border-color:var(--border-default);">
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--sp-4);">
                <div>
                  <div style="display:flex; align-items:center; gap:var(--sp-3); margin-bottom:var(--sp-2);">
                    <span class="badge badge-violet">Plano Ativo</span>
                    <span class="status-dot status-dot-active"></span>
                  </div>
                  <h3 style="font-size:var(--fs-2xl);">Plano <span class="text-gradient">${user.planName}</span></h3>
                  <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-top:var(--sp-2);">
                    Seu plano está ativo e funcionando. Monitoramento 24/7 por agentes de IA.
                  </p>
                </div>
                <button class="btn btn-secondary" id="dash-manage-plan">Gerenciar Plano</button>
              </div>
            </div>
          </div>
        ` : `
          <div class="dashboard-section">
            <div class="glass-card-static" style="border-color:var(--border-default);">
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:var(--sp-4);">
                <div>
                  <h3 style="font-size:var(--fs-xl); margin-bottom:var(--sp-2);">Você ainda não tem um plano ativo</h3>
                  <p style="color:var(--text-secondary); font-size:var(--fs-sm);">
                    Escolha um plano de Managed Services para monitoramento contínuo e otimização.
                  </p>
                </div>
                <button class="btn btn-primary" id="dash-choose-plan">Ver Planos</button>
              </div>
            </div>
          </div>
        `}

        <!-- Meu Faturamento -->
        <div class="dashboard-section">
          <div class="dashboard-section-header">
            <h2>Meu Faturamento <span class="badge badge-emerald">Live Stripe</span></h2>
          </div>
          <div id="billing-history-container" style="background: rgba(255,255,255,0.02); border-radius:8px; padding:1rem; min-height: 100px;">
            <div style="text-align:center; padding:2rem; color:var(--text-tertiary);"><span class="material-symbols-rounded spin">sync</span> Buscando dados de cobrança...</div>
          </div>
        </div>

        <!-- Solicitações Recentes -->
        <div class="dashboard-section">
          <div class="dashboard-section-header">
            <h2>Solicitações Recentes</h2>
            ${requests.length > 0 ? `<button class="btn btn-ghost" id="dash-view-all">Ver todas →</button>` : ''}
          </div>

          ${requests.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:3rem;">inventory_2</span></div>
              <h3>Nenhuma solicitação ainda</h3>
              <p>Comece solicitando sua primeira automação. Nossos agentes de IA cuidarão de tudo.</p>
              <button class="btn btn-primary" id="dash-empty-cta" style="display:flex; align-items:center; gap:0.5rem; margin:0 auto;">
                <span class="material-symbols-rounded gradient-emoji">magic_button</span> Solicitar Primeira Automação
              </button>
            </div>
          ` : `
            <div class="requests-list">
              ${requests.slice(0, 5).map(req => {
                const status = requestStatuses[req.status] || requestStatuses.pending;
                return `
                  <div class="request-card" data-request-id="${req.id}">
                    <div class="request-card-header">
                      <div>
                        <div class="request-card-title">${req.title}</div>
                        <div class="request-card-meta" style="margin-top:var(--sp-2);">
                          <span class="request-card-meta-item">📅 ${new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span class="request-card-meta-item">🔧 ${req.serviceName}</span>
                        </div>
                      </div>
                      <span class="badge badge-${status.color}">
                        <span class="status-dot status-dot-${status.dot}" style="margin-right:6px;"></span>
                        ${status.label}
                      </span>
                    </div>
                    <div class="request-card-footer">
                      <div class="request-card-platform">
                        🔗 ${req.platformName}
                      </div>
                      <span style="font-size:var(--fs-sm); color:var(--text-secondary);">
                        ${req.complexityName} · ${req.price ? 'R$ ' + req.price.toLocaleString('pt-BR') : '—'}
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Quick Actions -->
        <div class="dashboard-section">
          <div class="dashboard-section-header">
            <h2>Ações Rápidas</h2>
          </div>
          <div class="grid grid-3">
            <div class="glass-card" style="cursor:pointer; text-align:center;" id="quick-new-request">
              <div style="margin-bottom:var(--sp-3);"><span class="material-symbols-rounded gradient-emoji" style="font-size:3rem;">magic_button</span></div>
              <h4>Nova Automação</h4>
              <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-top:var(--sp-2);">Solicite uma nova automação para N8N, Make ou Zapier.</p>
            </div>
            <div class="glass-card" style="cursor:pointer; text-align:center;" id="quick-whatsapp">
              <div style="margin-bottom:var(--sp-3);"><span class="material-symbols-rounded gradient-emoji" style="font-size:3rem;">forum</span></div>
              <h4>Falar com Victor</h4>
              <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-top:var(--sp-2);">Converse diretamente pelo WhatsApp.</p>
            </div>
            <div class="glass-card" style="cursor:pointer; text-align:center;" id="quick-diagnostic">
              <div style="margin-bottom:var(--sp-3);"><span class="material-symbols-rounded gradient-emoji" style="font-size:3rem;">search_insights</span></div>
              <h4>Diagnóstico Gratuito</h4>
              <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-top:var(--sp-2);">Descubra oportunidades de automação na sua empresa.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('dash-new-request')?.addEventListener('click', () => navigateTo('/new-request'));
  document.getElementById('dash-empty-cta')?.addEventListener('click', () => navigateTo('/new-request'));
  document.getElementById('dash-view-all')?.addEventListener('click', () => navigateTo('/requests'));
  document.getElementById('dash-manage-plan')?.addEventListener('click', () => navigateTo('/profile'));
  document.getElementById('dash-choose-plan')?.addEventListener('click', () => navigateTo('/pricing'));
  document.getElementById('quick-new-request')?.addEventListener('click', () => navigateTo('/new-request'));
  document.getElementById('quick-whatsapp')?.addEventListener('click', () => {
    window.open('https://wa.me/5511999999999?text=Oi%21+Preciso+de+suporte+na+NeuroOps.ai', '_blank');
  });
  document.getElementById('quick-diagnostic')?.addEventListener('click', () => {
    window.open('https://neuroopsai.online/#diagnostico', '_blank');
  });

  // Request card click
  main.querySelectorAll('[data-request-id]').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo('/requests');
    });
  });

  // Fetch Billing History
  const intentIds = requests.filter(r => r.paymentIntentId).map(r => r.paymentIntentId);
  if (intentIds.length === 0) {
     const bContainer = document.getElementById('billing-history-container');
     if (bContainer) bContainer.innerHTML = '<p style="color:var(--text-tertiary);">Nenhum transação na Stripe atrelada a este perfil.</p>';
  } else {
     fetch(`${API_URL}/api/billing-history`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intentIds })
     }).then(res => res.json()).then(data => {
         const bContainer = document.getElementById('billing-history-container');
         if (!bContainer) return;
         if (data.length === 0) {
            bContainer.innerHTML = '<p style="color:var(--text-tertiary);">Faturas não localizadas na base remota.</p>';
            return;
         }
         bContainer.innerHTML = data.map(pi => `
           <div class="glass-card-static" style="margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center; padding: 0.8rem 1rem;">
             <div>
               <div style="font-weight:700; color:var(--emerald-400);">R$ ${(pi.amount/100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
               <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">ID: ${pi.id} • ${new Date(pi.created * 1000).toLocaleString('pt-BR')}</div>
             </div>
             <div>
               <span class="badge badge-${pi.status === 'succeeded' ? 'emerald' : (pi.status === 'canceled' ? 'orange' : 'violet')}">${pi.status.toUpperCase()}</span>
             </div>
           </div>
         `).join('');
     }).catch(() => {
         const bContainer = document.getElementById('billing-history-container');
         if (bContainer) bContainer.innerHTML = '<p style="color:#ef4444;">Falha ao buscar histórico de faturas.</p>';
     });
  }
}
