import { navigateTo } from '../router.js';
import { plans } from '../data/plans.js';
import { showToast } from '../components/modal.js';
import { isLoggedIn } from '../auth.js';

let currentStep = 1;
const formData = {
  plano: '',
  servicos: [],
  lead: { nome: '', email: '', empresa: '', telefone: '', cargo: '', site: '' },
  contexto: { numFunc: '', funcMensal: '', urgencia: '', conhecimento: '', msg: '' }
};

export function renderNewRequest({ query }) {
  if (!isLoggedIn()) {
    navigateTo('/login');
    return;
  }
  
  if (query?.get('plan')) formData.plano = query.get('plan');
  
  const main = document.getElementById('main-content');
  renderWizard(main);
}

function renderWizard(main) {
  const totalSteps = 4;
  
  main.innerHTML = `
    <div class="wizard-page" style="padding: var(--sp-12) 0;">
      <div class="container" style="max-width: 800px;">
        <h1 style="font-size: var(--fs-4xl); text-align: center; margin-bottom: var(--sp-2);">
          Contratação Oficial <span class="text-gradient">NeuroOps</span>
        </h1>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--sp-8);">
          O Agente Hermes conduzirá o seu registro técnico no ecossistema.
        </p>

        <div class="progress-steps" style="margin-bottom: var(--sp-8);">
          ${[
            { num: 1, label: 'Plano' },
            { num: 2, label: 'Serviços' },
            { num: 3, label: 'Lead' },
            { num: 4, label: 'Contexto' },
          ].map((step, i, arr) => `
            <div class="progress-step ${currentStep > step.num ? 'completed' : ''} ${currentStep === step.num ? 'active' : ''}">
              <div class="progress-step-number">${currentStep > step.num ? '✓' : step.num}</div>
              <span class="progress-step-label">${step.label}</span>
            </div>
            ${i < arr.length - 1 ? '<div class="progress-step-line"></div>' : ''}
          `).join('')}
        </div>

        <div class="glass-card-static" style="padding: var(--sp-8);" id="wizard-form-box">
          ${getStepContent()}
        </div>

        <div style="display:flex; justify-content:space-between; margin-top: var(--sp-6);">
          ${currentStep > 1 ? `<button class="btn btn-secondary" id="wiz-prev">← Voltar</button>` : '<div></div>'}
          ${currentStep < totalSteps ? `<button class="btn btn-primary" id="wiz-next" ${!canAdvance() ? 'disabled style="opacity:0.5"' : ''}>Avançar →</button>` : `<button class="btn btn-emerald" id="wiz-submit">Concluir Solicitação (Checkout)</button>`}
        </div>
      </div>
    </div>
  `;
  
  attachListeners(main);
}

function getStepContent() {
  switch (currentStep) {
    case 1:
      return `
        <h3>Escolha o Plano Mestre *</h3>
        <div style="display:flex; flex-direction:column; gap:1rem; margin-top:1.5rem;">
          ${plans.map(p => `
             <label class="selection-card ${formData.plano === p.id ? 'selected' : ''}" style="display:flex; align-items:center; gap:1rem; padding:1.5rem; text-align:left; cursor:pointer;" data-radio-plan="${p.id}">
               <input type="radio" style="width:20px;height:20px;" ${formData.plano === p.id ? 'checked' : ''} value="${p.id}">
               <div style="flex:1;">
                 <h4 style="font-size:1.2rem;">${p.name}</h4>
                 <div style="color:var(--text-secondary); font-size:0.9rem;">${p.description}</div>
               </div>
               <div style="font-size:1.5rem; font-weight:800; color:var(--emerald-400);">R$ ${p.priceBRL}</div>
             </label>
          `).join('')}
        </div>
      `;
    case 2:
      const ms = ['Automação de Workflows', 'Agentes de IA', 'Business Intelligence', 'Chatbots Inteligentes', 'Prevenção a Fraudes', 'Integração de Dados', 'Managed Services'];
      return `
        <h3>Quais frentes de serviços serão acionadas? * (Múltipla escolha)</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1.5rem;">
          ${ms.map(srv => `
            <label class="selection-card ${formData.servicos.includes(srv) ? 'selected' : ''}" style="display:flex; align-items:center; gap:1rem; padding:1rem; cursor:pointer;" data-check-srv="${srv}">
               <input type="checkbox" style="width:18px;height:18px;" ${formData.servicos.includes(srv) ? 'checked' : ''}>
               <span>${srv}</span>
            </label>
          `).join('')}
        </div>
      `;
    case 3:
      return `
        <h3>Dados do Sponsor do Projeto</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1.5rem;">
           <div class="form-group"><label class="form-label">Nome *</label><input type="text" class="form-input trigger-advance" id="f-nome" value="${formData.lead.nome}"></div>
           <div class="form-group"><label class="form-label">Email *</label><input type="email" class="form-input trigger-advance" id="f-email" value="${formData.lead.email}"></div>
           <div class="form-group"><label class="form-label">Empresa *</label><input type="text" class="form-input trigger-advance" id="f-emp" value="${formData.lead.empresa}"></div>
           <div class="form-group"><label class="form-label">WhatsApp *</label><input type="tel" class="form-input trigger-advance" id="f-tel" value="${formData.lead.telefone}"></div>
           <div class="form-group"><label class="form-label">Cargo</label><input type="text" class="form-input" id="f-cargo" value="${formData.lead.cargo}"></div>
           <div class="form-group"><label class="form-label">Site (URL)</label><input type="url" class="form-input" id="f-site" value="${formData.lead.site}"></div>
        </div>
      `;
    case 4:
      return `
        <h3>Contexto Tático</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-top:1.5rem; margin-bottom:1.5rem;">
           <div class="form-group"><label class="form-label">Nº Funcionários *</label>
             <select class="form-input trigger-advance" id="c-func">
               <option value="">Selecione...</option>
               <option value="1-10" ${formData.contexto.numFunc==='1-10'?'selected':''}>1 a 10</option>
               <option value="11-50" ${formData.contexto.numFunc==='11-50'?'selected':''}>11 a 50</option>
               <option value="51-200" ${formData.contexto.numFunc==='51-200'?'selected':''}>51 a 200</option>
               <option value="500+" ${formData.contexto.numFunc==='500+'?'selected':''}>Mais de 500</option>
             </select>
           </div>
           <div class="form-group"><label class="form-label">Urgência de Deploy *</label>
             <select class="form-input trigger-advance" id="c-urgencia">
               <option value="">Selecione...</option>
               <option value="Imediato" ${formData.contexto.urgencia==='Imediato'?'selected':''}>Imediato (Crítico)</option>
               <option value="Mes" ${formData.contexto.urgencia==='Mes'?'selected':''}>Próximo mês</option>
             </select>
           </div>
        </div>
        <div class="form-group" style="margin-bottom:1.5rem;"><label class="form-label">Faturamento Mensal Estimado</label>
           <select class="form-input" id="c-fat">
             <option value="">Selecione...</option>
             <option value="<50k" ${formData.contexto.funcMensal==='<50k'?'selected':''}>Até R$ 50k</option>
             <option value="50-200" ${formData.contexto.funcMensal==='50-200'?'selected':''}>R$ 50k - R$ 200k</option>
             <option value=">200k" ${formData.contexto.funcMensal==='>200k'?'selected':''}>Mais de R$ 200k</option>
           </select>
        </div>
        <div class="form-group"><label class="form-label">Mensagem Livre para o Agente Hermes</label>
           <textarea class="form-textarea" rows="3" id="c-msg">${formData.contexto.msg}</textarea>
        </div>
      `;
  }
}

function canAdvance() {
  if (currentStep === 1) return formData.plano !== '';
  if (currentStep === 2) return formData.servicos.length > 0;
  if (currentStep === 3) return formData.lead.nome.length >= 3 && formData.lead.email.includes('@') && formData.lead.empresa.length >= 2 && formData.lead.telefone.length >= 8;
  if (currentStep === 4) return formData.contexto.numFunc !== '' && formData.contexto.urgencia !== '';
  return true;
}

function syncInputs() {
  const fi = (id, obj, key) => { const el = document.getElementById(id); if (el) { el.addEventListener('input', e => { obj[key] = e.target.value; updateBtn(); }); } };
  if (currentStep === 3) {
    fi('f-nome', formData.lead, 'nome'); fi('f-email', formData.lead, 'email'); fi('f-emp', formData.lead, 'empresa');
    fi('f-tel', formData.lead, 'telefone'); fi('f-cargo', formData.lead, 'cargo'); fi('f-site', formData.lead, 'site');
  }
  if (currentStep === 4) {
    fi('c-func', formData.contexto, 'numFunc'); fi('c-urgencia', formData.contexto, 'urgencia');
    fi('c-fat', formData.contexto, 'funcMensal'); fi('c-msg', formData.contexto, 'msg');
  }
}

function updateBtn() {
  const btn = document.getElementById('wiz-next') || document.getElementById('wiz-submit');
  if (!btn) return;
  if (canAdvance()) { btn.removeAttribute('disabled'); btn.style.opacity = '1'; }
  else { btn.setAttribute('disabled', 'true'); btn.style.opacity = '0.5'; }
}

function attachListeners(main) {
  syncInputs();
  
  if (currentStep === 1) {
    main.querySelectorAll('[data-radio-plan]').forEach(el => {
      el.addEventListener('click', () => { formData.plano = el.getAttribute('data-radio-plan'); renderWizard(main); });
    });
  }
  if (currentStep === 2) {
    main.querySelectorAll('[data-check-srv]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent double click trigger if they click the actual input vs the label
        e.preventDefault(); 
        const srv = el.getAttribute('data-check-srv');
        if (formData.servicos.includes(srv)) formData.servicos = formData.servicos.filter(x => x !== srv);
        else formData.servicos.push(srv);
        renderWizard(main);
      });
    });
  }

  document.getElementById('wiz-prev')?.addEventListener('click', () => { currentStep--; renderWizard(main); });
  document.getElementById('wiz-next')?.addEventListener('click', () => { if(canAdvance()){ currentStep++; renderWizard(main); } });
  
  // Submit -> Hermes Agent -> Route Checkout Hera
  document.getElementById('wiz-submit')?.addEventListener('click', () => {
    if(canAdvance()) {
       // N8N Webhook emulation
       showToast('Agente Hermes computando análise (Lead Score)...', 'success');
       
       setTimeout(() => {
          // Pass control to Hera / Checkout
          navigateTo(`/checkout?plan=${formData.plano}`);
       }, 2000);
    }
  });
}
