import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: "sudhamshu1411@gmail.com",
    password: "password123",
  });
  console.log("Data:", data, "Error:", error);
}
test();
