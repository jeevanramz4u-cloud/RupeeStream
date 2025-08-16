import { Express } from 'express';
import { createServer, type Server } from 'http';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../db';

const PgSession = connectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const sessionConfig: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    }
  };

  // Use PostgreSQL store in production, memory store in development
  if (pool && process.env.NODE_ENV === 'production') {
    sessionConfig.store = new PgSession({
      pool: pool,
      tableName: 'sessions'
    });
    console.log('Using PostgreSQL session store');
  } else {
    console.log('Using memory session store (development mode)');
  }

  app.use(session(sessionConfig));

  // Simple auth check endpoint for now
  app.get('/api/auth/check', (req, res) => {
    if (req.session && (req.session as any).userId) {
      res.json({ user: { id: (req.session as any).userId } });
    } else {
      res.json({ user: null });
    }
  });

  // Simple login endpoint for testing
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Development mode test users
    if (process.env.NODE_ENV === 'development') {
      if (email === 'admin@innovativetaskearn.online' && password === 'admin123') {
        (req.session as any).userId = 'admin-001';
        (req.session as any).role = 'admin';
        res.json({ 
          success: true, 
          user: { 
            id: 'admin-001', 
            email: 'admin@innovativetaskearn.online',
            role: 'admin',
            firstName: 'Admin'
          } 
        });
      } else if (email === 'demo@innovativetaskearn.online' && password === 'demo123') {
        (req.session as any).userId = 'user-001';
        (req.session as any).role = 'user';
        res.json({ 
          success: true, 
          user: { 
            id: 'user-001', 
            email: 'demo@innovativetaskearn.online',
            role: 'user',
            firstName: 'Demo'
          } 
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Login not implemented' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Get tasks endpoint
  app.get('/api/tasks', (req, res) => {
    // Return sample tasks for development
    const sampleTasks = [
      { id: '1', title: 'Download Amazon App', category: 'app_download', reward: 15, timeLimit: 20, isActive: true },
      { id: '2', title: 'Review Local Restaurant', category: 'business_review', reward: 20, timeLimit: 20, isActive: true },
      { id: '3', title: 'Subscribe to Tech Channel', category: 'channel_subscribe', reward: 10, timeLimit: 15, isActive: true },
      { id: '4', title: 'Review Product', category: 'product_review', reward: 25, timeLimit: 30, isActive: true },
      { id: '5', title: 'Like and Comment', category: 'comment_like', reward: 5, timeLimit: 10, isActive: true },
      { id: '6', title: 'Watch Video', category: 'youtube_video_see', reward: 8, timeLimit: 15, isActive: true }
    ];
    res.json(sampleTasks);
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}