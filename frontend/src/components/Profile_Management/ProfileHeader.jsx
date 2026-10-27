import React from 'react';
import { useNavigate } from 'react-router';

const ProfileHeader = ({ user }) => {
  const navigate = useNavigate();
  const dashPath = user?.role === 'ADMIN' ? '/admin' : '/executive';

  return (
    <div className="flex flex-col gap-1 pb-2 border-b border-border/70">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        <span
          className="cursor-pointer hover:text-slate-900 transition-colors"
          onClick={() => navigate(dashPath)}
        >
          Dashboard
        </span>
        <span>›</span>
        <span className="font-bold text-slate-800">My Profile</span>
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          User Profile
        </h1>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          {user?.role || "Account"}
        </span>
      </div>
      <p className="text-sm text-slate-500 mt-0.5">
        Manage personal information, contact numbers, and profile photo.
      </p>
    </div>
  );
};

export default ProfileHeader;
