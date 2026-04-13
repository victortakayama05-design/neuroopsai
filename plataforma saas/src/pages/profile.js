// Profile page
import { getUser, isLoggedIn, updateUser, getRequests } from '../auth.js';
import { navigateTo } from '../router.js';
import { plans } from '../data/plans.js';
import { showToast } from '../components/modal.js';
import { renderNavbar } from '../components/navbar.js';

export function renderProfile() {
  if (!isLoggedIn()) {
    navigateTo('/login');
    return;
  }

  const main = document.getElementById('main-content');
  const user = getUser();
  const requests = getRequests();
  const currentPlan = plans.find(p => p.id === user.plan);

  main.innerHTML = `
    <div class="profile-page">
      <div class="container">
        <h1>Meu <span class="text-gradient">Perfil</span></h1>

        <div class="profile-grid">
          <!-- Informações Pessoais -->
          <div class="profile-section">
            <h2>👤 Informações Pessoais</h2>
            <form id="profile-form">
              <div class="form-group">
                <label class="form-label" for="profile-name">Nome Completo</label>
                <input class="form-input" type="text" id="profile-name" value="${user.name}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="profile-email">Email</label>
                <input class="form-input" type="email" id="profile-email" value="${user.email}" disabled style="opacity:0.6;" />
                <span class="form-hint">O email não pode ser alterado.</span>
              </div>
              <div class="form-group">
                <label class="form-label" for="profile-company">Empresa</label>
                <input class="form-input" type="text" id="profile-company" value="${user.company || ''}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="profile-phone">WhatsApp</label>
                <input class="form-input" type="tel" id="profile-phone" value="${user.phone || ''}" />
              </div>
              <button class="btn btn-primary" type="submit">Salvar Alterações</button>
            </form>
          </div>

          <!-- Assinatura -->
          <div>
            <div class="profile-section" style="margin-bottom:var(--sp-8);">
              <h2>⚡ Minha Assinatura</h2>

              ${currentPlan ? `
                <div class="profile-plan-card">
                  <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--sp-4);">
                    <div class="profile-plan-name">${currentPlan.name}</div>
                    <span class="badge badge-emerald">Ativo</span>
                  </div>
                  <div class="profile-plan-price">
                    R$ ${currentPlan.price.toLocaleString('pt-BR')}${currentPlan.period}
                  </div>
                  <div style="margin-top:var(--sp-4);">
                    ${currentPlan.features.slice(0, 4).map(f => `
                      <div style="font-size:var(--fs-sm); color:var(--text-secondary); display:flex; align-items:center; gap:var(--sp-2); margin-top:var(--sp-2);">
                        <span style="color:var(--emerald-400);">✓</span> ${f}
                      </div>
                    `).join('')}
                  </div>
                </div>
                <div style="display:flex; gap:var(--sp-3);">
                  <button class="btn btn-secondary" id="profile-upgrade">Upgrade</button>
                  <button class="btn btn-ghost" id="profile-cancel" style="color:var(--red-400);">Cancelar Plano</button>
                </div>
              ` : `
                <div style="text-align:center; padding:var(--sp-8);">
                  <div style="font-size:40px; margin-bottom:var(--sp-4);">📋</div>
                  <h4 style="margin-bottom:var(--sp-3);">Sem plano ativo</h4>
                  <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-bottom:var(--sp-6);">
                    Escolha um plano de Managed Services para monitoramento contínuo.
                  </p>
                  <button class="btn btn-primary" id="profile-choose-plan">Ver Planos</button>
                </div>
              `}
            </div>

            <!-- Estatísticas -->
            <div class="profile-section">
              <h2>📊 Resumo</h2>
              <div class="profile-info-row">
                <span class="profile-info-label">Total de Solicitações</span>
                <span class="profile-info-value">${requests.length}</span>
              </div>
              <div class="profile-info-row">
                <span class="profile-info-label">Solicitações Ativas</span>
                <span class="profile-info-value">${requests.filter(r => !['completed','cancelled'].includes(r.status)).length}</span>
              </div>
              <div class="profile-info-row">
                <span class="profile-info-label">Concluídas</span>
                <span class="profile-info-value">${requests.filter(r => r.status === 'completed').length}</span>
              </div>
              <div class="profile-info-row">
                <span class="profile-info-label">Membro desde</span>
                <span class="profile-info-value">${new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const company = document.getElementById('profile-company').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();

    if (!name) {
      showToast('O nome é obrigatório.', 'error');
      return;
    }

    updateUser({ name, company, phone });
    showToast('Perfil atualizado com sucesso!', 'success');
    renderNavbar();
  });

  document.getElementById('profile-upgrade')?.addEventListener('click', () => navigateTo('/pricing'));
  document.getElementById('profile-choose-plan')?.addEventListener('click', () => navigateTo('/pricing'));
  document.getElementById('profile-cancel')?.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja cancelar seu plano? Esta ação pode ser revertida.')) {
      updateUser({ plan: null, planName: null });
      showToast('Plano cancelado.', 'info');
      renderNavbar();
      renderProfile();
    }
  });
}
