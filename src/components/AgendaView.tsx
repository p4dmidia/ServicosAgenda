import React, { useState, useMemo } from 'react';
import { Appointment, AppointmentStatus, ScreenType, Professional } from '../types';
import { useTenant } from '../context/TenantContext';

interface AgendaViewProps {
  onOpenNewAppointment: () => void;
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat: (phone?: string, name?: string) => void;
  onNavigate?: (screen: ScreenType) => void;
  appointments: Appointment[];
  professionals?: Professional[];
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
  appointments = [],
  professionals = [],
  onUpdateAppointmentStatus,
  onAddAppointment,
}) => {
  const { activeTenant } = useTenant();
  const [viewMode, setViewMode] = useState<'diaria' | 'semanal'>('diaria');
  const [selectedProf, setSelectedProf] = useState<string>('todos');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Dynamic calculation of current week days
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun, 1 is Mon
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const daysShort = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const fullWeekDays = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    return daysShort.map((label, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayNum = d.getDate();
      const monthShort = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const isToday = d.toDateString() === today.toDateString();
      const fullMonth = d.toLocaleString('pt-BR', { month: 'long' });
      const full = `${fullWeekDays[i]}, ${dayNum} de ${fullMonth}${isToday ? ' (Hoje)' : ''}`;

      return {
        label,
        day: `${dayNum} ${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}${isToday ? ' (Hoje)' : ''}`,
        full,
        isoDate: d.toISOString().split('T')[0],
        isToday,
      };
    });
  }, []);

  const todayIndex = useMemo(() => {
    const idx = weekDays.findIndex((w) => w.isToday);
    return idx >= 0 ? idx : 0;
  }, [weekDays]);

  const [selectedDateIndex, setSelectedDateIndex] = useState(todayIndex);

  // Active list of professionals (either from props or derived from appointments)
  const activeProfs = useMemo(() => {
    if (professionals.length > 0) return professionals;
    // Derive unique professionals from appointments
    const uniqueNames = Array.from(new Set(appointments.map((a) => a.professional).filter(Boolean)));
    if (uniqueNames.length > 0) {
      return uniqueNames.map((name, i) => ({
        id: `prof-derived-${i}`,
        name,
        role: 'Especialista',
        initials: name.slice(0, 2).toUpperCase(),
        activeAppointments: 0,
        capacityPercent: 70,
        colorClass: 'bg-[#7c3aed]',
      }));
    }
    return [
      {
        id: 'prof-default',
        name: activeTenant.ownerName || 'Profissional Principal',
        role: 'Responsável',
        initials: (activeTenant.ownerName || 'PR').slice(0, 2).toUpperCase(),
        activeAppointments: 0,
        capacityPercent: 80,
        colorClass: 'bg-[#7c3aed]',
      },
    ];
  }, [professionals, appointments, activeTenant.ownerName]);

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  // Form for blocking slot
  const [blockForm, setBlockForm] = useState({
    professional: activeProfs[0]?.name || 'Profissional',
    time: '12:00',
    duration: '30 min',
    reason: 'Intervalo / Almoço',
  });

  const currentDateObj = weekDays[selectedDateIndex] || weekDays[0];

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
      professional: blockForm.professional || activeProfs[0]?.name || 'Geral',
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
              {activeProfs.map((p) => (
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
            onClick={() => setSelectedDateIndex(todayIndex)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {activeProfs.filter(
            (p) => selectedProf === 'todos' || p.name.toLowerCase().includes(selectedProf.toLowerCase())
          ).map((prof) => {
            const profAppointments = filteredAppointments.filter((a) =>
              a.professional.toLowerCase().includes(prof.name.toLowerCase()) ||
              prof.name.toLowerCase().includes(a.professional.toLowerCase())
            );

            const profBlocks = blockedSlots.filter((b) =>
              b.professional.toLowerCase().includes(prof.name.toLowerCase()) ||
              prof.name.toLowerCase().includes(b.professional.toLowerCase())
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white ${prof.colorClass || 'bg-[#7c3aed]'}`}
                    >
                      {prof.initials || prof.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#131b2e] leading-snug">
                        {prof.name}
                      </h3>
                      <p className="text-[0.6875rem] text-[#4a4455] font-medium">{prof.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#630ed4] px-2 py-0.5 rounded-full bg-white border border-[#eaedff]">
                    {profAppointments.length} agendamentos
                  </span>
                </div>

                {/* Slots & Appointments list */}
                <div className="p-3 flex flex-col gap-2.5 min-h-[360px] bg-slate-50/50">
                  {profAppointments.length === 0 && profBlocks.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-[1.75rem] text-slate-300 mb-1">event_available</span>
                      <p className="text-xs font-medium">Grade livre hoje</p>
                      <button
                        onClick={onOpenNewAppointment}
                        className="mt-2 text-xs font-semibold text-[#630ed4] hover:underline"
                      >
                        + Agendar horário
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Blocked slots */}
                      {profBlocks.map((b) => (
                        <div
                          key={b.id}
                          className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[1.125rem] text-amber-600">block</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs">{b.time}</span>
                                <span className="text-[0.6875rem] text-amber-700 font-medium">({b.duration})</span>
                              </div>
                              <p className="text-xs font-semibold text-amber-950 mt-0.5">{b.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBlock(b.id)}
                            className="p-1 text-amber-700 hover:text-rose-600 rounded"
                            title="Desbloquear"
                          >
                            <span className="material-symbols-outlined text-[1rem]">close</span>
                          </button>
                        </div>
                      ))}

                      {/* Appointments */}
                      {profAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-3 rounded-lg bg-white border border-[#eaedff] shadow-xs flex flex-col gap-2 hover:shadow-md transition-shadow group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#131b2e] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[0.875rem] text-[#630ed4]">schedule</span>
                              {apt.time}
                            </span>
                            <span
                              className={`text-[0.625rem] font-bold px-2 py-0.5 rounded-full ${
                                apt.status === 'CONFIRMADO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'CONCLUIDO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : apt.status === 'AGUARDANDO CONFIRMAÇÃO'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-[#ebddff] text-[#581db3]'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-[#131b2e] leading-tight">
                              {apt.clientName}
                            </h4>
                            <p className="text-xs text-[#4a4455] mt-0.5">{apt.service}</p>
                            <p className="text-[0.6875rem] text-slate-400 mt-0.5">R$ {apt.price} • {apt.duration || '30 min'}</p>
                          </div>

                          {/* Quick Actions Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#eaedff] text-xs">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleStatusChange(apt.id, 'CONCLUIDO')}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[0.6875rem]"
                                title="Marcar como concluído"
                              >
                                Concluir
                              </button>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'CANCELADO')}
                                className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[0.6875rem]"
                                title="Cancelar agendamento"
                              >
                                Cancelar
                              </button>
                            </div>

                            <button
                              onClick={() => onOpenWhatsAppChat(apt.clientPhone, apt.clientName)}
                              className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                              title="Abrir WhatsApp"
                            >
                              <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISÃO 2: GRADE SEMANAL */}
      {viewMode === 'semanal' && (
        <div className="rounded-xl bg-white shadow-sm border border-[#eaedff] overflow-hidden">
          <div className="grid grid-cols-6 border-b border-[#eaedff] bg-[#f2f3ff] text-xs font-bold text-[#131b2e] text-center">
            {weekDays.map((w, idx) => (
              <div
                key={w.day}
                className={`py-3 px-2 border-r border-[#eaedff] last:border-r-0 ${
                  selectedDateIndex === idx ? 'bg-[#eaddff] text-[#630ed4]' : ''
                }`}
              >
                <span className="block text-[0.6875rem] uppercase">{w.label}</span>
                <span className="block text-sm mt-0.5">{w.day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-6 divide-x divide-[#eaedff] min-h-[400px] bg-slate-50/50">
            {weekDays.map((w, idx) => {
              const dayAppointments = filteredAppointments;
              return (
                <div key={w.day} className="p-2 flex flex-col gap-2">
                  {idx === selectedDateIndex && dayAppointments.length > 0 ? (
                    dayAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-2.5 rounded-lg bg-white border border-[#eaedff] shadow-2xs text-xs flex flex-col gap-1"
                      >
                        <span className="font-extrabold text-[#630ed4]">{apt.time}</span>
                        <span className="font-bold text-[#131b2e] truncate">{apt.clientName}</span>
                        <span className="text-[0.6875rem] text-[#4a4455] truncate">{apt.service}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[0.6875rem] text-slate-300">
                      Livre
                    </div>
                  )}
                </div>
              );
            })}
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
                  {activeProfs.map((p) => (
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
