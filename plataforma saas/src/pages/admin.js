import { getUser, getAllRequests, getAllUsersProfile, updateAdminRequest, getMessages, sendAdminMessage } from '../auth.js';
import { navigateTo } from '../router.js';

export async function renderAdmin() {
  const mainContent = document.getElementById('main-content');
  
  // Security check: Must be admin
  const user = await getUser();
  if (!user || user.email !== 'victor@neuroopsai.online') {
    navigateTo('/dashboard');
    return;
  }

  mainContent.innerHTML = `
    <div class="container section">
      <h1 class="heading-lg" style="margin-bottom: 24px;">Central de Comando NeuroOps <span class="badge badge-success">Admin</span></h1>
      
      <div class="tabs">
        <button class="tab-btn active" data-tab="requests">Operações (Requests)</button>
        <button class="tab-btn" data-tab="users">Usuários (Profiles)</button>
      </div>

      <div id="tab-requests" class="tab-pane active" style="margin-top: 24px;">
        <h2 class="heading-md">Todas as Solicitações</h2>
        <div id="admin-requests-list" style="margin-top: 16px;">Carregando...</div>
      </div>

      <div id="tab-users" class="tab-pane hidden" style="margin-top: 24px;">
        <h2 class="heading-md">Base de Clientes</h2>
        <div id="admin-users-list" style="margin-top: 16px;">Carregando...</div>
      </div>
    </div>
    
    <!-- Modal de Gerenciamento da Solicitação -->
    <div class="modal-overlay hidden" id="admin-modal">
        <div class="modal">
            <h3 class="heading-md" id="admin-modal-title">Detalhes da Solicitação</h3>
            <div id="admin-modal-body" style="margin-top: 16px;"></div>
            <div style="margin-top: 24px; display:flex; justify-content: flex-end;">
                <button class="btn btn-ghost" id="admin-modal-close">Fechar</button>
            </div>
        </div>
    </div>
  `;

  // Tab switching logic
  const tabBtns = mainContent.querySelectorAll('.tab-btn');
  const tabPanes = mainContent.querySelectorAll('.tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.getAttribute('data-tab')).classList.remove('hidden');
    });
  });

  const modalOverlay = document.getElementById('admin-modal');
  document.getElementById('admin-modal-close').addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
  });

  // Load Requests
  const requests = await getAllRequests();
  const reqList = document.getElementById('admin-requests-list');
  if (requests.length === 0) {
    reqList.innerHTML = `<p class="body-text text-muted">Nenhuma solicitação encontrada na plataforma.</p>`;
  } else {
    reqList.innerHTML = `
      <div class="card" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px;">ID / Cliente</th>
              <th style="padding: 12px;">Serviço</th>
              <th style="padding: 12px;">Status</th>
              <th style="padding: 12px;">Data</th>
              <th style="padding: 12px;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px;">
                  <strong>${Object.values(r.title || r.servicename || {})[0] || r.servicename || 'N/A'}</strong><br/>
                  <small class="text-muted">${r.id}</small> 
                </td>
                <td style="padding: 12px;">${r.servicename}<br/><small>${r.price ? 'R$'+(r.price/100).toFixed(2) : 'Free'}</small></td>
                <td style="padding: 12px;"><span class="badge ${r.status === 'concluído' ? 'badge-success' : 'badge-accent'}">${r.status.toUpperCase()}</span></td>
                <td style="padding: 12px;">${new Date(r.created_at).toLocaleDateString()}</td>
                <td style="padding: 12px;">
                  <button class="btn btn-outline btn-sm btn-manage-req" data-id="${r.id}" style="padding: 4px 8px; font-size: 12px;">Gerenciar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Load Users
  const users = await getAllUsersProfile();
  const usrList = document.getElementById('admin-users-list');
  if (users.length === 0) {
    usrList.innerHTML = `<p class="body-text text-muted">Nenhum cliente cadastrado.</p>`;
  } else {
    usrList.innerHTML = `
      <div class="card" style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <th style="padding: 12px;">Nome</th>
              <th style="padding: 12px;">E-mail / Telefone</th>
              <th style="padding: 12px;">Empresa</th>
              <th style="padding: 12px;">Plano</th>
              <th style="padding: 12px;">WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px;"><strong>${u.name}</strong></td>
                <td style="padding: 12px;">${u.email}<br/><small>${u.phone}</small></td>
                <td style="padding: 12px;">${u.company || '-'}</td>
                <td style="padding: 12px;"><span class="badge badge-accent">${(u.planname || 'Starter').toUpperCase()}</span></td>
                <td style="padding: 12px;">
                  <a href="https://wa.me/${(u.phone||'').replace(/\D/g,'')}" target="_blank" class="btn btn-outline btn-sm" style="padding: 4px 8px; font-size: 12px;">Conversar</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Request Manage Events
  mainContent.querySelectorAll('.btn-manage-req').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.target.getAttribute('data-id');
      const req = requests.find(r => r.id === id);
      
      const modalBody = document.getElementById('admin-modal-body');
      
      modalBody.innerHTML = `
        <div style="display: grid; gap: 16px;">
          <div>
            <strong>Status Atual:</strong> ${req.status}
          </div>
          <div style="display:flex; gap: 8px;">
            <button class="btn btn-sm btn-outline status-change" data-status="processando">Processando</button>
            <button class="btn btn-sm btn-outline status-change" data-status="produção">Em Produção</button>
            <button class="btn btn-sm btn-outline status-change" data-status="concluído">Concluído</button>
            <button class="btn btn-sm btn-outline status-change" data-status="cancelado">Cancelado</button>
          </div>
          <hr style="border:0; border-top: 1px solid var(--border-color); margin: 8px 0;"/>
          
          <h4 class="body-text" style="font-weight: 600;">Entregáveis (Links)</h4>
          <div class="form-group">
            <label>Link Fluxo (n8n JSON / GitHub)</label>
            <input type="text" id="delivery-n8n" class="form-input" value="${req.n8n_link || ''}" placeholder="https://...">
          </div>
          <div class="form-group">
            <label>Link Documentação (README)</label>
            <input type="text" id="delivery-readme" class="form-input" value="${req.readme_link || ''}" placeholder="https://...">
          </div>
          <button class="btn btn-primary btn-sm" id="btn-save-delivery">Salvar Entregáveis</button>

          <hr style="border:0; border-top: 1px solid var(--border-color); margin: 8px 0;"/>
          <h4 class="body-text" style="font-weight: 600;">Chat com o Cliente (Visão Admin)</h4>
          <div id="admin-chat-area" class="card" style="padding:16px; background: rgba(0,0,0,0.2); max-height: 250px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;"></div>
          <div style="display:flex; gap:8px;">
            <input type="text" id="admin-chat-input" class="form-input" placeholder="Responder como Admin...">
            <button class="btn btn-primary" id="admin-chat-send">Enviar</button>
          </div>
        </div>
      `;
      
      modalOverlay.classList.remove('hidden');

      // Status logic
      modalBody.querySelectorAll('.status-change').forEach(b => {
        b.addEventListener('click', async (ev) => {
           const s = ev.target.getAttribute('data-status');
           b.innerText = 'Salvando...';
           await updateAdminRequest(req.id, { status: s });
           b.innerText = s;
           alert('Status Atualizado para '+s);
           renderAdmin(); // refresh
        });
      });

      // Delivery logic
      document.getElementById('btn-save-delivery').addEventListener('click', async () => {
         const btnLoad = document.getElementById('btn-save-delivery');
         btnLoad.innerText = 'Salvando...';
         const n = document.getElementById('delivery-n8n').value;
         const r = document.getElementById('delivery-readme').value;
         await updateAdminRequest(req.id, { n8n_link: n, readme_link: r });
         btnLoad.innerText = 'Salvo!';
      });

      // Chat Viewer
      const chatArea = document.getElementById('admin-chat-area');
      async function loadChat() {
          const msgs = await getMessages(req.id);
          chatArea.innerHTML = msgs.map(m => `
             <div style="background: ${m.sender_type === 'client' ? 'var(--dark-lighter)' : 'var(--accent-color)'}; padding: 8px; border-radius: 8px; font-size: 13px;">
                <strong style="color: ${m.sender_type === 'client' ? '#fff' : '#000'}">${m.sender_type}:</strong> 
                <span style="color: ${m.sender_type === 'client' ? 'var(--text-color)' : '#000'}">${m.content}</span>
             </div>
          `).join('');
          chatArea.scrollTop = chatArea.scrollHeight;
      }
      loadChat();

      document.getElementById('admin-chat-send').addEventListener('click', async () => {
         const inp = document.getElementById('admin-chat-input');
         const v = inp.value.trim();
         if (!v) return;
         await sendAdminMessage(req.id, v);
         inp.value = '';
         loadChat();
      });

    });
  });
}
