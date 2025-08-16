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
      const userId = (req.session as any).userId;
      const role = (req.session as any).role;
      
      // Return complete user data for development mode
      if (userId === 'admin-001') {
        res.json({ 
          user: { 
            id: 'admin-001',
            email: 'admin@innovativetaskearn.online',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            balance: 0
          } 
        });
      } else if (userId === 'user-001') {
        res.json({ 
          user: { 
            id: 'user-001',
            email: 'demo@innovativetaskearn.online',
            role: 'user',
            firstName: 'Demo',
            lastName: 'User',
            balance: 0
          } 
        });
      } else {
        res.json({ user: { id: userId, role: role || 'user' } });
      }
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

  // Admin endpoints
  
  // Admin dashboard stats
  app.get('/api/admin/stats', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({
      totalUsers: 156,
      activeUsers: 89,
      totalTasks: 342,
      completedTasks: 278,
      pendingPayouts: 23,
      totalPayoutAmount: 4567,
      todayEarnings: 892,
      weeklyEarnings: 6234
    });
  });
  
  // Admin get all users
  app.get('/api/admin/users', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const sampleUsers = [
      { 
        id: 'user-001', 
        email: 'demo@innovativetaskearn.online', 
        firstName: 'Demo', 
        lastName: 'User',
        role: 'user',
        status: 'active',
        kycStatus: 'verified',
        balance: 250,
        totalEarnings: 1250,
        joinedDate: '2025-01-01'
      },
      { 
        id: 'user-002', 
        email: 'john@example.com', 
        firstName: 'John', 
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        kycStatus: 'pending',
        balance: 180,
        totalEarnings: 980,
        joinedDate: '2025-01-05'
      },
      { 
        id: 'user-003', 
        email: 'sarah@example.com', 
        firstName: 'Sarah', 
        lastName: 'Smith',
        role: 'user',
        status: 'suspended',
        kycStatus: 'verified',
        balance: 0,
        totalEarnings: 560,
        joinedDate: '2024-12-15'
      }
    ];
    
    res.json(sampleUsers);
  });
  
  // Admin get all tasks
  app.get('/api/admin/tasks', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const adminTasks = [
      { 
        id: '1', 
        title: 'Download Amazon App', 
        category: 'app_download', 
        reward: 15, 
        timeLimit: 20, 
        isActive: true,
        completions: 45,
        pendingReviews: 3,
        createdAt: '2025-01-10'
      },
      { 
        id: '2', 
        title: 'Review Local Restaurant', 
        category: 'business_review', 
        reward: 20, 
        timeLimit: 20, 
        isActive: true,
        completions: 32,
        pendingReviews: 5,
        createdAt: '2025-01-12'
      },
      { 
        id: '3', 
        title: 'Subscribe to Tech Channel', 
        category: 'channel_subscribe', 
        reward: 10, 
        timeLimit: 15, 
        isActive: false,
        completions: 78,
        pendingReviews: 0,
        createdAt: '2025-01-08'
      }
    ];
    
    res.json(adminTasks);
  });
  
  // Admin create task
  app.post('/api/admin/tasks', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      completions: 0,
      pendingReviews: 0,
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, task: newTask });
  });
  
  // Admin get pending payouts
  app.get('/api/admin/payouts', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const pendingPayouts = [
      {
        id: 'payout-001',
        userId: 'user-001',
        userName: 'Demo User',
        email: 'demo@innovativetaskearn.online',
        amount: 250,
        requestDate: '2025-01-15',
        status: 'pending',
        method: 'upi'
      },
      {
        id: 'payout-002',
        userId: 'user-002',
        userName: 'John Doe',
        email: 'john@example.com',
        amount: 180,
        requestDate: '2025-01-14',
        status: 'pending',
        method: 'bank'
      }
    ];
    
    res.json(pendingPayouts);
  });
  
  // Admin approve payout
  app.post('/api/admin/payouts/:id/approve', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Payout approved successfully',
      payoutId: req.params.id 
    });
  });
  
  // Admin reject payout
  app.post('/api/admin/payouts/:id/reject', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Payout rejected',
      payoutId: req.params.id 
    });
  });
  
  // Admin approve task submission
  app.post('/api/admin/tasks/:taskId/submissions/:submissionId/approve', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Task submission approved',
      taskId: req.params.taskId,
      submissionId: req.params.submissionId
    });
  });
  
  // Admin reject task submission
  app.post('/api/admin/tasks/:taskId/submissions/:submissionId/reject', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    res.json({ 
      success: true, 
      message: 'Task submission rejected',
      taskId: req.params.taskId,
      submissionId: req.params.submissionId
    });
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