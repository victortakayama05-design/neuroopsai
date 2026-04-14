import { isLoggedIn, getUser, addRequest } from '../auth.js';
import { navigateTo } from '../router.js';
import { plans, complexityLevels, getPlanPrice } from '../data/plans.js';
import { showToast } from '../components/modal.js';
import { API_URL } from '../config.js';

export async function renderCheckout({ query }) {
  const main = document.getElementById('main-content');
  const planId = query?.get('plan');
  const planTypeParam = query?.get('type');
  
  let targetPlan;
  let isSub = false;

  if (planTypeParam === 'subscription') {
      targetPlan = plans.find(p => p.id === planId);
      isSub = true;
  } else if (planTypeParam === 'avulso') {
      targetPlan = complexityLevels.find(p => p.id === planId);
  } else {
      targetPlan = plans.find(p => p.id === planId) || complexityLevels.find(p => p.id === planId);
      isSub = plans.find(p => p.id === planId) ? true : false;
  }

  if (!targetPlan) { navigateTo('/pricing'); return; }

  const originalAmount = targetPlan.priceBRL;
  const sendPlanType = isSub ? 'subscription' : 'payment';
  
  window._checkoutState = {
     planName: targetPlan.name,
     amount: originalAmount,
     type: sendPlanType,
     coupon: null,
     paymentIntentId: null
  };

  main.innerHTML = `
    <div class="checkout-page" style="padding: var(--sp-12) 0;">
      <div class="container" style="max-width: 1000px;">
        <h1 style="font-size: var(--fs-4xl); margin-bottom: 0; line-height: 1.2; text-align: center;">Checkout <span class="text-gradient">NeuroOps.ai</span></h1>
        <p style="color: var(--text-secondary); margin-bottom: var(--sp-8); margin-top: 0.5rem; text-align: center;">
          Complete seu pagamento com segurança sem sair da plataforma. Processado por Stripe.
        </p>

        <div class="checkout-grid" style="display: grid; grid-template-columns: 1fr 400px; gap: var(--sp-8); align-items: start;">
          
          <div class="glass-card-static" style="padding: var(--sp-8);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--sp-6);">
               <h2 style="font-size: var(--fs-xl);">Dados do Pagamento</h2>
               <div style="color:var(--text-tertiary); font-size:var(--fs-sm);">Powered by Stripe</div>
            </div>

            <div style="margin-bottom: var(--sp-6); background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
               <div style="display:flex; gap:0.5rem;">
                 <input type="text" id="coupon-code" placeholder="Código Promocional" style="flex:1; background:transparent; border:1px solid rgba(255,255,255,0.1); color:#fff; padding:0.5rem 1rem; border-radius:4px; text-transform:uppercase;">
                 <button class="btn btn-secondary" id="apply-coupon" style="padding:0.5rem 1rem; font-size:0.9rem;">Aplicar</button>
               </div>
               <div id="coupon-msg" style="font-size:0.8rem; margin-top:0.5rem;"></div>
            </div>

            <form id="payment-form">
              <div id="payment-element" style="min-height: 200px; background: rgba(255,255,255,0.02); border-radius: 8px; padding: 1rem; border: 1px solid rgba(255,255,255,0.05); margin-bottom: var(--sp-6);">
                 <div style="text-align:center; padding: 2rem; color:var(--text-secondary);">
                   <span class="material-symbols-rounded spin">sync</span> Carregando terminal seguro...
                 </div>
              </div>

              <div id="payment-message" class="hidden" style="color: var(--emerald-400); margin-bottom: 1rem; font-size: 0.9rem;"></div>
              <div id="error-message" class="hidden" style="color: #ef4444; margin-bottom: 1rem; font-size: 0.9rem;"></div>

              <button class="btn btn-primary btn-full btn-lg" type="submit" id="submit-payment" disabled>
                <div class="spinner hidden" id="spinner"></div>
                <span id="button-text">Pagar ${getPlanPrice(targetPlan)}</span>
              </button>
            </form>
          </div>

          <div class="glass-card-static" style="padding: var(--sp-8); background: rgba(5,5,10,0.5);">
             <h2 style="font-size: var(--fs-xl); margin-bottom: var(--sp-6);">Sua Solicitação</h2>
             
             <div style="display:flex; justify-content:space-between; margin-bottom: var(--sp-4);">
               <span style="color:var(--text-secondary);">Serviço</span>
               <span style="font-weight:600;">${isSub ? 'Plano Recorrente' : 'Serviço Avulso'}: ${targetPlan.name}</span>
             </div>
             
             <div id="coupon-summary" style="display:none; justify-content:space-between; margin-bottom: var(--sp-2); color:var(--emerald-400);">
               <span>Desconto</span>
               <span id="coupon-summary-val">- R$ 0,00</span>
             </div>
             
             <div class="divider" style="margin:var(--sp-4) 0; height:1px; background: rgba(255,255,255,0.1);"></div>
             
             <div style="display:flex; justify-content:space-between; align-items:center;">
               <span style="font-size:var(--fs-lg); font-weight:700;">Total</span>
               <span id="total-display" style="font-size:var(--fs-2xl); font-weight:800; color:var(--emerald-400);">
                 ${getPlanPrice(targetPlan)}
               </span>
             </div>
             
             <div style="margin-top: 2rem; padding: 1rem; border-radius: 8px; background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.2);">
                <p style="font-size: 0.8rem; color: var(--text-tertiary);"><span class="material-symbols-rounded" style="vertical-align:middle; font-size:1rem; margin-right:4px;">health_and_safety</span> Ambiente em Sandbox. Utilize um cartão de teste (ex: 4242...).</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('apply-coupon').addEventListener('click', async () => {
      const code = document.getElementById('coupon-code').value.trim();
      if(!code) return;
      
      const msg = document.getElementById('coupon-msg');
      msg.textContent = "Validando...";
      msg.style.color = "var(--text-secondary)";
      
      try {
          const res = await fetch(`${API_URL}/api/validate-coupon`, {
             method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
          });
          const data = await res.json();
          if(data.valid) {
             msg.textContent = "Cupom Aplicado!";
             msg.style.color = "var(--emerald-400)";
             window._checkoutState.coupon = code;
             
             let original = window._checkoutState.amount;
             let newTotal = original;
             let discountStr = "";
             
             if(data.coupon.percent_off) {
                newTotal = original - (original * (data.coupon.percent_off / 100));
                discountStr = `${data.coupon.percent_off}% OFF`;
             } else if (data.coupon.amount_off) {
                newTotal = original - (data.coupon.amount_off / 100);
                discountStr = `- R$ ${(data.coupon.amount_off / 100).toLocaleString('pt-BR')}`;
             }
             
             document.getElementById('coupon-summary').style.display = 'flex';
             document.getElementById('coupon-summary-val').textContent = discountStr;
             document.getElementById('total-display').textContent = `R$ ${newTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
             document.getElementById('button-text').textContent = `Pagar R$ ${newTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
             
             initializeStripeElements();
          } else {
             msg.textContent = data.error;
             msg.style.color = "#ef4444";
          }
      } catch(e) {
          msg.textContent = "Erro de conexão";
          msg.style.color = "#ef4444";
      }
  });

  initializeStripeElements();
}

let elementsInstance;
async function initializeStripeElements() {
  const stripe = Stripe('pk_test_51TCp2AD8EK0K9tZ4SK0TVdl1SUGcVC0YDbeJEz5xTwbvmOaiZnbiGVBUmVKrDj7oeylFnupgoxSphLIwy89zrh6y00fo9R4SlI');
  const pel = document.getElementById('payment-element');
  pel.innerHTML = `<div style="text-align:center; padding: 2rem; color:var(--text-secondary);"><span class="material-symbols-rounded spin">sync</span> Carregando terminal...</div>`;
  document.getElementById('submit-payment').disabled = true;

  try {
    const { planName, amount, type, coupon } = window._checkoutState;
    
    // Obter email se estiver logado
    let customerEmail = undefined;
    if (await isLoggedIn()) {
       const u = await getUser();
       customerEmail = u.email;
    }

    const response = await fetch(`${API_URL}/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planName, priceAmount: amount, planType: type, coupon, customerEmail }),
    });
    
    if (!response.ok) throw new Error('Falha no Backend');
    const { clientSecret, paymentIntentId } = await response.json();
    
    window._checkoutState.paymentIntentId = paymentIntentId;

    const appearance = { theme: 'night', labels: 'floating' };
    elementsInstance = stripe.elements({ appearance, clientSecret });

    const paymentElementOptions = { layout: "tabs" };
    const paymentElement = elementsInstance.create("payment", paymentElementOptions);
    
    pel.innerHTML = '';
    paymentElement.mount("#payment-element");
    document.getElementById('submit-payment').disabled = false;

    const form = document.getElementById("payment-form");
    form.onsubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements: elementsInstance,
        redirect: 'if_required' 
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") showMessage(error.message, "error");
        else showMessage("Um erro inesperado ocorreu.", "error");
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        showMessage("Pagamento concluído com sucesso!", "success");
        
        const requestTitle = type === 'subscription' ? `Assinatura: ${planName}` : `Avulso: ${planName}`;
        const requestService = type === 'subscription' ? 'Managed Services' : 'Implementação Avulsa';

        const record = {
          title: requestTitle,
          serviceName: requestService,
          complexityName: planName,
          platformName: 'Stripe API',
          price: amount,
          paymentStatus: 'Processando Transação...',
          paymentTime: new Date().toISOString()
        };

        if (await isLoggedIn()) {
            await addRequest(record, window._checkoutState.paymentIntentId);

            setTimeout(() => {
                showToast('Pagamento Recebido! Em processamento...', 'success');
                window.location.hash = `#/dashboard?payment=success&plan_name=${encodeURIComponent(planName)}`;
            }, 1000);
        } else {
            record.paymentStatus = 'Processando (Guest)...';
            sessionStorage.setItem('pendingPurchase', JSON.stringify({ ...record, paymentIntentId: window._checkoutState.paymentIntentId }));
            setTimeout(() => {
                showToast('Pagamento Aprovado!', 'success');
                window.location.hash = `#/register?payment=success`;
            }, 1000);
        }
      }
      setLoading(false);
    };

  } catch (error) {
    pel.innerHTML = `<p style="color:red; text-align:center;">Erro ao ligar gateway.</p>`;
  }
}

function showMessage(messageText, type) {
  const msgDiv = type === 'error' ? document.getElementById("error-message") : document.getElementById("payment-message");
  msgDiv.classList.remove("hidden");
  msgDiv.textContent = messageText;
  setTimeout(() => { msgDiv.classList.add("hidden"); msgDiv.textContent = ""; }, 5000);
}

function setLoading(isLoading) {
  const submitBtn = document.querySelector("#submit-payment");
  const btnTxt = document.querySelector("#button-text");
  if (isLoading) {
    submitBtn.disabled = true;
    btnTxt.innerHTML = '<span class="material-symbols-rounded spin">sync</span> Processando...';
  } else {
    submitBtn.disabled = false;
    btnTxt.innerHTML = "Tentar Novamente";
  }
}
