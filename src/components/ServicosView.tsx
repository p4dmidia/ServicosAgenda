import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { useTenant } from '../context/TenantContext';

interface ServicosViewProps {
  services?: ServiceItem[];
  onAddService?: (service: Omit<ServiceItem, 'id' | 'tenantId'>) => Promise<void>;
  onDeleteService?: (id: string) => Promise<void>;
  onOpenNewAppointment: () => void;
  onTriggerToast: (msg: string) => void;
}

export const ServicosView: React.FC<ServicosViewProps> = ({
  services = [],
  onAddService,
  onDeleteService,
  onOpenNewAppointment,
  onTriggerToast,
}) => {
  const { activeTenant } = useTenant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [duration, setDuration] = useState('30 min');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Geral', 'Cabelo', 'Barba', 'Facial', 'Corporal', 'Estética Avançada', 'Combos', 'Tratamentos'];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setIsSubmitting(true);
    try {
      if (onAddService) {
        await onAddService({
          name: name.trim(),
          category: category.trim() || 'Geral',
          duration: duration.trim() || '30 min',
          price: parseFloat(price.replace(',', '.')) || 0,
          description: description.trim() || '',
        });
      }
      setIsModalOpen(false);
      setName('');
      setCategory('Geral');
      setDuration('30 min');
      setPrice('');
      setDescription('');
      onTriggerToast(`Serviço ${name} cadastrado com sucesso!`);
    } catch (err: any) {
      onTriggerToast(err?.message || 'Erro ao cadastrar serviço.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, srvName: string) => {
    if (window.confirm(`Deseja realmente excluir o serviço ${srvName}?`)) {
      try {
        if (onDeleteService) {
          await onDeleteService(id);
        }
        onTriggerToast(`Serviço ${srvName} excluído.`);
      } catch (err) {
        onTriggerToast('Erro ao excluir serviço.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
            Catálogo de Procedimentos & Serviços
          </h1>
          <p className="text-sm text-[#4a4455]">
            Serviços e preços cadastrados para {activeTenant.name}.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-medium shadow-sm transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">add</span>
          + Novo procedimento
        </button>
      </div>

      {services.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#eaedff] text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#7c3aed] flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[2rem]">spa</span>
          </div>
          <h3 className="font-bold text-base text-[#131b2e]">Nenhum serviço cadastrado ainda</h3>
          <p className="text-xs text-[#4a4455] max-w-sm mt-1 mb-4">
            Adicione os procedimentos que sua empresa oferece para liberar o agendamento online e presencial.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#630ed4] transition-all"
          >
            Cadastrar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div>
                <div className="flex items-center justify-between pb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#630ed4] text-xs font-semibold">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7b7487] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[1rem]">schedule</span>
                      {srv.duration}
                    </span>
                    <button
                      onClick={() => handleDelete(srv.id, srv.name)}
                      className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir serviço"
                    >
                      <span className="material-symbols-outlined text-[1rem]">delete</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#131b2e] mt-1 leading-snug">
                  {srv.name}
                </h3>
                <p className="text-xs text-[#4a4455] mt-2 leading-relaxed">
                  {srv.description || 'Procedimento padrão cadastrado.'}
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
      )}

      {/* Modal Novo Serviço */}
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
                  <span className="material-symbols-outlined text-[1.25rem]">spa</span>
                </div>
                <div>
                  <h2 className="font-bold text-base text-[#131b2e]">Novo Procedimento</h2>
                  <p className="text-xs text-[#4a4455]">Cadastre um serviço no catálogo</p>
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
                  Nome do Procedimento / Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Corte de Cabelo / Limpeza de Pele"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                    Duração
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white"
                  >
                    {['15 min', '30 min', '40 min', '45 min', '60 min', '75 min', '90 min', '120 min'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ex: 65.00"
                  className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#131b2e] block mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes sobre o procedimento..."
                  className="w-full p-2.5 rounded-lg border border-[#cbd5e1] text-xs sm:text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
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
                  {isSubmitting ? 'Salvando...' : 'Salvar Procedimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
