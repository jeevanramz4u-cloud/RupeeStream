import {
  users,
  videos,
  videoProgress,
  earnings,
  referrals,
  payoutRequests,
  chatMessages,
  paymentHistory,
  tasks,
  taskCompletions,
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
  type Task,
  type InsertTask,
  type TaskCompletion,
  type InsertTaskCompletion,
} from "@shared/schema";
import { db } from "./db";
import { config, isDevelopment } from "./config";
import { eq, desc, and, sql, gte } from "drizzle-orm";

// Database storage implementation

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
  
  // Referral helper methods
  getReferralByReferredId(referredId: string): Promise<Referral | undefined>;
  updateReferralEarningStatus(referralId: string, credited: boolean): Promise<void>;
  getReferralsWithUserDetails(userId: string): Promise<any[]>;
  
  // Daily tracking
  updateDailyWatchTime(userId: string, additionalMinutes: number): Promise<void>;
  getDailyWatchTime(userId: string): Promise<number>;
  resetDailyWatchTime(userId: string): Promise<void>;
  
  // Task operations
  getTasks(limit?: number): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Task completion operations
  getUserTaskCompletions(userId: string): Promise<TaskCompletion[]>;
  getTaskCompletion(userId: string, taskId: string): Promise<TaskCompletion | undefined>;
  createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
  updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined>;
  approveTaskCompletion(id: string, reviewedBy: string): Promise<void>;
  rejectTaskCompletion(id: string, reviewedBy: string, reason: string): Promise<void>;
  getTaskCompletionsForReview(): Promise<TaskCompletion[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: User getUser simulated (database unavailable)");
        // Return test users for development mode
        const testUsers: Record<string, User> = {
          'dev-demo-user': {
            id: 'dev-demo-user',
            email: 'demo@innovativetaskearn.online',
            firstName: 'Demo',
            lastName: 'User',
            profileImageUrl: null,
            password: '$2b$12$GsdpSXb2HbpLLWhFqT2QR.QVyT0nnirL9vFXuE.0xF3kRfxOSOXfW',
            phoneNumber: '9876543210',
            dateOfBirth: '1990-01-01',
            address: '123 Demo Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            accountHolderName: 'Demo User',
            accountNumber: '1234567890',
            ifscCode: 'HDFC0000123',
            bankName: 'HDFC Bank',
            governmentIdType: 'aadhaar',
            governmentIdNumber: '123456789012',
            governmentIdUrl: 'demo-kyc-doc.jpg',
            verificationStatus: 'verified',
            kycStatus: 'approved',
            status: 'active',
            balance: '1000.00',
            referralCode: 'DEMO123',
            createdAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: new Date(),
            suspensionReason: null
          },
          'dev-user-1755205507947': {
            id: 'dev-user-1755205507947',
            email: 'rahul.sharma@test.com',
            firstName: 'Rahul',
            lastName: 'Sharma',
            profileImageUrl: null,
            password: '$2b$12$vFplrKfrRse7njVSDS1q3uJrAz76PNrq7f.tYHb.wH4NraV66cyH.',
            phoneNumber: '9876543211',
            dateOfBirth: '1995-03-15',
            address: '456 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            accountHolderName: 'Rahul Sharma',
            accountNumber: '1234567890',
            ifscCode: 'ICIC0000001',
            bankName: 'ICICI Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'active',
            balance: '125.00',
            referralCode: 'HHJIYY',
            createdAt: new Date('2025-08-14T21:05:07.947Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: null
          },
          'dev-user-1755205510611': {
            id: 'dev-user-1755205510611',
            email: 'priya.patel@test.com',
            firstName: 'Priya',
            lastName: 'Patel',
            profileImageUrl: null,
            password: '$2b$12$NgyWkMxqOhZbqqv93WPeden1UuTgQJSP07zbcugDI9il3.HEXjjDe',
            phoneNumber: '9876543212',
            dateOfBirth: '1992-07-22',
            address: '789 Park Street',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            accountHolderName: 'Priya Patel',
            accountNumber: '2345678901',
            ifscCode: 'SBIN0000001',
            bankName: 'State Bank of India',
            governmentIdType: 'Aadhaar',
            governmentIdNumber: '1234-5678-9012',
            governmentIdUrl: 'https://example.com/kyc-doc.jpg',
            verificationStatus: 'verified',
            kycStatus: 'approved',
            status: 'active',
            balance: '89.50',
            referralCode: 'QEPSXO',
            createdAt: new Date('2025-08-14T21:05:10.611Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: new Date('2025-08-14T15:30:00.000Z'),
            suspensionReason: null
          }
        };
        
        return testUsers[id] || undefined;
      }
      throw error;
    }
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
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: User lookup simulated (database unavailable)");
        // Return test users for development mode authentication
        const testUsers: Record<string, User> = {
          "rahul.sharma@test.com": {
            id: 'dev-user-1755205507947',
            email: 'rahul.sharma@test.com',
            firstName: 'Rahul',
            lastName: 'Sharma',
            profileImageUrl: null,
            password: '$2b$12$vFplrKfrRse7njVSDS1q3uJrAz76PNrq7f.tYHb.wH4NraV66cyH.', // "test123"
            phoneNumber: '9876543211',
            dateOfBirth: '1995-03-15',
            address: '456 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            accountHolderName: 'Rahul Sharma',
            accountNumber: '1234567890',
            ifscCode: 'ICIC0000001',
            bankName: 'ICICI Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'active',
            balance: '125.00',
            referralCode: 'HHJIYY',
            createdAt: new Date('2025-08-14T21:05:07.947Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: null
          },
          "priya.patel@test.com": {
            id: 'dev-user-1755205510611',
            email: 'priya.patel@test.com',
            firstName: 'Priya',
            lastName: 'Patel',
            profileImageUrl: null,
            password: '$2b$12$NgyWkMxqOhZbqqv93WPeden1UuTgQJSP07zbcugDI9il3.HEXjjDe', // "test123"
            phoneNumber: '9876543212',
            dateOfBirth: '1992-07-22',
            address: '789 Park Street',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            accountHolderName: 'Priya Patel',
            accountNumber: '2345678901',
            ifscCode: 'SBIN0000001',
            bankName: 'State Bank of India',
            governmentIdType: 'Aadhaar',
            governmentIdNumber: '1234-5678-9012',
            governmentIdUrl: 'https://example.com/kyc-doc.jpg',
            verificationStatus: 'verified',
            kycStatus: 'approved',
            status: 'active',
            balance: '89.50',
            referralCode: 'QEPSXO',
            createdAt: new Date('2025-08-14T21:05:10.611Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: new Date('2025-08-14T15:30:00.000Z'),
            suspensionReason: null
          },
          "demo@innovativetaskearn.online": {
            id: 'dev-demo-user',
            email: 'demo@innovativetaskearn.online',
            firstName: 'Demo',
            lastName: 'User',
            profileImageUrl: null,
            password: '$2b$12$GsdpSXb2HbpLLWhFqT2QR.QVyT0nnirL9vFXuE.0xF3kRfxOSOXfW', // "demo123"
            phoneNumber: '9876543210',
            dateOfBirth: '1990-01-01',
            address: '123 Demo Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            accountHolderName: 'Demo User',
            accountNumber: '1234567890',
            ifscCode: 'HDFC0000123',
            bankName: 'HDFC Bank',
            governmentIdType: 'aadhaar',
            governmentIdNumber: '123456789012',
            governmentIdUrl: 'demo-kyc-doc.jpg',
            verificationStatus: 'verified',
            kycStatus: 'approved',
            status: 'active',
            balance: '1000.00',
            referralCode: 'DEMO123',
            createdAt: new Date(),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: new Date(),
            suspensionReason: null
          }
        };
        
        return testUsers[email] || undefined;
      }
      throw error;
    }
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.resetToken, token));
    return user;
  }

  async createUserWithTraditionalAuth(userData: any): Promise<User> {
    try {
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
          kycStatus: 'pending',
          status: userData.status || 'active',
          balance: userData.balance || "0.00",
          referralCode: userData.referralCode || this.generateReferralCode(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: User creation simulated (database unavailable)");
        const devUser: User = {
          id: 'dev-user-' + Date.now(),
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
          kycStatus: 'pending',
          status: userData.status || 'active',
          balance: userData.balance || "0.00",
          referralCode: userData.referralCode || this.generateReferralCode(),
          createdAt: new Date(),
          updatedAt: new Date(),
          resetToken: null,
          resetTokenExpiry: null,
          kycApprovedAt: null,
          suspensionReason: null
        };
        return devUser;
      }
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: User update simulated (database unavailable) - Status: ${updates.status}`);
        // Return updated user data for suspension demo
        if ((id === 'dev-user-1755205393601' || id === 'dev-user-1755205510611' || id === 'dev-user-1755205527714') && updates.status === 'suspended') {
          return {
            id: 'dev-user-1755205393601',
            email: 'suspended@test.com',
            firstName: 'Suspended',
            lastName: 'User',
            profileImageUrl: null,
            password: '$2b$12$kA6/.QZxE0FAk7p1X2NdRu/Bn3cEyXiGKJaiBaXCR6J9hXe/yGGGG',
            phoneNumber: '9876543210',
            dateOfBirth: '1990-01-01',
            address: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            accountHolderName: 'Suspended User',
            accountNumber: '9876543210',
            ifscCode: 'HDFC0000456',
            bankName: 'HDFC Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'suspended',
            balance: '0.00',
            referralCode: 'ZCZA8U',
            createdAt: new Date('2025-08-14T21:03:13.601Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: 'Account suspended by admin for demonstration'
          } as User;
        }
        return undefined;
      }
      throw error;
    }
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
    try {
      const [user] = await db
        .update(users)
        .set({ status: status, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: User status update simulated (database unavailable) - Status: ${status}`);
        // Return updated user data for suspension demo
        if (id === 'dev-user-1755205393601' || id === 'dev-user-1755205510611' || id === 'dev-user-1755205527714') {
          return {
            id: 'dev-user-1755205393601',
            email: 'suspended@test.com',
            firstName: 'Suspended',
            lastName: 'User',
            profileImageUrl: null,
            password: '$2b$12$kA6/.QZxE0FAk7p1X2NdRu/Bn3cEyXiGKJaiBaXCR6J9hXe/yGGGG',
            phoneNumber: '9876543210',
            dateOfBirth: '1990-01-01',
            address: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            accountHolderName: 'Suspended User',
            accountNumber: '9876543210',
            ifscCode: 'HDFC0000456',
            bankName: 'HDFC Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: status,
            balance: '0.00',
            referralCode: 'ZCZA8U',
            createdAt: new Date('2025-08-14T21:03:13.601Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: status === 'suspended' ? 'Account suspended by admin for demonstration' : null
          } as User;
        }
        return undefined;
      }
      throw error;
    }
  }

  generateReferralCode(): string {
    return `EP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.referralCode, code));
      return user;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Referral lookup simulated (database unavailable)");
        return undefined;
      }
      throw error;
    }
  }

  async getUsersForVerification(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .where(eq(users.verificationStatus, "pending"))
        .orderBy(desc(users.createdAt));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Users for verification simulated (database unavailable)");
        return [
          {
            id: 'dev-user-1755205507947',
            email: 'rahul.sharma@test.com',
            firstName: 'Rahul',
            lastName: 'Sharma',
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'active',
            balance: '125.00'
          }
        ] as User[];
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Users list simulated (database unavailable)");
        // Return our test users for admin panel
        return [
          {
            id: 'dev-user-1755205393601',
            email: 'suspended@test.com',
            firstName: 'Suspended',
            lastName: 'User',
            profileImageUrl: null,
            password: '$2b$12$kA6/.QZxE0FAk7p1X2NdRu/Bn3cEyXiGKJaiBaXCR6J9hXe/yGGGG',
            phoneNumber: '9876543210',
            dateOfBirth: '1990-01-01',
            address: '123 Test Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            accountHolderName: 'Suspended User',
            accountNumber: '9876543210',
            ifscCode: 'HDFC0000456',
            bankName: 'HDFC Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'suspended',
            balance: '0.00',
            referralCode: 'ZCZA8U',
            createdAt: new Date('2025-08-14T21:03:13.601Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: 'Account suspended by admin for demonstration'
          },
          {
            id: 'dev-user-1755205507947',
            email: 'rahul.sharma@test.com',
            firstName: 'Rahul',
            lastName: 'Sharma',
            profileImageUrl: null,
            password: '$2b$12$vFplrKfrRse7njVSDS1q3uJrAz76PNrq7f.tYHb.wH4NraV66cyH.',
            phoneNumber: '9876543211',
            dateOfBirth: '1995-03-15',
            address: '456 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            accountHolderName: 'Rahul Sharma',
            accountNumber: '1234567890',
            ifscCode: 'ICIC0000001',
            bankName: 'ICICI Bank',
            governmentIdType: null,
            governmentIdNumber: null,
            governmentIdUrl: null,
            verificationStatus: 'pending',
            kycStatus: 'pending',
            status: 'active',
            balance: '125.00',
            referralCode: 'HHJIYY',
            createdAt: new Date('2025-08-14T21:05:07.947Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: null,
            suspensionReason: null
          },
          {
            id: 'dev-user-1755205510611',
            email: 'priya.patel@test.com',
            firstName: 'Priya',
            lastName: 'Patel',
            profileImageUrl: null,
            password: '$2b$12$NgyWkMxqOhZbqqv93WPeden1UuTgQJSP07zbcugDI9il3.HEXjjDe',
            phoneNumber: '9876543212',
            dateOfBirth: '1992-07-22',
            address: '789 Park Street',
            city: 'Delhi',
            state: 'Delhi',
            pincode: '110001',
            accountHolderName: 'Priya Patel',
            accountNumber: '2345678901',
            ifscCode: 'SBIN0000001',
            bankName: 'State Bank of India',
            governmentIdType: 'Aadhaar',
            governmentIdNumber: '1234-5678-9012',
            governmentIdUrl: 'https://example.com/kyc-doc.jpg',
            verificationStatus: 'verified',
            kycStatus: 'approved',
            status: 'active',
            balance: '89.50',
            referralCode: 'QEPSXO',
            createdAt: new Date('2025-08-14T21:05:10.611Z'),
            updatedAt: new Date(),
            resetToken: null,
            resetTokenExpiry: null,
            kycApprovedAt: new Date('2025-08-14T15:30:00.000Z'),
            suspensionReason: null
          }
        ] as User[];
      }
      throw error;
    }
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
    try {
      return await db
        .select()
        .from(videos)
        .where(eq(videos.isActive, true))
        .orderBy(desc(videos.createdAt))
        .limit(limit);
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Videos simulated (database unavailable)");
        return []; // Return empty array for video analytics
      }
      throw error;
    }
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
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Earning creation simulated (database unavailable)");
        const devEarning: Earning = {
          id: 'dev-earning-' + Date.now(),
          userId: earning.userId,
          amount: earning.amount,
          type: earning.type,
          description: earning.description,
          createdAt: new Date()
        };
        return devEarning;
      }
      throw error;
    }
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
    try {
      const [newReferral] = await db.insert(referrals).values(referral).returning();
      return newReferral;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Referral creation simulated (database unavailable)");
        const devReferral: Referral = {
          id: 'dev-referral-' + Date.now(),
          referrerId: referral.referrerId,
          referredId: referral.referredId,
          rewardCredited: false,
          createdAt: new Date()
        };
        return devReferral;
      }
      throw error;
    }
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
    try {
      const [newRequest] = await db.insert(payoutRequests).values(request).returning();
      return newRequest;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Payout creation simulated (database unavailable)");
        const newPayout: PayoutRequest = {
          id: `dev-payout-${Date.now()}`,
          userId: request.userId,
          amount: request.amount,
          status: 'pending',
          requestedAt: new Date(),
          processedAt: null,
          reason: null
        };
        return newPayout;
      }
      throw error;
    }
  }

  async getPayoutRequests(userId?: string): Promise<PayoutRequest[]> {
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Payouts simulated (database unavailable)");
        return [
          {
            id: 'payout-1',
            userId: 'dev-user-1755205507947',
            amount: '150.00',
            status: 'pending',
            requestedAt: new Date('2025-08-14T15:30:00.000Z'),
            processedAt: null,
            reason: null
          },
          {
            id: 'payout-2',
            userId: 'dev-user-1755205510611',
            amount: '89.50',
            status: 'completed',
            requestedAt: new Date('2025-08-14T10:15:00.000Z'),
            processedAt: new Date('2025-08-14T16:20:00.000Z'),
            reason: null
          }
        ] as PayoutRequest[];
      }
      throw error;
    }
  }

  async updatePayoutStatus(id: string, status: string, reason?: string): Promise<PayoutRequest | undefined> {
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Payout update simulated (database unavailable)");
        
        // Simulate finding and updating the payout
        const samplePayouts = [
          {
            id: 'payout-1',
            userId: 'dev-user-1755205507947',
            amount: '150.00',
            status: 'pending',
            requestedAt: new Date('2025-08-14T15:30:00.000Z'),
            processedAt: null,
            reason: null
          },
          {
            id: 'payout-2',
            userId: 'dev-user-1755205510611',
            amount: '89.50',
            status: 'completed',
            requestedAt: new Date('2025-08-14T10:15:00.000Z'),
            processedAt: new Date('2025-08-14T16:20:00.000Z'),
            reason: null
          }
        ];
        
        const payout = samplePayouts.find(p => p.id === id);
        if (payout) {
          payout.status = status;
          payout.processedAt = new Date();
          if (reason) {
            payout.reason = reason;
          }
          console.log(`✅ Payout ${id} updated to ${status}${reason ? ` with reason: ${reason}` : ''}`);
          
          // Simulate notification to user
          if (status === 'approved') {
            console.log(`📧 NOTIFICATION: Dear user, your payout request of ₹${payout.amount} has been APPROVED and will be processed within 24 hours.`);
          } else if (status === 'rejected') {
            console.log(`📧 NOTIFICATION: Dear user, your payout request of ₹${payout.amount} has been REJECTED. Reason: ${reason}`);
          }
          
          return payout as PayoutRequest;
        }
        
        // For any other payout ID, create a new simulated payout
        return {
          id: id,
          userId: 'dev-demo-user',
          amount: '500.00',
          status: status,
          requestedAt: new Date(),
          processedAt: new Date(),
          reason: reason || null
        } as PayoutRequest;
      }
      throw error;
    }
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

  // Task operations  
  async getTasks(limit = 50): Promise<Task[]> {
    try {
      return await db
        .select()
        .from(tasks)
        .where(eq(tasks.isActive, true))
        .orderBy(desc(tasks.createdAt))
        .limit(limit);
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Using sample tasks (database unavailable)");
        return this.getSampleTasks();
      }
      console.error("Database error fetching tasks:", error);
      throw new Error("Database connection required. Please enable the database endpoint in your Neon dashboard.");
    }
  }
  
  private getSampleTasks(): Task[] {
    return [
      {
        id: 'dev-task-1',
        title: 'Download Instagram & Rate 5 Stars',
        description: 'Download Instagram app from Google Play Store and give it a 5-star rating with a positive review.',
        category: 'app_download',
        reward: '25',
        timeLimit: 10,
        requirements: 'Must provide screenshot of download confirmation and rating submission.',
        verificationMethod: 'manual',
        maxCompletions: 100,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      },
      {
        id: 'dev-task-2',
        title: 'Write Business Review on Google Maps',
        description: 'Find "Innovative Grow Solutions" on Google Maps and write a detailed 5-star review about our services.',
        category: 'business_review',
        reward: '35',
        timeLimit: 15,
        requirements: 'Review must be at least 50 words and include specific details about our platform.',
        verificationMethod: 'manual',
        maxCompletions: 50,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      },
      {
        id: 'dev-task-3',
        title: 'Subscribe to YouTube Channel',
        description: 'Subscribe to our official YouTube channel and like our latest video about earning opportunities.',
        category: 'channel_subscribe',
        reward: '20',
        timeLimit: 5,
        requirements: 'Must provide screenshot showing subscription confirmation and liked video.',
        verificationMethod: 'manual',
        maxCompletions: 75,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      },
      {
        id: 'dev-task-4',
        title: 'Like & Comment on Facebook Post',
        description: 'Like our Facebook page and comment on our latest post about task earning opportunities.',
        category: 'comment_like',
        reward: '15',
        timeLimit: 5,
        requirements: 'Comment must be genuine and positive. No spam or generic comments.',
        verificationMethod: 'manual',
        maxCompletions: 150,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      },
      {
        id: 'dev-task-5',
        title: 'Product Review - Smartphone Case',
        description: 'Write a detailed review for a smartphone case on Amazon with honest feedback.',
        category: 'product_review',
        reward: '40',
        timeLimit: 20,
        requirements: 'Review must be based on actual product experience and include photos.',
        verificationMethod: 'manual',
        maxCompletions: 75,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      }
    ] as Task[];
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      const [newTask] = await db.insert(tasks).values(task).returning();
      return newTask;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Task creation simulated (database unavailable)");
        const newTask: Task = {
          id: `dev-task-${Date.now()}`,
          ...task,
          currentCompletions: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return newTask;
      }
      throw error;
    }
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const result = await db.delete(tasks).where(eq(tasks.id, id));
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Task deletion simulated (database unavailable)");
        return true; // Simulate successful deletion
      }
      throw error;
    }
  }

  // Task completion operations
  async getUserTaskCompletions(userId: string): Promise<TaskCompletion[]> {
    try {
      return await db
        .select()
        .from(taskCompletions)
        .where(eq(taskCompletions.userId, userId))
        .orderBy(desc(taskCompletions.submittedAt));
    } catch (error) {
      console.log("Database disabled, returning sample completions");
      // Return sample completions for demo
      return [] as TaskCompletion[];
    }
  }

  async getTaskCompletion(userId: string, taskId: string): Promise<TaskCompletion | undefined> {
    const [completion] = await db
      .select()
      .from(taskCompletions)
      .where(and(
        eq(taskCompletions.userId, userId),
        eq(taskCompletions.taskId, taskId)
      ));
    return completion;
  }

  async createTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion> {
    try {
      const [newCompletion] = await db
        .insert(taskCompletions)
        .values(completion)
        .returning();
      return newCompletion;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Task completion simulated (database unavailable)");
        return {
          id: 'dev-completion-' + Date.now(),
          userId: completion.userId,
          taskId: completion.taskId,
          status: completion.status || 'submitted',
          proofData: completion.proofData || '',
          proofImages: completion.proofImages || [],
          submittedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          rejectionReason: null,
          rewardCredited: false
        } as TaskCompletion;
      }
      throw error;
    }
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    const [completion] = await db
      .update(taskCompletions)
      .set(updates)
      .where(eq(taskCompletions.id, id))
      .returning();
    return completion;
  }

  async approveTaskCompletion(id: string, reviewedBy: string): Promise<void> {
    const completion = await db.select().from(taskCompletions).where(eq(taskCompletions.id, id));
    if (!completion[0]) return;
    
    const task = await this.getTask(completion[0].taskId);
    if (!task) return;
    
    // Update completion status
    await this.updateTaskCompletion(id, {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy,
      rewardCredited: true
    });
    
    // Credit reward to user
    await this.createEarning({
      userId: completion[0].userId,
      taskId: task.id,
      type: 'task',
      amount: task.reward,
      description: `Task completed: ${task.title}`
    });
    
    // Update user balance
    const user = await this.getUser(completion[0].userId);
    if (user) {
      const currentBalance = parseFloat(user.balance || '0');
      const rewardAmount = parseFloat(task.reward);
      const newBalance = currentBalance + rewardAmount;
      
      await this.updateUser(user.id, { balance: newBalance.toFixed(2) });
    }
    
    // Increment task completions
    await db
      .update(tasks)
      .set({ currentCompletions: sql`${tasks.currentCompletions} + 1` })
      .where(eq(tasks.id, task.id));
  }

  async rejectTaskCompletion(id: string, reviewedBy: string, reason: string): Promise<void> {
    await this.updateTaskCompletion(id, {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy,
      rejectionReason: reason
    });
  }

  async getTaskCompletionsForReview(): Promise<TaskCompletion[]> {
    try {
      return await db
        .select()
        .from(taskCompletions)
        .where(eq(taskCompletions.status, 'submitted'))
        .orderBy(desc(taskCompletions.submittedAt));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Returning empty task completions (database unavailable)");
        return [];
      }
      throw error;
    }
  }


}

export const storage = new DatabaseStorage();
