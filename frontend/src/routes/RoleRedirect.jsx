import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useQuery } from '@tanstack/react-query';

const fetchMe = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
    credentials: 'include', 
  });
  
  if (!response.ok) {
    throw new Error('Not authenticated');
  }
  
  const json = await response.json();
  return json.data; 
};

/**
 * Ensures the user is logged in. 
 * If they try to access the generic "/dashboard" path, it routes them to their specific role dashboard.
 */
const RoleRedirect = ({ children, requireRole }) => {
  const location = useLocation();
  const { data: user, isLoading, error } = useQuery({ 
    queryKey: ['me'], 
    queryFn: fetchMe,
    retry: false
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If not logged in, redirect to login
  if (error || !user) {
    return <Navigate to="/login" replace />;
  }

  // If they are on a generic route that should redirect to their role home
  if (location.pathname === "/dashboard") {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/executive" replace />;
  }

  // If this route requires a specific role and they don't have it
  if (requireRole && user.role !== requireRole) {
    // send them to their own root dashboard
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/executive" replace />;
  }

  return children;
};

export default RoleRedirect;
