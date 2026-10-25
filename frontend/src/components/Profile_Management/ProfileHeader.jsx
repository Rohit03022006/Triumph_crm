import React from 'react';
import { useNavigate } from 'react-router';

const ProfileHeader = ({ user }) => {
  const navigate = useNavigate();
  const dashPath = user?.role === 'ADMIN' ? '/admin' : '/executive';

  return (
    <div className="flex flex-col mb-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span
          className="cursor-pointer hover:text-foreground"
          onClick={() => navigate(dashPath)}
        >
          Dashboard
        </span>
        <span>›</span>
        <span className="font-medium text-foreground">My Profile</span>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">My Profile</h2>
      </div>
    </div>
  );
};

export default ProfileHeader;
