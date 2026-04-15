import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzfniibijujmtjgwhpfp.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'victor@neuroopsai.online',
    password: 'taka!@1310!@',
    email_confirm: true,
    user_metadata: { name: 'Victor Takayama (Admin)' }
  });
  
  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already registered')) {
       console.log('O usuario ja esta criado, atualizando e confirmando email...');
       const { data: listData } = await supabase.auth.admin.listUsers();
       const u = listData?.users?.find(u => u.email === 'victor@neuroopsai.online');
       if (u) {
          await supabase.auth.admin.updateUserById(u.id, { email_confirm: true, password: 'taka!@1310!@' });
          console.log('Admin atualizado e verificado com sucesso:', u.id);
       } else { console.log('user not found in list') }
    } else {
       console.error('Erro ao criar admin:', error);
    }
  } else {
    console.log('Admin criado e verificado com sucesso:', data.user?.id);
  }
}

createAdmin();
