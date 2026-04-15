import { supabase } from './config/supabase.js';

let currentUser = null;

// Initialize Auth State Listener
export function initAuth() {
  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    } else {
      currentUser = null;
    }
  });
}

// Fetch user profile from DB
async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('fetchProfile error:', error);
      // If profile doesn't exist yet (new signup trigger still running), build minimal user
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        currentUser = {
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || 'Usuário',
          company: authData.user.user_metadata?.company || '',
          phone: authData.user.user_metadata?.phone || '',
          planname: null,
          planName: null,
          plan: null,
          created_at: authData.user.created_at,
          createdAt: authData.user.created_at
        };
      }
      return;
    }
    
    if (data) {
      currentUser = {
        ...data,
        planName: data.planname, // Map lowercased columns to JS spec
        createdAt: data.created_at
      };
    }
  } catch (e) {
    console.error('fetchProfile critical error:', e);
    // Ensure we never leave currentUser null if we have an auth session
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      currentUser = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || 'Usuário',
        planname: null,
        planName: null,
        plan: null,
        created_at: authData.user.created_at,
        createdAt: authData.user.created_at
      };
    }
  }
}

// Ensure user is loaded (with timeout protection)
export async function getUser() {
  if (currentUser) return currentUser;
  
  try {
    const sessionPromise = supabase.auth.getSession();
    // Add 8s timeout to prevent infinite hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getSession timeout')), 8000)
    );
    
    const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
    
    if (error) {
      console.error('getSession error:', error);
      return null;
    }
    
    if (data?.session?.user) {
      await fetchProfile(data.session.user.id);
      return currentUser;
    }
  } catch (e) {
    console.error('getUser error (timeout or network):', e);
  }
  return null;
}

export async function isLoggedIn() {
  const user = await getUser();
  return !!user;
}

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    let msg = error.message;
    if (msg.includes('Invalid login credentials')) {
      msg = 'E-mail ou senha incorretos.';
    }
    return { success: false, error: msg };
  }
  await fetchProfile(data.user.id);
  return { success: true, user: currentUser };
}

export async function register({ name, email, password, company, phone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        company: company || '',
        phone: phone || ''
      }
    }
  });

  if (error) {
    let msg = error.message;
    if (msg.includes('already registered')) {
        msg = 'Este e-mail já está em uso.';
    }
    return { success: false, error: msg };
  }
  
  // Give postgres time to trigger and insert into profiles
  await new Promise(resolve => setTimeout(resolve, 500));
  await fetchProfile(data.user.id);
  return { success: true, user: currentUser };
}

export async function logout() {
  await supabase.auth.signOut();
  currentUser = null;
}

export async function updateUser(updates) {
  const user = await getUser();
  if (!user) return false;

  const dbUpdates = { ...updates };
  if (dbUpdates.planName) {
    dbUpdates.planname = dbUpdates.planName;
    delete dbUpdates.planName;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Update error:', error);
    return false;
  }
  
  currentUser = { ...data, planName: data.planname };
  return true;
}

// Request management
export async function getRequests() {
  const user = await getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error(error);
    return [];
  }
  
  return (data || []).map(r => ({
    ...r,
    serviceName: r.servicename,
    complexityName: r.complexityname,
    platformName: r.platformname,
    paymentStatus: r.paymentstatus,
    paymentIntentId: r.paymentintentid,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

export async function addRequest(request, paymentIntentId) {
  const user = await getUser();
  if (!user) return null;
  
  const isGuestRecovery = request.paymentStatus === 'Processando (Guest)...';
  
  const payload = {
    user_id: user.id,
    service: request.service,
    servicename: request.serviceName,
    complexity: request.complexity,
    complexityname: request.complexityName,
    platform: request.platform,
    platformname: request.platformName,
    title: request.title,
    description: request.description,
    status: isGuestRecovery ? 'pending' : 'processando',
    price: request.price,
    paymentstatus: isGuestRecovery ? 'Aprovado (Webhook Verificado)' : (request.paymentStatus || 'Processando...'),
    paymentintentid: paymentIntentId || null,
  };

  const { data, error } = await supabase
    .from('requests')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Insert Error:', error);
    return null;
  }
  
  if (isGuestRecovery) {
      try {
           const uPlan = data.complexityname || 'Plano Adquirido';
           const n8nUrl = 'https://n8n.srv1263977.hstgr.cloud/webhook/neuroops-checkout';
           fetch(n8nUrl, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                requestId: data.id,
                source: 'Frontend_Guest_Recovery',
                service: 'neuroops_automacao',
                product: uPlan,
                customerName: user.name,
                customerEmail: user.email,
                amount: data.price
             })
           });
      } catch(n8nError) { console.error("Erro N8N Recuperação", n8nError); }
  }
  
  return {
    ...data,
    serviceName: data.servicename,
    complexityName: data.complexityname,
    platformName: data.platformname,
    paymentStatus: data.paymentstatus,
    paymentIntentId: data.paymentintentid,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error || !data) return null;
  
  return {
    ...data,
    serviceName: data.servicename,
    complexityName: data.complexityname,
    platformName: data.platformname,
    paymentStatus: data.paymentstatus,
    paymentIntentId: data.paymentintentid,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export async function updateRequest(id, updates) {
  const dbUpdates = { ...updates };
  if (dbUpdates.paymentIntentId) {
    dbUpdates.paymentintentid = dbUpdates.paymentIntentId;
    delete dbUpdates.paymentIntentId;
  }
  
  if (dbUpdates.paymentStatus) {
    dbUpdates.paymentstatus = dbUpdates.paymentStatus;
    delete dbUpdates.paymentStatus;
  }
  
  const { data, error } = await supabase
    .from('requests')
    .update(dbUpdates)
    .eq('id', id);
    
  if (error) {
    console.error(error);
    return false;
  }
  return true;
}

// Mensageria (Chat entre Cliente e Agentes)
export async function getMessages(requestId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Erro buscando msgs:', error);
    return [];
  }
  return data || [];
}

export async function sendMessage(requestId, content) {
  const user = await getUser();
  if (!user) return null;

  const payload = {
    request_id: requestId,
    sender_type: 'client',
    content: content
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro enviando msg:', error);
    return null;
  }

  // Desperta os Agentes N8N silenciosamente com a mensagem do cliente
  try {
     fetch('https://n8n.srv1263977.hstgr.cloud/webhook/neuroops-chat-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           requestId: requestId, 
           content: content,
           customerName: user.name,
           customerEmail: user.email
        })
     });
  } catch(e) { console.log('Ignored n8n webhook error', e); }

  return data;
}

// ==== ADMIN FUNCTIONS ====
export async function getAllRequests() {
  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro buscando todos requests (Admin):', error);
    return [];
  }
  return data || [];
}

export async function getAllUsersProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Erro buscando usuários (Admin):', error);
    return [];
  }
  return data || [];
}

export async function sendAdminMessage(requestId, content) {
  const payload = {
    request_id: requestId,
    sender_type: 'agent_support', 
    content: content
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro enviando msg Admin:', error);
    return null;
  }
  return data;
}

export async function updateAdminRequest(id, updates) {
  const { data, error } = await supabase
    .from('requests')
    .update(updates)
    .eq('id', id);
    
  if (error) {
    console.error('Upd Admin Req Err:', error);
    return false;
  }
  return true;
}
