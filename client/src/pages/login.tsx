import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "demo@innovativetaskearn.online", // Pre-fill with demo credentials for easier testing
    password: "demo123",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);
        
        // Clear logout flag to enable demo fallback
        localStorage.removeItem('user_logged_out');
        
        // Invalidate auth query to refetch user data
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/check"] });
        
        // Small delay to ensure query refetch completes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if user is suspended and redirect accordingly
        if (data.user && data.user.status === 'suspended') {
          console.log('Suspended user logged in - redirecting to suspended page');
          setLocation('/suspended');
        } else {
          // Redirect to dashboard after successful login
          console.log('Redirecting to dashboard');
          setLocation('/dashboard');
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 safe-area-padding">
      <Header />
      
      <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-primary/5 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="w-full max-w-md space-y-4 sm:space-y-6 relative z-10">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LogIn className="text-white w-8 h-8" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight">Welcome Back</h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">Sign in to continue earning with Innovative Task Earn</p>
          </div>

        {/* Demo Login Info */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-xl border-2 border-blue-200/50 hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-300/20 to-indigo-400/20 rounded-full blur-xl"></div>
          <div className="relative text-center space-y-4">
            <h3 className="text-lg font-black text-blue-900 tracking-tight">Demo Access Available</h3>
            <div className="text-sm text-blue-700 space-y-2 bg-white/50 rounded-2xl p-4">
              <p className="font-bold"><strong>Email:</strong> demo@innovativetaskearn.online</p>
              <p className="font-bold"><strong>Password:</strong> demo123</p>
            </div>
            <Button 
              type="button" 
              onClick={() => setFormData({ email: 'demo@innovativetaskearn.online', password: 'demo123' })}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-bold text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Use Demo Login
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-b-3xl"></div>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <LogIn className="w-4 h-4 text-white" />
              </div>
              Sign In to Your Account
            </h2>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-12 text-base touch-manipulation"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-12 text-base pr-12 touch-manipulation"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                size="full"
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 font-bold" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In to Start Earning"}
              </Button>
            </form>

            <div className="mt-8 space-y-4 text-center">
              <Link href="/forgot-password">
                <Button variant="link" className="text-base text-primary font-bold hover:text-primary/80">
                  Forgot your password?
                </Button>
              </Link>
              
              <p className="text-base text-gray-600 font-medium">
                Don't have an account?{" "}
                <Link href="/signup">
                  <Button variant="link" className="p-0 h-auto text-primary font-black text-base hover:text-primary/80">
                    Sign up here
                  </Button>
                </Link>
              </p>
            </div>
          </div>
        </div>


      </div>
      </div>
      
      <Footer />
    </div>
  );
}