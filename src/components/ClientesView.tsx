import React, { useState, useMemo } from 'react';
import { Client, Appointment } from '../types';
import { useTenant } from '../context/TenantContext';

interface ClientesViewProps {
  onOpenNewClient: () => void;
  onOpenCampaign: () => void;
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat: (phone?: string, name?: string) => void;
  onOpenNewAppointment?: () => void;
  clients?: Client[];
  appointments?: Appointment[];
}

interface ClientTimelineEvent {
  id: string;
  date: string;
  service: string;
  professional: string;
  price: number;
  status: 'CONCLUIDO' | 'CONFIRMADO' | 'NAO_COMPARECEU' | 'CANCELADO';
  notes?: string;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  onOpenNewClient,
  onOpenCampaign,
  onTriggerToast,
  onOpenWhatsAppChat,
  onOpenNewAppointment,
  clients = [],
  appointments = [],
}) => {
  const { activeTenant } = useTenant();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Notes state inside medical/aesthetic chart
  const [clientNotes, setClientNotes] = useState<Record<string, string[]>>({});
  const [newNoteInput, setNewNoteInput] = useState('');

  // Dynamic timeline events from real appointments
  const selectedClientTimeline = useMemo(() => {
    if (!selectedClient) return [];
    const clientApts = appointments.filter((a) =>
      (a.clientName && selectedClient.name && a.clientName.toLowerCase().includes(selectedClient.name.toLowerCase())) ||
      (selectedClient.name && a.clientName && selectedClient.name.toLowerCase().includes(a.clientName.toLowerCase())) ||
      (selectedClient.phone && a.clientPhone && a.clientPhone.replace(/\D/g, '').includes(selectedClient.phone.replace(/\D/g, '')))
    );

    return clientApts.map((a) => ({
      id: a.id,
      date: `${a.date || 'Hoje'} às ${a.time}`,
      service: a.service,
      professional: a.professional,
      price: a.price,
      status: (a.status === 'CONCLUIDO' ? 'CONCLUIDO' : a.status === 'CANCELADO' ? 'CANCELADO' : 'CONFIRMADO') as any,
      notes: `Procedimento realizado com ${a.professional}.`,
    }));
  }, [selectedClient, appointments]);

  const clientList = clients;
  const filteredClients = clientList.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.favoriteService.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'ativos') return client.status === 'Ativo';
    if (activeTab === 'sem-retorno') return client.status.includes('Sem retorno');
    if (activeTab === 'novos') return client.status === 'Novo';
    if (activeTab === 'vip') return client.totalSpent > 1000;
    return true;
  });

  const handleAddNote = (clientId: string) => {
    if (!newNoteInput.trim()) return;
    setClientNotes((prev) => ({
      ...prev,
      [clientId]: [...(prev[clientId] || []), newNoteInput.trim()],
    }));
    setNewNoteInput('');
    onTriggerToast('Nova anotação registrada no prontuário!');
  };

  const totalClients = clients.length;
  const activeClientsCount = clients.filter(
    (c) => c.status === 'Ativo' || (c.appointmentsCount && c.appointmentsCount > 0)
  ).length;
  const newThisMonth = clients.filter(
    (c) => c.status === 'Novo' || (c.lastVisit && c.lastVisit.toLowerCase().includes('hoje'))
  ).length;
  const retentionRate = totalClients > 0
    ? Math.round(((clients.filter((c) => (c.appointmentsCount || 0) >= 2 || c.status === 'Ativo').length) / totalClients) * 100)
    : 100;
  const inactiveCount = clients.filter(
    (c) => c.status?.toLowerCase().includes('sem retorno') || c.status?.toLowerCase().includes('inativo')
  ).length;

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
            Clientes & CRM
          </h1>
          <p className="text-sm text-[#4a4455]">
            Gerenciamento de prontuários, histórico de consultas, faltas e fidelização.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCampaign}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eaedff] text-[#630ed4] hover:bg-[#dae2fd] text-xs sm:text-sm font-semibold transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
            Recuperar Inativos (+30d)
          </button>
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white hover:bg-[#630ed4] text-xs sm:text-sm font-semibold shadow-sm transition-all transform active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
            + Novo Cliente
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs text-[#4a4455] font-medium">Clientes Ativos</span>
          <p className="text-2xl font-bold text-[#131b2e] mt-1">{activeClientsCount}</p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            {totalClients > 0 ? `${totalClients} cliente(s) no total` : 'Frequência regular'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs text-[#4a4455] font-medium">Novos este mês</span>
          <p className="text-2xl font-bold text-[#630ed4] mt-1">{newThisMonth > 0 ? `+${newThisMonth}` : '0'}</p>
          <span className="text-xs text-[#4a4455] mt-1 block">
            {newThisMonth > 0 ? 'Novos cadastros' : 'Nenhum novo no mês'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs text-[#4a4455] font-medium">Taxa de Retenção</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{retentionRate}%</p>
          <span className="text-xs text-[#4a4455] mt-1 block">
            {totalClients > 0 ? 'Fidelidade da base' : 'Aguardando atendimentos'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs text-[#4a4455] font-medium">Sem Retorno (+30d)</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inactiveCount}</p>
          <span className="text-xs text-amber-800 font-semibold mt-1 block">
            {inactiveCount > 0 ? 'Alvo para WhatsApp' : 'Nenhum inativo'}
          </span>
        </div>
      </div>

      {/* Links Exclusivos de Atendimento ao Cliente (White Label) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white shadow-md border border-purple-800/60 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-[#A78BFA] flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-[1.25rem]">link</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Links Exclusivos com a Sua Marca</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Prontos para Enviar
                </span>
              </h3>
              <p className="text-xs text-purple-200/80">
                Envie para seus clientes pelo WhatsApp, Instagram e Google para agendarem e acessarem o portal.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-purple-300 bg-white/5 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-white/10">
            /{activeTenant.slug}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
          {/* Link 1: Agendamento Online */}
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[1rem] text-[#A78BFA]">calendar_month</span>
                Link de Agendamento Online
              </p>
              <p className="text-[11px] font-mono text-purple-200/90 truncate mt-0.5">
                {window.location.origin}/agendar/{activeTenant.slug}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/agendar/${activeTenant.slug}`;
                  navigator.clipboard.writeText(url);
                  onTriggerToast('Link de agendamento copiado com sucesso!');
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-[#4C1D95] text-xs font-bold hover:bg-[#EDE9FE] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                Copiar
              </button>

              <a
                href={`/agendar/${activeTenant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Abrir em nova aba"
              >
                <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/agendar/${activeTenant.slug}`;
                  const msg = encodeURIComponent(`Olá! Você pode agendar seu horário diretamente no nosso sistema pelo link: ${url}`);
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer border border-emerald-400/30"
                title="Compartilhar no WhatsApp"
              >
                <span className="material-symbols-outlined text-[1rem]">chat</span>
              </button>
            </div>
          </div>

          {/* Link 2: Portal do Cliente */}
          <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-sm">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[1rem] text-[#A78BFA]">account_circle</span>
                Link do Portal do Cliente (Login & Cadastro)
              </p>
              <p className="text-[11px] font-mono text-purple-200/90 truncate mt-0.5">
                {window.location.origin}/portal/{activeTenant.slug}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/portal/${activeTenant.slug}`;
                  navigator.clipboard.writeText(url);
                  onTriggerToast('Link do portal do cliente copiado!');
                }}
                className="px-3 py-1.5 rounded-lg bg-white text-[#4C1D95] text-xs font-bold hover:bg-[#EDE9FE] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                Copiar
              </button>

              <a
                href={`/portal/${activeTenant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Abrir em nova aba"
              >
                <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/portal/${activeTenant.slug}`;
                  const msg = encodeURIComponent(`Olá! Acesse nosso portal exclusivo de clientes para consultar seus horários e benefícios: ${url}`);
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer border border-emerald-400/30"
                title="Compartilhar no WhatsApp"
              >
                <span className="material-symbols-outlined text-[1rem]">chat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.25rem]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, telefone ou procedimento..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f2f3ff] text-sm text-[#131b2e] placeholder:text-[#7b7487] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'sem-retorno', label: 'Sem Retorno (+30d)' },
            { id: 'novos', label: 'Novos' },
            { id: 'vip', label: 'Clientes VIP (R$ 1k+)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'bg-[#f2f3ff] text-[#4a4455] hover:bg-[#eaedff]'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-xl bg-white border border-[#eaedff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f2f3ff] text-[#4a4455] text-xs font-semibold border-b border-[#eaedff]">
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Contato WhatsApp</th>
                <th className="py-3 px-4">Última Visita</th>
                <th className="py-3 px-4">Serviço Recorrente</th>
                <th className="py-3 px-4">Total Gasto (LTV)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Prontuário & Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]/60 text-xs sm:text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center max-w-md mx-auto text-slate-500">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 text-[#630ed4] flex items-center justify-center mb-3.5 shadow-inner">
                        <span className="material-symbols-outlined text-[2rem]">group_add</span>
                      </div>
                      <p className="text-base font-bold text-slate-900">Nenhum cliente cadastrado ainda</p>
                      <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed text-center">
                        Cadastre seus primeiros clientes manualmente ou compartilhe seu <strong>Link de Agendamento</strong> para que eles mesmos se cadastrem e reservem horários.
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={onOpenNewClient}
                          className="px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
                          Cadastrar Primeiro Cliente
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const url = `${window.location.origin}/agendar/${activeTenant.slug}`;
                            navigator.clipboard.writeText(url);
                            onTriggerToast('Link de agendamento copiado para enviar aos clientes!');
                          }}
                          className="px-4 py-2.5 rounded-xl bg-[#f2f3ff] hover:bg-[#eaedff] text-[#4C1D95] text-xs font-bold transition-all flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[1.125rem]">link</span>
                          Copiar Link de Agendamento
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-[#f2f3ff]/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {client.photo ? (
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-9 h-9 rounded-full object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#eaddff] text-[#630ed4] flex items-center justify-center font-bold text-xs">
                          {client.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-[#131b2e] group-hover:text-[#630ed4] transition-colors">
                          {client.name}
                        </p>
                        <p className="text-xs text-[#7b7487]">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#4a4455]">
                    {client.phone}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-[#131b2e]">
                    {client.lastVisit}
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-[#4a4455]">
                    {client.favoriteService}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-emerald-700">
                    R$ {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                        client.status === 'Ativo'
                          ? 'bg-emerald-100 text-emerald-800'
                          : client.status === 'Novo'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="px-2.5 py-1 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#630ed4] text-xs font-semibold flex items-center gap-1"
                        type="button"
                        title="Ver prontuário completo"
                      >
                        <span className="material-symbols-outlined text-[1rem]">medical_information</span>
                        Prontuário
                      </button>
                      <button
                        onClick={() => onOpenWhatsAppChat(client.phone, client.name)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Conversar no WhatsApp"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRONTUÁRIO / GAVETA LATERAL DO CLIENTE */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-[#eaedff] overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Header da Gaveta */}
            <div className="p-6 bg-gradient-to-r from-[#1e1743] to-[#283044] text-white flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-lg border border-white/20">
                  {selectedClient.initials}
                </div>
                <div>
                  <h2 className="font-bold text-lg text-white">{selectedClient.name}</h2>
                  <p className="text-xs text-[#ccbeff]">{selectedClient.phone} • {selectedClient.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[0.6875rem] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {selectedClient.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content do Prontuário */}
            <div className="p-6 flex flex-col gap-6">
              {/* Resumo Financeiro & Frequência (PRD Seção 8) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-center">
                  <span className="text-[0.6875rem] text-[#7b7487] font-medium block">Total Gasto (LTV)</span>
                  <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                    R$ {selectedClient.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-center">
                  <span className="text-[0.6875rem] text-[#7b7487] font-medium block">Atendimentos</span>
                  <span className="text-base font-extrabold text-[#630ed4] mt-0.5 block">
                    {clientTimelines[selectedClient.id]?.length || 3} realizados
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] text-center">
                  <span className="text-[0.6875rem] text-[#7b7487] font-medium block">Faltas (No-Show)</span>
                  <span className="text-base font-extrabold text-rose-600 mt-0.5 block">
                    0 faltas
                  </span>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onOpenWhatsAppChat(selectedClient.phone, selectedClient.name);
                      setSelectedClient(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                    WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      onOpenNewAppointment?.();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-bold shadow-xs transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">add</span>
                    Novo Agendamento
                  </button>
                </div>

                {/* Botão de Enviar Link do Portal do Cliente */}
                <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[0.6875rem] font-bold text-purple-900">Acesso ao Portal do Cliente</p>
                    <p className="text-[0.625rem] text-purple-700 truncate">
                      {window.location.origin}/portal/{activeTenant.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const link = `${window.location.origin}/portal/${activeTenant.slug}`;
                        navigator.clipboard?.writeText(link);
                        onTriggerToast('Link do portal do cliente copiado!');
                      }}
                      className="p-1.5 rounded-lg bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold"
                      title="Copiar Link"
                    >
                      <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                    </button>
                    <a
                      href={`https://wa.me/${(selectedClient.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Olá ${selectedClient.name.split(' ')[0]}, aqui é da ${activeTenant.name}! Você pode acompanhar seus agendamentos e agendar novos horários diretamente pelo nosso portal exclusivo: ${window.location.origin}/portal/${activeTenant.slug}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[0.6875rem] font-bold flex items-center gap-1 shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">send</span>
                      <span>Convidar</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Histórico Clínico & Anotações de Procedimentos */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#131b2e] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">clinical_notes</span>
                    Anotações Técnicas & Procedimentos
                  </h3>
                  <span className="text-[0.6875rem] text-[#7b7487]">Visível apenas para a equipe</span>
                </div>

                {/* Input para nova anotação */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNote(selectedClient.id);
                    }}
                    placeholder="Adicionar observação técnica sobre o atendimento..."
                    className="flex-1 h-9 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-xs text-[#131b2e] placeholder-[#7b7487] focus:outline-none focus:border-[#7c3aed]"
                  />
                  <button
                    onClick={() => handleAddNote(selectedClient.id)}
                    className="px-3 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold"
                    type="button"
                  >
                    Salvar
                  </button>
                </div>

                {/* Lista de anotações registradas */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {((clientNotes[selectedClient.id] || []).length === 0 && !selectedClient.favoriteService) ? (
                    <p className="text-xs text-[#7b7487] italic">Nenhuma anotação registrada ainda.</p>
                  ) : (
                    <>
                      {selectedClient.favoriteService && (
                        <div className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-xs flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#630ed4] text-[1rem] shrink-0 mt-0.5">bookmark</span>
                          <span className="text-[#131b2e]">Procedimento de interesse / preferência: <strong>{selectedClient.favoriteService}</strong></span>
                        </div>
                      )}
                      {(clientNotes[selectedClient.id] || []).map((note, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-xs flex items-start gap-2">
                          <span className="material-symbols-outlined text-[#630ed4] text-[1rem] shrink-0 mt-0.5">chat_bubble</span>
                          <span className="text-[#131b2e]">{note}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Linha do Tempo de Atendimentos (Timeline Cronológica) */}
              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-sm text-[#131b2e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[1.125rem] text-[#630ed4]">history</span>
                  Histórico de Consultas & Procedimentos
                </h3>

                <div className="relative pl-6 flex flex-col gap-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#eaedff]">
                  {selectedClientTimeline.length === 0 ? (
                    <p className="text-xs text-[#7b7487] italic py-2">Nenhum atendimento anterior registrado para este cliente.</p>
                  ) : (
                    selectedClientTimeline.map((ev) => (
                      <div key={ev.id} className="relative flex flex-col gap-1 text-xs">
                        <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[0.625rem]">
                          •
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#131b2e]">{ev.service}</span>
                          <span className="font-bold text-emerald-700">R$ {ev.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[0.6875rem] text-[#7b7487]">
                          <span>{ev.professional}</span>
                          <span>{ev.date}</span>
                        </div>
                        <p className="text-[0.6875rem] text-[#4a4455] bg-[#f2f3ff] p-2 rounded-md mt-0.5 border border-[#eaedff]">
                          {ev.notes}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
