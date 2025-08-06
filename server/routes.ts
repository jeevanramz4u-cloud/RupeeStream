import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { 
  insertVideoSchema, 
  insertVideoProgressSchema, 
  insertPayoutRequestSchema,
  insertChatMessageSchema 
} from "@shared/schema";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Traditional login/signup endpoints (alternative to Replit auth)
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        address,
        city,
        state,
        pincode,
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        governmentIdType,
        governmentIdNumber,
        governmentIdUrl
      } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user with all provided information
      const userData = {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        address,
        city,
        state,
        pincode,
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        governmentIdType,
        governmentIdNumber,
        governmentIdUrl,
        verificationStatus: 'pending',
        status: 'active',
        balance: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      const newUser = await storage.createUserWithTraditionalAuth(userData);

      // Create session for the new user
      req.session.userId = newUser.id;
      
      res.json({ message: "Account created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if account is suspended
      if (user.status === 'suspended') {
        return res.status(403).json({ message: "Account is suspended. Please contact support." });
      }

      // Verify password
      const bcrypt = await import('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session
      req.session.userId = user.id;

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ message: "Login successful", user: userWithoutPassword });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check authentication status
  app.get('/api/auth/check', async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error checking auth:", error);
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Traditional auth middleware
  const isTraditionallyAuthenticated = async (req: any, res: any, next: any) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      req.user = user;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  // The endpoint for getting the upload URL for an object entity (authenticated users)
  app.post("/api/objects/upload", isTraditionallyAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Temporary upload endpoint for signup process (no auth required)
  app.post("/api/objects/upload-temp", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // User routes
  app.put('/api/user/bank-details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bankDetails } = req.body;
      
      const user = await storage.updateUser(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating bank details:", error);
      res.status(500).json({ message: "Failed to update bank details" });
    }
  });

  app.put('/api/user/government-id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { governmentIdURL } = req.body;
      
      if (!governmentIdURL) {
        return res.status(400).json({ error: "governmentIdURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        governmentIdURL,
        {
          owner: userId,
          visibility: "private",
        }
      );

      const user = await storage.updateUser(userId, { governmentIdUrl: objectPath });
      res.json({ user, objectPath });
    } catch (error) {
      console.error("Error updating government ID:", error);
      res.status(500).json({ message: "Failed to update government ID" });
    }
  });

  // KYC routes for traditional auth users
  app.get("/api/kyc/status", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        kycStatus: user.kycStatus,
        kycFeePaid: user.kycFeePaid,
        kycSubmittedAt: user.kycSubmittedAt,
        kycApprovedAt: user.kycApprovedAt,
      });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post("/api/kyc/submit", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { governmentIdType, governmentIdNumber, govIdFrontUrl, govIdBackUrl, selfieWithIdUrl } = req.body;
      
      if (!governmentIdType || !governmentIdNumber || !govIdFrontUrl || !govIdBackUrl || !selfieWithIdUrl) {
        return res.status(400).json({ message: "All KYC fields are required" });
      }

      await storage.updateUserKycDocuments(userId, {
        governmentIdType,
        governmentIdNumber,
        govIdFrontUrl,
        govIdBackUrl,
        selfieWithIdUrl,
        kycStatus: "submitted",
        kycSubmittedAt: new Date(),
      });

      res.json({ message: "KYC documents submitted successfully" });
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC documents" });
    }
  });

  app.put("/api/kyc/document", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { documentUrl, documentType } = req.body;
      const userId = req.user.id;
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        documentUrl,
        {
          owner: userId,
          visibility: "private", // KYC documents should be private
        },
      );

      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting document ACL:", error);
      res.status(500).json({ message: "Failed to process document" });
    }
  });

  app.post("/api/kyc/pay-fee", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For demo purposes, we'll simulate payment success
      // In production, this would integrate with a real payment gateway
      const paymentId = `kyc_payment_${Date.now()}_${userId}`;
      
      // Update payment status and automatically approve KYC
      await storage.updateUserKycPaymentAndApprove(userId, {
        kycFeePaid: true,
        kycFeePaymentId: paymentId,
        kycStatus: "approved",
        verificationStatus: "verified",
        kycApprovedAt: new Date(),
      });

      res.json({ 
        message: "KYC fee payment successful - Verification completed!",
        paymentId: paymentId,
        kycStatus: "approved"
      });
    } catch (error) {
      console.error("Error processing KYC fee payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Object storage routes for file uploads
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req as any).user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Video routes
  app.get('/api/videos', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const videos = await storage.getVideos(limit);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  app.get('/api/videos/:id', async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Admin video management routes (moved to separate admin endpoints)
  app.post('/api/admin/videos', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { insertVideoSchema } = await import('@shared/schema');
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      res.status(500).json({ message: "Failed to create video" });
    }
  });

  app.put('/api/admin/videos/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const video = await storage.updateVideo(req.params.id, req.body);
      res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ message: "Failed to update video" });
    }
  });

  app.delete('/api/admin/videos/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const success = await storage.deleteVideo(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video" });
    }
  });

  // Video progress routes
  app.get('/api/video-progress/:videoId', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getVideoProgress(userId, req.params.videoId);
      res.json(progress || { watchedSeconds: 0, isCompleted: false });
    } catch (error) {
      console.error("Error fetching video progress:", error);
      res.status(500).json({ message: "Failed to fetch video progress" });
    }
  });

  app.put('/api/video-progress/:videoId', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { watchedSeconds } = req.body;
      
      const progress = await storage.updateVideoProgress(userId, req.params.videoId, watchedSeconds);
      
      // Update daily watch time
      const video = await storage.getVideo(req.params.videoId);
      if (video && watchedSeconds > 0) {
        const minutes = Math.floor(watchedSeconds / 60);
        await storage.updateDailyWatchTime(userId, minutes);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating video progress:", error);
      res.status(500).json({ message: "Failed to update video progress" });
    }
  });

  app.post('/api/video-progress/:videoId/complete', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const videoId = req.params.videoId;
      
      const video = await storage.getVideo(videoId);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const progress = await storage.completeVideo(userId, videoId);
      
      res.json(progress);
    } catch (error) {
      console.error("Error completing video:", error);
      res.status(500).json({ message: "Failed to complete video" });
    }
  });

  // Earnings routes (traditional auth)
  app.get('/api/earnings', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userEarnings = await storage.getEarnings(userId);
      res.json(userEarnings);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: "Failed to fetch earnings" });
    }
  });

  app.get('/api/earnings/stats', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id; // Use traditional auth user ID
      const totalEarnings = await storage.getTotalEarnings(userId);
      const todayEarnings = await storage.getTodayEarnings(userId);
      const dailyWatchTime = await storage.getDailyWatchTime(userId);
      
      res.json({
        totalEarnings,
        todayEarnings,
        dailyWatchTime,
        targetWatchTime: 480, // 8 hours in minutes
      });
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      res.status(500).json({ message: "Failed to fetch earnings stats" });
    }
  });

  // Referral routes
  app.get('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getReferrals(userId);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.post('/api/referrals/signup', async (req, res) => {
    try {
      const { referralCode, newUserId } = req.body;
      
      if (!referralCode || !newUserId) {
        return res.status(400).json({ message: "Referral code and new user ID are required" });
      }

      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      const referral = await storage.createReferral({
        referrerId: referrer.id,
        referredId: newUserId,
      });

      res.json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: "Failed to create referral" });
    }
  });

  // Admin payout management routes
  app.get('/api/admin/payouts', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      const payouts = await storage.getPayoutRequests();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.put('/api/admin/payouts/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { status } = req.body;
      const payout = await storage.updatePayoutStatus(req.params.id, status);
      res.json(payout);
    } catch (error) {
      console.error("Error updating payout:", error);
      res.status(500).json({ message: "Failed to update payout" });
    }
  });

  // Regular user payout routes
  app.get('/api/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payouts = await storage.getPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post('/api/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.accountHolderName || !user.accountNumber || !user.ifscCode || !user.bankName) {
        return res.status(400).json({ message: "Bank details not provided" });
      }

      if (user.verificationStatus !== 'verified') {
        return res.status(400).json({ message: "Account not verified" });
      }

      const { amount } = req.body;
      const bankDetails = JSON.stringify({
        accountHolderName: user.accountHolderName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        bankName: user.bankName,
      });
      
      const payout = await storage.createPayoutRequest({
        userId,
        amount,
        bankDetails,
      });

      res.json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Admin analytics routes
  app.get('/api/admin/analytics', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      // Get comprehensive analytics for admin dashboard
      const [users, videos, payouts, totalEarnings] = await Promise.all([
        storage.getUsersForVerification(),
        storage.getVideos(),
        storage.getPayoutRequests(),
        storage.getTotalEarnings("")
      ]);

      const analytics = {
        totalUsers: users.length,
        verifiedUsers: users.filter(u => u.verificationStatus === 'verified').length,
        pendingVerifications: users.filter(u => u.verificationStatus === 'pending').length,
        totalVideos: videos.length,
        totalPayouts: payouts.length,
        pendingPayouts: payouts.filter(p => p.status === 'pending').length,
        completedPayouts: payouts.filter(p => p.status === 'completed').length,
        totalEarnings: totalEarnings || 0,
        totalPayoutAmount: payouts
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0)
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Admin authentication routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { adminLoginSchema } = await import('@shared/schema');
      const { authenticateAdmin } = await import('./adminAuth');
      
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const admin = await authenticateAdmin(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.adminUser = admin;
      res.json({ 
        id: admin.id, 
        username: admin.username, 
        name: admin.name 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/admin/logout', async (req, res) => {
    try {
      const { logoutAdmin } = await import('./adminAuth');
      logoutAdmin(req);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get('/api/admin/auth/user', async (req, res) => {
    if (req.session.adminUser) {
      res.json({
        id: req.session.adminUser.id,
        username: req.session.adminUser.username,
        name: req.session.adminUser.name
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Admin routes (updated to use admin authentication)
  app.get('/api/admin/users', async (req: any, res) => {
    try {
      const { isAdminAuthenticated } = await import('./adminAuth');
      
      // Check admin authentication
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin - Update user verification status
  app.put("/api/admin/users/:id/verification", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!["pending", "verified", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid verification status" });
      }

      const user = await storage.updateUserVerification(id, status);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user verification:", error);
      res.status(500).json({ message: "Failed to update user verification" });
    }
  });

  // Admin - Update user account status (suspend/unsuspend)
  app.put("/api/admin/users/:id/status", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!["active", "suspended", "banned"].includes(status)) {
        return res.status(400).json({ message: "Invalid account status" });
      }

      const user = await storage.updateUserAccountStatus(id, status);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin - Delete user profile
  app.delete("/api/admin/users/:id", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found or could not be deleted" });
      }

      res.json({ message: "User profile deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin - Update user balance
  app.put("/api/admin/users/:id/balance", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { amount } = req.body;
      
      if (typeof amount !== 'number') {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentBalance = parseFloat(user.balance as string) || 0;
      const newBalance = currentBalance + amount;

      const updatedUser = await storage.updateUser(id, { balance: newBalance.toString() });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ message: "Failed to update user balance" });
    }
  });

  // Demo data creation endpoint (for development)
  app.post("/api/admin/create-demo-users", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const demoUsers = [
        {
          email: "user1@example.com",
          firstName: "Rajesh",
          lastName: "Kumar",
          phoneNumber: "+91-9876543210",
          dateOfBirth: "1995-06-15",
          address: "123 MG Road",
          city: "Mumbai",
          state: "Maharashtra", 
          pincode: "400001",
          accountHolderName: "Rajesh Kumar",
          accountNumber: "1234567890123456",
          ifscCode: "HDFC0000123",
          bankName: "HDFC Bank",
          governmentIdType: "Aadhaar",
          governmentIdNumber: "123456789012",
          verificationStatus: "verified",
          status: "active",
          balance: 125.50
        },
        {
          email: "user2@example.com",
          firstName: "Priya",
          lastName: "Sharma",
          phoneNumber: "+91-9876543211",
          dateOfBirth: "1992-03-22",
          address: "456 Park Street",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          accountHolderName: "Priya Sharma",
          accountNumber: "2345678901234567",
          ifscCode: "ICIC0000456",
          bankName: "ICICI Bank",
          governmentIdType: "PAN",
          governmentIdNumber: "ABCDE1234F",
          verificationStatus: "pending",
          status: "active",
          balance: 87.25
        },
        {
          email: "user3@example.com",
          firstName: "Amit",
          lastName: "Patel",
          phoneNumber: "+91-9876543212",
          dateOfBirth: "1988-11-10",
          address: "789 Sardar Patel Road",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380001",
          accountHolderName: "Amit Patel",
          accountNumber: "3456789012345678",
          ifscCode: "SBIN0000789",
          bankName: "State Bank of India",
          governmentIdType: "Driving License",
          governmentIdNumber: "GJ1420110012345",
          verificationStatus: "rejected",
          status: "suspended",
          balance: 0.00
        }
      ];

      const createdUsers = [];
      for (const userData of demoUsers) {
        try {
          const user = await storage.createUserWithTraditionalAuth(userData);
          createdUsers.push(user);
        } catch (error) {
          // User might already exist, skip
          console.log(`Demo user ${userData.email} might already exist`);
        }
      }

      res.json({ message: "Demo users created", users: createdUsers });
    } catch (error) {
      console.error("Error creating demo users:", error);
      res.status(500).json({ message: "Failed to create demo users" });
    }
  });

  app.put('/api/admin/users/:id/verify', async (req: any, res) => {
    try {
      // Check admin authentication
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { status } = req.body;
      const updatedUser = await storage.updateUserVerification(req.params.id, status);
      
      // If user is verified and was referred, credit referral earning
      if (status === 'verified' && updatedUser?.referredBy) {
        const referrals = await storage.getReferrals(updatedUser.referredBy);
        const referral = referrals.find(r => r.referredId === updatedUser.id);
        if (referral && !referral.isEarningCredited) {
          await storage.creditReferralEarning(referral.id);
        }
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user verification:", error);
      res.status(500).json({ message: "Failed to update user verification" });
    }
  });

  // Update user status (active/suspended)
  app.put("/api/admin/users/:id/status", async (req: any, res) => {
    try {
      // Check admin authentication
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["active", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Valid status is required (active or suspended)" });
      }
      
      const user = await storage.updateUser(id, { status });
      res.json(user);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Update user balance
  app.put("/api/admin/users/:id/balance", async (req: any, res) => {
    try {
      // Check admin authentication
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { amount } = req.body;
      
      if (typeof amount !== 'number' || isNaN(amount)) {
        return res.status(400).json({ error: "Valid amount is required" });
      }
      
      // Get current user to calculate new balance
      const currentUser = await storage.getUser(id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const currentBalance = parseFloat(currentUser.balance.toString());
      const newBalance = Math.max(0, currentBalance + amount); // Don't allow negative balance
      
      const user = await storage.updateUser(id, { balance: newBalance.toFixed(2) });
      res.json(user);
    } catch (error) {
      console.error("Error updating user balance:", error);
      res.status(500).json({ error: "Failed to update user balance" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await storage.getChatMessages(limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
        isAdmin: user?.role === 'admin',
      });
      
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to all connected WebSocket clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'new_message',
            data: message
          }));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ message: "Failed to create chat message" });
    }
  });

  // KYC Routes - traditional auth
  app.get('/api/kyc/status', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json({
        kycStatus: user.kycStatus || 'pending',
        kycFeePaid: user.kycFeePaid || false,
        govIdFrontUrl: user.govIdFrontUrl || null,
        govIdBackUrl: user.govIdBackUrl || null,
        selfieWithIdUrl: user.selfieWithIdUrl || null,
        kycSubmittedAt: user.kycSubmittedAt || null,
        kycApprovedAt: user.kycApprovedAt || null
      });
    } catch (error) {
      console.error("Error getting KYC status:", error);
      res.status(500).json({ message: "Failed to get KYC status" });
    }
  });

  app.put('/api/kyc/document', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { documentUrl, documentType } = req.body;
      const userId = req.user.id;
      
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        documentUrl,
        {
          owner: userId,
          visibility: "private",
        }
      );
      
      // Update user record with document path
      await storage.updateKycDocument(userId, documentType, objectPath);
      
      res.json({ 
        message: "Document uploaded successfully",
        objectPath 
      });
    } catch (error) {
      console.error("Error updating KYC document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.post('/api/kyc/submit', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { 
        governmentIdType, 
        governmentIdNumber, 
        govIdFrontUrl, 
        govIdBackUrl, 
        selfieWithIdUrl 
      } = req.body;
      const userId = req.user.id;
      
      await storage.submitKyc(userId, {
        governmentIdType,
        governmentIdNumber,
        govIdFrontUrl,
        govIdBackUrl,
        selfieWithIdUrl
      });
      
      res.json({ message: "KYC submitted successfully" });
    } catch (error) {
      console.error("Error submitting KYC:", error);
      res.status(500).json({ message: "Failed to submit KYC" });
    }
  });

  app.post('/api/kyc/pay-fee', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For demo purposes, simulate successful payment
      await storage.markKycFeePaid(userId, 'demo-payment-' + Date.now());
      
      res.json({ 
        message: "KYC fee payment successful",
        paymentId: 'demo-payment-' + Date.now()
      });
    } catch (error) {
      console.error("Error processing KYC fee payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for live chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  return httpServer;
}
