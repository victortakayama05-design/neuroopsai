// Requests list page
import { isLoggedIn, getRequests } from '../auth.js';
import { navigateTo } from '../router.js';
import { requestStatuses } from '../data/services.js';

let activeFilter = 'all';

export function renderRequests() {
  if (!isLoggedIn()) {
    navigateTo('/login');
    return;
  }

  const main = document.getElementById('main-content');
  const requests = getRequests();

  const filteredRequests = activeFilter === 'all'
    ? requests
    : requests.filter(r => r.status === activeFilter);

  const statusCounts = {};
  requests.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  main.innerHTML = `
    <div class="requests-page">
      <div class="container">
        <div class="requests-page-header">
          <div>
            <h1 style="font-size:var(--fs-3xl); margin-bottom:var(--sp-2);">Minhas <span class="text-gradient">Solicitações</span></h1>
            <p style="color:var(--text-secondary);">Acompanhe o status de todas as suas automações.</p>
          </div>
          <button class="btn btn-primary" id="req-new-btn" style="display:flex; align-items:center; gap:0.5rem;">
            <span class="material-symbols-rounded gradient-emoji">magic_button</span> Nova Automação
          </button>
        </div>

        <!-- Filters -->
        <div class="requests-filters">
          <button class="requests-filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            Todas (${requests.length})
          </button>
          <button class="requests-filter-btn ${activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
            Pendentes (${statusCounts.pending || 0})
          </button>
          <button class="requests-filter-btn ${activeFilter === 'analysis' ? 'active' : ''}" data-filter="analysis">
            Em Análise (${statusCounts.analysis || 0})
          </button>
          <button class="requests-filter-btn ${activeFilter === 'development' ? 'active' : ''}" data-filter="development">
            Em Desenvolvimento (${statusCounts.development || 0})
          </button>
          <button class="requests-filter-btn ${activeFilter === 'testing' ? 'active' : ''}" data-filter="testing">
            Em Testes (${statusCounts.testing || 0})
          </button>
          <button class="requests-filter-btn ${activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
            Concluídas (${statusCounts.completed || 0})
          </button>
        </div>

        <!-- Requests list -->
        ${filteredRequests.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon"><span class="material-symbols-rounded gradient-emoji" style="font-size:3rem;">inventory_2</span></div>
            <h3>${activeFilter === 'all' ? 'Nenhuma solicitação ainda' : 'Nenhuma solicitação neste status'}</h3>
            <p>${activeFilter === 'all' ? 'Solicite sua primeira automação e nossos agentes de IA cuidarão de tudo.' : 'Tente selecionar outro filtro.'}</p>
            ${activeFilter === 'all' ? `
              <button class="btn btn-primary" id="req-empty-cta" style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
                <span class="material-symbols-rounded gradient-emoji">magic_button</span> Solicitar Primeira Automação
              </button>
            ` : ''}
          </div>
        ` : `
          <div class="requests-list">
            ${filteredRequests.map(req => {
              const status = requestStatuses[req.status] || requestStatuses.pending;
              return `
                <div class="request-card" data-request-id="${req.id}" style="cursor: pointer; transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.03);" onmouseover="this.style.borderColor='var(--emerald-500)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.03)'; this.style.transform='none'">
                  <div class="request-card-header">
                    <div style="flex:1;">
                      <div class="request-card-title">${req.title}</div>
                      <p style="font-size:var(--fs-sm); color:var(--text-tertiary); margin-top:var(--sp-2); line-height:var(--lh-relaxed); max-width:600px;">
                        ${(req.description || '').length > 150 ? (req.description || '').slice(0, 150) + '...' : (req.description || '')}
                      </p>
                    </div>
                    <span class="badge badge-${status.color}">
                      <span class="status-dot status-dot-${status.dot}" style="margin-right:6px;"></span>
                      ${status.label}
                    </span>
                  </div>
                  <div class="request-card-footer">
                    <div class="request-card-meta">
                      <span class="request-card-meta-item"><span class="material-symbols-rounded" style="font-size:1.1rem; vertical-align:middle;">calendar_month</span> ${new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                      <span class="request-card-meta-item"><span class="material-symbols-rounded" style="font-size:1.1rem; vertical-align:middle;">construction</span> ${req.serviceName}</span>
                      <span class="request-card-platform"><span class="material-symbols-rounded" style="font-size:1.1rem; vertical-align:middle;">link</span> ${req.platformName}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:var(--sp-4);">
                      <span class="badge badge-violet">${req.complexityName}</span>
                      <span style="font-weight:600; color:var(--text-primary);">
                        R$ ${req.price?.toLocaleString('pt-BR') || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('req-new-btn')?.addEventListener('click', () => navigateTo('/new-request'));
  document.getElementById('req-empty-cta')?.addEventListener('click', () => navigateTo('/new-request'));

  main.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter');
      renderRequests();
    });
  });

  main.querySelectorAll('.request-card').forEach(card => {
    card.addEventListener('click', () => {
       const id = card.getAttribute('data-request-id');
       navigateTo('/request-detail?id=' + id);
    });
  });
}
