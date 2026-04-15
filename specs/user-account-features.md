# User Account Features Spec

> **Status:** In progress
> **Author:** Claude
> **Date:** 2026-04-13

## Overview

Add self-service account management: profile editing, password change, avatar upload, and account deactivation (soft delete).

## Features

### 1. Profile Update (name + email)

- **Endpoint:** `PATCH /api/v1/users/:id/profile`
- **Auth:** requireAuth, own profile only
- **Body:** `{ name?: string, email?: string }`
- **Behavior:**
  - Update name and/or email
  - If email changes: set `emailVerified = false`, issue new verification token
  - Validate email uniqueness before update
  - Returns updated `AuthUser`

### 2. Password Change

- **Endpoint:** `POST /api/v1/auth/change-password`
- **Auth:** requireAuth
- **Body:** `{ currentPassword: string, newPassword: string }`
- **Behavior:**
  - Verify current password with bcrypt
  - Hash and store new password
  - Google-only users (no passwordHash) get 400 error
  - Returns 200 with success message

### 3. Avatar Upload

- **Endpoint:** `POST /api/v1/users/:id/avatar`
- **Auth:** requireAuth, own profile only
- **Body:** multipart/form-data with `avatar` file field
- **Behavior:**
  - Accept JPEG, PNG, WebP, GIF (max 5 MB)
  - Store in `server/uploads/avatars/` with UUID filename
  - Serve via Express static middleware at `/uploads/avatars/`
  - Update user's `avatarUrl` in database
  - Delete old avatar file if replacing
  - Returns updated `AuthUser`

- **Endpoint:** `DELETE /api/v1/users/:id/avatar`
- **Auth:** requireAuth, own profile only
- **Behavior:**
  - Remove avatar file from disk
  - Set `avatarUrl = null` in database
  - Returns updated `AuthUser`

### 4. Account Deactivation (Soft Delete)

- **Schema change:** Add `deactivatedAt DateTime?` to User model
- **Endpoint:** `POST /api/v1/users/:id/deactivate`
- **Auth:** requireAuth, own profile only
- **Body:** `{ password?: string }` (required for password users, skipped for Google-only)
- **Behavior:**
  - Verify password if applicable
  - Set `deactivatedAt = now()`
  - Destroy session
  - Returns 200 with success message
- **Login guard:** `authenticateUser` and `authenticateGoogleUser` reject deactivated accounts

## Client Changes

### Types (`src/types/auth.ts`)

- `UpdateProfileInput`: `{ name?: string, email?: string }`
- `UpdateProfileResult`: `{ user: AuthUser, emailChanged: boolean, previewUrl?: string }`
- `ChangePasswordInput`: `{ currentPassword: string, newPassword: string }`
- `DeactivateAccountInput`: `{ password?: string }`

### API functions (`src/api/auth.ts`)

- `updateProfile(id, input)` — PATCH
- `changePassword(input)` — POST
- `uploadAvatar(id, file)` — POST multipart
- `removeAvatar(id)` — DELETE
- `deactivateAccount(id, input)` — POST

### Hooks (`src/hooks/useAuth.ts`)

- `useUpdateProfile()` — mutation, updates session cache
- `useChangePassword()` — mutation
- `useUploadAvatar()` — mutation, updates session cache
- `useRemoveAvatar()` — mutation, updates session cache
- `useDeactivateAccount()` — mutation, clears session

### UI (`AccountPage.tsx`)

- Add "Edit Profile" section with inline name/email editing
- Add avatar upload widget with preview and remove
- Add "Change Password" collapsible section
- Add "Deactivate Account" section with confirmation dialog

## Non-goals

- Account reactivation (admin-only, future work)
- Avatar cropping/resizing in browser
- Notification preferences (separate feature)
