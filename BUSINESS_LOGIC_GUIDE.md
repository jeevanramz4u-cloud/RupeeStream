# EarnPay Business Logic Implementation Guide

## Core Business Rules and Implementation

### 1. Earnings System

#### Video Completion Earnings
```typescript
// Business Rules:
// - User must watch 95% of video to earn money
// - Each video can only be completed once per user
// - Earnings range: ₹5-15 per video based on duration and category
// - No skipping allowed - progress must be sequential

interface VideoEarningsRule {
  minDuration: number; // seconds
  maxDuration: number; // seconds
  earningsPerSecond: number;
  category: string;
}

const EARNINGS_RULES: VideoEarningsRule[] = [
  { minDuration: 30, maxDuration: 120, earningsPerSecond: 0.05, category: 'short' },
  { minDuration: 121, maxDuration: 300, earningsPerSecond: 0.04, category: 'medium' },
  { minDuration: 301, maxDuration: 600, earningsPerSecond: 0.03, category: 'long' },
  { minDuration: 601, maxDuration: 1800, earningsPerSecond: 0.025, category: 'extended' },
];

function calculateVideoEarnings(duration: number): number {
  const rule = EARNINGS_RULES.find(r => duration >= r.minDuration && duration <= r.maxDuration);
  if (!rule) return 5; // Default minimum
  
  const earnings = duration * rule.earningsPerSecond;
  return Math.min(Math.max(earnings, 5), 15); // Cap between ₹5-15
}

async function completeVideo(userId: number, videoId: number) {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  const [progress] = await db.select().from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), eq(videoProgress.videoId, videoId)));
  
  // Validation checks
  if (!video || !progress) throw new Error('Video or progress not found');
  if (progress.completed) throw new Error('Video already completed');
  
  // Check minimum watch time (95% completion)
  const requiredWatchTime = video.duration * 0.95;
  if (progress.watchTime < requiredWatchTime) {
    throw new Error('Minimum watch time not met');
  }
  
  // Calculate earnings
  const earnings = video.earningsPerView || calculateVideoEarnings(video.duration);
  
  await db.transaction(async (tx) => {
    // Mark video as completed
    await tx.update(videoProgress)
      .set({
        completed: true,
        completedAt: new Date(),
        earningsCredited: earnings,
      })
      .where(and(eq(videoProgress.userId, userId), eq(videoProgress.videoId, videoId)));
    
    // Credit user balance
    await tx.update(users)
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
      description: `Completed video: ${video.title}`,
    });
  });
  
  return { earnings, message: 'Video completed successfully' };
}
```

#### Daily Login Bonus
```typescript
// Business Rules:
// - ₹10 bonus for first login each day
// - Only one bonus per 24-hour period
// - Bonus credited automatically on login

async function creditLoginBonus(userId: number): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if bonus already credited today
  const existingBonus = await db.select()
    .from(earnings)
    .where(and(
      eq(earnings.userId, userId),
      eq(earnings.type, 'login_bonus'),
      gte(earnings.createdAt, today),
      lt(earnings.createdAt, tomorrow)
    ));
  
  if (existingBonus.length > 0) {
    return false; // Already credited today
  }
  
  const DAILY_LOGIN_BONUS = 10;
  
  await db.transaction(async (tx) => {
    // Credit user balance
    await tx.update(users)
      .set({
        balance: sql`balance + ${DAILY_LOGIN_BONUS}`,
        totalEarnings: sql`total_earnings + ${DAILY_LOGIN_BONUS}`,
      })
      .where(eq(users.id, userId));
    
    // Record earnings
    await tx.insert(earnings).values({
      userId,
      amount: DAILY_LOGIN_BONUS,
      type: 'login_bonus',
      description: 'Daily login bonus',
    });
  });
  
  return true;
}
```

### 2. Daily Watch Time System

#### Watch Time Tracking
```typescript
// Business Rules:
// - KYC-approved users must watch 8 hours daily
// - Consecutive failures for 3 days = suspension
// - Only completed videos count toward daily target
// - Progress resets at midnight

async function updateWatchProgress(userId: number, videoId: number, newWatchTime: number) {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  if (!video) throw new Error('Video not found');
  
  // Validate watch time progression (anti-skip protection)
  const [currentProgress] = await db.select().from(videoProgress)
    .where(and(eq(videoProgress.userId, userId), eq(videoProgress.videoId, videoId)));
  
  if (currentProgress && newWatchTime < currentProgress.watchTime) {
    throw new Error('Cannot decrease watch time - skipping detected');
  }
  
  // Limit watch time to video duration + 10% buffer
  const maxAllowedTime = video.duration * 1.1;
  const validatedWatchTime = Math.min(newWatchTime, maxAllowedTime);
  
  await db.insert(videoProgress)
    .values({
      userId,
      videoId,
      watchTime: validatedWatchTime,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [videoProgress.userId, videoProgress.videoId],
      set: {
        watchTime: validatedWatchTime,
        updatedAt: new Date(),
      },
    });
  
  // Check for completion
  if (validatedWatchTime >= video.duration * 0.95 && !currentProgress?.completed) {
    await completeVideo(userId, videoId);
  }
  
  return { watchTime: validatedWatchTime };
}

async function getDailyWatchTime(userId: number, date?: Date): Promise<number> {
  const targetDate = date || new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  // Sum watch time for completed videos only
  const result = await db
    .select({ totalTime: sql<number>`COALESCE(SUM(watch_time), 0)` })
    .from(videoProgress)
    .where(and(
      eq(videoProgress.userId, userId),
      eq(videoProgress.completed, true),
      gte(videoProgress.completedAt, startOfDay),
      lte(videoProgress.completedAt, endOfDay)
    ));
  
  return result[0]?.totalTime || 0;
}
```

#### Suspension System
```typescript
// Business Rules:
// - Monitor daily watch time for KYC-approved users
// - Suspend after 3 consecutive days of <8 hours
// - ₹49 reactivation fee required
// - Suspended users redirected to /suspended page

interface DailyWatchCheck {
  userId: number;
  date: Date;
  watchTime: number;
  targetMet: boolean;
}

async function performDailyWatchTimeCheck(): Promise<void> {
  console.log('Starting daily watch time check...');
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get all KYC-approved active users
  const activeUsers = await db.select()
    .from(users)
    .where(and(
      eq(users.kycStatus, 'approved'),
      eq(users.status, 'active')
    ));
  
  const DAILY_TARGET_SECONDS = 8 * 60 * 60; // 8 hours
  
  for (const user of activeUsers) {
    const dailyWatchTime = await getDailyWatchTime(user.id, yesterday);
    const targetMet = dailyWatchTime >= DAILY_TARGET_SECONDS;
    
    if (!targetMet) {
      await handleMissedDailyTarget(user.id);
    } else {
      await resetConsecutiveMissedDays(user.id);
    }
  }
  
  console.log(`Daily watch time check completed for ${activeUsers.length} users`);
}

async function handleMissedDailyTarget(userId: number): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const missedDays = (user.consecutiveMissedDays || 0) + 1;
  
  if (missedDays >= 3) {
    // Suspend user
    await db.update(users)
      .set({
        status: 'suspended',
        suspensionReason: 'Failed to meet daily 8-hour watch time requirement for 3 consecutive days',
        suspendedAt: new Date(),
        consecutiveMissedDays: missedDays,
      })
      .where(eq(users.id, userId));
    
    console.log(`User ${userId} suspended for missing daily targets (${missedDays} days)`);
  } else {
    await db.update(users)
      .set({ consecutiveMissedDays: missedDays })
      .where(eq(users.id, userId));
    
    console.log(`User ${userId} missed daily target (${missedDays}/3 days)`);
  }
}

async function resetConsecutiveMissedDays(userId: number): Promise<void> {
  await db.update(users)
    .set({ consecutiveMissedDays: 0 })
    .where(eq(users.id, userId));
}
```

### 3. KYC System

#### KYC Process Flow
```typescript
// Business Rules:
// - ₹99 processing fee required
// - Document verification by admin
// - Required for payouts and to avoid suspension
// - One-time process per user

interface KYCDocuments {
  idProof: File;
  addressProof: File;
  bankStatement: File;
}

interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

async function submitKYC(
  userId: number, 
  documents: KYCDocuments, 
  bankDetails: BankDetails
): Promise<{ orderId: string; paymentSession: any }> {
  
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  // Validation
  if (user.kycStatus === 'approved') {
    throw new Error('KYC already approved');
  }
  
  if (user.kycStatus === 'submitted') {
    throw new Error('KYC already submitted and under review');
  }
  
  // Upload documents to cloud storage
  const documentUrls = await uploadKYCDocuments(documents, userId);
  
  // Create payment order for KYC fee
  const orderId = `KYC_${userId}_${Date.now()}`;
  const kycFee = 99;
  
  const cashfreeOrder = await createCashfreeOrder({
    orderId,
    orderAmount: kycFee,
    orderCurrency: 'INR',
    customerDetails: {
      customerId: userId.toString(),
      customerPhone: user.phone,
      customerEmail: user.email,
      customerName: `${user.firstName} ${user.lastName}`,
    },
    orderMeta: {
      paymentType: 'kyc_fee',
      userId: userId.toString(),
    },
  });
  
  // Store KYC submission (pending payment)
  await db.update(users)
    .set({
      kycDocuments: documentUrls,
      bankDetails,
      kycSubmittedAt: new Date(),
    })
    .where(eq(users.id, userId));
  
  return {
    orderId,
    paymentSession: cashfreeOrder.paymentSession,
  };
}

async function processKYCPayment(userId: number, transactionId: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Update KYC status to submitted
    await tx.update(users)
      .set({
        kycStatus: 'submitted',
        kycSubmittedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // Record payment transaction
    await tx.insert(paymentTransactions).values({
      userId,
      orderId: `KYC_${userId}_${Date.now()}`,
      amount: 99,
      status: 'completed',
      purpose: 'kyc_fee',
      gatewayTransactionId: transactionId,
    });
  });
}

async function approveKYC(adminId: number, userId: number, notes?: string): Promise<void> {
  await db.transaction(async (tx) => {
    // Update user KYC status
    await tx.update(users)
      .set({
        kycStatus: 'approved',
        kycApprovedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    // Credit referral bonus if applicable
    await creditReferralBonus(userId);
  });
}
```

### 4. Referral System

#### Referral Implementation
```typescript
// Business Rules:
// - ₹49 bonus when referred user completes KYC
// - Unique referral codes for each user
// - Cannot refer yourself
// - One-time bonus per referral

function generateReferralCode(username: string): string {
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${username.substring(0, 3).toUpperCase()}${randomString}`;
}

async function applyReferralCode(userId: number, referralCode: string): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  // Validation checks
  if (user.referredByCode) {
    throw new Error('User already has a referrer');
  }
  
  const [referrer] = await db.select().from(users)
    .where(eq(users.referralCode, referralCode));
  
  if (!referrer) {
    throw new Error('Invalid referral code');
  }
  
  if (referrer.id === userId) {
    throw new Error('Cannot refer yourself');
  }
  
  // Apply referral code
  await db.update(users)
    .set({ referredByCode: referralCode })
    .where(eq(users.id, userId));
}

async function creditReferralBonus(newUserId: number): Promise<void> {
  const [newUser] = await db.select().from(users).where(eq(users.id, newUserId));
  
  if (!newUser.referredByCode) return;
  
  const [referrer] = await db.select().from(users)
    .where(eq(users.referralCode, newUser.referredByCode));
  
  if (!referrer) return;
  
  // Check if bonus already credited
  const existingBonus = await db.select()
    .from(earnings)
    .where(and(
      eq(earnings.userId, referrer.id),
      eq(earnings.type, 'referral_bonus'),
      eq(earnings.description, `Referral bonus for user ${newUser.username}`)
    ));
  
  if (existingBonus.length > 0) return;
  
  const REFERRAL_BONUS = 49;
  
  await db.transaction(async (tx) => {
    // Credit referrer
    await tx.update(users)
      .set({
        balance: sql`balance + ${REFERRAL_BONUS}`,
        totalEarnings: sql`total_earnings + ${REFERRAL_BONUS}`,
      })
      .where(eq(users.id, referrer.id));
    
    // Record earnings
    await tx.insert(earnings).values({
      userId: referrer.id,
      amount: REFERRAL_BONUS,
      type: 'referral_bonus',
      description: `Referral bonus for user ${newUser.username}`,
    });
  });
}
```

### 5. Payout System

#### Payout Rules and Processing
```typescript
// Business Rules:
// - Minimum payout: ₹100
// - Weekly processing on Tuesdays
// - KYC verification required
// - Bank transfer only

interface PayoutRequest {
  amount: number;
  bankDetails: BankDetails;
  notes?: string;
}

async function requestPayout(userId: number, request: PayoutRequest): Promise<void> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  // Validation checks
  if (user.kycStatus !== 'approved') {
    throw new Error('KYC verification required for payouts');
  }
  
  if (user.status !== 'active') {
    throw new Error('Account must be active to request payouts');
  }
  
  if (request.amount < 100) {
    throw new Error('Minimum payout amount is ₹100');
  }
  
  if (user.balance < request.amount) {
    throw new Error('Insufficient balance');
  }
  
  // Check for pending payouts
  const pendingPayouts = await db.select()
    .from(payouts)
    .where(and(
      eq(payouts.userId, userId),
      eq(payouts.status, 'pending')
    ));
  
  if (pendingPayouts.length > 0) {
    throw new Error('Previous payout request is still pending');
  }
  
  await db.transaction(async (tx) => {
    // Deduct from user balance
    await tx.update(users)
      .set({ balance: sql`balance - ${request.amount}` })
      .where(eq(users.id, userId));
    
    // Create payout request
    await tx.insert(payouts).values({
      userId,
      amount: request.amount,
      bankDetails: request.bankDetails,
      status: 'pending',
      requestedAt: new Date(),
    });
  });
}

async function processWeeklyPayouts(): Promise<void> {
  const pendingPayouts = await db.select()
    .from(payouts)
    .where(eq(payouts.status, 'pending'))
    .orderBy(payouts.requestedAt);
  
  for (const payout of pendingPayouts) {
    try {
      // Process via bank transfer API (implementation depends on payment provider)
      const transactionId = await processBankTransfer(payout);
      
      await db.update(payouts)
        .set({
          status: 'completed',
          transactionId,
          processedAt: new Date(),
          completedAt: new Date(),
        })
        .where(eq(payouts.id, payout.id));
        
    } catch (error) {
      await db.update(payouts)
        .set({
          status: 'failed',
          adminNotes: error.message,
          processedAt: new Date(),
        })
        .where(eq(payouts.id, payout.id));
        
      // Refund user balance
      await db.update(users)
        .set({ balance: sql`balance + ${payout.amount}` })
        .where(eq(users.id, payout.userId));
    }
  }
}
```

### 6. Anti-Fraud Measures

#### Fraud Detection System
```typescript
// Business Rules:
// - Detect suspicious viewing patterns
// - IP address monitoring
// - User agent tracking
// - Time-based validation

interface FraudDetectionResult {
  isSuspicious: boolean;
  reasons: string[];
  riskScore: number;
}

async function detectFraudulentActivity(
  userId: number, 
  videoId: number, 
  watchData: any
): Promise<FraudDetectionResult> {
  
  const reasons: string[] = [];
  let riskScore = 0;
  
  // Check for rapid video completion
  const recentCompletions = await db.select()
    .from(videoProgress)
    .where(and(
      eq(videoProgress.userId, userId),
      eq(videoProgress.completed, true),
      gte(videoProgress.completedAt, sql`NOW() - INTERVAL '1 hour'`)
    ));
  
  if (recentCompletions.length > 10) {
    reasons.push('Unusually high video completion rate');
    riskScore += 30;
  }
  
  // Check for same IP multiple accounts
  const sameIpUsers = await db.select()
    .from(videoProgress)
    .where(and(
      eq(videoProgress.ipAddress, watchData.ipAddress),
      ne(videoProgress.userId, userId),
      gte(videoProgress.updatedAt, sql`NOW() - INTERVAL '24 hours'`)
    ));
  
  if (sameIpUsers.length > 3) {
    reasons.push('Multiple accounts from same IP');
    riskScore += 40;
  }
  
  // Check for consistent user agent
  const userAgentChanges = await db.select()
    .from(videoProgress)
    .where(and(
      eq(videoProgress.userId, userId),
      ne(videoProgress.userAgent, watchData.userAgent),
      gte(videoProgress.updatedAt, sql`NOW() - INTERVAL '7 days'`)
    ));
  
  if (userAgentChanges.length > 5) {
    reasons.push('Frequent user agent changes');
    riskScore += 20;
  }
  
  return {
    isSuspicious: riskScore > 50,
    reasons,
    riskScore,
  };
}
```

This comprehensive business logic guide provides the core rules and implementations that drive the EarnPay platform's functionality and ensure fair, secure operations.