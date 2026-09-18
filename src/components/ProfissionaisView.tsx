import React, { useState } from 'react';
import { Professional } from '../types';
import { useTenant } from '../context/TenantContext';

interface ProfissionaisViewProps {
  professionals?: Professional[];
  onAddProfessional?: (prof: { name: string; role: string; phone?: string; email?: string; colorClass?: string; photo?: string }) => Promise<void>;
  onDeleteProfessional?: (id: string) => Promise<void>;
  onTriggerToast: (msg: string) => void;
  onOpenNewAppointment: () => void;
}

export const ProfissionaisView: React.FC<ProfissionaisViewProps> = ({
  professionals = [],
  onAddProfessional,
  onDeleteProfessional,
  onTriggerToast,
  onOpenNewAppointment,
}) => {
  const { activeTenant } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [colorClass, setColorClass] = useState('bg-purple-600');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colorOptions = [
    { label: 'Roxo', value: 'bg-purple-600' },
    { label: 'Âmbar', value: 'bg-amber-600' },
    { label: 'Esmeralda', value: 'bg-emerald-600' },
    { label: 'Azul', value: 'bg-blue-600' },
    { label: 'Rosa', value: 'bg-pink-600' },
    { label: 'Grafite', value: 'bg-stone-700' },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (onAddProfessional) {
        await onAddProfessional({
          name: name.trim(),
          role: role.trim() || 'Especialista',
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          colorClass,
        });
      }
      setIsModalOpen(false);
      setName('');
      setRole('');
      setPhone('');
      setEmail('');
      onTriggerToast(`Profissional ${name} cadastrado com sucesso!`);
    } catch (err: any) {
      onTriggerToast(err?.message || 'Erro ao cadastrar profissional.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, profName: string) => {
    if (window.confirm(`Deseja realmente desativar o profissional ${profName}?`)) {
      try {
        if (onDeleteProfessional) {
          await onDeleteProfessional(id);
        }
        onTriggerToast(`Profissional ${profName} desativado.`);
      } catch (err) {
        onTriggerToast('Erro ao desativar profissional.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
            Equipe & Especialistas
          </h1>
          <p className="text-sm text-[#4a4455]">
            Membros e profissionais cadastrados em {activeTenant.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-medium shadow-sm transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">badge</span>
          + Novo profissional
        </button>
      </div>

      {professionals.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#eaedff] text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[2rem]">badge</span>
          </div>
          <h3 className="font-bold text-base text-[#131b2e]">Nenhum profissional cadastrado</h3>
          <p className="text-xs text-[#4a4455] max-w-sm mt-1 mb-4">
            Cadastre os membros da sua equipe para gerenciar atendimentos, comissões e escalas.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#630ed4] transition-all"
          >
            Cadastrar primeiro profissional
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {professionals.map((prof) => (
            <div
              key={prof.id}
              className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
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
                    <div className={`w-12 h-12 rounded-full ${prof.colorClass || 'bg-[#7c3aed]'} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
                      {prof.initials || prof.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base text-[#131b2e] leading-tight">
                      {prof.name}
                    </h3>
                    <p className="text-xs text-[#4a4455] font-medium">{prof.role}</p>
                    <span className="inline-block mt-1 text-[0.625rem] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                      Ativo no sistema
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(prof.id, prof.name)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Desativar profissional"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">delete</span>
                </button>
              </div>

              <div className="my-5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4a4455]">Atendimentos do dia</span>
                  <span className="font-bold text-[#131b2e]">{prof.activeAppointments || 0} consultas</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4a4455]">Taxa de ocupação</span>
                  <span className="font-bold text-[#630ed4]">{prof.capacityPercent || 75}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e2e7ff] overflow-hidden">
                  <div
                    className="h-full bg-[#7c3aed] rounded-full"
                    style={{ width: `${prof.capacityPercent || 75}%` }}
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
      )}

      {/* Modal Novo Profissional */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[1.25rem]">badge</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#131b2e]">Novo Profissional</h2>
                  <p className="text-xs text-[#4a4455]">Adicione um membro à equipe</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white text-[#7b7487] hover:text-[#131b2e]"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Barbeiro / Dra. Mariana"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                  Cargo / Especialidade *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ex: Barbeiro Chefe / Biomédico"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                    WhatsApp (Opcional)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                    Cor de Destaque
                  </label>
                  <select
                    value={colorClass}
                    onChange={(e) => setColorClass(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white"
                  >
                    {colorOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
