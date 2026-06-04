const SUPABASE_URL = "https://khxuwnhykgxidtcxwntk.supabase.co";
const SUPABASE_KEY = "sb_publishable_aiJK7ZMhQghSxNXUDfLC0w_T4iRkFfh";

async function fetchOpenAPI() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Accept": "application/openapi+json"
    }
  });
  const data = await res.json();
  const schemas = data.components?.schemas || data.definitions || {};
  const tableName = Object.keys(schemas).find(k => k.toLowerCase() === 'admissions');
  if (tableName) {
     console.log("Found:", tableName, Object.keys(schemas[tableName].properties));
  } else {
     console.log("Not found, schemas keys:", Object.keys(schemas));
  }
}

fetchOpenAPI();
