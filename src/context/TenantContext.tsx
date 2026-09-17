import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Tenant, ScreenType } from '../types';
import {
  fetchTenantsFromSupabase,
  createTenantInSupabase,
  updateTenantInSupabase,
} from '../services/tenantService';
import { checkSupabaseConnection } from '../lib/supabase';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Clínica Bella Vita - Estética Avançada',
    slug: 'bella-vita',
    type: 'clinica',
    status: 'ativo',
    plan: 'Pro',
    monthlyFee: 297.00,
    ownerName: 'Dra. Mariane Silveira',
    ownerEmail: 'mariane@bellavita.com.br',
    ownerPhone: '+55 11 98452-1100',
    address: 'Av. Paulista, 1200 - Sala 42, Bela Vista - São Paulo/SP',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=60',
    createdAt: '15/01/2026',
    activeProfessionalsCount: 2,
    activeAppointmentsCount: 14,
    settings: {
      allowSignalBooking: true,
      signalAmount: 50.00,
      primaryColor: '#7c3aed',
      reminderHoursBefore: [24, 2],
      segment: 'clinica',
    },
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Barbearia Dom Camilo',
    slug: 'dom-camilo',
    type: 'barbearia',
    status: 'ativo',
    plan: 'Ouro',
    monthlyFee: 197.00,
    ownerName: 'Camilo Augusto',
    ownerEmail: 'camilo@domcamilo.com.br',
    ownerPhone: '+55 11 97200-4411',
    address: 'Rua Augusta, 850, Consolação - São Paulo/SP',
    logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&auto=format&fit=crop&q=60',
    createdAt: '03/02/2026',
    activeProfessionalsCount: 1,
    activeAppointmentsCount: 9,
    settings: {
      allowSignalBooking: true,
      signalAmount: 25.00,
      primaryColor: '#b45309',
      reminderHoursBefore: [24, 1],
      segment: 'barbearia',
    },
  },
];

interface TenantContextType {
  tenants: Tenant[];
  activeTenant: Tenant;
  isImpersonating: boolean;
  isSupabaseConnected: boolean;
  isLoadingTenants: boolean;
  switchTenant: (tenantId: string) => void;
  switchTenantBySlug: (slug: string) => Tenant | undefined;
  getTenantBySlug: (slug: string) => Tenant | undefined;
  addTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'activeAppointmentsCount'> & { activeProfessionalsCount?: number }) => Tenant;
  updateTenant: (id: string, updates: Partial<Tenant>) => Promise<void>;
  toggleTenantStatus: (id: string) => Promise<void>;
  impersonateTenant: (id: string, onNavigate?: (screen: ScreenType) => void) => void;
  returnToSuperAdmin: (onNavigate?: (screen: ScreenType) => void) => void;
  refreshTenants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('saas_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('saas_active_tenant_id') || INITIAL_TENANTS[0].id;
  });

  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState<boolean>(false);

  // Sync with Supabase on mount
  const refreshTenants = useCallback(async () => {
    setIsLoadingTenants(true);
    try {
      const ping = await checkSupabaseConnection();
      setIsSupabaseConnected(ping.connected);

      if (ping.connected) {
        const remoteTenants = await fetchTenantsFromSupabase();
        if (remoteTenants && remoteTenants.length > 0) {
          setTenants(remoteTenants);
          // If current activeTenantId doesn't exist in remote, switch to first remote
          if (!remoteTenants.some(t => t.id === activeTenantId)) {
            setActiveTenantId(remoteTenants[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Falha ao sincronizar com Supabase:', err);
    } finally {
      setIsLoadingTenants(false);
    }
  }, [activeTenantId]);

  useEffect(() => {
    refreshTenants();
  }, []);

  useEffect(() => {
    localStorage.setItem('saas_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('saas_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0] || INITIAL_TENANTS[0];

  const switchTenant = (tenantId: string) => {
    const found = tenants.find((t) => t.id === tenantId);
    if (found) {
      setActiveTenantId(found.id);
    }
  };

  const getTenantBySlug = useCallback(
    (slug: string) => {
      const normalized = (slug || '').toLowerCase().trim();
      return tenants.find((t) => t.slug.toLowerCase() === normalized);
    },
    [tenants]
  );

  const switchTenantBySlug = useCallback(
    (slug: string) => {
      const found = getTenantBySlug(slug);
      if (found) {
        setActiveTenantId(found.id);
        return found;
      }
      return undefined;
    },
    [getTenantBySlug]
  );

  const addTenant = (
    tenantData: Omit<Tenant, 'id' | 'createdAt' | 'activeAppointmentsCount'> & { activeProfessionalsCount?: number }
  ): Tenant => {
    // Generate optimistic tenant
    const tempId = `temp-${Date.now()}`;
    const optimisticTenant: Tenant = {
      ...tenantData,
      id: tempId,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      activeAppointmentsCount: 0,
      activeProfessionalsCount: tenantData.activeProfessionalsCount || 0,
    };

    setTenants((prev) => [optimisticTenant, ...prev]);

    // Persist to Supabase
    createTenantInSupabase(tenantData)
      .then((created) => {
        setTenants((prev) =>
          prev.map((t) => (t.id === tempId ? created : t))
        );
        if (activeTenantId === tempId) {
          setActiveTenantId(created.id);
        }
      })
      .catch((err) => {
        console.error('Falha ao salvar tenant no Supabase:', err);
      });

    return optimisticTenant;
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    // Optimistic local update
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    // Sync with Supabase
    try {
      await updateTenantInSupabase(id, updates);
    } catch (err) {
      console.error('Falha ao atualizar tenant no Supabase:', err);
    }
  };

  const toggleTenantStatus = async (id: string) => {
    const target = tenants.find((t) => t.id === id);
    if (!target) return;

    const newStatus = target.status === 'ativo' ? 'suspenso' : 'ativo';

    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: newStatus } : t
      )
    );

    try {
      await updateTenantInSupabase(id, { status: newStatus });
    } catch (err) {
      console.error('Falha ao alternar status do tenant no Supabase:', err);
    }
  };

  const impersonateTenant = (id: string, onNavigate?: (screen: ScreenType) => void) => {
    switchTenant(id);
    setIsImpersonating(true);
    if (onNavigate) {
      onNavigate('visao-geral');
    }
  };

  const returnToSuperAdmin = (onNavigate?: (screen: ScreenType) => void) => {
    setIsImpersonating(false);
    if (onNavigate) {
      onNavigate('super-admin');
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenant,
        isImpersonating,
        isSupabaseConnected,
        isLoadingTenants,
        switchTenant,
        switchTenantBySlug,
        getTenantBySlug,
        addTenant,
        updateTenant,
        toggleTenantStatus,
        impersonateTenant,
        returnToSuperAdmin,
        refreshTenants,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
