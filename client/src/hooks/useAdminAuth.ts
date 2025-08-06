import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { data: adminUser, isLoading, error } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes  
  });

  return {
    adminUser,
    isLoading,
    isAuthenticated: !!adminUser,
    error
  };
}