import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentAdmin, login, logout } from "../api/auth-api.js";
import type { CurrentAdminResponse, LoginRequest } from "../types/api.js";

const authQueryKey = ["auth", "me"] as const;

export function useAuth() {
  const queryClient = useQueryClient();

  const currentAdminQuery = useQuery({
    queryKey: authQueryKey,
    queryFn: ({ signal }) => getCurrentAdmin(signal),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginRequest) => login(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => logout(currentAdminQuery.data?.csrfToken ?? ""),
    onSuccess: () => {
      queryClient.setQueryData<CurrentAdminResponse | null>(authQueryKey, null);
      queryClient.removeQueries({ queryKey: authQueryKey });
    },
  });

  return {
    admin: currentAdminQuery.data?.admin ?? null,
    csrfToken: currentAdminQuery.data?.csrfToken ?? null,
    isAuthenticated: Boolean(currentAdminQuery.data?.admin),
    isLoading: currentAdminQuery.isPending,
    isAuthError: currentAdminQuery.isError,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutateAsync,
    logoutError: logoutMutation.error,
    isLoggingOut: logoutMutation.isPending,
  };
}
