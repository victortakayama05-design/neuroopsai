// Simple hash-based SPA router
const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

export function initRouter() {
  function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = new URLSearchParams(queryString || '');

    // Find matching route
    let handler = routes[path];
    let routeParams = {};

    if (!handler) {
      // Try dynamic routes (e.g., /requests/:id)
      for (const [pattern, h] of Object.entries(routes)) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length === pathParts.length) {
          let match = true;
          const dynamicParams = {};
          for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith(':')) {
              dynamicParams[patternParts[i].slice(1)] = pathParts[i];
            } else if (patternParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            handler = h;
            routeParams = dynamicParams;
            break;
          }
        }
      }
    }

    if (handler) {
      currentRoute = path;
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = '';
      mainContent.className = 'page-enter';
      handler({ params: routeParams, query: params });

      // Update active nav links
      document.querySelectorAll('.navbar-link').forEach(link => {
        const href = link.getAttribute('data-route');
        if (href === path) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Scroll to top
      window.scrollTo(0, 0);
    } else {
      // 404 fallback
      navigateTo('/');
    }
  }

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}
