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

// Memory stores for development mode
const devModeUsers: Map<string, User> = new Map();
const devModeTasks: Task[] = [];
const devModeTaskCompletions: TaskCompletion[] = [];

// Initialize with default test users
function initializeDevUsers() {
  if (devModeUsers.size === 0) {
    const testUsers = [
      {
        id: 'dev-user-1755205393601',
        email: 'suspended@test.com',
        firstName: 'Suspended',
        lastName: 'User',
        profileImageUrl: null,
        password: '$2b$12$.A2nPR2ouKe9Vh57IvncNucpnKgAgKftjabz0SpAJeQr.pjSBnrJ2', // "suspended123"
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
        kycFeePaid: false,
        kycFeePaymentId: null,
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
        kycFeePaid: false,
        kycFeePaymentId: null,
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
        kycFeePaid: true,
        kycFeePaymentId: 'kyc_priya_payment',
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
      {
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
        kycFeePaid: true,
        kycFeePaymentId: 'demo_payment_001',
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
      {
        id: 'dev-verified-user',
        email: 'john.doe@innovativetaskearn.online',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: null,
        password: '$2b$12$lRotmOLMbzqlHNiaf/Ia5OVGjaFNkUJ3TPK.H0fgTGARd0P.LNhDS', // password: john123
        phoneNumber: '9988776655',
        dateOfBirth: '1988-05-15',
        address: '456 Business Park',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560100',
        accountHolderName: 'John Doe',
        accountNumber: '9876543210',
        ifscCode: 'ICIC0001234',
        bankName: 'ICICI Bank',
        governmentIdType: 'aadhaar',
        governmentIdNumber: '987654321098',
        governmentIdUrl: 'john-aadhaar.jpg',
        govIdFrontUrl: 'john-aadhaar-front.jpg',
        govIdBackUrl: 'john-aadhaar-back.jpg',
        selfieWithIdUrl: 'john-selfie.jpg',
        verificationStatus: 'verified',
        kycStatus: 'approved',
        kycFeePaid: true,
        kycFeePaymentId: 'kyc_john_99_payment',
        kycSubmittedAt: new Date(Date.now() - 86400000), // Submitted 1 day ago
        kycApprovedAt: new Date(Date.now() - 43200000), // Approved 12 hours ago
        status: 'active',
        balance: '250.00',
        earningsToday: '25.00',
        totalEarnings: '250.00',
        referralCode: 'JOHN456',
        tasksCompleted: 8,
        createdAt: new Date(Date.now() - 604800000), // Created 7 days ago
        updatedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
        suspensionReason: null
      },
      {
        id: 'dev-suspended-alex',
        email: 'alex.kumar@innovativetaskearn.online',
        firstName: 'Alex',
        lastName: 'Kumar',
        profileImageUrl: null,
        password: '$2b$12$vrJTyyuUlPxOAC5YrOf1P.jmL0IUBZyp37X.q.CXx8W1AXXsWMm1C', // password: alex123
        phoneNumber: '9876543333',
        dateOfBirth: '1992-11-20',
        address: '789 Tech Hub',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500081',
        accountHolderName: 'Alex Kumar',
        accountNumber: '5555666677',
        ifscCode: 'HDFC0005678',
        bankName: 'HDFC Bank',
        governmentIdType: 'pan',
        governmentIdNumber: 'ABCDE1234F',
        governmentIdUrl: 'alex-pan.jpg',
        verificationStatus: 'verified',
        kycStatus: 'approved',
        kycFeePaid: true,
        kycFeePaymentId: 'kyc_alex_paid',
        status: 'suspended',
        balance: '150.00',
        earningsToday: '0.00',
        totalEarnings: '500.00',
        referralCode: 'ALEX789',
        tasksCompleted: 12,
        consecutiveFailedDays: 3,
        reactivationFeePaid: false,
        reactivationFeeAmount: '49.00',
        suspendedAt: new Date(Date.now() - 172800000), // Suspended 2 days ago
        suspensionReason: 'Failed to complete minimum daily tasks for 3 consecutive days',
        createdAt: new Date(Date.now() - 1209600000), // Created 14 days ago
        updatedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
        kycApprovedAt: new Date(Date.now() - 864000000) // KYC approved 10 days ago
      }
    ];
    
    testUsers.forEach(user => {
      devModeUsers.set(user.id, user as User);
    });
  }
}

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
  incrementTaskCompletion(taskId: string): Promise<void>;
  
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
        console.log(`Development mode: Looking up user by ID: ${id}`);
        
        // Initialize test users if not already done
        initializeDevUsers();
        
        // Get user from memory store
        const user = devModeUsers.get(id);
        if (user) {
          console.log(`✅ Found user in memory: ${user.firstName} ${user.lastName}`);
          return user;
        }
        
        console.log(`❌ User not found with ID: ${id}`);
        return undefined;
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
        console.log(`Development mode: Looking up user by email: ${email}`);
        
        // Initialize test users if not already done
        initializeDevUsers();
        
        // Search in memory store by email
        for (const user of devModeUsers.values()) {
          if (user.email === email) {
            console.log(`✅ Found user in memory: ${user.firstName} ${user.lastName}`);
            return user;
          }
        }
        
        console.log(`❌ User not found with email: ${email}`);
        return undefined;
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
        
        // Store the new user in memory for development mode
        initializeDevUsers();
        devModeUsers.set(devUser.id, devUser);
        console.log(`✅ New user created in development mode: ${devUser.email} (ID: ${devUser.id})`);
        console.log(`📊 Total users in memory: ${devModeUsers.size}`);
        
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
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: User verification update simulated (database unavailable) - Status: ${status}`);
        
        // Update the in-memory user verification status
        for (let user of devModeUsers.values()) {
          if (user.id === id) {
            user.verificationStatus = status;
            user.kycStatus = status === "verified" ? "approved" : status === "rejected" ? "rejected" : "pending";
            user.updatedAt = new Date();
            if (status === "verified") {
              user.kycApprovedAt = new Date();
            }
            console.log(`✅ Updated user ${id} verification status to ${status} in memory store`);
            return user;
          }
        }
        
        console.log(`❌ User ${id} not found in memory store`);
        return undefined;
      }
      throw error;
    }
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
        
        // Update the in-memory user status
        for (let user of devModeUsers.values()) {
          if (user.id === id) {
            user.status = status;
            user.updatedAt = new Date();
            if (status === 'suspended' && !user.suspensionReason) {
              user.suspensionReason = 'Account suspended by admin';
            } else if (status === 'active') {
              user.suspensionReason = null;
            }
            console.log(`✅ Updated user ${id} status to ${status} in memory store`);
            return user;
          }
        }
        
        console.log(`❌ User ${id} not found in memory store`);
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
        
        // Initialize test users if not already done
        initializeDevUsers();
        
        // Return all users from memory store (includes test users and newly created ones)
        const allUsers = Array.from(devModeUsers.values()).sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA; // Sort by newest first
        });
        
        console.log(`📊 Returning ${allUsers.length} users from memory store for admin panel`);
        return allUsers;
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

  // Admin methods for comprehensive data management
  async getAllEarnings(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { id: "1", userId: "dev-demo-user", amount: "25.00", taskId: "task-1", type: "task", createdAt: new Date().toISOString() },
        { id: "2", userId: "john-doe-001", amount: "15.00", taskId: "task-2", type: "task", createdAt: new Date().toISOString() }
      ];
    }

    try {
      return await db.select().from(earnings);
    } catch (error) {
      console.error("Error getting all earnings:", error);
      throw error;
    }
  }

  async getAllPayouts(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { id: "payout-1", userId: "dev-demo-user", amount: "500.00", status: "completed", createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: "payout-2", userId: "john-doe-001", amount: "200.00", status: "pending", createdAt: new Date().toISOString() }
      ];
    }

    try {
      return await db.select().from(payoutRequests);
    } catch (error) {
      console.error("Error getting all payouts:", error);
      throw error;
    }
  }

  async getAllTaskCompletions(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { id: "comp-1", userId: "dev-demo-user", taskId: "task-1", status: "approved", submittedAt: new Date().toISOString() },
        { id: "comp-2", userId: "john-doe-001", taskId: "task-2", status: "submitted", submittedAt: new Date().toISOString() }
      ];
    }

    try {
      return await db.select().from(taskCompletions);
    } catch (error) {
      console.error("Error getting all task completions:", error);
      throw error;
    }
  }

  async getUserEarnings(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { userId: "dev-demo-user", amount: "1250.00" },
        { userId: "john-doe-001", amount: "750.00" }
      ];
    }

    try {
      return [];
    } catch (error) {
      console.error("Error getting user earnings:", error);
      throw error;
    }
  }

  async getUserTaskCounts(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { userId: "dev-demo-user", count: 15 },
        { userId: "john-doe-001", count: 8 }
      ];
    }

    try {
      return [];
    } catch (error) {
      console.error("Error getting user task counts:", error);
      throw error;
    }
  }

  async getAllChatSessions(): Promise<any[]> {
    if (isDevelopment() && this.dbConnectionFailed) {
      return [
        { id: "chat-1", userId: "dev-demo-user", status: "active", createdAt: new Date().toISOString() },
        { id: "chat-2", userId: "john-doe-001", status: "closed", createdAt: new Date().toISOString() }
      ];
    }

    try {
      return await db.select().from(chatMessages);
    } catch (error) {
      console.error("Error getting all chat sessions:", error);
      throw error;
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
    try {
      return await db
        .select()
        .from(earnings)
        .where(eq(earnings.userId, userId))
        .orderBy(desc(earnings.createdAt));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Earnings simulated (database unavailable)");
        
        // Generate sample earnings history including bonuses and task completions
        const sampleEarnings: Earning[] = [
          {
            id: 'dev-earning-1',
            userId: userId,
            amount: '25.00',
            type: 'task_completion',
            description: '📱 App Download - Instagram Reels',
            createdAt: new Date(Date.now() - 86400000 * 1) // 1 day ago
          },
          {
            id: 'dev-earning-2',
            userId: userId,
            amount: '35.00',
            type: 'task_completion', 
            description: '⭐ Business Review - Local Restaurant',
            createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
          },
          {
            id: 'dev-earning-3',
            userId: userId,
            amount: '10.00',
            type: 'hourly_bonus',
            description: '🎁 Hourly Login Bonus',
            createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
          },
          {
            id: 'dev-earning-4',
            userId: userId,
            amount: '30.00',
            type: 'task_completion',
            description: '🛍️ Product Review - Electronics',
            createdAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
          },
          {
            id: 'dev-earning-5',
            userId: userId,
            amount: '49.00',
            type: 'referral_bonus',
            description: '👥 Referral Bonus - Friend joined',
            createdAt: new Date(Date.now() - 86400000 * 4) // 4 days ago
          },
          {
            id: 'dev-earning-6',
            userId: userId,
            amount: '20.00',
            type: 'task_completion',
            description: '📺 Channel Subscribe - YouTube',
            createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
          },
          {
            id: 'dev-earning-7',
            userId: userId,
            amount: '10.00',
            type: 'hourly_bonus',
            description: '🎁 Hourly Login Bonus',
            createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
          },
          {
            id: 'dev-earning-8',
            userId: userId,
            amount: '15.00',
            type: 'task_completion',
            description: '👍 Comments & Likes - Social Media',
            createdAt: new Date(Date.now() - 86400000 * 6) // 6 days ago
          },
          {
            id: 'dev-earning-9',
            userId: userId,
            amount: '49.00',
            type: 'referral_bonus',
            description: '👥 Referral Bonus - Priya Sharma joined',
            createdAt: new Date(Date.now() - 86400000 * 2) // 2 days ago
          },
          {
            id: 'dev-earning-10',
            userId: userId,
            amount: '49.00',
            type: 'referral_bonus',
            description: '👥 Referral Bonus - Rahul Patel joined',
            createdAt: new Date(Date.now() - 86400000 * 5) // 5 days ago
          },
          {
            id: 'dev-earning-11',
            userId: userId,
            amount: '1000.00',
            type: 'signup_bonus',
            description: '🎉 Welcome Signup Bonus',
            createdAt: new Date(Date.now() - 86400000 * 7) // 7 days ago
          }
        ];
        
        return sampleEarnings;
      }
      throw error;
    }
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
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Today's earnings simulated (database unavailable)");
        // Return sample today's earnings
        return 35.00;
      }
      throw error;
    }
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
    try {
      return await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, userId))
        .orderBy(desc(referrals.createdAt));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Basic referrals simulated (database unavailable)");
        
        const sampleReferrals: Referral[] = [
          {
            id: 'dev-referral-1',
            referrerId: userId,
            referredId: 'dev-referred-1',
            isEarningCredited: true,
            createdAt: new Date(Date.now() - 86400000 * 2)
          },
          {
            id: 'dev-referral-2',
            referrerId: userId,
            referredId: 'dev-referred-2',
            isEarningCredited: true,
            createdAt: new Date(Date.now() - 86400000 * 5)
          }
        ];
        
        return sampleReferrals;
      }
      throw error;
    }
  }

  async getReferralsWithUserDetails(userId: string): Promise<any[]> {
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Referrals simulated (database unavailable)");
        
        // Generate sample referrals data
        const sampleReferrals = [
          {
            id: 'dev-referral-1',
            isEarningCredited: true,
            createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
            referredUser: {
              id: 'dev-referred-1',
              firstName: 'Priya',
              lastName: 'Sharma',
              email: 'priya.sharma@example.com',
              verificationStatus: 'verified',
              kycStatus: 'approved'
            }
          },
          {
            id: 'dev-referral-2',
            isEarningCredited: true,
            createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
            referredUser: {
              id: 'dev-referred-2',
              firstName: 'Rahul',
              lastName: 'Patel',
              email: 'rahul.patel@example.com',
              verificationStatus: 'verified',
              kycStatus: 'approved'
            }
          },
          {
            id: 'dev-referral-3',
            isEarningCredited: false,
            createdAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
            referredUser: {
              id: 'dev-referred-3',
              firstName: 'Anjali',
              lastName: 'Singh',
              email: 'anjali.singh@example.com',
              verificationStatus: 'pending',
              kycStatus: 'pending'
            }
          }
        ];
        
        return sampleReferrals;
      }
      throw error;
    }
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
    try {
      await db
        .update(users)
        .set(kycData)
        .where(eq(users.id, userId));
    } catch (error) {
      // Handle development mode fallback
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Updating KYC documents for user ${userId}`);
        const user = devModeUsers.get(userId);
        if (user) {
          const updatedUser = {
            ...user,
            ...kycData,
            kycFeePaid: user.kycFeePaid || false // Preserve existing payment status
          };
          devModeUsers.set(userId, updatedUser);
          console.log(`✅ KYC documents updated in memory for user: ${user.firstName} ${user.lastName}`);
          console.log(`   Status: ${kycData.kycStatus}, Fee Paid: ${updatedUser.kycFeePaid}`);
          return;
        }
        throw new Error(`User not found: ${userId}`);
      }
      console.error("Error updating KYC documents:", error);
      throw error;
    }
  }

  async updateUserKycPayment(userId: string, paymentData: any): Promise<void> {
    try {
      await db
        .update(users)
        .set(paymentData)
        .where(eq(users.id, userId));
    } catch (error) {
      // Handle development mode fallback
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Updating KYC payment for user ${userId}`);
        const user = devModeUsers.get(userId);
        if (user) {
          const updatedUser = {
            ...user,
            ...paymentData
          };
          devModeUsers.set(userId, updatedUser);
          console.log(`✅ KYC payment updated in memory for user: ${user.firstName} ${user.lastName}`);
          console.log(`   Fee Paid: ${paymentData.kycFeePaid}, Status: ${paymentData.kycStatus}`);
          return;
        }
        throw new Error(`User not found: ${userId}`);
      }
      console.error("Error updating KYC payment:", error);
      throw error;
    }
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
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Payment history simulated (database unavailable)");
        return this.getSamplePaymentHistory();
      }
      console.error("Error fetching all payment history:", error);
      return [];
    }
  }

  private getSamplePaymentHistory(): any[] {
    return [
      {
        id: 'payment-kyc-001',
        userId: 'dev-demo-user',
        userEmail: 'demo@innovativetaskearn.online',
        userName: 'Demo User',
        type: 'kyc',
        amount: '99',
        orderId: 'order_O3KJR8nWvt1K2g',
        paymentMethod: 'UPI',
        status: 'completed',
        createdAt: new Date('2025-01-10T10:30:00Z')
      },
      {
        id: 'payment-kyc-002',
        userId: 'dev-user-17521421',
        userEmail: 'ruhi@example.com',
        userName: 'ruhi r',
        type: 'kyc',
        amount: '99',
        orderId: 'order_P4LKS9oXwu2L3h',
        paymentMethod: 'CARD',
        status: 'completed',
        createdAt: new Date('2025-01-12T14:15:00Z')
      },
      {
        id: 'payment-reactivation-001',
        userId: 'dev-alex-kumar',
        userEmail: 'alex.kumar@example.com',
        userName: 'Alex Kumar',
        type: 'reactivation',
        amount: '49',
        orderId: 'order_Q5MNT0pYxv3M4i',
        paymentMethod: 'WALLET',
        status: 'completed',
        createdAt: new Date('2025-01-14T16:45:00Z')
      },
      {
        id: 'payment-kyc-003',
        userId: 'dev-sara-123',
        userEmail: 'sara@example.com',
        userName: 'Sara Patel',
        type: 'kyc',
        amount: '99',
        orderId: 'order_R6OUV1qZyw4N5j',
        paymentMethod: 'UPI',
        status: 'pending',
        createdAt: new Date('2025-01-14T18:20:00Z')
      }
    ];
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
        reward: '15',
        timeLimit: 10,
        requirements: 'Must provide screenshot of download confirmation and rating submission.',
        verificationMethod: 'manual',
        taskLink: 'https://play.google.com/store/apps/details?id=com.instagram.android',
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
        reward: '30',
        timeLimit: 15,
        requirements: 'Review must be at least 50 words and include specific details about our platform.',
        verificationMethod: 'manual',
        taskLink: 'https://www.google.com/maps/search/Innovative+Grow+Solutions',
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
        reward: '15',
        timeLimit: 5,
        requirements: 'Must provide screenshot showing subscription confirmation and liked video.',
        verificationMethod: 'manual',
        taskLink: 'https://www.youtube.com/@InnovativeTaskEarn',
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
        reward: '10',
        timeLimit: 5,
        requirements: 'Comment must be genuine and positive. No spam or generic comments.',
        verificationMethod: 'manual',
        taskLink: 'https://www.facebook.com/InnovativeTaskEarn',
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
        reward: '25',
        timeLimit: 20,
        requirements: 'Review must be based on actual product experience and include photos.',
        verificationMethod: 'manual',
        taskLink: 'https://www.amazon.in/dp/B0XXXXXXXX',
        maxCompletions: 75,
        currentCompletions: 0,
        isActive: true,
        createdBy: 'dev-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiryDate: null
      },
      {
        id: 'dev-task-6',
        title: 'Watch YouTube Video & Leave Comment',
        description: 'Watch our educational video about digital earning opportunities and leave a meaningful comment.',
        category: 'youtube_video_see',
        reward: '8',
        timeLimit: 15,
        requirements: 'Must watch at least 80% of video and comment with genuine feedback about the content.',
        verificationMethod: 'manual',
        taskLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        maxCompletions: 200,
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
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
      return task;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Looking up task with ID: ${id}`);
        
        // Sample task data for development - 30 tasks across 6 categories
        const sampleTasks = [
          // App Download Tasks (5)
          { id: "dev-task-1", title: "Download Instagram and Create Account", description: "Download the Instagram app from the Play Store/App Store and create a new account with valid details. Complete profile setup.", category: "app_download", reward: "15", timeLimit: 15, maxCompletions: 100, currentCompletions: 12, requirements: "Android/iOS device, Valid email", taskLink: "https://play.google.com/store/apps/details?id=com.instagram.android", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-2", title: "Install WhatsApp Business", description: "Download WhatsApp Business app and set up business profile with complete information.", category: "app_download", reward: "20", timeLimit: 10, maxCompletions: 80, currentCompletions: 8, requirements: "Mobile number, Business details", taskLink: "https://play.google.com/store/apps/details?id=com.whatsapp.w4b", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-3", title: "Download Paytm and Complete KYC", description: "Install Paytm app, register with mobile number and complete KYC verification process.", category: "app_download", reward: "25", timeLimit: 20, maxCompletions: 60, currentCompletions: 15, requirements: "Aadhaar card, Bank account", taskLink: "https://play.google.com/store/apps/details?id=net.one97.paytm", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-4", title: "Install Spotify and Create Playlist", description: "Download Spotify app, create account and make your first playlist with at least 10 songs.", category: "app_download", reward: "12", timeLimit: 15, maxCompletions: 120, currentCompletions: 22, requirements: "Email address", taskLink: "https://play.google.com/store/apps/details?id=com.spotify.music", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-5", title: "Download Zomato and Place First Order", description: "Install Zomato food delivery app and place your first order (minimum ₹200).", category: "app_download", reward: "18", timeLimit: 25, maxCompletions: 50, currentCompletions: 6, requirements: "Delivery address, Payment method", taskLink: "https://play.google.com/store/apps/details?id=com.application.zomato", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          
          // Business Review Tasks (5)
          { id: "dev-task-6", title: "Review Local Restaurant on Google", description: "Write a detailed review for a restaurant you have visited recently. Include food quality, service and ambiance.", category: "business_review", reward: "22", timeLimit: 10, maxCompletions: 90, currentCompletions: 18, requirements: "Google account, Recent visit", taskLink: "https://www.google.com/maps", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-7", title: "Rate Local Salon/Spa Service", description: "Leave a genuine review for a salon or spa service you used. Mention specific services and staff behavior.", category: "business_review", reward: "28", timeLimit: 12, maxCompletions: 70, currentCompletions: 9, requirements: "Service experience, Google/Zomato account", taskLink: "https://www.google.com/maps", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-8", title: "Review Online Shopping Experience", description: "Write detailed review about your recent online shopping experience including delivery and product quality.", category: "business_review", reward: "25", timeLimit: 15, maxCompletions: 85, currentCompletions: 14, requirements: "Recent purchase, Order details", taskLink: "https://www.amazon.in", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-9", title: "Rate Local Gym/Fitness Center", description: "Provide honest review of local gym including equipment quality, cleanliness and staff helpfulness.", category: "business_review", reward: "30", timeLimit: 10, maxCompletions: 40, currentCompletions: 5, requirements: "Gym membership, Personal experience", taskLink: "https://www.google.com/maps", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-10", title: "Review Educational Institute", description: "Share experience about coaching center or educational institute you attended. Help others make informed decisions.", category: "business_review", reward: "35", timeLimit: 18, maxCompletions: 30, currentCompletions: 3, requirements: "Student experience, Course details", taskLink: "https://www.google.com/maps", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          
          // Product Review Tasks (5)
          { id: "dev-task-11", title: "Review Smartphone on Amazon", description: "Write comprehensive review of smartphone you own including battery life, camera quality and performance.", category: "product_review", reward: "24", timeLimit: 20, maxCompletions: 75, currentCompletions: 11, requirements: "Product ownership, Amazon account", taskLink: "https://www.amazon.in/dp/product", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-12", title: "Review Kitchen Appliance", description: "Share detailed review of kitchen appliance you use regularly. Include pros, cons and value for money.", category: "product_review", reward: "28", timeLimit: 15, maxCompletions: 60, currentCompletions: 7, requirements: "Product usage experience", taskLink: "https://www.flipkart.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-13", title: "Review Fashion/Clothing Item", description: "Write honest review about clothing or fashion item you purchased including fit, quality and comfort.", category: "product_review", reward: "20", timeLimit: 12, maxCompletions: 100, currentCompletions: 16, requirements: "Recent purchase, Product photos", taskLink: "https://www.myntra.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-14", title: "Review Electronic Gadget", description: "Provide detailed review of electronic gadget like headphones, smartwatch or laptop you own.", category: "product_review", reward: "32", timeLimit: 25, maxCompletions: 45, currentCompletions: 4, requirements: "Gadget ownership, Technical knowledge", taskLink: "https://www.amazon.in", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-15", title: "Review Health/Fitness Product", description: "Share experience with health or fitness product like protein powder, supplements or exercise equipment.", category: "product_review", reward: "40", timeLimit: 20, maxCompletions: 25, currentCompletions: 2, requirements: "Product usage, Results achieved", taskLink: "https://www.healthkart.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          
          // Channel Subscribe Tasks (5)
          { id: "dev-task-16", title: "Subscribe to Tech YouTube Channel", description: "Subscribe to recommended tech YouTube channel and watch latest 3 videos completely.", category: "channel_subscribe", reward: "15", timeLimit: 20, maxCompletions: 150, currentCompletions: 28, requirements: "YouTube account", taskLink: "https://www.youtube.com/channel/tech", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-17", title: "Follow Instagram Business Page", description: "Follow business Instagram page and engage with last 5 posts by liking and commenting.", category: "channel_subscribe", reward: "12", timeLimit: 10, maxCompletions: 200, currentCompletions: 45, requirements: "Instagram account", taskLink: "https://www.instagram.com/business", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-18", title: "Subscribe to Educational Channel", description: "Subscribe to educational YouTube channel and complete watching one full tutorial video.", category: "channel_subscribe", reward: "18", timeLimit: 30, maxCompletions: 100, currentCompletions: 19, requirements: "YouTube account, Learning interest", taskLink: "https://www.youtube.com/channel/education", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-19", title: "Follow LinkedIn Company Page", description: "Follow company page on LinkedIn and engage with their last 3 professional posts.", category: "channel_subscribe", reward: "20", timeLimit: 15, maxCompletions: 80, currentCompletions: 12, requirements: "LinkedIn profile", taskLink: "https://www.linkedin.com/company/example", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-20", title: "Subscribe to News Channel", description: "Subscribe to news YouTube channel and watch today's news bulletin completely.", category: "channel_subscribe", reward: "14", timeLimit: 25, maxCompletions: 120, currentCompletions: 33, requirements: "YouTube account", taskLink: "https://www.youtube.com/channel/news", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          
          // Comment Like Tasks (5)
          { id: "dev-task-21", title: "Like and Comment on Facebook Posts", description: "Like and write meaningful comments on 10 different Facebook posts from your network.", category: "comment_like", reward: "10", timeLimit: 15, maxCompletions: 200, currentCompletions: 67, requirements: "Facebook account, Active network", taskLink: "https://www.facebook.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-22", title: "Engage with Instagram Content", description: "Like and comment on 15 Instagram posts from accounts you follow. Use genuine comments.", category: "comment_like", reward: "12", timeLimit: 12, maxCompletions: 180, currentCompletions: 52, requirements: "Instagram account, Following list", taskLink: "https://www.instagram.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-23", title: "React to LinkedIn Posts", description: "React and comment professionally on 8 LinkedIn posts in your feed. Add valuable insights.", category: "comment_like", reward: "15", timeLimit: 18, maxCompletions: 100, currentCompletions: 24, requirements: "LinkedIn profile, Professional network", taskLink: "https://www.linkedin.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-24", title: "Engage with YouTube Comments", description: "Like 20 helpful comments and reply to 5 comments on educational YouTube videos.", category: "comment_like", reward: "8", timeLimit: 20, maxCompletions: 250, currentCompletions: 89, requirements: "YouTube account", taskLink: "https://www.youtube.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-25", title: "Twitter Engagement Activity", description: "Like and retweet 20 tweets from accounts you follow. Add thoughtful replies to 5 tweets.", category: "comment_like", reward: "13", timeLimit: 15, maxCompletions: 150, currentCompletions: 41, requirements: "Twitter account, Following list", taskLink: "https://www.twitter.com", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          
          // YouTube Video View Tasks (5)
          { id: "dev-task-26", title: "Watch Technology Review Videos", description: "Watch 5 complete technology review videos and leave helpful comments on each.", category: "youtube_video_see", reward: "20", timeLimit: 45, maxCompletions: 100, currentCompletions: 31, requirements: "YouTube account, Tech interest", taskLink: "https://www.youtube.com/results?search_query=tech+review", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-27", title: "Complete Educational Playlist", description: "Watch complete educational playlist (minimum 10 videos) and take notes on key points.", category: "youtube_video_see", reward: "30", timeLimit: 60, maxCompletions: 50, currentCompletions: 8, requirements: "YouTube account, Notebook", taskLink: "https://www.youtube.com/playlist?list=education", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-28", title: "Watch Cooking Tutorial Videos", description: "Watch 3 complete cooking tutorial videos and try making one recipe at home.", category: "youtube_video_see", reward: "25", timeLimit: 50, maxCompletions: 70, currentCompletions: 15, requirements: "YouTube account, Kitchen access", taskLink: "https://www.youtube.com/results?search_query=cooking+tutorial", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-29", title: "View Business Motivation Videos", description: "Watch 4 business motivation videos completely and write key takeaways from each.", category: "youtube_video_see", reward: "18", timeLimit: 40, maxCompletions: 90, currentCompletions: 22, requirements: "YouTube account, Business interest", taskLink: "https://www.youtube.com/results?search_query=business+motivation", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() },
          { id: "dev-task-30", title: "Watch Fitness Workout Videos", description: "Watch 3 complete workout videos and perform exercises shown in at least one video.", category: "youtube_video_see", reward: "22", timeLimit: 35, maxCompletions: 80, currentCompletions: 18, requirements: "YouTube account, Exercise space", taskLink: "https://www.youtube.com/results?search_query=home+workout", isActive: true, verificationMethod: "manual", createdAt: new Date(), updatedAt: new Date() }
        ];
        
        const task = sampleTasks.find(t => t.id === id);
        if (task) {
          console.log(`✅ Found sample task: ${task.title}`);
          return task as Task;
        }
        
        console.log(`❌ Task not found with ID: ${id}`);
        return undefined;
      }
      throw error;
    }
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

  async incrementTaskCompletion(taskId: string): Promise<void> {
    try {
      await db
        .update(tasks)
        .set({ currentCompletions: sql`${tasks.currentCompletions} + 1` })
        .where(eq(tasks.id, taskId));
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Task completion count incremented for ${taskId}`);
        return;
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
    try {
      const [completion] = await db
        .select()
        .from(taskCompletions)
        .where(and(
          eq(taskCompletions.userId, userId),
          eq(taskCompletions.taskId, taskId)
        ));
      return completion;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Checking task completion for user ${userId}, task ${taskId}`);
        // Return undefined to allow new submissions in development
        return undefined;
      }
      throw error;
    }
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
        const newCompletion = {
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
        
        // Store in memory for development mode
        if (!globalThis.devTaskCompletions) {
          globalThis.devTaskCompletions = [];
        }
        globalThis.devTaskCompletions.push(newCompletion);
        
        console.log("✅ Development mode: Task completion created");
        console.log(`   ID: ${newCompletion.id}`);
        console.log(`   User: ${newCompletion.userId}`);
        console.log(`   Task: ${newCompletion.taskId}`);
        console.log(`   Status: ${newCompletion.status}`);
        
        return newCompletion;
      }
      throw error;
    }
  }

  async updateTaskCompletion(id: string, updates: Partial<TaskCompletion>): Promise<TaskCompletion | undefined> {
    try {
      const [completion] = await db
        .update(taskCompletions)
        .set(updates)
        .where(eq(taskCompletions.id, id))
        .returning();
      return completion;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Updating task completion ${id}`);
        // Return a simulated updated completion
        return {
          id,
          userId: 'dev-demo-user',
          taskId: 'task-1',
          status: updates.status || 'submitted',
          proofData: 'Test proof data',
          proofImages: [],
          submittedAt: new Date(),
          reviewedAt: updates.reviewedAt || null,
          reviewedBy: updates.reviewedBy || null,
          rejectionReason: updates.rejectionReason || null,
          rewardCredited: updates.rewardCredited || false
        } as TaskCompletion;
      }
      throw error;
    }
  }

  async approveTaskCompletion(id: string, reviewedBy: string): Promise<void> {
    try {
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
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Approving task completion ${id}`);
        
        // For development mode, we'll use hardcoded completion data for testing
        // Since we don't have a persistent store, we'll simulate the approval
        const completion = globalThis.devTaskCompletions?.find(tc => tc.id === id) || {
          id,
          userId: 'dev-demo-user',
          taskId: 'task-1',
          status: 'submitted'
        };
        
        // Update completion status in memory if it exists
        if (globalThis.devTaskCompletions) {
          const index = globalThis.devTaskCompletions.findIndex(tc => tc.id === id);
          if (index !== -1) {
            globalThis.devTaskCompletions[index] = {
              ...globalThis.devTaskCompletions[index],
              status: 'approved',
              reviewedAt: new Date(),
              reviewedBy,
              rewardCredited: true
            };
          }
        }
        
        // Find task details - use first task for development testing
        const task = devModeTasks.find(t => t.id === (completion.taskId || 'task-1')) || devModeTasks[0];
        if (!task) {
          console.log("❌ No tasks available in development mode");
          return;
        }
        
        // Find and update user balance
        const user = devModeUsers.get(completion.userId);
        if (user) {
          const currentBalance = parseFloat(user.balance || '0');
          const rewardAmount = parseFloat(task.reward);
          const newBalance = currentBalance + rewardAmount;
          
          // Update user balance in memory
          const updatedUser = { ...user, balance: newBalance.toFixed(2) };
          devModeUsers.set(user.id, updatedUser);
          
          console.log(`✅ Task approved in development mode:`);
          console.log(`   User: ${user.firstName} ${user.lastName}`);
          console.log(`   Task: ${task.title}`);
          console.log(`   Reward: ₹${task.reward}`);
          console.log(`   Previous Balance: ₹${currentBalance}`);
          console.log(`   New Balance: ₹${newBalance}`);
        }
        return;
      }
      throw error;
    }
  }

  async rejectTaskCompletion(id: string, reviewedBy: string, reason: string): Promise<void> {
    try {
      await this.updateTaskCompletion(id, {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedBy,
        rejectionReason: reason
      });
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Rejecting task completion ${id}`);
        console.log(`   Reviewed by: ${reviewedBy}`);
        console.log(`   Reason: ${reason}`);
        return;
      }
      throw error;
    }
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
        console.log("Development mode: Returning task completions from memory");
        // Return task completions from memory
        if (globalThis.devTaskCompletions) {
          return globalThis.devTaskCompletions.filter(tc => tc.status === 'submitted');
        }
        return [];
      }
      throw error;
    }
  }

  // Advertiser Inquiry operations
  async createAdvertiserInquiry(inquiry: any): Promise<any> {
    try {
      const [newInquiry] = await db.insert(advertiserInquiries).values(inquiry).returning();
      return newInquiry;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Advertiser inquiry simulated (database unavailable)");
        return {
          id: `dev-advertiser-inquiry-${Date.now()}`,
          ...inquiry,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      throw error;
    }
  }

  async getAdvertiserInquiries(limit = 50): Promise<any[]> {
    try {
      return await db
        .select()
        .from(advertiserInquiries)
        .orderBy(desc(advertiserInquiries.createdAt))
        .limit(limit);
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Advertiser inquiries simulated (database unavailable)");
        return [
          {
            id: 'dev-advertiser-inquiry-1',
            companyName: 'TechCorp Solutions',
            contactPerson: 'John Smith',
            email: 'john@techcorp.com',
            phone: '+91 9876543210',
            website: 'https://techcorp.com',
            industry: 'Technology & Software',
            campaignBudget: '₹1,00,000 - ₹5,00,000',
            taskTypes: ['app_downloads', 'product_reviews'],
            campaignObjective: 'Increase app downloads and gather authentic user reviews for our new mobile application.',
            targetAudience: 'Young professionals aged 22-35 interested in productivity apps.',
            campaignDuration: '2-months',
            additionalRequirements: 'Need users with Android devices primarily.',
            status: 'pending',
            assignedTo: null,
            notes: null,
            createdAt: new Date(Date.now() - 86400000 * 2),
            updatedAt: new Date(Date.now() - 86400000 * 2)
          }
        ];
      }
      throw error;
    }
  }

  // Contact Inquiry operations
  async createContactInquiry(inquiry: any): Promise<any> {
    try {
      const [newInquiry] = await db.insert(contactInquiries).values(inquiry).returning();
      return newInquiry;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Contact inquiry simulated (database unavailable)");
        return {
          id: `dev-contact-inquiry-${Date.now()}`,
          ...inquiry,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      throw error;
    }
  }

  async getContactInquiries(limit = 50): Promise<any[]> {
    try {
      return await db
        .select()
        .from(contactInquiries)
        .orderBy(desc(contactInquiries.createdAt))
        .limit(limit);
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log("Development mode: Contact inquiries simulated (database unavailable)");
        return [
          {
            id: 'dev-contact-inquiry-1',
            name: 'Rahul Kumar',
            email: 'rahul@example.com',
            phone: '+91 9876543210',
            subject: 'Payment Issue',
            message: 'I completed KYC payment but status is still pending. Please help resolve this issue.',
            inquiryType: 'support',
            status: 'pending',
            assignedTo: null,
            adminResponse: null,
            responseDate: null,
            createdAt: new Date(Date.now() - 86400000 * 1),
            updatedAt: new Date(Date.now() - 86400000 * 1)
          }
        ];
      }
      throw error;
    }
  }

  async updateContactInquiry(id: string, updates: any): Promise<any> {
    try {
      const [updated] = await db
        .update(contactInquiries)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(contactInquiries.id, id))
        .returning();
      return updated;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Contact inquiry ${id} update simulated`);
        return { id, ...updates, updatedAt: new Date() };
      }
      throw error;
    }
  }

  async updateAdvertiserInquiry(id: string, updates: any): Promise<any> {
    try {
      const [updated] = await db
        .update(advertiserInquiries)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(advertiserInquiries.id, id))
        .returning();
      return updated;
    } catch (error) {
      if (isDevelopment() && config.database.fallbackEnabled) {
        console.log(`Development mode: Advertiser inquiry ${id} update simulated`);
        return { id, ...updates, updatedAt: new Date() };
      }
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
