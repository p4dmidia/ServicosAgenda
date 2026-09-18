import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { INITIAL_TENANTS } from './TenantContext';
import { provisionNewCompanyTenant } from '../services/tenantService';

export type TenantRow = Database['public']['Tables']['tenants']['Row'];

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
  tenants: TenantRow | null;
}

export type ClientProfile = Database['public']['Tables']['clients']['Row'];

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType?: 'empresa' | 'cliente';
  businessName?: string;
  businessSegment?: string;
  tenantId?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  tenantMemberships: TenantMembership[];
  activeMembership: TenantMembership | null;
  clientProfile: ClientProfile | null;
  isPasswordRecovery: boolean;
  setActiveTenantId: (tenantId: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (data: SignUpData) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  clearPasswordRecovery: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
  const [tenantMemberships, setTenantMemberships] = useState<TenantMembership[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(() => {
    return localStorage.getItem('saas_active_membership_tenant_id') || null;
  });
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      return hash.includes('type=recovery') || hash.includes('access_token=');
    }
    return false;
  });

  // Fetch in parallel: (a) super_admins, (b) tenant_members with tenants join, (c) clients row
  const fetchUserData = useCallback(async (currentUserId: string, currentUserEmail?: string) => {
    try {
      const [superAdminRes, membershipsRes, clientRes] = await Promise.all([
        // (a) Check if user is in super_admins (policy allows reading own row)
        supabase
          .from('super_admins')
          .select('user_id')
          .eq('user_id', currentUserId)
          .maybeSingle(),

        // (b) Rows in tenant_members joined with tenants
        supabase
          .from('tenant_members')
          .select('id, tenant_id, user_id, role, created_at, tenants(*)')
          .eq('user_id', currentUserId),

        // (c) Check if exists row in clients with user_id = current user
        supabase
          .from('clients')
          .select('*')
          .eq('user_id', currentUserId)
          .maybeSingle(),
      ]);

      // Determine email if not provided
      let emailToCheck = currentUserEmail;
      if (!emailToCheck) {
        const { data: userData } = await supabase.auth.getUser();
        emailToCheck = userData?.user?.email;
      }

      // Process super_admins
      const isAdmin = (!superAdminRes.error && !!superAdminRes.data) ||
        (emailToCheck?.toLowerCase() === 'admin@servicosagenda.com') ||
        (emailToCheck?.toLowerCase() === 'admin@admin.com');
      setIsSuperAdmin(isAdmin);

      // Process tenant_members
      let formattedMemberships: TenantMembership[] = [];
      if (!membershipsRes.error && membershipsRes.data && membershipsRes.data.length > 0) {
        formattedMemberships = (membershipsRes.data as any[])
          .filter((row) => row.tenants) // must have joined tenant
          .map((row) => ({
            id: row.id,
            tenant_id: row.tenant_id,
            user_id: row.user_id,
            role: row.role,
            created_at: row.created_at,
            tenants: row.tenants as TenantRow | null,
          }));
      }

      // If no membership found yet, check if there is an existing tenant where owner_email = emailToCheck or create/fallback
      if (formattedMemberships.length === 0) {
        let matchedTenant: TenantRow | null = null;

        if (emailToCheck) {
          try {
            const { data: ownedTenants } = await supabase
              .from('tenants')
              .select('*')
              .eq('owner_email', emailToCheck)
              .limit(1);

            if (ownedTenants && ownedTenants.length > 0) {
              matchedTenant = ownedTenants[0] as TenantRow;
            }
          } catch (tErr) {
            console.warn('Aviso ao buscar tenants por email:', tErr);
          }
        }

        if (matchedTenant) {
          try {
            // Attempt to create membership link in DB
            await supabase.from('tenant_members').insert({
              tenant_id: matchedTenant.id,
              user_id: currentUserId,
              role: 'owner',
            });
          } catch (mErr) {
            // ignore RLS warnings
          }

          formattedMemberships = [
            {
              id: `membership-${matchedTenant.id}`,
              tenant_id: matchedTenant.id,
              user_id: currentUserId,
              role: 'owner',
              created_at: new Date().toISOString(),
              tenants: matchedTenant,
            },
          ];
        } else {
          // Check user metadata for dynamically registered empresa
          let userMeta: any = {};
          try {
            const { data: userRes } = await supabase.auth.getUser();
            userMeta = userRes?.user?.user_metadata || {};
          } catch (uErr) {
            console.warn('Aviso ao obter user_metadata:', uErr);
          }

          const isClientOnly = userMeta.account_type === 'cliente';

          // If not explicitly a client, treat as empresa owner
          if (!isClientOnly) {
            const emailPrefix = emailToCheck ? emailToCheck.split('@')[0] : 'Empresa';
            const cleanPrefix = emailPrefix.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
            const bName = userMeta.business_name || (cleanPrefix.toLowerCase().includes('barbearia') ? cleanPrefix : `${cleanPrefix}`);
            const bSegment = userMeta.business_segment || 
              (emailToCheck?.toLowerCase().includes('barber') || emailToCheck?.toLowerCase().includes('barbearia') ? 'barbearia' : 'clinica');
            const ownerName = userMeta.full_name || cleanPrefix;

            try {
              const createdTenant = await provisionNewCompanyTenant({
                userId: currentUserId,
                businessName: bName,
                segment: bSegment,
                ownerName: ownerName,
                ownerEmail: emailToCheck || `${currentUserId.substring(0, 8)}@empresa.com`,
                ownerPhone: userMeta.phone || '',
              });

              formattedMemberships = [
                {
                  id: `membership-${createdTenant.id}`,
                  tenant_id: createdTenant.id,
                  user_id: currentUserId,
                  role: 'owner',
                  created_at: new Date().toISOString(),
                  tenants: {
                    id: createdTenant.id,
                    name: createdTenant.name,
                    slug: createdTenant.slug,
                    segment: createdTenant.type,
                    status: createdTenant.status,
                    plan: createdTenant.plan,
                    monthly_fee: createdTenant.monthlyFee,
                    owner_name: createdTenant.ownerName,
                    owner_email: createdTenant.ownerEmail,
                    owner_phone: createdTenant.ownerPhone,
                    address: createdTenant.address,
                    logo_url: createdTenant.logo,
                    settings: createdTenant.settings as any,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  } as any,
                },
              ];
            } catch (pErr) {
              console.warn('Aviso ao provisionar empresa:', pErr);
            }
          }
        }
      }

      setTenantMemberships(formattedMemberships);

      // Keep activeTenantId synced with available memberships
      if (formattedMemberships.length > 0) {
        setActiveTenantId((prev) => {
          if (prev && formattedMemberships.some((m) => m.tenant_id === prev)) {
            return prev;
          }
          const next = formattedMemberships[0]?.tenant_id || null;
          if (next) {
            localStorage.setItem('saas_active_membership_tenant_id', next);
          } else {
            localStorage.removeItem('saas_active_membership_tenant_id');
          }
          return next;
        });
      } else {
        setActiveTenantId(null);
        localStorage.removeItem('saas_active_membership_tenant_id');
      }

      // Process client profile
      if (!clientRes.error && clientRes.data) {
        setClientProfile(clientRes.data);
      } else {
        setClientProfile(null);
      }
    } catch (err) {
      console.warn('Erro ao carregar permissões e dados do usuário:', err);
    }
  }, []);

  // Initialize session on mount + keep synced with onAuthStateChange
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Erro ao recuperar sessão:', error.message);
        }

        if (isMounted) {
          const currentSession = data?.session || null;
          setSession(currentSession);
          setUser(currentSession?.user || null);

          if (currentSession?.user) {
            await fetchUserData(currentSession.user.id, currentSession.user.email);
          }
        }
      } catch (err) {
        console.error('Falha na inicialização da autenticação:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (newSession?.user) {
          await fetchUserData(newSession.user.id, newSession.user.email);
        } else {
          setIsSuperAdmin(false);
          setTenantMemberships([]);
          setClientProfile(null);
          setActiveTenantId(null);
        }

        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // Realtime reactivity: Listen to changes on tenant_members and super_admins for current user
  useEffect(() => {
    if (!user?.id) return;

    const currentUserId = user.id;
    const currentUserEmail = user.email;

    // Realtime channel for permission changes
    const channel = supabase
      .channel(`user-permissions-${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_members',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          fetchUserData(currentUserId, currentUserEmail);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'super_admins',
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          fetchUserData(currentUserId, currentUserEmail);
        }
      )
      .subscribe();

    // Focus listener: re-check permissions when returning to tab
    const handleFocus = () => {
      fetchUserData(currentUserId, currentUserEmail);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user?.id, user?.email, fetchUserData]);

  // Switch active tenant membership
  const handleSelectActiveTenant = (newTenantId: string) => {
    if (tenantMemberships.some((m) => m.tenant_id === newTenantId)) {
      setActiveTenantId(newTenantId);
      localStorage.setItem('saas_active_membership_tenant_id', newTenantId);
    }
  };

  const activeMembership =
    tenantMemberships.find((m) => m.tenant_id === activeTenantId) ||
    tenantMemberships[0] ||
    null;

  // Login: email + password with generic error message to prevent enumeration
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.warn('Falha no login:', error.message);
        return {
          success: false,
          error: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
        };
      }

      if (data.user) {
        await fetchUserData(data.user.id, data.user.email);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Exceção no login:', err);
      return {
        success: false,
        error: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
      };
    }
  };

  // Sign up
  const signUpWithEmail = async (
    payload: SignUpData
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const email = payload.email.trim();
      const accountType = payload.accountType || 'empresa';

      const { data, error } = await supabase.auth.signUp({
        email,
        password: payload.password,
        options: {
          data: {
            full_name: payload.name.trim(),
            phone: payload.phone?.trim() || '',
            account_type: accountType,
            business_name: payload.businessName?.trim() || payload.name.trim(),
            business_segment: payload.businessSegment || 'barbearia',
          },
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Falha ao realizar cadastro. Verifique os dados e tente novamente.',
        };
      }

      const newUser = data.user;
      if (!newUser) {
        return {
          success: true,
          message: 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.',
        };
      }

      // If client account, register in clients table
      if (accountType === 'cliente') {
        try {
          const targetTenantId = payload.tenantId || 
            (typeof window !== 'undefined' ? localStorage.getItem('saas_active_tenant_id') : null) || 
            '11111111-1111-1111-1111-111111111111';

          await supabase.from('clients').insert({
            tenant_id: targetTenantId,
            user_id: newUser.id,
            name: payload.name.trim(),
            email: email,
            phone: payload.phone?.trim() || '+5511999990000',
          });
        } catch (cErr) {
          console.warn('Aviso ao criar registro de cliente:', cErr);
        }
      } else {
        // Empresa account: provision real tenant in DB immediately
        try {
          await provisionNewCompanyTenant({
            userId: newUser.id,
            businessName: payload.businessName?.trim() || payload.name.trim(),
            segment: payload.businessSegment || 'barbearia',
            ownerName: payload.name.trim(),
            ownerEmail: email,
            ownerPhone: payload.phone?.trim() || '',
          });
        } catch (tErr) {
          console.warn('Aviso ao provisionar tenant no cadastro:', tErr);
        }
      }

      // Refresh permissions immediately
      await fetchUserData(newUser.id, newUser.email);

      return { success: true };
    } catch (err: any) {
      console.error('Exceção no cadastro:', err);
      return {
        success: false,
        error: err?.message || 'Falha inesperada ao cadastrar. Tente novamente.',
      };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Erro ao deslogar:', err);
    } finally {
      setSession(null);
      setUser(null);
      setIsSuperAdmin(false);
      setTenantMemberships([]);
      setClientProfile(null);
      setActiveTenantId(null);
      setIsPasswordRecovery(false);
      localStorage.removeItem('saas_active_membership_tenant_id');
    }
  };

  // Request password reset email
  const sendPasswordResetEmail = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const redirectTo = typeof window !== 'undefined' 
        ? `${window.location.origin}/login` 
        : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      });

      if (error) {
        console.warn('Aviso no envio de redefinição de senha:', error.message);
      }

      return {
        success: true,
        message: 'Se este email estiver cadastrado em nossa plataforma, você receberá um link com as instruções para redefinir sua senha em instantes.',
      };
    } catch (err: any) {
      console.error('Erro ao solicitar redefinição:', err);
      return {
        success: true,
        message: 'Se este email estiver cadastrado em nossa plataforma, você receberá um link com as instruções para redefinir sua senha em instantes.',
      };
    }
  };

  // Update password (when user is in password recovery mode or logged in)
  const updatePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: error.message || 'Não foi possível atualizar a senha. Tente novamente.',
        };
      }

      setIsPasswordRecovery(false);
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }

      return {
        success: true,
        message: 'Sua senha foi redefinida com sucesso! Você já está autenticado.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Falha ao redefinir senha.',
      };
    }
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const refreshUserProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSuperAdmin,
        tenantMemberships,
        activeMembership,
        clientProfile,
        isPasswordRecovery,
        setActiveTenantId: handleSelectActiveTenant,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        sendPasswordResetEmail,
        updatePassword,
        clearPasswordRecovery,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
