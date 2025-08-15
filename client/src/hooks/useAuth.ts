import { useQuery } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useEffect, useRef } from "react";

export function useAuth() {
  const { toast } = useToast();
  const toastShownRef = useRef(false);
  
  // Use traditional auth for our demo login system with retry disabled to prevent infinite loops
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/check"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    networkMode: 'always', // Always try to fetch, even if offline
  });
  
  // Force loading to false after reasonable timeout to prevent infinite loading
  const effectiveIsLoading = isLoading && !isError;

  // Debug: Log the actual response data structure
  console.log("useAuth - Raw API response:", data);
  
  // Extract user from the response data
  const user = (data as any)?.user || null;
  
  console.log("useAuth - Extracted user object:", {
    userId: user?.id,
    status: user?.status,
    verificationStatus: user?.verificationStatus,
    kycStatus: user?.kycStatus,
    hasUser: !!user
  });

  // Removed persistent hourly bonus notification to prevent spam
  // The bonus is still awarded automatically, but won't show repeated notifications

  return {
    user,
    isLoading: effectiveIsLoading,
    isAuthenticated: !!user,
  };
}
