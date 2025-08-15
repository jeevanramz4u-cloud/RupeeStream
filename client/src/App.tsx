import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Dashboard from "./pages/dashboard";
import Tasks from "./pages/tasks";
import Earnings from "./pages/earnings";
// import VideoWatch from "./pages/video-watch"; // Commented out - file may not exist
import Referrals from "./pages/referrals";
import Support from "./pages/support";
import KYC from "./pages/kyc";
import Suspended from "./pages/suspended";
import AdminLogin from "./pages/admin-login";
import AdminTasks from "./pages/admin-tasks";
import AdminInquiries from "./pages/admin-inquiries";
import Landing from "./pages/landing";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsConditions from "./pages/terms-conditions";
import About from "./pages/about";
import Contact from "./pages/contact";
import Advertisers from "./pages/advertisers";
import HowToEarn from "./pages/how-to-earn";
import Careers from "./pages/careers";
import PayoutSchedule from "./pages/payout-schedule";
import ReferralProgram from "./pages/referral-program";
import ShippingPolicy from "./pages/shipping-policy";
import RefundPolicy from "./pages/refund-policy";
import TaskDetails from "./pages/task-details";
import AdminLiveChat from "./pages/admin-live-chat";
import { FloatingChat } from "./components/FloatingChat";

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
    return <AdminTasks />;
  } else {
    return <AdminLogin />;
  }
}

function AdminTasksRoute() {
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
    return <AdminTasks />;
  } else {
    return <AdminLogin />;
  }
}

function AdminInquiriesRoute() {
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
    return <AdminInquiries />;
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
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Admin routes - separate from regular user auth */}
      <Route path="/admin" component={AdminRoute} />
      <Route path="/admin/tasks" component={AdminTasksRoute} />
      <Route path="/admin/inquiries" component={AdminInquiriesRoute} />
      <Route path="/admin/live-chat" component={() => <AdminLiveChat />} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Public routes - always accessible */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/shipping-policy" component={ShippingPolicy} />
      <Route path="/refund-policy" component={RefundPolicy} />
      <Route path="/how-to-earn" component={HowToEarn} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/advertisers" component={Advertisers} />
      <Route path="/careers" component={Careers} />
      <Route path="/payout-schedule" component={PayoutSchedule} />
      <Route path="/referral-program" component={ReferralProgram} />
      
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
        return isAuthenticated ? <Dashboard /> : <Landing />;
      }} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute component={Tasks} />
      </Route>
      <Route path="/task/:id">
        {(params) => <ProtectedRoute component={() => <TaskDetails taskId={params.id} />} />}
      </Route>
      <Route path="/earnings">
        <ProtectedRoute component={Earnings} />
      </Route>
{/* Video watch route commented out - file may not exist
      <Route path="/video/:id">
        {(params) => <ProtectedRoute component={() => <VideoWatch videoId={params.id} />} />}
      </Route>
      */}
      <Route path="/referrals">
        <ProtectedRoute component={Referrals} />
      </Route>
      <Route path="/support">
        <ProtectedRoute component={Support} />
      </Route>
      <Route path="/kyc">
        <ProtectedRoute component={KYC} />
      </Route>
      <Route path="/suspended">
        <ProtectedRoute component={Suspended} />
      </Route>
      
      {/* 404 route */}
      <Route>
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Page not found</p>
            <a href="/" className="text-primary hover:underline">
              Go back home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <Router />
      <Toaster />
      {/* Show floating chat only for authenticated users */}
      {isAuthenticated && <FloatingChat />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;