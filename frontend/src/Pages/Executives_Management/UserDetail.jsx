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
    <div className="w-full max-w-full min-w-0 bg-background min-h-screen rounded-2xl space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-full shadow-sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-heading font-bold text-foreground">Staff Profile</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="cursor-pointer hover:text-foreground" onClick={() => navigate('/admin/users')}>Users</span>
              <span>›</span>
              <span className="font-medium text-foreground">{user.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setPasswordError('');
              setPasswordSuccess('');
              setNewPassword('');
              setIsPasswordDialogOpen(true);
            }}
            className="border-border text-foreground hover:bg-muted"
          >
            <Lock className="w-4 h-4 mr-2" /> Change Password
          </Button>
          <Button onClick={handleEditClick} className="bg-primary hover:bg-brand-dark text-primary-foreground">
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Profile Card */}
        <div className="col-span-1 bg-white border border-border/40 rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg mb-4">
            {user.image && <AvatarImage src={user.image} alt={user.name} className="object-cover" />}
            <AvatarFallback className="bg-muted text-muted-foreground text-4xl font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
          <p className="text-sm text-primary font-medium mt-1 uppercase tracking-wider">{user.role}</p>
          
          <div className={`mt-4 px-3 py-1 rounded-full border text-xs font-semibold ${user.emailVerified ? (user.isActive ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger') : 'border-warning/30 bg-warning/10 text-warning'}`}>
            {!user.emailVerified ? 'Pending' : (user.isActive ? 'Active' : 'Inactive')}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-border/40 space-y-4 text-left">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Phone className="w-4 h-4" />
              <span>{user.phone || 'Phone not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{user.address || 'Address not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <Briefcase className="w-4 h-4" />
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Work/Activity */}
        <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-white border border-border/40 rounded-xl shadow-sm p-6 mb-6">
            <h4 className="text-lg font-bold text-foreground mb-4">Professional Information</h4>
            <div className="grid grid-cols-2 gap-4">


              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Verification Status</p>
                <p className={`font-medium ${user.emailVerified ? 'text-success' : 'text-warning'}`}>
                  {user.emailVerified ? 'Verified' : 'Not Verified (Pending)'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Account Status</p>
                <p className={`font-medium ${user.isActive ? 'text-success' : 'text-danger'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border/40 rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-bold text-foreground mb-4">Work & Activity</h4>
            <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-lg border border-dashed border-border/60">
              <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Leads and tasks assigned to this executive will appear here.</p>
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
