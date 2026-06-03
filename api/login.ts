import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const founderEmail = process.env.FOUNDER_EMAIL || 'sudhamshu1411@gmail.com';
  const founderPassword = process.env.FOUNDER_PASSWORD || 'Password123';

  if (email.toLowerCase() === founderEmail.toLowerCase()) {
    if (password === founderPassword) {
      return res.json({
        success: true,
        user: {
          email: founderEmail,
          role: 'founder',
          fullName: 'Sudhamshu Founder',
          isSuperAdmin: true,
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid founder credentials' });
    }
  }

  return res.status(404).json({ error: 'Not founder, fallback required' });
}
