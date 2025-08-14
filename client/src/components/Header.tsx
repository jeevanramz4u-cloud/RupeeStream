import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Play, Coins, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Check if we're on login or signup pages to hide auth buttons
  const isAuthPage = location === '/login' || location === '/signup';
  
  // Check if user is suspended and block navigation
  const isSuspended = (user as any)?.status === 'suspended';

  // Navigation items for authenticated users (no "How to Earn")
  const authenticatedNavItems = [
    { href: "/dashboard", label: "Dashboard", active: location === "/" || location === "/dashboard" },
    { href: "/tasks", label: "Complete Tasks", active: location === "/tasks" },
    { href: "/kyc", label: "KYC", active: location === "/kyc" },
    { href: "/referrals", label: "Referrals", active: location === "/referrals" },
    { href: "/support", label: "Support", active: location === "/support" },
  ];

  // Public header for non-authenticated users
  if (!isAuthenticated) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 safe-area-padding">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1.5 sm:space-x-2 touch-manipulation">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Innovative Task Earn</span>
            </Link>
            
            {/* Public Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link href="/how-to-earn" className="text-sm lg:text-base text-gray-600 hover:text-primary touch-manipulation">How to Earn</Link>
              <Link href="/referral-program" className="text-sm lg:text-base text-gray-600 hover:text-primary touch-manipulation">Referral Program</Link>
              <Link href="/about" className="text-sm lg:text-base text-gray-600 hover:text-primary touch-manipulation">About</Link>
              <Link href="/contact" className="text-sm lg:text-base text-gray-600 hover:text-primary touch-manipulation">Contact</Link>
            </nav>

            {/* Auth buttons - hidden on login/signup pages */}
            {!isAuthPage && (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm font-bold border-2 hover:border-primary/50 touch-manipulation">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-xs sm:text-sm font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 touch-manipulation">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 safe-area-padding">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link 
            href={isSuspended ? "/suspended" : "/dashboard"} 
            className="flex items-center space-x-1.5 sm:space-x-2 touch-manipulation"
            onClick={isSuspended ? (e) => {
              e.preventDefault();
              window.location.href = '/suspended';
            } : undefined}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Play className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Innovative Task Earn</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {authenticatedNavItems.map((item) => (
              <Link
                key={item.href}
                href={isSuspended ? '/suspended' : item.href}
                className={`font-medium text-sm lg:text-base touch-manipulation ${
                  item.active 
                    ? "text-primary" 
                    : isSuspended 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-gray-600 hover:text-primary"
                }`}
                onClick={isSuspended ? (e) => {
                  e.preventDefault();
                  window.location.href = '/suspended';
                } : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Earnings Display - Always Visible */}
            <Link href="/earnings">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-green-50 hover:bg-green-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors cursor-pointer touch-manipulation">
                <Coins className="text-green-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-bold text-green-700 text-sm sm:text-base">₹{(user as any)?.balance || '0.00'}</span>
              </div>
            </Link>
            
            {/* User Menu - Clean Round Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage 
                      src={(user as any)?.profileImageUrl || ''} 
                      alt={(user as any)?.firstName || 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-white text-sm font-medium">
                      {(user as any)?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {/* User Info */}
                <div className="flex items-center justify-start gap-3 p-3 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={(user as any)?.profileImageUrl || ''} 
                      alt={(user as any)?.firstName || 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-white text-sm font-medium">
                      {(user as any)?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(user as any)?.email}
                    </p>
                  </div>
                </div>
                
                {/* Only Logout Button */}
                <div className="py-1">
                  <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 touch-manipulation">
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto space-x-3 px-3 py-2 scrollbar-hide">
          {authenticatedNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap py-1.5 px-2.5 rounded-md text-xs font-medium flex-shrink-0 touch-manipulation ${
                item.active
                  ? "bg-primary text-white"
                  : "text-gray-600 hover:text-primary hover:bg-primary/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
