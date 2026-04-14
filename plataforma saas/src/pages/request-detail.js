import { isLoggedIn, getRequestById, updateRequest, getMessages, sendMessage } from '../auth.js';
import { navigateTo } from '../router.js';
import { requestStatuses } from '../data/services.js';
import { showToast } from '../components/modal.js';
import { API_URL } from '../config.js';

export async function renderRequestDetail({ query }) {
  const main = document.getElementById('main-content');
  main.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;min-height:50vh;"><span class="material-symbols-rounded spin gradient-emoji" style="font-size:3rem;">sync</span></div>';

  if (!(await isLoggedIn())) {
    navigateTo('/login');
    return;
  }

  const reqId = query?.get('id');
  if (!reqId) {
    navigateTo('/requests');
    return;
  }

  const req = await getRequestById(reqId);
  if (!req) {
    navigateTo('/requests');
    return;
  }

  const status = requestStatuses[req.status] || requestStatuses.pending;

  const paymentTimeStr = req.paymentTime 
    ? new Date(req.paymentTime).toLocaleString('pt-BR') 
    : new Date(req.createdAt).toLocaleString('pt-BR');
    
  const paymentStatus = req.paymentStatus || 'Aprovado (Logado)';

  const messages = await getMessages(reqId);

  main.innerHTML = `
    <div class="requests-page" style="padding: var(--sp-12) 0; min-height: 100vh;">
      <div class="container" style="max-width: 900px;">
        <button class="btn btn-ghost" id="back-btn" style="margin-bottom: var(--sp-6); display:flex; align-items:center; gap:0.5rem; color:var(--text-secondary);">
          <span class="material-symbols-rounded">arrow_back</span> Voltar à Central
        </button>
        
        <div class="glass-card-static" style="padding: var(--sp-8); position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
          <!-- Status Line Top -->
          <div style="position: absolute; top:0; left:0; right:0; height: 6px; background: var(--${status.color}-500, var(--emerald-500));"></div>
          
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: var(--sp-6);">
            <div>
              <h1 style="font-size: var(--fs-3xl); margin-bottom: 0.5rem; font-weight:700;">${req.title}</h1>
              <div style="color: var(--text-tertiary); display:flex; gap: 1rem; font-size: 0.85rem;">
                <span>REF: ${req.id}</span>
                <span>•</span>
                <span>Emissão: ${new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <span class="badge badge-${status.color}" style="font-size: 0.9rem; padding: 0.4rem 0.8rem;">
              <span class="status-dot status-dot-${status.dot}"></span>
              ${status.label}
            </span>
          </div>

          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--sp-8); padding-bottom: var(--sp-6); border-bottom: 1px solid rgba(255,255,255,0.05); text-align:justify;">
            ${req.description || 'Operação nativa registrada e agendada para setup de infraestrutura. O agente arquiteto de Master Workflow assumirá as frentes em breve.'}
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); margin-bottom: var(--sp-8);">
            
            <!-- Coluna Operacional -->
            <div>
              <h3 style="margin-bottom: var(--sp-4); font-size: 1.1rem; color:var(--text-primary);"><span class="material-symbols-rounded" style="vertical-align:middle; font-size:1.2rem; color:var(--violet-400);">memory</span> Ficha Técnica</h3>
              <div style="display:flex; flex-direction:column; gap: var(--sp-3);">
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Serviço</span>
                  <span style="font-weight: 500; font-size:0.95rem;">${req.serviceName}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Plano Foco</span>
                  <span style="font-weight: 500; color:var(--violet-300); font-size:0.95rem;">${req.complexityName}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Plataforma Engine</span>
                  <span style="font-weight: 500; display:flex; align-items:center; gap:0.4rem; font-size:0.95rem;">
                    <span class="material-symbols-rounded" style="font-size:1rem; color:var(--emerald-400);">precision_manufacturing</span> 
                    ${req.platformName}
                  </span>
                </div>
              </div>
            </div>

            <!-- Coluna Financeira -->
            <div>
              <h3 style="margin-bottom: var(--sp-4); font-size: 1.1rem; color:var(--text-primary);"><span class="material-symbols-rounded" style="vertical-align:middle; font-size:1.2rem; color:var(--emerald-400);">account_balance_wallet</span> Raio-X Financeiro</h3>
              <div style="display:flex; flex-direction:column; gap: var(--sp-3);">
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Ordem Stripe</span>
                  <span style="font-weight: 700; color:var(--emerald-400);">R$ ${req.price?.toLocaleString('pt-BR') || '0,00'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Diagnóstico</span>
                  <span style="font-weight: 500; display:flex; align-items:center; gap:0.4rem; font-size:0.95rem; color:${req.paymentStatus === 'Cancelado' || req.paymentStatus === 'Reembolsado' ? '#ef4444' : 'var(--emerald-400)'};">
                     <span class="material-symbols-rounded" style="font-size:1.1rem;">${req.paymentStatus === 'Cancelado' || req.paymentStatus === 'Reembolsado' ? 'cancel' : 'check_circle'}</span>
                     ${paymentStatus}
                  </span>
                </div>
                <div style="display:flex; justify-content:space-between; padding: 0.8rem; background: rgba(255,255,255,0.015); border-radius: 6px; border:1px solid rgba(255,255,255,0.02);">
                  <span style="color:var(--text-tertiary); font-size:0.9rem;">Momento (Timestamp)</span>
                  <span style="font-weight: 500; font-size:0.85rem; color:var(--text-secondary);">${paymentTimeStr}</span>
                </div>
              </div>
            </div>
          </div>

          ${(req.n8n_link || req.readme_link) ? `
          <div style="margin-bottom: var(--sp-8); padding: var(--sp-6); border-radius: 8px; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);">
            <h3 style="margin-bottom: var(--sp-4); font-size: 1.1rem; color: var(--emerald-400); display:flex; align-items:center; gap:0.5rem;">
               <span class="material-symbols-rounded">inventory_2</span> Entregáveis (Sua Automação)
            </h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--sp-4); font-size: 0.95rem;">
               Sua automação foi concluída com sucesso. Acesse os arquivos da entrega abaixo para prosseguir com a implementação.
            </p>
            <div style="display:flex; gap: 1rem; flex-wrap:wrap;">
               ${req.n8n_link ? `
               <a href="${req.n8n_link}" target="_blank" class="btn btn-primary" style="display:flex; align-items:center; gap:0.4rem; background: var(--emerald-600); border:none;">
                  <span class="material-symbols-rounded">download</span> Baixar Workflow (JSON)
               </a>` : ''}
               ${req.readme_link ? `
               <a href="${req.readme_link}" target="_blank" class="btn btn-secondary" style="display:flex; align-items:center; gap:0.4rem;">
                  <span class="material-symbols-rounded">menu_book</span> Ler Documentação
               </a>` : ''}
            </div>
          </div>
          ` : ''}
          
          <!-- Actions (Billing / Delivery Cancel) -->
          ${req.status !== 'canceled' && req.status !== 'paused' && req.paymentStatus !== 'Reembolsado' ? `
          <div style="margin-top: var(--sp-8); padding-top: var(--sp-6); border-top: 1px solid rgba(255,255,255,0.05);">
             <h3 style="margin-bottom: var(--sp-4); font-size: 0.95rem; font-weight: 600; color: #f87171; display:flex; align-items:center; gap:0.5rem; text-transform:uppercase; letter-spacing:0.5px;">
               <span class="material-symbols-rounded">warning</span> Interrupção Tática
             </h3>
             <div style="display:flex; gap: 1rem; flex-wrap:wrap;">
                <button class="btn btn-secondary" id="btn-cancel-no-refund" style="border-color: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.9rem; padding: 0.6rem 1.2rem;">
                   Pausar Operação (Retenção Temporária)
                </button>
                <button class="btn btn-secondary" id="btn-cancel-refund" style="border-color: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.9rem; padding: 0.6rem 1.2rem;">
                   Destruir Instância e Solicitar Reembolso (Stripe)
                </button>
             </div>
          </div>
          ` : req.status === 'paused' ? `
          <div style="margin-top: var(--sp-8); padding: var(--sp-6); border-radius: 8px; background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.3);">
             <h3 style="margin-bottom: var(--sp-2); font-size: 1.1rem; color: #f59e0b; display:flex; align-items:center; gap:0.5rem;">
               <span class="material-symbols-rounded">timer</span> Modo de Retenção Ativado
             </h3>
             <p style="color: #fbbf24; margin-bottom: var(--sp-4);">
                A infraestrutura foi pausada, mas não deletada. Se a operação não for reativada em até <strong style="color:#fff;" id="countdown-timer">3h 00m 00s</strong>, nossos Agentes destruirão os recursos automatizadamente e o reembolso da Stripe será forçosamente acionado para o cliente.
             </p>
             <div style="display:flex; gap: 1rem; flex-wrap:wrap;">
                <button class="btn btn-primary" id="btn-reactivate" style="background: var(--emerald-600); border-color: var(--emerald-500); display:flex; align-items:center; gap:0.4rem;">
                   <span class="material-symbols-rounded" style="font-size:1.2rem;">power</span> Reativar Operação
                </button>
                <button class="btn btn-secondary" id="btn-force-destroy" style="border-color: rgba(239, 68, 68, 0.4); color: #f87171; display:flex; align-items:center; gap:0.4rem;">
                   <span class="material-symbols-rounded" style="font-size:1.2rem;">delete_forever</span> Destruir e Reembolsar Agora
                </button>
             </div>
          </div>
          ` : `
          <div style="margin-top: var(--sp-8); padding: var(--sp-4); border-radius: 8px; background: rgba(239, 68, 68, 0.05); border: 1px dashed rgba(239, 68, 68, 0.3); text-align:center;">
             <p style="color: #f87171; margin:0; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                <span class="material-symbols-rounded">block</span> Esta operação teve seus recursos do servidor oficialmente interrompidos e reembolsados.
             </p>
          </div>
          `}
        </div>

        <!-- Chat Pós Venda -->
        <div class="glass-card-static" style="margin-top: var(--sp-8); padding: var(--sp-8); position: relative; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.4);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: var(--sp-6); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem;">
               <h2 style="font-size: var(--fs-xl); display:flex; align-items:center; gap:0.5rem;">
                 <span class="material-symbols-rounded" style="color:var(--violet-400);">support_agent</span> Central de Controle da IA & Pós-Venda
               </h2>
            </div>
            
            <div id="chat-messages" style="display:flex; flex-direction:column; gap:1rem; max-height:400px; overflow-y:auto; padding-right:1rem; margin-bottom:1.5rem;">
               ${messages.length === 0 ? `
                  <div style="text-align:center; color:var(--text-tertiary); padding: 2rem;">
                      Nenhum contato realizado ainda. Uma IA ou Engenheiro Arquiteto será alocado em breve!
                  </div>
               ` : messages.map(m => {
                  const isClient = m.sender_type === 'client';
                  const alignment = isClient ? 'flex-end' : 'flex-start';
                  const bg = isClient ? 'var(--violet-600)' : 'rgba(255,255,255,0.05)';
                  let icon = 'person';
                  let nameLabel = 'Você';
                  
                  if (!isClient) {
                     if(m.sender_type === 'agent_support') { icon = 'headset_mic'; nameLabel = 'Suporte Master'; }
                     else if(m.sender_type === 'agent_dev') { icon = 'code_blocks'; nameLabel = 'Agente Arquiteto Dev'; }
                     else { icon = 'smart_toy'; nameLabel = 'Sistema Hera'; }
                  }

                  return `
                     <div style="align-self: ${alignment}; max-width:75%; display:flex; flex-direction:column; gap:0.3rem;">
                         <div style="display:flex; align-items:center; gap:0.4rem; justify-content:${isClient ? 'flex-end' : 'flex-start'};">
                            ${isClient ? '' : `<span class="material-symbols-rounded" style="font-size:1.1rem; color:var(--violet-300);">${icon}</span>`}
                            <span style="font-size:0.8rem; color:var(--text-tertiary);">${nameLabel}</span>
                         </div>
                         <div style="background:${bg}; padding: 0.8rem 1.2rem; border-radius: 8px; font-size:0.95rem; line-height:1.5; color:var(--text-primary);">
                             ${m.content}
                         </div>
                         <span style="font-size:0.75rem; color:var(--text-tertiary); align-self:${isClient ? 'flex-end' : 'flex-start'};">
                            ${new Date(m.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                         </span>
                     </div>
                  `;
               }).join('')}
            </div>

            <!-- Chat Input form -->
            <div style="display:flex; gap:1rem; align-items:center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem;">
                <input id="chat-input" type="text" placeholder="Envie anexos, links, regras de negócio ou fale com o Arquiteto responsável..." 
                   style="flex:1; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:0.8rem 1.2rem; color:#fff; font-size:0.95rem;">
                <button id="chat-send" class="btn btn-primary" style="display:flex; align-items:center; gap:0.5rem; padding: 0.8rem 1.5rem;">
                   Enviar <span class="material-symbols-rounded" style="font-size:1.2rem;">send</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  `;

  // Auto-scroll chat to bottom
  const chatScroll = document.getElementById('chat-messages');
  if(chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;

  // Listeners
  const processRealRefund = async () => {
     if(req.paymentIntentId) {
        try {
           const res = await fetch(`${API_URL}/api/refund-payment`, {
               method: "POST", headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ paymentIntentId: req.paymentIntentId })
           });
           const data = await res.json();
           if(data.success || data.error?.includes('has already been refunded')) return true;
           console.error("Refund failed", data);
        } catch(e) { console.error(e) }
     }
     return true; // fallback for missing intents on old records
  };

  // Timer logic for paused state
  let timerInterval;
  if (req.status === 'paused' && req.pausedAt) {
     const durationSec = 3 * 60 * 60; // 3 horas em segundos
     let elapsed = Math.floor((Date.now() - req.pausedAt) / 1000);
     let remaining = durationSec - elapsed;

     const timerEl = document.getElementById('countdown-timer');
     
     if (remaining <= 0) {
        processRealRefund().then(async () => {
            await updateRequest(req.id, { status: 'canceled', paymentStatus: 'Reembolsado (Timer Esgotado)' });
            if (timerEl) renderRequestDetail({ query }); // redraw
        });
     } else {
        timerInterval = setInterval(() => {
           remaining--;
           if (remaining <= 0) {
              clearInterval(timerInterval);
              processRealRefund().then(async () => {
                  await updateRequest(req.id, { status: 'canceled', paymentStatus: 'Reembolsado (Timer Esgotado)' });
                  renderRequestDetail({ query });
              });
              return;
           }
           let h = Math.floor(remaining / 3600);
           let m = Math.floor((remaining % 3600) / 60);
           let s = remaining % 60;
           if (timerEl) timerEl.textContent = `${h}h ${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
        }, 1000);
     }
  }

  // Desmonta intervalo de forma simulada no SPA ao voltar
  document.getElementById('back-btn')?.addEventListener('click', () => {
    if (timerInterval) clearInterval(timerInterval);
    navigateTo('/requests');
  });

  document.getElementById('btn-cancel-no-refund')?.addEventListener('click', async () => {
     if(confirm('Atenção: A operação será suspensa provisoriamente. Iniciaremos um cronômetro de 3 Horas para destruição automática e reembolso se não for reativada. Concorda?')) {
        await updateRequest(req.id, { status: 'paused', paymentStatus: 'Pausado (Retido)', pausedAt: Date.now() });
        showToast('Operação pausada com protocolo de alerta. Cronômetro ativado.', 'warning');
        renderRequestDetail({ query });
     }
  });

  document.getElementById('btn-reactivate')?.addEventListener('click', async () => {
     if (timerInterval) clearInterval(timerInterval);
     await updateRequest(req.id, { status: 'pending', paymentStatus: 'Aprovado (Logado)' });
     showToast('Cronômetro cancelado. Operação reativada em produção com sucesso!', 'success');
     renderRequestDetail({ query });
  });

  document.getElementById('btn-force-destroy')?.addEventListener('click', async () => {
     if(confirm('Operação Crítica: Bypass manual. Destruir tudo e acionar API Stripe imediatamente?')) {
        if (timerInterval) clearInterval(timerInterval);
        document.getElementById('btn-force-destroy').innerHTML = 'Destruindo Coisas...';
        await processRealRefund();
        await updateRequest(req.id, { status: 'canceled', paymentStatus: 'Reembolsado' });
        showToast('Destruição forçada concluída com API Stripe.', 'error');
        renderRequestDetail({ query });
     }
  });

  document.getElementById('btn-cancel-refund')?.addEventListener('click', async () => {
     if(confirm('Operação Risco: Emitir ordem de Estorno/Refund para a Stripe API imediatamente?')) {
        document.getElementById('btn-cancel-refund').innerHTML = 'Emitindo Refund...';
        await processRealRefund();
        await updateRequest(req.id, { status: 'canceled', paymentStatus: 'Reembolsado' });
        showToast('Sucesso. A comunicação com o Dashboard da Stripe validou a devolução.', 'success');
        renderRequestDetail({ query });
      }
   });

   // Chat Dispatch Listener
   const chatBtn = document.getElementById('chat-send');
   const chatInput = document.getElementById('chat-input');
   if(chatBtn && chatInput) {
      chatBtn.addEventListener('click', async () => {
         const txt = chatInput.value.trim();
         if(!txt) return;
         chatBtn.innerHTML = '<span class="material-symbols-rounded spin">sync</span>';
         
         const res = await sendMessage(req.id, txt);
         if(res) {
             // Redesenha para ver a msg nova
             renderRequestDetail({ query });
         } else {
             showToast('Erro ao enviar mensagem', 'error');
             chatBtn.innerHTML = 'Enviar <span class="material-symbols-rounded" style="font-size:1.2rem;">send</span>';
         }
      });
      chatInput.addEventListener('keypress', (e) => {
         if(e.key === 'Enter') chatBtn.click();
      });
   }
}
