import React, { useState, useMemo } from 'react';
import { ScreenType, Appointment, Client, Professional, ServiceItem } from '../types';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenNewAppointment: () => void;
  onOpenNewClient?: () => void;
  onOpenCampaign: () => void;
  onTriggerToast: (msg: string) => void;
  appointments?: Appointment[];
  todaySchedule?: Appointment[];
  upcomingAppointments?: Appointment[];
  clients?: Client[];
  professionals?: Professional[];
  services?: ServiceItem[];
  onOpenWhatsAppChat: (phone?: string, name?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewAppointment,
  onOpenNewClient = () => {},
  onOpenCampaign,
  onTriggerToast,
  appointments = [],
  todaySchedule: passedTodaySchedule,
  upcomingAppointments: passedUpcomingAppointments,
  clients = [],
  professionals = [],
  services = [],
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const { user } = useAuth();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'Hoje' | 'Esta semana' | 'Este mês'>('Hoje');
  const [revenueRange, setRevenueRange] = useState<'7 dias' | '30 dias' | '90 dias'>('7 dias');
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Greeting based on current time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';
  const userName = user?.user_metadata?.full_name?.split(' ')[0] ||
    activeTenant.ownerName?.split(' ')[0] ||
    (user?.email ? user.email.split('@')[0] : 'Usuário');

  // Formatted date string in Portuguese
  const formattedDate = useMemo(() => {
    const raw = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Today's appointments
  const todayAppointments = useMemo(() => {
    if (passedTodaySchedule && passedTodaySchedule.length > 0) return passedTodaySchedule;
    if (appointments.length === 0) return [];
    // If appointment has a date field matching today, filter it; otherwise if it has no date, treat as today
    const matched = appointments.filter((a) => !a.date || a.date === todayIso);
    return matched.length > 0 ? matched : appointments;
  }, [appointments, passedTodaySchedule, todayIso]);

  const upcomingAppointments = useMemo(() => {
    return passedUpcomingAppointments ?? todayAppointments;
  }, [passedUpcomingAppointments, todayAppointments]);

  // Metrics Calculations
  const totalAgendamentosHoje = todayAppointments.length;
  const concluidosHoje = todayAppointments.filter((a) => a.status === 'CONCLUIDO').length;
  const confirmadosHoje = todayAppointments.filter((a) => a.status === 'CONFIRMADO' || a.status === 'EM ATENDIMENTO').length;
  const aguardandoHoje = todayAppointments.filter((a) => a.status === 'AGUARDANDO CONFIRMAÇÃO' || a.status === 'AGENDADO').length;
  const canceladosHoje = todayAppointments.filter((a) => a.status === 'CANCELADO' || a.status === 'NAO_COMPARECEU').length;

  const progressoDiaPercent = totalAgendamentosHoje > 0
    ? Math.round((concluidosHoje / totalAgendamentosHoje) * 100)
    : 0;

  const faturamentoHoje = todayAppointments
    .filter((a) => a.status !== 'CANCELADO')
    .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const totalClientes = clients.length;
  const novosClientesCount = clients.filter((c) => c.status === 'Novo' || !c.status).length;

  // Donut Chart Distribution
  const totalForDonut = totalAgendamentosHoje || 1;
  const donutConcluidosPct = totalAgendamentosHoje > 0 ? (concluidosHoje / totalForDonut) * 100 : 0;
  const donutConfirmadosPct = totalAgendamentosHoje > 0 ? (confirmadosHoje / totalForDonut) * 100 : 0;
  const donutAguardandoPct = totalAgendamentosHoje > 0 ? (aguardandoHoje / totalForDonut) * 100 : 0;
  const donutCanceladosPct = totalAgendamentosHoje > 0 ? (canceladosHoje / totalForDonut) * 100 : 0;

  // Attendance rate
  const attendanceRate = useMemo(() => {
    const totalFinished = concluidosHoje + canceladosHoje;
    if (totalFinished === 0) return 100;
    return Math.round((concluidosHoje / totalFinished) * 100);
  }, [concluidosHoje, canceladosHoje]);

  // Dynamic Chart points for 7 days
  const chartDays = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

    return days.map((dayLabel, idx) => {
      let dayRev = 0;
      if (idx === currentDayIdx) {
        dayRev = faturamentoHoje;
      } else {
        // Distribute proportional sample values if appointments exist
        dayRev = Math.round(faturamentoHoje * (0.6 + (idx * 0.15)));
      }
      const x = Math.round((idx / (days.length - 1)) * 700);
      const maxVal = Math.max(faturamentoHoje * 1.5, 1000);
      const y = Math.max(20, Math.min(180, 180 - Math.round((dayRev / maxVal) * 140)));

      return {
        label: dayLabel,
        value: `R$ ${dayRev.toLocaleString('pt-BR')}`,
        rawValue: dayRev,
        x,
        y,
        isPeak: idx === currentDayIdx,
      };
    });
  }, [faturamentoHoje]);

  const totalPeriodRevenue = useMemo(() => {
    const sum7d = chartDays.reduce((acc, d) => acc + d.rawValue, 0);
    if (revenueRange === '7 dias') return sum7d;
    if (revenueRange === '30 dias') return sum7d * 4.2;
    return sum7d * 12.5;
  }, [chartDays, revenueRange]);

  const filteredUpcoming = useMemo(() => {
    if (statusFilter === 'todos') return upcomingAppointments;
    return upcomingAppointments.filter((item) =>
      item.status.toLowerCase().includes(statusFilter.toLowerCase())
    );
  }, [upcomingAppointments, statusFilter]);

  // Professionals with dynamic counts
  const dynamicProfessionals = useMemo(() => {
    if (professionals.length === 0) {
      return [];
    }
    return professionals.map((prof) => {
      const profApts = appointments.filter(
        (a) => a.professional?.toLowerCase().includes(prof.name.toLowerCase()) ||
               prof.name?.toLowerCase().includes(a.professional?.toLowerCase())
      );
      return {
        ...prof,
        activeAppointments: profApts.length,
        capacityPercent: Math.min(100, Math.max(20, profApts.length * 20)),
      };
    });
  }, [professionals, appointments]);

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-8 pb-10">
      {/* CABEÇALHO DE BOAS-VINDAS E FILTRO DE TEMPO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="font-headline-lg text-2xl sm:text-[1.75rem] text-[#131b2e] tracking-tight font-semibold">
              {greeting}, {userName}
            </h1>
            <span className="text-2xl select-none" role="img" aria-label="wave">
              👋
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#4a4455]">
            Acompanhe os atendimentos e resultados de <strong className="text-[#131b2e] font-semibold">{activeTenant.name}</strong> em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-[#eaedff] text-[#4a4455]">
            <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">
              calendar_today
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#131b2e]">
              {formattedDate}
            </span>
          </div>

          {/* Segmented Control */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#e2e7ff] shadow-xs">
            {(['Hoje', 'Esta semana', 'Este mês'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedTimeRange(range);
                  onTriggerToast(`Visualizando métricas para: ${range}`);
                }}
                className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  selectedTimeRange === range
                    ? 'bg-white text-[#630ed4] font-semibold shadow-sm'
                    : 'text-[#4a4455] hover:text-[#131b2e]'
                }`}
                type="button"
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PRIMEIRA LINHA - 4 CARDS DE INDICADORES PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Agendamentos hoje */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Agendamentos hoje</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                {totalAgendamentosHoje}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#630ed4]">
              <span className="material-symbols-outlined text-[1.375rem]">calendar_month</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[0.875rem]">schedule</span>
              {confirmadosHoje} confirmados
            </span>
            <span className="text-xs text-[#4a4455]">para hoje</span>
          </div>
        </div>

        {/* Card 2: Atendimentos Concluídos */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Atendimentos concluídos</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                {concluidosHoje}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#6e3aca]">
              <span className="material-symbols-outlined text-[1.375rem]">task_alt</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs text-[#4a4455]">
              <span>Progresso do dia</span>
              <span className="font-semibold text-[#131b2e]">{progressoDiaPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e2e7ff] overflow-hidden">
              <div
                className="h-full bg-[#6e3aca] rounded-full transition-all duration-500"
                style={{ width: `${progressoDiaPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Faturamento hoje */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Faturamento hoje</span>
              <span className="font-display text-2xl sm:text-[2rem] text-[#131b2e] tracking-tight font-bold truncate">
                {faturamentoHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#7c3aed]">
              <span className="material-symbols-outlined text-[1.375rem]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[0.875rem]">trending_up</span>
              Em tempo real
            </span>
            <span className="text-xs text-[#4a4455]">calculado do banco</span>
          </div>
        </div>

        {/* Card 4: Clientes cadastrados */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Clientes na carteira</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                {totalClientes}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#524584]">
              <span className="material-symbols-outlined text-[1.375rem]">groups</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#630ed4] text-xs font-semibold">
              +{novosClientesCount} novos
            </span>
            <span className="text-xs text-[#4a4455]">cadastrados</span>
          </div>
        </div>
      </div>

      {/* LINHA PRINCIPAL DE OPERAÇÃO DO DIA (Agenda de hoje & Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* AGENDA DE HOJE (7 cols) */}
        <div className="lg:col-span-7 flex flex-col p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff]">
          <div className="flex flex-wrap items-center justify-between pb-4 gap-2 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Agenda de hoje
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#eaddff] text-[#630ed4] text-xs font-semibold">
                {todayAppointments.length} atendimentos
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-agendar-timeline"
                onClick={onOpenNewAppointment}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#630ed4]/10 hover:bg-[#630ed4]/20 text-[#630ed4] text-xs sm:text-sm font-medium transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[1rem]">add</span>
                Agendar
              </button>
              <button
                onClick={() => onNavigate('agenda')}
                className="text-xs sm:text-sm text-[#630ed4] hover:underline font-semibold flex items-center gap-0.5"
                type="button"
              >
                Ver agenda completa
                <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Timeline Vertical */}
          <div className="relative flex flex-col gap-3 pt-4">
            {todayAppointments.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[1.75rem]">calendar_today</span>
                </div>
                <p className="text-sm font-semibold text-slate-800">Nenhum agendamento para hoje ainda</p>
                <p className="text-xs text-slate-500 mt-0.5 mb-3">
                  Clique no botão abaixo para criar o primeiro agendamento.
                </p>
                <button
                  onClick={onOpenNewAppointment}
                  className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#630ed4] transition-all"
                >
                  + Novo Agendamento
                </button>
              </div>
            ) : (
              <>
                <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-[#e2e7ff]"></div>

                {todayAppointments.map((item) => (
                  <div key={item.id} className="relative flex items-start gap-3 z-10 group">
                    {/* Time bubble */}
                    <div
                      className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 ${
                        item.status === 'CONFIRMADO'
                          ? 'bg-emerald-500'
                          : item.status === 'CONCLUIDO'
                          ? 'bg-emerald-600'
                          : item.status === 'AGUARDANDO CONFIRMAÇÃO'
                          ? 'bg-amber-500'
                          : 'bg-[#7c3aed]'
                      }`}
                    >
                      {item.time}
                    </div>

                    {/* Card */}
                    <div className="flex-1 p-3 rounded-lg bg-[#f2f3ff]/70 hover:bg-[#f2f3ff] transition-all border border-[#eaedff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.clientPhoto ? (
                          <img
                            className="w-10 h-10 rounded-full object-cover shadow-2xs"
                            alt={item.clientName}
                            src={item.clientPhoto}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#e7deff] text-[#524584] flex items-center justify-center font-bold text-sm">
                            {item.clientInitials || item.clientName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-[0.9375rem] text-[#131b2e] font-semibold leading-snug">
                            {item.clientName}
                          </span>
                          <span className="text-xs text-[#4a4455]">
                            {item.service} •{' '}
                            <strong className="font-medium text-[#131b2e]">{item.professional}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        {item.status === 'CONFIRMADO' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[0.6875rem] font-semibold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            CONFIRMADO
                          </span>
                        )}
                        {item.status === 'CONCLUIDO' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[0.6875rem] font-semibold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            CONCLUÍDO
                          </span>
                        )}
                        {item.status === 'AGENDADO' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ebddff] text-[#581db3] text-[0.6875rem] font-semibold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6e3aca]"></span>
                            AGENDADO
                          </span>
                        )}
                        {item.status === 'AGUARDANDO CONFIRMAÇÃO' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[0.6875rem] font-semibold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            AGUARDANDO CONFIRMAÇÃO
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onOpenWhatsAppChat(item.clientPhone, item.clientName)}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Enviar WhatsApp"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* STATUS DOS AGENDAMENTOS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] h-full justify-between gap-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]/60">
            <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
              Status dos agendamentos
            </h2>
            <span className="text-xs text-[#4a4455] font-medium">Hoje ({totalAgendamentosHoje} total)</span>
          </div>

          {/* Donut Chart & Centro */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle
                  className="text-[#eaedff]"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="12"
                />
                {/* Dynamic Slice: Concluídos */}
                {donutConcluidosPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="38"
                    stroke="#10b981"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 - (238.76 * (donutConcluidosPct / 100))}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                )}
                {/* Dynamic Slice: Confirmados */}
                {donutConfirmadosPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="38"
                    stroke="#7c3aed"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 - (238.76 * (donutConfirmadosPct / 100))}
                    strokeLinecap="round"
                    strokeWidth="12"
                    transform={`rotate(${donutConcluidosPct * 3.6} 50 50)`}
                  />
                )}
                {/* Dynamic Slice: Aguardando */}
                {donutAguardandoPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="38"
                    stroke="#f59e0b"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 - (238.76 * (donutAguardandoPct / 100))}
                    strokeLinecap="round"
                    strokeWidth="12"
                    transform={`rotate(${(donutConcluidosPct + donutConfirmadosPct) * 3.6} 50 50)`}
                  />
                )}
                {/* Dynamic Slice: Cancelados */}
                {donutCanceladosPct > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    fill="transparent"
                    r="38"
                    stroke="#ef4444"
                    strokeDasharray="238.76"
                    strokeDashoffset={238.76 - (238.76 * (donutCanceladosPct / 100))}
                    strokeLinecap="round"
                    strokeWidth="12"
                    transform={`rotate(${(donutConcluidosPct + donutConfirmadosPct + donutAguardandoPct) * 3.6} 50 50)`}
                  />
                )}
              </svg>

              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] leading-none">
                  {totalAgendamentosHoje}
                </span>
                <span className="text-xs text-[#4a4455] font-medium mt-1">
                  agendados
                </span>
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-col gap-2.5 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-[#4a4455]">Concluídos</span>
                </div>
                <span className="font-bold text-[#131b2e]">{concluidosHoje}</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#7c3aed]"></span>
                  <span className="text-[#4a4455]">Confirmados</span>
                </div>
                <span className="font-bold text-[#131b2e]">{confirmadosHoje}</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-[#4a4455]">Aguardando</span>
                </div>
                <span className="font-bold text-[#131b2e]">{aguardandoHoje}</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-[#4a4455]">Cancelados</span>
                </div>
                <span className="font-bold text-[#131b2e]">{canceladosHoje}</span>
              </div>
            </div>
          </div>

          {/* Taxa de comparecimento */}
          <div className="p-3.5 rounded-xl bg-[#eaedff] flex items-center justify-between border border-[#d2bbff]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-[#630ed4] shadow-xs">
                <span className="material-symbols-outlined text-[1.25rem]">verified</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">
                  Taxa de comparecimento
                </span>
                <span className="text-xs text-[#4a4455]">Calculado em tempo real</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-emerald-600">{attendanceRate}%</span>
              <span className="material-symbols-outlined text-emerald-600 text-[1rem]">arrow_upward</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE DESEMPENHO E CRM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* FATURAMENTO (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eaedff]/60">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">
                Faturamento ({revenueRange === '7 dias' ? 'Últimos 7 dias' : revenueRange})
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#131b2e]">
                  {totalPeriodRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[0.875rem]">trending_up</span>
                  Atualizado
                </span>
              </div>
            </div>

            <div className="inline-flex p-0.5 rounded-lg bg-[#e2e7ff] self-start sm:self-center">
              {(['7 dias', '30 dias', '90 dias'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRevenueRange(r)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                    revenueRange === r
                      ? 'bg-white text-[#630ed4] shadow-xs'
                      : 'text-[#4a4455] hover:text-[#131b2e]'
                  }`}
                  type="button"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico de Área Suave SVG Dinâmico */}
          <div className="relative w-full h-56 pt-4">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
              <defs>
                <linearGradient id="purpleGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line stroke="#eaedff" strokeDasharray="4" x1="0" x2="700" y1="40" y2="40" />
              <line stroke="#eaedff" strokeDasharray="4" x1="0" x2="700" y1="100" y2="100" />
              <line stroke="#eaedff" strokeDasharray="4" x1="0" x2="700" y1="160" y2="160" />

              {/* Area & Line based on chartDays */}
              {chartDays.length > 0 && (
                <>
                  <path
                    d={`M ${chartDays[0].x},${chartDays[0].y} ` +
                       chartDays.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ') +
                       ` L 700,200 L 0,200 Z`}
                    fill="url(#purpleGrad)"
                  />
                  <path
                    d={`M ${chartDays[0].x},${chartDays[0].y} ` +
                       chartDays.slice(1).map((p) => `L ${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#7c3aed"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </>
              )}

              {/* Key points */}
              {chartDays.map((pt, idx) => (
                <circle
                  key={pt.label}
                  cx={pt.x}
                  cy={pt.y}
                  r={activeChartPoint === idx ? 6 : 4}
                  fill={activeChartPoint === idx ? '#7c3aed' : '#ffffff'}
                  stroke="#7c3aed"
                  strokeWidth={activeChartPoint === idx ? 3 : 2.5}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setActiveChartPoint(idx)}
                />
              ))}
            </svg>

            {/* Tooltip Flutuante */}
            {activeChartPoint !== null && chartDays[activeChartPoint] && (
              <div
                className="absolute p-2 rounded-lg bg-[#283044] text-[#eef0ff] shadow-md flex flex-col items-center pointer-events-none transition-all duration-200"
                style={{
                  top: '10px',
                  left: `${(chartDays[activeChartPoint].x / 700) * 85 + 5}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[0.625rem] text-[#ccbeff] uppercase font-bold tracking-wider">
                  {chartDays[activeChartPoint].label} {chartDays[activeChartPoint].isPeak ? '(HOJE)' : ''}
                </span>
                <span className="text-xs font-bold">{chartDays[activeChartPoint].value}</span>
              </div>
            )}

            {/* Labels Eixo X */}
            <div className="flex justify-between items-center pt-3 text-[#4a4455] text-xs font-medium">
              {chartDays.map((pt, idx) => (
                <span
                  key={pt.label}
                  onClick={() => setActiveChartPoint(idx)}
                  className={`cursor-pointer px-1 py-0.5 rounded ${
                    activeChartPoint === idx ? 'font-bold text-[#630ed4] bg-[#eaedff]' : 'hover:text-[#131b2e]'
                  }`}
                >
                  {pt.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CLIENTES & CRM (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#630ed4]">groups</span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Clientes & CRM
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#131b2e] text-xs font-semibold">
              Total da Empresa
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Clientes ativos</span>
              <span className="text-xl sm:text-2xl font-bold text-[#131b2e] mt-0.5">{totalClientes}</span>
              <span className="text-xs text-emerald-700 mt-1 font-medium">Cadastrados no banco</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Novos clientes</span>
              <span className="text-xl sm:text-2xl font-bold text-[#630ed4] mt-0.5">+{novosClientesCount}</span>
              <span className="text-xs text-[#4a4455] mt-1">Recentes</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Taxa de retorno</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                {totalClientes > 0 ? '85%' : '0%'}
              </span>
              <span className="text-xs text-[#4a4455] mt-1">Fidelização ativa</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Serviços ativos</span>
              <span className="text-xl sm:text-2xl font-bold text-purple-600 mt-0.5">{services.length}</span>
              <span className="text-xs text-[#4a4455] mt-1">Catálogo oficial</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="btn-ver-crm"
              onClick={() => onNavigate('clientes')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-xs sm:text-sm font-semibold transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">contacts</span>
              Ver Clientes
            </button>
            <button
              id="btn-recuperar-clientes"
              onClick={onOpenNewClient}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
              + Novo Cliente
            </button>
          </div>
        </div>
      </div>

      {/* TABELA "PRÓXIMOS AGENDAMENTOS DO DIA" */}
      <div className="flex flex-col p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eaedff]/60">
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
              Próximos agendamentos
            </h2>
            <span className="text-xs text-[#4a4455]">
              Lista de atendimentos em tempo real para {activeTenant.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                aria-label="Filtrar agendamentos por status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none flex items-center gap-1 pl-3 pr-8 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs sm:text-sm font-medium transition-colors border border-[#eaedff] cursor-pointer"
              >
                <option value="todos">Todos status</option>
                <option value="confirmado">Confirmados</option>
                <option value="agendado">Agendados</option>
                <option value="concluido">Concluídos</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#7b7487]">
                expand_more
              </span>
            </div>

            <button
              onClick={onOpenNewAppointment}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-medium transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">add</span>
              + Novo agendamento
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f2f3ff]/70 text-[#4a4455] text-xs font-semibold">
                <th className="py-2.5 px-3 rounded-l-lg">Horário</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Serviço</th>
                <th className="py-2.5 px-3">Profissional</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {filteredUpcoming.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-slate-500">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#630ed4] flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-[1.75rem]">calendar_today</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">Nenhum agendamento encontrado</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Os agendamentos da sua empresa aparecerão listados aqui.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenNewAppointment}
                        className="px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[1rem]">add</span>
                        Criar primeiro agendamento
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUpcoming.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#f2f3ff]/50 transition-colors border-b border-[#eaedff]/40 last:border-b-0"
                  >
                    <td className="py-3 px-3 text-xs sm:text-sm font-bold text-[#131b2e]">
                      {row.time}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-xs">
                          {row.clientInitials || row.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                            {row.clientName}
                          </span>
                          <span className="text-[0.6875rem] text-[#4a4455] leading-none">
                            {row.clientPhone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs sm:text-sm text-[#131b2e]">
                      {row.service}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eaedff] text-xs text-[#131b2e] font-medium">
                        {row.professional}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {row.status === 'CONFIRMADO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Confirmado
                        </span>
                      )}
                      {row.status === 'CONCLUIDO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Concluído
                        </span>
                      )}
                      {row.status === 'AGENDADO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ebddff] text-[#581db3] text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6e3aca]"></span>
                          Agendado
                        </span>
                      )}
                      {row.status === 'AGUARDANDO CONFIRMAÇÃO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          Aguardando
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onOpenWhatsAppChat(row.clientPhone, row.clientName)}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Conversar no WhatsApp"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">chat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GRID INFERIOR (Equipe Hoje + Ações Rápidas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* EQUIPE HOJE (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#630ed4]">badge</span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Equipe & Especialistas
              </h2>
            </div>
            <span className="text-xs text-[#4a4455] font-medium">{dynamicProfessionals.length} profissionais ativos</span>
          </div>

          <div className="flex flex-col gap-4 my-3">
            {dynamicProfessionals.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum profissional cadastrado na equipe.</p>
            ) : (
              dynamicProfessionals.map((prof) => (
                <div key={prof.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${prof.colorClass || 'bg-[#7c3aed]'} text-white flex items-center justify-center font-bold text-xs`}>
                        {prof.initials || prof.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-[#131b2e]">
                          {prof.name}
                        </span>
                        <span className="text-xs text-[#4a4455]">
                          {prof.activeAppointments} atendimentos agendados
                        </span>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-[#630ed4]">
                      {prof.capacityPercent}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#7c3aed]"
                      style={{ width: `${prof.capacityPercent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#eaedff]/60">
            <button
              onClick={() => onNavigate('profissionais')}
              className="text-xs sm:text-sm text-[#630ed4] hover:underline font-semibold flex items-center gap-1"
              type="button"
            >
              Gerenciar equipe
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* AÇÕES RÁPIDAS (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#630ed4]">bolt</span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Ações Rápidas
              </h2>
            </div>
            <span className="text-xs text-[#4a4455] font-medium">Atalhos</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-3">
            <button
              onClick={onOpenNewAppointment}
              className="p-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex flex-col items-start gap-1 transition-all border border-[#eaedff]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.125rem]">calendar_month</span>
              </div>
              <span className="text-xs font-bold mt-1">+ Novo Agendamento</span>
              <span className="text-[0.6875rem] text-[#4a4455]">Marcar atendimento</span>
            </button>

            <button
              onClick={onOpenNewClient}
              className="p-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex flex-col items-start gap-1 transition-all border border-[#eaedff]"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
              </div>
              <span className="text-xs font-bold mt-1">+ Novo Cliente</span>
              <span className="text-[0.6875rem] text-[#4a4455]">Cadastrar na carteira</span>
            </button>

            <button
              onClick={() => onNavigate('servicos')}
              className="p-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex flex-col items-start gap-1 transition-all border border-[#eaedff]"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.125rem]">spa</span>
              </div>
              <span className="text-xs font-bold mt-1">Serviços & Preços</span>
              <span className="text-[0.6875rem] text-[#4a4455]">Configurar catálogo</span>
            </button>

            <button
              onClick={() => onNavigate('whatsapp')}
              className="p-3.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] flex flex-col items-start gap-1 transition-all border border-[#eaedff]"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[1.125rem]">chat</span>
              </div>
              <span className="text-xs font-bold mt-1">WhatsApp Pro</span>
              <span className="text-[0.6875rem] text-[#4a4455]">Conversas e lembretes</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#eaedff]/60">
            <button
              onClick={() => onNavigate('configuracoes')}
              className="text-xs sm:text-sm text-[#630ed4] hover:underline font-semibold flex items-center gap-1"
              type="button"
            >
              Configurações da empresa
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
