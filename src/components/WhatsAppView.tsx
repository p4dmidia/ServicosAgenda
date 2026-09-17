import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';

interface WhatsAppViewProps {
  onTriggerToast: (msg: string) => void;
  activeChatPhone?: string;
  activeChatName?: string;
}

interface Message {
  id: string;
  sender: 'client' | 'clinic' | 'bot';
  text: string;
  time: string;
}

interface WhatsAppTrigger {
  id: string;
  title: string;
  description: string;
  timing: string;
  active: boolean;
  template: string;
  stats: { sent: number; confirmed: number };
}

export const WhatsAppView: React.FC<WhatsAppViewProps> = ({
  onTriggerToast,
  activeChatPhone,
  activeChatName,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'conversas' | 'automacoes'>('conversas');
  const [selectedContact, setSelectedContact] = useState<string>(activeChatName || 'Mariana Silveira');
  const [inputText, setInputText] = useState('');

  // WhatsApp triggers list
  const [triggers, setTriggers] = useState<WhatsAppTrigger[]>([
    {
      id: 'trig-1',
      title: 'Confirmação Imediata de Agendamento',
      description: 'Enviado imediatamente após a criação do agendamento (online ou balcão).',
      timing: 'Imediato',
      active: true,
      template: 'Olá {cliente}! Seu agendamento para {servico} na {clinica} foi registrado para {data} às {horario} com {profissional}.',
      stats: { sent: 48, confirmed: 44 },
    },
    {
      id: 'trig-2',
      title: 'Lembrete de Véspera (24 horas antes)',
      description: 'Disparado 1 dia antes para reduzir no-show, com confirmação por resposta rápida.',
      timing: '24h antes',
      active: true,
      template: 'Olá {cliente}! Lembramos do seu horário amanhã às {horario} para {servico}. Por favor, responda *1 para CONFIRMAR* ou *2 para REMARCAR*.',
      stats: { sent: 112, confirmed: 98 },
    },
    {
      id: 'trig-3',
      title: 'Lembrete de Turno (2 horas antes)',
      description: 'Disparado no dia do atendimento com localização no Google Maps e orientações de chegada.',
      timing: '2h antes',
      active: true,
      template: 'Olá {cliente}! Seu atendimento é daqui a pouco, às {horario}. Endereço: {endereco}. Chegue com 10 min de antecedência! Te aguardamos.',
      stats: { sent: 89, confirmed: 86 },
    },
    {
      id: 'trig-4',
      title: 'Pesquisa de Satisfação & Pós-atendimento',
      description: 'Disparado 1 hora após o atendimento ser marcado como Concluído.',
      timing: '1h após conclusão',
      active: true,
      template: 'Oi {cliente}, esperamos que tenha amado sua experiência hoje com {profissional}! De 1 a 5, como avalia seu atendimento?',
      stats: { sent: 64, confirmed: 51 },
    },
    {
      id: 'trig-5',
      title: 'Campanha de Reativação (+30 dias sem retorno)',
      description: 'Disparado para clientes sem retorno há mais de 30 dias com incentivo de retorno.',
      timing: '+30 dias sem visita',
      active: false,
      template: 'Sentimos sua falta na {clinica}, {cliente}! Que tal renovar seus cuidados esta semana com 10% de desconto no Pix? Agende pelo link: {link}',
      stats: { sent: 32, confirmed: 9 },
    },
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'Mariana Silveira': [
      {
        id: '1',
        sender: 'bot',
        text: 'Olá Mariana! Lembramos do seu procedimento de Harmonização Facial hoje às 15:00 na Clínica Bella Vita.',
        time: '08:30',
      },
      {
        id: '2',
        sender: 'client',
        text: 'Bom dia! Perfeito, já estou a caminho da clínica. Preciso chegar com antecedência?',
        time: '09:15',
      },
      {
        id: '3',
        sender: 'clinic',
        text: 'Olá Mariana! Apenas 10 minutos antes para o pré-atendimento com a Dra. Fernanda. Te aguardamos!',
        time: '09:20',
      },
    ],
    'Ana Carolina': [
      {
        id: '1',
        sender: 'bot',
        text: 'Olá Ana! Seu horário para Limpeza de pele profunda hoje às 09:00 está confirmado?',
        time: '07:45',
      },
      {
        id: '2',
        sender: 'client',
        text: 'Confirmadíssimo! Chegando em 5 minutos.',
        time: '08:50',
      },
    ],
    'Patrícia Alves': [
      {
        id: '1',
        sender: 'bot',
        text: 'Olá Patrícia! Gostaríamos de confirmar sua Avaliação Facial com a Dra. Camila às 13:00.',
        time: '10:00',
      },
      {
        id: '2',
        sender: 'client',
        text: 'Olá! Posso adiantar para 12:30 se houver vaga?',
        time: '10:45',
      },
    ],
    'Gabriel Santos': [
      {
        id: '1',
        sender: 'bot',
        text: 'Olá Gabriel! Seu horário para Peeling Químico às 15:45 com Dr. Rafael está confirmado.',
        time: '09:00',
      },
      {
        id: '2',
        sender: 'client',
        text: 'Obrigado pelo lembrete! Estou a caminho.',
        time: '12:10',
      },
    ],
  });

  const contacts = [
    { name: 'Mariana Silveira', phone: '+55 11 98452-1100', lastMsg: 'Te aguardamos!', time: '09:20', unread: 0 },
    { name: 'Ana Carolina', phone: '+55 11 98123-4567', lastMsg: 'Confirmadíssimo! Chegando...', time: '08:50', unread: 0 },
    { name: 'Patrícia Alves', phone: '+55 11 97777-3344', lastMsg: 'Posso adiantar para 12:30...', time: '10:45', unread: 1 },
    { name: 'Gabriel Santos', phone: '+55 11 97103-9944', lastMsg: 'Estou a caminho.', time: '12:10', unread: 0 },
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'clinic',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg],
    }));

    setInputText('');
    onTriggerToast(`Mensagem enviada com sucesso para ${selectedContact}`);
  };

  const handleSendQuickTemplate = (templateText: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'clinic',
      text: templateText,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMsg],
    }));

    onTriggerToast(`Template de resposta enviado para ${selectedContact}`);
  };

  const handleToggleTrigger = (triggerId: string) => {
    setTriggers((prev) =>
      prev.map((tr) => (tr.id === triggerId ? { ...tr, active: !tr.active } : tr))
    );
    onTriggerToast('Configuração de automação atualizada');
  };

  const handleTestTrigger = (trig: WhatsAppTrigger) => {
    onTriggerToast(`[DISPARO TESTE] Gatilho "${trig.title}" simulado via WhatsApp API com sucesso!`);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Header Bar with API Connection Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
              WhatsApp Pro & Automações
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Conectada
            </span>
          </div>
          <p className="text-sm text-[#4a4455]">
            Atendimento centralizado, confirmações automáticas e disparos inteligentes da {activeTenant.name}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-0.5 rounded-xl bg-white border border-[#eaedff] shadow-2xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('conversas')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'conversas'
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'text-[#4a4455] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">chat</span>
            Conversas ao Vivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('automacoes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'automacoes'
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'text-[#4a4455] hover:text-[#131b2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[1.125rem]">smart_toy</span>
            Lembretes & Automações ({triggers.filter((t) => t.active).length})
          </button>
        </div>
      </div>

      {/* TAB 1: CONVERSAS AO VIVO (CHAT) */}
      {activeTab === 'conversas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[620px] bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          {/* Left Column: Contact List */}
          <div className="lg:col-span-4 border-r border-[#eaedff] flex flex-col h-full bg-[#fafbfe]">
            <div className="p-4 border-b border-[#eaedff] flex items-center justify-between">
              <span className="font-bold text-sm text-[#131b2e]">Conversas Recentes</span>
              <span className="text-xs text-[#7b7487] font-medium">{contacts.length} clientes</span>
            </div>

            <div className="divide-y divide-[#eaedff]/60 overflow-y-auto flex-1">
              {contacts.map((c) => (
                <div
                  key={c.name}
                  onClick={() => setSelectedContact(c.name)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    selectedContact === c.name
                      ? 'bg-[#eaedff] border-l-4 border-l-[#7c3aed]'
                      : 'hover:bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed]/10 text-[#630ed4] flex items-center justify-center font-bold text-xs shrink-0">
                    {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#131b2e] truncate">{c.name}</span>
                      <span className="text-[0.625rem] text-[#7b7487]">{c.time}</span>
                    </div>
                    <p className="text-xs text-[#4a4455] truncate mt-0.5">{c.lastMsg}</p>
                    <span className="text-[0.625rem] text-[#7b7487] font-mono">{c.phone}</span>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white text-[0.625rem] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div className="lg:col-span-8 flex flex-col h-full bg-[#f8f9fa]">
            {/* Chat Header */}
            <div className="p-3.5 px-5 bg-white border-b border-[#eaedff] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {selectedContact.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#131b2e]">{selectedContact}</h3>
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    WhatsApp Oficial Conectado
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTriggerToast('Histórico do cliente sincronizado')}
                  className="p-2 rounded-lg text-[#4a4455] hover:bg-[#f2f3ff]"
                  type="button"
                  title="Sincronizar histórico"
                >
                  <span className="material-symbols-outlined text-[1.125rem]">sync</span>
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-3">
              {(messages[selectedContact] || []).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-2xs leading-relaxed ${
                    msg.sender === 'client'
                      ? 'self-start bg-white text-[#131b2e] rounded-tl-xs border border-[#eaedff]'
                      : msg.sender === 'bot'
                      ? 'self-center bg-[#eaedff] text-[#4a4455] border border-[#d2bbff]/40 max-w-[90%] text-center rounded-xl text-xs'
                      : 'self-end bg-[#7c3aed] text-white rounded-tr-xs'
                  }`}
                >
                  {msg.sender === 'bot' && (
                    <span className="font-bold text-[#630ed4] text-[0.6875rem] uppercase block mb-1">
                      🤖 Disparo Automático de Lembrete
                    </span>
                  )}
                  <p>{msg.text}</p>
                  <span
                    className={`text-[0.625rem] mt-1 self-end ${
                      msg.sender === 'clinic' ? 'text-white/75' : 'text-[#7b7487]'
                    }`}
                  >
                    {msg.time} {msg.sender === 'clinic' ? '✓✓' : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Answer Chips */}
            <div className="p-2 px-4 bg-white border-t border-[#eaedff] flex items-center gap-2 overflow-x-auto">
              <span className="text-[0.625rem] text-[#7b7487] font-bold uppercase shrink-0">Respostas:</span>
              {[
                'Seu horário está confirmado!',
                'Pode chegar com 10 min de antecedência.',
                'Temos vaga hoje às 16h para encaixe.',
                'Chave Pix para sinal gerada.',
              ].map((tmpl) => (
                <button
                  key={tmpl}
                  type="button"
                  onClick={() => handleSendQuickTemplate(tmpl)}
                  className="px-2.5 py-1 rounded-full bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-medium whitespace-nowrap transition-colors"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3.5 bg-white border-t border-[#eaedff] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escreva uma mensagem pelo WhatsApp da clínica..."
                className="flex-1 h-10 px-4 rounded-xl bg-[#f2f3ff] text-sm text-[#131b2e] placeholder:text-[#7b7487] outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
              />
              <button
                type="button"
                onClick={handleSendMessage}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Enviar</span>
                <span className="material-symbols-outlined text-[1rem]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CENTRAL DE AUTOMAÇÕES E GATILHOS DO PRD */}
      {activeTab === 'automacoes' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#131b2e]">
                Gatilhos Automáticos do WhatsApp Pro
              </h2>
              <p className="text-xs text-[#7b7487]">
                Configuração de regras de confirmação, lembretes de véspera e redução de no-show conforme PRD.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Webhook de Retorno Ativo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {triggers.map((trig) => (
              <div
                key={trig.id}
                className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#131b2e]">{trig.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#630ed4] text-[0.625rem] font-bold uppercase">
                          {trig.timing}
                        </span>
                      </div>
                      <p className="text-xs text-[#4a4455] mt-1">{trig.description}</p>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleTrigger(trig.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        trig.active ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                      title="Ativar/Desativar automação"
                    >
                      <span
                        className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                          trig.active ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Template Preview */}
                  <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff] text-xs font-mono text-[#131b2e] leading-relaxed">
                    <span className="text-[0.625rem] text-[#7b7487] font-bold uppercase block mb-1">
                      Mensagem disparada:
                    </span>
                    {trig.template}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]/60 text-xs">
                  <div className="flex items-center gap-3 text-[#7b7487]">
                    <span>
                      Enviados: <strong className="text-[#131b2e]">{trig.stats.sent}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Confirmados: <strong className="text-emerald-600">{trig.stats.confirmed}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestTrigger(trig)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#630ed4] text-xs font-semibold transition-colors"
                  >
                    <span className="material-symbols-outlined text-[1rem]">send</span>
                    Simular Disparo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
