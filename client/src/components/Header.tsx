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
    { href: "/earnings", label: "Earnings", active: location === "/earnings" },
    { href: "/referrals", label: "Referrals", active: location === "/referrals" },
    { href: "/support", label: "Support", active: location === "/support" },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Play className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">EarnPay</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium ${
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
          <div className="flex items-center space-x-4">
            {/* Balance */}
            <div className="flex items-center space-x-2 bg-accent/10 px-3 py-2 rounded-lg">
              <Coins className="text-accent w-4 h-4" />
              <span className="font-semibold text-gray-900">₹{user && typeof user === 'object' && 'balance' in user ? user.balance : '0.00'}</span>
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user && typeof user === 'object' && 'profileImageUrl' in user ? user.profileImageUrl as string : ''} 
                      alt={user && typeof user === 'object' && 'firstName' in user ? user.firstName as string || 'User' : 'User'} 
                      className="object-cover"
                    />
                    <AvatarFallback>
                      {user && typeof user === 'object' && 'firstName' in user && user.firstName ? (user.firstName as string)[0] : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {user && typeof user === 'object' && 'firstName' in user ? user.firstName as string : ''} {user && typeof user === 'object' && 'lastName' in user ? user.lastName as string : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user && typeof user === 'object' && 'email' in user ? user.email as string : ''}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/earnings" className="flex items-center">
                    <Coins className="mr-2 h-4 w-4" />
                    Earnings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex overflow-x-auto space-x-4 px-4 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap py-2 px-3 rounded-lg text-sm font-medium ${
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
