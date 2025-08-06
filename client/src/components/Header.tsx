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
import { Play, Coins, User, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", active: location === "/" || location === "/dashboard" },
    { href: "/videos", label: "Videos", active: location === "/videos" },
    { href: "/referrals", label: "Referrals", active: location === "/referrals" },
    { href: "/support", label: "Support", active: location === "/support" },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 safe-area-padding">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-1.5 sm:space-x-2 touch-manipulation">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Play className="text-white w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">EarnPay</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium text-sm lg:text-base touch-manipulation ${
                  item.active 
                    ? "text-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Earnings Display - Desktop/Laptop Only */}
            <div className="hidden md:flex items-center space-x-1.5 sm:space-x-2 bg-accent/10 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg">
              <Coins className="text-accent w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">₹{(user as any)?.balance || '0.00'}</span>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full touch-manipulation">
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9">
                    <AvatarImage 
                      src={(user as any)?.profileImageUrl || ''} 
                      alt={(user as any)?.firstName || 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-white text-xs sm:text-sm">
                      {(user as any)?.firstName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 sm:w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none min-w-0">
                    <p className="font-medium text-sm truncate">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(user as any)?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center text-sm touch-manipulation">
                    <User className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm touch-manipulation">
                  <Settings className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'} className="text-sm touch-manipulation">
                  <LogOut className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto space-x-3 px-3 py-2 scrollbar-hide">
          {navItems.map((item) => (
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
