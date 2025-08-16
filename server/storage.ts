// Storage layer with memory fallback for development

import { User, Task, TaskCompletion, Earning } from '../shared/types';
import { hashPassword, generateReferralCode } from './utils/auth';
import { db } from './db';
import { users, tasks, taskCompletions, earnings } from '../database/schema';
import { eq } from 'drizzle-orm';

// Memory storage for development mode
class MemoryStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<string, Task> = new Map();
  private completions: Map<string, TaskCompletion> = new Map();
  private earnings: Map<string, Earning[]> = new Map();

  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {
    // Create test admin user
    const adminId = 'admin-001';
    const adminPassword = await hashPassword('admin123');
    
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@innovativetaskearn.online',
      firstName: 'Admin',
      lastName: 'User',
      phone: '9999999999',
      role: 'admin',
      status: 'active',
      balance: 0,
      referralCode: 'ADMIN001',
      kycStatus: 'verified',
      kycFeePaid: true,
      verificationStatus: 'verified',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);

    // Create test user
    const userId = 'user-001';
    const userPassword = await hashPassword('demo123');
    
    this.users.set(userId, {
      id: userId,
      email: 'demo@innovativetaskearn.online',
      firstName: 'Demo',
      lastName: 'User',
      phone: '8888888888',
      role: 'user',
      status: 'active',
      balance: 1250.50, // Includes ₹1000 signup bonus + earnings
      referralCode: 'DEMO001',
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    } as User);

    // Add signup bonus earning record for demo user
    this.earnings.set(userId, [
      {
        id: 'earn-signup-001',
        userId: userId,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date('2025-01-01'),
        status: 'approved'
      }
    ]);

    // Create sample tasks
    const taskCategories = [
      { id: 'task-001', title: 'Download Amazon App', category: 'app_download', reward: 15 },
      { id: 'task-002', title: 'Review Local Restaurant', category: 'business_review', reward: 20 },
      { id: 'task-003', title: 'Subscribe to Tech Channel', category: 'channel_subscribe', reward: 10 },
      { id: 'task-004', title: 'Review Product on Flipkart', category: 'product_review', reward: 25 },
      { id: 'task-005', title: 'Like and Comment on Post', category: 'comment_like', reward: 5 },
      { id: 'task-006', title: 'Watch Educational Video', category: 'youtube_video_see', reward: 8 }
    ];

    taskCategories.forEach(task => {
      this.tasks.set(task.id, {
        id: task.id,
        title: task.title,
        description: `Complete this ${task.category.replace('_', ' ')} task to earn ₹${task.reward}`,
        category: task.category as any,
        reward: task.reward,
        timeLimit: 20,
        requirements: ['Submit proof screenshot', 'Follow all guidelines'],
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });
  }

  // User methods
  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const id = `user-${Date.now()}`;
    const user: User = {
      id,
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone!,
      role: 'user',
      status: 'active',
      balance: 1000, // ₹1000 signup bonus
      referralCode: generateReferralCode(),
      kycStatus: 'pending',
      kycFeePaid: false,
      verificationStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData
    };
    this.users.set(id, user);
    
    // Add signup bonus earning record
    this.earnings.set(id, [
      {
        id: `earn-signup-${Date.now()}`,
        userId: id,
        type: 'signup_bonus',
        amount: 1000,
        description: 'Welcome Signup Bonus',
        createdAt: new Date(),
        status: 'approved'
      }
    ]);
    
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(t => t.isActive);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const id = `task-${Date.now()}`;
    const task: Task = {
      id,
      title: taskData.title!,
      description: taskData.description!,
      category: taskData.category!,
      reward: taskData.reward!,
      timeLimit: taskData.timeLimit!,
      requirements: taskData.requirements || [],
      isActive: true,
      createdBy: taskData.createdBy!,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    };
    this.tasks.set(id, task);
    return task;
  }

  // Task completion methods
  async createTaskCompletion(data: Partial<TaskCompletion>): Promise<TaskCompletion> {
    const id = `completion-${Date.now()}`;
    const completion: TaskCompletion = {
      id,
      taskId: data.taskId!,
      userId: data.userId!,
      status: 'pending',
      earnings: data.earnings!,
      submittedAt: new Date(),
      ...data
    };
    this.completions.set(id, completion);
    return completion;
  }

  async getTaskCompletionsByUser(userId: string): Promise<TaskCompletion[]> {
    return Array.from(this.completions.values()).filter(c => c.userId === userId);
  }

  // Earnings methods
  async addEarning(data: Partial<Earning>): Promise<Earning> {
    const earning: Earning = {
      id: `earning-${Date.now()}`,
      userId: data.userId!,
      amount: data.amount!,
      type: data.type!,
      description: data.description!,
      createdAt: new Date(),
      ...data
    };
    
    const userEarnings = this.earnings.get(data.userId!) || [];
    userEarnings.push(earning);
    this.earnings.set(data.userId!, userEarnings);
    
    // Update user balance
    const user = this.users.get(data.userId!);
    if (user) {
      user.balance += data.amount!;
      this.users.set(data.userId!, user);
    }
    
    return earning;
  }

  async getUserEarnings(userId: string): Promise<Earning[]> {
    return this.earnings.get(userId) || [];
  }
}

// Create storage instance based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const memoryStorage = new MemoryStorage();

export const storage = {
  // User operations
  async getUserByEmail(email: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserByEmail(email);
    }
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return user;
  },

  async getUserById(id: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserById(id);
    }
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  },

  async createUser(userData: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createUser(userData);
    }
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  async updateUser(id: string, updates: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.updateUser(id, updates);
    }
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  },

  // Task operations
  async getAllTasks(): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getAllTasks();
    }
    return db.select().from(tasks).where(eq(tasks.isActive, true));
  },

  async getTaskById(id: string): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.getTaskById(id);
    }
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
    return task;
  },

  async createTask(taskData: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createTask(taskData);
    }
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  },

  // Task completion operations
  async createTaskCompletion(data: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.createTaskCompletion(data);
    }
    const [completion] = await db.insert(taskCompletions).values(data).returning();
    return completion;
  },

  async getTaskCompletionsByUser(userId: string): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getTaskCompletionsByUser(userId);
    }
    return db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId));
  },

  // Earnings operations
  async addEarning(data: any): Promise<any> {
    if (!db || isDevelopment) {
      return memoryStorage.addEarning(data);
    }
    const [earning] = await db.insert(earnings).values(data).returning();
    return earning;
  },

  async getUserEarnings(userId: string): Promise<any[]> {
    if (!db || isDevelopment) {
      return memoryStorage.getUserEarnings(userId);
    }
    return db.select().from(earnings).where(eq(earnings.userId, userId));
  }
};