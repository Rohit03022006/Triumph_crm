import React, { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ExecutivesHeader from '../../components/Executives_Management/ExecutivesHeader'
import ExecutivesStats from '../../components/Executives_Management/ExecutivesStats'
import ExecutivesFilters from '../../components/Executives_Management/ExecutivesFilters'
import UserFormDialog from '../../components/Executives_Management/UserFormDialog'
import UsersTable from '../../components/Executives_Management/UsersTable'
import UsersGrid from '../../components/Executives_Management/UsersGrid'


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
    updateMut.mutate({ 
      id: selectedUser?.id, 
      data: finalData 
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
      isActive: user.isActive 
    });
    setIsEditOpen(true);
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
          <UsersTable users={paginatedUsers} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} isLoading={isLoading} onVerify={(id) => verifyMut.mutate(id)} onEdit={openEdit} onDelete={(id) => deleteMut.mutate(id)} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
        ) : (
          <UsersGrid users={paginatedUsers} totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} isLoading={isLoading} onVerify={(id) => verifyMut.mutate(id)} onEdit={openEdit} onDelete={(id) => deleteMut.mutate(id)} />
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
    </div>
  );
}

export default Executives
