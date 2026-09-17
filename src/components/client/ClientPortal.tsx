import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { fetchServicesFromSupabase, fetchProfessionalsFromSupabase } from '../../services/catalogService';
import { ServiceItem, Professional } from '../../types';
import { supabase } from '../../lib/supabase';

type ClientTab = 'agendamentos' | 'novo' | 'clube' | 'historico' | 'perfil';

interface ClientAppointment {
  id: string;
  tenantId: string;
  serviceName: string;
  tenantName: string;
  professionalName: string;
  date: string;
  time: string;
  price: number;
  duration: string;
  status: 'CONFIRMADO' | 'PENDENTE' | 'CONCLUIDO' | 'CANCELADO';
  code: string;
}

export const ClientPortal: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const {
    user,
    clientProfile,
    tenantMemberships,
    isSuperAdmin,
    signOut,
    refreshUserProfile,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();
  const { activeTenant, switchTenantBySlug, switchTenant, tenants } = useTenant();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ClientTab>('agendamentos');

  // Client White Label Auth States (When unauthenticated)
  const [clientAuthMode, setClientAuthMode] = useState<'login' | 'register'>('login');
  const [clientAuthName, setClientAuthName] = useState('');
  const [clientAuthEmail, setClientAuthEmail] = useState('');
  const [clientAuthPhone, setClientAuthPhone] = useState('');
  const [clientAuthPassword, setClientAuthPassword] = useState('');
  const [clientAuthError, setClientAuthError] = useState<string | null>(null);
  const [clientAuthSubmitting, setClientAuthSubmitting] = useState(false);

  // Sync tenant from slug or client profile if provided
  useEffect(() => {
    if (slug) {
      switchTenantBySlug(slug);
    } else if (clientProfile?.tenant_id) {
      switchTenant(clientProfile.tenant_id);
    }
  }, [slug, clientProfile?.tenant_id, switchTenantBySlug, switchTenant]);

  const currentTenant = activeTenant || tenants[0];
  const primaryColor = currentTenant.settings.primaryColor || '#7c3aed';

  // Client Auth Handlers
  const handleClientAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientAuthError(null);
    setClientAuthSubmitting(true);

    try {
      if (clientAuthMode === 'login') {
        if (!clientAuthEmail.trim() || !clientAuthPassword) {
          setClientAuthError('Por favor, informe seu e-mail e senha.');
          setClientAuthSubmitting(false);
          return;
        }
        const res = await signInWithEmail(clientAuthEmail.trim(), clientAuthPassword);
        if (!res.success) {
          setClientAuthError(res.error || 'E-mail ou senha incorretos.');
        }
      } else {
        if (!clientAuthName.trim()) {
          setClientAuthError('Por favor, informe seu nome completo.');
          setClientAuthSubmitting(false);
          return;
        }
        if (!clientAuthEmail.trim() || !clientAuthPassword) {
          setClientAuthError('Por favor, preencha e-mail e crie uma senha.');
          setClientAuthSubmitting(false);
          return;
        }
        const res = await signUpWithEmail({
          name: clientAuthName.trim(),
          email: clientAuthEmail.trim(),
          phone: clientAuthPhone.trim(),
          password: clientAuthPassword,
          accountType: 'cliente',
        });
        if (!res.success) {
          setClientAuthError(res.error || 'Não foi possível criar seu cadastro.');
        }
      }
    } catch (err: any) {
      setClientAuthError(err?.message || 'Erro inesperado. Tente novamente.');
    } finally {
      setClientAuthSubmitting(false);
    }
  };

  // Client info
  const clientName = clientProfile?.name || user?.user_metadata?.full_name || 'Cliente';
  const clientEmail = clientProfile?.email || user?.email || '';
  const clientPhone = clientProfile?.phone || user?.user_metadata?.phone || '';

  // Profile editing state
  const [editName, setEditName] = useState(clientName);
  const [editEmail, setEditEmail] = useState(clientEmail);
  const [editPhone, setEditPhone] = useState(clientPhone);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setEditName(clientProfile?.name || user?.user_metadata?.full_name || 'Cliente');
    setEditEmail(clientProfile?.email || user?.email || '');
    setEditPhone(clientProfile?.phone || user?.user_metadata?.phone || '');
  }, [clientProfile, user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    if (!editName.trim()) {
      setProfileErrorMsg('Por favor, informe seu nome completo.');
      return;
    }

    setIsSavingProfile(true);
    try {
      // 1. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          phone: editPhone.trim(),
        },
      });

      // 2. Update clients table
      if (clientProfile?.id) {
        const { error: clientErr } = await supabase
          .from('clients')
          .update({
            name: editName.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim() || null,
          })
          .eq('id', clientProfile.id);

        if (clientErr) {
          console.warn('Aviso ao atualizar tabela clients:', clientErr);
        }
      } else if (user?.id) {
        await supabase
          .from('clients')
          .upsert({
            tenant_id: currentTenant.id,
            user_id: user.id,
            name: editName.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim() || null,
            status: 'Ativo',
          });
      }

      await refreshUserProfile();
      setProfileSuccessMsg('Seus dados foram atualizados com sucesso!');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Erro ao salvar dados do perfil:', err);
      setProfileErrorMsg(err?.message || 'Não foi possível salvar os dados. Tente novamente.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Dynamic services & professionals for this tenant
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      setIsLoadingCatalog(true);
      try {
        const [srvs, profs] = await Promise.all([
          fetchServicesFromSupabase(currentTenant.id, currentTenant.type),
          fetchProfessionalsFromSupabase(currentTenant.id, currentTenant.type),
        ]);
        if (isMounted) {
          setServices(srvs);
          setProfessionals(profs);
          if (srvs.length > 0) {
            setBookingService(srvs[0]);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar catálogo do estabelecimento:', err);
      } finally {
        if (isMounted) setIsLoadingCatalog(false);
      }
    }
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [currentTenant.id, currentTenant.type]);

  // Appointments state (filtered by tenant)
  const [appointments, setAppointments] = useState<ClientAppointment[]>(() => {
    const saved = localStorage.getItem('client_portal_appointments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'apt-sample-1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        serviceName: 'Limpeza de Pele Profunda',
        tenantName: 'Clínica Bella Vita - Estética Avançada',
        professionalName: 'Dra. Fernanda Lins',
        date: 'Amanhã, 14:00',
        time: '14:00',
        price: 240.0,
        duration: '60 min',
        status: 'CONFIRMADO',
        code: '#BV-9821',
      },
      {
        id: 'apt-sample-2',
        tenantId: '22222222-2222-2222-2222-222222222222',
        serviceName: 'Combo Dom Camilo (Cabelo + Barba)',
        tenantName: 'Barbearia Dom Camilo',
        professionalName: 'Camilo Augusto',
        date: 'Sexta, 17:30',
        time: '17:30',
        price: 110.0,
        duration: '70 min',
        status: 'CONFIRMADO',
        code: '#DC-4421',
      },
    ];
  });

  // Booking Flow State inside the portal
  const [bookingService, setBookingService] = useState<ServiceItem | null>(null);
  const [bookingProf, setBookingProf] = useState<string>('any');
  const [bookingDate, setBookingDate] = useState<string>('Amanhã, 25 Out');
  const [bookingTime, setBookingTime] = useState<string>('15:00');
  const [bookingNotes, setBookingNotes] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [bookingSuccessModal, setBookingSuccessModal] = useState<ClientAppointment | null>(null);

  // Available dates and slots for booking
  const availableDates = [
    { label: 'Hoje', date: '24 Out', full: 'Hoje, 24 Out' },
    { label: 'Amanhã', date: '25 Out', full: 'Amanhã, 25 Out' },
    { label: 'Sábado', date: '26 Out', full: 'Sábado, 26 Out' },
    { label: 'Segunda', date: '28 Out', full: 'Segunda, 28 Out' },
    { label: 'Terça', date: '29 Out', full: 'Terça, 29 Out' },
  ];

  const availableSlots = [
    '09:00', '10:00', '11:30', '13:00', '14:00', '15:00', '16:30', '17:30', '18:30'
  ];

  const categories = ['todos', ...Array.from(new Set(services.map((s) => s.category)))];
  const filteredServices = selectedCategory === 'todos' 
    ? services 
    : services.filter((s) => s.category === selectedCategory);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleConfirmBooking = () => {
    if (!bookingService) return;

    const profObj = professionals.find((p) => p.id === bookingProf);
    const profName = profObj ? profObj.name : (professionals[0]?.name || 'Profissional Disponível');

    const prefix = currentTenant.name.substring(0, 2).toUpperCase();
    const newApt: ClientAppointment = {
      id: `apt-${Date.now()}`,
      tenantId: currentTenant.id,
      serviceName: bookingService.name,
      tenantName: currentTenant.name,
      professionalName: profName,
      date: `${bookingDate} às ${bookingTime}`,
      time: bookingTime,
      price: bookingService.price,
      duration: bookingService.duration,
      status: 'CONFIRMADO',
      code: `#${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const updated = [newApt, ...appointments];
    setAppointments(updated);
    localStorage.setItem('client_portal_appointments', JSON.stringify(updated));

    setBookingSuccessModal(newApt);
    setActiveTab('agendamentos');
  };

  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Tem certeza de que deseja cancelar este agendamento?')) {
      const updated = appointments.map((a) =>
        a.id === id ? { ...a, status: 'CANCELADO' as const } : a
      );
      setAppointments(updated);
      localStorage.setItem('client_portal_appointments', JSON.stringify(updated));
    }
  };

  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este atendimento do seu histórico?')) {
      const updated = appointments.filter((a) => a.id !== id);
      setAppointments(updated);
      localStorage.setItem('client_portal_appointments', JSON.stringify(updated));
    }
  };

  // Strictly filter appointments for the current tenant
  const tenantAppointments = appointments.filter((a) => a.tenantId === currentTenant.id);
  const activeAppointments = tenantAppointments.filter((a) => a.status === 'CONFIRMADO');
  const pastAppointments = tenantAppointments.filter((a) => a.status === 'CONCLUIDO' || a.status === 'CANCELADO');

  // WhatsApp clean link
  const tenantPhoneClean = (currentTenant.ownerPhone || '5511999999999').replace(/\D/g, '');

  // IF CLIENT IS NOT LOGGED IN: Render 100% White-Label Client Login / Registration Screen!
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/20 to-white flex flex-col justify-between font-sans antialiased text-slate-800">
        {/* White Label Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3.5 shadow-xs sticky top-0 z-30">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentTenant.logo ? (
                <img
                  src={currentTenant.logo}
                  alt={currentTenant.name}
                  className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-2xl text-white font-bold flex items-center justify-center text-base shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  {currentTenant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {currentTenant.name}
                </h1>
                <p className="text-[11px] text-slate-500">
                  {currentTenant.type === 'clinica' ? 'Clínica & Estética Avançada' : 'Barbearia & Cuidados'}
                </p>
              </div>
            </div>

            <a
              href={`/agendar/${currentTenant.slug}`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="material-symbols-outlined text-[1.125rem]">calendar_month</span>
              <span>Agendar Agora</span>
            </a>
          </div>
        </header>

        {/* Auth Center Card */}
        <main className="flex-1 flex items-center justify-center p-4 py-10">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <div
                className="w-14 h-14 rounded-2xl text-white font-bold flex items-center justify-center text-xl mx-auto shadow-md mb-2"
                style={{ backgroundColor: primaryColor }}
              >
                {currentTenant.logo ? (
                  <img src={currentTenant.logo} alt={currentTenant.name} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  currentTenant.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Portal do Cliente
              </h2>
              <p className="text-xs text-slate-500">
                Acesse seus agendamentos e histórico em <strong className="text-slate-800">{currentTenant.name}</strong>
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setClientAuthMode('login'); setClientAuthError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  clientAuthMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Já sou cliente (Entrar)
              </button>
              <button
                type="button"
                onClick={() => { setClientAuthMode('register'); setClientAuthError(null); }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  clientAuthMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Primeiro Acesso
              </button>
            </div>

            {/* Error Alert */}
            {clientAuthError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-rose-600 text-[1.125rem]">error</span>
                <span>{clientAuthError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleClientAuthSubmit} className="space-y-3.5">
              {clientAuthMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={clientAuthName}
                      onChange={(e) => setClientAuthName(e.target.value)}
                      placeholder="Ex: Mariana Silveira"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp para Confirmações</label>
                    <input
                      type="tel"
                      value={clientAuthPhone}
                      onChange={(e) => setClientAuthPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seu E-mail</label>
                <input
                  type="email"
                  required
                  value={clientAuthEmail}
                  onChange={(e) => setClientAuthEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sua Senha</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={clientAuthPassword}
                  onChange={(e) => setClientAuthPassword(e.target.value)}
                  placeholder="Sua senha de acesso"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={clientAuthSubmitting}
                className="w-full h-11 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: primaryColor }}
              >
                {clientAuthSubmitting ? (
                  <span>Processando...</span>
                ) : (
                  <>
                    <span>{clientAuthMode === 'login' ? 'Entrar no Meu Portal' : 'Concluir Meu Cadastro'}</span>
                    <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <a
                href={`/agendar/${currentTenant.slug}`}
                className="text-xs font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                📅 Ou clique aqui para agendar um horário online
              </a>
            </div>
          </div>
        </main>

        {/* White Label Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
          <p>{currentTenant.name} &bull; Todos os direitos reservados</p>
          {currentTenant.settings.whatsapp && (
            <p className="mt-1 text-[11px] text-slate-400">
              Dúvidas? Entre em contato pelo WhatsApp: {currentTenant.settings.whatsapp}
            </p>
          )}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans antialiased pb-24">
      {/* Top Header - White Label por Estabelecimento */}
      <header className="bg-white border-b border-slate-200 px-4 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          {currentTenant.logo ? (
            <img
              src={currentTenant.logo}
              alt={currentTenant.name}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-2xl text-white font-bold flex items-center justify-center text-sm shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              {currentTenant.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
              <span>{currentTenant.name}</span>
            </h1>
            <p className="text-[0.6875rem] text-slate-500 truncate max-w-[220px]">
              Olá, {clientName.split(' ')[0]} &bull; Portal do Cliente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(tenantMemberships.length > 0 || isSuperAdmin) && (
            <button
              onClick={() => navigate('/app')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border shadow-xs cursor-pointer"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}30`,
              }}
              title="Acessar Painel da Empresa"
            >
              <span className="material-symbols-outlined text-[1.125rem]">store</span>
              <span className="hidden sm:inline">Painel da Empresa</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200/60 shadow-xs cursor-pointer"
            title="Sair da conta"
          >
            <span className="material-symbols-outlined text-[1.125rem]">logout</span>
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 space-y-5">
        {/* Banner CTA com tema do Tenant */}
        <div
          className="relative overflow-hidden text-white rounded-2xl p-5 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #1e1b4b 100%)`,
            boxShadow: `0 10px 25px -5px ${primaryColor}40`,
          }}
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15 pointer-events-none">
            <span className="material-symbols-outlined text-[9rem]">
              {currentTenant.type === 'barbearia' ? 'content_cut' : 'event_available'}
            </span>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[0.6875rem] font-semibold uppercase tracking-wider mb-2 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[0.875rem]">calendar_month</span>
              <span>Agendamento Online &bull; {currentTenant.name}</span>
            </div>
            <h2 className="text-xl font-bold">Precisa de um novo horário?</h2>
            <p className="text-xs text-white/90 mt-1 max-w-sm">
              Escolha seu procedimento com nossos especialistas e reserve sua vaga em menos de 1 minuto.
            </p>

            <button
              onClick={() => setActiveTab('novo')}
              className="mt-3.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-50 text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[1.125rem]" style={{ color: primaryColor }}>add_circle</span>
              <span>Agendar Agora</span>
            </button>
          </div>
        </div>

        {/* 1. ABA: MEUS AGENDAMENTOS */}
        {activeTab === 'agendamentos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Seus Horários em {currentTenant.name.split('-')[0].trim()} ({activeAppointments.length})
              </h3>
              <button
                onClick={() => setActiveTab('novo')}
                className="text-xs font-semibold flex items-center gap-1 cursor-pointer"
                style={{ color: primaryColor }}
              >
                <span className="material-symbols-outlined text-[1rem]">add</span>
                <span>Novo Horário</span>
              </button>
            </div>

            {activeAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-xs">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                >
                  <span className="material-symbols-outlined text-[1.75rem]">calendar_today</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">Você não tem agendamentos ativos</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Agende seu horário online com a equipe de <b>{currentTenant.name}</b>.
                </p>
                <button
                  onClick={() => setActiveTab('novo')}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="material-symbols-outlined text-[1.125rem]">calendar_add_on</span>
                  <span>Agendar meu horário</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[0.6875rem] font-bold border border-emerald-200/60">
                            Confirmado
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{apt.code}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{apt.serviceName}</h4>
                        <p className="text-xs font-semibold" style={{ color: primaryColor }}>{apt.tenantName}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900">
                          R$ {apt.price.toFixed(2)}
                        </span>
                        <p className="text-[0.6875rem] text-slate-400">{apt.duration}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-[1.125rem]" style={{ color: primaryColor }}>event</span>
                        <span className="font-semibold text-slate-800">{apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
                        <span className="material-symbols-outlined text-[1.125rem] text-indigo-600">person</span>
                        <span className="font-medium text-slate-700 truncate">{apt.professionalName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleCancelAppointment(apt.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <a
                        href={`https://wa.me/${tenantPhoneClean}?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20meu%20agendamento%20${apt.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[1rem]">chat</span>
                        <span>WhatsApp da Empresa</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ABA: AGENDAR NOVO HORÁRIO (ISOLADO DO ESTABELECIMENTO) */}
        {activeTab === 'novo' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Novo Agendamento</h3>
                <p className="text-xs text-slate-500">Agende em <b>{currentTenant.name}</b></p>
              </div>
              <button
                onClick={() => setActiveTab('agendamentos')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            {/* Categorias */}
            {categories.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    style={selectedCategory === cat ? { backgroundColor: primaryColor } : undefined}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Passo 1: Escolha do Serviço */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                1. Escolha o Serviço
              </label>

              {isLoadingCatalog ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Carregando serviços disponíveis...
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  Nenhum serviço disponível nesta categoria.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredServices.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => setBookingService(srv)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        bookingService?.id === srv.id
                          ? 'border-transparent ring-2 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                      style={
                        bookingService?.id === srv.id
                          ? { borderColor: primaryColor, outlineColor: primaryColor }
                          : undefined
                      }
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{srv.name}</p>
                        <p className="text-[0.6875rem] text-slate-500">{srv.duration} &bull; {srv.category}</p>
                        {srv.description && (
                          <p className="text-[0.6875rem] text-slate-400 mt-0.5 line-clamp-1">{srv.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold shrink-0 ml-2" style={{ color: primaryColor }}>
                        R$ {srv.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Passo 2: Profissional do Estabelecimento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                2. Profissional de {currentTenant.name.split('-')[0].trim()}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingProf('any')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    bookingProf === 'any'
                      ? 'bg-slate-50 ring-2'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                  style={bookingProf === 'any' ? { borderColor: primaryColor, color: primaryColor } : undefined}
                >
                  ✨ Qualquer Especialista
                </button>
                {professionals.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setBookingProf(p.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer truncate ${
                      bookingProf === p.id
                        ? 'bg-slate-50 ring-2'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                    style={bookingProf === p.id ? { borderColor: primaryColor, color: primaryColor } : undefined}
                  >
                    {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Passo 3: Data e Horário */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                3. Data e Horário
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
                {availableDates.map((d) => (
                  <button
                    key={d.full}
                    type="button"
                    onClick={() => setBookingDate(d.full)}
                    className={`px-3 py-2 rounded-xl border text-center shrink-0 transition-all cursor-pointer ${
                      bookingDate === d.full
                        ? 'text-white font-bold shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white font-medium text-xs'
                    }`}
                    style={bookingDate === d.full ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
                  >
                    <p className="text-[0.6875rem]">{d.label}</p>
                    <p className="text-xs font-bold">{d.date}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setBookingTime(time)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      bookingTime === time
                        ? 'bg-slate-50 ring-2 font-bold'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                    }`}
                    style={bookingTime === time ? { borderColor: primaryColor, color: primaryColor } : undefined}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações adicionais (opcional)
              </label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Ex: preferência de produto, alergias, observações para o profissional..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2"
              />
            </div>

            {/* Resumo e Confirmação */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[0.6875rem] text-slate-400">Total no local ({currentTenant.name.split(' ')[0]})</p>
                <p className="text-lg font-bold text-slate-900">
                  R$ {bookingService ? bookingService.price.toFixed(2) : '0.00'}
                </p>
              </div>

              <button
                type="button"
                disabled={!bookingService}
                onClick={handleConfirmBooking}
                className="px-6 py-3 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Confirmar Agendamento</span>
                <span className="material-symbols-outlined text-[1.125rem]">check_circle</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. ABA: CLUBE & FIDELIDADE */}
        {activeTab === 'clube' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* VIP Card com Identidade da Empresa */}
            <div
              className="text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-white/10"
              style={{
                background: `linear-gradient(135deg, #0f172a 0%, ${primaryColor} 100%)`,
              }}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[0.6875rem] font-bold tracking-wider uppercase border border-amber-500/30">
                    Cliente VIP &bull; {currentTenant.name.split('-')[0]}
                  </span>
                  <h3 className="text-lg font-bold mt-2">{clientName}</h3>
                </div>
                <span className="material-symbols-outlined text-[2.5rem] text-amber-400 opacity-90">
                  military_tech
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[0.6875rem] text-slate-300 uppercase tracking-wider">Pontos Acumulados</p>
                  <p className="text-2xl font-black text-amber-300">380 pts</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.6875rem] text-slate-300 uppercase tracking-wider">Cashback Disponível</p>
                  <p className="text-xl font-bold text-emerald-400">R$ 38,00</p>
                </div>
              </div>
            </div>

            {/* Cupons Ativos do Estabelecimento */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2.5">
                Cupons Exclusivos de {currentTenant.name.split('-')[0].trim()}
              </h4>
              <div className="space-y-2">
                <div className="bg-white border border-dashed border-slate-300 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      15%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">PRIMEIRA15</p>
                      <p className="text-[0.6875rem] text-slate-500">15% de desconto no seu atendimento</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[0.625rem] font-bold">
                    Disponível
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ABA: HISTÓRICO */}
        {activeTab === 'historico' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Atendimentos Anteriores em {currentTenant.name.split('-')[0].trim()}
            </h3>

            {pastAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[1.5rem]">history</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">Nenhum atendimento finalizado ainda</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Assim que seus agendamentos forem concluídos pelo profissional, eles aparecerão aqui com recibo e histórico.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {pastAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border border-slate-200 p-3.5 flex items-center justify-between shadow-xs text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{apt.serviceName}</p>
                      <p className="text-[0.6875rem] text-slate-500">{apt.date} &bull; {apt.professionalName}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const matchingService = services.find((s) => s.name === apt.serviceName);
                          if (matchingService) {
                            setBookingService(matchingService);
                          }
                          setActiveTab('novo');
                        }}
                        className="px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        title="Agendar novamente este procedimento"
                      >
                        <span className="material-symbols-outlined text-[1rem]">replay</span>
                        <span>Repetir</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200/70 hover:border-rose-300 transition-colors flex items-center justify-center cursor-pointer"
                        title="Excluir do histórico"
                      >
                        <span className="material-symbols-outlined text-[1rem]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. ABA: MEU PERFIL */}
        {activeTab === 'perfil' && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Meus Dados no Estabelecimento
                </h3>
                <p className="text-xs text-slate-500">Mantenha seu cadastro atualizado para agendamentos e lembretes</p>
              </div>
              <span className="material-symbols-outlined text-[1.5rem]" style={{ color: primaryColor }}>
                badge
              </span>
            </div>

            {/* Mensagem de Sucesso */}
            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[1.125rem] text-emerald-600">check_circle</span>
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Mensagem de Erro */}
            {profileErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[1.125rem] text-rose-600">error</span>
                <span>{profileErrorMsg}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[1.125rem]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[1.125rem]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[1.125rem]">
                    call
                  </span>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full pl-9.5 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs focus:outline-none focus:ring-2 transition-all"
                  />
                </div>
              </div>

              {/* Botão de Salvar Alterações */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="material-symbols-outlined text-[1.125rem]">
                    {isSavingProfile ? 'progress_activity' : 'save'}
                  </span>
                  <span>{isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>

              {/* Informações da Empresa Vinculada */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 mt-4">
                <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[1rem]" style={{ color: primaryColor }}>store</span>
                  <span>{currentTenant.name}</span>
                </p>
                <p className="text-[0.6875rem] text-slate-500">{currentTenant.address}</p>
                {currentTenant.ownerPhone && (
                  <p className="text-[0.6875rem] text-slate-500">Contato: {currentTenant.ownerPhone}</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[1.125rem]">logout</span>
                <span>Desconectar da Conta</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Modal de Sucesso de Agendamento */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-[2.25rem]">check_circle</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Agendamento Confirmado!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Seu horário para <strong className="text-slate-800">{bookingSuccessModal.serviceName}</strong> em <strong className="text-slate-800">{bookingSuccessModal.tenantName}</strong> foi reservado com sucesso.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-left space-y-1.5 border border-slate-100">
              <p><strong className="text-slate-700">Quando:</strong> {bookingSuccessModal.date}</p>
              <p><strong className="text-slate-700">Profissional:</strong> {bookingSuccessModal.professionalName}</p>
              <p><strong className="text-slate-700">Código:</strong> <span className="font-mono font-bold" style={{ color: primaryColor }}>{bookingSuccessModal.code}</span></p>
            </div>

            <button
              onClick={() => setBookingSuccessModal(null)}
              className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Ver Meus Agendamentos
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around z-30 shadow-lg max-w-xl mx-auto">
        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'agendamentos' ? 'font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={activeTab === 'agendamentos' ? { color: primaryColor } : undefined}
        >
          <span className="material-symbols-outlined text-[1.375rem]">calendar_today</span>
          <span className="text-[0.625rem]">Agendamentos</span>
        </button>

        <button
          onClick={() => setActiveTab('novo')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'novo' ? 'font-bold scale-105' : 'font-semibold'
          }`}
          style={{ color: primaryColor }}
        >
          <div
            className="w-8 h-8 rounded-full text-white flex items-center justify-center -mt-3 shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="material-symbols-outlined text-[1.25rem]">add</span>
          </div>
          <span className="text-[0.625rem]">Agendar</span>
        </button>

        <button
          onClick={() => setActiveTab('clube')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'clube' ? 'font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={activeTab === 'clube' ? { color: primaryColor } : undefined}
        >
          <span className="material-symbols-outlined text-[1.375rem]">loyalty</span>
          <span className="text-[0.625rem]">Clube & VIP</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'historico' ? 'font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={activeTab === 'historico' ? { color: primaryColor } : undefined}
        >
          <span className="material-symbols-outlined text-[1.375rem]">history</span>
          <span className="text-[0.625rem]">Histórico</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'perfil' ? 'font-bold scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
          style={activeTab === 'perfil' ? { color: primaryColor } : undefined}
        >
          <span className="material-symbols-outlined text-[1.375rem]">person</span>
          <span className="text-[0.625rem]">Perfil</span>
        </button>
      </nav>
    </div>
  );
};
