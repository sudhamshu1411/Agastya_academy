import { createClient } from '@supabase/supabase-js';

const url = 'https://';
const key = process.env.KEY || 'anon-key';

const client = createClient(url, key);

client.auth.signUp({ email: 'test@example.com', password: 'password123' })
  .then(res => console.log(res))
  .catch(err => console.error(err));
