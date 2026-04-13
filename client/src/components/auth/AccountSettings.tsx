import { useRef, useState } from 'react';
import { Camera, KeyRound, Pencil, Trash2, UserX, X } from 'lucide-react';

import { ConfirmDialog } from '@/components/layout/ConfirmDialog';
import {
  useChangePassword,
  useDeactivateAccount,
  useRemoveAvatar,
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { AuthUser } from '@/types/auth';

interface AccountSettingsProps {
  user: AuthUser;
  onDeactivated: () => void;
}

const resolveAvatarSrc = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith('http')) return avatarUrl;

  const apiBase = import.meta.env.VITE_API_URL || '';

  return `${apiBase}${avatarUrl}`;
};

export function AccountSettings({ user, onDeactivated }: AccountSettingsProps) {
  const { addToast } = useToast();

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const updateProfileMutation = useUpdateProfile();

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatarMutation = useUploadAvatar();
  const removeAvatarMutation = useRemoveAvatar();

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const changePasswordMutation = useChangePassword();

  // Deactivation state
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const deactivateAccountMutation = useDeactivateAccount();

  // Error state
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const initials =
    user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';

  const avatarSrc = resolveAvatarSrc(user.avatarUrl);
  const hasPassword = true; // Assume password users; Google-only users will get a clear error from the server

  const handleSaveProfile = async () => {
    setSettingsError(null);

    const changes: { name?: string; email?: string } = {};

    if (editName.trim() !== user.name) {
      changes.name = editName.trim();
    }

    if (editEmail.trim().toLowerCase() !== user.email) {
      changes.email = editEmail.trim().toLowerCase();
    }

    if (Object.keys(changes).length === 0) {
      setIsEditingProfile(false);
      return;
    }

    try {
      const result = await updateProfileMutation.mutateAsync({
        userId: user.id,
        input: changes,
      });

      setIsEditingProfile(false);

      if (result.emailChanged) {
        addToast({
          message: 'Profile updated. Please verify your new email address.',
          variant: 'success',
        });
      } else {
        addToast({ message: 'Profile updated.', variant: 'success' });
      }
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Unable to update profile right now.',
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditName(user.name);
    setEditEmail(user.email);
    setSettingsError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettingsError(null);
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await uploadAvatarMutation.mutateAsync({ userId: user.id, file });
      addToast({ message: 'Profile photo updated.', variant: 'success' });
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Unable to upload photo right now.',
      );
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setSettingsError(null);

    try {
      await removeAvatarMutation.mutateAsync(user.id);
      addToast({ message: 'Profile photo removed.', variant: 'success' });
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Unable to remove photo right now.',
      );
    }
  };

  const handleChangePassword = async () => {
    setSettingsError(null);

    if (newPassword !== confirmNewPassword) {
      setSettingsError('New passwords do not match.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      addToast({ message: 'Password changed successfully.', variant: 'success' });
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : 'Unable to change password right now.',
      );
    }
  };

  const handleDeactivateAccount = async () => {
    setSettingsError(null);

    try {
      await deactivateAccountMutation.mutateAsync({
        userId: user.id,
        input: { password: deactivatePassword || undefined },
      });

      setDeactivateDialog(false);
      onDeactivated();
    } catch (error) {
      setDeactivateDialog(false);
      setSettingsError(
        error instanceof Error ? error.message : 'Unable to deactivate account right now.',
      );
    }
  };

  return (
    <section className="mt-6 rounded-[28px] border border-border p-5">
      <h3 className="text-lg font-semibold text-foreground">Account settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your profile, photo, password, and account status.
      </p>

      {settingsError ? (
        <div className="mt-4 rounded-2xl border border-[#ffc2cc] bg-[#fff0f3] px-4 py-3 text-sm text-[#a8083a]">
          {settingsError}
        </div>
      ) : null}

      {/* Profile photo */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-foreground">Profile photo</p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={handleAvatarClick}
            disabled={uploadAvatarMutation.isPending}
            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[28px] bg-foreground text-2xl font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </div>
          </button>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadAvatarMutation.isPending}
              className="text-sm font-semibold text-[#FF385C] hover:underline disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload photo'}
            </button>
            {user.avatarUrl ? (
              <button
                type="button"
                onClick={() => {
                  void handleRemoveAvatar();
                }}
                disabled={removeAvatarMutation.isPending}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {removeAvatarMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            ) : null}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              void handleAvatarChange(e);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Profile information</p>
          {!isEditingProfile ? (
            <button
              type="button"
              onClick={() => {
                setEditName(user.name);
                setEditEmail(user.email);
                setIsEditingProfile(true);
                setSettingsError(null);
              }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF385C] hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : null}
        </div>

        {isEditingProfile ? (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <label htmlFor="edit-email" className="block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Changing your email will require re-verification.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleSaveProfile();
                }}
                disabled={updateProfileMutation.isPending}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={updateProfileMutation.isPending}
                className="inline-flex items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Name:</span> {user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email:</span> {user.email}
            </p>
          </div>
        )}
      </div>

      {/* Password change */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Password</p>
          {!isChangingPassword ? (
            <button
              type="button"
              onClick={() => {
                setIsChangingPassword(true);
                setSettingsError(null);
              }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF385C] hover:underline"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Change
            </button>
          ) : null}
        </div>

        {isChangingPassword ? (
          <div className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-foreground"
              >
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
              />
              <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm font-medium text-foreground"
              >
                Confirm new password
              </label>
              <input
                id="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  void handleChangePassword();
                }}
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmNewPassword
                }
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {changePasswordMutation.isPending ? 'Changing...' : 'Update password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setSettingsError(null);
                }}
                disabled={changePasswordMutation.isPending}
                className="inline-flex items-center gap-1 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Use a strong password that you don&apos;t use elsewhere.
          </p>
        )}
      </div>

      {/* Account deactivation */}
      <div className="mt-6 border-t border-border pt-6">
        <p className="text-sm font-semibold text-foreground">Deactivate account</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Deactivating your account will prevent you from signing in and hide your profile. Your
          reviews and saved churches will be preserved. Contact support to reactivate.
        </p>
        <button
          type="button"
          onClick={() => {
            setDeactivateDialog(true);
            setDeactivatePassword('');
            setSettingsError(null);
          }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#ffc2cc] bg-card px-5 py-2.5 text-sm font-semibold text-[#FF385C] transition-colors hover:bg-[#fff0f3]"
        >
          <UserX className="h-4 w-4" />
          Deactivate my account
        </button>
      </div>

      {/* Deactivation confirm dialog */}
      {deactivateDialog ? (
        <ConfirmDialog
          open={deactivateDialog}
          title="Deactivate your account?"
          description="This will prevent you from signing in. Your reviews and saved churches will be preserved. You can contact support to reactivate later."
          confirmLabel="Deactivate account"
          variant="destructive"
          isPending={deactivateAccountMutation.isPending}
          onConfirm={() => {
            void handleDeactivateAccount();
          }}
          onCancel={() => {
            setDeactivateDialog(false);
            setDeactivatePassword('');
          }}
        >
          {hasPassword ? (
            <div className="mt-4">
              <label
                htmlFor="deactivate-password"
                className="block text-sm font-medium text-foreground"
              >
                Enter your password to confirm
              </label>
              <input
                id="deactivate-password"
                type="password"
                value={deactivatePassword}
                onChange={(e) => setDeactivatePassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-[#FF385C] focus:ring-1 focus:ring-[#FF385C]"
                placeholder="Your current password"
              />
            </div>
          ) : null}
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
