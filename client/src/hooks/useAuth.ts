import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Try both auth methods - Replit auth first, then traditional auth
  const { data: replitUser, isLoading: replitLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const { data: traditionalUser, isLoading: traditionalLoading } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
  });

  const user = replitUser || traditionalUser;
  const isLoading = replitLoading || traditionalLoading;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
