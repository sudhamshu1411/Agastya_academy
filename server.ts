import express from 'express';
import cors from 'cors';
import * as path from 'path';
import loginHandler from './api/login';
import sendOtpHandler from './api/send-otp';
import verifyOtpHandler from './api/verify-otp';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

app.all('/api/login', (req, res) => loginHandler(req as any, res as any));
app.all('/api/send-otp', (req, res) => sendOtpHandler(req as any, res as any));
app.all('/api/verify-otp', (req, res) => verifyOtpHandler(req as any, res as any));

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
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

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Only start the server locally or on Render (not deployed as a Vercel serverless function)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
