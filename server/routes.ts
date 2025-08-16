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
import { 
  suggestTaskCategory, 
  generateTaskSuggestions, 
  optimizeTaskContent, 
  analyzeTaskPerformance 
} from "./ai-task-suggestions";
import { config, isDevelopment } from "./config";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Production auth middleware - requires database connection
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
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  };



  // Auth check route that doesn't require authentication - returns user if authenticated
  app.get('/api/auth/check', async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      console.log("Auth check - Session userId:", userId, "Session:", req.sessionID);
      
      if (!userId) {
        console.log("Auth check - No session userId - returning null");
        return res.json({ user: null });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("Auth check - No user found for id:", userId);
        return res.json({ user: null });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      console.log("Auth check - User found:", userWithoutPassword.email);
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.json({ user: null });
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



  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Allow suspended users to login so they can access reactivation payment
      // The frontend will handle redirecting them to the suspended page

      // Check password
      const bcrypt = await import('bcryptjs');
      const isPasswordValid = user.password ? await bcrypt.compare(password, user.password) : false;
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create session and save it
      req.session.userId = user.id;
      console.log("Login - Setting session userId:", user.id, "SessionID:", req.sessionID);
      
      // Force session save
      await new Promise((resolve, reject) => {
        req.session.save((err: any) => {
          if (err) {
            console.error("Session save error:", err);
            reject(err);
          } else {
            console.log("Session saved successfully");
            resolve(true);
          }
        });
      });
      
      res.json({ 
        message: "Login successful", 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          verificationStatus: user.verificationStatus,
          kycStatus: user.kycStatus,
          balance: user.balance,
          status: user.status,
          suspensionReason: user.suspensionReason
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Check authentication status


  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully", user: null });
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

  // Cashfree webhook endpoint for KYC payment notifications
  // Payment webhook for both KYC and reactivation payments
  app.post('/api/payment-webhook', async (req, res) => {
    try {
      const { order_id, payment_status } = req.body;
      
      console.log(`Payment webhook received for order: ${order_id}, status: ${payment_status}`);
      
      if (payment_status === 'SUCCESS' || payment_status === 'PAID') {
        // Handle KYC payment
        if (order_id.startsWith('kyc_')) {
          const userId = order_id.split('_')[1];
          await storage.updateUserKycPaymentAndApprove(userId, {
            kycFeePaid: true,
            kycFeePaymentId: order_id,
            kycStatus: "approved",
            verificationStatus: "verified",
            kycApprovedAt: new Date(),
          });
          console.log(`KYC payment verified via webhook for user ${userId}`);
        }
        // Handle reactivation payment
        else if (order_id.startsWith('reactivate_')) {
          const userId = order_id.split('_')[1];
          await storage.updateUser(userId, { 
            status: 'active',
            suspensionReason: null
          });
          console.log(`Reactivation payment verified via webhook for user ${userId}`);
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error("Error processing payment webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Legacy KYC webhook (redirects to unified webhook)
  app.post('/api/kyc/payment-webhook', async (req, res) => {
    try {
      console.log('Cashfree payment webhook received:', req.body);
      
      const { orderId, orderAmount, paymentStatus, signature } = req.body;
      
      // Verify webhook signature (implement signature verification for security)
      // const isValidSignature = verifyWebhookSignature(req.body, signature);
      // if (!isValidSignature) {
      //   return res.status(400).json({ message: "Invalid signature" });
      // }
      
      if (paymentStatus === 'SUCCESS' && orderId?.startsWith('kyc_')) {
        // Extract user ID from order ID format: kyc_{userId}_{timestamp}
        const userIdMatch = orderId.match(/^kyc_([^_]+)_/);
        if (userIdMatch) {
          const userId = userIdMatch[1];
          
          try {
            // Update user's KYC payment status and approve automatically
            await storage.updateUserKycPaymentAndApprove(userId, {
              kycFeePaid: true,
              kycFeePaymentId: orderId,
              kycStatus: "approved",
              verificationStatus: "verified",
              kycApprovedAt: new Date(),
            });
            
            console.log(`Webhook: KYC payment verified and approved for user ${userId}, order: ${orderId}`);
          } catch (dbError) {
            console.error('Database error in webhook:', dbError);
            // Still return success to Cashfree to avoid retries
          }
        }
      }
      
      // Always return 200 to acknowledge receipt
      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing Cashfree webhook:", error);
      res.status(200).json({ message: "Webhook received" }); // Still return 200 to stop retries
    }
  });

  // KYC payment success redirect handler
  app.get('/api/kyc/payment-success', async (req, res) => {
    try {
      const { order_id } = req.query;
      console.log(`Payment success redirect for order: ${order_id}`);
      
      // Redirect to KYC page with success parameter
      res.redirect(`/kyc?payment=success&order=${order_id}`);
    } catch (error) {
      console.error("Error handling payment success:", error);
      res.redirect('/kyc?payment=error');
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
      
      const paymentSession = await createPaymentSession(
        orderId,
        99, // KYC fee amount
        user.phoneNumber || '9999999999',
        user.email,
        `${user.firstName} ${user.lastName}`,
        'kyc_fee'
      );

      console.log(`Production Cashfree payment session created for KYC: ${paymentSession.payment_session_id}`);
      
      res.json({
        orderId: paymentSession.order_id,
        paymentSessionId: paymentSession.payment_session_id,
        amount: paymentSession.order_amount,
        currency: paymentSession.order_currency,
        paymentUrl: `https://payments.cashfree.com/order/${paymentSession.payment_session_id}`,
        status: 'production_payment_session_created'
      });
    } catch (error) {
      console.error("Error creating KYC payment session:", error);
      res.status(500).json({ message: "Failed to create payment session" });
    }
  });

  // Verify KYC payment using production Cashfree API
  app.post("/api/kyc/verify-payment", isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;
      
      console.log(`Verifying production Cashfree payment for order: ${orderId}`);
      
      const orderDetails = await getOrderDetails(orderId);
      
      if (orderDetails && orderDetails.order_status === 'PAID') {
        // Update payment status and automatically approve KYC
        await storage.updateUserKycPaymentAndApprove(userId, {
          kycFeePaid: true,
          kycFeePaymentId: orderId,
          kycStatus: "approved",
          verificationStatus: "verified",
          kycApprovedAt: new Date(),
        });

        console.log(`Production KYC payment verified and approved for user ${userId}`);

        res.json({ 
          message: "KYC fee payment successful via production Cashfree - Verification completed!",
          paymentId: orderId,
          kycStatus: "approved",
          verificationStatus: "verified"
        });
      } else {
        const status = orderDetails?.order_status || 'UNKNOWN';
        console.log(`Payment verification failed - Order status: ${status}`);
        
        res.status(400).json({ 
          message: `Payment not completed. Current status: ${status}. Please complete payment via Cashfree.`,
          orderStatus: status
        });
      }
    } catch (error) {
      console.error("Error verifying production KYC payment:", error);
      res.status(500).json({ message: "Failed to verify payment with Cashfree production API" });
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

  // Create payment session for reactivation fee
  app.post('/api/account/reactivate-payment', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = req.user;
      
      // Check if user is actually suspended
      if (user.status !== 'suspended') {
        return res.status(400).json({ message: "Account is not suspended" });
      }
      
      const orderId = `reactivate_${userId}_${Date.now()}`;
      
      const paymentSession = await createPaymentSession(
        orderId,
        49, // Reactivation fee amount
        user.phoneNumber || '9999999999',
        user.email,
        `${user.firstName} ${user.lastName}`,
        'reactivation_fee'
      );

      console.log(`Production Cashfree payment session created for reactivation: ${paymentSession.payment_session_id}`);
      
      res.json({
        orderId: paymentSession.order_id,
        paymentSessionId: paymentSession.payment_session_id,
        amount: paymentSession.order_amount,
        currency: paymentSession.order_currency,
        paymentUrl: `https://payments.cashfree.com/order/${paymentSession.payment_session_id}`,
        status: 'production_payment_session_created'
      });
    } catch (error) {
      console.error("Error creating reactivation payment session:", error);
      res.status(500).json({ message: "Failed to create payment session" });
    }
  });
  
  // Verify reactivation payment using production Cashfree API
  app.post('/api/account/verify-reactivation-payment', isTraditionallyAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;
      const user = req.user;
      
      console.log(`Verifying production Cashfree payment for reactivation order: ${orderId}`);
      
      const orderDetails = await getOrderDetails(orderId);
      
      if (orderDetails && orderDetails.order_status === 'PAID') {
        // Update user status to active
        await storage.updateUser(userId, { 
          status: 'active',
          suspensionReason: null
        });

        console.log(`Reactivation payment verified and account activated for user ${userId}`);

        res.json({ 
          message: "Reactivation fee payment successful via production Cashfree - Account reactivated!",
          paymentId: orderId,
          status: "active",
          success: true
        });
      } else {
        res.json({ 
          message: "Payment verification pending via production Cashfree API. Please wait or contact support.",
          paymentId: orderId,
          status: "pending"
        });
      }
    } catch (error) {
      console.error("Error verifying reactivation payment:", error);
      res.status(500).json({ message: "Failed to verify payment via production Cashfree API" });
    }
  });

  // Donation payment routes
  app.post('/api/donate/create-payment', async (req: any, res) => {
    try {
      const { amount, donorName, donorEmail } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Invalid donation amount" });
      }
      
      if (!donorName || !donorEmail) {
        return res.status(400).json({ message: "Donor name and email are required" });
      }
      
      const orderId = `donate_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      const paymentSession = await createPaymentSession(
        orderId,
        amount,
        '9999999999', // Default phone for donations
        donorEmail,
        donorName,
        'kyc_fee'
      );

      console.log(`Donation payment session created: ${paymentSession.payment_session_id} for ₹${amount}`);
      
      res.json({
        orderId: paymentSession.order_id,
        paymentSessionId: paymentSession.payment_session_id,
        amount: paymentSession.order_amount,
        currency: paymentSession.order_currency,
        paymentUrl: `https://payments.cashfree.com/order/${paymentSession.payment_session_id}`,
        status: 'donation_payment_session_created'
      });
    } catch (error) {
      console.error("Error creating donation payment session:", error);
      res.status(500).json({ message: "Failed to create donation payment session" });
    }
  });

  app.post('/api/donate/verify-payment', async (req: any, res) => {
    try {
      const { orderId } = req.body;
      
      console.log(`Verifying donation payment for order: ${orderId}`);
      
      const orderDetails = await getOrderDetails(orderId);
      
      if (orderDetails && orderDetails.order_status === 'PAID') {
        console.log(`Donation payment verified: ${orderId} - Amount: ₹${orderDetails.order_amount}`);

        res.json({ 
          message: "Thank you for your generous donation! Your support helps us grow and serve more users.",
          paymentId: orderId,
          amount: orderDetails.order_amount,
          status: "completed",
          success: true
        });
      } else {
        const status = orderDetails?.order_status || 'UNKNOWN';
        console.log(`Donation payment verification failed - Order status: ${status}`);
        
        res.status(400).json({ 
          message: `Donation payment not completed. Current status: ${status}. Please complete payment via Cashfree.`,
          orderStatus: status
        });
      }
    } catch (error) {
      console.error("Error verifying donation payment:", error);
      res.status(500).json({ message: "Failed to verify donation payment" });
    }
  });

  // Legacy reactivation route (kept for compatibility)
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

  // Task routes - Allow public access for browsing
  app.get('/api/tasks', async (req, res) => {
    try {
      const startTime = Date.now();
      const tasks = await storage.getTasks();
      
      // Filter only active tasks for public API
      const activeTasks = tasks.filter(task => task.isActive);
      
      // Add cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
      res.set('X-Response-Time', `${Date.now() - startTime}ms`);
      
      // Sanitize sensitive data for public consumption
      const publicTasks = activeTasks.map(task => ({
        ...task,
        createdBy: undefined, // Remove sensitive admin info
        updatedAt: undefined  // Remove internal timestamps
      }));
      
      res.json(publicTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ 
        message: "Failed to fetch tasks",
        error: isDevelopment ? error.message : "Internal server error"
      });
    }
  });

  // Get individual task details
  app.get('/api/tasks/:id', isTraditionallyAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task details:", error);
      res.status(500).json({ message: "Failed to fetch task details" });
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
      const { taskId, proofData, proofImages } = req.body;

      // Check if user is suspended
      if (req.user.status === 'suspended') {
        return res.status(403).json({ 
          message: "Your account is suspended. Please reactivate your account to complete tasks.",
          errorType: "suspended"
        });
      }

      // Check if user has completed KYC verification
      if (req.user.verificationStatus !== 'verified' || req.user.kycStatus !== 'approved') {
        return res.status(403).json({ 
          message: "KYC verification pending. Please complete your KYC verification to start earning from tasks.",
          errorType: "kyc_pending"
        });
      }

      // Check if user already submitted this task
      const existing = await storage.getTaskCompletion(userId, taskId);
      if (existing && existing.status !== 'rejected') {
        return res.status(400).json({ message: "Task already submitted" });
      }

      const completion = await storage.createTaskCompletion({
        userId,
        taskId,
        status: 'submitted',
        proofData,
        proofImages: proofImages || []
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
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      if (isDevelopment()) {
        const demoTasks = [
          {
            id: "task-1",
            title: "Download Food Delivery App",
            description: "Download and install popular food delivery app from Play Store",
            category: "app_download",
            reward: "15.00",
            status: "active",
            timeLimit: 24,
            maxCompletions: 1000,
            currentCompletions: 245,
            instructions: "1. Download app\n2. Create account\n3. Take screenshot of homepage\n4. Submit proof",
            createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-2", 
            title: "Write Business Review",
            description: "Write honest review for local restaurant on Google Maps",
            category: "business_review",
            reward: "25.00",
            status: "active",
            timeLimit: 48,
            maxCompletions: 500,
            currentCompletions: 89,
            instructions: "1. Visit Google Maps\n2. Find assigned restaurant\n3. Write detailed review (min 50 words)\n4. Submit screenshot",
            createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-3",
            title: "Subscribe to YouTube Channel",
            description: "Subscribe to tech education YouTube channel and watch latest video",
            category: "channel_subscribe",
            reward: "12.00",
            status: "active",
            timeLimit: 12,
            maxCompletions: 2000,
            currentCompletions: 567,
            instructions: "1. Visit YouTube channel\n2. Subscribe to channel\n3. Watch latest video for 2 minutes\n4. Take screenshot showing subscription",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-4",
            title: "Amazon Product Review",
            description: "Write detailed product review for recently purchased item",
            category: "product_review",
            reward: "30.00",
            status: "active",
            timeLimit: 72,
            maxCompletions: 300,
            currentCompletions: 45,
            instructions: "1. Login to Amazon account\n2. Find recent purchase\n3. Write detailed review (min 100 words)\n4. Submit screenshot of review",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-5",
            title: "Instagram Post Engagement",
            description: "Like and comment on brand's Instagram posts",
            category: "comment_like",
            reward: "8.00",
            status: "active",
            timeLimit: 6,
            maxCompletions: 5000,
            currentCompletions: 1234,
            instructions: "1. Visit Instagram page\n2. Like 3 recent posts\n3. Leave meaningful comment\n4. Screenshot your interactions",
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-6",
            title: "Watch YouTube Video Complete",
            description: "Watch full educational video and engage with content",
            category: "youtube_video_see",
            reward: "20.00",
            status: "active",
            timeLimit: 24,
            maxCompletions: 800,
            currentCompletions: 234,
            instructions: "1. Watch complete video (15 minutes)\n2. Like the video\n3. Leave thoughtful comment\n4. Screenshot showing completed view and interaction",
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-7",
            title: "E-commerce App Registration",
            description: "Download and register on new e-commerce app",
            category: "app_download",
            reward: "18.00",
            status: "active",
            timeLimit: 18,
            maxCompletions: 1500,
            currentCompletions: 423,
            instructions: "1. Download app from Play Store\n2. Complete registration with phone verification\n3. Browse for 5 minutes\n4. Take screenshot of profile page",
            createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
            createdBy: "admin"
          },
          {
            id: "task-8",
            title: "Local Business Google Review",
            description: "Visit local business and write Google review",
            category: "business_review",
            reward: "35.00",
            status: "active",
            timeLimit: 96,
            maxCompletions: 200,
            currentCompletions: 67,
            instructions: "1. Visit assigned local business\n2. Make small purchase or inquiry\n3. Write detailed Google review with photos\n4. Submit receipt and review screenshot",
            createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
            createdBy: "admin"
          }
        ];
        return res.json(demoTasks);
      }
      
      const tasks = await storage.getTasks(100);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching admin tasks:", error);
      if (isDevelopment()) {
        res.json([]);
      } else {
        res.status(500).json({ message: "Failed to fetch tasks" });
      }
    }
  });

  app.post('/api/admin/tasks', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      console.log("Admin: Creating new task", req.body);

      try {
        // Validate and parse task data 
        const taskData = insertTaskSchema.parse(req.body);
        const task = await storage.createTask({
          ...taskData,
          createdBy: req.session.adminUser?.id || "admin"
        });

        res.json(task);
      } catch (error) {
        // Development mode fallback for task creation
        if (isDevelopment() && error.message?.includes('insertTaskSchema')) {
          console.log("Development mode: Task creation simulated");
          const newTask = {
            id: `task-${Date.now()}`,
            ...req.body,
            createdBy: "admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            currentCompletions: 0
          };
          res.json(newTask);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      
      // Handle Zod validation errors specifically
      if (error.issues) {
        const fieldErrors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        return res.status(400).json({ 
          message: `Validation failed: ${fieldErrors}`,
          details: error.issues
        });
      }
      
      res.status(500).json({ message: "Failed to create task. Please check the required fields." });
    }
  });

  app.put('/api/admin/tasks/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      console.log(`Admin: Updating task ${req.params.id}`, req.body);
      
      try {
        const task = await storage.updateTask(req.params.id, req.body);
        res.json(task);
      } catch (error) {
        // Development mode fallback
        if (isDevelopment()) {
          console.log("Development mode: Task update simulated");
          res.json({ 
            id: req.params.id, 
            ...req.body, 
            updatedAt: new Date().toISOString(),
            message: "Task updated successfully (development mode)"
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/admin/tasks/:id', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      console.log(`Admin: Deleting task ${req.params.id}`);
      
      try {
        const success = await storage.deleteTask(req.params.id);
        res.json({ success });
      } catch (error) {
        // Development mode fallback
        if (isDevelopment()) {
          console.log("Development mode: Task deletion simulated");
          res.json({ 
            success: true, 
            message: "Task deleted successfully (development mode)" 
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  app.get('/api/admin/task-completions', async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        if (isDevelopment() && config.database.fallbackEnabled) {
          console.log("Development mode: Admin task completions API accessed without session, allowing access");
        } else {
          return res.status(401).json({ message: "Admin authentication required" });
        }
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
        // Development mode bypass for testing
        if (isDevelopment() && config.database.fallbackEnabled) {
          console.log("Development mode: Simulating admin approval");
          await storage.approveTaskCompletion(req.params.id, 'dev-admin');
          return res.json({ success: true });
        }
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
      
      // Force session save to ensure persistence
      req.session.adminUser = admin;
      req.session.save((err) => {
        if (err) {
          console.error("Admin session save error:", err);
          return res.status(500).json({ message: "Session save failed" });
        }
        
        console.log("Admin session saved successfully for:", admin.username);
        res.json({ 
          id: admin.id, 
          username: admin.username, 
          name: admin.name 
        });
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
      // Clear session completely to ensure proper logout
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Admin logged out successfully", user: null });
      });
    } catch (error) {
      console.error("Admin logout error:", error);
      res.status(500).json({ message: "Admin logout failed" });
    }
  });

  app.get('/api/admin/auth/user', async (req, res) => {
    console.log("Admin auth check - Session admin:", req.session?.adminUser);
    
    if (req.session?.adminUser) {
      return res.json({
        user: {
          id: req.session.adminUser.id,
          username: req.session.adminUser.username,
          name: req.session.adminUser.name || req.session.adminUser.username
        }
      });
    }
    
    // Development mode fallback for demo purposes
    if (isDevelopment()) {
      return res.json({
        user: {
          id: "temp-admin-001",
          username: "admin",
          name: "Admin User"
        }
      });
    }
    
    console.log("Admin auth check - No session, returning null");
    return res.json({ user: null });
  });

  // Admin routes - comprehensive user management
  app.get('/api/admin/users', async (req: any, res) => {
    try {
      // Check admin authentication - only require session in production
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }
      
      console.log("Admin users API - Session admin:", !!req.session.adminUser, "Development:", isDevelopment());

      const users = await storage.getAllUsers();
      console.log(`Admin API: Retrieved ${users.length} users for admin panel`);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Development fallback with sample users
      if (isDevelopment()) {
        const sampleUsers = [
          {
            id: "dev-demo-user",
            email: "demo@innovativetaskearn.online",
            firstName: "Demo",
            lastName: "User",
            status: "active",
            kycStatus: "approved",
            balance: "1000.00",
            createdAt: new Date().toISOString(),
            verificationStatus: "verified"
          },
          {
            id: "john-doe-001",
            email: "john@example.com", 
            firstName: "John",
            lastName: "Doe",
            status: "active",
            kycStatus: "submitted",
            balance: "750.00",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            verificationStatus: "verified"
          }
        ];
        res.json(sampleUsers);
      } else {
        res.status(500).json({ message: "Failed to fetch users" });
      }
    }
  });

  // Admin - Get all user earnings history
  app.get('/api/admin/earnings', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const earnings = await storage.getAllEarnings();
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      if (isDevelopment()) {
        res.json([
          { id: "1", userId: "dev-demo-user", amount: "25.00", taskId: "task-1", createdAt: new Date().toISOString() },
          { id: "2", userId: "john-doe-001", amount: "15.00", taskId: "task-2", createdAt: new Date().toISOString() }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch earnings" });
      }
    }
  });

  // Admin - Get all payouts history
  app.get('/api/admin/payouts', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const payouts = await storage.getAllPayouts();
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      if (isDevelopment()) {
        res.json([
          { id: "1", userId: "dev-demo-user", amount: "500.00", status: "completed", createdAt: new Date().toISOString() },
          { id: "2", userId: "john-doe-001", amount: "200.00", status: "pending", createdAt: new Date().toISOString() }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch payouts" });
      }
    }
  });

  // Admin - Get all task completions
  app.get('/api/admin/task-completions', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const completions = await storage.getAllTaskCompletions();
      res.json(completions);
    } catch (error) {
      console.error("Error fetching task completions:", error);
      if (isDevelopment()) {
        res.json([
          { id: "1", userId: "dev-demo-user", taskId: "task-1", status: "approved", submittedAt: new Date().toISOString() },
          { id: "2", userId: "john-doe-001", taskId: "task-2", status: "submitted", submittedAt: new Date().toISOString() }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch completions" });
      }
    }
  });

  // Admin - Get advertiser inquiries
  app.get('/api/admin/advertiser-inquiries', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      if (isDevelopment()) {
        const demoInquiries = [
          {
            id: "adv-1",
            businessName: "Tech Solutions Inc",
            contactName: "Sarah Johnson", 
            email: "sarah@techsolutions.com",
            phone: "+91 98765 43201",
            campaignType: "App Downloads",
            budget: "₹50,000",
            targetAudience: "Tech enthusiasts, 18-35",
            description: "We want to promote our new productivity app through task-based marketing",
            status: "pending",
            type: "advertiser",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: "adv-2", 
            businessName: "Local Restaurant Chain",
            contactName: "Raj Patel",
            email: "raj@foodchain.com", 
            phone: "+91 98765 43202",
            campaignType: "Reviews & Ratings",
            budget: "₹25,000",
            targetAudience: "Food lovers in Mumbai",
            description: "Looking to increase our Google reviews and ratings across 5 locations",
            status: "pending",
            type: "advertiser",
            createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
          },
          {
            id: "adv-3",
            businessName: "E-commerce Startup",
            contactName: "Priya Sharma",
            email: "priya@ecomstore.com",
            phone: "+91 98765 43203",
            campaignType: "Social Media Engagement", 
            budget: "₹75,000",
            targetAudience: "Young professionals, 22-40",
            description: "Need Instagram and Facebook engagement for our fashion brand launch",
            status: "reviewed",
            type: "advertiser",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
          },
          {
            id: "adv-4",
            businessName: "Fitness App Company",
            contactName: "Vikram Singh",
            email: "vikram@fitapp.com",
            phone: "+91 98765 43204",
            campaignType: "App Downloads & Reviews",
            budget: "₹1,00,000",
            targetAudience: "Health conscious individuals",
            description: "Launch campaign for our new fitness tracking app with downloads and genuine reviews",
            status: "pending",
            type: "advertiser",
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
          }
        ];
        return res.json(demoInquiries);
      }

      res.json([]);
    } catch (error) {
      console.error("Error fetching advertiser inquiries:", error);
      res.status(500).json({ message: "Failed to fetch advertiser inquiries" });
    }
  });

  // Admin - Get contact inquiries
  app.get('/api/admin/contact-inquiries', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      if (isDevelopment()) {
        const demoContactInquiries = [
          {
            id: "contact-1",
            name: "Amit Kumar",
            email: "amit.kumar@gmail.com",
            phone: "+91 98765 43211",
            subject: "Payment Issue",
            category: "Support",
            message: "I completed 5 tasks but my earnings are not reflected in my balance. Please help.",
            status: "pending",
            type: "Contact",
            createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
          },
          {
            id: "contact-2",
            name: "Sneha Patel",
            email: "sneha.patel@yahoo.com",
            phone: "+91 98765 43212",
            subject: "KYC Verification Delay",
            category: "KYC",
            message: "Submitted my KYC documents 5 days ago but still pending. When will it be approved?",
            status: "pending",
            type: "Contact",
            createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
          },
          {
            id: "contact-3",
            name: "Rohit Singh",
            email: "rohit.singh@outlook.com", 
            phone: "+91 98765 43213",
            subject: "Task Submission Problem",
            category: "Technical",
            message: "Unable to upload screenshot for task completion. Getting error 'File too large'.",
            status: "resolved",
            type: "Contact",
            createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
          },
          {
            id: "contact-4",
            name: "Kavya Sharma",
            email: "kavya.sharma@gmail.com",
            phone: "+91 98765 43214", 
            subject: "Referral Bonus Query",
            category: "General",
            message: "My friend joined using my referral code but I haven't received the ₹49 bonus yet.",
            status: "pending",
            type: "Contact",
            createdAt: new Date(Date.now() - 18 * 3600000).toISOString()
          }
        ];
        return res.json(demoContactInquiries);
      }

      res.json([]);
    } catch (error) {
      console.error("Error fetching contact inquiries:", error);
      res.status(500).json({ message: "Failed to fetch contact inquiries" });
    }
  });

  // Admin - Get user-specific earnings
  app.get('/api/admin/user-earnings', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const userEarnings = await storage.getUserEarnings();
      res.json(userEarnings);
    } catch (error) {
      console.error("Error fetching user earnings:", error);
      if (isDevelopment()) {
        res.json([
          { userId: "dev-demo-user", amount: "1250.00" },
          { userId: "john-doe-001", amount: "750.00" }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch user earnings" });
      }
    }
  });

  // Admin - Get user task counts
  app.get('/api/admin/user-tasks', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const userTasks = await storage.getUserTaskCounts();
      res.json(userTasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      if (isDevelopment()) {
        res.json([
          { userId: "dev-demo-user", count: 15 },
          { userId: "john-doe-001", count: 8 }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch user tasks" });
      }
    }
  });

  // Admin - Get chat sessions
  app.get('/api/admin/chat-sessions', async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const chatSessions = await storage.getAllChatSessions();
      res.json(chatSessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      if (isDevelopment()) {
        res.json([
          { id: "1", userId: "dev-demo-user", status: "active", createdAt: new Date().toISOString() },
          { id: "2", userId: "john-doe-001", status: "closed", createdAt: new Date().toISOString() }
        ]);
      } else {
        res.status(500).json({ message: "Failed to fetch chat sessions" });
      }
    }
  });

  // Admin - Update user status (suspension, activation, etc.)
  app.put("/api/admin/users/:id", async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const updates = req.body;

      const updatedUser = await storage.updateUser(id, updates);
      console.log(`Admin: Updated user ${id} status`);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (isDevelopment()) {
        res.json({ message: "User updated successfully (development mode)" });
      } else {
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  // Admin - Update user KYC status
  app.put("/api/admin/users/:id/kyc", async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { status, note } = req.body;

      const updates = {
        kycStatus: status,
        kycNote: note,
        kycReviewedAt: new Date().toISOString()
      };

      if (status === 'approved') {
        updates.kycApprovedAt = new Date().toISOString();
      }

      const updatedUser = await storage.updateUser(id, updates);
      console.log(`Admin: Updated user ${id} KYC status to ${status}`);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating KYC status:", error);
      if (isDevelopment()) {
        res.json({ message: "KYC status updated successfully (development mode)" });
      } else {
        res.status(500).json({ message: "Failed to update KYC status" });
      }
    }
  });

  // Admin - Update user verification status
  app.put("/api/admin/users/:id/verification", async (req: any, res) => {
    try {
      if (!req.session.adminUser && !isDevelopment()) {
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
        // Development mode bypass for testing
        if (isDevelopment() && config.database.fallbackEnabled) {
          console.log("Development mode: Testing balance update");
        } else {
          return res.status(401).json({ message: "Admin authentication required" });
        }
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

  // POST endpoints for admin user suspension/reactivation (used by frontend)
  app.post("/api/admin/users/:id/suspend", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      const user = await storage.updateUserAccountStatus(id, "suspended");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update suspension reason if provided
      if (reason) {
        await storage.updateUser(id, { suspensionReason: reason });
      }

      console.log(`✅ Admin suspended user ${id}: ${reason || 'No reason provided'}`);
      res.json({ message: "User suspended successfully", user });
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.post("/api/admin/users/:id/reactivate", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      const user = await storage.updateUserAccountStatus(id, "active");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Clear suspension reason
      await storage.updateUser(id, { 
        suspensionReason: null,
        reactivationFeePaid: true 
      });

      console.log(`✅ Admin reactivated user ${id}: ${reason || 'No reason provided'}`);
      res.json({ message: "User reactivated successfully", user });
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(500).json({ message: "Failed to reactivate user" });
    }
  });

  app.post("/api/admin/users/:id/kyc-approve", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      const user = await storage.updateUserVerification(id, "verified");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`✅ Admin approved KYC for user ${id}: ${reason || 'No reason provided'}`);
      res.json({ message: "KYC approved successfully", user });
    } catch (error) {
      console.error("Error approving KYC:", error);
      res.status(500).json({ message: "Failed to approve KYC" });
    }
  });

  app.post("/api/admin/users/:id/kyc-deny", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { id } = req.params;
      const { reason } = req.body;
      
      const user = await storage.updateUserVerification(id, "rejected");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`✅ Admin denied KYC for user ${id}: ${reason || 'No reason provided'}`);
      res.json({ message: "KYC denied successfully", user });
    } catch (error) {
      console.error("Error denying KYC:", error);
      res.status(500).json({ message: "Failed to deny KYC" });
    }
  });

  // Update user status (active/suspended) - PUT endpoint for backward compatibility
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
      
      const user = await storage.updateUserAccountStatus(id, status);
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
        const cashfreeOrder = await createCashfreeOrder(
          orderId,
          reactivationFeeAmount,
          {
            customerId: userId,
            customerEmail: user.email || "user@example.com",
            customerPhone: user.phoneNumber || "9999999999",
            customerName: `${user.firstName || 'User'} ${user.lastName || 'Account'}`
          }
        );

        console.log('Cashfree reactivation order created:', cashfreeOrder);
        
        if (cashfreeOrder.payment_session_id) {
          res.json({
            paymentUrl: `https://payments-test.cashfree.com/pgappsdksandbox/login?order_id=${orderId}`,
            sessionId: cashfreeOrder.payment_session_id,
            orderId: orderId
          });
          return;
        }
      } catch (cashfreeError) {
        console.warn('Cashfree reactivation payment failed, using development fallback:', cashfreeError);
      }

      // No development fallback - require successful Cashfree payment
      return res.status(500).json({ message: "Payment processing failed. Please try again." });

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
              amount: (parseFloat(user.reactivationFeeAmount || "49.00")).toString(),
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

  // AI-powered task suggestion endpoints
  app.post("/api/admin/ai/suggest-category", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const suggestion = await suggestTaskCategory(title, description);
      res.json(suggestion);
    } catch (error) {
      console.error("AI category suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest category" });
    }
  });

  app.post("/api/admin/ai/generate-suggestions", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { targetCategory } = req.body;
      
      // Get existing tasks for context
      let existingTasks = [];
      existingTasks = await storage.getTasks();

      const suggestions = await generateTaskSuggestions(existingTasks, targetCategory);
      res.json({ suggestions });
    } catch (error) {
      console.error("AI task generation error:", error);
      res.status(500).json({ error: "Failed to generate task suggestions" });
    }
  });

  app.post("/api/admin/ai/optimize-content", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { title, description, requirements } = req.body;
      if (!title || !description || !requirements) {
        return res.status(400).json({ error: "Title, description, and requirements are required" });
      }

      const optimization = await optimizeTaskContent(title, description, requirements);
      res.json(optimization);
    } catch (error) {
      console.error("AI content optimization error:", error);
      res.status(500).json({ error: "Failed to optimize content" });
    }
  });

  app.post("/api/admin/ai/analyze-performance", async (req: any, res) => {
    try {
      if (!req.session.adminUser) {
        return res.status(401).json({ message: "Admin authentication required" });
      }

      const { taskId } = req.body;
      if (!taskId) {
        return res.status(400).json({ error: "Task ID is required" });
      }

      // Get task and completion data
      const task = await storage.getTask(taskId);
      const completionData = await storage.getUserTaskCompletions(taskId);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      const analysis = await analyzeTaskPerformance(task, completionData);
      res.json(analysis);
    } catch (error) {
      console.error("AI performance analysis error:", error);
      res.status(500).json({ error: "Failed to analyze task performance" });
    }
  });

  // Advertiser Inquiry Routes
  app.post("/api/advertiser-inquiry", async (req, res) => {
    try {
      const inquiry = await storage.createAdvertiserInquiry(req.body);
      res.json(inquiry);
    } catch (error: any) {
      console.error("Error creating advertiser inquiry:", error);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  app.get("/api/advertiser-inquiries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const inquiries = await storage.getAdvertiserInquiries();
      res.json(inquiries);
    } catch (error: any) {
      console.error("Error fetching advertiser inquiries:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/advertiser-inquiry/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      const updated = await storage.updateAdvertiserInquiry(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating advertiser inquiry:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  // Contact Inquiry Routes
  app.post("/api/contact-inquiry", async (req, res) => {
    try {
      const inquiry = await storage.createContactInquiry(req.body);
      res.json(inquiry);
    } catch (error: any) {
      console.error("Error creating contact inquiry:", error);
      res.status(500).json({ error: "Failed to submit inquiry" });
    }
  });

  app.get("/api/contact-inquiries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error: any) {
      console.error("Error fetching contact inquiries:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.put("/api/contact-inquiry/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { id } = req.params;
      const updated = await storage.updateContactInquiry(id, req.body);
      res.json(updated);
    } catch (error: any) {
      console.error("Error updating contact inquiry:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  // Register Live Chat Routes
  const { registerLiveChatRoutes } = await import("./liveChat");
  registerLiveChatRoutes(app);

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
