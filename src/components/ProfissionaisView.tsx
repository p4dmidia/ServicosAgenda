import React from 'react';
import { PROFESSIONALS_DATA } from '../data/mockData';

interface ProfissionaisViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenNewAppointment: () => void;
}

export const ProfissionaisView: React.FC<ProfissionaisViewProps> = ({
  onTriggerToast,
  onOpenNewAppointment,
}) => {
  return (
    <div className="flex flex-col w-full gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
            Equipe & Especialistas
          </h1>
          <p className="text-sm text-[#4a4455]">
            Corpo clínico, escalas de atendimento e taxa de ocupação da Unidade Centro.
          </p>
        </div>

        <button
          onClick={() => onTriggerToast('Formulário de cadastro de novo especialista')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-medium shadow-sm transition-colors"
        >
          <span className="material-symbols-outlined text-[1.125rem]">badge</span>
          + Novo profissional
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {PROFESSIONALS_DATA.map((prof) => (
          <div
            key={prof.id}
            className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {prof.photo ? (
                  <img
                    src={prof.photo}
                    alt={prof.name}
                    className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-[#eaedff]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#eaddff] text-[#630ed4] flex items-center justify-center font-bold text-base shadow-sm">
                    {prof.initials}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-[#131b2e] leading-tight">
                    {prof.name}
                  </h3>
                  <p className="text-xs text-[#4a4455] font-medium">{prof.role}</p>
                  <span className="inline-block mt-1 text-[0.625rem] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    Em atendimento hoje
                  </span>
                </div>
              </div>
            </div>

            <div className="my-5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4a4455]">Atendimentos do dia</span>
                <span className="font-bold text-[#131b2e]">{prof.activeAppointments} consultas</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4a4455]">Taxa de ocupação</span>
                <span className="font-bold text-[#630ed4]">{prof.capacityPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden">
                <div
                  className="h-full bg-[#7c3aed] rounded-full"
                  style={{ width: `${prof.capacityPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#eaedff]">
              <button
                onClick={onOpenNewAppointment}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#630ed4] text-xs font-semibold transition-colors"
              >
                Agendar
              </button>
              <button
                onClick={() => onTriggerToast(`Escala completa de ${prof.name}`)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-medium transition-colors"
              >
                Ver escala
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
