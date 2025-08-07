import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Dashboard from "./pages/dashboard";
import Videos from "./pages/videos";
import VideoPlayer from "./pages/video-player";
import Earnings from "./pages/earnings";
import Referrals from "./pages/referrals";
import Support from "./pages/support";
import Admin from "./pages/admin";
import AdminLogin from "./pages/admin-login";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsConditions from "./pages/terms-conditions";
import HowToEarn from "./pages/how-to-earn";
import EarningsHistory from "./pages/earnings-history";
import KYC from "./pages/kyc";
import Profile from "./pages/profile";
import SuspendedPage from "./pages/suspended";

function AdminRoute() {
  const { isAuthenticated: isAdminAuth, isLoading: adminLoading } = useAdminAuth();
  
  if (adminLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  if (isAdminAuth) {
    return <Admin />;
  } else {
    return <AdminLogin />;
  }
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login instead of 404
    window.location.href = "/login";
    return null;
  }
  
  // Global suspension check - force suspended users to suspended page for ALL routes
  if ((user as any)?.status === 'suspended') {
    const currentPath = window.location.pathname;
    
    // If user is suspended and not on suspended page, force redirect
    if (currentPath !== '/suspended') {
      console.log('Suspended user attempting to access:', currentPath, '- redirecting to /suspended');
      // Force page reload to ensure complete redirect
      setTimeout(() => {
        window.location.href = '/suspended';
      }, 100);
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-red-600">Redirecting to suspension page...</p>
          </div>
        </div>
      );
    }
  }
  
  return <Component />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Admin routes - separate from regular user auth */}
      <Route path="/admin" component={AdminRoute} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Public routes - always accessible */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/how-to-earn" component={HowToEarn} />
      
      {/* Home route - conditional based on auth */}
      <Route path="/" component={() => {
        if (isLoading) {
          return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading...</p>
              </div>
            </div>
          );
        }
        
        if (isAuthenticated) {
          // Check suspension status for home route too
          if ((user as any)?.status === 'suspended') {
            window.location.href = '/suspended';
            return null;
          }
          return <Dashboard />;
        }
        
        return <Landing />;
      }} />
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/videos" component={() => <ProtectedRoute component={Videos} />} />
      <Route path="/video/:id" component={() => <ProtectedRoute component={VideoPlayer} />} />
      <Route path="/earnings" component={() => <ProtectedRoute component={Earnings} />} />
      <Route path="/earnings-history" component={() => <ProtectedRoute component={EarningsHistory} />} />
      <Route path="/referrals" component={() => <ProtectedRoute component={Referrals} />} />
      <Route path="/support" component={() => <ProtectedRoute component={Support} />} />
      <Route path="/suspended" component={() => <ProtectedRoute component={SuspendedPage} />} />
      <Route path="/kyc" component={() => <ProtectedRoute component={KYC} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
