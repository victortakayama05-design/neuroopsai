import { navigateTo } from '../router.js';
import { services } from '../data/services.js';

export function renderServices() {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="services-page" style="padding: var(--sp-16) 0;">
      <div class="container">
        <h1 style="font-size: 3.5rem; text-align: center; margin-bottom: 2rem; letter-spacing: -0.03em;">
          Expertise & <span class="text-gradient">Serviços</span>
        </h1>
        <p style="text-align: center; color: var(--text-secondary); max-width: 600px; margin: 0 auto 5rem; font-size: 1.25rem;">
          Implementação de sistemas de IA, esteiras de dados e automação robótica guiada por ROI.
        </p>

        <div class="bento-grid">
          ${services.map((svc, i) => `
            <div class="bento-item ${i === 0 || i === 3 ? 'large' : ''}" style="border-radius: 2rem;">
              <div class="gradient-emoji" style="font-size: 3rem; margin-bottom: 1.5rem;">${svc.icon}</div>
              <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">${svc.name}</h3>
              <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem;">
                ${svc.shortDesc} Este escopo é customizado para garantir que os SLAs sejam atendidos automaticamente.
              </p>
              <div style="margin-top: auto;">
                <button class="btn btn-ghost" data-action="request" data-service="${svc.id}" style="padding: 0;">Solicitar Setup →</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  main.querySelectorAll('[data-action="request"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const serviceId = btn.getAttribute('data-service');
      navigateTo(`/new-request?service=${serviceId}`);
    });
  });
}
