export function renderPlatform() {
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div class="platform-page" style="padding: var(--sp-16) 0;">
      <div class="container">
        <h1 style="font-size: 3.5rem; text-align: center; margin-bottom: 2rem; letter-spacing: -0.03em;">
          Nossa <span class="text-gradient">Plataforma</span> Tecnológica
        </h1>
        <p style="text-align: center; color: var(--text-secondary); max-width: 600px; margin: 0 auto 5rem; font-size: 1.25rem;">
          Construímos e integramos pipelines complexas de automação, conectando seu Data Lake com Inteligência Multimodal.
        </p>

        <div style="display: flex; flex-direction: column; gap: 4rem;">
            <div class="glass-card-static" style="padding: 4rem; display: flex; gap: 3rem; align-items: center; border-radius: 2rem;">
                <div style="flex: 1;">
                   <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Engine de Workflows Assíncronos</h2>
                   <p style="color: var(--text-secondary); line-height: 1.6; font-size: 1.1rem; margin-bottom: 1rem;">Integramos sistemas legados através de N8N e Make em clusters de alta disponibilidade. Suas APIs nunca falham.</p>
                   <ul style="color: var(--emerald-400); font-weight: 600; line-height: 2;">
                      <li>✓ Uptime garantido de 99.9%</li>
                      <li>✓ Webhooks nativos c/ retries</li>
                      <li>✓ Integração ERP / CRM</li>
                   </ul>
                </div>
                <div style="flex: 0.8; height: 300px; background: rgba(5,5,10,0.5); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items:center; justify-content:center;">
                    <span class="material-symbols-rounded gradient-emoji" style="font-size: 8rem;">account_tree</span>
                </div>
            </div>

            <div class="glass-card-static" style="padding: 4rem; display: flex; gap: 3rem; align-items: center; border-radius: 2rem; flex-direction: row-reverse;">
                <div style="flex: 1;">
                   <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Machine Learning Intercomunicativo</h2>
                   <p style="color: var(--text-secondary); line-height: 1.6; font-size: 1.1rem; margin-bottom: 1rem;">Agentes que conversam entre si para resolver problemas. O Agente de Vendas valida a chamada de API usando o Agente de Testes antes de reportar a você.</p>
                   <ul style="color: var(--violet-400); font-weight: 600; line-height: 2;">
                      <li>✓ Fine-Tuning Direcionado</li>
                      <li>✓ Context-Window infinito via RAG</li>
                      <li>✓ Monitoramento autônomo</li>
                   </ul>
                </div>
                <div style="flex: 0.8; height: 300px; background: rgba(5,5,10,0.5); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); display: flex; align-items:center; justify-content:center;">
                    <span class="material-symbols-rounded gradient-emoji" style="font-size: 8rem;">psychology</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  `;
}
