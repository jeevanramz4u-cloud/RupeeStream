import {
  users,
  videos,
  videoProgress,
  earnings,
  referrals,
  payoutRequests,
  chatMessages,
  paymentHistory,
  type User,
  type UpsertUser,
  type Video,
  type InsertVideo,
  type VideoProgress,
  type InsertVideoProgress,
  type Earning,
  type InsertEarning,
  type Referral,
  type InsertReferral,
  type PayoutRequest,
  type InsertPayoutRequest,
  type ChatMessage,
  type InsertChatMessage,
  type PaymentHistory,
  type InsertPaymentHistory,
} from "@shared/schema";
import { db, safeDbOperation } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

// Demo data for fallback when database is unavailable
const demoUser: User = {
  id: "demo-user-001",
  email: "demo@earnpay.com",
  firstName: "Demo",
  lastName: "User",
  profileImageUrl: null,
  password: "$2b$12$qQdaPKm3HZ7OmudNNcUmIuNB7g7yVoqX/mjTkHUFSGVLkvtHFEoIO",
  phoneNumber: "9876543210",
  dateOfBirth: "1990-01-01",
  gender: null,
  address: "123 Demo Street, Demo Colony",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  accountHolderName: "Demo User",
  accountNumber: "1234567890",
  ifscCode: "DEMO0001234",
  bankName: "Demo Bank",
  governmentIdType: "aadhaar",
  governmentIdNumber: "123456789012",
  governmentIdUrl: null,
  kycStatus: "approved",
  kycFeePaid: true,
  kycFeePaymentId: "kyc_payment_1754496719090_demo-user-001",
  govIdFrontUrl: "test-url",
  govIdBackUrl: "test-url",
  selfieWithIdUrl: "test-url",
  kycSubmittedAt: new Date("2025-08-06T16:07:35.602Z"),
  kycApprovedAt: new Date("2025-08-06T16:11:59.090Z"),
  role: "user",
  balance: "2420.00",
  referralCode: "DEMO001",
  referredBy: null,
  verificationStatus: "verified",
  status: "active",
  dailyWatchTime: 0,
  lastWatchDate: null,
  lastHourlyBonusAt: new Date("2025-08-08T06:44:38.141Z"),
  hourlyBonusCount: 7,
  suspendedAt: null,
  suspensionReason: null,
  consecutiveFailedDays: 0,
  reactivationFeePaid: true,
  reactivationFeeAmount: "49.00",
  resetToken: null,
  resetTokenExpiry: null,
  createdAt: new Date("2025-08-06T03:18:06.612Z"),
  updatedAt: new Date("2025-08-07T22:14:56.469Z")
};

// Demo earnings data for fallback
const demoEarnings = [
  {
    id: "8eeb01f1-51cc-4dee-acac-a72c8409b6f9",
    userId: "demo-user-001",
    videoId: null,
    type: "hourly_bonus" as const,
    amount: "10.00",
    description: "🎁 Hourly Login Bonus",
    createdAt: new Date("2025-08-08T06:44:38.159Z")
  },
  {
    id: "ca94405d-edfa-4c82-bfa4-b7707802684c",
    userId: "demo-user-001",
    videoId: null,
    type: "signup_bonus" as const,
    amount: "1000.00",
    description: "🎉 Welcome Bonus",
    createdAt: new Date("2025-08-06T07:21:41.795Z")
  }
];

// Demo videos data for fallback
const demoVideos = [
  {
    id: "demo-video-1",
    title: "Introduction to EarnPay Platform",
    description: "Learn how to earn money by watching videos on our platform",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    duration: 180,
    earnings: "5.00",
    category: "tutorial",
    isActive: true,
    createdAt: new Date("2025-08-01T00:00:00.000Z"),
    updatedAt: new Date("2025-08-01T00:00:00.000Z")
  }
];

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Traditional auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUserWithTraditionalAuth(userData: any): Promise<User>;
  
  // User management
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserVerification(id: string, status: "pending" | "verified" | "rejected"): Promise<User | undefined>;
  updateUserAccountStatus(id: string, status: "active" | "suspended" | "banned"): Promise<User | undefined>;
  generateReferralCode(): string;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  getUsersForVerification(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Video operations
  getVideos(limit?: number): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  incrementVideoViews(id: string): Promise<void>;
  
  // Video progress operations
  getVideoProgress(userId: string, videoId: string): Promise<VideoProgress | undefined>;
  updateVideoProgress(userId: string, videoId: string, watchedSeconds: number): Promise<VideoProgress>;
  completeVideo(userId: string, videoId: string): Promise<VideoProgress | undefined>;
  
  // Earnings operations
  getEarnings(userId: string): Promise<Earning[]>;
  createEarning(earning: InsertEarning): Promise<Earning>;
  getTotalEarnings(userId: string): Promise<number>;
  getTodayEarnings(userId: string): Promise<number>;
  
  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferrals(userId: string): Promise<Referral[]>;
  creditReferralEarning(referralId: string): Promise<void>;
  
  // Payout operations
  createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest>;
  getPayoutRequests(userId?: string): Promise<PayoutRequest[]>;
  updatePayoutStatus(id: string, status: string): Promise<PayoutRequest | undefined>;
  
  // Chat operations
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Payment history operations
  addPaymentHistory(userId: string, payment: Omit<InsertPaymentHistory, 'userId'>): Promise<PaymentHistory>;
  getPaymentHistory(userId: string): Promise<PaymentHistory[]>;
  getPaymentByOrderId(orderId: string): Promise<PaymentHistory | undefined>;
  getUserPaymentStats(userId: string): Promise<{ kycPaid: boolean; reactivationCount: number; totalPaid: number }>;
  getAllPaymentHistory(): Promise<PaymentHistory[]>;
  
  // KYC operations
  updateUserKycDocuments(userId: string, kycData: any): Promise<void>;
  updateUserKycPayment(userId: string, paymentData: any): Promise<void>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Daily tracking
  updateDailyWatchTime(userId: string, additionalMinutes: number): Promise<void>;
  getDailyWatchTime(userId: string): Promise<number>;
  resetDailyWatchTime(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }, id === "demo-user-001" ? demoUser : undefined);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode: this.generateReferralCode(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Traditional auth operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    return safeDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    }, email === "demo@earnpay.com" ? demoUser : undefined);
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUserWithTraditionalAuth(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: Math.random().toString(36).substring(2, 15),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: null,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
        city: userData.city,
        state: userData.state,
        pincode: userData.pincode,
        accountHolderName: userData.accountHolderName,
        accountNumber: userData.accountNumber,
        ifscCode: userData.ifscCode,
        bankName: userData.bankName,
        governmentIdType: userData.governmentIdType,
        governmentIdNumber: userData.governmentIdNumber,
        governmentIdUrl: userData.governmentIdUrl,
        verificationStatus: userData.verificationStatus || 'pending',
        status: userData.status || 'active',
        balance: userData.balance || 0,
        referralCode: userData.referralCode || this.generateReferralCode(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserVerification(id: string, status: "pending" | "verified" | "rejected"): Promise<User | undefined> {
    // Map verification status to KYC status
    const kycStatusMap = {
      "pending": "pending" as const,
      "verified": "approved" as const,
      "rejected": "rejected" as const
    };

    const updateData: any = { 
      verificationStatus: status, 
      kycStatus: kycStatusMap[status],
      updatedAt: new Date() 
    };

    // Set approval timestamp if verified
    if (status === "verified") {
      updateData.kycApprovedAt = new Date();
      
      // Credit referral earning when user gets verified
      const userRecord = await db.select().from(users).where(eq(users.id, id));
      if (userRecord.length > 0 && userRecord[0].referredBy) {
        const referralRecord = await db
          .select()
          .from(referrals)
          .where(and(
            eq(referrals.referrerId, userRecord[0].referredBy),
            eq(referrals.referredId, id)
          ));
        
        if (referralRecord.length > 0 && !referralRecord[0].isEarningCredited) {
          await this.creditReferralEarning(referralRecord[0].id);
        }
      }
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserAccountStatus(id: string, status: "active" | "suspended" | "banned"): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ status: status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  generateReferralCode(): string {
    return `EP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user;
  }

  async getUsersForVerification(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.verificationStatus, "pending"))
      .orderBy(desc(users.createdAt));
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete related data first to maintain referential integrity
      
      // Delete video progress
      await db.delete(videoProgress).where(eq(videoProgress.userId, id));
      
      // Delete earnings
      await db.delete(earnings).where(eq(earnings.userId, id));
      
      // Delete referrals (both referring and referred)
      await db.delete(referrals).where(eq(referrals.referredId, id));
      await db.delete(referrals).where(eq(referrals.referrerId, id));
      
      // Delete payout requests
      await db.delete(payoutRequests).where(eq(payoutRequests.userId, id));
      
      // Delete chat messages
      await db.delete(chatMessages).where(eq(chatMessages.userId, id));
      
      // Finally delete the user
      const result = await db.delete(users).where(eq(users.id, id));
      
      return (result.rowCount || 0) > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Video operations
  async getVideos(limit = 50): Promise<Video[]> {
    return safeDbOperation(async () => {
      return await db
        .select()
        .from(videos)
        .where(eq(videos.isActive, true))
        .orderBy(desc(videos.createdAt))
        .limit(limit);
    }, demoVideos);
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async updateVideo(id: string, updates: Partial<Video>): Promise<Video | undefined> {
    const [video] = await db
      .update(videos)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return video;
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await db
      .update(videos)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(videos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementVideoViews(id: string): Promise<void> {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));
  }

  // Video progress operations
  async getVideoProgress(userId: string, videoId: string): Promise<VideoProgress | undefined> {
    const [progress] = await db
      .select()
      .from(videoProgress)
      .where(and(eq(videoProgress.userId, userId), eq(videoProgress.videoId, videoId)));
    return progress;
  }

  async updateVideoProgress(userId: string, videoId: string, watchedSeconds: number): Promise<VideoProgress> {
    const existing = await this.getVideoProgress(userId, videoId);
    
    if (existing) {
      const [updated] = await db
        .update(videoProgress)
        .set({ watchedSeconds })
        .where(eq(videoProgress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(videoProgress)
        .values({ userId, videoId, watchedSeconds })
        .returning();
      return newProgress;
    }
  }

  async completeVideo(userId: string, videoId: string): Promise<VideoProgress | undefined> {
    // Get or create progress record
    let existing = await this.getVideoProgress(userId, videoId);
    if (!existing) {
      // Create initial progress record
      const [newProgress] = await db
        .insert(videoProgress)
        .values({ userId, videoId, watchedSeconds: 0 })
        .returning();
      existing = newProgress;
    }

    // Check if already completed and credited
    if (existing.isCompleted && existing.isEarningCredited) {
      return existing;
    }

    // Get video info for earnings
    const video = await this.getVideo(videoId);
    if (!video) return existing;

    // Mark as completed
    const [updated] = await db
      .update(videoProgress)
      .set({ 
        isCompleted: true, 
        completedAt: new Date(),
        isEarningCredited: true 
      })
      .where(eq(videoProgress.id, existing.id))
      .returning();

    // Create earning record only if not already credited
    if (!existing.isEarningCredited) {
      await this.createEarning({
        userId,
        videoId,
        type: "video",
        amount: video.earning.toString(),
        description: `Completed video: ${video.title}`,
      });

      // Increment video views
      await db
        .update(videos)
        .set({ views: sql`${videos.views} + 1` })
        .where(eq(videos.id, videoId));
    }

    updated.isEarningCredited = true;
    return updated;
  }

  // Earnings operations
  async getEarnings(userId: string): Promise<Earning[]> {
    return safeDbOperation(async () => {
      return await db
        .select()
        .from(earnings)
        .where(eq(earnings.userId, userId))
        .orderBy(desc(earnings.createdAt));
    }, userId === "demo-user-001" ? demoEarnings : []);
  }

  async createEarning(earning: InsertEarning): Promise<Earning> {
    const [newEarning] = await db.insert(earnings).values(earning).returning();
    
    // Update user balance
    const currentUser = await this.getUser(earning.userId);
    if (currentUser) {
      const currentBalance = parseFloat(currentUser.balance.toString());
      const newBalance = currentBalance + parseFloat(earning.amount.toString());
      await db
        .update(users)
        .set({ balance: newBalance.toFixed(2) })
        .where(eq(users.id, earning.userId));
    }
    
    return newEarning;
  }

  async checkAndAwardHourlyBonus(userId: string): Promise<{ awarded: boolean; amount?: string }> {
    const user = await this.getUser(userId);
    if (!user) return { awarded: false };

    const now = new Date();
    const lastBonus = user.lastHourlyBonusAt;
    
    // Check if user is eligible for hourly bonus (1 hour since last bonus)
    if (!lastBonus || (now.getTime() - new Date(lastBonus).getTime()) >= 3600000) { // 1 hour = 3600000ms
      const bonusAmount = "10.00";
      
      // Create earning record
      await this.createEarning({
        userId: userId,
        amount: bonusAmount,
        type: "hourly_bonus",
        description: "🎁 Hourly Login Bonus"
      });
      
      // Update user's last bonus time and count
      await db
        .update(users)
        .set({ 
          lastHourlyBonusAt: now,
          hourlyBonusCount: user.hourlyBonusCount + 1
        })
        .where(eq(users.id, userId));
      
      return { awarded: true, amount: bonusAmount };
    }
    
    return { awarded: false };
  }

  async getTotalEarnings(userId: string): Promise<number> {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${earnings.amount}), 0)` })
      .from(earnings)
      .where(eq(earnings.userId, userId));
    
    return Number(result[0]?.total) || 0;
  }

  async getTodayEarnings(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${earnings.amount}), 0)` })
      .from(earnings)
      .where(and(
        eq(earnings.userId, userId),
        gte(earnings.createdAt, today)
      ));
    
    return Number(result[0]?.total) || 0;
  }

  // Referral operations
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db.insert(referrals).values(referral).returning();
    return newReferral;
  }

  async getReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async getReferralsWithUserDetails(userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: referrals.id,
        isEarningCredited: referrals.isEarningCredited,
        createdAt: referrals.createdAt,
        referredUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          verificationStatus: users.verificationStatus,
          kycStatus: users.kycStatus
        }
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referredId, users.id))
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
    
    return result;
  }

  async getReferralByReferredId(referredId: string): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredId, referredId));
    return referral;
  }

  async updateReferralEarningStatus(id: string, isEarningCredited: boolean): Promise<Referral | undefined> {
    const [updated] = await db
      .update(referrals)
      .set({ isEarningCredited })
      .where(eq(referrals.id, id))
      .returning();
    return updated;
  }

  async creditReferralEarning(referralId: string): Promise<void> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));
    
    if (referral && !referral.isEarningCredited) {
      // Create earning for referrer
      await this.createEarning({
        userId: referral.referrerId,
        type: "referral",
        amount: "49.00",
        description: "Referral bonus",
      });
      
      // Mark as credited
      await db
        .update(referrals)
        .set({ isEarningCredited: true })
        .where(eq(referrals.id, referralId));
    }
  }

  // Payout operations
  async createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest> {
    const [newRequest] = await db.insert(payoutRequests).values(request).returning();
    return newRequest;
  }

  async getPayoutRequests(userId?: string): Promise<PayoutRequest[]> {
    if (userId) {
      return await db
        .select()
        .from(payoutRequests)
        .where(eq(payoutRequests.userId, userId))
        .orderBy(desc(payoutRequests.requestedAt));
    }
    
    return await db
      .select()
      .from(payoutRequests)
      .orderBy(desc(payoutRequests.requestedAt));
  }

  async updatePayoutStatus(id: string, status: string, reason?: string): Promise<PayoutRequest | undefined> {
    const updateData: any = { status, processedAt: new Date() };
    if (reason) {
      updateData.reason = reason;
    }
    
    // Get the payout request first to get the amount and userId
    const [existingRequest] = await db
      .select()
      .from(payoutRequests)
      .where(eq(payoutRequests.id, id));
    
    if (!existingRequest) {
      throw new Error("Payout request not found");
    }
    
    // Update the payout status
    const [request] = await db
      .update(payoutRequests)
      .set(updateData)
      .where(eq(payoutRequests.id, id))
      .returning();
    
    // If status is completed, deduct the amount from user's balance
    if (status === 'completed' && existingRequest.status !== 'completed') {
      const user = await this.getUser(existingRequest.userId);
      if (user) {
        const currentBalance = parseFloat(user.balance || '0');
        const payoutAmount = parseFloat(existingRequest.amount);
        const newBalance = Math.max(0, currentBalance - payoutAmount); // Ensure balance doesn't go negative
        
        await db
          .update(users)
          .set({ balance: newBalance.toFixed(2) })
          .where(eq(users.id, existingRequest.userId));
      }
    }
    
    return request;
  }

  // Chat operations
  async getChatMessages(limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // KYC operations
  async updateUserKycDocuments(userId: string, kycData: any): Promise<void> {
    await db
      .update(users)
      .set(kycData)
      .where(eq(users.id, userId));
  }

  async updateUserKycPayment(userId: string, paymentData: any): Promise<void> {
    await db
      .update(users)
      .set(paymentData)
      .where(eq(users.id, userId));
  }

  async updateUserKycPaymentAndApprove(userId: string, approvalData: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...approvalData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    // Process referral bonus if user has a referrer
    if (user && user.referredBy) {
      try {
        console.log(`Processing referral bonus for admin KYC approval: ${user.email} (referred by: ${user.referredBy})`);
        
        // Check if referral bonus has already been credited
        const referralRecord = await this.getReferralByReferredId(user.id);
        if (referralRecord && !referralRecord.isEarningCredited) {
          // Credit ₹49 to the referrer
          const referrer = await this.getUser(user.referredBy);
          if (referrer) {
            const currentBalance = parseFloat(referrer.balance as string) || 0;
            const bonusAmount = 49;
            const newBalance = currentBalance + bonusAmount;
            
            // Update referrer's balance
            await this.updateUser(referrer.id, { balance: newBalance.toString() });
            
            // Add earning record for the referrer
            await this.createEarning({
              userId: referrer.id,
              amount: bonusAmount.toString(),
              type: "referral",
              description: `Referral bonus for ${user.firstName} ${user.lastName} (admin approval)`,
            });
            
            // Mark referral as earning credited
            await this.updateReferralEarningStatus(referralRecord.id, true);
            
            console.log(`✅ Admin Referral bonus paid: ₹${bonusAmount} to ${referrer.email} for referring ${user.email}`);
          }
        }
      } catch (error) {
        console.error("❌ Error processing admin referral bonus:", error);
        // Don't fail the KYC approval if referral bonus fails
      }
    }

    return user;
  }

  // Daily tracking
  async updateDailyWatchTime(userId: string, additionalMinutes: number): Promise<void> {
    const today = new Date().toDateString();
    const user = await this.getUser(userId);
    
    if (!user) return;
    
    const lastWatchDate = user.lastWatchDate?.toDateString();
    const isNewDay = lastWatchDate !== today;
    
    await db
      .update(users)
      .set({
        dailyWatchTime: isNewDay ? additionalMinutes : sql`${users.dailyWatchTime} + ${additionalMinutes}`,
        lastWatchDate: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getDailyWatchTime(userId: string): Promise<number> {
    const user = await this.getUser(userId);
    if (!user) return 0;
    
    const today = new Date().toDateString();
    const lastWatchDate = user.lastWatchDate?.toDateString();
    
    return lastWatchDate === today ? user.dailyWatchTime : 0;
  }

  async resetDailyWatchTime(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ dailyWatchTime: 0 })
      .where(eq(users.id, userId));
  }

  // KYC methods
  async updateKycDocument(userId: string, documentType: 'front' | 'back' | 'selfie', objectPath: string): Promise<User | undefined> {
    const updateData: any = {};
    if (documentType === 'front') {
      updateData.govIdFrontUrl = objectPath;
    } else if (documentType === 'back') {
      updateData.govIdBackUrl = objectPath;
    } else if (documentType === 'selfie') {
      updateData.selfieWithIdUrl = objectPath;
    }

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async submitKyc(userId: string, kycData: {
    governmentIdType: string;
    governmentIdNumber: string;
    govIdFrontUrl: string;
    govIdBackUrl: string;
    selfieWithIdUrl: string;
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        governmentIdType: kycData.governmentIdType,
        governmentIdNumber: kycData.governmentIdNumber,
        govIdFrontUrl: kycData.govIdFrontUrl,
        govIdBackUrl: kycData.govIdBackUrl,
        selfieWithIdUrl: kycData.selfieWithIdUrl,
        kycStatus: 'submitted',
        kycSubmittedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async markKycFeePaid(userId: string, paymentId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        kycFeePaid: true,
        kycFeePaymentId: paymentId,
        kycStatus: 'approved',
        verificationStatus: 'verified',
      })
      .where(eq(users.id, userId))
      .returning();

    // Process referral bonus if user has a referrer
    if (user && user.referredBy) {
      try {
        console.log(`Processing referral bonus for KYC completion: ${user.email} (referred by: ${user.referredBy})`);
        
        // Check if referral bonus has already been credited
        const referralRecord = await this.getReferralByReferredId(user.id);
        if (referralRecord && !referralRecord.isEarningCredited) {
          // Credit ₹49 to the referrer
          const referrer = await this.getUser(user.referredBy);
          if (referrer) {
            const currentBalance = parseFloat(referrer.balance as string) || 0;
            const bonusAmount = 49;
            const newBalance = currentBalance + bonusAmount;
            
            // Update referrer's balance
            await this.updateUser(referrer.id, { balance: newBalance.toString() });
            
            // Add earning record for the referrer
            await this.createEarning({
              userId: referrer.id,
              amount: bonusAmount.toString(),
              type: "referral",
              description: `Referral bonus for ${user.firstName} ${user.lastName} completing KYC`,
            });
            
            // Mark referral as earning credited
            await this.updateReferralEarningStatus(referralRecord.id, true);
            
            console.log(`✅ KYC Referral bonus paid: ₹${bonusAmount} to ${referrer.email} for referring ${user.email}`);
          }
        }
      } catch (error) {
        console.error("❌ Error processing KYC referral bonus:", error);
        // Don't fail the KYC completion if referral bonus fails
      }
    }

    return user;
  }
  // Payment history operations
  async addPaymentHistory(userId: string, payment: Omit<InsertPaymentHistory, 'userId'>): Promise<PaymentHistory> {
    const paymentId = `payment_${Date.now()}_${userId.slice(-8)}`;
    const [newPayment] = await db
      .insert(paymentHistory)
      .values({
        id: paymentId,
        ...payment,
        userId,
        completedAt: payment.status === 'completed' ? new Date() : null,
      })
      .returning();
    return newPayment;
  }

  async getPaymentHistory(userId: string): Promise<PaymentHistory[]> {
    return await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.userId, userId))
      .orderBy(desc(paymentHistory.createdAt));
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentHistory | undefined> {
    const [payment] = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.orderId, orderId));
    return payment;
  }

  async getUserPaymentStats(userId: string): Promise<{ kycPaid: boolean; reactivationCount: number; totalPaid: number }> {
    const payments = await this.getPaymentHistory(userId);
    
    const kycPaid = payments.some(p => p.type === 'kyc' && p.status === 'completed');
    const reactivationCount = payments.filter(p => p.type === 'reactivation' && p.status === 'completed').length;
    const totalPaid = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      kycPaid,
      reactivationCount,
      totalPaid
    };
  }

  async getAllPaymentHistory(): Promise<any[]> {
    try {
      const payments = await db
        .select({
          id: paymentHistory.id,
          userId: paymentHistory.userId,
          userEmail: users.email,
          userName: sql<string>`COALESCE(CONCAT(${users.firstName}, ' ', ${users.lastName}), 'Unknown User')`,
          type: paymentHistory.type,
          amount: paymentHistory.amount,
          orderId: paymentHistory.orderId,
          paymentMethod: paymentHistory.paymentMethod,
          status: paymentHistory.status,
          createdAt: paymentHistory.createdAt
        })
        .from(paymentHistory)
        .leftJoin(users, eq(paymentHistory.userId, users.id))
        .orderBy(desc(paymentHistory.createdAt))
        .limit(500);
      
      return payments;
    } catch (error) {
      console.error("Error fetching all payment history:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
