import React, { useState } from 'react';

interface QuickCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerToast: (msg: string) => void;
}

export const QuickCampaignModal: React.FC<QuickCampaignModalProps> = ({
  isOpen,
  onClose,
  onTriggerToast,
}) => {
  const [segment, setSegment] = useState<'30d' | '60d' | 'all'>('30d');
  const [discount, setDiscount] = useState('15%');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [message, setMessage] = useState(
    'Olá {nome}! Notamos que faz algum tempo desde seu último cuidado facial na Clínica Bella Vita. Preparamos uma condição especial de 15% OFF para você renovar seu protocolo esta semana. Responda SIM para agendar!'
  );
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const countTargets = segment === '30d' ? 143 : segment === '60d' ? 58 : 201;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onTriggerToast(`Campanha disparada com sucesso para ${countTargets} clientes via WhatsApp!`);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 bg-[#eaedff] border-b border-[#d2bbff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#7c3aed] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[1.25rem]">campaign</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#131b2e]">Campanha de Recuperação</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#7c3aed] text-white text-[0.625rem] font-bold">
                  IA Integrada
                </span>
              </div>
              <p className="text-xs text-[#4a4455]">
                Reengaje clientes inativos preenchendo horários vagos da semana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white text-[#7b7487] hover:text-[#131b2e] transition-colors"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[#131b2e] block mb-1">
              Segmento de Clientes
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSegment('30d')}
                className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                  segment === '30d'
                    ? 'border-[#7c3aed] bg-[#eaedff] text-[#630ed4]'
                    : 'border-[#eaedff] bg-[#f2f3ff] text-[#4a4455]'
                }`}
              >
                +30 dias sem visita
                <span className="block text-[0.6875rem] font-normal text-[#7b7487]">143 clientes</span>
              </button>
              <button
                type="button"
                onClick={() => setSegment('60d')}
                className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                  segment === '60d'
                    ? 'border-[#7c3aed] bg-[#eaedff] text-[#630ed4]'
                    : 'border-[#eaedff] bg-[#f2f3ff] text-[#4a4455]'
                }`}
              >
                +60 dias sem visita
                <span className="block text-[0.6875rem] font-normal text-[#7b7487]">58 clientes</span>
              </button>
              <button
                type="button"
                onClick={() => setSegment('all')}
                className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all ${
                  segment === 'all'
                    ? 'border-[#7c3aed] bg-[#eaedff] text-[#630ed4]'
                    : 'border-[#eaedff] bg-[#f2f3ff] text-[#4a4455]'
                }`}
              >
                Todos inativos
                <span className="block text-[0.6875rem] font-normal text-[#7b7487]">201 clientes</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#131b2e]">
                Mensagem WhatsApp Automatizada
              </label>
              <span className="text-[0.6875rem] text-emerald-700 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[0.875rem]">auto_awesome</span>
                Otimizado por IA
              </span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg border border-[#cbd5e1] text-xs leading-relaxed text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
            />
            <span className="text-[0.6875rem] text-[#7b7487] block mt-1">
              A tag {'{nome}'} será substituída dinamicamente pelo primeiro nome de cada cliente.
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#131b2e]">
              <span className="material-symbols-outlined text-emerald-600">verified</span>
              <span>Disparo seguro com intervalo randômico de 3s a 7s anti-bloqueio</span>
            </div>
            <span className="text-xs font-bold text-[#630ed4]">{countTargets} envios</span>
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
              type="button"
              disabled={isSending}
              onClick={handleSend}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined text-[1rem] animate-spin">refresh</span>
                  Enviando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[1rem]">send</span>
                  Iniciar Disparo em Massa
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
