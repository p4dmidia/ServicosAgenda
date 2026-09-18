import React, { useState, useEffect } from 'react';
import { Appointment, ServiceItem, Professional } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAppointment: (apt: Appointment) => void;
  services?: ServiceItem[];
  professionals?: Professional[];
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onAddAppointment,
  services = [],
  professionals = [],
}) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+55 11 ');
  const [service, setService] = useState('');
  const [professional, setProfessional] = useState('');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (services.length > 0 && !service) {
      setService(services[0].name);
    }
  }, [services, service]);

  useEffect(() => {
    if (professionals.length > 0 && !professional) {
      setProfessional(professionals[0].name);
    }
  }, [professionals, professional]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const matchedService = services.find((s) => s.name === service);
    const srvName = service || (services[0]?.name ?? 'Procedimento Geral');
    const profName = professional || (professionals[0]?.name ?? 'Especialista');

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
      service: srvName,
      professional: profName,
      status: 'CONFIRMADO',
      price: matchedService?.price || 65,
      duration: matchedService?.duration || '30 min',
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
              {services.length === 0 ? (
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="Nome do procedimento"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e]"
                />
              ) : (
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (R$ {s.price})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                Profissional *
              </label>
              {professionals.length === 0 ? (
                <input
                  type="text"
                  value={professional}
                  onChange={(e) => setProfessional(e.target.value)}
                  placeholder="Nome do profissional"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e]"
                />
              ) : (
                <select
                  value={professional}
                  onChange={(e) => setProfessional(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white cursor-pointer"
                >
                  {professionals.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} - {p.role}
                    </option>
                  ))}
                </select>
              )}
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
                {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'].map(
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
              Observações (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Primeira visita, preferência por corte na tesoura..."
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
