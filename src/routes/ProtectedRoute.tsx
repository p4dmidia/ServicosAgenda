import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLoadingSplash } from '../components/auth/AuthLoadingSplash';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'super_admin' | 'tenant_member' | 'client';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { user, loading, isSuperAdmin, tenantMemberships, clientProfile } = useAuth();
  const location = useLocation();

  // 1. Enquanto loading for true, mostra o AuthLoadingSplash
  if (loading) {
    return <AuthLoadingSplash />;
  }

  // 2. Se não houver sessão, redireciona pra /login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Se houver sessão mas o papel não bater com o exigido pela rota,
  // redireciona pra / (deixa o RoleRedirect decidir de novo)
  // Nunca deixa a pessoa ver a casca de um portal que não é dela.
  if (allowedRole) {
    if (allowedRole === 'super_admin' && !isSuperAdmin) {
      return <Navigate to="/" replace />;
    }

    if (allowedRole === 'tenant_member' && tenantMemberships.length === 0) {
      return <Navigate to="/" replace />;
    }

    if (allowedRole === 'client' && !clientProfile) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
