// Login Page
import { login } from '../auth.js';
import { navigateTo } from '../router.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../components/modal.js';

export function renderLogin() {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="navbar-logo-icon" style="width:48px;height:48px;font-size:24px;margin:0 auto var(--sp-4);border-radius:var(--radius-lg);">N</div>
          <h1>Bem-vindo de volta</h1>
          <p>Acesse sua conta NeuroOps.ai</p>
        </div>

        <form id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">Email</label>
            <input class="form-input" type="email" id="login-email" placeholder="seu@email.com" required autocomplete="email" />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Senha</label>
            <input class="form-input" type="password" id="login-password" placeholder="Sua senha" required autocomplete="current-password" />
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--sp-6);">
            <label style="display:flex; align-items:center; gap:var(--sp-2); font-size:var(--fs-sm); color:var(--text-secondary); cursor:pointer;">
              <input type="checkbox" style="accent-color:var(--violet-500);" /> Lembrar-me
            </label>
            <a href="#" style="font-size:var(--fs-sm); color:var(--violet-400);">Esqueci a senha</a>
          </div>

          <button class="btn btn-primary btn-full btn-lg" type="submit" id="login-submit">
            Entrar
          </button>
        </form>

        <div class="auth-divider">ou</div>

        <button class="btn btn-secondary btn-full" style="gap:var(--sp-3);">
          <img src="https://www.google.com/favicon.ico" alt="" style="width:18px;height:18px;" />
          Continuar com Google
        </button>

        <div class="auth-footer">
          Não tem uma conta? <a href="#" data-route="/register" onclick="event.preventDefault()">Cadastre-se grátis</a>
        </div>

      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showToast('Preencha todos os campos.', 'error');
      return;
    }

    // Enter loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="material-symbols-rounded spin">sync</span> Entrando...';
    submitBtn.disabled = true;

    try {
      const result = await login(email, password);
      if (result.success) {
        showToast(`Bem-vindo, ${result.user.name}!`, 'success');
        renderNavbar();
        navigateTo('/dashboard');
      } else {
        showToast(result.error, 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      showToast('Erro interno de conexão. Tente novamente.', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  main.querySelector('[data-route="/register"]')?.addEventListener('click', () => {
    navigateTo('/register');
  });
}
