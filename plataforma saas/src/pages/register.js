import { register, addRequest } from '../auth.js';
import { navigateTo } from '../router.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../components/modal.js';

export function renderRegister() {
  const main = document.getElementById('main-content');
  
  const pendingSaleStr = sessionStorage.getItem('pendingPurchase');
  let bannerHtml = '';
  if (pendingSaleStr) {
      bannerHtml = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--emerald-500); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align:center;">
         <h3 style="color: var(--emerald-400); margin-bottom: 0.5rem; display:flex; align-items:center; justify-content:center; gap:0.5rem;"><span class="material-symbols-rounded">gpp_good</span> Pagamento Aprovado!</h3>
         <p style="color: var(--text-secondary); font-size: 0.9rem; margin:0;">Crie sua conta corporativa abaixo para liberar o acesso ao projeto recém-adquirido.</p>
      </div>
      `;
  }

  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-card" style="max-width:480px;">
        ${bannerHtml}
        <div class="auth-header">
          <div class="navbar-logo-icon" style="width:48px;height:48px;font-size:24px;margin:0 auto var(--sp-4);border-radius:var(--radius-lg);">N</div>
          <h1>Crie sua conta</h1>
          <p>Comece a automatizar sua operação com IA</p>
        </div>

        <form id="register-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="reg-name">Nome completo *</label>
            <input class="form-input" type="text" id="reg-name" placeholder="Seu nome completo" required autocomplete="name" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Email corporativo *</label>
            <input class="form-input" type="email" id="reg-email" placeholder="seu@empresa.com" required autocomplete="email" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-company">Empresa</label>
            <input class="form-input" type="text" id="reg-company" placeholder="Nome da empresa" autocomplete="organization" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-phone">WhatsApp</label>
            <input class="form-input" type="tel" id="reg-phone" placeholder="(11) 99999-9999" autocomplete="tel" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Senha *</label>
            <input class="form-input" type="password" id="reg-password" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password-confirm">Confirmar senha *</label>
            <input class="form-input" type="password" id="reg-password-confirm" placeholder="Repita a senha" required autocomplete="new-password" />
          </div>

          <div style="margin-bottom:var(--sp-6);">
            <label style="display:flex; align-items:flex-start; gap:var(--sp-2); font-size:var(--fs-sm); color:var(--text-secondary); cursor:pointer;">
              <input type="checkbox" id="reg-terms" style="accent-color:var(--violet-500); margin-top:3px;" />
              <span>Concordo com os <a href="#" style="color:var(--violet-400);">Termos de Uso</a> e <a href="#" style="color:var(--violet-400);">Política de Privacidade</a></span>
            </label>
          </div>

          <button class="btn btn-primary btn-full btn-lg" type="submit" id="register-submit">
            Criar Conta
          </button>
        </form>

        <div class="auth-divider">ou</div>

        <button class="btn btn-secondary btn-full" style="gap:var(--sp-3);">
          <img src="https://www.google.com/favicon.ico" alt="" style="width:18px;height:18px;" />
          Continuar com Google
        </button>

        <div class="auth-footer">
          Já tem uma conta? <a href="#" data-route="/login" onclick="event.preventDefault()">Faça login</a>
        </div>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const company = document.getElementById('reg-company').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    const terms = document.getElementById('reg-terms').checked;

    if (!name || !email || !password) {
      showToast('Preencha os campos obrigatórios.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    if (password !== passwordConfirm) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }

    if (!terms) {
      showToast('Aceite os termos de uso para continuar.', 'error');
      return;
    }

    const result = register({ name, email, password, company, phone });
    if (result.success) {
      
      const pendingStr = sessionStorage.getItem('pendingPurchase');
      if (pendingStr) {
         try {
             const reqData = JSON.parse(pendingStr);
             addRequest(reqData);
             sessionStorage.removeItem('pendingPurchase');
         } catch(e) {}
      }
      
      showToast(`Conta criada com sucesso! Bem-vindo, ${result.user.name}!`, 'success');
      renderNavbar();
      navigateTo('/dashboard');
    } else {
      showToast(result.error, 'error');
    }
  });

  main.querySelector('[data-route="/login"]')?.addEventListener('click', () => {
    navigateTo('/login');
  });
}
