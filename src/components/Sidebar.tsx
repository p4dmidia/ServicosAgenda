import React, { useState } from 'react';
import { ScreenType, Tenant } from '../types';
import { APP_IMAGES } from '../data/mockData';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './common/BrandLogo';
import { mapDbTenantToAppTenant } from '../services/tenantService';

interface SidebarProps {
  currentScreen: ScreenType;
  appointmentsCount?: number;
  onSelectScreen?: (screen: ScreenType) => void;
  onNavigate?: (screen: ScreenType) => void;
  isOpenMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile: () => void;
  onOpenNewAppointment?: () => void;
}

interface NavItem {
  id: ScreenType;
  label: string;
  icon: string;
  badge?: string | number;
  hasDot?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  appointmentsCount,
  onSelectScreen,
  onNavigate,
  isOpenMobile,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { tenants, activeTenant, switchTenant, isImpersonating, returnToSuperAdmin } = useTenant();
  const { isSuperAdmin, tenantMemberships, activeMembership, setActiveTenantId } = useAuth();
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);

  // Filter available tenants: Super admin sees all tenants; regular users see only their memberships
  const userMembershipsTenants: Tenant[] = tenantMemberships
    .map((m) => (m.tenants ? mapDbTenantToAppTenant(m.tenants) : null))
    .filter((t): t is Tenant => Boolean(t));

  const availableTenants: Tenant[] = isSuperAdmin
    ? tenants
    : userMembershipsTenants.length > 0
    ? userMembershipsTenants
    : [activeTenant];

  const canSwitchTenants = isSuperAdmin || availableTenants.length > 1;

  const NAV_ITEMS: NavItem[] = [
    { id: 'visao-geral', label: 'Visão Geral', icon: 'grid_view' },
    { 
      id: 'agenda', 
      label: 'Agenda', 
      icon: 'calendar_today', 
      badge: appointmentsCount !== undefined ? (appointmentsCount > 0 ? appointmentsCount : undefined) : undefined 
    },
    { id: 'agendamento-online', label: 'Agendamento Online', icon: 'public', badge: 'Link' },
    { id: 'clientes', label: 'Clientes', icon: 'groups' },
    { id: 'profissionais', label: 'Profissionais', icon: 'badge' },
    { id: 'servicos', label: 'Serviços', icon: 'spa' },
    { id: 'whatsapp', label: 'WhatsApp Pro', icon: 'chat', hasDot: true },
    { id: 'agente-ia', label: 'Agente IA WhatsApp', icon: 'smart_toy', badge: 'IA' },
    { id: 'financeiro', label: 'Financeiro', icon: 'account_balance' },
    { id: 'pagamentos', label: 'Gateway Pix', icon: 'payments' },
    { id: 'marketing', label: 'Marketing', icon: 'campaign' },
    { id: 'fidelidade', label: 'Fidelidade & Cashback', icon: 'loyalty' },
    { id: 'clube-de-assinatura', label: 'Clube Assinatura', icon: 'card_membership' },
    { id: 'estoque', label: 'Estoque & Insumos', icon: 'inventory_2' },
    { id: 'afiliados', label: 'Parceiros & Afiliados', icon: 'share' },
    { id: 'relatorios', label: 'Relatórios', icon: 'bar_chart' },
  ];

  // Only super admins see the Super Admin SaaS portal in the sidebar
  if (isSuperAdmin) {
    NAV_ITEMS.push({ id: 'super-admin', label: 'Super Admin (SaaS)', icon: 'admin_panel_settings' });
  }

  const isMobile = isOpenMobile ?? isMobileOpen ?? false;
  const handleSelectScreen = (screen: ScreenType) => {
    if (onSelectScreen) onSelectScreen(screen);
    else if (onNavigate) onNavigate(screen);
    onCloseMobile();
  };

  const currentCompanyName = activeMembership?.tenants?.name || activeTenant.name;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          id="sidebar-mobile-backdrop"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed left-0 top-0 h-screen w-64 bg-[#283044] z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.15)] transition-transform duration-300 ${
          isMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand */}
          <div className="h-[3.75rem] flex items-center justify-between px-4 gap-2 border-b border-white/5">
            <BrandLogo variant="dark" size="sm" showTagline={false} />
            <button
              id="sidebar-close-mobile-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#ccc3d8] hover:text-white rounded"
            >
              <span className="material-symbols-outlined text-[1.25rem]">close</span>
            </button>
          </div>

          {/* Impersonation Banner if viewing as clinic */}
          {isImpersonating && (
            <div className="mx-3 mt-3 p-2 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-between text-xs text-amber-200">
              <span className="font-medium">Modo Impersonate</span>
              <button
                onClick={() => returnToSuperAdmin(handleSelectScreen)}
                className="font-bold underline hover:text-white"
              >
                Voltar Admin
              </button>
            </div>
          )}

          {/* Clinic Switcher with Dropdown */}
          <div className="px-3 py-3 relative">
            <div
              id="clinic-unit-selector"
              onClick={() => {
                if (canSwitchTenants) {
                  setIsTenantDropdownOpen(!isTenantDropdownOpen);
                }
              }}
              className={`flex items-center justify-between p-2 rounded-lg bg-white/10 text-[#eef0ff] ${
                canSwitchTenants ? 'cursor-pointer hover:bg-white/15' : 'cursor-default'
              } transition-colors group border border-white/5`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: activeTenant.settings?.primaryColor || '#7c3aed' }}
                >
                  <span className="material-symbols-outlined text-[1.125rem]">
                    {activeTenant.type === 'barbearia'
                      ? 'content_cut'
                      : activeTenant.type === 'estetica'
                      ? 'spa'
                      : 'storefront'}
                  </span>
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-sm text-[#eef0ff] truncate font-medium leading-tight">
                    {currentCompanyName}
                  </span>
                  <span className="text-[0.6875rem] text-[#ccbeff] truncate font-medium capitalize">
                    {activeTenant.type} • {activeTenant.plan}
                  </span>
                </div>
              </div>
              {canSwitchTenants && (
                <span className="material-symbols-outlined text-[#ccc3d8] text-[1.25rem] group-hover:text-white transition-colors">
                  unfold_more
                </span>
              )}
            </div>

            {/* Dropdown Menu */}
            {isTenantDropdownOpen && canSwitchTenants && (
              <div
                className="absolute left-3 right-3 top-14 mt-1 bg-[#1e2333] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-100"
              >
                <span className="px-2 py-1 text-[0.6875rem] font-bold text-[#ccbeff] uppercase tracking-wider">
                  Alternar Empresa
                </span>

                {availableTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isSuperAdmin) {
                        switchTenant(t.id);
                      } else {
                        setActiveTenantId(t.id);
                        switchTenant(t.id);
                      }
                      setIsTenantDropdownOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                      t.id === activeTenant.id
                        ? 'bg-[#7c3aed] text-white font-semibold'
                        : 'text-[#eef0ff] hover:bg-white/10'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-medium truncate">{t.name}</span>
                      <span className="text-[0.625rem] opacity-75 capitalize">{t.type}</span>
                    </div>
                    {t.id === activeTenant.id && (
                      <span className="material-symbols-outlined text-[1rem]">check</span>
                    )}
                  </button>
                ))}

                {isSuperAdmin && (
                  <>
                    <div className="my-1 border-t border-white/10"></div>
                    <button
                      onClick={() => {
                        handleSelectScreen('super-admin');
                        setIsTenantDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-lg text-amber-300 hover:bg-white/10 text-xs font-semibold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[1.125rem]">admin_panel_settings</span>
                      👑 Painel Super Admin
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-3 flex flex-col gap-0.5 pb-4">
            {NAV_ITEMS.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleSelectScreen(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors w-full ${
                    isActive
                      ? 'bg-[#7c3aed] text-white font-medium shadow-sm'
                      : 'text-[#ccc3d8] hover:bg-white/10 hover:text-[#eef0ff]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[1.25rem]">
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#6e3aca] text-white text-[0.6875rem] font-semibold leading-none">
                      {item.badge}
                    </span>
                  )}

                  {item.hasDot && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Settings & Support */}
        <div className="p-3 flex flex-col gap-0.5 bg-[#283044] border-t border-white/5">
          <button
            id="nav-item-configuracoes"
            onClick={() => handleSelectScreen('configuracoes')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentScreen === 'configuracoes'
                ? 'bg-[#7c3aed] text-white font-medium'
                : 'text-[#ccc3d8] hover:bg-white/10 hover:text-[#eef0ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">settings</span>
            <span className="text-sm">Configurações</span>
          </button>
          <button
            id="nav-item-ajuda-e-suporte"
            onClick={() => handleSelectScreen('ajuda-e-suporte')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentScreen === 'ajuda-e-suporte'
                ? 'bg-[#7c3aed] text-white font-medium'
                : 'text-[#ccc3d8] hover:bg-white/10 hover:text-[#eef0ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[1.25rem]">help_outline</span>
            <span className="text-sm">Ajuda e Suporte</span>
          </button>
        </div>
      </aside>
    </>
  );
};
