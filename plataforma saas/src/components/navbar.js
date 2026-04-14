import { getUser, isLoggedIn, logout } from '../auth.js';
import { navigateTo, getCurrentRoute } from '../router.js';
import { t, getLocale, setLocale } from '../locale.js';

let dropdownOpen = false;
let scrollHandlerAdded = false;

export async function renderNavbar() {
  const nav = document.getElementById('navbar');
  const loggedIn = await isLoggedIn();
  const user = loggedIn ? await getUser() : null;

  const publicLinks = [
    { label: t('services'), route: '/services' },
    { label: t('platform'), route: '/platform' },
    { label: t('pricing'), route: '/pricing' },
    { label: t('blog'), route: '/blog' },
  ];

  const authLinks = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Solicitações', route: '/requests' },
    { label: 'Nova Automação', route: '/new-request' },
    { label: 'Preços', route: '/pricing' },
  ];

  const links = loggedIn ? authLinks : publicLinks;
  const currentPath = getCurrentRoute();

  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-inner">
      <a class="navbar-logo" href="#/" id="navbar-logo-link">
        <div class="navbar-logo-icon">N</div>
        <span>NeuroOps.ai</span>
      </a>

      <div class="navbar-nav" id="navbar-nav">
        ${links.map(link => {
          if (link.href) {
            return `<a class="navbar-link" href="${link.href}" target="_blank">${link.label}</a>`;
          }
          return `<a class="navbar-link ${currentPath === link.route ? 'active' : ''}" href="#${link.route}">${link.label}</a>`;
        }).join('')}
      </div>

      <div class="navbar-actions">
        ${loggedIn ? `
          <div class="navbar-user" id="navbar-user-btn" style="position:relative;">
            <div class="navbar-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="navbar-user-info">
              <span class="navbar-user-name">${user.name.split(' ')[0]}</span>
              <span class="navbar-user-plan">${user.planName || 'Free'}</span>
            </div>
            <div class="navbar-dropdown ${dropdownOpen ? '' : 'hidden'}" id="navbar-dropdown">
              <a class="navbar-dropdown-item" href="#/dashboard">📊 Dashboard</a>
              <a class="navbar-dropdown-item" href="#/profile">👤 Meu Perfil</a>
              <a class="navbar-dropdown-item" href="#/requests">📋 Solicitações</a>
              <div class="navbar-dropdown-divider"></div>
              <div class="navbar-dropdown-item" id="logout-btn">🚪 Sair</div>
            </div>
          </div>
        ` : `
          <a class="btn btn-ghost" href="#/login">${t('login')}</a>
          <a class="btn btn-primary" href="#/register">${t('register')}</a>
        `}

        <div class="navbar-mobile-toggle" id="mobile-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  `;

  // User dropdown toggle
  const userBtn = document.getElementById('navbar-user-btn');
  if (userBtn) {
    userBtn.addEventListener('click', (e) => {
      // Don't toggle if clicking a link inside the dropdown
      if (e.target.closest('a[href]')) return;
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      document.getElementById('navbar-dropdown')?.classList.toggle('hidden');
    });
  }

  // Dropdown links close dropdown on click
  nav.querySelectorAll('.navbar-dropdown a[href]').forEach(link => {
    link.addEventListener('click', () => {
      dropdownOpen = false;
      document.getElementById('navbar-dropdown')?.classList.add('hidden');
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await logout();
      dropdownOpen = false;
      navigateTo('/');
      renderNavbar();
    });
  }

  // Mobile toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.getElementById('navbar-nav')?.classList.toggle('open');
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    if (dropdownOpen) {
      dropdownOpen = false;
      document.getElementById('navbar-dropdown')?.classList.add('hidden');
    }
  });

  // Scroll effect (only add once)
  if (!scrollHandlerAdded) {
    scrollHandlerAdded = true;
    window.addEventListener('scroll', () => {
      const navEl = document.getElementById('navbar');
      if (!navEl) return;
      if (window.scrollY > 20) {
        navEl.classList.add('scrolled');
      } else {
        navEl.classList.remove('scrolled');
      }
    });
  }

  // Set initial scroll state
  if (window.scrollY > 20) {
    nav.classList.add('scrolled');
  }

  // Close mobile nav on any link click
  nav.querySelectorAll('.navbar-nav a').forEach(link => {
    link.addEventListener('click', () => {
      document.getElementById('navbar-nav')?.classList.remove('open');
    });
  });
}
