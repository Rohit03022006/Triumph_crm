import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserFormDialog from '../../components/Executives_Management/UserFormDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Edit, Lock, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fetchUser = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  // find the specific user
  const user = data.data.find(u => u.id === id);
  console.log("Fetched user for ID:", id, "Result:", user, "All users:", data.data);
  return user;
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { data: user, isLoading, isError, error } = useQuery({ 
    queryKey: ['user', id], 
    queryFn: () => fetchUser(id)
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const payload = { ...updatedUser };
      if (!payload.password || !payload.password.trim()) {
        delete payload.password;
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditOpen(false);
    },
    onError: (err) => {
      alert("Error updating user: " + err.message);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (password) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to reset password");
      }
      return data;
    },
    onSuccess: (data) => {
      setPasswordSuccess(data?.message || "Password successfully updated.");
      setNewPassword('');
      setTimeout(() => {
        setIsPasswordDialogOpen(false);
        setPasswordSuccess('');
      }, 1500);
    },
    onError: (err) => {
      setPasswordError(err.message);
    }
  });

  const handleEditClick = () => {
    if (user) {
      setEditData({ ...user, password: '' });
      setIsEditOpen(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    resetPasswordMutation.mutate(newPassword);
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading user details...</div>;
  if (isError) return <div className="p-8 text-center text-danger">Error fetching user: {error.message}</div>;
  if (!user) return <div className="p-8 text-center text-danger">User not found</div>;

  return (
    <div className="w-full max-w-full min-w-0 bg-background min-h-screen rounded-2xl space-y-6 pb-16 overflow-x-hidden">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin/users')}
            className="rounded-full shadow-2xs h-10 w-10 border-slate-200 shrink-0"
            title="Back to Staff List"
          >
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              <span
                className="cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => navigate('/admin')}
              >
                Dashboard
              </span>
              <span>›</span>
              <span
                className="cursor-pointer hover:text-slate-900 transition-colors"
                onClick={() => navigate('/admin/users')}
              >
                Staff Management
              </span>
              <span>›</span>
              <span className="font-bold text-slate-800">{user.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  user.role === "ADMIN"
                    ? "bg-purple/10 text-purple border-purple/20"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {user.role === "ADMIN" ? "Administrator" : "Executive"}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Profile details, verification status, contact details, and account permissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              setPasswordError('');
              setPasswordSuccess('');
              setNewPassword('');
              setIsPasswordDialogOpen(true);
            }}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm h-10 px-3.5 shadow-2xs flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Change Password</span>
          </Button>
          <Button
            onClick={handleEditClick}
            className="bg-primary hover:bg-brand-dark text-primary-foreground font-semibold text-xs sm:text-sm h-10 px-4 shadow-2xs flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="col-span-1 bg-white border border-border/70 rounded-xl shadow-xs p-6 flex flex-col items-center text-center">
          <Avatar className="h-28 w-28 border-4 border-slate-50 shadow-md mb-4">
            {user.image && <AvatarImage src={user.image} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-slate-100 text-slate-600 text-3xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold text-slate-900 font-heading">{user.name}</h3>
          <p className="text-xs text-primary font-bold mt-1 uppercase tracking-wider">{user.role}</p>
          
          <div
            className={`mt-3 px-2.5 py-0.5 rounded-full border text-xs font-semibold tracking-wide ${
              user.emailVerified
                ? user.isActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {!user.emailVerified ? 'Pending Verification' : (user.isActive ? 'Active Staff' : 'Inactive')}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 space-y-3.5 text-left">
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.phone || 'Phone not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.address || 'Address not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Work/Activity */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white border border-border/70 rounded-xl shadow-xs p-6">
            <h4 className="text-base font-bold text-slate-900 font-heading mb-4">Professional Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Verification Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    user.emailVerified
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${user.emailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {user.emailVerified ? 'Verified' : 'Pending Approval'}
                </span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Account Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border/70 rounded-xl shadow-xs p-6">
            <h4 className="text-base font-bold text-slate-900 font-heading mb-4">Work & Activity</h4>
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50/60 rounded-lg border border-dashed border-border/70 text-center">
              <p className="text-slate-700 text-sm font-semibold">No activity recorded yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Leads, site visits, and properties assigned to this executive will appear here automatically.</p>
            </div>
          </div>
        </div>

      </div>
      <UserFormDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onSubmit={(data) => updateMutation.mutate(data)}
        data={editData}
        setData={setEditData}
        title="Edit Staff Member"
        isPending={updateMutation.isPending}
        isEdit={true}
      />

      {/* Admin Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-semibold text-foreground">{user.name}</span>. The executive will use this new password to sign in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            {passwordError && (
              <div className="bg-danger/10 text-danger p-3 rounded-md text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="bg-success/10 text-success p-3 rounded-md text-sm">{passwordSuccess}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="admin-new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="admin-new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter at least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={resetPasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="bg-primary hover:bg-brand-dark text-primary-foreground"
              >
                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDetail;
