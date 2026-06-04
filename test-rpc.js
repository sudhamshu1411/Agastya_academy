import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { error } = await supabase.rpc('update_user_role', { target_user_id: "43e5ac1f-b3eb-43e2-b41d-b656637851e0", new_role: "founder" });
  console.log("RPC Error:", error);
}
test();
