import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LogoutButtonProps {
  type?: 'user' | 'admin';
  className?: string;
}

export function LogoutButton({ type = 'user', className }: LogoutButtonProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const endpoint = type === 'admin' ? '/api/admin/logout' : '/api/auth/logout';
      await apiRequest("POST", endpoint);
      
      // Force a complete page reload to clear all caches and state
      window.location.href = type === 'admin' ? '/admin-login' : '/login';
    } catch (error) {
      // Even if API fails, still redirect for security
      window.location.href = type === 'admin' ? '/admin-login' : '/login';
    }
  };

  return (
    <Button 
      onClick={handleLogout}
      variant="outline" 
      size="sm"
      className={className}
      data-testid={`button-logout-${type}`}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}