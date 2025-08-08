# EarnPay Deployment Guide

## Prerequisites and Setup Instructions

### 1. Environment Setup

#### Required Services
1. **Database**: PostgreSQL (Neon, Supabase, or AWS RDS)
2. **Cloud Storage**: Google Cloud Storage or AWS S3
3. **Payment Gateway**: Cashfree account with API credentials
4. **Authentication**: Replit OIDC or implement custom auth
5. **Hosting**: Vercel, Netlify, Railway, or similar

#### Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=earnpay
DB_USER=your_username
DB_PASSWORD=your_password

# Authentication (if using Replit OIDC)
OIDC_CLIENT_ID=your_replit_client_id
OIDC_CLIENT_SECRET=your_replit_client_secret
OIDC_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Session Management
SESSION_SECRET=your_very_secure_random_string_min_32_chars
SESSION_MAX_AGE=604800000  # 7 days in milliseconds

# Cashfree Payment Gateway
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=SANDBOX  # or PRODUCTION

# Google Cloud Storage (or AWS S3)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_BUCKET_NAME=earnpay-storage
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json

# Application Settings
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend Environment Variables (prefix with VITE_)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_CASHFREE_ENV=SANDBOX
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### 2. Database Setup

#### PostgreSQL Schema Creation
```sql
-- Run this script to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  profile_image_url TEXT,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  referral_code VARCHAR(20) UNIQUE,
  referred_by_code VARCHAR(20),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected')),
  kyc_submitted_at TIMESTAMP,
  kyc_approved_at TIMESTAMP,
  kyc_documents JSONB,
  bank_details JSONB,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  suspension_reason TEXT,
  suspended_at TIMESTAMP,
  consecutive_missed_days INTEGER DEFAULT 0,
  last_login TIMESTAMP,
  last_activity TIMESTAMP,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL, -- in seconds
  earnings_per_view DECIMAL(5,2) NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Video Progress table
CREATE TABLE video_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  watch_time INTEGER DEFAULT 0, -- in seconds
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  earnings_credited DECIMAL(5,2) DEFAULT 0.00,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Earnings table
CREATE TABLE earnings (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES videos(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'video_watch', 'referral_bonus', 'login_bonus', 'admin_credit'
  description TEXT,
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payouts table
CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  bank_details JSONB,
  admin_notes TEXT,
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table (for express-session)
CREATE TABLE session (
  sid VARCHAR NOT NULL COLLATE "default",
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL,
  PRIMARY KEY (sid)
);

-- Payment Transactions table
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(100),
  gateway_transaction_id VARCHAR(255),
  gateway_response JSONB,
  purpose VARCHAR(100), -- 'kyc_fee', 'reactivation_fee'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_video_progress_user_id ON video_progress(user_id);
CREATE INDEX idx_video_progress_video_id ON video_progress(video_id);
CREATE INDEX idx_video_progress_completed ON video_progress(completed);
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_earnings_type ON earnings(type);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);
CREATE INDEX idx_payouts_user_id ON payouts(user_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_order_id ON payment_transactions(order_id);

-- Create admin user (update with your details)
INSERT INTO users (
  username, email, first_name, last_name, 
  is_admin, status, kyc_status
) VALUES (
  'admin', 'admin@yourdomain.com', 'Admin', 'User',
  TRUE, 'active', 'approved'
);
```

### 3. Package.json Configuration

#### Backend Package.json
```json
{
  "name": "earnpay-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server/index.ts",
    "build": "tsc",
    "start": "node dist/server/index.js",
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "drizzle-orm": "^0.28.6",
    "drizzle-zod": "^0.5.1",
    "@neondatabase/serverless": "^0.6.0",
    "express-session": "^1.17.3",
    "connect-pg-simple": "^9.0.1",
    "bcryptjs": "^2.4.3",
    "ws": "^8.14.2",
    "cashfree-pg": "^2.0.0",
    "@google-cloud/storage": "^7.1.0",
    "openid-client": "^5.4.3",
    "zod": "^3.22.2",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.5",
    "node-cron": "^3.0.2",
    "nodemailer": "^6.9.4",
    "rate-limiter-flexible": "^3.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/express-session": "^1.17.7",
    "@types/bcryptjs": "^2.4.2",
    "@types/ws": "^8.5.5",
    "@types/node": "^20.5.0",
    "@types/multer": "^1.4.7",
    "@types/node-cron": "^3.0.8",
    "@types/nodemailer": "^6.4.9",
    "typescript": "^5.1.6",
    "tsx": "^3.12.7",
    "drizzle-kit": "^0.19.13"
  }
}
```

#### Frontend Package.json
```json
{
  "name": "earnpay-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^4.32.6",
    "@hookform/resolvers": "^3.3.1",
    "react-hook-form": "^7.45.4",
    "wouter": "^2.12.1",
    "zod": "^3.22.2",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0",
    "recharts": "^2.8.0",
    "@uppy/core": "^3.6.0",
    "@uppy/dashboard": "^3.6.1",
    "@uppy/aws-s3": "^3.4.1",
    "@uppy/react": "^3.1.3",
    "framer-motion": "^10.16.4",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.3",
    "@radix-ui/react-accordion": "^1.1.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

### 4. Deployment Configurations

#### Docker Configuration
```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - CASHFREE_APP_ID=${CASHFREE_APP_ID}
      - CASHFREE_SECRET_KEY=${CASHFREE_SECRET_KEY}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=earnpay
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Vercel Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "SESSION_SECRET": "@session_secret",
    "CASHFREE_APP_ID": "@cashfree_app_id",
    "CASHFREE_SECRET_KEY": "@cashfree_secret_key"
  }
}
```

### 5. Cashfree Integration Setup

#### Getting Cashfree Credentials
1. Sign up at [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Complete business verification
3. Navigate to Developers > API Keys
4. Copy App ID and Secret Key
5. Set up webhooks for payment notifications

#### Webhook Configuration
```typescript
// Add to your routes
app.post('/api/webhooks/cashfree', express.raw({type: 'application/json'}), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  if (verifyCashfreeSignature(payload, signature)) {
    handlePaymentWebhook(JSON.parse(payload));
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

### 6. Security Configurations

#### Rate Limiting
```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // Number of requests
  duration: 1, // Per 1 second
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).send('Too Many Requests');
  }
});
```

#### CORS Configuration
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 7. Monitoring and Analytics

#### Health Check Endpoint
```typescript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.select().from(users).limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

### 8. Production Checklist

#### Before Deployment
- [ ] Set all environment variables
- [ ] Configure database with proper indexes
- [ ] Set up cloud storage buckets
- [ ] Configure Cashfree webhooks
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Set up monitoring and logging
- [ ] Configure backup systems
- [ ] Test payment flows in sandbox
- [ ] Verify email/SMS notifications

#### Security Checklist
- [ ] Enable HTTPS everywhere
- [ ] Set secure session cookies
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Enable CORS properly
- [ ] Set security headers
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement proper logging

This deployment guide provides everything needed to successfully launch the EarnPay platform in a production environment.