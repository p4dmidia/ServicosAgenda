import React, { useState, useEffect } from 'react';
import { ScreenType, Appointment, AppointmentStatus, Client } from './types';
import { INITIAL_TODAY_SCHEDULE, UPCOMING_APPOINTMENTS_TABLE, CLIENTS_LIST } from './data/mockData';
import { TenantProvider, useTenant } from './context/TenantContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthContainer } from './components/auth/AuthContainer';
import { AuthLoadingSplash } from './components/auth/AuthLoadingSplash';
import {
  fetchAppointmentsFromSupabase,
  createAppointmentInSupabase,
  updateAppointmentStatusInSupabase,
} from './services/appointmentService';
import {
  fetchClientsFromSupabase,
  createClientInSupabase,
} from './services/clientService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AgendaView } from './components/AgendaView';
import { ClientesView } from './components/ClientesView';
import { ProfissionaisView } from './components/ProfissionaisView';
import { ServicosView } from './components/ServicosView';
import { WhatsAppView } from './components/WhatsAppView';
import { FinanceiroView } from './components/FinanceiroView';
import { PagamentosView } from './components/PagamentosView';
import { FidelidadeView } from './components/FidelidadeView';
import { ClubeAssinaturaView } from './components/ClubeAssinaturaView';
import { EstoqueView } from './components/EstoqueView';
import { AfiliadosView } from './components/AfiliadosView';
import { AgenteIaView } from './components/AgenteIaView';
import { MarketingView } from './components/MarketingView';
import { RelatoriosView } from './components/RelatoriosView';
import { AjudaSuporteView } from './components/AjudaSuporteView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { SuperAdminView } from './components/SuperAdminView';
import { PublicBookingView } from './components/PublicBookingView';
import { NewAppointmentModal } from './components/NewAppointmentModal';
import { NewClientModal } from './components/NewClientModal';
import { QuickCampaignModal } from './components/QuickCampaignModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';

interface MainLayoutProps {
  screen?: ScreenType;
  onNavigate?: (screen: ScreenType) => void;
}

function MainLayout({ screen = 'visao-geral', onNavigate }: MainLayoutProps) {
  const [internalScreen, setInternalScreen] = useState<ScreenType>(screen);
  const currentScreen = screen || internalScreen;

  const handleScreenChange = (newScreen: ScreenType) => {
    setInternalScreen(newScreen);
    if (onNavigate) {
      onNavigate(newScreen);
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  const { activeTenant } = useTenant();

  // Load appointments and clients from Supabase when tenant changes
  useEffect(() => {
    if (!activeTenant?.id) return;

    let isMounted = true;

    async function loadTenantData() {
      try {
        const [remoteAppointments, remoteClients] = await Promise.all([
          fetchAppointmentsFromSupabase(activeTenant.id).catch(() => []),
          fetchClientsFromSupabase(activeTenant.id).catch(() => []),
        ]);

        if (isMounted) {
          setAppointments(remoteAppointments || []);
          setClients(remoteClients || []);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados do tenant do Supabase:', err);
        if (isMounted) {
          setAppointments([]);
          setClients([]);
        }
      }
    }

    loadTenantData();

    return () => {
      isMounted = false;
    };
  }, [activeTenant?.id]);

  // Modals
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // WhatsApp active conversation target
  const [activeChat, setActiveChat] = useState<{ phone?: string; name?: string }>({
    name: 'Mariana Silveira',
    phone: '+55 11 98452-1100',
  });

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  const handleOpenWhatsAppChat = (phone?: string, name?: string) => {
    if (name) {
      setActiveChat({ phone, name });
    }
    handleScreenChange('whatsapp');
    showToast(`Abrindo conversa de ${name || 'cliente'} no WhatsApp`);
  };

  const handleAddAppointment = async (newApt: Appointment) => {
    const tempId = newApt.id || `apt-${Date.now()}`;
    const aptWithId = { ...newApt, id: tempId, tenantId: activeTenant?.id };
    
    // Optimistic local update
    setAppointments((prev) => [aptWithId, ...prev]);
    showToast(`Agendamento de ${newApt.clientName} às ${newApt.time} confirmado!`);

    if (activeTenant?.id) {
      try {
        const saved = await createAppointmentInSupabase({
          ...aptWithId,
          tenantId: activeTenant.id,
        });
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === tempId ? saved : apt))
        );
      } catch (err) {
        console.error('Falha ao persistir agendamento no Supabase:', err);
      }
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showToast(`Status atualizado para: ${newStatus}`);

    try {
      await updateAppointmentStatusInSupabase(id, newStatus);
    } catch (err) {
      console.error('Falha ao atualizar status no Supabase:', err);
    }
  };

  const handleAddClient = async (newClientData: { name: string; phone: string; email: string; favoriteService: string }) => {
    const tempId = `client-${Date.now()}`;
    const newClient: Client = {
      id: tempId,
      tenantId: activeTenant?.id,
      name: newClientData.name,
      phone: newClientData.phone,
      email: newClientData.email,
      favoriteService: newClientData.favoriteService,
      initials: newClientData.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      lastVisit: 'Hoje',
      totalSpent: 0,
      status: 'Novo',
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Cliente ${newClient.name} cadastrado com sucesso!`);

    if (activeTenant?.id) {
      try {
        const saved = await createClientInSupabase({
          tenantId: activeTenant.id,
          name: newClientData.name,
          phone: newClientData.phone,
          email: newClientData.email,
          favoriteService: newClientData.favoriteService,
        });
        setClients((prev) =>
          prev.map((c) => (c.id === tempId ? saved : c))
        );
      } catch (err) {
        console.error('Falha ao salvar cliente no Supabase:', err);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-[#131b2e] font-sans antialiased overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={(s) => {
          handleScreenChange(s);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectScreen={(s) => {
          handleScreenChange(s);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isMobileOpen={isMobileMenuOpen}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Top Header */}
        <Header
          currentScreen={currentScreen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSearch={() => setIsCommandPaletteOpen(true)}
          onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
          onOpenWhatsApp={() => handleScreenChange('whatsapp')}
          onTriggerToast={showToast}
          onNavigate={(s) => handleScreenChange(s)}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-8 pt-20 pb-8 max-w-7xl w-full mx-auto">
          {currentScreen === 'visao-geral' && (
            <DashboardView
              appointments={appointments}
              todaySchedule={appointments}
              upcomingAppointments={appointments}
              onNavigate={(s) => handleScreenChange(s)}
              onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
              onOpenNewClient={() => setIsNewClientOpen(true)}
              onOpenCampaign={() => setIsCampaignOpen(true)}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
              onTriggerToast={showToast}
            />
          )}

          {currentScreen === 'agenda' && (
            <AgendaView
              appointments={appointments}
              onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
              onNavigate={(s) => handleScreenChange(s)}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onAddAppointment={handleAddAppointment}
            />
          )}

          {currentScreen === 'agendamento-online' && (
            <PublicBookingView
              onAddAppointment={handleAddAppointment}
              onNavigate={(s) => handleScreenChange(s)}
              onTriggerToast={showToast}
            />
          )}

          {currentScreen === 'clientes' && (
            <ClientesView
              clients={clients}
              onOpenNewClient={() => setIsNewClientOpen(true)}
              onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
              onOpenCampaign={() => setIsCampaignOpen(true)}
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'profissionais' && (
            <ProfissionaisView
              onTriggerToast={showToast}
              onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
            />
          )}

          {currentScreen === 'servicos' && (
            <ServicosView
              onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
              onTriggerToast={showToast}
            />
          )}

          {currentScreen === 'whatsapp' && (
            <WhatsAppView
              onTriggerToast={showToast}
              activeChatPhone={activeChat.phone}
              activeChatName={activeChat.name}
            />
          )}

          {currentScreen === 'agente-ia' && (
            <AgenteIaView
              onTriggerToast={showToast}
              onAddAppointment={handleAddAppointment}
            />
          )}

          {currentScreen === 'financeiro' && (
            <FinanceiroView onTriggerToast={showToast} />
          )}

          {currentScreen === 'pagamentos' && (
            <PagamentosView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'marketing' && (
            <MarketingView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'fidelidade' && (
            <FidelidadeView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'clube-de-assinatura' && (
            <ClubeAssinaturaView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'estoque' && (
            <EstoqueView onTriggerToast={showToast} />
          )}

          {currentScreen === 'afiliados' && (
            <AfiliadosView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'relatorios' && (
            <RelatoriosView onTriggerToast={showToast} />
          )}

          {currentScreen === 'super-admin' && (
            <SuperAdminView
              onNavigate={(s) => handleScreenChange(s)}
              onTriggerToast={showToast}
            />
          )}

          {currentScreen === 'ajuda-e-suporte' && (
            <AjudaSuporteView
              onTriggerToast={showToast}
              onOpenWhatsAppChat={handleOpenWhatsAppChat}
            />
          )}

          {currentScreen === 'configuracoes' && (
            <ConfiguracoesView onTriggerToast={showToast} />
          )}
        </main>
      </div>

      {/* Floating Toast Alert */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          <span className="material-symbols-outlined text-emerald-400 text-[1.25rem]">check_circle</span>
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 p-0.5"
          >
            <span className="material-symbols-outlined text-[1rem]">close</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onAddAppointment={handleAddAppointment}
      />

      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onAddClient={handleAddClient}
      />

      <QuickCampaignModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        onTriggerToast={showToast}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectScreen={(s) => handleScreenChange(s)}
        onOpenNewAppointment={() => setIsNewAppointmentOpen(true)}
        onOpenNewClient={() => setIsNewClientOpen(true)}
        onOpenCampaign={() => setIsCampaignOpen(true)}
        onTriggerToast={showToast}
      />
    </div>
  );
}

import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { RoleRedirect } from './routes/RoleRedirect';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { NoAccessView } from './components/auth/NoAccessView';
import { SuperAdminPortal } from './components/admin/SuperAdminPortal';
import { ClientPortal } from './components/client/ClientPortal';
import { LandingPageView } from './components/landing/LandingPageView';

function PublicBookingWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const { tenants, switchTenant } = useTenant();

  useEffect(() => {
    if (slug) {
      const match = tenants.find((t) => t.slug === slug);
      if (match) {
        switchTenant(match.id);
      }
    }
  }, [slug, tenants, switchTenant]);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-3">
      <PublicBookingView
        isPublic={true}
        initialViewMode="preview-cliente"
        onAddAppointment={() => {}}
        onTriggerToast={() => {}}
      />
    </div>
  );
}

function EmpresaApp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Map router pathname to ScreenType if on /app/:screen
  const pathSegment = location.pathname.replace('/app', '').replace('/', '') || 'visao-geral';
  const currentScreen: ScreenType = (pathSegment as ScreenType) || 'visao-geral';

  const handleNavigate = (screen: ScreenType) => {
    navigate(`/app/${screen}`);
  };

  return (
    <MainLayout
      screen={currentScreen}
      onNavigate={handleNavigate}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. Login / Auth */}
            <Route path="/login" element={<AuthContainer />} />

            {/* 2. Root decider: RoleRedirect */}
            <Route path="/" element={<RoleRedirect />} />

            {/* 3. Sem Acesso (Unlinked authenticated account) */}
            <Route
              path="/sem-acesso"
              element={
                <ProtectedRoute>
                  <NoAccessView />
                </ProtectedRoute>
              }
            />

            {/* 4. Portal Super Admin: /admin/* */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRole="super_admin">
                  <SuperAdminPortal />
                </ProtectedRoute>
              }
            />

            {/* 5. Portal Cliente: /portal, /portal/:slug, /p/:slug */}
            <Route
              path="/portal"
              element={<ClientPortal />}
            />
            <Route
              path="/portal/:slug"
              element={<ClientPortal />}
            />
            <Route
              path="/p/:slug"
              element={<PublicBookingWrapper />}
            />

            {/* 6. Portal Empresa: /app/* */}
            <Route
              path="/app/*"
              element={
                <ProtectedRoute allowedRole="tenant_member">
                  <EmpresaApp />
                </ProtectedRoute>
              }
            />

            {/* 7. Link Público de Agendamento Online por Estabelecimento */}
            <Route
              path="/agendar/:slug"
              element={<PublicBookingWrapper />}
            />

            {/* 8. Landing Page Institucional & Planos */}
            <Route path="/landing" element={<LandingPageView />} />
            <Route path="/planos" element={<LandingPageView />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  );
}

