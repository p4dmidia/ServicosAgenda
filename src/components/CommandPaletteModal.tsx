import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { CLIENTS_LIST, SERVICES_CATALOG } from '../data/mockData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen: (screen: ScreenType) => void;
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
  onOpenCampaign: () => void;
  onTriggerToast: (msg: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectScreen,
  onOpenNewAppointment,
  onOpenNewClient,
  onOpenCampaign,
  onTriggerToast,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { title: 'Novo agendamento', icon: 'add', action: () => { onClose(); onOpenNewAppointment(); } },
    { title: 'Novo cliente', icon: 'person_add', action: () => { onClose(); onOpenNewClient(); } },
    { title: 'Campanha de recuperação', icon: 'campaign', action: () => { onClose(); onOpenCampaign(); } },
    { title: 'Ver Agenda completa', icon: 'calendar_today', action: () => { onClose(); onSelectScreen('agenda'); } },
    { title: 'Ver Clientes & CRM', icon: 'groups', action: () => { onClose(); onSelectScreen('clientes'); } },
    { title: 'Ver WhatsApp & Disparos', icon: 'chat', action: () => { onClose(); onSelectScreen('whatsapp'); } },
    { title: 'Ver Financeiro', icon: 'account_balance', action: () => { onClose(); onSelectScreen('financeiro'); } },
  ];

  const matchedClients = query.trim()
    ? CLIENTS_LIST.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query))
    : [];

  const matchedServices = query.trim()
    ? SERVICES_CATALOG.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#eaedff] flex items-center gap-3">
          <span className="material-symbols-outlined text-[#7b7487] text-[1.5rem]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, agendamento, serviço ou ação..."
            className="flex-1 text-sm sm:text-base text-[#131b2e] outline-none placeholder:text-[#7b7487]"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#dae2fd] text-[#4a4455] text-xs font-semibold">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3">
          {/* Quick Actions */}
          {!query && (
            <div>
              <span className="text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider px-2 block mb-1">
                Ações Rápidas
              </span>
              <div className="flex flex-col gap-0.5">
                {quickActions.map((qa) => (
                  <button
                    key={qa.title}
                    onClick={qa.action}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#f2f3ff] text-xs sm:text-sm text-[#131b2e] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[#630ed4] text-[1.25rem]">
                      {qa.icon}
                    </span>
                    <span>{qa.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Clients */}
          {matchedClients.length > 0 && (
            <div>
              <span className="text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider px-2 block mb-1">
                Clientes encontrados
              </span>
              <div className="flex flex-col gap-0.5">
                {matchedClients.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onClose();
                      onSelectScreen('clientes');
                      onTriggerToast(`Abrindo cliente ${c.name}`);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#f2f3ff] cursor-pointer text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#7b7487] text-[1.125rem]">person</span>
                      <span className="font-semibold text-[#131b2e]">{c.name}</span>
                      <span className="text-xs text-[#7b7487]">{c.phone}</span>
                    </div>
                    <span className="text-xs text-[#630ed4] font-medium">{c.favoriteService}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Services */}
          {matchedServices.length > 0 && (
            <div>
              <span className="text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider px-2 block mb-1">
                Procedimentos
              </span>
              <div className="flex flex-col gap-0.5">
                {matchedServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onSelectScreen('servicos');
                      onTriggerToast(`Procedimento: ${s.name}`);
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#f2f3ff] cursor-pointer text-xs sm:text-sm"
                  >
                    <span className="font-semibold text-[#131b2e]">{s.name}</span>
                    <span className="text-xs font-bold text-[#630ed4]">R$ {s.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
