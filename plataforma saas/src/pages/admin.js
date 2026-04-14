import { getUser, getAllRequests, getAllUsersProfile, updateAdminRequest, getMessages, sendAdminMessage } from '../auth.js';
import { navigateTo } from '../router.js';

export async function renderAdmin() {
  const mainContent = document.getElementById('main-content');
  
  // Security check
  const user = await getUser();
  if (!user || user.email !== 'victor@neuroopsai.online') {
    navigateTo('/dashboard');
    return;
  }

  mainContent.innerHTML = `
    <div class="container section" style="padding: var(--sp-12) 0; min-height: 100vh;">
      
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: var(--sp-8);">
         <div>
            <h1 class="heading-xl" style="margin-bottom: 0.5rem; display:flex; align-items:center; gap:0.5rem;">
               <span class="material-symbols-rounded" style="color:var(--accent-color); font-size:2.5rem;">monitoring</span>
               NeuroOps <span class="gradient-text">Command Center</span>
            </h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">Visão global da operação, faturamento e entregáveis.</p>
         </div>
         <div>
            <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--emerald-400); padding: 0.6rem 1.2rem; font-size: 0.95rem; border: 1px solid rgba(16,185,129,0.2);">
               <span class="status-dot status-dot-success"></span> Sistema Operacional
            </span>
         </div>
      </div>

      <div id="kpi-dashboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--sp-6); margin-bottom: var(--sp-8);">
         <!-- KPIs loading -->
      </div>
      
      <div class="tabs" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0; margin-bottom: var(--sp-8); gap: 2rem;">
        <button class="tab-btn active" data-tab="requests" style="font-size:1.1rem; padding-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;"><span class="material-symbols-rounded">receipt_long</span> Operações Ativas</button>
        <button class="tab-btn" data-tab="users" style="font-size:1.1rem; padding-bottom: 1rem; display:flex; align-items:center; gap:0.5rem;"><span class="material-symbols-rounded">group</span> Base de Clientes</button>
      </div>

      <div id="tab-requests" class="tab-pane active" style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: var(--sp-6);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--sp-6);">
           <h2 class="heading-md" style="margin:0;">Fila de Solicitações</h2>
        </div>
        <div id="admin-requests-list">
             <div style="display:flex;justify-content:center;padding:3rem;"><span class="material-symbols-rounded spin gradient-emoji" style="font-size:3rem;">sync</span></div>
        </div>
      </div>

      <div id="tab-users" class="tab-pane hidden" style="background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: var(--sp-6);">
        <h2 class="heading-md" style="margin-bottom: var(--sp-6);">Diretório de Clientes</h2>
        <div id="admin-users-list">
             <div style="display:flex;justify-content:center;padding:3rem;"><span class="material-symbols-rounded spin gradient-emoji" style="font-size:3rem;">sync</span></div>
        </div>
      </div>
    </div>
    
    <!-- Modal Premium de Gerenciamento da Solicitação -->
    <div class="modal-overlay hidden" id="admin-modal" style="backdrop-filter: blur(10px); background: rgba(0,0,0,0.8);">
        <div class="glass-card-static" style="width: 100%; max-width: 800px; max-height: 90vh; overflow-y:auto; padding: 0; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.1);">
            
            <div style="padding: var(--sp-6); border-bottom: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02);">
               <h3 class="heading-md" id="admin-modal-title" style="margin:0; display:flex; align-items:center; gap:0.5rem;"><span class="material-symbols-rounded" style="color:var(--accent-color);">tune</span> Painel de Controle de Operação</h3>
               <button class="btn btn-ghost" id="admin-modal-close" style="padding: 0.5rem;"><span class="material-symbols-rounded">close</span></button>
            </div>

            <div id="admin-modal-body" style="padding: var(--sp-6);"></div>
            
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

  // Fetch Data
  const requests = await getAllRequests();
  const users = await getAllUsersProfile();

  // Draw KPIs
  const totalFaturamento = requests.reduce((acc, curr) => acc + (curr.price || 0), 0) / 100;
  const requestsPendentes = requests.filter(r => r.status === 'processando' || r.status === 'pending').length;
  
  document.getElementById('kpi-dashboard').innerHTML = `
      <div class="glass-card" style="padding: var(--sp-6); border-left: 4px solid var(--accent-color);">
         <div style="color:var(--text-tertiary); font-size:0.9rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:1px;">Faturamento Total</div>
         <div class="heading-lg" style="color:#fff;">R$ ${totalFaturamento.toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
      </div>
      <div class="glass-card" style="padding: var(--sp-6); border-left: 4px solid var(--emerald-500);">
         <div style="color:var(--text-tertiary); font-size:0.9rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:1px;">Operações Ativas</div>
         <div class="heading-lg" style="color:#fff;">${requestsPendentes} <span style="font-size:1rem; color:var(--text-secondary); font-weight:normal;">/ ${requests.length} total</span></div>
      </div>
      <div class="glass-card" style="padding: var(--sp-6); border-left: 4px solid var(--violet-400);">
         <div style="color:var(--text-tertiary); font-size:0.9rem; margin-bottom:0.5rem; text-transform:uppercase; letter-spacing:1px;">Base de Clientes</div>
         <div class="heading-lg" style="color:#fff;">${users.length} <span style="font-size:1rem; color:var(--text-secondary); font-weight:normal;">usuários</span></div>
      </div>
  `;

  // Draw Requests Table
  const reqList = document.getElementById('admin-requests-list');
  if (requests.length === 0) {
    reqList.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-tertiary);">Nenhuma operação registrada ainda.</div>`;
  } else {
    reqList.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);">
              <th style="padding: 1rem;">Solicitação</th>
              <th style="padding: 1rem;">Setup</th>
              <th style="padding: 1rem;">Status (Op / Fin)</th>
              <th style="padding: 1rem;">Data</th>
              <th style="padding: 1rem; text-align:right;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 1rem;">
                  <div style="font-weight: 500; color:#fff;">${Object.values(r.title || r.servicename || {})[0] || r.servicename || 'Operação N/A'}</div>
                  <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top:0.2rem; font-family: monospace;">UUID: ${r.id.split('-')[0]}***</div>
                </td>
                <td style="padding: 1rem;">
                  <div style="color: var(--violet-300);">${r.servicename}</div>
                  <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top:0.2rem;">R$ ${(r.price/100 || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</div>
                </td>
                <td style="padding: 1rem;">
                  <div style="margin-bottom:0.4rem;">
                     ${r.status === 'concluído' ? '<span class="badge badge-success">Concluído</span>' : 
                       r.status === 'produção' ? '<span class="badge" style="background:rgba(139,92,246,0.1); color:var(--violet-400);">Em Produção</span>' :
                       r.status === 'processando' ? '<span class="badge" style="background:rgba(59,130,246,0.1); color:#60a5fa;">Na Fila</span>' :
                       '<span class="badge badge-accent">'+r.status.toUpperCase()+'</span>'}
                  </div>
                  <div style="font-size:0.8rem; color: ${r.paymentstatus === 'Cancelado' ? '#ef4444' : 'var(--emerald-400)'}; display:flex; align-items:center; gap:0.25rem;">
                     <span class="material-symbols-rounded" style="font-size:1rem;">${r.paymentstatus === 'Cancelado' ? 'cancel' : 'check_circle'}</span> ${r.paymentstatus}
                  </div>
                </td>
                <td style="padding: 1rem; color: var(--text-secondary);">
                   ${new Date(r.created_at).toLocaleDateString('pt-BR')} <br/>
                   <small style="color: var(--text-tertiary);">${new Date(r.created_at).toLocaleTimeString('pt-BR')}</small>
                </td>
                <td style="padding: 1rem; text-align:right;">
                  <button class="btn btn-outline btn-sm btn-manage-req" data-id="${r.id}" style="padding: 0.5rem 1rem;">Administrar</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Draw Users Table
  const usrList = document.getElementById('admin-users-list');
  if (users.length === 0) {
    usrList.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-tertiary);">Nenhum usuário.</div>`;
  } else {
    usrList.innerHTML = `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-secondary);">
              <th style="padding: 1rem;">Usuário</th>
              <th style="padding: 1rem;">Empresa e Plano</th>
              <th style="padding: 1rem;">Data Cadastro</th>
              <th style="padding: 1rem; text-align:right;">Comunicação Direta</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.02)'" onmouseout="this.style.background='transparent'">
                <td style="padding: 1rem;">
                   <div style="display:flex; align-items:center; gap: 0.8rem;">
                      <div style="width:36px; height:36px; background:var(--accent-color); border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#000;">
                         ${(u.name||'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                         <div style="font-weight: 500; color:#fff;">${u.name}</div>
                         <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top:0.2rem;">${u.email}</div>
                      </div>
                   </div>
                </td>
                <td style="padding: 1rem;">
                  <div style="color:#fff;">${u.company || '-'}</div>
                  <div style="margin-top:0.4rem;">
                     <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-secondary);">${(u.planname || 'Free').toUpperCase()}</span>
                  </div>
                </td>
                <td style="padding: 1rem; color: var(--text-secondary);">
                  ${new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td style="padding: 1rem; text-align:right;">
                  <a href="https://wa.me/${(u.phone||'').replace(/\D/g,'')}" target="_blank" class="btn btn-primary btn-sm" style="background:#25D366; border-color:#25D366; color:#000; padding: 0.5rem 1rem; display:inline-flex; align-items:center; gap:0.4rem;">
                     <span class="material-symbols-rounded" style="font-size:1.1rem;">chat</span> WhatsApp
                  </a>
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
      const reqUser = users.find(u => u.id === req.user_id) || {name: 'Desconhecido', email: ''};
      
      const modalBody = document.getElementById('admin-modal-body');
      
      modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8);">
           <!-- Lado Esquerdo: Controle Operacional -->
           <div>
              <h4 style="font-size:0.9rem; text-transform:uppercase; color:var(--text-tertiary); margin-bottom: 1rem; letter-spacing:1px;">Controle Operacional</h4>
              
              <div style="background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 1.5rem;">
                 <div style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--text-secondary);">Cliente: <strong style="color:#fff;">${reqUser.name}</strong> (${reqUser.email})</div>
                 <div style="margin-bottom:1rem; font-size:0.9rem; color:var(--text-secondary);">Status Atual: <span class="badge" style="background:var(--accent-color); color:#000;">${req.status.toUpperCase()}</span></div>
                 
                 <div style="display:flex; flex-wrap:wrap; gap: 0.5rem;">
                    <button class="btn btn-sm btn-outline status-change" data-status="processando">Início (Na Fila)</button>
                    <button class="btn btn-sm btn-outline status-change" data-status="produção">Em Produção</button>
                    <button class="btn btn-sm btn-outline status-change" style="border-color:var(--emerald-500); color:var(--emerald-400);" data-status="concluído">Concluir Total</button>
                 </div>
              </div>

              <h4 style="font-size:0.9rem; text-transform:uppercase; color:var(--text-tertiary); margin-bottom: 1rem; letter-spacing:1px;">Injeção de Arquivos / Entregáveis</h4>
              <div style="background: rgba(0,0,0,0.15); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                 <div class="form-group" style="margin-bottom:1rem;">
                    <label style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.4rem; display:block;">Caminho GitHub do Workflow JSON</label>
                    <input type="text" id="delivery-n8n" class="form-input" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); width:100%; border-radius:6px; padding:0.6rem; color:#fff;" value="${req.n8n_link || ''}" placeholder="Ex: https://raw.githubusercontent.com/...">
                 </div>
                 <div class="form-group" style="margin-bottom:1.5rem;">
                    <label style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.4rem; display:block;">Caminho URL Documentação</label>
                    <input type="text" id="delivery-readme" class="form-input" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); width:100%; border-radius:6px; padding:0.6rem; color:#fff;" value="${req.readme_link || ''}" placeholder="Ex: https://github.com/...">
                 </div>
                 <button class="btn btn-primary" id="btn-save-delivery" style="width:100%;"><span class="material-symbols-rounded">cloud_upload</span> Deploy para o Cliente</button>
              </div>
           </div>

           <!-- Lado Direito: Wiretap Chat -->
           <div style="display:flex; flex-direction:column;">
              <h4 style="font-size:0.9rem; text-transform:uppercase; color:var(--text-tertiary); margin-bottom: 1rem; letter-spacing:1px;">Radar de Chat (Interferência de IA)</h4>
              
              <div id="admin-chat-area" style="flex:1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px 8px 0 0; padding: 1rem; overflow-y:auto; display:flex; flex-direction:column; gap:0.8rem; min-height:300px; max-height:400px;">
                 <!-- chat messages here -->
              </div>
              <div style="display:flex; border-radius: 0 0 8px 8px; border: 1px solid rgba(255,255,255,0.05); border-top:none;">
                 <input type="text" id="admin-chat-input" class="form-input" style="flex:1; background: rgba(0,0,0,0.3); border:none; border-radius:0 0 0 8px; padding:1rem; color:#fff;" placeholder="Responder mascarado de Suporte...">
                 <button class="btn btn-primary" id="admin-chat-send" style="border-radius: 0 0 8px 0; border:none; padding:0 1.5rem;"><span class="material-symbols-rounded">send</span></button>
              </div>
           </div>
        </div>
      `;
      
      modalOverlay.classList.remove('hidden');

      // Status logic
      modalBody.querySelectorAll('.status-change').forEach(b => {
        b.addEventListener('click', async (ev) => {
           const s = ev.target.getAttribute('data-status');
           b.innerHTML = '<span class="material-symbols-rounded spin">sync</span>';
           await updateAdminRequest(req.id, { status: s });
           modalOverlay.classList.add('hidden');
           renderAdmin(); // refresh
        });
      });

      // Delivery logic
      document.getElementById('btn-save-delivery').addEventListener('click', async () => {
         const btnLoad = document.getElementById('btn-save-delivery');
         btnLoad.innerHTML = '<span class="material-symbols-rounded spin">sync</span> Processando Deploy...';
         const n = document.getElementById('delivery-n8n').value;
         const r = document.getElementById('delivery-readme').value;
         await updateAdminRequest(req.id, { n8n_link: n, readme_link: r });
         btnLoad.innerHTML = '<span class="material-symbols-rounded">check_circle</span> Deploy Efetuado Seguro!';
         setTimeout(() => {
            modalOverlay.classList.add('hidden');
            renderAdmin();
         }, 1000);
      });

      // Chat Viewer
      const chatArea = document.getElementById('admin-chat-area');
      async function loadChat() {
          const msgs = await getMessages(req.id);
          if(msgs.length === 0) {
             chatArea.innerHTML = `<div style="text-align:center; margin-top:2rem; color:var(--text-tertiary);">Nenhuma mensagem de suporte ainda.</div>`;
             return;
          }
          chatArea.innerHTML = msgs.map(m => {
             const isClient = m.sender_type === 'client';
             const isMe = m.sender_type === 'agent_support';
             let bg = isClient ? 'rgba(255,255,255,0.05)' : (isMe ? 'var(--emerald-600)' : 'var(--violet-600)');
             let align = isClient ? 'flex-start' : 'flex-end';
             let label = isClient ? reqUser.name : (isMe ? 'Admin (Eu)' : 'IA Agent');
             
             return `
               <div style="align-self: ${align}; max-width:85%;">
                  <div style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:0.2rem; text-align:${isClient ? 'left':'right'};">${label}</div>
                  <div style="background: ${bg}; padding: 0.8rem; border-radius: 8px; font-size: 0.9rem; color:#fff;">
                     ${m.content}
                  </div>
               </div>
             `;
          }).join('');
          chatArea.scrollTop = chatArea.scrollHeight;
      }
      loadChat();

      document.getElementById('admin-chat-send').addEventListener('click', async () => {
         const inp = document.getElementById('admin-chat-input');
         const v = inp.value.trim();
         if (!v) return;
         document.getElementById('admin-chat-send').innerHTML = '<span class="material-symbols-rounded spin">sync</span>';
         await sendAdminMessage(req.id, v);
         inp.value = '';
         document.getElementById('admin-chat-send').innerHTML = '<span class="material-symbols-rounded">send</span>';
         loadChat();
      });
      document.getElementById('admin-chat-input').addEventListener('keypress', (e) => {
         if(e.key === 'Enter') document.getElementById('admin-chat-send').click();
      });

    });
  });
}
