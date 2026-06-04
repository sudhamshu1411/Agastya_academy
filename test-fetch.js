fetch("https://cbzmdyxztkzpslqv.supabase.co/does/not/exist")
  .then(res => res.text())
  .then(console.log);
