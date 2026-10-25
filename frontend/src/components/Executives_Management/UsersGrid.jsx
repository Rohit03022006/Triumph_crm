import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Edit, UserX, User, Mail, Phone, Briefcase, Lock } from "lucide-react";
import { useNavigate } from "react-router";

const UsersGrid = ({ users, totalPages, currentPage, onPageChange, isLoading, onVerify, onEdit, onResetPassword, onDelete }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No users found.</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => navigate(`/admin/users/${user.id}`)}
            className="group relative bg-white border border-border/40 hover:border-border/80 rounded-xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
          >
            {/* Status Badge Absolute */}
            <div className={`absolute top-4 left-4 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider
              ${user.emailVerified ? (user.isActive ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger/10 text-danger') : 'border-warning/30 bg-warning/10 text-warning'}
            `}>
              {!user.emailVerified ? 'Pending' : (user.isActive ? 'Active' : 'Inactive')}
            </div>

            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm mb-3 mt-4">
              {user.image && <AvatarImage src={user.image} alt={user.name} className="object-cover" />}
              <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xl">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            <h3 className="font-semibold text-foreground truncate w-full px-2">{user.name}</h3>
            <p className="text-xs text-primary font-medium mb-3">{user.role}</p>

            <div className="w-full space-y-2 mt-2 pt-4 border-t border-border/40 text-left text-xs text-muted-foreground">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{user.phone || 'N/A'}</span>
              </div>

            </div>

            {/* Quick Actions (Appear on Hover) */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              {!user.emailVerified && (
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm border text-warning hover:text-warning hover:bg-warning/10" onClick={() => onVerify(user.id)} title="Verify">
                  <ShieldCheck className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => onEdit(user)} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
              {onResetPassword && (
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm border text-foreground/70 hover:text-primary hover:bg-primary/10" onClick={() => onResetPassword(user)} title="Change Password">
                  <Lock className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-white shadow-sm border text-danger hover:text-danger hover:bg-danger/10" onClick={() => {
                if (confirm("Are you sure you want to completely delete this user?")) onDelete(user.id);
              }} title="Delete">
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 mt-auto border-t border-border/40 bg-white">
          <p className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersGrid;
