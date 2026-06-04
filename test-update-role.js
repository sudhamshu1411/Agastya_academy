import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log("Profiles:", profiles, "Error:", error);
}
test();
