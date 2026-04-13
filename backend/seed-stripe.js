require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const plans = [
  { id: 'starter', name: 'Starter', price: 497, type: 'subscription' },
  { id: 'growth', name: 'Growth', price: 1497, type: 'subscription' },
  { id: 'scale', name: 'Scale', price: 3997, type: 'subscription' },
  { id: 'enterprise', name: 'Enterprise', price: 7997, type: 'subscription' },
  { id: 'avulso-basico', name: 'Projeto Avulso: Básico', price: 3997, type: 'avulso' },
  { id: 'avulso-pro', name: 'Projeto Avulso: Pro', price: 9997, type: 'avulso' },
  { id: 'avulso-enterprise', name: 'Projeto Avulso: Enterprise', price: 25000, type: 'avulso' },
];

async function seed() {
  console.log('Sincronizando Catálogo com a Stripe (NeuroOps Sandbox)...');
  const existingProducts = await stripe.products.list({ limit: 100 });
  
  for (const plan of plans) {
    let prod = existingProducts.data.find(p => p.metadata.neuroops_id === plan.id);
    
    if (!prod) {
      console.log("Criando Produto: " + plan.name + "...");
      prod = await stripe.products.create({
        name: plan.name,
        metadata: { neuroops_id: plan.id, neuroops_type: plan.type }
      });
    }

    const existingPrices = await stripe.prices.list({ product: prod.id, active: true });
    if (existingPrices.data.length === 0) {
      console.log("Criando Preço para " + plan.name + ": R$ " + plan.price);
      await stripe.prices.create({
        product: prod.id,
        unit_amount: plan.price * 100,
        currency: 'brl',
        recurring: plan.type === 'subscription' ? { interval: 'month' } : undefined,
      });
    }
  }

  // Criar cupom padrão
  const coupons = await stripe.coupons.list();
  if (!coupons.data.find(c => c.id === 'NEUROOPS100')) {
     console.log('Criando Cupom NEUROOPS100...');
     await stripe.coupons.create({
       id: 'NEUROOPS100',
       amount_off: 10000, // R$ 100,00
       currency: 'brl',
       duration: 'once',
       name: 'Desconto de Boas Vindas'
     });
  }
  
  console.log('Mapeamento Concluído!');
}

seed().catch(console.error);
