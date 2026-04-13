import { navigateTo } from '../router.js';
import { showToast } from '../components/modal.js';

export function renderDiag() {
  const main = document.getElementById('main-content');
  
  main.innerHTML = `
    <div class="diag-page" style="padding: var(--sp-12) 0;">
      <div class="container" style="max-width: 800px;">
        <h1 style="font-size: var(--fs-4xl); text-align: center; margin-bottom: var(--sp-4);">Diagnóstico <span class="text-gradient">Integrado</span></h1>
        <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--sp-10);">
          Responda a este breve formulário e agende uma chamada de vídeo direta conosco para analisarmos o nível de inteligência e automação aplicável à sua operação real.
        </p>
        
        <div class="glass-card-static" style="padding: var(--sp-8);">
          <form id="diag-form">
            <!-- Dados do Lead -->
            <h3 style="margin-bottom: var(--sp-4); font-size: 1.25rem;">Dados do Lead</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); margin-bottom: var(--sp-4);">
              <div class="form-group"><label class="form-label">Nome Completo *</label><input type="text" id="df-nome" class="form-input" required minlength="3"></div>
              <div class="form-group"><label class="form-label">Email Corporativo *</label><input type="email" id="df-email" class="form-input" required></div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--sp-4); margin-bottom: var(--sp-6);">
              <div class="form-group"><label class="form-label">Empresa *</label><input type="text" id="df-empresa" class="form-input" required minlength="2"></div>
              <div class="form-group"><label class="form-label">Cargo *</label><input type="text" id="df-cargo" class="form-input" required></div>
              <div class="form-group"><label class="form-label">WhatsApp *</label><input type="tel" id="df-telefone" placeholder="+55..." class="form-input" required></div>
            </div>

            <!-- Dados Operacionais -->
            <h3 style="margin-bottom: var(--sp-4); font-size: 1.25rem;">Contexto Operacional</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); margin-bottom: var(--sp-4);">
              <div class="form-group">
                <label class="form-label">Segmento *</label>
                <select id="df-segmento" class="form-input" required style="cursor:pointer;">
                  <option value="">Selecione...</option>
                  <option value="Fintech">Fintech / Financeiro</option>
                  <option value="SaaS">Tecnologia / SaaS</option>
                  <option value="Ecommerce">E-commerce / Varejo</option>
                  <option value="Servicos">Serviços / Agências</option>
                  <option value="Industria">Indústria / Logística</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tamanho da Equipe *</label>
                <select id="df-funcionarios" class="form-input" required>
                  <option value="">Selecione...</option>
                  <option value="1-10">1 a 10 funcionários</option>
                  <option value="11-50">11 a 50 funcionários</option>
                  <option value="51-200">51 a 200 funcionários</option>
                  <option value="200+">Mais de 200</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Desafio Principal *</label>
              <select id="df-desafio" class="form-input" required>
                 <option value="">Qual o maior gargalo atual?</option>
                 <option value="Processos manuais">Processos manuais repetitivos (Copiar/Colar)</option>
                 <option value="Atendimento">Lentidão no Atendimento ao cliente</option>
                 <option value="Analise dados">Falta de Análise de Dados / BI Visível</option>
                 <option value="Fraudes">Fraudes e Custos de Segurança</option>
                 <option value="Integracao">Baixa Integração entre Sistemas</option>
                 <option value="Outro">Outro</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Quais ferramentas vocês usam hoje? (Ex: CRM, ERP, Zapier, etc)</label>
              <textarea id="df-ferramentas" class="form-textarea" rows="2" placeholder="Opcional"></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); margin-bottom: var(--sp-6);">
               <div class="form-group">
                 <label class="form-label">Orçamento Mensal para Inovação</label>
                 <select id="df-orcamento" class="form-input">
                   <option value="">Não sei estimar</option>
                   <option value="<1500">Até R$ 1.500</option>
                   <option value="1500-4000">R$ 1.500 a R$ 4.000</option>
                   <option value="4000-8000">R$ 4.000 a R$ 8.000</option>
                   <option value=">8000">Acima de R$ 8.000</option>
                 </select>
               </div>
               <div class="form-group">
                 <label class="form-label">Melhor turno para reunião *</label>
                 <select id="df-horario" class="form-input" required>
                   <option value="">Selecione...</option>
                   <option value="Manha">Manhã (9-12h)</option>
                   <option value="Tarde">Tarde (13-17h)</option>
                   <option value="Noite">Noite (18-21h)</option>
                   <option value="Qualquer">Qualquer horário</option>
                 </select>
               </div>
            </div>
            
            <div class="form-group" style="margin-bottom: var(--sp-6);">
               <label class="form-label" style="display:block; margin-bottom: var(--sp-2);">Preferência de Ata/Transcrição (via Agente Apollo) *</label>
               <label style="display:flex; align-items:center; gap:0.5rem; color:var(--text-secondary); cursor:pointer;"><input type="radio" name="df-transcricao" value="Completa" checked> Transcrição Completa Pós-Call</label>
               <label style="display:flex; align-items:center; gap:0.5rem; color:var(--text-secondary); cursor:pointer; margin-top:0.5rem;"><input type="radio" name="df-transcricao" value="Resumida"> Apenas Briefing Resumido</label>
            </div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="diag-submit">Avante para o Agendamento (Calendly) →</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.getElementById('diag-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate Apollo Agent Webhook POST
    const btn = document.getElementById('diag-submit');
    btn.innerHTML = `<span class="material-symbols-rounded spin">sync</span> Processando com Agente Apollo...`;
    btn.disabled = true;
    btn.style.opacity = '0.7';
    
    // We would fetch(/api/webhook-diag) here
    setTimeout(() => {
       showToast('Diagnóstico recebido. Você será redirecionado para o Calendly.', 'success');
       
       // Redirect to Calendly embedding or direct link. Since we don't have his calendly, we fake the success popup
       // and redirect to dashboard/home or a calendly placeholder url
       setTimeout(() => {
         window.open('https://calendly.com/', '_blank');
         navigateTo('/');
       }, 1500);
    }, 1500);
  });
}
