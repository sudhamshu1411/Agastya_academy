import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dns from 'dns';
import { createServer as createViteServer } from 'vite';
import * as path from 'path';

dns.setDefaultResultOrder('ipv4first');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory store for OTPs
const otpStore = new Map<string, string>();

function getTransporter() {
  const port = parseInt(process.env.SMTP_PORT || '465');
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER || 'contact@agastyaacademy.online',
      pass: process.env.SMTP_PASS || '', 
    },
  });
}

// API Routes
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

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

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error("Email sending error:", error);
    res.status(500).json({ error: `Failed to send email: ${error.message || 'SMTP error'}` });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const storedOtp = otpStore.get(email);
  if (storedOtp === otp) {
    otpStore.delete(email); // consume OTP
    res.json({ success: true, message: 'Email verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
