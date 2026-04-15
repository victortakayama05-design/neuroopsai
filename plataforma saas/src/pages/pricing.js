import { isLoggedIn } from '../auth.js';
import { navigateTo } from '../router.js';
import { plans, complexityLevels, getPlanPrice } from '../data/plans.js';
import { services } from '../data/services.js';
import { API_URL } from '../config.js';

export function renderPricing() {
  const main = document.getElementById('main-content');
  const loggedIn = isLoggedIn();

  main.innerHTML = `
    <div class="section" style="padding-top:var(--sp-12);">
      <div class="container">
        <h1 class="section-title" style="font-size:var(--fs-5xl); margin-bottom:var(--sp-4);">
          Planos e <span class="accent">Preços</span>
        </h1>
        <p class="section-subtitle">
          Sincronizando Catálogo... <span class="material-symbols-rounded spin">sync</span>
        </p>

        <div id="pricing-wrapper" style="opacity: 0.5; pointer-events:none; transition: opacity 0.5s ease;">
          <div style="margin-bottom:var(--sp-6);">
            <h2 style="text-align:center; font-size:var(--fs-2xl); margin-bottom:var(--sp-2);">
              Managed Services — <span class="text-gradient">Recorrência</span>
            </h2>
            <p style="text-align:center; color:var(--text-secondary); margin-bottom:var(--sp-12); font-size:var(--fs-sm);">
              Monitoramento contínuo, otimização e suporte operado por agentes de IA após a implementação.
            </p>
          </div>
          <div class="pricing-grid" id="pricing-grid-dyn"></div>
        </div>
      </div>
    </div>

    <div class="section" style="background:var(--bg-secondary);">
      <div class="container">
        <h2 class="section-title">
          Projetos <span class="accent">Avulsos</span>
        </h2>
        <p class="section-subtitle">
          Contrate automações sob demanda. Escolha a complexidade que melhor se adapta à sua necessidade.
        </p>
        <div class="complexity-grid" style="max-width:900px; margin:0 auto;" id="avulso-grid-dyn"></div>
      </div>
    </div>

    <div class="section" style="background:var(--bg-secondary);">
      <div class="container">
        <div class="cta-banner">
          <h2>Não sabe qual plano escolher?</h2>
          <div style="display:flex; gap:var(--sp-4); justify-content:center; flex-wrap:wrap; margin-top:2rem;">
            <button class="btn btn-primary btn-lg" id="pricing-cta-request">Solicitar Automação</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('pricing-cta-request')?.addEventListener('click', () => navigateTo('/new-request'));
  syncCatalogAndUpdateUI();
}

async function syncCatalogAndUpdateUI() {
  // try {
  //    const rs = await fetch(`${API_URL}/api/sync-catalog`);
  //    if (rs.ok) {
  //       const remoteCatalog = await rs.json();
  //       plans.forEach(p => {
  //         const rp = remoteCatalog.find(r => r.neuroops_id === p.id);
  //         if (rp) p.priceBRL = rp.amount;
  //       });
  //       complexityLevels.forEach(c => {
  //         let rcIds = {'basico':'avulso-basico', 'pro':'avulso-pro', 'enterprise':'avulso-enterprise'};
  //         const rc = remoteCatalog.find(r => r.neuroops_id === rcIds[c.id]);
  //         if (rc) c.priceBRL = rc.amount;
  //       });
  //    }
  // } catch(e) {
  //    console.error("Stripe sync failed, falling back to local prices.");
  // }
  console.log("Catalog sync bypassed, using local prices for immediate load.");

  const pGrid = document.getElementById('pricing-grid-dyn');
  if(pGrid) {
    pGrid.innerHTML = plans.map(plan => `
      <div class="plan-card ${plan.featured ? 'featured' : ''}">
        ${plan.badge ? `<span class="badge badge-violet plan-card-popular">${plan.badge}</span>` : ''}
        <div class="plan-card-header">
          <div class="plan-card-name">${plan.name}</div>
          <div class="plan-card-price" style="display:flex; align-items:baseline; justify-content:center; gap:0.2rem;">
            <span class="amount" style="font-size:2.5rem; font-weight:800;">${getPlanPrice(plan)}</span>
            <span class="period">${plan.period}</span>
          </div>
          <div class="plan-card-desc">${plan.description}</div>
        </div>
        <div class="plan-card-features">
          ${plan.features.map(f => `
            <div class="plan-card-feature">
              <span class="check">✓</span>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>
        <button class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-full" data-plan="${plan.id}">
          Assinar ${plan.name}
        </button>
      </div>
    `).join('');
  }

  const aGrid = document.getElementById('avulso-grid-dyn');
  if(aGrid) {
    aGrid.innerHTML = complexityLevels.map(level => `
      <div class="glass-card" style="text-align:center;">
        <h3 style="margin-bottom:var(--sp-3);">${level.name}</h3>
        <div style="font-size:var(--fs-3xl); font-weight:800; background:var(--gradient-primary); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:var(--sp-3);">
          ${getPlanPrice(level)}
        </div>
        <p style="color:var(--text-secondary); font-size:var(--fs-sm); margin-bottom:var(--sp-6);">${level.description}</p>
        <button class="btn btn-secondary btn-full" data-request-complexity="${level.id}">Solicitar Projeto ${level.name}</button>
      </div>
    `).join('');
  }

  document.querySelector('.section-subtitle').innerHTML = 'Escolha o plano ideal para sua operação. Todos incluem monitoramento por agentes de IA.';
  document.getElementById('pricing-wrapper').style.opacity = '1';
  document.getElementById('pricing-wrapper').style.pointerEvents = 'auto';

  document.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(`/checkout?plan=${btn.getAttribute('data-plan')}&type=subscription`));
  });
  document.querySelectorAll('[data-request-complexity]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(`/checkout?plan=${btn.getAttribute('data-request-complexity')}&type=avulso`));
  });
}
