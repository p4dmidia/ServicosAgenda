import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';

interface AjudaSuporteViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const AjudaSuporteView: React.FC<AjudaSuporteViewProps> = ({
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  const handleOpenSupportWhatsApp = () => {
    const msg = `Olá suporte P4D Mídia! Sou da ${activeTenant.name} e preciso de ajuda com o sistema Serviços Agenda.`;
    navigator.clipboard?.writeText(msg);
    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat('+55 11 99999-0000', 'Suporte P4D Mídia');
    }
    onTriggerToast('Canal do suporte acionado via WhatsApp!');
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;
    onTriggerToast('Chamado registrado! Nossa equipe técnica responderá em até 15 minutos.');
    setTicketSubject('');
    setTicketDesc('');
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">help</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Central de Ajuda & Suporte</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
              Suporte VIP Ativo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Tutoriais, documentação operacional e atendimento direto com o time da <b>P4D Mídia</b>.
          </p>
        </div>

        <button
          onClick={handleOpenSupportWhatsApp}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25d366] text-white text-xs sm:text-sm font-bold hover:bg-[#20bd5a] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[1.125rem]">chat</span>
          WhatsApp do Suporte
        </button>
      </div>

      {/* Grid: 3 Colunas de Cards Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
            <span className="material-symbols-outlined text-[1.25rem]">play_circle</span>
          </div>
          <h3 className="font-bold text-sm text-[#131b2e]">Tutoriais em Vídeo</h3>
          <p className="text-xs text-[#7b7487] leading-relaxed">
            Aprenda em 2 minutos como criar serviços, vincular profissionais e configurar lembretes automáticos.
          </p>
          <button
            onClick={() => onTriggerToast('Abrindo playlist de tutoriais...')}
            className="text-xs font-bold text-[#7c3aed] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Acessar Vídeos →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[1.25rem]">qr_code</span>
          </div>
          <h3 className="font-bold text-sm text-[#131b2e]">Material de Balcão (Display)</h3>
          <p className="text-xs text-[#7b7487] leading-relaxed">
            Baixe o modelo em PDF para imprimir o display com o QR Code de agendamento online da sua clínica.
          </p>
          <button
            onClick={() => onTriggerToast('Download do kit de displays iniciado!')}
            className="text-xs font-bold text-[#7c3aed] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Baixar Kit em PDF →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[1.25rem]">support_agent</span>
          </div>
          <h3 className="font-bold text-sm text-[#131b2e]">Plantão Técnico P4D Mídia</h3>
          <p className="text-xs text-[#7b7487] leading-relaxed">
            Atendimento prioritário de segunda a sábado das 08h às 20h para dúvidas, sugestões ou suporte emergencial.
          </p>
          <button
            onClick={handleOpenSupportWhatsApp}
            className="text-xs font-bold text-[#7c3aed] hover:underline inline-flex items-center gap-1 pt-1"
          >
            Falar com Especialista →
          </button>
        </div>
      </div>

      {/* Grid FAQ + Abrir Chamado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FAQ - 7 colunas */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#131b2e]">Perguntas Frequentes (FAQ)</h3>

          <div className="space-y-3">
            {[
              {
                q: 'Como alterar o número do WhatsApp que envia os lembretes?',
                a: 'Acesse a aba WhatsApp Pro > Conexão QR Code e escaneie o código com o aparelho da clínica.',
              },
              {
                q: 'Como funciona a cobrança de sinal Pix no agendamento online?',
                a: 'Na aba Agendamento Online, ative a opção "Cobrar Sinal de Reserva" e defina o valor. O cliente recebe o Pix Copia-e-Cola automaticamente.',
              },
              {
                q: 'Os profissionais têm acesso ao financeiro completo da clínica?',
                a: 'Não. Cada profissional tem acesso restrito apenas à sua própria agenda e relatório de comissões, mantendo o caixa geral protegido.',
              },
              {
                q: 'O que acontece quando o cliente não comparece (No-Show)?',
                a: 'Basta marcar o status do agendamento como "Não Compareceu". O sistema computa no prontuário do paciente e retém o sinal pago.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#eaedff] space-y-1">
                <p className="font-bold text-xs sm:text-sm text-[#131b2e]">{item.q}</p>
                <p className="text-xs text-[#4a4455] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário de Chamado - 5 colunas */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#131b2e]">Abrir Chamado Interno</h3>
          <p className="text-xs text-[#7b7487]">Envie sua solicitação diretamente ao time de desenvolvimento.</p>

          <form onSubmit={handleSendTicket} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Assunto / Tópico</label>
              <input
                type="text"
                placeholder="Ex: Dúvida na emissão de comissões"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Descrição Detalhada</label>
              <textarea
                rows={4}
                placeholder="Explique o que deseja ou anexe observações..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Registrar Solicitação
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
