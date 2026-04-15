import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changePassword,
  deactivateAccount,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  removeAvatar,
  requestEmailVerification,
  requestPasswordReset,
  registerUser,
  resetPassword,
  updateProfile,
  uploadAvatar,
  verifyEmail,
} from '@/api/auth';
import {
  CHURCHES_QUERY_KEY,
  CHURCH_QUERY_KEY,
  SAVED_CHURCHES_QUERY_KEY,
} from '@/hooks/useChurches';
import {
  AuthCredentials,
  AuthRegisterInput,
  AuthUser,
  ChangePasswordInput,
  DeactivateAccountInput,
  ForgotPasswordInput,
  ForgotPasswordResult,
  RequestEmailVerificationResult,
  ResetPasswordInput,
  UpdateProfileInput,
  UpdateProfileResult,
  VerifyEmailInput,
  VerifyEmailResult,
} from '@/types/auth';

export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;

const AUTH_STALE_TIME = 1000 * 60 * 5;

const refreshSessionAwareQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: CHURCHES_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CHURCH_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY });
};

export const useCurrentUser = () => {
  return useQuery<AuthUser | null, Error>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: AUTH_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useAuthSession = () => {
  const sessionQuery = useCurrentUser();

  return {
    ...sessionQuery,
    user: sessionQuery.data ?? null,
    isAuthenticated: Boolean(sessionQuery.data),
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, AuthCredentials>({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
      refreshSessionAwareQueries(queryClient);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, AuthRegisterInput>({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
      refreshSessionAwareQueries(queryClient);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      refreshSessionAwareQueries(queryClient);
      queryClient.removeQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY });
    },
  });
};

export const useRequestPasswordReset = () => {
  return useMutation<ForgotPasswordResult, Error, ForgotPasswordInput>({
    mutationFn: requestPasswordReset,
  });
};

export const useRequestEmailVerification = () => {
  return useMutation<RequestEmailVerificationResult, Error, void>({
    mutationFn: requestEmailVerification,
  });
};

export const useResetPassword = () => {
  return useMutation<void, Error, ResetPasswordInput>({
    mutationFn: resetPassword,
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();

  return useMutation<VerifyEmailResult, Error, VerifyEmailInput>({
    mutationFn: verifyEmail,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
      refreshSessionAwareQueries(queryClient);
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResult, Error, { userId: string; input: UpdateProfileInput }>({
    mutationFn: ({ userId, input }) => updateProfile(userId, input),
    onSuccess: (result) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, result.user);
    },
  });
};

export const useChangePassword = () => {
  return useMutation<void, Error, ChangePasswordInput>({
    mutationFn: changePassword,
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, { userId: string; file: File }>({
    mutationFn: ({ userId, file }) => uploadAvatar(userId, file),
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation<AuthUser, Error, string>({
    mutationFn: removeAvatar,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user);
    },
  });
};

export const useDeactivateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string; input: DeactivateAccountInput }>({
    mutationFn: ({ userId, input }) => deactivateAccount(userId, input),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
      refreshSessionAwareQueries(queryClient);
      queryClient.removeQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY });
    },
  });
};
