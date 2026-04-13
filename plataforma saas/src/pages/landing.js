// Landing Page - Hyper Modern Web3 Bento Layout
import { navigateTo } from '../router.js';
import { isLoggedIn } from '../auth.js';
import { services } from '../data/services.js';
import { plans } from '../data/plans.js';

export function renderLanding() {
  const main = document.getElementById('main-content');

  // Inject true modern styling directly without JS bounced reveals. Every block static and immersive.
  main.innerHTML = `
    <!-- IMMERSIVE HERO -->
    <section class="hero" id="hero-section">
      <div class="container">
        <div class="hero-badge" style="backdrop-filter:blur(10px)">
          <span class="status-dot status-dot-active" style="box-shadow: 0 0 10px #14f195"></span>
          Inteligência Autônoma em Produção
        </div>

        <h1>
          A escala do amanhã, entregue
          <span class="text-gradient">hoje</span>.
        </h1>

        <p class="hero-subtitle">
          Não somos uma agência. Somos a infraestrutura inteligente por trás de operações de milhões. Do mapeamento da arquitetura ao deploy com agentes autônomos.
        </p>

        <div class="hero-actions" style="margin-top: 3rem;">
          <button class="btn btn-primary btn-lg" id="hero-cta-main" style="padding: 1rem 3rem; font-size: 1.1rem;">
            Construir Arquitetura
          </button>
          <button class="btn btn-secondary btn-lg" id="hero-cta-plans" style="padding: 1rem 3rem; font-size: 1.1rem; border-color: rgba(255,255,255,0.2);">
            Ver Escala
          </button>
        </div>

        <div class="hero-stats" style="border-top: 1px solid rgba(255,255,255,0.05); margin-top: 6rem; padding-top: 3rem;">
          <div class="hero-stat">
            <div class="hero-stat-value" style="font-size: 4rem;">14+</div>
            <div class="hero-stat-label">Modelos Treinados</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value" style="font-size: 4rem;">4</div>
            <div class="hero-stat-label">Semanas pra ROI</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-value" style="font-size: 4rem;">24/7</div>
            <div class="hero-stat-label">Engine Ativa</div>
          </div>
        </div>
      </div>
    </section>

    <!-- BENTO GRID CAPABILITIES (Totally unique layout, not standard grid-3) -->
    <section class="section" style="padding-top: 8rem; position: relative;">
      <div class="container">
        <h2 style="font-size: 3rem; margin-bottom: 4rem; letter-spacing: -0.03em;">
          Ecossistema de <span class="text-gradient">Capabilities</span>
        </h2>

        <div class="bento-grid">
          <!-- Large Feature -->
          <div class="bento-item large" style="background: linear-gradient(145deg, rgba(153, 69, 255, 0.1) 0%, rgba(10,10,15,0.4) 100%);">
            <div class="material-symbols-rounded gradient-emoji" style="font-size: 4rem; margin-bottom: 2rem;">psychology</div>
            <div style="font-size:0.9rem; color:var(--emerald-400); font-weight:700; margin-bottom:0.5rem;">A partir de R$ 1.947,00</div>
            <h3 style="font-size: 2rem; margin-bottom: 1rem;">Squads de Agentes N8N</h3>
            <p style="color: var(--text-secondary); font-size: 1.25rem; line-height: 1.6;">
               Uma matriz de agentes intercomunicativos capazes de operar infraestrutura inteira, do onbording ao billing, tomando decisões complexas em milissegundos.
            </p>
            <div style="margin-top: auto; padding-top: 2rem;">
              <button class="btn btn-ghost" data-action="request" data-service="agentes" style="padding: 0;">Iniciar deploy →</button>
            </div>
          </div>

          <!-- Medium Features -->
          <div class="bento-item medium">
            <div class="material-symbols-rounded gradient-emoji" style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--emerald-400);">schema</div>
            <div style="font-size:0.8rem; color:var(--emerald-400); font-weight:700; margin-bottom:0.5rem;">A partir de R$ 1.947,00</div>
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">Pipelines de Dados</h3>
            <p style="color: var(--text-secondary);">Rotas assíncronas entre Make, Zapier e APIs nativas para manter sua Data Lake pulsando atualizada 24/7 sem perda de pacotes.</p>
          </div>

          <div class="bento-item">
            <div class="material-symbols-rounded gradient-emoji" style="font-size: 2.5rem; margin-bottom: 1rem;">monitoring</div>
            <div style="font-size:0.8rem; color:var(--emerald-400); font-weight:700; margin-bottom:0.5rem;">A partir de R$ 1.947,00</div>
            <h3 style="font-size: 1.25rem;">Scale Ops</h3>
            <p style="color: var(--text-tertiary); font-size: 0.9rem;">Modelagem de BI com IA generativa gerando dashboards invisíveis.</p>
          </div>

          <div class="bento-item" style="background: rgba(20,241,149,0.05); border-color: rgba(20,241,149,0.2);">
            <div class="material-symbols-rounded gradient-emoji" style="font-size: 2.5rem; margin-bottom: 1rem;">shield_person</div>
            <div style="font-size:0.8rem; color:var(--emerald-400); font-weight:700; margin-bottom:0.5rem;">A partir de R$ 1.947,00</div>
            <h3 style="font-size: 1.25rem;">Anti-Fraude Autônomo</h3>
            <p style="color: var(--text-tertiary); font-size: 0.9rem;">Redução de 78% em chargebacks com nossa blindagem preditiva.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CORE FOUNDER SECTION -->
    <section class="section" style="margin-top: 6rem; background: rgba(5,5,5,0.8); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="container" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4rem;">
            <div style="flex:1; min-width:300px;">
                <span class="badge" style="background:transparent; border:1px solid rgba(255,255,255,0.1); color:var(--text-secondary); margin-bottom:1.5rem;">Arquitetura & Visão</span>
                <h2 style="font-size:3rem; margin-bottom:2rem; letter-spacing:-0.03em; line-height:1;">Victor Takayama Garcia</h2>
                <p style="color:var(--text-secondary); font-size:1.2rem; line-height:1.6; margin-bottom:1.5rem;">Apenas IA não resolve. Você precisa de engenharia de arquitetura.</p>
                <p style="color:var(--text-tertiary); font-size:1rem; line-height:1.6;">Com bagagem sólida das maiores big techs (PayPal, Shopee), trago a exata visão de operações corporativas aliada aos nossos 14 agentes autônomos. Consultorias te entregam PowerPoints. Nós te entregamos o motor rodando.</p>
            </div>
            <div style="flex: 0.8; height: 450px; border-radius: 2rem; background: var(--surface); border: 1px solid rgba(255,255,255,0.05); position:relative; overflow:hidden;">
                <!-- Victor Vision Photo -->
                <img src="/assets/victor-vision.jpg" alt="Victor Takayama - Architect" style="width: 100%; height: 100%; object-fit: cover; filter: contrast(1.1) brightness(0.9);" onerror="this.src='https://images.unsplash.com/photo-1549692520-acc6669e2f0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" />
                <div style="position:absolute; bottom:0; left:0; width:100%; height:30%; background:linear-gradient(transparent, #000);"></div>
            </div>
        </div>
    </section>

    <!-- PREMIUM OFFERS -->
    <section class="section" id="precos-section" style="padding-top: 10rem;">
      <div class="container">
        <h2 style="font-size: 3rem; text-align: center; margin-bottom: 1rem; letter-spacing: -0.03em;">
          Managed Services <span style="color: var(--emerald-400);">Premium</span>
        </h2>
        <p style="text-align: center; color: var(--text-secondary); font-size: 1.2rem; margin-bottom: 6rem;">
          Deploy pago por sucesso, mantido na nossa infra.
        </p>

        <div class="pricing-grid">
          ${plans.map(plan => `
            <div class="plan-card ${plan.featured ? 'featured' : ''}">
              ${plan.badge ? `<span class="badge badge-violet plan-card-popular" style="background:rgba(153,69,255,0.2); backdrop-filter:blur(10px); border:none;">${plan.badge}</span>` : ''}
              <div class="plan-card-header">
                <div class="plan-card-name" style="font-family: var(--font-body); letter-spacing:-0.05em; font-size:2rem;">${plan.name}</div>
                <div class="plan-card-price" style="margin-top:1.5rem;">
                  <span class="amount" style="font-size: 3.5rem;">${plan.price.toLocaleString('pt-BR')}</span>
                  <span class="period" style="align-self:flex-end; padding-bottom:10px;">/mês</span>
                </div>
                <div class="plan-card-desc" style="margin-top:1rem; opacity:0.8;">${plan.description}</div>
              </div>
              <div class="plan-card-features">
                ${plan.features.map(f => `
                  <div class="plan-card-feature">
                    <span style="color:var(--emerald-500); font-weight:800;">+</span>
                    <span style="color: #fff; font-size: 0.95rem;">${f}</span>
                  </div>
                `).join('')}
              </div>
              <button class="btn ${plan.featured ? 'btn-primary' : 'btn-secondary'} btn-full" data-plan="${plan.id}" style="padding: 1.2rem; font-size: 1rem;">
                Iniciar Setup
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    <!-- CTA FINAL CALL TO ACTION -->
    <section class="section">
      <div class="container">
        <div class="cta-banner" style="background: linear-gradient(145deg, rgba(153, 69, 255, 0.1) 0%, rgba(10,10,15,0.8) 100%);">
          <h2>Pronto para escalar com Segurança?</h2>
          <p>O onboarding de infraestrutura de dados começa com um toque.</p>
          <div style="display:flex; gap:var(--sp-4); justify-content:center; flex-wrap:wrap; margin-top:2rem;">
            <button class="btn btn-primary btn-lg" id="btn-cta-landing" style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
              <span class="material-symbols-rounded gradient-emoji">rocket_launch</span> SOLICITAR AUTOMAÇÃO
            </button>
            <a class="btn btn-secondary btn-lg" href="https://wa.me/5511953586938?text=Oi%21+Quero+saber+mais+sobre+a+NeuroOps" target="_blank" style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
              <span class="material-symbols-rounded">chat</span> FALAR NO WHATSAPP
            </a>
          </div>
        </div>
      </div>
    </section>
  `;

  // Removed IntersectionObserver completely to guarantee zero bouncy "emotions".
  
  // Event listeners
  document.getElementById('hero-cta-main')?.addEventListener('click', () => {
    navigateTo('/pricing');
  });

  document.getElementById('hero-cta-plans')?.addEventListener('click', () => {
    navigateTo('/pricing');
  });

  main.querySelectorAll('[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
      const planId = btn.getAttribute('data-plan');
      navigateTo(`/checkout?plan=${planId}`);
    });
  });

  main.querySelectorAll('[data-action="request"]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('/pricing');
    });
  });

  document.getElementById('btn-cta-landing')?.addEventListener('click', () => {
    navigateTo('/pricing');
  });
}
