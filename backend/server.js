require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const corsOptions = {
  origin: '*', // Allow all origins for Vercel/Cloudflare pages requests
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// 1. Criação de Intenção de Pagamento
app.post('/create-payment-intent', async (req, res) => {
  const { planName, priceAmount, planType, coupon } = req.body;
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

const PORT = process.env.PORT || 4243;
app.listen(PORT, () => console.log(`NeuroOps Backend escutando na porta ${PORT} com CORS Globalizado!`));
