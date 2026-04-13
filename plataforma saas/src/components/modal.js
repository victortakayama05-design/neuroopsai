// Toast notification system
export function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Modal system
export function showModal({ title, content, onClose }) {
  const root = document.getElementById('modal-root');

  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop"></div>
    <div class="modal" id="modal">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn">✕</button>
      </div>
      <div class="modal-body">${content}</div>
    </div>
  `;

  const close = () => {
    root.innerHTML = '';
    if (onClose) onClose();
  };

  document.getElementById('modal-backdrop').addEventListener('click', close);
  document.getElementById('modal-close-btn').addEventListener('click', close);
  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handler);
    }
  });

  return { close, modal: document.getElementById('modal') };
}
