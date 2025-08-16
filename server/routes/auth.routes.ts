import { Router } from 'express';
import { z } from 'zod';
import { db } from '../services/database';
import { users } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { 
  hashPassword, 
  verifyPassword, 
  generateReferralCode,
  generateOTP,
  isOTPValid,
  isValidEmail,
  isValidPhone
} from '../utils/auth';
import { rateLimit } from '../middleware/auth';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  referralCode: z.string().optional()
});

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6)
});

// Login endpoint
router.post('/login', rateLimit(5, 60000), async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended',
        requiresReactivation: true 
      });
    }

    // Check email verification
    if (!user.emailVerified) {
      // Generate and send OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db
        .update(users)
        .set({ 
          emailOtp: otp,
          otpExpiry: otpExpiry
        })
        .where(eq(users.id, user.id));

      return res.status(200).json({ 
        requiresVerification: true,
        email: user.email,
        message: 'Please verify your email with the OTP sent' 
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.role = user.role;

    // Return user data (excluding sensitive info)
    const { password: _, emailOtp: __, ...userData } = user;
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Signup endpoint
router.post('/signup', rateLimit(3, 60000), async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);

    // Check if email exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let codeExists = true;
    
    while (codeExists) {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);
      
      if (!existing) {
        codeExists = false;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Check referrer if provided
    let referrerId = null;
    if (data.referralCode) {
      const [referrer] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, data.referralCode))
        .limit(1);

      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        referralCode: referralCode,
        referredBy: referrerId,
        emailOtp: otp,
        otpExpiry: otpExpiry
      })
      .returning();

    res.json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      requiresVerification: true,
      email: newUser.email
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', rateLimit(5, 60000), async (req, res) => {
  try {
    const { email, otp } = verifyOTPSchema.parse(req.body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check OTP
    if (user.emailOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (!isOTPValid(user.otpExpiry)) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Update user as verified
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        emailOtp: null,
        otpExpiry: null
      })
      .where(eq(users.id, user.id));

    // Create session
    req.session.userId = user.id;
    req.session.role = user.role;

    // Check if referrer gets bonus
    if (user.referredBy) {
      // Add referral bonus logic here
    }

    const { password: _, emailOtp: __, ...userData } = user;
    
    res.json({
      success: true,
      message: 'Email verified successfully',
      user: { ...userData, emailVerified: true }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', rateLimit(3, 300000), async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db
      .update(users)
      .set({ 
        emailOtp: otp,
        otpExpiry: otpExpiry
      })
      .where(eq(users.id, user.id));

    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check authentication status
router.get('/check', async (req, res) => {
  if (!req.session?.userId) {
    return res.json({ user: null });
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (!user) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    const { password: _, emailOtp: __, ...userData } = user;
    res.json({ user: userData });
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ user: null });
  }
});

export default router;