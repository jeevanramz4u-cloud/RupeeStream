import { Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './hooks/useAuth.tsx';
import { Toaster } from './components/ui/toaster.tsx';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Earnings from './pages/Earnings';
import KYC from './pages/KYC';
import Referrals from './pages/Referrals';
import VerifyEmail from './pages/VerifyEmail';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/profile" component={Profile} />
          <Route path="/earnings" component={Earnings} />
          <Route path="/kyc" component={KYC} />
          <Route path="/referrals" component={Referrals} />
          
          {/* Auth & Verification Pages */}
          <Route path="/verify-email" component={VerifyEmail} />
          
          {/* Legal Pages */}
          <Route path="/terms" component={Terms} />
          <Route path="/privacy" component={Privacy} />
          
          {/* Info Pages */}
          <Route path="/contact" component={Contact} />
          <Route path="/about" component={About} />
          <Route path="/faq" component={FAQ} />
          
          {/* Admin Routes */}
          <Route path="/admin">
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-2xl">Admin Dashboard - Coming Soon</h1>
            </div>
          </Route>
          
          {/* 404 Page */}
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600">Page not found</p>
                <a href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                  Go to Home
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
      <Toaster />
    </AuthProvider>
    </QueryClientProvider>
  );
}