import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ExecutivesHeader from '../../components/Executives_Management/ExecutivesHeader'
import ExecutivesStats from '../../components/Executives_Management/ExecutivesStats'
import ExecutivesFilters from '../../components/Executives_Management/ExecutivesFilters'
import UserFormDialog from '../../components/Executives_Management/UserFormDialog'
import UsersTable from '../../components/Executives_Management/UsersTable'
import UsersGrid from '../../components/Executives_Management/UsersGrid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Lock } from 'lucide-react'


const fetchUsers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, { credentials: 'include' });
  if (!res.ok) throw new Error("Failed to fetch users");
  return (await res.json()).data;
};

const createUser = async (userData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

const updateUser = async ({ id, data }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
};

const verifyUser = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/verify`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to verify user");
  return res.json();
};

const bulkDeleteUsersFn = async (ids) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error?.message || "Failed to delete users");
  }
  return res.json();
};

const deleteUserFn = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
};





const Executives = () => {
  const queryClient = useQueryClient();
  
  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Forms
  const defaultForm = { name: '', email: '', password: '', role: 'EXECUTIVE', phone: '', address: '', isActive: true, emailVerified: true };
  const [formData, setFormData] = useState(defaultForm);
  const [editData, setEditData] = useState(defaultForm);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const ITEMS_PER_PAGE = 15;

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  // Mutations
  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: () => { queryClient.invalidateQueries(['users']); setIsAddOpen(false); setFormData(defaultForm); },
    onError: (err) => alert(err.message)
  });
  
  const updateMut = useMutation({
    mutationFn: updateUser,
    onSuccess: () => { queryClient.invalidateQueries(['users']); setIsEditOpen(false); },
    onError: (err) => alert(err.message)
  });

  const resetPasswordMut = useMutation({
    mutationFn: async ({ id, password }) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to update password");
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

  const verifyMut = useMutation({
    mutationFn: verifyUser,
    onSuccess: () => queryClient.invalidateQueries(['users'])
  });

  const bulkDeleteMut = useMutation({
    mutationFn: bulkDeleteUsersFn,
    onSuccess: () => { queryClient.invalidateQueries(['users']); setSelectedIds([]); },
    onError: (err) => alert(err.message)
  });

  const deleteMut = useMutation({
    mutationFn: deleteUserFn,
    onSuccess: () => queryClient.invalidateQueries(['users'])
  });

  const handleAddSubmit = (finalData) => { 
    createMut.mutate(finalData); 
  };
  
  const handleEditSubmit = (finalData) => { 
    const payload = { ...finalData };
    if (!payload.password || !payload.password.trim()) {
      delete payload.password;
    }
    updateMut.mutate({ 
      id: selectedUser?.id, 
      data: payload 
    }); 
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setEditData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      phone: user.phone || '',
      address: user.address || '',
      image: user.image || null, 
      isActive: user.isActive,
      password: ''
    });
    setIsEditOpen(true);
  };

  const openResetPassword = (user) => {
    setSelectedUser(user);
    setPasswordError('');
    setPasswordSuccess('');
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }
    resetPasswordMut.mutate({ id: selectedUser?.id, password: newPassword });
  };

  // Filter Logic
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [search, statusFilter, viewMode]);

  const filteredUsers = useMemo(() => {
    return users?.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'ACTIVE' && !u.isActive) return false;
        if (statusFilter === 'INACTIVE' && u.isActive) return false;
        if (statusFilter === 'PENDING' && u.emailVerified) return false; // Approximation for Pending Approval
      }
      return true;
    }) || [];
  }, [users, search, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    if (!users) return { total: 0, active: 0, pending: 0, leave: 0 };
    return {
      total: users.length,
      active: users.filter(u => u.isActive && u.emailVerified).length,
      pending: users.filter(u => !u.emailVerified).length,
      leave: users.filter(u => !u.isActive && u.emailVerified).length, // mockup logic
    };
  }, [users]);

  const totalPages = Math.ceil((filteredUsers?.length || 0) / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Header */}
      <ExecutivesHeader onAddClick={() => { setFormData(defaultForm); setIsAddOpen(true); }} />

      {/* Stats Cards */}
      <ExecutivesStats stats={stats} />

      {/* Main Table Area */}
      <div className="bg-white border rounded-xl shadow-sm">
        {/* Filters Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-danger/5 border-b border-danger/10 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-danger">{selectedIds.length} users selected</span>
            <button 
              onClick={() => {
                if(confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
                  bulkDeleteMut.mutate(selectedIds);
                }
              }}
              disabled={bulkDeleteMut.isPending}
              className="bg-danger text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-danger/90 transition-colors"
            >
              {bulkDeleteMut.isPending ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        )}
        <ExecutivesFilters search={search} setSearch={setSearch} statusFilter={statusFilter} setStatusFilter={setStatusFilter} viewMode={viewMode} setViewMode={setViewMode} />

        {/* Table */}
        {viewMode === "list" ? (
          <UsersTable users={paginatedUsers} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} isLoading={isLoading} onVerify={(id) => verifyMut.mutate(id)} onEdit={openEdit} onResetPassword={openResetPassword} onDelete={(id) => deleteMut.mutate(id)} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
        ) : (
          <UsersGrid users={paginatedUsers} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} isLoading={isLoading} onVerify={(id) => verifyMut.mutate(id)} onEdit={openEdit} onResetPassword={openResetPassword} onDelete={(id) => deleteMut.mutate(id)} />
        )}
      </div>

      <UserFormDialog
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        onSubmit={handleAddSubmit}
        data={formData}
        setData={setFormData}
        title="Staff Information"
        isPending={createMut.isPending}
        isEdit={false}
      />

      <UserFormDialog
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onSubmit={handleEditSubmit}
        data={editData}
        setData={setEditData}
        title="Staff Information"
        isPending={updateMut.isPending}
        isEdit={true}
      />

      {/* Admin Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Change Staff Password</DialogTitle>
            <DialogDescription>
              Set a new password for <span className="font-semibold text-foreground">{selectedUser?.name}</span>. The executive will use this new password to sign in.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordResetSubmit} className="space-y-4 pt-2">
            {passwordError && (
              <div className="bg-danger/10 text-danger p-3 rounded-md text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="bg-success/10 text-success p-3 rounded-md text-sm">{passwordSuccess}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="staff-new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="staff-new-password"
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
                disabled={resetPasswordMut.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMut.isPending}
                className="bg-primary hover:bg-brand-dark text-primary-foreground"
              >
                {resetPasswordMut.isPending ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Executives
