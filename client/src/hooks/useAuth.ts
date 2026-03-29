import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  requestEmailVerification,
  requestPasswordReset,
  registerUser,
  resetPassword,
  verifyEmail,
} from '@/api/auth'
import {
  CHURCHES_QUERY_KEY,
  CHURCH_QUERY_KEY,
  SAVED_CHURCHES_QUERY_KEY,
} from '@/hooks/useChurches'
import {
  AuthCredentials,
  AuthRegisterInput,
  AuthUser,
  ForgotPasswordInput,
  ForgotPasswordResult,
  RequestEmailVerificationResult,
  ResetPasswordInput,
  VerifyEmailInput,
  VerifyEmailResult,
} from '@/types/auth'

export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const

const AUTH_STALE_TIME = 1000 * 60 * 5

const refreshSessionAwareQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: CHURCHES_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: CHURCH_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY })
}

export const useCurrentUser = () => {
  return useQuery<AuthUser | null, Error>({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: AUTH_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
  })
}

export const useAuthSession = () => {
  const sessionQuery = useCurrentUser()

  return {
    ...sessionQuery,
    user: sessionQuery.data ?? null,
    isAuthenticated: Boolean(sessionQuery.data),
  }
}

export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation<AuthUser, Error, AuthCredentials>({
    mutationFn: loginUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user)
      refreshSessionAwareQueries(queryClient)
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation<AuthUser, Error, AuthRegisterInput>({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, user)
      refreshSessionAwareQueries(queryClient)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, void>({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null)
      refreshSessionAwareQueries(queryClient)
      queryClient.removeQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY })
    },
  })
}

export const useRequestPasswordReset = () => {
  return useMutation<ForgotPasswordResult, Error, ForgotPasswordInput>({
    mutationFn: requestPasswordReset,
  })
}

export const useRequestEmailVerification = () => {
  return useMutation<RequestEmailVerificationResult, Error, void>({
    mutationFn: requestEmailVerification,
  })
}

export const useResetPassword = () => {
  return useMutation<void, Error, ResetPasswordInput>({
    mutationFn: resetPassword,
  })
}

export const useVerifyEmail = () => {
  const queryClient = useQueryClient()

  return useMutation<VerifyEmailResult, Error, VerifyEmailInput>({
    mutationFn: verifyEmail,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY })
      refreshSessionAwareQueries(queryClient)
    },
  })
}
