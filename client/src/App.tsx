import { Route, Switch } from 'wouter';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          
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
  );
}