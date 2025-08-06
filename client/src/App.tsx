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

function AdminRoute() {
  const { isAuthenticated: isAdminAuth } = useAdminAuth();
  
  if (isAdminAuth) {
    return <Admin />;
  } else {
    return <AdminLogin />;
  }
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Admin routes - separate from regular user auth */}
      <Route path="/admin" component={AdminRoute} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-conditions" component={TermsConditions} />
          <Route path="/how-to-earn" component={HowToEarn} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/videos" component={Videos} />
          <Route path="/video/:id" component={VideoPlayer} />
          <Route path="/earnings" component={Earnings} />
          <Route path="/earnings-history" component={EarningsHistory} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/support" component={Support} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-conditions" component={TermsConditions} />
          <Route path="/how-to-earn" component={HowToEarn} />
        </>
      )}
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
