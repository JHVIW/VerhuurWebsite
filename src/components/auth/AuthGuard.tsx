import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../lib/store';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}