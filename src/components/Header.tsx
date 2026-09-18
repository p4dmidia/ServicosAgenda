import React, { useState } from 'react';
import { ScreenType } from '../types';
import { APP_IMAGES } from '../data/mockData';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentScreen?: ScreenType;
  onOpenMobileMenu?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenNewAppointment: () => void;
  onOpenSearch?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenWhatsApp?: () => void;
  onNavigate?: (screen: ScreenType) => void;
  onTriggerToast: (message: string) => void;
}

const SCREEN_TITLES: Record<ScreenType, string> = {
  'visao-geral': 'Visão Geral',
  'agenda': 'Agenda do Dia',
  'clientes': 'Clientes & CRM',
  'profissionais': 'Equipe & Profissionais',
  'servicos': 'Catálogo de Serviços',
  'whatsapp': 'WhatsApp & Disparos',
  'agente-ia': 'Agente IA & Automações',
  'financeiro': 'Financeiro & Caixa',
  'pagamentos': 'Controle de Pagamentos',
  'marketing': 'Campanhas de Marketing',
  'fidelidade': 'Programa de Fidelidade',
  'clube-de-assinatura': 'Clube de Assinaturas',
  'afiliados': 'Parceiros & Afiliados',
  'estoque': 'Controle de Estoque',
  'relatorios': 'Relatórios Gerenciais',
  'configuracoes': 'Configurações do Sistema',
  'ajuda-e-suporte': 'Central de Ajuda e Suporte',
  'super-admin': 'Super Admin (Mariane)',
  'agendamento-online': 'Agendamento Online Público'
};

export const Header: React.FC<HeaderProps> = ({
  currentScreen = 'visao-geral',
  onOpenMobileMenu,
  onToggleMobileMenu,
  onOpenNewAppointment,
  onOpenSearch,
  onOpenCommandPalette,
  onOpenWhatsApp,
  onNavigate,
  onTriggerToast,
}) => {
  const { activeTenant, isImpersonating, returnToSuperAdmin, isSupabaseConnected } = useTenant();
  const { user, isSuperAdmin, signOut, tenantMemberships, activeMembership, setActiveTenantId } = useAuth();
  const handleToggleMobile = onOpenMobileMenu || onToggleMobileMenu || (() => {});
  const handleOpenSearch = onOpenSearch || onOpenCommandPalette || (() => {});
  const handleOpenWhatsApp = onOpenWhatsApp || (() => onNavigate?.('whatsapp'));
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);

  // Active company name: prefer activeMembership?.tenants?.name if available, else activeTenant.name
  const currentCompanyName = activeMembership?.tenants?.name || activeTenant.name;

  const notifications = [
    { id: 1, title: 'Confirmação recebida', desc: 'Ana Carolina confirmou horário das 09h', time: 'Há 5 min' },
    { id: 2, title: 'Lembrete enviado', desc: '18 mensagens automáticas entregues no WhatsApp', time: 'Há 25 min' },
    { id: 3, title: 'Estoque baixo', desc: 'Sérum Renovador com apenas 2 unidades', time: 'Há 1 hora' },
  ];

  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 lg:left-64 right-0 h-[3.75rem] bg-white/90 backdrop-blur-xl z-40 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]"
    >
      {/* Left side: Mobile Toggle, Active Tenant & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-menu-toggle-btn"
          onClick={handleToggleMobile}
          className="lg:hidden p-2 rounded-lg text-[#4a4455] hover:bg-[#eaedff] transition-colors"
          title="Abrir menu lateral"
        >
          <span className="material-symbols-outlined text-[1.5rem]">menu</span>
        </button>

        <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#4a4455]">
          {/* Active Tenant with Switcher if multiple memberships */}
          {tenantMemberships.length > 1 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#630ed4] font-semibold transition-colors border border-[#eaedff]"
                title="Alternar empresa ativa"
              >
                <span className="max-w-[140px] sm:max-w-[200px] truncate">
                  {currentCompanyName}
                </span>
                <span className="material-symbols-outlined text-[1rem]">expand_more</span>
              </button>

              {showTenantSwitcher && (
                <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#eaedff] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                    Suas Empresas Vinculadas
                  </div>
                  {tenantMemberships.map((m) => {
                    const isCurrent = m.tenant_id === (activeMembership?.tenant_id || activeTenant.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setActiveTenantId(m.tenant_id);
                          setShowTenantSwitcher(false);
                          onTriggerToast(`Alternado para ${m.tenants?.name || 'Empresa'}`);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-[#7c3aed] text-white font-medium'
                            : 'text-[#131b2e] hover:bg-[#f2f3ff]'
                        }`}
                      >
                        <div className="truncate">
                          <p className="text-xs font-semibold truncate">{m.tenants?.name || 'Empresa'}</p>
                          <p className={`text-[0.625rem] truncate capitalize ${isCurrent ? 'text-purple-100' : 'text-[#7b7487]'}`}>
                            Papel: {m.role}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-[1rem]">check</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <span className="hover:text-[#630ed4] transition-colors hidden sm:inline font-semibold text-[#630ed4]">
              {currentCompanyName}
            </span>
          )}

          <span className="text-[#ccc3d8] hidden sm:inline">/</span>
          <span className="text-[#131b2e] font-semibold">
            {SCREEN_TITLES[currentScreen] || 'Visão Geral'}
          </span>

          {isImpersonating && (
            <button
              onClick={() => returnToSuperAdmin(onNavigate)}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
              title="Encerrar visualização e voltar ao painel da Mariane"
            >
              <span className="material-symbols-outlined text-[0.875rem]">arrow_back</span>
              Voltar ao Super Admin
            </button>
          )}

          {/* Supabase Status Pill */}
          <div
            className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${
              isSupabaseConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={isSupabaseConnected ? 'Conectado ao Supabase em tempo real' : 'Conectando ao Supabase...'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>{isSupabaseConnected ? 'Supabase Conectado' : 'Supabase Sincronizando'}</span>
          </div>
        </nav>
      </div>

      {/* Right side: Search, Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search bar */}
        <div
          id="global-search-trigger"
          onClick={handleOpenSearch}
          className="relative hidden md:flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute left-3 text-[#7b7487] text-[1.25rem] group-hover:text-[#630ed4] transition-colors">
            search
          </span>
          <input
            readOnly
            className="h-10 w-64 lg:w-80 pl-10 pr-12 rounded-lg bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#7b7487] text-sm cursor-pointer focus:outline-none group-hover:bg-[#eaedff] transition-colors"
            placeholder="Buscar cliente, agendamento, serviço..."
            type="text"
          />
          <kbd className="absolute right-3 text-[0.6875rem] px-1.5 py-0.5 rounded bg-[#dae2fd] text-[#4a4455] font-semibold">
            ⌘K
          </kbd>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          {/* Mobile search button */}
          <button
            id="mobile-search-btn"
            onClick={handleOpenSearch}
            className="md:hidden p-2 rounded-lg text-[#4a4455] hover:bg-[#e2e7ff] transition-colors"
            title="Buscar"
          >
            <span className="material-symbols-outlined text-[1.25rem]">search</span>
          </button>

          {/* Notifications button */}
          <div className="relative">
            <button
              id="notifications-dropdown-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-[#4a4455] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
              type="button"
              title="Notificações"
            >
              <span className="material-symbols-outlined text-[1.25rem]">notifications</span>
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba1a1a] text-white text-[0.625rem] font-bold flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div
                id="notifications-popover"
                className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl border border-[#eaedff] p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]">
                  <span className="font-semibold text-sm text-[#131b2e]">Notificações (3)</span>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onTriggerToast('Notificações marcadas como lidas');
                    }}
                    className="text-xs text-[#630ed4] hover:underline"
                  >
                    Marcar todas lidas
                  </button>
                </div>
                <div className="flex flex-col divide-y divide-[#eaedff] max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onTriggerToast(n.title);
                      }}
                      className="py-2.5 hover:bg-[#f2f3ff] px-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#131b2e]">{n.title}</p>
                      <p className="text-xs text-[#4a4455] mt-0.5 leading-snug">{n.desc}</p>
                      <span className="text-[0.6875rem] text-[#7b7487] mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick WhatsApp button */}
          <button
            id="header-quick-whatsapp-btn"
            onClick={handleOpenWhatsApp}
            className="relative p-2 rounded-lg text-[#4a4455] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
            type="button"
            title="WhatsApp & Mensagens"
          >
            <span className="material-symbols-outlined text-[1.25rem]">chat</span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-[#e2e7ff] hidden sm:block"></div>

        {/* Novo Agendamento Button */}
        <button
          id="btn-novo-agendamento-header"
          onClick={onOpenNewAppointment}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-xs sm:text-sm font-medium shadow-sm hover:bg-[#630ed4] transition-all transform active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">add</span>
          <span className="whitespace-nowrap font-medium">+ Novo agendamento</span>
        </button>

        {/* Profile */}
        <div className="relative">
          <div
            id="user-profile-header-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-1 cursor-pointer select-none group"
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                alt={user?.user_metadata?.full_name || 'Perfil'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#eaedff] group-hover:ring-[#7c3aed] transition-all"
                src={user.user_metadata.avatar_url}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#eaedff] group-hover:ring-[#7c3aed] transition-all">
                {(user?.user_metadata?.full_name || user?.email || 'U')
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
            )}
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#131b2e] leading-tight max-w-[120px] truncate">
                {user?.user_metadata?.full_name?.split(' ')[0] || (user?.email ? user.email.split('@')[0] : 'Usuário')}
              </span>
              <span className="text-[0.6875rem] text-[#4a4455] leading-tight">
                {isSuperAdmin ? 'Super Admin' : activeMembership?.role === 'owner' ? 'Proprietário(a)' : 'Administrador(a)'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#ccc3d8] text-[1.125rem] group-hover:text-[#131b2e] transition-colors">
              expand_more
            </span>
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-[#eaedff] p-2 z-50 text-xs text-[#131b2e]"
            >
              <div className="p-2.5 border-b border-[#eaedff] mb-1">
                <p className="font-semibold text-sm truncate">
                  {user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Usuário')}
                </p>
                <p className="text-[0.6875rem] text-[#7b7487] truncate mt-0.5">
                  {user?.email || 'usuario@servicosagenda.com'}
                </p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full font-medium text-[0.625rem] ${
                  isSuperAdmin ? 'bg-purple-100 text-[#630ed4]' : 'bg-slate-100 text-slate-700'
                }`}>
                  {isSuperAdmin ? 'Super Administrador' : activeMembership?.role === 'owner' ? 'Proprietário da Empresa' : 'Membro da Equipe'}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onTriggerToast('Abrindo perfil da clínica');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f2f3ff] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[1rem]">badge</span>
                Meu Perfil
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onTriggerToast('Preferências salvas');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#f2f3ff] flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[1rem]">tune</span>
                Preferências da Clínica
              </button>
              <button
                onClick={async () => {
                  setShowProfileMenu(false);
                  await signOut();
                  onTriggerToast('Sessão encerrada com sucesso');
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 mt-1 border-t border-[#eaedff] pt-2 font-medium"
              >
                <span className="material-symbols-outlined text-[1rem]">logout</span>
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
