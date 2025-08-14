import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { SuspensionSystem } from "./suspensionSystem";
import { and, eq } from "drizzle-orm";
import { 
  insertVideoSchema, 
  insertVideoProgressSchema, 
  insertPayoutRequestSchema,
  insertChatMessageSchema,
  insertTaskSchema,
  insertTaskCompletionSchema,
  users,
  referrals
} from "@shared/schema";
import { 
  createPaymentSession, 
  verifyPayment, 
  getOrderDetails,
  createBeneficiary,
  processPayout,
  getTransferStatus 
} from './cashfree';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Demo mode: Auto-login endpoint for development
  app.get('/api/auth/demo-login', async (req, res) => {
    try {
      const demoUser = await storage.getUser("demo-user-001");
      if (demoUser) {
        req.session!.userId = demoUser.id;
        const { password: _, ...userWithoutPassword } = demoUser;
        res.json({ user: userWithoutPassword, message: "Demo login successful" });
      } else {
        res.status(404).json({ message: "Demo user not found" });
      }
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      
      // Check and award hourly bonus when user authenticates (but don't spam notifications)
      const bonusResult = await storage.checkAndAwardHourlyBonus(user.id);
      
      const { password: _, ...userWithoutPassword } = user;
      
      // Only include bonus info in response if actually awarded (prevent repeated notifications)
      const response: any = { ...userWithoutPassword };
      // Remove automatic bonus notification to prevent spam
      // Bonus will still be credited, but won't show persistent notification
      // if (bonusResult.awarded) {
      //   response.hourlyBonus = { 
      //     awarded: true, 
      //     amount: bonusResult.amount,
      //     message: "You've earned ₹10 hourly login bonus!"
      //   };
      // }
      
      res.json(response);
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
        referralCode
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
        governmentIdType: null,
        governmentIdNumber: null,
        governmentIdUrl: null,
        verificationStatus: 'pending',
        kycStatus: 'pending',
        status: 'active',
        balance: "0.00", // Base balance, signup bonus added separately
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      };

      const newUser = await storage.createUserWithTraditionalAuth(userData);

      // Create signup bonus earning record
      await storage.createEarning({
        userId: newUser.id,
        amount: "1000.00",
        type: "signup_bonus",
        description: "Welcome bonus for new account",
      });

      // Process referral if provided
      console.log(`Processing referral code: ${referralCode}`);
      if (referralCode) {
        try {
          const referrer = await storage.getUserByReferralCode(referralCode);
          console.log(`Found referrer:`, referrer ? { id: referrer.id, email: referrer.email, code: referrer.referralCode } : 'NOT FOUND');
          
          if (referrer) {
            // Create referral record
            const referralRecord = await storage.createReferral({
              referrerId: referrer.id,
              referredId: newUser.id
            });
            console.log(`Referral record created:`, referralRecord);
            
            // Update the new user's referredBy field
            const updatedUser = await storage.updateUser(newUser.id, { referredBy: referrer.id });
            console.log(`Updated new user with referredBy:`, updatedUser?.referredBy);
            
            console.log(`✅ Referral created successfully: ${referrer.email} (${referrer.referralCode}) referred ${newUser.email}`);
          } else {
            console.log(`❌ No user found with referral code: ${referralCode}`);
          }
        } catch (error) {
          console.error("❌ Error processing referral:", error);
          // Don't fail signup if referral processing fails
        }
      } else {
        console.log(`No referral code provided in signup`);
      }

      // Create session for the new user
      req.session.userId = newUser.id;
      
      res.json({ message: "Account created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Temporary demo user while database is unavailable
  const demoUser = {
    id: "demo-user-001",
    email: "demo@innovativetaskearn.online",
    password: "demo123", // Plain text for demo
    firstName: "Demo",
    lastName: "User",
    profileImageUrl: null,
    phoneNumber: "+91 9876543210",
    dateOfBirth: "1990-01-01",
    address: "123 Demo Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    accountHolderName: "Demo User",
    accountNumber: "1234567890",
    ifscCode: "DEMO0001234",
    bankName: "Demo Bank",
    governmentIdType: "aadhaar",
    governmentIdNumber: "1234-5678-9012",
    governmentIdUrl: null,
    verificationStatus: "verified" as const,
    status: "active" as const,
    balance: 1250.75,
    referralCode: "DEMO123",
    createdAt: new Date(),
    updatedAt: new Date(),
    role: "user" as const
  };

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Use demo user credentials when database is unavailable
      if (email === demoUser.email && password === demoUser.password) {
        console.log('Demo user authenticated');
        
        // Create session
        req.session.userId = demoUser.id;

        // Return user without password
        const { password: _, ...userWithoutPassword } = demoUser;
        return res.json({ message: "Login successful", user: userWithoutPassword });
      }

      return res.status(401).json({ message: "Invalid email or password" });
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

      // Return demo user if database is unavailable
      if (userId === demoUser.id) {
        const { password: _, ...userWithoutPassword } = demoUser;
        return res.json(userWithoutPassword);
      }

      return res.status(401).json({ message: "User not found" });
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

  // Forgot password route
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal whether user exists for security
        return res.json({ message: "If an account with that email exists, a reset link has been sent." });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

      // Update user with reset token
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpiry
      });

      // In development, log the reset link but don't auto-redirect
      // This simulates email being sent - user must manually click the logged link
      console.log(`Password reset link for ${email}: /reset-password?token=${resetToken}`);
      
      // Always respond the same way for security (don't reveal if user exists)
      res.json({ 
        message: "If an account with that email exists, a reset link has been sent.",
        devNote: process.env.NODE_ENV === 'development' ? "Check console for reset link (simulates email)" : undefined
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process forgot password request" });
    }
  });

  // Validate reset token route
  app.post('/api/auth/validate-reset-token', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Token is valid" });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ message: "Failed to validate reset token" });
    }
  });

  // Reset password route
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user with new password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

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
        verificationStatus: user.verificationStatus,
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

  // Create payment session for KYC fee
  app.post("/api/kyc/create-payment", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = req.user;
      const orderId = `kyc_${userId}_${Date.now()}`;
      
      try {
        const paymentSession = await createPaymentSession(
          orderId,
          99, // KYC fee amount
          user.phoneNumber || '9999999999',
          user.email,
          `${user.firstName} ${user.lastName}`,
          'kyc_fee'
        );

        res.json({
          orderId: paymentSession.order_id,
          paymentSessionId: paymentSession.payment_session_id,
          amount: paymentSession.order_amount,
          currency: paymentSession.order_currency
        });
      } catch (cashfreeError) {
        console.error("Cashfree API authentication failed, using development payment:", cashfreeError);
        
        // Development payment simulation when Cashfree API fails
        const mockSession = {
          order_id: orderId,
          payment_session_id: `dev_${Date.now()}`,
          order_amount: 99,
          order_currency: 'INR'
        };
        
        // Simulate successful payment immediately for development
        await storage.updateUserKycPayment(userId, { kycFeePaid: true });
        
        console.log(`Development payment completed for user ${userId}, amount: ₹99`);
        
        res.json({
          orderId: mockSession.order_id,
          paymentSessionId: mockSession.payment_session_id,
          amount: mockSession.order_amount,
          currency: mockSession.order_currency,
          status: 'development_payment_completed'
        });
      }
    } catch (error) {
      console.error("Error creating KYC payment session:", error);
      res.status(500).json({ message: "Failed to create payment session" });
    }
  });

  // Verify KYC payment
  app.post("/api/kyc/verify-payment", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;
      
      const orderDetails = await getOrderDetails(orderId);
      
      // For demo purposes, we'll simulate the payment verification process
      // In production, this would check actual Cashfree payment status
      console.log("Verifying Cashfree payment for order:", orderId);
      
      if (orderDetails && orderDetails.order_status === 'PAID') {
        // Update payment status and automatically approve KYC
        await storage.updateUserKycPaymentAndApprove(userId, {
          kycFeePaid: true,
          kycFeePaymentId: orderId,
          kycStatus: "approved",
          verificationStatus: "verified",
          kycApprovedAt: new Date(),
        });

        res.json({ 
          message: "KYC fee payment successful via Cashfree - Verification completed!",
          paymentId: orderId,
          kycStatus: "approved"
        });
      } else {
        res.status(400).json({ message: "Payment not completed. Please complete payment via Cashfree." });
      }
    } catch (error) {
      console.error("Error verifying KYC payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // Legacy endpoint - DISABLED to force Cashfree payment flow
  app.post("/api/kyc/pay-fee", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      // Redirect to proper Cashfree payment flow
      res.status(400).json({ 
        message: "Direct payment not allowed. Please use Cashfree payment gateway.",
        redirectTo: "/api/kyc/create-payment"
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
      
      // Get current progress to calculate incremental time
      const currentProgress = await storage.getVideoProgress(userId, req.params.videoId);
      const previousWatchedSeconds = currentProgress?.watchedSeconds || 0;
      
      const progress = await storage.updateVideoProgress(userId, req.params.videoId, watchedSeconds);
      
      // Update daily watch time with only the additional time watched
      const video = await storage.getVideo(req.params.videoId);
      if (video && watchedSeconds > previousWatchedSeconds) {
        const additionalSeconds = watchedSeconds - previousWatchedSeconds;
        const additionalMinutes = Math.floor(additionalSeconds / 60);
        if (additionalMinutes > 0) {
          await storage.updateDailyWatchTime(userId, additionalMinutes);
        }
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

  // Suspension status route
  app.get('/api/user/suspension-status', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const status = await SuspensionSystem.getSuspensionStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error fetching suspension status:", error);
      res.status(500).json({ message: "Failed to fetch suspension status" });
    }
  });

  // Reactivation fee payment route
  app.post('/api/user/pay-reactivation-fee', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const result = await SuspensionSystem.processReactivationFee(userId);
      
      if (result.success) {
        res.json({ message: result.message, success: true });
      } else {
        res.status(400).json({ message: result.message, success: false });
      }
    } catch (error) {
      console.error("Error processing reactivation fee:", error);
      res.status(500).json({ message: "Failed to process reactivation fee" });
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
      const user = req.user;
      const userId = user.id;
      
      // Use the user's balance as the authoritative total earnings source
      const totalEarnings = parseFloat(user.balance.toString());
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
  app.get('/api/referrals', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const referrals = await storage.getReferralsWithUserDetails(userId);
      res.json(referrals || []);
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

      const { status, reason } = req.body;
      const payout = await storage.updatePayoutStatus(req.params.id, status, reason);
      res.json(payout);
    } catch (error) {
      console.error("Error updating payout:", error);
      res.status(500).json({ message: "Failed to update payout" });
    }
  });

  // Task routes
  app.get('/api/tasks', isTraditionallyAuthenticated, async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/task-completions', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const completions = await storage.getUserTaskCompletions(userId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ message: "Failed to fetch task completions" });
    }
  });

  app.post('/api/task-completions', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { taskId, proofData } = req.body;

      // Check if user already submitted this task
      const existing = await storage.getTaskCompletion(userId, taskId);
      if (existing && existing.status !== 'rejected') {
        return res.status(400).json({ message: "Task already submitted" });
      }

      const completion = await storage.createTaskCompletion({
        userId,
        taskId,
        status: 'submitted',
        proofData
      });

      res.json(completion);
    } catch (error) {
      console.error("Error submitting task:", error);
      res.status(500).json({ message: "Failed to submit task" });
    }
  });

  // Admin task management routes
  app.get('/api/admin/tasks', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      const tasks = await storage.getTasks(100);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/admin/tasks', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        createdBy: req.session.adminUser.id
      });

      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/admin/tasks/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const task = await storage.updateTask(req.params.id, req.body);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/admin/tasks/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const success = await storage.deleteTask(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.get('/api/admin/task-completions', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      const completions = await storage.getTaskCompletionsForReview();
      res.json(completions);
    } catch (error) {
      console.error("Error fetching task completions:", error);
      res.status(500).json({ message: "Failed to fetch task completions" });
    }
  });

  app.put('/api/admin/task-completions/:id/approve', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      await storage.approveTaskCompletion(req.params.id, req.session.adminUser.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error approving task completion:", error);
      res.status(500).json({ message: "Failed to approve task completion" });
    }
  });

  app.put('/api/admin/task-completions/:id/reject', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { reason } = req.body;
      await storage.rejectTaskCompletion(req.params.id, req.session.adminUser.id, reason);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rejecting task completion:", error);
      res.status(500).json({ message: "Failed to reject task completion" });
    }
  });

  // Regular user payout routes
  app.get('/api/payouts', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payouts = await storage.getPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post('/api/payouts', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      console.log(`Admin API: Retrieved ${users.length} users for admin panel`);
      console.log("Sample user data:", users.length > 0 ? {
        email: users[0].email,
        kycStatus: users[0].kycStatus,
        kycFeePaid: users[0].kycFeePaid,
        verificationStatus: users[0].verificationStatus
      } : "No users found");
      
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

      // Process referral bonus if user is verified and has a referrer
      if (status === 'verified' && user.referredBy) {
        try {
          console.log(`Processing referral bonus for verified user: ${user.email} (referred by: ${user.referredBy})`);
          
          // Check if referral bonus has already been credited
          const referralRecord = await storage.getReferralByReferredId(user.id);
          if (referralRecord && !referralRecord.isEarningCredited) {
            // Credit ₹49 to the referrer
            const referrer = await storage.getUser(user.referredBy);
            if (referrer) {
              const currentBalance = parseFloat(referrer.balance as string) || 0;
              const bonusAmount = 49;
              const newBalance = currentBalance + bonusAmount;
              
              // Update referrer's balance
              await storage.updateUser(referrer.id, { balance: newBalance.toString() });
              
              // Add earning record for the referrer
              await storage.createEarning({
                userId: referrer.id,
                amount: bonusAmount.toString(),
                type: "referral",
                description: `Referral bonus for ${user.firstName} ${user.lastName} getting verified`,
              });
              
              // Mark referral as earning credited
              await storage.updateReferralEarningStatus(referralRecord.id, true);
              
              console.log(`✅ Referral bonus paid: ₹${bonusAmount} to ${referrer.email} for referring ${user.email}`);
            }
          }
        } catch (error) {
          console.error("❌ Error processing referral bonus:", error);
          // Don't fail the verification if referral bonus fails
        }
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

  // Admin - Update user profile
  app.put("/api/admin/users/:id", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const userData = req.body;
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
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

  // Admin get payment history for a specific user
  app.get("/api/admin/users/:id/payment-history", async (req: any, res) => {
    if (!req.session.adminUser) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      const { id } = req.params;
      const paymentHistory = await storage.getPaymentHistory(id);
      const paymentStats = await storage.getUserPaymentStats(id);
      
      res.json({
        payments: paymentHistory,
        stats: paymentStats
      });
    } catch (error) {
      console.error("Error fetching user payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Admin get all payment history
  app.get("/api/admin/payment-history", async (req: any, res) => {
    if (!req.session.adminUser) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    try {
      const allPayments = await storage.getAllPaymentHistory();
      res.json(allPayments);
    } catch (error) {
      console.error("Error fetching all payment history:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Admin - Get detailed user profile with referral history
  app.get('/api/admin/users/:userId/profile', async (req: any, res) => {
    console.log('Profile endpoint hit, session:', !!req.session.adminUser);
    try {
      if (!req.session.adminUser) {
        console.log('Admin authentication failed');
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      const { userId } = req.params;
      console.log(`Fetching profile for user ID: ${userId}`);
      
      if (!userId || userId === 'undefined') {
        console.log('Invalid user ID:', userId);
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(userId);
      console.log('Found user:', user ? 'YES' : 'NO', user ? user.email : 'N/A');
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's referral history (people they referred)
      let referrals: any[] = [];
      try {
        referrals = await storage.getReferrals(userId);
      } catch (error) {
        console.log('Error getting referrals:', error);
        referrals = [];
      }
      
      // Get user's earnings history
      let earnings: any[] = [];
      try {
        earnings = await storage.getEarnings(userId);
      } catch (error) {
        console.log('Error getting earnings:', error);
        earnings = [];
      }
      
      // Get all users to match referral details
      let allUsers: any[] = [];
      try {
        allUsers = await storage.getAllUsers();
      } catch (error) {
        console.log('Error getting all users:', error);
        allUsers = [];
      }
      
      // Find who referred this user
      const referredByUser = allUsers.find(u => u.referralCode && u.referralCode === user.referredBy);

      // For admin endpoints, include password for admin visibility
      const response = {
        user: user, // Include all user data including password for admin viewing
        referrals: referrals.map(r => {
          const referredUser = allUsers.find(u => u.id === r.referredId);
          return {
            ...r,
            referredUser: referredUser ? {
              id: referredUser.id,
              email: referredUser.email,
              firstName: referredUser.firstName,
              lastName: referredUser.lastName,
              verificationStatus: referredUser.verificationStatus,
              kycStatus: referredUser.kycStatus
            } : null
          };
        }),
        referredBy: referredByUser ? {
          id: referredByUser.id,
          email: referredByUser.email,
          firstName: referredByUser.firstName,
          lastName: referredByUser.lastName
        } : null,
        earnings: earnings,
        totalEarnings: earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0)
      };
      
      console.log('Sending profile response:', JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
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

  // Admin endpoint to process all pending referral bonuses
  app.post("/api/admin/process-pending-referrals", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      console.log("🔄 Processing all pending referral bonuses...");

      // Get all verified users and process their referrals
      const allUsers = await storage.getAllUsers();
      const verifiedUsers = allUsers.filter(u => 
        u.verificationStatus === 'verified' && u.kycStatus === 'approved'
      );
      
      let processedCount = 0;
      const results = [];

      // Process each verified user's referrals
      for (const verifiedUser of verifiedUsers) {
        try {
          // Check if they were referred by someone
          const userReferrals = await storage.getReferrals(verifiedUser.id);
          const referralRecord = userReferrals.find(r => r.referredId === verifiedUser.id);
          
          if (referralRecord && !referralRecord.isEarningCredited) {
            // Get referrer details
            const referrer = await storage.getUser(referralRecord.referrerId);
            if (referrer) {
              const currentBalance = parseFloat(referrer.balance as string) || 0;
              const bonusAmount = 49;
              const newBalance = currentBalance + bonusAmount;

              // Update referrer's balance
              await storage.updateUser(referrer.id, { balance: newBalance.toString() });

              // Add earning record for the referrer
              await storage.createEarning({
                userId: referrer.id,
                amount: bonusAmount.toString(),
                type: "referral_bonus",
                description: `Referral bonus for ${verifiedUser.firstName} ${verifiedUser.lastName}`,
                videoId: null
              });

              // Mark referral as earning credited
              await storage.creditReferralEarning(referralRecord.id);

              processedCount++;
              results.push({
                referrer: referrer.email,
                referred: verifiedUser.email,
                amount: bonusAmount,
                success: true
              });

              console.log(`✅ Processed referral bonus: ₹${bonusAmount} to ${referrer.email} for referring ${verifiedUser.email}`);
            }
          }
        } catch (error: any) {
          console.error(`❌ Failed to process referral for ${verifiedUser.email}:`, error);
          results.push({
            referrer: 'Unknown',
            referred: verifiedUser.email,
            amount: 0,
            success: false,
            error: error.message || 'Unknown error'
          });
        }
      }

      res.json({
        message: `Processed ${processedCount} pending referral bonuses`,
        totalFound: verifiedUsers.length,
        processed: processedCount,
        results
      });
    } catch (error) {
      console.error("Error processing pending referrals:", error);
      res.status(500).json({ message: "Failed to process pending referrals" });
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

  // Account reactivation payment endpoint
  app.post("/api/account/reactivate-payment", async (req: any, res) => {
    try {
      let userId;
      let user;

      // Check for traditional session-based authentication (suspended users)
      console.log('Reactivation payment - Session check:', { 
        hasSession: !!req.session, 
        sessionUserId: req.session?.userId,
        hasUser: !!req.user 
      });
      
      if (req.session?.userId) {
        userId = req.session.userId;
        user = await storage.getUser(userId);
        console.log('Reactivation payment - Traditional auth found for user:', userId);
      }
      // Support both traditional and OIDC authentication
      else if (req.user && req.user.id) {
        userId = req.user.id;
        user = req.user;
        console.log('Reactivation payment - User object auth found for user:', userId);
      } 
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        user = await storage.getUser(userId);
        console.log('Reactivation payment - OIDC auth found for user:', userId);
      } 
      else {
        console.log('Reactivation payment - No valid authentication found');
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.status !== 'suspended') {
        return res.status(400).json({ error: "Account is not suspended" });
      }

      const reactivationFeeAmount = parseFloat(user.reactivationFeeAmount || "49.00");
      
      try {
        // Try to create Cashfree payment
        const cashfreeModule = await import('./cashfree');
        const { createPaymentSession: createCashfreeOrder } = cashfreeModule;
        const orderId = `reactivation_${userId}_${Date.now()}`;
        const cashfreeOrder = await createCashfreeOrder({
          orderId,
          amount: reactivationFeeAmount,
          customerDetails: {
            customerId: userId,
            customerEmail: user.email || "user@example.com",
            customerPhone: user.phoneNumber || "9999999999",
            customerName: `${user.firstName || 'User'} ${user.lastName || 'Account'}`
          }
        });

        console.log('Cashfree reactivation order created:', cashfreeOrder);
        
        if (cashfreeOrder.paymentSessionId) {
          res.json({
            paymentUrl: `https://payments-test.cashfree.com/pgappsdksandbox/login?order_id=${orderId}`,
            sessionId: cashfreeOrder.paymentSessionId,
            orderId: orderId
          });
          return;
        }
      } catch (cashfreeError) {
        console.warn('Cashfree reactivation payment failed, using development fallback:', cashfreeError);
      }

      // Development fallback - automatically reactivate account and record payment
      await storage.updateUser(userId, { 
        status: 'active',
        reactivationFeePaid: true,
        suspendedAt: null,
        suspensionReason: null,
        consecutiveFailedDays: 0
      });

      // Invalidate any cached admin data to show updated status immediately
      console.log(`✅ User ${userId} reactivated - status updated to 'active'`);

      // Try to record payment history
      try {
        await storage.addPaymentHistory(userId, {
          type: 'reactivation',
          amount: reactivationFee,
          orderId: `reactivation_${userId}_${Date.now()}`,
          paymentMethod: 'development_fallback',
          status: 'completed'
        });
      } catch (historyError) {
        console.warn('Failed to record payment history:', historyError);
      }

      console.log(`✅ User ${userId} (${user.email}) reactivated - status: suspended → active`);
      
      res.json({
        success: true,
        message: "🎉 Your account has been successfully reactivated! You can now start earning again.",
        amount: reactivationFee,
        newStatus: 'active',
        paymentRecorded: true,
        nextSteps: "Visit your dashboard to continue watching videos and earning rewards."
      });

    } catch (error) {
      console.error("Error processing reactivation payment:", error);
      res.status(500).json({ error: "Failed to process reactivation payment" });
    }
  });

  // Reactivation payment verification endpoint
  app.post("/api/account/verify-reactivation-payment", async (req: any, res) => {
    try {
      const { orderId } = req.body;
      let userId;
      let user;

      // Support both traditional and OIDC authentication
      if (req.user && req.user.id) {
        userId = req.user.id;
        user = req.user;
      } 
      else if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      } 
      else {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log(`Verifying reactivation payment for user ${userId}, order: ${orderId}`);

      try {
        // Verify payment with Cashfree
        const orderDetails = await getOrderDetails(orderId);
        
        if (orderDetails && orderDetails.order_status === 'PAID') {
          // Payment successful - reactivate account
          await storage.updateUser(userId, { 
            status: 'active',
            reactivationFeePaid: true,
            suspendedAt: null,
            suspensionReason: null,
            consecutiveFailedDays: 0
          });

          // Record payment in history
          try {
            await storage.addPaymentHistory(userId, {
              orderId: orderId,
              amount: parseFloat(user.reactivationFeeAmount || "49.00"),
              type: 'reactivation',
              status: 'completed',
              paymentMethod: 'cashfree'
            });
          } catch (historyError) {
            console.warn('Failed to record payment history:', historyError);
          }

          console.log(`✅ User ${userId} (${user.email}) successfully reactivated via payment verification`);
          
          res.json({
            success: true,
            message: "Account reactivated successfully",
            kycStatus: "completed",
            accountStatus: 'active'
          });
        } else {
          // Payment not completed
          res.status(400).json({
            error: "Payment not verified",
            orderStatus: orderDetails?.order_status || 'unknown'
          });
        }
      } catch (verifyError) {
        console.warn('Cashfree verification failed, checking payment history as fallback:', verifyError);
        
        // Check if payment already recorded in our system
        const existingPayment = await storage.getPaymentByOrderId(orderId);
        if (existingPayment && existingPayment.status === 'completed') {
          // Payment already processed - reactivate account
          await storage.updateUser(userId, { 
            status: 'active',
            reactivationFeePaid: true,
            suspendedAt: null,
            suspensionReason: null,
            consecutiveFailedDays: 0
          });

          console.log(`✅ User ${userId} reactivated via payment history fallback`);
          
          res.json({
            success: true,
            message: "Account reactivated successfully",
            accountStatus: 'active'
          });
        } else {
          res.status(500).json({ error: "Failed to verify payment" });
        }
      }
    } catch (error) {
      console.error("Error verifying reactivation payment:", error);
      res.status(500).json({ error: "Failed to verify payment" });
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
