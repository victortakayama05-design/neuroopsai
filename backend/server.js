require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Configuração Supabase Backend (Permissões ROOT bypass de RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
const corsOptions = {
  origin: '*', // Allow all origins for Vercel/Cloudflare pages requests
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 0. Webhook da Stripe (Garantir que express.raw seja usado antes do express.json centralizado para conseguir validar assinatura)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (endpointSecret) {
       event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } else {
       event = JSON.parse(req.body); // Fallback para dev local se não tiver secret ainda
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log(`PaymentIntent for ${paymentIntent.amount} was successful! ID: ${paymentIntent.id}`);
    
    // Atualiza o banco de dados via Supabase Admin
    try {
       const { data, error } = await supabase
          .from('requests')
          .update({ 
             status: 'pending', 
             paymentstatus: 'Aprovado (Webhook Verificado)'
          })
          .eq('paymentintentid', paymentIntent.id)
          .select()
          .single();
          
       if (error) console.error("Erro Supabase Update:", error);
       
       if (data && !error) {
           // Buscar dados do usuário (Profile)
           let uEmail = 'Cliente Webhook';
           let uName = 'Usuário Verificado';
           const { data: profile } = await supabase.from('profiles').select('name, email').eq('id', data.user_id).single();
           if (profile) {
              uName = profile.name;
              uEmail = profile.email;
           }

           // Notificar N8N Imediatamente
           const uPlan = data.complexityname || paymentIntent.description;
           
           try {
               const n8nUrl = 'https://n8n.srv1263977.hstgr.cloud/webhook/neuroops-checkout';
               await fetch(n8nUrl, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                    requestId: data.id,
                    source: 'Stripe_Secure_Webhook',
                    service: 'neuroops_automacao',
                    product: uPlan,
                    customerName: uName,
                    customerEmail: uEmail,
                    amount: paymentIntent.amount / 100
                 })
               });
           } catch(n8nError) { console.error("Erro N8N", n8nError); }
       }
    } catch (e) {
       console.error("Falha ao lidar com a request:", e);
    }
  }

  res.json({received: true});
});

app.use(express.json());

// 1. Criação de Intenção de Pagamento
app.post('/create-payment-intent', async (req, res) => {
  const { planName, priceAmount, planType, coupon, customerEmail } = req.body;
  try {
    let finalAmount = priceAmount * 100;
    if (coupon) {
      try {
        const c = await stripe.coupons.retrieve(coupon.toUpperCase());
        if (c.percent_off) finalAmount = finalAmount - (finalAmount * (c.percent_off / 100));
        else if (c.amount_off) finalAmount = finalAmount - c.amount_off;
      } catch(e) {} // ignore invalid
    }
    
    const desc = planType === 'subscription' ? `NeuroOps Subs: ${planName}` : `NeuroOps Avulso: ${planName}`;
    const opts = {
      amount: Math.round(finalAmount), 
      currency: 'brl',
      description: desc,
      automatic_payment_methods: { enabled: true },
    };
    if (customerEmail) {
      opts.receipt_email = customerEmail;
    }
    if (planType === 'subscription') {
        opts.setup_future_usage = 'off_session';
    }
    const paymentIntent = await stripe.paymentIntents.create(opts);
    // IMPORTANTE: Devolvemos não só o clientSecret mas o ID para gravar no BD
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// 2. Catálogo Dinâmico
app.get('/api/sync-catalog', async (req, res) => {
  try {
    const prices = await stripe.prices.list({ limit: 100, active: true, expand: ['data.product'] });
    const catalog = prices.data.map(p => ({
       priceId: p.id,
       productId: p.product.id,
       neuroops_id: p.product.metadata?.neuroops_id,
       neuroops_type: p.product.metadata?.neuroops_type,
       name: p.product.name,
       amount: p.unit_amount / 100,
       currency: p.currency,
       interval: p.recurring ? p.recurring.interval : null
    })).filter(i => i.neuroops_id); // Filtra apenas produtos criados por nós
    res.json(catalog);
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// 3. Validação de Cupom
app.post('/api/validate-coupon', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await stripe.coupons.retrieve(code.toUpperCase());
    res.json({ valid: true, coupon });
  } catch (e) {
    res.status(400).json({ valid: false, error: 'Cupom inválido ou expirado' });
  }
});

// 4. Estorno Legítimo (Refund)
app.post('/api/refund-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer'
    });
    res.json({ success: true, refund });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

// 5. Histórico e Controle Financeiro
app.post('/api/billing-history', async (req, res) => {
  try {
    const { intentIds } = req.body;
    if (!intentIds || !intentIds.length) return res.json([]);
    const results = [];
    for (const id of intentIds) {
       try {
         const pi = await stripe.paymentIntents.retrieve(id);
         results.push(pi);
       } catch(e) {}
    }
    res.json(results);
  } catch (e) { res.status(500).json({ error: e.message }) }
});



// 6. API para Agentes N8N interagirem no Pós-Venda
app.post('/api/agent/reply', async (req, res) => {
  // Chamada vinda do N8N para atualizar o chat
  const { requestId, senderType, content } = req.body;
  if (!requestId || !content) return res.status(400).json({ error: 'Missing params' });

  try {
     const { data, error } = await supabase
        .from('messages')
        .insert([{
           request_id: requestId,
           sender_type: senderType || 'system',
           content: content
        }]);

     if (error) throw error;
     res.json({ success: true, message: 'Reply posted' });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

app.post('/api/agent/status', async (req, res) => {
  // Chamada vinda do N8N para atualizar o andamento do pedido (ex: "Em Desenvolvimento", "Testing")
  const { requestId, newStatus, newPaymentStatus } = req.body;
  if (!requestId) return res.status(400).json({ error: 'Missing requestId' });

  try {
     const updates = { updated_at: new Date().toISOString() };
     if(newStatus) updates.status = newStatus;
     if(newPaymentStatus) updates.paymentstatus = newPaymentStatus;

     const { data, error } = await supabase
        .from('requests')
        .update(updates)
        .eq('id', requestId);

     if (error) throw error;
     res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }) }
});

const PORT = process.env.PORT || 4243;
app.listen(PORT, () => console.log(`NeuroOps Backend escutando na porta ${PORT} com CORS Globalizado!`));
