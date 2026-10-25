import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserFormDialog from '../../components/Executives_Management/UserFormDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Phone, Mail, MapPin, Briefcase, Edit } from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  const { data: user, isLoading, isError, error } = useQuery({ 
    queryKey: ['user', id], 
    queryFn: () => fetchUser(id)
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${updatedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedUser),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setIsEditOpen(false);
    },
    onError: (err) => {
      alert("Error updating user: " + err.message);
    }
  });

  const handleEditClick = () => {
    if (user) {
      setEditData({ ...user });
      setIsEditOpen(true);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading user details...</div>;
  if (isError) return <div className="p-8 text-center text-danger">Error fetching user: {error.message}</div>;
  if (!user) return <div className="p-8 text-center text-danger">User not found</div>;

  return (
    <div className="bg-background min-h-screen  rounded-2xl space-y-6">
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
        <Button onClick={handleEditClick} className="bg-primary hover:bg-brand-dark text-primary-foreground">
          <Edit className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
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
    </div>
  );
};

export default UserDetail;
