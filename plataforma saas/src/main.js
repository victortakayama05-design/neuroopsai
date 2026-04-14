// NeuroOps.ai — Main Entry Point
import { registerRoute, initRouter } from './router.js';
import { initAuth } from './auth.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

// Pages
import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNewRequest } from './pages/new-request.js';
import { renderRequests } from './pages/requests.js';
import { renderPricing } from './pages/pricing.js';
import { renderProfile } from './pages/profile.js';
import { renderCheckout } from './pages/checkout.js';
import { renderServices } from './pages/services.js';
import { renderPlatform } from './pages/platform.js';
import { renderBlog } from './pages/blog.js';
import { renderDiag } from './pages/diag.js';
import { renderRequestDetail } from './pages/request-detail.js';

// Initialize app
function init() {
  // Init auth (creates demo users if needed)
  initAuth();

  // Register routes
  registerRoute('/', () => {
    renderNavbar();
    renderLanding();
    renderFooter();
  });

  registerRoute('/login', () => {
    renderNavbar();
    renderLogin();
    renderFooter();
  });

  registerRoute('/register', () => {
    renderNavbar();
    renderRegister();
    renderFooter();
  });

  registerRoute('/dashboard', () => {
    renderNavbar();
    renderDashboard();
    renderFooter();
  });

  registerRoute('/new-request', (ctx) => {
    renderNavbar();
    renderNewRequest(ctx);
    renderFooter();
  });

  registerRoute('/requests', () => {
    renderNavbar();
    renderRequests();
    renderFooter();
  });

  registerRoute('/request-detail', (ctx) => {
    renderNavbar();
    renderRequestDetail(ctx);
    renderFooter();
  });

  registerRoute('/admin', () => {
    import('./pages/admin.js').then(module => {
      renderNavbar();
      module.renderAdmin();
      renderFooter();
    });
  });

  registerRoute('/pricing', () => {
    renderNavbar();
    renderPricing();
    renderFooter();
  });

  registerRoute('/profile', () => {
    renderNavbar();
    renderProfile();
    renderFooter();
  });

  registerRoute('/checkout', (ctx) => {
    renderNavbar();
    renderCheckout(ctx);
    renderFooter();
  });

  registerRoute('/services', () => {
    renderNavbar();
    renderServices();
    renderFooter();
  });

  registerRoute('/platform', () => {
    renderNavbar();
    renderPlatform();
    renderFooter();
  });

  registerRoute('/blog', () => {
    renderNavbar();
    renderBlog();
    renderFooter();
  });

  registerRoute('/diagnostico', (ctx) => {
    renderNavbar();
    renderDiag();
    renderFooter();
  });

  // Start router
  initRouter();
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
