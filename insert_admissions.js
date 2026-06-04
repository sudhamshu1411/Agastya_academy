const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

async function insertSchema() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/admissions`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    },
    body: JSON.stringify({
      id: "TEST-2",
      studentName: "John Doe"
    })
  });
  const err = await res.text();
  console.log("Response:", err);
}

insertSchema();
