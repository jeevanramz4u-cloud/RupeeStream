import bcrypt from 'bcryptjs';
import { adminUsers, type AdminUser, type AdminLogin } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from 'express';

// Extend session interface to include adminUser
declare module 'express-session' {
  interface SessionData {
    adminUser?: AdminUser;
  }
}

// Admin authentication middleware
export const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.adminUser) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

// Admin login function
export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    const [admin] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (!admin || !admin.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login time
    await db
      .update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, admin.id));

    return admin;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return null;
  }
}

// Admin logout function
export function logoutAdmin(req: any): void {
  if (req.session.adminUser) {
    delete req.session.adminUser;
  }
}