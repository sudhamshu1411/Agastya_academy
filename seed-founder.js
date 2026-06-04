import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim().replace(/^["']|["']$/g, '').replace(/\/+$/, '');
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, '');

const parsedUrl = new URL(supabaseUrl);
const cleanUrl = parsedUrl.origin;

const supabase = createClient(cleanUrl, supabaseKey);

async function main() {
  console.log("Setting up founder...");
  const { data, error } = await supabase.auth.signUp({
    email: 'sudhamshu1411@gmail.com',
    password: 'Chocho1411*',
    options: {
      data: {
        role: 'founder',
        full_name: 'Sudhamshu (Founder)'
      }
    }
  });

  if (error) {
    console.error("Error creating founder:", error.message);
  } else {
    console.log("Founder successfully created:", data.user?.email);
  }
}

main();
