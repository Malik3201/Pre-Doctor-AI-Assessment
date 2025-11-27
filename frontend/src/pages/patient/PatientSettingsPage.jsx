import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Skeleton from '../../components/ui/Skeleton';
import apiClient from '../../api/apiClient';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function PatientSettingsPage() {
  const { showToast } = useToast();
  const { updateUser } = useAuth();

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'prefer_not_to_say',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError('');
    try {
      const response = await apiClient.get('/patient/profile');
      const user = response.data?.user;
      if (!user) {
        throw new Error('Profile data not available');
      }
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age ?? '',
        gender: user.gender || 'prefer_not_to_say',
      });
    } catch (err) {
      setProfileError(err?.response?.data?.message || 'Unable to load your profile.');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!profileForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const ageNumber = Number(profileForm.age);
    if (!profileForm.age) {
      errors.age = 'Age is required.';
    } else if (Number.isNaN(ageNumber) || ageNumber < 1 || ageNumber > 120) {
      errors.age = 'Please provide a valid age between 1 and 120.';
    }

    if (!profileForm.gender) {
      errors.gender = 'Gender is required.';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        age: ageNumber,
        gender: profileForm.gender,
      };
      const response = await apiClient.put('/patient/profile', payload);
      const updatedUser = response.data?.user;

      if (updatedUser) {
        updateUser((prev) => ({ ...(prev || {}), ...updatedUser }));
      }

      showToast({ title: 'Profile updated.', variant: 'success' });
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update profile.';
      showToast({ title: message, variant: 'error' });

      if (/email/i.test(message)) {
        setProfileErrors((prev) => ({ ...prev, email: message }));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required.';
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long.';
    }
    if (!passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Please confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errors.confirmNewPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await apiClient.patch('/patient/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      showToast({ title: 'Password updated successfully.', variant: 'success' });
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Unable to update password. Please try again later.';
      showToast({ title: message, variant: 'error' });

      if (/current password/i.test(message)) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: message }));
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PatientLayout
      title="Account settings"
      subtitle="Update your personal details and keep your account secure."
    >
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-4">
        {/* Profile Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500">
              These details are linked to your reports for this hospital.
            </p>
          </div>

          {profileError && (
            <div className="mb-4 space-y-3">
              <ErrorBanner message={profileError} />
              <Button size="sm" variant="outline" onClick={fetchProfile}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          )}

          {profileLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
                {profileErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{profileErrors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
                {profileErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{profileErrors.email}</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={profileForm.age}
                    onChange={handleProfileChange}
                    required
                  />
                  {profileErrors.age && (
                    <p className="mt-1 text-xs text-rose-600">{profileErrors.age}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    id="gender"
                    name="gender"
                    value={profileForm.gender}
                    onChange={handleProfileChange}
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {profileErrors.gender && (
                    <p className="mt-1 text-xs text-rose-600">{profileErrors.gender}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          )}
        </section>

        {/* Password Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
            <p className="text-sm text-slate-500">
              Use a strong password that you don&apos;t reuse on other sites.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs text-rose-600">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-rose-600">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmNewPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmNewPassword && (
                <p className="mt-1 text-xs text-rose-600">{passwordErrors.confirmNewPassword}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </PatientLayout>
  );
}


