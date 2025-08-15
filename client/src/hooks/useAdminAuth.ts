import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  // Use admin auth endpoint with development fallbacks
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/admin/auth/user"],
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Disable caching to ensure fresh auth state
    gcTime: 0, // Disable cache entirely
    networkMode: 'always',
    queryFn: async () => {
      console.log("Admin auth - Starting check");
      try {
        const res = await fetch("/api/admin/auth/user", {
          credentials: "include",
        });
        console.log("Admin auth - Response status:", res.status);
        
        if (!res.ok) {
          console.log("Admin auth - Response not OK");
          return { user: null };
        }
        
        const data = await res.json();
        console.log("Admin auth - Success data:", data);
        return { user: data }; // Admin endpoint returns admin object directly
      } catch (error) {
        console.log("Admin auth - Error:", error);
        // Don't provide fallback during errors - let the hook handle it
        return { user: null };
      }
    },
  });
  
  // Force loading to false after reasonable timeout
  const effectiveIsLoading = isLoading && !isError;

  // Debug logs
  console.log("useAdminAuth - Raw API response:", data);
  console.log("useAdminAuth - isError:", isError);
  console.log("useAdminAuth - isLoading:", isLoading);
  
  // Extract admin user from response
  let adminUser = (data as any)?.user || null;
  
  // No development fallback - admins must login properly
  
  console.log("useAdminAuth - Final admin user:", {
    adminId: adminUser?.id,
    username: adminUser?.username,
    hasAdmin: !!adminUser,
    fullAdmin: adminUser
  });

  return {
    adminUser,
    isLoading: effectiveIsLoading,
    isAdminAuthenticated: !!adminUser,
    refetch
  };
}