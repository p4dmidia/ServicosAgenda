import React from 'react';
import { SERVICES_CATALOG } from '../data/mockData';

interface ServicosViewProps {
  onOpenNewAppointment: () => void;
  onTriggerToast: (msg: string) => void;
}

export const ServicosView: React.FC<ServicosViewProps> = ({
  onOpenNewAppointment,
  onTriggerToast,
}) => {
  return (
    <div className="flex flex-col w-full gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
            Catálogo de Procedimentos & Serviços
          </h1>
          <p className="text-sm text-[#4a4455]">
            Tabela de preços, protocolos, duração e profissionais habilitados.
          </p>
        </div>

        <button
          onClick={() => onTriggerToast('Cadastrar novo procedimento estético')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-medium shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[1.125rem]">add</span>
          + Novo procedimento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SERVICES_CATALOG.map((srv) => (
          <div
            key={srv.id}
            className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between pb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#630ed4] text-xs font-semibold">
                  {srv.category}
                </span>
                <span className="text-xs text-[#7b7487] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[1rem]">schedule</span>
                  {srv.duration}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#131b2e] mt-1 leading-snug">
                {srv.name}
              </h3>
              <p className="text-xs text-[#4a4455] mt-2 leading-relaxed">
                {srv.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#eaedff] flex items-center justify-between">
              <div>
                <span className="text-[0.6875rem] text-[#7b7487] block">Valor base</span>
                <span className="text-lg font-bold text-[#131b2e]">
                  R$ {srv.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={onOpenNewAppointment}
                className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Agendar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
