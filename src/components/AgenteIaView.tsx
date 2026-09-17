import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { AgenteIaConfig, Appointment } from '../types';

interface AgenteIaViewProps {
  onTriggerToast: (msg: string) => void;
  onAddAppointment?: (apt: Appointment) => void;
}

interface ChatMessage {
  id: string;
  sender: 'client' | 'ai' | 'system';
  text: string;
  time: string;
}

export const AgenteIaView: React.FC<AgenteIaViewProps> = ({
  onTriggerToast,
  onAddAppointment,
}) => {
  const { activeTenant } = useTenant();

  // Configuração da IA
  const [config, setConfig] = useState<AgenteIaConfig>({
    enabled: true,
    agentName: 'Sofia',
    toneOfVoice: 'clinico_especialista',
    autoConfirmAppointments: true,
    allowCancelAndReschedule: true,
    emergencyEscalationPhone: '+55 11 98888-0000',
    clinicDescription: `Somos a ${activeTenant.name}, especializados em saúde estética e bem-estar. Atendemos de segunda a sábado das 08h às 19h.`,
    specialInstructions: 'Sempre ofereça opções de horários com intervalo mínimo de 1 hora. Recomende que procedimentos injetáveis não façam esforço físico por 24h.',
    simulatedConversationsCount: 142,
  });

  // Chat simulado de teste interativo
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'client',
      text: 'Olá! Vocês tem algum horário para drenagem ou massagem amanhã à tarde?',
      time: '14:20',
    },
    {
      id: 'msg-2',
      sender: 'ai',
      text: `Olá! Sou a ${config.agentName}, assistente virtual da *${activeTenant.name}*! ✨ Consultando nossa agenda para amanhã, temos disponibilidade às *15:30* e às *17:00* com nossa especialista. Algum desses horários fica bom para você?`,
      time: '14:20',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'client',
      text: userText,
      time: 'Agora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simula resposta inteligente da IA baseada na fala do cliente
    setTimeout(() => {
      let aiResponseText = '';
      const lower = userText.toLowerCase();

      if (lower.includes('15:30') || lower.includes('17:00') || lower.includes('sim') || lower.includes('quero') || lower.includes('pode ser')) {
        aiResponseText = `Perfeito! Confirmei o seu agendamento para *amanhã às 15:30* aqui na ${activeTenant.name}! 📅 Já reservei o horário no nosso sistema. Caso precise cancelar ou alterar, é só me avisar aqui. Te esperamos!`;
        
        // Se tiver handler de agendamento, registra de verdade
        if (onAddAppointment) {
          onAddAppointment({
            id: `ia-apt-${Date.now()}`,
            time: '15:30',
            clientName: 'Cliente WhatsApp IA',
            clientPhone: '+55 11 98888-7777',
            service: 'Drenagem Linfática Modeladora',
            professional: 'Dra. Especialista',
            status: 'CONFIRMADO',
            price: 180,
            date: 'Amanhã',
          });
        }
      } else if (lower.includes('preço') || lower.includes('valor') || lower.includes('quanto custa')) {
        aiResponseText = `Nossa sessão avulsa de Drenagem é R$ 180,00, ou você pode aproveitar nosso Clube de Assinatura por apenas R$ 289,00/mês com 4 sessões inclusas! Gostaria de agendar uma avaliação?`;
      } else if (lower.includes('endereço') || lower.includes('onde') || lower.includes('local')) {
        aiResponseText = `Estamos localizados em: *${activeTenant.address}*. Temos convênio com estacionamento no próprio edifício! 🚗`;
      } else {
        aiResponseText = `Entendido! Estou à disposição para ajudar você a cuidar de você. Deseja agendar outro procedimento ou prefere falar com nosso atendimento humano?`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        time: 'Agora',
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      onTriggerToast('IA respondeu e atualizou o fluxo da conversa!');
    }, 1200);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast('Configurações do Agente de IA salvas com sucesso!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">smart_toy</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Agente IA Conversacional (WhatsApp)</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                config.enabled
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {config.enabled ? 'IA Ativa 24/7' : 'Desativada'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Atendente virtual autônoma que agenda horários, responde dúvidas e tira dúvidas dos clientes no WhatsApp de <b>{activeTenant.name}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => {
                setConfig({ ...config, enabled: e.target.checked });
                onTriggerToast(e.target.checked ? 'Agente de IA ativado no WhatsApp!' : 'Agente de IA desativado.');
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
          </label>
        </div>
      </div>

      {/* Grid: 2 Colunas (Configurações da IA à esquerda + Simulador WhatsApp à direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: PARÂMETROS DA IA (7 colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#131b2e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c3aed]">tune</span>
              Personalização do Assistente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Nome do Assistente Virtual
                </label>
                <input
                  type="text"
                  value={config.agentName}
                  onChange={(e) => setConfig({ ...config, agentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Tom de Voz & Personalidade
                </label>
                <select
                  value={config.toneOfVoice}
                  onChange={(e) => setConfig({ ...config, toneOfVoice: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="clinico_especialista">Clínico Especialista (Educado e Seguro)</option>
                  <option value="amigavel">Amigável & Caloroso (Empático com Emojis)</option>
                  <option value="formal">Formal & Executivo</option>
                  <option value="descontraido">Descontraído & Estilo Barbearia</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                <div>
                  <p className="text-xs font-bold text-[#131b2e]">Agendamento Autônomo</p>
                  <p className="text-[0.6875rem] text-[#7b7487]">Permite que a IA crie o agendamento diretamente na agenda do sistema</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoConfirmAppointments}
                  onChange={(e) => setConfig({ ...config, autoConfirmAppointments: e.target.checked })}
                  className="w-4 h-4 text-[#7c3aed] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                <div>
                  <p className="text-xs font-bold text-[#131b2e]">Remarcações e Cancelamentos</p>
                  <p className="text-[0.6875rem] text-[#7b7487]">IA pode consultar horários alternativos para clientes que pedirem remarcação</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.allowCancelAndReschedule}
                  onChange={(e) => setConfig({ ...config, allowCancelAndReschedule: e.target.checked })}
                  className="w-4 h-4 text-[#7c3aed] rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">
                Contexto do Estabelecimento (Sobre a Clínica)
              </label>
              <textarea
                rows={3}
                value={config.clinicDescription}
                onChange={(e) => setConfig({ ...config, clinicDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                placeholder="Explique o que a clínica faz, especialidades, estacionamento, etc."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">
                Regras Especiais & Instruções Específicas
              </label>
              <textarea
                rows={3}
                value={config.specialInstructions}
                onChange={(e) => setConfig({ ...config, specialInstructions: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                placeholder="Ex: Não agendar botox para gestantes. Pedir para chegar com 10 min de antecedência."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">
                WhatsApp de Transbordo Humano (Casos Críticos)
              </label>
              <input
                type="text"
                value={config.emergencyEscalationPhone}
                onChange={(e) => setConfig({ ...config, emergencyEscalationPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
              />
              <p className="text-[0.6875rem] text-[#7b7487] mt-1">Número para o qual a IA transfere clientes quando solicitarem falar com atendente</p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Salvar Parâmetros da IA
            </button>
          </form>
        </div>

        {/* COLUNA DIREITA: SIMULADOR WHATSAPP INTERATIVO (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col h-[640px] bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          {/* Header do WhatsApp Mock */}
          <div className="p-3.5 bg-[#075e54] text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                🤖
              </div>
              <div>
                <p className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  {config.agentName} (IA {activeTenant.name})
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </p>
                <p className="text-[0.6875rem] text-emerald-100">Online 24h • Simulador em tempo real</p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'msg-init',
                    sender: 'ai',
                    text: `Olá! Sou a ${config.agentName}, assistente virtual da *${activeTenant.name}*! Como posso te ajudar hoje? 🌸`,
                    time: 'Agora',
                  },
                ]);
                onTriggerToast('Chat simulado resetado!');
              }}
              title="Resetar conversa de teste"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[1.125rem]">restart_alt</span>
            </button>
          </div>

          {/* Mensagens (Fundo WhatsApp) */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#efeae2] space-y-3">
            <div className="text-center my-1">
              <span className="bg-white/80 text-[#7b7487] text-[0.6875rem] px-3 py-1 rounded-full shadow-xs">
                As mensagens são processadas pela IA em linguagem natural
              </span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'client' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'client'
                      ? 'bg-[#d9fdd3] text-[#111b21] rounded-tr-xs'
                      : 'bg-white text-[#111b21] rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[0.625rem] text-[#667781]">
                    <span>{msg.time}</span>
                    {msg.sender === 'client' && (
                      <span className="material-symbols-outlined text-[0.875rem] text-[#53bdeb]">
                        done_all
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white text-[#7b7487] text-xs w-24 rounded-tl-xs shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
              </div>
            )}
          </div>

          {/* Input do Chat */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#f0f2f5] border-t border-[#eaedff] flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite como se fosse um cliente..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-white border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f72] transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[1.25rem]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
