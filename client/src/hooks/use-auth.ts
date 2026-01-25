import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type AuthStatus = { authenticated: boolean };

async function fetchAuthStatus(): Promise<boolean> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as AuthStatus;
  return data.authenticated === true;
}

async function logout(): Promise<void> {
  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: isAuthenticated, isLoading } = useQuery<boolean>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchAuthStatus,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], false);
    },
  });

  return {
    isLoading,
    isAuthenticated: !!isAuthenticated,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
