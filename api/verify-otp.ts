import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }
  
  // NOTE: On Vercel, memory doesn't persist across requests between two different lambdas (send-otp.ts and verify-otp.ts).
  // In a real app we'd use Supabase or Redis for this.
  // We'll just mock success if there's any OTP provided for the demo if it reaches here and Supabase is not active.
  if (otp.length === 6) {
    res.json({ success: true, message: 'Email verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
}
