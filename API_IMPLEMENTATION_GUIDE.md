# EarnPay API Implementation Guide

## Complete API Reference with Code Examples

### 1. Authentication System

#### User Registration
```typescript
// POST /api/auth/signup
interface SignupRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  referralCode?: string;
}

// Implementation
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, referralCode } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate unique referral code
    const userReferralCode = generateReferralCode();
    
    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      referralCode: userReferralCode,
      referredByCode: referralCode || null,
    }).returning();
    
    // Create session
    req.session.userId = newUser.id;
    
    res.status(201).json({ user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});
```

#### User Login
```typescript
// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
    
    // Credit daily login bonus
    await creditLoginBonus(user.id);
    
    req.session.userId = user.id;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});
```

### 2. Video Management System

#### Get Available Videos
```typescript
// GET /api/videos
app.get('/api/videos', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Get videos with user progress
    const videosWithProgress = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
        earningsPerView: videos.earningsPerView,
        category: videos.category,
        completed: videoProgress.completed,
        watchTime: videoProgress.watchTime,
      })
      .from(videos)
      .leftJoin(videoProgress, and(
        eq(videoProgress.videoId, videos.id),
        eq(videoProgress.userId, userId)
      ))
      .where(eq(videos.status, 'active'));
    
    res.json({ videos: videosWithProgress });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch videos' });
  }
});
```

#### Update Video Progress
```typescript
// POST /api/videos/:id/progress
app.post('/api/videos/:id/progress', requireAuth, async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const userId = req.session.userId;
    const { watchTime } = req.body;
    
    // Get video details
    const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Update or create progress
    const [progress] = await db
      .insert(videoProgress)
      .values({
        userId,
        videoId,
        watchTime,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [videoProgress.userId, videoProgress.videoId],
        set: {
          watchTime,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Check if video is completed (watched 95% or more)
    const completionThreshold = video.duration * 0.95;
    if (watchTime >= completionThreshold && !progress.completed) {
      await completeVideo(userId, videoId, video.earningsPerView);
    }
    
    res.json({ progress });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress' });
  }
});
```

#### Complete Video and Credit Earnings
```typescript
async function completeVideo(userId: number, videoId: number, earnings: number) {
  await db.transaction(async (tx) => {
    // Mark video as completed
    await tx
      .update(videoProgress)
      .set({
        completed: true,
        completedAt: new Date(),
        earningsCredited: earnings,
      })
      .where(and(
        eq(videoProgress.userId, userId),
        eq(videoProgress.videoId, videoId)
      ));
    
    // Credit earnings to user
    await tx
      .update(users)
      .set({
        balance: sql`balance + ${earnings}`,
        totalEarnings: sql`total_earnings + ${earnings}`,
      })
      .where(eq(users.id, userId));
    
    // Record earnings transaction
    await tx.insert(earnings).values({
      userId,
      videoId,
      amount: earnings,
      type: 'video_watch',
      description: `Completed video ${videoId}`,
    });
  });
}
```

### 3. KYC System

#### Submit KYC Documents
```typescript
// POST /api/kyc/submit
app.post('/api/kyc/submit', requireAuth, upload.fields([
  { name: 'idProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.session.userId;
    const { bankDetails } = req.body;
    const files = req.files as any;
    
    // Upload files to cloud storage
    const documentUrls = await uploadKYCDocuments(files, userId);
    
    // Update user KYC status
    await db
      .update(users)
      .set({
        kycStatus: 'submitted',
        kycSubmittedAt: new Date(),
        bankDetails: JSON.parse(bankDetails),
        documentUrls,
      })
      .where(eq(users.id, userId));
    
    res.json({ message: 'KYC documents submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'KYC submission failed' });
  }
});
```

#### Process KYC Payment
```typescript
// POST /api/kyc/payment
app.post('/api/kyc/payment', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    
    // Create Cashfree order for KYC fee
    const orderResponse = await createCashfreeOrder({
      orderId: `KYC_${userId}_${Date.now()}`,
      orderAmount: 99,
      orderCurrency: 'INR',
      customerDetails: {
        customerId: userId.toString(),
        customerPhone: req.user.phone,
        customerEmail: req.user.email,
      },
      orderMeta: {
        paymentType: 'kyc_fee',
        userId: userId.toString(),
      },
    });
    
    res.json({ paymentSession: orderResponse.paymentSession });
  } catch (error) {
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});
```

### 4. Cashfree Payment Integration

#### Create Cashfree Order
```typescript
import { Cashfree } from 'cashfree-pg';

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_APP_ID;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = process.env.NODE_ENV === 'production' 
  ? Cashfree.Environment.PRODUCTION 
  : Cashfree.Environment.SANDBOX;

async function createCashfreeOrder(orderData: any) {
  try {
    const response = await Cashfree.PGCreateOrder("2023-08-01", orderData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create Cashfree order');
  }
}

// Verify payment
app.post('/api/payments/cashfree/verify', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
    const payment = response.data[0];
    
    if (payment.paymentStatus === 'SUCCESS') {
      // Handle successful payment based on order type
      const orderMeta = payment.orderMeta;
      
      if (orderMeta.paymentType === 'kyc_fee') {
        await processKYCPayment(orderMeta.userId);
      } else if (orderMeta.paymentType === 'reactivation_fee') {
        await processReactivationPayment(orderMeta.userId);
      }
      
      res.json({ status: 'success', payment });
    } else {
      res.json({ status: 'failed', payment });
    }
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed' });
  }
});
```

### 5. Referral System

#### Apply Referral Code
```typescript
// POST /api/referrals/apply-code
app.post('/api/referrals/apply-code', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { referralCode } = req.body;
    
    // Check if user already has a referrer
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user.referredByCode) {
      return res.status(400).json({ message: 'Referral code already applied' });
    }
    
    // Find referrer
    const [referrer] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    if (!referrer) {
      return res.status(404).json({ message: 'Invalid referral code' });
    }
    
    if (referrer.id === userId) {
      return res.status(400).json({ message: 'Cannot refer yourself' });
    }
    
    // Update user with referral code
    await db
      .update(users)
      .set({ referredByCode: referralCode })
      .where(eq(users.id, userId));
    
    res.json({ message: 'Referral code applied successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply referral code' });
  }
});
```

#### Credit Referral Bonus
```typescript
async function creditReferralBonus(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (user.referredByCode) {
    const [referrer] = await db.select().from(users)
      .where(eq(users.referralCode, user.referredByCode));
    
    if (referrer) {
      await db.transaction(async (tx) => {
        // Credit ₹49 to referrer
        await tx
          .update(users)
          .set({
            balance: sql`balance + 49`,
            totalEarnings: sql`total_earnings + 49`,
          })
          .where(eq(users.id, referrer.id));
        
        // Record earnings
        await tx.insert(earnings).values({
          userId: referrer.id,
          amount: 49,
          type: 'referral_bonus',
          description: `Referral bonus for user ${user.username}`,
        });
      });
    }
  }
}
```

### 6. Suspension System

#### Daily Watch Time Monitoring
```typescript
// Cron job to check daily watch times (runs at midnight)
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  console.log('Running daily watch time check...');
  await checkDailyWatchTimes();
});

async function checkDailyWatchTimes() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get KYC-completed users
  const kycUsers = await db.select().from(users)
    .where(and(
      eq(users.kycStatus, 'approved'),
      eq(users.status, 'active')
    ));
  
  for (const user of kycUsers) {
    // Calculate total watch time for yesterday
    const watchTime = await db
      .select({ totalTime: sql<number>`sum(watch_time)` })
      .from(videoProgress)
      .where(and(
        eq(videoProgress.userId, user.id),
        gte(videoProgress.updatedAt, yesterday),
        lt(videoProgress.updatedAt, today)
      ));
    
    const totalSeconds = watchTime[0]?.totalTime || 0;
    const totalHours = totalSeconds / 3600;
    
    if (totalHours < 8) {
      await handleMissedTarget(user.id);
    } else {
      await resetMissedDays(user.id);
    }
  }
}

async function handleMissedTarget(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const missedDays = (user.consecutiveMissedDays || 0) + 1;
  
  if (missedDays >= 3) {
    // Suspend user
    await db
      .update(users)
      .set({
        status: 'suspended',
        suspensionReason: 'Failed to meet daily watch time requirement for 3 consecutive days',
        suspendedAt: new Date(),
        consecutiveMissedDays: missedDays,
      })
      .where(eq(users.id, userId));
  } else {
    await db
      .update(users)
      .set({ consecutiveMissedDays: missedDays })
      .where(eq(users.id, userId));
  }
}
```

### 7. Payout System

#### Request Payout
```typescript
// POST /api/user/request-payout
app.post('/api/user/request-payout', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { amount, bankDetails } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    // Validation checks
    if (user.kycStatus !== 'approved') {
      return res.status(400).json({ message: 'KYC verification required' });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum payout amount is ₹100' });
    }
    
    await db.transaction(async (tx) => {
      // Deduct amount from user balance
      await tx
        .update(users)
        .set({ balance: sql`balance - ${amount}` })
        .where(eq(users.id, userId));
      
      // Create payout request
      await tx.insert(payouts).values({
        userId,
        amount,
        bankDetails,
        status: 'pending',
        requestedAt: new Date(),
      });
    });
    
    res.json({ message: 'Payout request submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Payout request failed' });
  }
});
```

### 8. Admin APIs

#### Get Users List
```typescript
// GET /api/admin/users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = db.select().from(users);
    
    if (search) {
      query = query.where(or(
        ilike(users.username, `%${search}%`),
        ilike(users.email, `%${search}%`)
      ));
    }
    
    if (status) {
      query = query.where(eq(users.status, status));
    }
    
    const usersData = await query
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
    
    res.json({ users: usersData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});
```

This comprehensive API guide provides all the necessary implementation details for recreating the EarnPay platform's backend functionality.