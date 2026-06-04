fetch("https://cbzmdyxztkzpslqv.supabase.co/rest/v1/auth/v1/signup", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'a@a.com', password: '123' })
}).then(r => r.text()).then(console.log);
