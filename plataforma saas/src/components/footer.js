// Footer component
import { navigateTo } from '../router.js';

export function renderFooter() {
  const footer = document.getElementById('footer-container');
  footer.innerHTML = `
    <div class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="navbar-logo" data-route="/" onclick="event.preventDefault()" style="cursor:pointer;">
              <div class="navbar-logo-icon">N</div>
              <span>NeuroOps.ai</span>
            </a>
            <p>Consultoria especializada em automação e inteligência artificial. Operação 100% por agentes de IA com supervisão estratégica humana.</p>
          </div>

          <div class="footer-column">
            <h4>Serviços</h4>
            <a href="#" data-route="/pricing">Automação de Workflows</a>
            <a href="#" data-route="/pricing">Agentes de IA</a>
            <a href="#" data-route="/pricing">Business Intelligence</a>
            <a href="#" data-route="/pricing">Prevenção a Fraudes</a>
            <a href="#" data-route="/pricing">Chatbots Inteligentes</a>
            <a href="#" data-route="/pricing">Integração de Dados</a>
          </div>

          <div class="footer-column">
            <h4>Plataforma</h4>
            <a href="#" data-route="/pricing">Planos e Preços</a>
            <a href="#" data-route="/new-request">Solicitar Automação</a>
            <a href="#" data-route="/dashboard">Dashboard</a>
            <a href="https://neuroopsai.online/blog/" target="_blank">Blog</a>
          </div>

          <div class="footer-column">
            <h4>Contato</h4>
            <a href="mailto:contato@neuroopsai.online">contato@neuroopsai.online</a>
            <a href="https://wa.me/5511953586938" target="_blank">WhatsApp</a>
            <a href="https://neuroopsai.online/" target="_blank">Agendar Reunião</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2026 NeuroOps.ai — Todos os direitos reservados.</span>
          <span>Do ecossistema <strong>TG Holding</strong></span>
        </div>
      </div>
    </div>
  `;

  // Route links
  footer.querySelectorAll('[data-route]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-route'));
    });
  });
}
