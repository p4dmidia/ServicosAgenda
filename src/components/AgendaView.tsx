import React, { useState } from 'react';
import { Appointment, AppointmentStatus, ScreenType } from '../types';
import { PROFESSIONALS_DATA, SERVICES_CATALOG } from '../data/mockData';
import { useTenant } from '../context/TenantContext';

interface AgendaViewProps {
  onOpenNewAppointment: () => void;
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat: (phone?: string, name?: string) => void;
  onNavigate?: (screen: ScreenType) => void;
  appointments: Appointment[];
  onUpdateAppointmentStatus?: (id: string, newStatus: AppointmentStatus) => void;
  onAddAppointment?: (apt: Appointment) => void;
}

interface BlockedSlot {
  id: string;
  professional: string;
  time: string;
  duration: string;
  reason: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  onOpenNewAppointment,
  onTriggerToast,
  onOpenWhatsAppChat,
  onNavigate,
  appointments,
  onUpdateAppointmentStatus,
  onAddAppointment,
}) => {
  const { activeTenant } = useTenant();
  const [viewMode, setViewMode] = useState<'diaria' | 'semanal'>('diaria');
  const [selectedProf, setSelectedProf] = useState<string>('todos');
  const [selectedDateIndex, setSelectedDateIndex] = useState(3); // Quinta-feira
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([
    {
      id: 'block-1',
      professional: 'Dr. Rafael',
      time: '12:00',
      duration: '60 min',
      reason: 'Intervalo de Almoço',
    },
    {
      id: 'block-2',
      professional: 'Dra. Fernanda',
      time: '12:30',
      duration: '30 min',
      reason: 'Higienização de Consultório',
    },
  ]);

  // Form for blocking slot
  const [blockForm, setBlockForm] = useState({
    professional: PROFESSIONALS_DATA[0].name,
    time: '12:00',
    duration: '30 min',
    reason: 'Higienização e Esterilização',
  });

  const weekDays = [
    { label: 'Seg', day: '21 Out', full: 'Segunda-feira, 21 de Outubro' },
    { label: 'Ter', day: '22 Out', full: 'Terça-feira, 22 de Outubro' },
    { label: 'Qua', day: '23 Out', full: 'Quarta-feira, 23 de Outubro' },
    { label: 'Qui', day: '24 Out (Hoje)', full: 'Quinta-feira, 24 de Outubro (Hoje)' },
    { label: 'Sex', day: '25 Out', full: 'Sexta-feira, 25 de Outubro' },
    { label: 'Sáb', day: '26 Out', full: 'Sábado, 26 de Outubro' },
  ];

  const currentDateObj = weekDays[selectedDateIndex] || weekDays[3];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const filteredAppointments = selectedProf === 'todos'
    ? appointments
    : appointments.filter((a) => a.professional.toLowerCase().includes(selectedProf.toLowerCase()));

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    if (onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(id, status);
    } else {
      onTriggerToast(`Status atualizado para: ${status}`);
    }
  };

  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlock: BlockedSlot = {
      id: `block-${Date.now()}`,
      professional: blockForm.professional,
      time: blockForm.time,
      duration: blockForm.duration,
      reason: blockForm.reason,
    };
    setBlockedSlots((prev) => [...prev, newBlock]);
    setIsBlockModalOpen(false);
    onTriggerToast(`Horário ${newBlock.time} bloqueado para ${newBlock.professional}`);
  };

  const handleDeleteBlock = (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
    onTriggerToast('Bloqueio removido da grade');
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
              Grade da Agenda
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaddff] text-[#630ed4] text-xs font-semibold">
              {activeTenant.name}
            </span>
          </div>
          <p className="text-sm text-[#4a4455]">
            Gerenciamento de horários por especialista, controle de no-show e bloqueios de intervalo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Public Booking Link Shortcut */}
          <button
            id="btn-ver-agendamento-online-agenda"
            onClick={() => onNavigate?.('agendamento-online')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold transition-colors border border-emerald-200 shadow-xs"
            type="button"
            title="Abrir página pública de agendamento que os clientes usam"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-emerald-600">open_in_new</span>
            Página de Agendamento Online
          </button>

          {/* Block slot button */}
          <button
            id="btn-bloquear-horario"
            onClick={() => setIsBlockModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs sm:text-sm font-medium transition-colors border border-[#eaedff]"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem] text-amber-600">block</span>
            Bloquear Horário
          </button>

          {/* New appointment button */}
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold shadow-sm hover:bg-[#630ed4] transition-all transform active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add</span>
            + Novo Agendamento
          </button>
        </div>
      </div>

      {/* Control Bar: View Mode, Professional Filter & Date */}
      <div className="p-4 rounded-xl bg-white shadow-sm border border-[#eaedff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View mode selector & Professional */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Daily vs Weekly Toggle */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            <button
              type="button"
              onClick={() => setViewMode('diaria')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'diaria'
                  ? 'bg-white text-[#630ed4] shadow-xs'
                  : 'text-[#4a4455] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">view_day</span>
              Visão Diária
            </button>
            <button
              type="button"
              onClick={() => setViewMode('semanal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'semanal'
                  ? 'bg-white text-[#630ed4] shadow-xs'
                  : 'text-[#4a4455] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">view_week</span>
              Visão Semanal
            </button>
          </div>

          {/* Professional Selector */}
          <div className="flex items-center gap-2 bg-[#f2f3ff] px-3 py-1.5 rounded-lg border border-[#eaedff] text-xs">
            <span className="text-[#4a4455] font-medium">Profissional:</span>
            <select
              aria-label="Selecionar profissional da agenda"
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className="bg-transparent font-bold text-[#630ed4] outline-none cursor-pointer"
            >
              <option value="todos">Todos especialistas</option>
              {PROFESSIONALS_DATA.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Date navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDateIndex((prev) => Math.max(0, prev - 1))}
            disabled={selectedDateIndex === 0}
            className="p-1.5 rounded-lg hover:bg-[#f2f3ff] text-[#4a4455] disabled:opacity-30"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.25rem]">chevron_left</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#630ed4]">calendar_today</span>
            <span className="font-bold text-sm text-[#131b2e]">
              {currentDateObj.full}
            </span>
          </div>
          <button
            onClick={() => setSelectedDateIndex((prev) => Math.min(weekDays.length - 1, prev + 1))}
            disabled={selectedDateIndex === weekDays.length - 1}
            className="p-1.5 rounded-lg hover:bg-[#f2f3ff] text-[#4a4455] disabled:opacity-30"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.25rem]">chevron_right</span>
          </button>
          <button
            onClick={() => setSelectedDateIndex(3)}
            className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-md bg-[#eaedff] text-[#630ed4] hover:bg-[#dae2fd]"
            type="button"
          >
            Hoje
          </button>
        </div>
      </div>

      {/* Week Selector Chips (Fast Day Picker) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {weekDays.map((w, idx) => (
          <button
            key={w.day}
            type="button"
            onClick={() => setSelectedDateIndex(idx)}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              selectedDateIndex === idx
                ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-sm'
                : 'bg-white hover:bg-[#f2f3ff] border-[#eaedff] text-[#4a4455]'
            }`}
          >
            <span className="text-[0.6875rem] uppercase font-bold block">{w.label}</span>
            <span className="text-xs sm:text-sm font-extrabold mt-0.5 block">{w.day}</span>
          </button>
        ))}
      </div>

      {/* VISÃO 1: GRADE DIÁRIA POR PROFISSIONAL */}
      {viewMode === 'diaria' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {PROFESSIONALS_DATA.filter(
            (p) => selectedProf === 'todos' || p.name.toLowerCase().includes(selectedProf.toLowerCase())
          ).map((prof) => {
            const profAppointments = appointments.filter((a) =>
              a.professional.toLowerCase().includes(prof.name.toLowerCase().replace('dra. ', '').replace('dr. ', ''))
            );

            const profBlocks = blockedSlots.filter((b) =>
              b.professional.toLowerCase().includes(prof.name.toLowerCase().replace('dra. ', '').replace('dr. ', ''))
            );

            return (
              <div
                key={prof.id}
                className="flex flex-col rounded-xl bg-white shadow-sm border border-[#eaedff] overflow-hidden"
              >
                {/* Professional Column Header */}
                <div className="p-4 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        prof.initials === 'DF'
                          ? 'bg-[#7c3aed]'
                          : prof.initials === 'DR'
                          ? 'bg-[#6e3aca]'
                          : prof.initials === 'DC'
                          ? 'bg-[#524584]'
                          : 'bg-[#4a4455]'
                      }`}
                    >
                      {prof.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[#131b2e] leading-tight">
                        {prof.name}
                      </h3>
                      <p className="text-[0.6875rem] text-[#4a4455]">{prof.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#630ed4] px-2 py-0.5 rounded-full bg-white shadow-2xs">
                    {profAppointments.length} atendimentos
                  </span>
                </div>

                {/* Slots List */}
                <div className="p-3 flex flex-col gap-3 min-h-[420px] bg-slate-50/50">
                  {/* Blocked Slots for this professional */}
                  {profBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/80 flex flex-col gap-1.5 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900">
                          <span className="material-symbols-outlined text-[1rem]">lock</span>
                          {block.time} ({block.duration})
                        </span>
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-amber-800 hover:text-rose-600 p-0.5"
                          title="Desbloquear horário"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[1rem]">delete</span>
                        </button>
                      </div>
                      <p className="text-xs font-medium text-amber-950">{block.reason}</p>
                      <span className="text-[0.625rem] text-amber-800 uppercase tracking-wider font-semibold">
                        Horário Indisponível
                      </span>
                    </div>
                  ))}

                  {/* Appointments for this professional */}
                  {profAppointments.length === 0 && profBlocks.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-[#7b7487]">
                      <span className="material-symbols-outlined text-[2rem] opacity-30 mb-1">
                        event_available
                      </span>
                      <p className="text-xs">Nenhum atendimento agendado</p>
                      <button
                        onClick={onOpenNewAppointment}
                        className="mt-2 text-xs text-[#630ed4] font-semibold hover:underline"
                        type="button"
                      >
                        + Agendar horário
                      </button>
                    </div>
                  ) : (
                    profAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col gap-2 shadow-2xs ${
                          apt.status === 'CONCLUIDO'
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : apt.status === 'CANCELADO'
                            ? 'bg-rose-50/60 border-rose-200 opacity-70'
                            : apt.status === 'NAO_COMPARECEU'
                            ? 'bg-red-50 border-red-300'
                            : 'bg-white border-[#eaedff] hover:border-[#7c3aed]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#630ed4] px-2 py-0.5 rounded bg-[#eaddff]">
                            {apt.time}
                          </span>

                          {/* Interactive Status Badge / Selector */}
                          <select
                            aria-label="Alterar status do agendamento"
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className={`text-[0.625rem] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${
                              apt.status === 'CONFIRMADO'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : apt.status === 'CONCLUIDO'
                                ? 'bg-emerald-700 text-white border-emerald-800'
                                : apt.status === 'CANCELADO'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : apt.status === 'NAO_COMPARECEU'
                                ? 'bg-red-600 text-white border-red-700 font-extrabold'
                                : apt.status === 'AGUARDANDO CONFIRMAÇÃO'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-[#eaddff] text-[#630ed4] border-[#d2bbff]'
                            }`}
                          >
                            <option value="AGENDADO">Agendado</option>
                            <option value="AGUARDANDO CONFIRMAÇÃO">Aguardando Confirmação</option>
                            <option value="CONFIRMADO">Confirmado</option>
                            <option value="EM ATENDIMENTO">Em Atendimento</option>
                            <option value="CONCLUIDO">Concluído</option>
                            <option value="NAO_COMPARECEU">Não Compareceu (No-Show)</option>
                            <option value="CANCELADO">Cancelado</option>
                          </select>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#131b2e] leading-snug">{apt.clientName}</p>
                          <p className="text-[0.6875rem] text-[#4a4455] mt-0.5">{apt.service}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[0.6875rem] text-[#7b7487]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[0.875rem]">schedule</span>
                            {apt.duration || '60 min'}
                            {apt.price ? ` • R$ ${apt.price}` : ''}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onOpenWhatsAppChat(apt.clientPhone, apt.clientName)}
                              className="text-emerald-600 hover:text-emerald-700 p-1 rounded hover:bg-emerald-50"
                              title="Conversar no WhatsApp"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                            </button>
                            <button
                              onClick={() => onTriggerToast(`Opções avançadas de ${apt.clientName}`)}
                              className="text-[#7b7487] hover:text-[#131b2e] p-1 rounded hover:bg-[#f2f3ff]"
                              type="button"
                              title="Mais opções"
                            >
                              <span className="material-symbols-outlined text-[1.125rem]">more_vert</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISÃO 2: GRADE SEMANAL (SEGUNDA A SÁBADO) */}
      {viewMode === 'semanal' && (
        <div className="rounded-xl bg-white shadow-sm border border-[#eaedff] overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
            <span className="font-bold text-sm text-[#131b2e]">
              Grade de Horários da Semana (Horário comercial)
            </span>
            <span className="text-xs text-[#7b7487]">
              Mostrando agendamentos e capacidade semanal
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px] grid grid-cols-7 divide-x divide-[#eaedff] border-b border-[#eaedff] text-xs font-bold text-[#4a4455] bg-[#f2f3ff]">
              <div className="p-3 text-center">Horário</div>
              {weekDays.map((w) => (
                <div key={w.day} className="p-3 text-center">
                  <span className="block text-[#630ed4]">{w.label}</span>
                  <span className="text-[0.6875rem] text-[#7b7487]">{w.day}</span>
                </div>
              ))}
            </div>

            <div className="min-w-[760px] divide-y divide-[#eaedff]">
              {timeSlots.map((time) => {
                // Appointments matching this hour
                const matchingApts = appointments.filter((a) => a.time.startsWith(time.slice(0, 2)));

                return (
                  <div key={time} className="grid grid-cols-7 divide-x divide-[#eaedff] text-xs hover:bg-[#f8f9fa] transition-colors">
                    <div className="p-3 font-bold text-[#630ed4] bg-[#f2f3ff]/40 flex items-center justify-center">
                      {time}
                    </div>

                    {/* Monday to Saturday columns */}
                    {weekDays.map((w, dIdx) => {
                      const dayApts = dIdx === 3 ? matchingApts : [];

                      return (
                        <div key={w.day} className="p-2 min-h-[56px] flex flex-col gap-1">
                          {dayApts.map((apt) => (
                            <div
                              key={apt.id}
                              className="p-1.5 rounded bg-[#eaddff] text-[#630ed4] border border-[#d2bbff] text-[0.6875rem] font-medium leading-tight truncate cursor-pointer hover:shadow-xs"
                              title={`${apt.clientName} - ${apt.service} com ${apt.professional}`}
                              onClick={() => onTriggerToast(`Detalhes: ${apt.clientName} às ${apt.time}`)}
                            >
                              <span className="font-bold">{apt.clientName.split(' ')[0]}</span> • {apt.service}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueio de Horário */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[1.25rem]">block</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#131b2e]">Bloquear Horário na Grade</h3>
                  <p className="text-xs text-[#7b7487]">Impedir novos agendamentos neste intervalo</p>
                </div>
              </div>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="p-1 rounded-lg text-[#7b7487] hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#131b2e]">Profissional *</label>
                <select
                  value={blockForm.professional}
                  onChange={(e) => setBlockForm({ ...blockForm, professional: e.target.value })}
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                >
                  {PROFESSIONALS_DATA.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#131b2e]">Horário de Início *</label>
                  <select
                    value={blockForm.time}
                    onChange={(e) => setBlockForm({ ...blockForm, time: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                  >
                    {timeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-[#131b2e]">Duração *</label>
                  <select
                    value={blockForm.duration}
                    onChange={(e) => setBlockForm({ ...blockForm, duration: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                  >
                    <option value="15 min">15 minutos</option>
                    <option value="30 min">30 minutos</option>
                    <option value="45 min">45 minutos</option>
                    <option value="60 min">1 hora (60 min)</option>
                    <option value="90 min">1h30 (90 min)</option>
                    <option value="120 min">2 horas</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#131b2e]">Motivo do Bloqueio *</label>
                <input
                  type="text"
                  required
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  placeholder="Ex: Almoço, Reunião de equipe, Higienização..."
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] font-semibold text-[#131b2e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 font-semibold text-white shadow-xs"
                >
                  Confirmar Bloqueio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
