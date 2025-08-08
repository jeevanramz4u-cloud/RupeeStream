# EarnPay Frontend Implementation Guide

## Complete Frontend Architecture and Components

### 1. Project Setup and Configuration

#### Vite Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
```

#### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(221.2 83.2% 53.3%)',
        secondary: 'hsl(210 40% 98%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        muted: 'hsl(210 40% 96%)',
        'muted-foreground': 'hsl(215.4 16.3% 46.9%)',
        accent: 'hsl(210 40% 96%)',
        'accent-foreground': 'hsl(222.2 47.4% 11.2%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        'destructive-foreground': 'hsl(210 40% 98%)',
        border: 'hsl(214.3 31.8% 91.4%)',
        input: 'hsl(214.3 31.8% 91.4%)',
        ring: 'hsl(221.2 83.2% 53.3%)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s infinite',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

### 2. Core Hooks and Utilities

#### Authentication Hook
```typescript
// hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: number;
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected';
  status: 'active' | 'suspended';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/check');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    if (response.ok) {
      const userData = await response.json();
      setUser(userData.user);
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    setUser(null);
    window.location.href = '/';
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refetch: checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### Query Client Setup
```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export async function apiRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options);
}
```

### 3. Key Page Components

#### Landing Page
```typescript
// pages/landing.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Play, Clock, Coins, Users, Shield, CheckCircle, 
  Star, TrendingUp, Wallet, User, Mail, Phone 
} from 'lucide-react';
import { Link } from 'wouter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30">
      <Header />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 px-3 sm:px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            <Badge className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Star className="w-4 h-4" />
              India's #1 Video Earning Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight">
              Turn Your Free Time Into
              <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Real Income
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Watch videos, earn money instantly. Join 200,000+ users who are already 
              earning <span className="font-bold text-primary">₹500-2000 daily</span> with EarnPay.
            </p>

            {/* Earnings Preview */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-black text-green-700 block tracking-tight">₹15/Video</span>
                  <span className="text-gray-600 font-medium text-sm">Per Video</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="text-2xl font-black text-blue-700 block tracking-tight">₹10/Hour</span>
                  <span className="text-gray-600 font-medium text-sm">Login Bonus</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-2xl mx-auto">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 h-14 sm:h-16 text-lg font-semibold px-8 sm:px-12 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={() => window.location.href = '/signup'}
              >
                Start Earning Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 sm:h-16 text-lg border-2 border-gray-300 hover:bg-gray-50 hover:border-primary/50 px-8 sm:px-12 rounded-2xl transition-all duration-300"
                onClick={() => window.location.href = '/login'}
              >
                Already Have Account?
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto opacity-70">
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">100% Secure</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Verified Platform</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 hover:bg-white/80 transition-all duration-300">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">200K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
              Why Choose
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-black">
                EarnPay?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Experience the most trusted and rewarding platform for earning money through video engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-primary/20 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 lg:p-8 text-center">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-primary/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="text-primary w-8 h-8 lg:w-10 lg:h-10" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const features = [
  {
    icon: Play,
    title: "Easy Video Watching",
    description: "Watch entertaining videos and earn money instantly. No complex tasks or surveys required."
  },
  {
    icon: Shield,
    title: "100% Secure Platform",
    description: "Bank-grade security with encrypted transactions. Your data and earnings are completely safe."
  },
  {
    icon: TrendingUp,
    title: "Daily Earnings",
    description: "Earn ₹500-2000 daily by watching videos. Higher earnings with consistent activity."
  },
  {
    icon: Wallet,
    title: "Instant Withdrawals",
    description: "Withdraw your earnings weekly via UPI, bank transfer, or digital wallets."
  },
  {
    icon: Users,
    title: "Referral Program",
    description: "Earn ₹49 for every friend you refer. Build your network and increase passive income."
  },
  {
    icon: CheckCircle,
    title: "KYC Verified",
    description: "Simple one-time verification process ensures legitimate users and secure transactions."
  }
];
```

#### Dashboard Component
```typescript
// pages/dashboard.tsx
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { 
  Coins, Clock, Play, TrendingUp, Users, 
  Calendar, Target, Award 
} from 'lucide-react';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/user/stats');
      return response.json();
    },
  });

  const { data: recentVideos } = useQuery({
    queryKey: ['/api/videos/recent'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/videos/recent');
      return response.json();
    },
  });

  const todayProgress = stats?.todayWatchTime || 0;
  const dailyTarget = 8 * 60 * 60; // 8 hours in seconds
  const progressPercentage = Math.min((todayProgress / dailyTarget) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to earn money today? Let's watch some videos!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{user?.balance?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats?.todayEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Videos Watched</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.videosWatched || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Referrals</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.referralCount || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Daily Watch Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress: {Math.floor(todayProgress / 3600)}h {Math.floor((todayProgress % 3600) / 60)}m</span>
              <span>Target: 8h 0m</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-gray-600">
              {progressPercentage >= 100 
                ? "🎉 Congratulations! You've met today's target!" 
                : `${Math.ceil((dailyTarget - todayProgress) / 3600)} hours remaining to meet daily target`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/videos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Play className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Watch Videos</h3>
              <p className="text-sm text-gray-600">Start earning by watching videos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/referrals">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Refer Friends</h3>
              <p className="text-sm text-gray-600">Earn ₹49 per referral</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/earnings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Coins className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Request Payout</h3>
              <p className="text-sm text-gray-600">Withdraw your earnings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
```

This comprehensive frontend guide provides all the necessary React components, hooks, and configuration needed to recreate the EarnPay platform's user interface with modern best practices.