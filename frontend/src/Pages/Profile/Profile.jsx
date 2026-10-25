import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileHeader from "@/components/Profile_Management/ProfileHeader";
import ProfileSidebar from "@/components/Profile_Management/ProfileSidebar";
import ProfileForm from "@/components/Profile_Management/ProfileForm";

const fetchMe = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, { credentials: 'include' });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return (await res.json()).data;
};

const updateMe = async (data) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error?.message || "Failed to update profile");
  }
  return res.json();
};

const Profile = () => {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    image: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        image: user.image || ''
      });
    }
  }, [user]);

  const updateMut = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries(['me']);
      alert("Profile updated successfully!");
    },
    onError: (err) => {
      alert(err.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMut.mutate(formData);
  };

  if (isLoading || !user) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <ProfileHeader user={user} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProfileSidebar user={user} formData={formData} setFormData={setFormData} />
        <ProfileForm 
          user={user} 
          formData={formData} 
          setFormData={setFormData} 
          handleSubmit={handleSubmit} 
          isPending={updateMut.isPending} 
        />
      </div>
    </div>
  );
};

export default Profile;
