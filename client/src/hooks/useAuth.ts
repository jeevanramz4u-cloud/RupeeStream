import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Use traditional auth for our demo login system
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
