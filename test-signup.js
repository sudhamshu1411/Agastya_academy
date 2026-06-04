import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: "test.signup2@gmail.com",
    password: "password123",
    options: {
      data: {
        full_name: "Test User",
        role: "new user",
        phone: "1234567890"
      }
    }
  });
  console.log("Data:", data, "Error:", error);
}
test();
