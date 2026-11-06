import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as authApi from '@/api/auth';
import { AuthUser } from '@/types/auth';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

export const useCurrentUser = () =>
  useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.fetchCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

/** Login/register share the same "store the session user" behaviour. */
const useSessionMutation = <TInput>(fn: (input: TInput) => Promise<AuthUser>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
      void queryClient.invalidateQueries({ queryKey: ['churches'] });
    },
  });
};

export const useLogin = () => useSessionMutation(authApi.login);
export const useRegister = () => useSessionMutation(authApi.register);

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ['saved'] });
      void queryClient.invalidateQueries({ queryKey: ['churches'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, name }: { userId: string; name: string }) =>
      authApi.updateProfile(userId, name),
    onSuccess: (user) => queryClient.setQueryData(AUTH_QUERY_KEY, user),
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password?: string }) =>
      authApi.deleteAccount(userId, password),
    onSuccess: () => {
      queryClient.clear();
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    },
  });
};
