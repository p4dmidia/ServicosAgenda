import React, { useState } from 'react';
import { Appointment } from '../types';
import { SERVICES_CATALOG, PROFESSIONALS_DATA } from '../data/mockData';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (apt: Appointment) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAddAppointment,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+55 11 ');
  const [service, setService] = useState(SERVICES_CATALOG[0].name);
  const [professional, setProfessional] = useState(PROFESSIONALS_DATA[0].name);
  const [time, setTime] = useState('18:00');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const matchedService = SERVICES_CATALOG.find((s) => s.name === service);

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      time: time,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientInitials: clientName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      service: service,
      professional: professional,
      status: 'CONFIRMADO',
      price: matchedService?.price || 250,
      duration: matchedService?.duration || '45 min',
    };

    onAddAppointment(newApt);
    onClose();
  };

  return (
    <div
      id="modal-novo-agendamento-backdrop"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="modal-novo-agendamento-content"
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.25rem]">calendar_month</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-[#131b2e]">Novo Agendamento</h2>
              <p className="text-xs text-[#4a4455]">Preencha os dados do cliente e horário</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white text-[#7b7487] hover:text-[#131b2e] transition-colors"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              Nome do Cliente *
            </label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ex: Vanessa Guimarães"
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              WhatsApp / Celular *
            </label>
            <input
              type="text"
              required
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                Procedimento *
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
              >
                {SERVICES_CATALOG.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} (R$ {s.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                Profissional *
              </label>
              <select
                value={professional}
                onChange={(e) => setProfessional(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
              >
                {PROFESSIONALS_DATA.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} - {p.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                Horário *
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
              >
                {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                Notificação WhatsApp
              </label>
              <div className="h-10 flex items-center gap-2 px-3 rounded-lg bg-[#f2f3ff] text-xs text-[#4a4455]">
                <span className="material-symbols-outlined text-emerald-600 text-[1.125rem]">check_circle</span>
                <span>Disparo automático ativado</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              Observações Clínicas (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Primeira sessão de rejuvenescimento facial..."
              className="w-full p-2.5 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Confirmar e Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
