import {
  users,
  videos,
  videoProgress,
  earnings,
  referrals,
  payoutRequests,
  chatMessages,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Traditional auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
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
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
    return await db
      .select()
      .from(videos)
      .where(eq(videos.isActive, true))
      .orderBy(desc(videos.createdAt))
      .limit(limit);
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
    return await db
      .select()
      .from(earnings)
      .where(eq(earnings.userId, userId))
      .orderBy(desc(earnings.createdAt));
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
    
    const [request] = await db
      .update(payoutRequests)
      .set(updateData)
      .where(eq(payoutRequests.id, id))
      .returning();
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
    return user;
  }
}

export const storage = new DatabaseStorage();
