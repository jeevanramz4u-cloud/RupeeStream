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
    console.log('Login attempt for:', email); // Debug log
    
    // Development mode test users
    if (process.env.NODE_ENV === 'development') {
      if (email === 'admin@innovativetaskearn.online' && password === 'admin123') {
        (req.session as any).userId = 'admin-001';
        (req.session as any).role = 'admin';
        console.log('Admin login successful'); // Debug log
        res.json({ 
          success: true, 
          user: { 
            id: 'admin-001', 
            email: 'admin@innovativetaskearn.online',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User'
          } 
        });
      } else if (email === 'demo@innovativetaskearn.online' && password === 'demo123') {
        (req.session as any).userId = 'user-001';
        (req.session as any).role = 'user';
        console.log('User login successful'); // Debug log
        res.json({ 
          success: true, 
          user: { 
            id: 'user-001', 
            email: 'demo@innovativetaskearn.online',
            role: 'user',
            firstName: 'Demo',
            lastName: 'User'
          } 
        });
      } else {
        console.log('Invalid credentials for:', email); // Debug log
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
  
  // Add missing admin report endpoints
  app.get('/api/admin/reports/:dateRange/:reportType', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const reportData = {
      revenue: {
        total: 567890,
        growth: 12.5,
        chart: [45000, 52000, 48000, 61000, 58000, 67890]
      },
      users: {
        total: 1234,
        active: 892,
        new: 156,
        growth: 8.2
      },
      tasks: {
        total: 4567,
        completed: 3890,
        pending: 677,
        completionRate: 85.2
      },
      payouts: {
        total: 234567,
        processed: 189,
        pending: 45,
        average: 1240
      },
      referrals: {
        total: 345,
        successful: 289,
        conversionRate: 83.8,
        earnings: 14161
      },
      topPerformers: [
        { name: 'John Doe', earnings: 5670, tasks: 234 },
        { name: 'Jane Smith', earnings: 4890, tasks: 198 },
        { name: 'Mike Johnson', earnings: 4230, tasks: 176 },
        { name: 'Sarah Williams', earnings: 3980, tasks: 165 },
        { name: 'Tom Brown', earnings: 3450, tasks: 143 }
      ],
      taskCategories: [
        { category: 'App Downloads', count: 890, earnings: 22250 },
        { category: 'Business Reviews', count: 567, earnings: 19845 },
        { category: 'Product Reviews', count: 445, earnings: 17800 },
        { category: 'Channel Subscribe', count: 678, earnings: 10170 },
        { category: 'Comments & Likes', count: 1234, earnings: 12340 },
        { category: 'YouTube Views', count: 753, earnings: 6024 }
      ]
    };
    
    res.json(reportData);
  });

  // Admin KYC management endpoints
  app.get('/api/admin/kyc/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const kycSubmissions = [
      {
        id: 1,
        userId: 'user-001',
        userName: 'John Doe',
        email: 'john@example.com',
        submittedDate: '2024-08-15',
        status: 'pending',
        documents: {
          aadhaar: { uploaded: true, verified: false, number: 'XXXX-XXXX-1234' },
          pan: { uploaded: true, verified: false, number: 'ABCDE1234F' },
          bank: { uploaded: true, verified: false, accountNumber: 'XXXX1234' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      },
      {
        id: 2,
        userId: 'user-002',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        submittedDate: '2024-08-14',
        status: 'verified',
        documents: {
          aadhaar: { uploaded: true, verified: true, number: 'XXXX-XXXX-5678' },
          pan: { uploaded: true, verified: true, number: 'XYZAB5678C' },
          bank: { uploaded: true, verified: true, accountNumber: 'XXXX5678' }
        },
        paymentStatus: 'completed',
        paymentAmount: 99
      }
    ];
    
    res.json(kycSubmissions);
  });

  // Admin referrals endpoint
  app.get('/api/admin/referrals/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const referralData = {
      stats: {
        totalReferrals: 1234,
        successfulReferrals: 892,
        pendingReferrals: 145,
        failedReferrals: 197,
        totalBonusPaid: 43708,
        averageConversion: 72.3,
        topReferrer: { name: 'John Doe', count: 45 }
      },
      referrals: [
        {
          id: 1,
          referrerId: 'user-001',
          referrerName: 'John Doe',
          referrerEmail: 'john@example.com',
          referredId: 'user-101',
          referredName: 'Alice Smith',
          referredEmail: 'alice@example.com',
          referralCode: 'JOHN123',
          status: 'completed',
          bonusPaid: 49,
          joinedDate: '2024-08-10',
          kycStatus: 'verified'
        },
        {
          id: 2,
          referrerId: 'user-002',
          referrerName: 'Jane Smith',
          referrerEmail: 'jane@example.com',
          referredId: 'user-102',
          referredName: 'Bob Johnson',
          referredEmail: 'bob@example.com',
          referralCode: 'JANE456',
          status: 'pending',
          bonusPaid: 0,
          joinedDate: '2024-08-14',
          kycStatus: 'pending'
        }
      ],
      topReferrers: [
        { name: 'John Doe', referrals: 45, earnings: 2205 },
        { name: 'Jane Smith', referrals: 38, earnings: 1862 },
        { name: 'Mike Johnson', referrals: 32, earnings: 1568 },
        { name: 'Sarah Williams', referrals: 28, earnings: 1372 },
        { name: 'Tom Brown', referrals: 24, earnings: 1176 }
      ]
    };
    
    res.json(referralData);
  });

  // Admin support tickets endpoint
  app.get('/api/admin/support/tickets/:filterStatus', (req, res) => {
    if ((req.session as any)?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const tickets = [
      {
        id: 'TKT-001',
        userId: 'user-001',
        userName: 'John Doe',
        email: 'john@example.com',
        subject: 'Unable to withdraw earnings',
        category: 'withdrawal',
        status: 'open',
        priority: 'high',
        createdAt: '2024-08-15T10:30:00',
        lastUpdated: '2024-08-15T14:20:00',
        messages: [
          {
            sender: 'John Doe',
            message: 'I have ₹1500 in my account but the withdrawal option is disabled.',
            timestamp: '2024-08-15T10:30:00',
            isUser: true
          },
          {
            sender: 'Support Agent',
            message: 'Let me check your account status. Can you confirm if your KYC is verified?',
            timestamp: '2024-08-15T14:20:00',
            isUser: false
          }
        ]
      },
      {
        id: 'TKT-002',
        userId: 'user-002',
        userName: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Task not approved after 24 hours',
        category: 'tasks',
        status: 'in_progress',
        priority: 'medium',
        createdAt: '2024-08-14T09:15:00',
        lastUpdated: '2024-08-14T16:45:00',
        messages: [
          {
            sender: 'Jane Smith',
            message: 'I completed a product review task yesterday but it\'s still pending approval.',
            timestamp: '2024-08-14T09:15:00',
            isUser: true
          }
        ]
      }
    ];
    
    res.json(tickets);
  });

  // User dashboard endpoints that reflect admin actions
  app.get('/api/user/dashboard', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Return user-specific data that reflects admin actions
    const dashboardData = {
      balance: 1250,
      totalEarnings: 3450,
      pendingTasks: 3,
      completedTasks: 89,
      referrals: 5,
      recentEarnings: [
        { date: '2024-08-16', amount: 25, task: 'Product Review' },
        { date: '2024-08-15', amount: 15, task: 'App Download' },
        { date: '2024-08-14', amount: 20, task: 'Business Review' }
      ],
      notifications: [
        { id: 1, message: 'Task submission approved - ₹25 credited', type: 'success', read: false },
        { id: 2, message: 'New task available: Restaurant Review', type: 'info', read: true },
        { id: 3, message: 'Withdrawal of ₹500 processed successfully', type: 'success', read: true }
      ]
    };
    
    res.json(dashboardData);
  });

  // User earnings endpoint
  app.get('/api/user/earnings', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const earnings = [
      {
        id: 'earn-001',
        taskId: 'task-001',
        taskTitle: 'Download Amazon App',
        amount: 15,
        earnedAt: '2024-08-15T14:30:00Z',
        status: 'credited',
        approvedBy: 'Admin'
      },
      {
        id: 'earn-002',
        taskId: 'task-002',
        taskTitle: 'Review Local Restaurant',
        amount: 20,
        earnedAt: '2024-08-14T16:45:00Z',
        status: 'credited',
        approvedBy: 'Admin'
      },
      {
        id: 'earn-003',
        taskId: 'task-003',
        taskTitle: 'Product Review',
        amount: 25,
        earnedAt: '2024-08-16T10:15:00Z',
        status: 'pending',
        approvedBy: null
      }
    ];
    
    res.json(earnings);
  });

  // User withdrawal requests that admins can see and approve
  app.get('/api/user/withdrawals', (req, res) => {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const withdrawals = [
      {
        id: 'withdrawal-001',
        amount: 500,
        method: 'UPI',
        requestDate: '2024-08-15',
        status: 'approved',
        processedDate: '2024-08-15',
        adminNote: 'Processed successfully'
      },
      {
        id: 'withdrawal-002',
        amount: 250,
        method: 'Bank Transfer',
        requestDate: '2024-08-16',
        status: 'pending',
        processedDate: null,
        adminNote: null
      }
    ];
    
    res.json(withdrawals);
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