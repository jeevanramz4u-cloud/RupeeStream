import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const url = queryKey.join("/") as string;
      console.log("QueryFn - Fetching:", url);
      
      const res = await fetch(url, {
        credentials: "include",
      });

      console.log("QueryFn - Response status:", res.status);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("QueryFn - Returning null for 401");
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log("QueryFn - Response data:", data);
      return data;
    } catch (error) {
      console.log("QueryFn - Error:", error);
      // Handle network errors gracefully
      if (unauthorizedBehavior === "returnNull") {
        console.log("QueryFn - Returning null due to error");
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
