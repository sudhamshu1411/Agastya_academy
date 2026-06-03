import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const otpStore = new Map<string, string>(); // Note: In a real serverless env, memory usually doesn't persist across requests properly. We use this for basic demo.

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const portStr = process.env.SMTP_PORT || '465';
  const port = parseInt(portStr);
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';
  
  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    family: 4, 
    auth: {
      user: process.env.SMTP_USER || 'contact@agastyaacademy.online',
      pass: process.env.SMTP_PASS || '', 
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
  } as any);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp); // In Vercel this will only work if the same lambda handles verification! Better to store it globally if possible, but this is a mock.

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Agastya Academy" <${process.env.SMTP_USER || 'contact@agastyaacademy.online'}>`,
      to: email,
      subject: 'Your Agastya Academy Verification Code',
      html: `
        <div style="font-family: monospace; padding: 20px; background: #f8fafc; border: 1px solid #0f172a; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <h2 style="font-family: Georgia, serif; font-style: italic; margin-bottom: 20px;">Agastya Academy</h2>
          <p>Your portal access verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 0.5em; padding: 20px; text-align: center; background: #fff; border: 1px solid #e2e8f0; margin: 20px 0;">
             ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b;">If you did not request this code, please ignore this email.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'OTP sent successfully', otp_demo: otp }); // Since Vercel lambda loses memory, we might need to send it back or use DB.
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to send email' });
  }
}
