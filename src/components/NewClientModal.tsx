import React, { useState } from 'react';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: { name: string; phone: string; email: string; favoriteService: string }) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+55 11 ');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Harmonização Facial');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      favoriteService: service,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#f2f3ff] border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
            </div>
            <div>
              <h2 className="font-bold text-base text-[#131b2e]">Novo Cliente</h2>
              <p className="text-xs text-[#4a4455]">Cadastre um novo paciente no sistema</p>
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
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Juliana Bittencourt"
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              WhatsApp / Celular *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+55 11 99999-8888"
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              E-mail (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@exemplo.com"
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              Procedimento de Interesse
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] text-sm text-[#131b2e] focus:outline-none focus:border-[#7c3aed] bg-white"
            >
              <option value="Harmonização Facial">Harmonização Facial</option>
              <option value="Bioestimulador de Colágeno">Bioestimulador de Colágeno</option>
              <option value="Peeling Químico">Peeling Químico</option>
              <option value="Limpeza de pele profunda">Limpeza de pele profunda</option>
              <option value="Consulta dermatológica">Consulta dermatológica</option>
              <option value="Drenagem Linfática Facial">Drenagem Linfática Facial</option>
            </select>
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
              Salvar Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
