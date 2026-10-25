import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';

const fetchMe = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      return null;
    }
    
    const json = await response.json();
    return json.data;
  } catch (e) {
    return null;
  }
};

const GuestRoute = ({ children }) => {
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['me'], 
    queryFn: fetchMe,
    retry: false
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If user IS logged in, redirect them directly to the dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, let them see the public page (Landing, Login, etc)
  return children ? children : <Outlet />;
};

export default GuestRoute;
