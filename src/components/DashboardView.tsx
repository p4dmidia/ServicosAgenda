import React, { useState } from 'react';
import { ScreenType, Appointment } from '../types';
import {
  INITIAL_TODAY_SCHEDULE,
  UPCOMING_APPOINTMENTS_TABLE,
  ATTENTION_ITEMS,
  PROFESSIONALS_DATA,
} from '../data/mockData';

interface DashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenNewAppointment: () => void;
  onOpenNewClient?: () => void;
  onOpenCampaign: () => void;
  onTriggerToast: (msg: string) => void;
  appointments?: Appointment[];
  todaySchedule?: Appointment[];
  upcomingAppointments?: Appointment[];
  onOpenWhatsAppChat: (phone?: string, name?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewAppointment,
  onOpenNewClient = () => {},
  onOpenCampaign,
  onTriggerToast,
  appointments,
  todaySchedule: passedTodaySchedule,
  upcomingAppointments: passedUpcomingAppointments,
  onOpenWhatsAppChat,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'Hoje' | 'Esta semana' | 'Este mês'>('Hoje');
  const [revenueRange, setRevenueRange] = useState<'7 dias' | '30 dias' | '90 dias'>('7 dias');
  const [activeChartPoint, setActiveChartPoint] = useState<number | null>(4); // Default to Friday (index 4)
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const todaySchedule = passedTodaySchedule ?? appointments ?? [];
  const upcomingAppointments = passedUpcomingAppointments ?? appointments ?? [];

  // Chart data for 7 days
  const chartDays = [
    { label: 'Seg', value: 'R$ 2.450', x: 0, y: 160 },
    { label: 'Ter', value: 'R$ 2.980', x: 116, y: 130 },
    { label: 'Qua', value: 'R$ 3.420', x: 233, y: 110 },
    { label: 'Qui', value: 'R$ 2.760', x: 350, y: 140 },
    { label: 'Sex', value: 'R$ 4.280', x: 466, y: 60, isPeak: true },
    { label: 'Sáb', value: 'R$ 4.890', x: 583, y: 40, isSaturdayPeak: true },
    { label: 'Dom', value: 'R$ 1.950', x: 700, y: 90 },
  ];

  const filteredUpcoming = statusFilter === 'todos'
    ? upcomingAppointments
    : upcomingAppointments.filter((item) => item.status.toLowerCase().includes(statusFilter.toLowerCase()));

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-8 pb-10">
      {/* CABEÇALHO DE BOAS-VINDAS E FILTRO DE TEMPO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <h1 className="font-headline-lg text-2xl sm:text-[1.75rem] text-[#131b2e] tracking-tight font-semibold">
              Bom dia, Mariane
            </h1>
            <span className="text-2xl select-none" role="img" aria-label="wave">
              👋
            </span>
          </div>
          <p className="text-sm sm:text-base text-[#4a4455]">
            Acompanhe os atendimentos e resultados da sua clínica hoje em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-[#eaedff] text-[#4a4455]">
            <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">
              calendar_today
            </span>
            <span className="text-xs sm:text-sm font-medium text-[#131b2e]">
              Quinta-feira, 24 de Outubro
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
        {/* Card 1 */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Agendamentos hoje</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                28
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#630ed4]">
              <span className="material-symbols-outlined text-[1.375rem]">calendar_month</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[0.875rem]">trending_up</span>
              +12%
            </span>
            <span className="text-xs text-[#4a4455]">em relação à média diária</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Atendimentos concluídos</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                17
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#6e3aca]">
              <span className="material-symbols-outlined text-[1.375rem]">task_alt</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs text-[#4a4455]">
              <span>Progresso do dia</span>
              <span className="font-semibold text-[#131b2e]">61%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#e2e7ff] overflow-hidden">
              <div
                className="h-full bg-[#6e3aca] rounded-full transition-all duration-500"
                style={{ width: '61%' }}
              />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Faturamento hoje</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                R$ 4.280,00
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#7c3aed]">
              <span className="material-symbols-outlined text-[1.375rem]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[0.875rem]">arrow_upward</span>
              +8,4%
            </span>
            <span className="text-xs text-[#4a4455]">comparado a ontem</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm text-[#4a4455] font-medium">Novos clientes</span>
              <span className="font-display text-3xl sm:text-[2.25rem] text-[#131b2e] tracking-tight font-bold">
                8
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#524584]">
              <span className="material-symbols-outlined text-[1.375rem]">person_add</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#e2e7ff] text-[#630ed4] text-xs font-semibold">
              +3 nesta semana
            </span>
            <span className="text-xs text-[#4a4455]">cadastros diretos</span>
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
                {(todaySchedule || []).length} próximos
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
            <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-[#e2e7ff]"></div>

            {(todaySchedule || []).map((item) => (
              <div key={item.id} className="relative flex items-start gap-3 z-10 group">
                {/* Time bubble */}
                <div
                  className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0 ${
                    item.status === 'CONFIRMADO'
                      ? 'bg-emerald-500'
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
                      <button
                        onClick={() => onTriggerToast(`Detalhes de ${item.clientName}`)}
                        className="p-1 rounded-md text-[#7b7487] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
                        type="button"
                        title="Mais opções"
                      >
                        <span className="material-symbols-outlined text-[1.125rem]">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATUS DOS AGENDAMENTOS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] h-full justify-between gap-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]/60">
            <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
              Status dos agendamentos
            </h2>
            <span className="text-xs text-[#4a4455] font-medium">Hoje (28 total)</span>
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
                {/* Concluídos: 17/28 = 60.7% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#10b981"
                  strokeDasharray="238.76"
                  strokeDashoffset="93.8"
                  strokeLinecap="round"
                  strokeWidth="12"
                />
                {/* Confirmados: 7/28 = 25% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#7c3aed"
                  strokeDasharray="238.76"
                  strokeDashoffset="179.0"
                  strokeLinecap="round"
                  strokeWidth="12"
                  transform="rotate(218 50 50)"
                />
                {/* Cancelados: 2/28 = 7.1% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#ef4444"
                  strokeDasharray="238.76"
                  strokeDashoffset="221.8"
                  strokeLinecap="round"
                  strokeWidth="12"
                  transform="rotate(308 50 50)"
                />
                {/* Aguardando: 2/28 = 7.1% */}
                <circle
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="38"
                  stroke="#f59e0b"
                  strokeDasharray="238.76"
                  strokeDashoffset="221.8"
                  strokeLinecap="round"
                  strokeWidth="12"
                  transform="rotate(334 50 50)"
                />
              </svg>

              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] leading-none">
                  28
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
                <span className="font-bold text-[#131b2e]">17</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#7c3aed]"></span>
                  <span className="text-[#4a4455]">Confirmados</span>
                </div>
                <span className="font-bold text-[#131b2e]">7</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-[#4a4455]">Aguardando</span>
                </div>
                <span className="font-bold text-[#131b2e]">2</span>
              </div>
              <div className="flex items-center justify-between sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <span className="text-[#4a4455]">Cancelados</span>
                </div>
                <span className="font-bold text-[#131b2e]">2</span>
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
                <span className="text-xs text-[#4a4455]">Considerando histórico recente</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-bold text-emerald-600">89%</span>
              <span className="material-symbols-outlined text-emerald-600 text-[1rem]">arrow_upward</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO "PRECISA DA SUA ATENÇÃO" & "WHATSAPP & ATENDIMENTO" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Precisa de Atenção (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600">notification_important</span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Precisa da sua atenção
              </h2>
            </div>
            <span className="text-xs text-[#4a4455] font-medium">5 itens pendentes</span>
          </div>

          <div className="flex flex-col gap-1 pt-2">
            {ATTENTION_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.id === 'att-3') onOpenCampaign();
                  else onTriggerToast(`Ação: ${item.title}`);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f2f3ff] transition-colors group cursor-pointer border border-transparent hover:border-[#eaedff]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.badgeType === 'amber'
                        ? 'bg-amber-50 text-amber-700'
                        : item.badgeType === 'rose'
                        ? 'bg-rose-50 text-rose-700'
                        : item.badgeType === 'orange'
                        ? 'bg-orange-50 text-orange-700'
                        : item.badgeType === 'purple'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-[#eaedff] text-[#4a4455]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">{item.icon}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#131b2e] group-hover:text-[#630ed4] transition-colors font-medium">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badgeType === 'amber' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeType === 'rose' && (
                    <span className="text-xs font-semibold text-rose-600">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeType === 'orange' && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {(item.badgeType === 'neutral' || item.badgeType === 'purple') && (
                    <span className="text-xs text-[#4a4455] font-medium">
                      {item.badge}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-[#ccc3d8] text-[1.125rem] group-hover:text-[#630ed4] transition-colors">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp & Atendimento (5 cols) */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                WhatsApp & Atendimento
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Conectado
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xl sm:text-2xl font-bold text-[#131b2e]">7</span>
              <span className="text-[0.6875rem] text-[#4a4455] mt-1 leading-tight">
                Conversas aguardando
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xl sm:text-2xl font-bold text-[#630ed4]">21</span>
              <span className="text-[0.6875rem] text-[#4a4455] mt-1 leading-tight">
                Lembretes enviados
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">18</span>
              <span className="text-[0.6875rem] text-[#4a4455] mt-1 leading-tight">
                Confirmações automáticas
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-start sm:items-center gap-2.5 p-3 rounded-lg bg-emerald-50/80 text-emerald-900 border border-emerald-100">
              <span className="material-symbols-outlined text-emerald-600 text-[1.25rem] shrink-0">
                mark_chat_read
              </span>
              <span className="text-xs leading-relaxed">
                Os disparos automáticos para o turno da tarde foram completados com sucesso.
              </span>
            </div>

            <button
              id="btn-abrir-whatsapp-dashboard"
              onClick={() => onNavigate('whatsapp')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.25rem]">chat</span>
              Abrir atendimento WhatsApp
            </button>
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
                  {revenueRange === '7 dias' ? 'R$ 18.420' : revenueRange === '30 dias' ? 'R$ 74.890' : 'R$ 218.400'}
                </span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[0.875rem]">trending_up</span>
                  +12,8% vs anterior
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

          {/* Gráfico de Área Suave SVG */}
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

              {/* Gradient Area Fill */}
              <path
                d="M 0,160 Q 50,150 116,130 T 233,110 T 350,140 T 466,60 T 583,40 T 700,90 L 700,200 L 0,200 Z"
                fill="url(#purpleGrad)"
              />

              {/* Smooth Spline Curve */}
              <path
                d="M 0,160 Q 50,150 116,130 T 233,110 T 350,140 T 466,60 T 583,40 T 700,90"
                fill="none"
                stroke="#7c3aed"
                strokeLinecap="round"
                strokeWidth="3.5"
              />

              {/* Key points with interactive hover */}
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

            {/* Tooltip Flutuante no Pico ou ponto selecionado */}
            {activeChartPoint !== null && (
              <div
                className="absolute p-2 rounded-lg bg-[#283044] text-[#eef0ff] shadow-md flex flex-col items-center pointer-events-none transition-all duration-200"
                style={{
                  top: '10px',
                  left: `${(chartDays[activeChartPoint].x / 700) * 85 + 5}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <span className="text-[0.625rem] text-[#ccbeff] uppercase font-bold tracking-wider">
                  {chartDays[activeChartPoint].label} {chartDays[activeChartPoint].isPeak ? '(PICO)' : ''}
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
              Total Ativo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Clientes ativos</span>
              <span className="text-xl sm:text-2xl font-bold text-[#131b2e] mt-0.5">1.284</span>
              <span className="text-xs text-emerald-700 mt-1 font-medium">Frequência regular</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Novos este mês</span>
              <span className="text-xl sm:text-2xl font-bold text-[#630ed4] mt-0.5">+86</span>
              <span className="text-xs text-[#4a4455] mt-1">+14% vs mês pass.</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Taxa de retenção</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">72%</span>
              <span className="text-xs text-[#4a4455] mt-1">Alto engajamento</span>
            </div>
            <div className="flex flex-col p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff]">
              <span className="text-xs text-[#4a4455] font-medium">Sem retorno (+30d)</span>
              <span className="text-xl sm:text-2xl font-bold text-amber-600 mt-0.5">143</span>
              <span className="text-xs text-amber-800 mt-1 font-medium">Oportunidade</span>
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
              Ver CRM
            </button>
            <button
              id="btn-recuperar-clientes"
              onClick={onOpenCampaign}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
              Recuperar clientes
            </button>
          </div>
        </div>
      </div>

      {/* TABELA "PRÓXIMOS AGENDAMENTOS DO DIA" */}
      <div className="flex flex-col p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#eaedff]/60">
          <div className="flex flex-col">
            <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
              Próximos agendamentos do dia
            </h2>
            <span className="text-xs text-[#4a4455]">
              Lista operacional de atendimentos das próximas horas
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
                <option value="atendimento">Em atendimento</option>
                <option value="agendado">Agendados</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 pointer-events-none text-xs text-[#7b7487]">
                expand_more
              </span>
            </div>

            <button
              onClick={() => onTriggerToast('Exportando relatório em PDF/Excel...')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs sm:text-sm font-medium transition-colors border border-[#eaedff]"
              type="button"
            >
              <span className="material-symbols-outlined text-[1.125rem]">download</span>
              Exportar
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
                      <p className="text-sm font-semibold text-slate-800">Nenhum agendamento hoje ainda</p>
                      <p className="text-xs text-slate-500 mt-1 mb-4">
                        Os agendamentos confirmados da sua unidade aparecerão listados aqui.
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
                        {row.clientPhoto ? (
                          <img
                            className="w-8 h-8 rounded-full object-cover shadow-2xs"
                            alt={row.clientName}
                            src={row.clientPhoto}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              row.clientInitials === 'GS'
                                ? 'bg-[#ebddff] text-[#6e3aca]'
                                : row.clientInitials === 'CS'
                                ? 'bg-[#dae2fd] text-[#131b2e]'
                                : 'bg-[#e7deff] text-[#524584]'
                            }`}
                          >
                            {row.clientInitials}
                          </div>
                        )}
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
                      {row.status === 'EM ATENDIMENTO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                          Em atendimento
                        </span>
                      )}
                      {row.status === 'AGENDADO' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ebddff] text-[#581db3] text-[0.6875rem] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6e3aca]"></span>
                          Agendado
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
                        <button
                          onClick={() => onTriggerToast(`Opções para ${row.clientName}`)}
                          className="p-1 rounded-lg text-[#7b7487] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors"
                          title="Ver detalhes"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[1.25rem]">more_vert</span>
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

      {/* GRID INFERIOR (Equipe Hoje + Insights com IA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* EQUIPE HOJE (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]/60">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#630ed4]">badge</span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Equipe hoje
              </h2>
            </div>
            <span className="text-xs text-[#4a4455] font-medium">4 profissionais ativos</span>
          </div>

          <div className="flex flex-col gap-4 my-3">
            {PROFESSIONALS_DATA.map((prof) => (
              <div key={prof.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        prof.initials === 'DF'
                          ? 'bg-[#eaddff] text-[#630ed4]'
                          : prof.initials === 'DR'
                          ? 'bg-[#ebddff] text-[#6e3aca]'
                          : prof.initials === 'DC'
                          ? 'bg-[#e7deff] text-[#524584]'
                          : 'bg-[#dae2fd] text-[#131b2e]'
                      }`}
                    >
                      {prof.initials}
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
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      prof.capacityPercent > 80
                        ? 'text-[#630ed4]'
                        : prof.capacityPercent > 70
                        ? 'text-[#6e3aca]'
                        : 'text-[#4a4455]'
                    }`}
                  >
                    {prof.capacityPercent}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prof.capacityPercent > 80
                        ? 'bg-[#7c3aed]'
                        : prof.capacityPercent > 70
                        ? 'bg-[#8856e5]'
                        : prof.capacityPercent > 60
                        ? 'bg-[#6a5d9e]'
                        : 'bg-[#7b7487]'
                    }`}
                    style={{ width: `${prof.capacityPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#eaedff]/60">
            <button
              onClick={() => onNavigate('profissionais')}
              className="text-xs sm:text-sm text-[#630ed4] hover:underline font-semibold flex items-center gap-1"
              type="button"
            >
              Ver escala da equipe
              <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* INSIGHTS INTELIGENTES (6 cols) */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl bg-[#eaedff] shadow-sm border border-[#d2bbff]/40 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-white/60">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#630ed4] text-[1.5rem]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <h2 className="text-lg sm:text-xl text-[#131b2e] font-bold tracking-tight">
                Insights Inteligentes
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#7c3aed] text-white text-xs font-semibold">
              IA Integrada
            </span>
          </div>

          <div className="flex flex-col gap-3 my-3">
            {/* Insight 1 */}
            <div className="p-3.5 rounded-xl bg-white shadow-2xs flex flex-col gap-2.5 border border-[#eaedff]">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#630ed4] shrink-0">
                  <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">
                    143 clientes sem retorno (+30 dias)
                  </span>
                  <p className="text-xs text-[#4a4455] mt-0.5 leading-relaxed">
                    Uma campanha de recuperação por WhatsApp pode preencher com facilidade os horários ociosos desta semana.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  id="btn-insight-campanha"
                  onClick={onOpenCampaign}
                  className="px-3 py-1.5 rounded-lg bg-[#630ed4] text-white hover:bg-[#7c3aed] text-xs font-semibold transition-colors shadow-xs"
                  type="button"
                >
                  Criar campanha de retorno
                </button>
              </div>
            </div>

            {/* Insight 2 */}
            <div className="p-3.5 rounded-xl bg-white shadow-2xs flex flex-col gap-2.5 border border-[#eaedff]">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#6e3aca] shrink-0">
                  <span className="material-symbols-outlined text-[1.125rem]">schedule</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm text-[#131b2e] font-semibold">
                    Ociosidade nas terças-feiras (14h - 16h)
                  </span>
                  <p className="text-xs text-[#4a4455] mt-0.5 leading-relaxed">
                    Historicamente esta janela tem 38% de taxa de preenchimento. Considere pacotes promocionais pontuais.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  id="btn-insight-horarios"
                  onClick={() => onNavigate('agenda')}
                  className="px-3 py-1.5 rounded-lg bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-semibold transition-colors"
                  type="button"
                >
                  Ver horários livres
                </button>
              </div>
            </div>
          </div>

          <span className="text-xs text-[#4a4455] block pt-1">
            Recomendações atualizadas a cada hora com base no histórico da Unidade Centro.
          </span>
        </div>
      </div>

      {/* SEÇÃO COMPACTA "AÇÕES RÁPIDAS" NO FINAL */}
      <div className="flex flex-col p-4 sm:p-5 rounded-xl bg-white shadow-sm border border-[#eaedff] gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#4a4455] font-semibold uppercase tracking-wider">
            Ações Rápidas do Sistema
          </span>
          <span className="text-xs text-[#7b7487]">Atalhos operacionais rápidos</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            id="btn-quick-appointment"
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs font-semibold transition-colors shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add</span>
            + Novo agendamento
          </button>
          <button
            id="btn-quick-new-client"
            onClick={onOpenNewClient}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">person_add</span>
            + Novo cliente
          </button>
          <button
            id="btn-quick-new-professional"
            onClick={() => onNavigate('profissionais')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">badge</span>
            + Novo profissional
          </button>
          <button
            id="btn-quick-send-msg"
            onClick={() => onNavigate('whatsapp')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-emerald-600">chat</span>
            Enviar mensagem
          </button>
          <button
            id="btn-quick-register-expense"
            onClick={() => onNavigate('financeiro')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-rose-600">receipt_long</span>
            Registrar despesa
          </button>
          <button
            id="btn-quick-campaign"
            onClick={onOpenCampaign}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">campaign</span>
            Criar campanha
          </button>
          <button
            id="btn-quick-block-time"
            onClick={() => onTriggerToast('Horário bloqueado na agenda')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#eaedff] hover:bg-[#e2e7ff] text-[#131b2e] text-xs font-medium transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-amber-600">block</span>
            Bloquear horário
          </button>
        </div>
      </div>
    </div>
  );
};
