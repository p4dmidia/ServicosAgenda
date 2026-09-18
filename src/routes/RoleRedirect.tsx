import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLoadingSplash } from '../components/auth/AuthLoadingSplash';
import { LandingPageView } from '../components/landing/LandingPageView';

export const RoleRedirect: React.FC = () => {
  const { user, loading, isSuperAdmin, tenantMemberships, clientProfile } = useAuth();

  if (loading) {
    return <AuthLoadingSplash />;
  }

  if (!user) {
    return <LandingPageView />;
  }

  // 1. isSuperAdmin → /admin
  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // 2. tenantMemberships.length > 0 ou conta do tipo empresa → /app
  const isClientAccount = user?.user_metadata?.account_type === 'cliente';
  if (tenantMemberships.length > 0 || (!isClientAccount && !clientProfile)) {
    return <Navigate to="/app" replace />;
  }

  // 3. clientProfile existir ou conta do tipo cliente → /portal
  if (clientProfile || isClientAccount) {
    return <Navigate to="/portal" replace />;
  }

  // 4. Senão, mostrar tela de "conta sem acesso vinculado"
  return <Navigate to="/sem-acesso" replace />;
};
