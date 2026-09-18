import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { Client, Appointment, Service, SubscriptionPlan, ClientSubscription } from '../types';

interface ClubeAssinaturaViewProps {
  clients?: Client[];
  appointments?: Appointment[];
  services?: Service[];
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const ClubeAssinaturaView: React.FC<ClubeAssinaturaViewProps> = ({
  clients = [],
  appointments = [],
  services = [],
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'assinantes' | 'planos'>('assinantes');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Dynamic initial plans tailored to tenant type and real services
  const defaultPlans = useMemo<SubscriptionPlan[]>(() => {
    const isBarbearia = activeTenant?.type === 'barbearia';
    if (isBarbearia) {
      return [
        {
          id: `plan-barb-1-${activeTenant.id}`,
          name: 'Clube VIP Cabelo & Barba Unlimited',
          category: 'Barbearia',
          price: 149.9,
          interval: 'mensal',
          description: 'Cortes e barbas à vontade no mês, com lavagem especial e cerveja cortesia.',
          includedServices: ['Corte Degradê', 'Barba Terapia com Toalha Quente', 'Lavagem'],
          maxSessionsPerMonth: 999,
          activeSubscribersCount: 0,
          isPopular: true,
        },
        {
          id: `plan-barb-2-${activeTenant.id}`,
          name: 'Passaporte Quinzenal (Corte + Barba)',
          category: 'Barbearia',
          price: 89.9,
          interval: 'mensal',
          description: '2 cortes de cabelo e 2 barboterapias completas por mês.',
          includedServices: ['Corte Masculino', 'Barboterapia'],
          maxSessionsPerMonth: 2,
          activeSubscribersCount: 0,
          isPopular: false,
        },
      ];
    } else {
      return [
        {
          id: `plan-est-1-${activeTenant.id}`,
          name: 'Clube Facial Rejuvenesce Trimestral',
          category: 'Clínica & Estética',
          price: 490.0,
          interval: 'trimestral',
          description: '1 limpeza de pele profunda ao mês + 1 hidratação com ácido hialurônico.',
          includedServices: ['Limpeza de Pele Profunda', 'Peeling de Diamante', 'Hidratação Facial'],
          maxSessionsPerMonth: 2,
          activeSubscribersCount: 0,
          isPopular: true,
        },
        {
          id: `plan-est-2-${activeTenant.id}`,
          name: 'Passaporte Drenagem & Detox Corporal',
          category: 'Estética',
          price: 289.0,
          interval: 'mensal',
          description: '4 sessões no mês com drenagem linfática e massagem modeladora.',
          includedServices: ['Drenagem Linfática', 'Massagem Modeladora'],
          maxSessionsPerMonth: 4,
          activeSubscribersCount: 0,
          isPopular: false,
        },
      ];
    }
  }, [activeTenant.type, activeTenant.id]);

  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);

  // Dynamic subscribers built from real clients in database
  const [subscribers, setSubscribers] = useState<ClientSubscription[]>(() => {
    // If real clients exist, initialize up to 2 active subscribers connected to real database clients
    if (clients.length > 0) {
      return clients.slice(0, Math.min(2, clients.length)).map((c, idx) => {
        const plan = defaultPlans[idx % defaultPlans.length];
        return {
          id: `sub-real-${c.id}`,
          clientId: c.id,
          clientName: c.name,
          clientPhone: c.phone || '+55 11 99999-9999',
          planId: plan.id,
          planName: plan.name,
          price: plan.price,
          status: 'Ativo',
          paymentMethod: idx === 0 ? 'Cartão de Crédito Recorrente' : 'PIX Recorrente',
          startDate: '01 deste mês',
          nextBillingDate: 'Em 30 dias',
          sessionsUsed: 1,
          sessionsTotal: plan.maxSessionsPerMonth,
        };
      });
    }
    return [];
  });

  // Modais
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isNewSubscriberModalOpen, setIsNewSubscriberModalOpen] = useState(false);

  // Form State para Novo Plano
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanInterval, setNewPlanInterval] = useState<'mensal' | 'trimestral' | 'semestral' | 'anual'>('mensal');
  const [newPlanSessions, setNewPlanSessions] = useState('4');
  const [newPlanServices, setNewPlanServices] = useState('Atendimento Completo');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  // Form State para Novo Assinante
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [newSubClientName, setNewSubClientName] = useState(clients[0]?.name || '');
  const [newSubClientPhone, setNewSubClientPhone] = useState(clients[0]?.phone || '+55 11 ');
  const [newSubPlanId, setNewSubPlanId] = useState(plans[0]?.id || '');
  const [newSubPaymentMethod, setNewSubPaymentMethod] = useState<'Cartão de Crédito Recorrente' | 'PIX Recorrente'>('PIX Recorrente');

  // Cálculos de KPIs
  const activeSubscribers = subscribers.filter((s) => s.status === 'Ativo');
  const recurringMRR = activeSubscribers.reduce((acc, cur) => {
    const monthlyRatio = cur.planName.includes('Trimestral') ? 1 / 3 : 1;
    return acc + cur.price * monthlyRatio;
  }, 0);
  const defaultSubscribers = subscribers.filter((s) => s.status === 'Inadimplente');

  const filteredSubscribers = subscribers.filter((s) => {
    if (filterStatus === 'todos') return true;
    return s.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleUseSession = (subId: string) => {
    setSubscribers((prev) =>
      prev.map((s) => {
        if (s.id === subId) {
          if (s.sessionsTotal !== 999 && s.sessionsUsed >= s.sessionsTotal) {
            onTriggerToast('Limite de sessões mensais já foi atingido por este assinante!');
            return s;
          }
          onTriggerToast(`Sessão consumida para ${s.clientName}! (${s.sessionsUsed + 1} de ${s.sessionsTotal === 999 ? '∞' : s.sessionsTotal})`);
          return { ...s, sessionsUsed: s.sessionsUsed + 1 };
        }
        return s;
      })
    );
  };

  const handleNotifyOverdueWhatsApp = (sub: ClientSubscription) => {
    const msg = `Olá *${sub.clientName.split(' ')[0]}*, tudo bem? Identificamos uma pendência na renovação da sua assinatura *${sub.planName}* na *${activeTenant.name}*. Para manter seus benefícios ativos e garantir suas sessões, fale conosco por aqui! 💳✨`;

    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat(sub.clientPhone, sub.clientName);
    }
    navigator.clipboard?.writeText(msg);
    onTriggerToast(`Cobrança copiada e WhatsApp aberto para ${sub.clientName}!`);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName || !newPlanPrice) return;

    const createdPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: newPlanName,
      category: activeTenant.type === 'barbearia' ? 'Barbearia' : 'Estética & Saúde',
      price: parseFloat(newPlanPrice),
      interval: newPlanInterval,
      description: newPlanDesc || 'Acesso recorrente a serviços exclusivos.',
      includedServices: newPlanServices.split(',').map((s) => s.trim()),
      maxSessionsPerMonth: parseInt(newPlanSessions) || 4,
      activeSubscribersCount: 0,
    };

    setPlans((prev) => [createdPlan, ...prev]);
    setIsNewPlanModalOpen(false);
    setNewPlanName('');
    setNewPlanPrice('');
    setNewPlanDesc('');
    onTriggerToast(`Plano "${createdPlan.name}" criado com sucesso!`);
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setNewSubClientName(found.name);
      setNewSubClientPhone(found.phone || '+55 11 ');
    }
  };

  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubClientName.trim() || !newSubClientPhone.trim()) {
      onTriggerToast('Preencha os dados do cliente.');
      return;
    }

    const planObj = plans.find((p) => p.id === newSubPlanId) || plans[0];

    const newSub: ClientSubscription = {
      id: `sub-${Date.now()}`,
      clientId: selectedClientId || `c-${Date.now()}`,
      clientName: newSubClientName,
      clientPhone: newSubClientPhone,
      planId: planObj.id,
      planName: planObj.name,
      price: planObj.price,
      status: 'Ativo',
      paymentMethod: newSubPaymentMethod,
      startDate: 'Hoje',
      nextBillingDate: 'Em 30 dias',
      sessionsUsed: 0,
      sessionsTotal: planObj.maxSessionsPerMonth,
    };

    setSubscribers((prev) => [newSub, ...prev]);
    setIsNewSubscriberModalOpen(false);
    onTriggerToast(`Assinatura de ${newSub.clientName} ativada no plano ${planObj.name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">card_membership</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Clube de Assinaturas & Recorrência</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#7c3aed]">
              Receita Previsível
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Gere receita recorrente mensal (MRR) cobrando mensalidades automáticas via Cartão ou PIX de seus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#eaedff] text-xs sm:text-sm font-semibold text-[#131b2e] hover:bg-[#f8f9fa] transition-all"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add_circle</span>
            Criar Novo Plano
          </button>
          <button
            onClick={() => {
              if (clients.length > 0) {
                setSelectedClientId(clients[0].id);
                setNewSubClientName(clients[0].name);
                setNewSubClientPhone(clients[0].phone || '+55 11 ');
              }
              setIsNewSubscriberModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
            Inscrever Assinante
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">MRR Recorrente</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">repeat</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {recurringMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[0.875rem]">trending_up</span>
            Faturamento garantido todo mês
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Assinantes Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">badge</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {activeSubscribers.length} cliente{activeSubscribers.length !== 1 ? 's' : ''}
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Base de {clients.length} clientes cadastrados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Inadimplência</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">warning</span>
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {defaultSubscribers.length} cliente{defaultSubscribers.length !== 1 ? 's' : ''}
          </p>
          <span className="text-[0.6875rem] text-rose-700 font-medium mt-1 block">
            Cartão falho ou Pix pendente
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Planos Ofertados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">view_carousel</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {plans.length} modalidades
          </p>
          <span className="text-[0.6875rem] text-blue-700 font-medium mt-1 block">
            Disponíveis para venda online
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('assinantes')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'assinantes'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">people</span>
          Assinantes Cadastrados ({subscribers.length})
        </button>

        <button
          onClick={() => setActiveTab('planos')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'planos'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">view_carousel</span>
          Gerenciar Planos & Pacotes ({plans.length})
        </button>
      </div>

      {/* TAB 1: LISTA DE ASSINANTES */}
      {activeTab === 'assinantes' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="inline-flex p-0.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
              {[
                { id: 'todos', label: `Todos (${subscribers.length})` },
                { id: 'ativo', label: `Ativos (${activeSubscribers.length})` },
                { id: 'inadimplente', label: `Inadimplentes (${defaultSubscribers.length})` },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filterStatus === st.id
                      ? 'bg-white text-[#630ed4] shadow-xs'
                      : 'text-[#4a4455] hover:text-[#131b2e]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-[#7b7487]">
              Sessões são renovadas automaticamente a cada ciclo
            </span>
          </div>

          {filteredSubscribers.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-[#7c3aed] mb-2">card_membership</span>
              <p className="font-bold text-[#131b2e] text-sm">Nenhum assinante cadastrado</p>
              <p className="text-xs text-[#7b7487] mt-1">
                Inscreva seus primeiros clientes para gerar receita recorrente mensal garantida.
              </p>
              <button
                onClick={() => setIsNewSubscriberModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8]"
                type="button"
              >
                + Inscrever Primeiro Assinante
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#7b7487] uppercase font-bold border-b border-[#eaedff]">
                    <th className="py-3 px-4">Assinante</th>
                    <th className="py-3 px-4">Plano Contratado</th>
                    <th className="py-3 px-4">Forma Pagamento</th>
                    <th className="py-3 px-4">Mensalidade</th>
                    <th className="py-3 px-4">Sessões Utilizadas</th>
                    <th className="py-3 px-4">Próxima Cobrança</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#fcfdff] transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#131b2e]">{sub.clientName}</p>
                        <span className="text-[0.6875rem] text-[#7b7487]">{sub.clientPhone}</span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-[#131b2e]">
                        {sub.planName}
                      </td>

                      <td className="py-3 px-4 text-[#4a4455]">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[1rem] text-[#7c3aed]">
                            {sub.paymentMethod.includes('PIX') ? 'bolt' : 'credit_card'}
                          </span>
                          {sub.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-[#131b2e]">
                        R$ {sub.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#131b2e]">
                            {sub.sessionsUsed} / {sub.sessionsTotal === 999 ? '∞' : sub.sessionsTotal}
                          </span>
                          <button
                            onClick={() => handleUseSession(sub.id)}
                            className="px-2 py-0.5 rounded-md bg-[#f2f3ff] text-[#7c3aed] font-bold text-[0.625rem] hover:bg-[#7c3aed] hover:text-white transition-colors"
                            type="button"
                          >
                            +1 Baixa
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#7b7487]">
                        {sub.nextBillingDate}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                            sub.status === 'Ativo'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleNotifyOverdueWhatsApp(sub)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Conversar / Cobrar pelo WhatsApp"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GERENCIAR PLANOS */}
      {activeTab === 'planos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 relative flex flex-col justify-between ${
                p.isPopular ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/10' : 'border-[#eaedff]'
              }`}
            >
              {p.isPopular && (
                <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#7c3aed] text-white font-bold text-[0.625rem] uppercase tracking-wider">
                  Mais Vendido
                </span>
              )}

              <div>
                <span className="text-[0.6875rem] font-bold text-[#7c3aed] uppercase tracking-wider">
                  {p.category}
                </span>
                <h3 className="font-bold text-base text-[#131b2e] mt-0.5">{p.name}</h3>
                <p className="text-xs text-[#7b7487] mt-1 leading-relaxed">{p.description}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#131b2e]">
                    R$ {p.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#7b7487]">/ {p.interval}</span>
                </div>

                <div className="mt-4 pt-4 border-t border-[#eaedff] space-y-2 text-xs">
                  <p className="font-bold text-[#131b2e]">Benefícios Inclusos:</p>
                  <ul className="space-y-1 text-[#4a4455]">
                    {p.includedServices.map((srv, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[1rem]">check</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setNewSubPlanId(p.id);
                  setIsNewSubscriberModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-[#f2f3ff] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                type="button"
              >
                <span className="material-symbols-outlined text-[1rem]">person_add</span>
                Inscrever neste Plano
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO PLANO */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">add_circle</span>
                <h3 className="font-bold text-base text-[#131b2e]">Novo Plano Recorrente</h3>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Nome do Plano *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clube VIP Cabelo & Barba"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#131b2e] mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="149.90"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-bold focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#131b2e] mb-1">Periodicidade</label>
                  <select
                    value={newPlanInterval}
                    onChange={(e) => setNewPlanInterval(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Sessões Inclusas por Mês</label>
                <input
                  type="number"
                  value={newPlanSessions}
                  onChange={(e) => setNewPlanSessions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Serviços Inclusos (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Corte Masculino, Barboterapia"
                  value={newPlanServices}
                  onChange={(e) => setNewPlanServices(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Cortes e barbas com lavagem e cortesia..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
                >
                  Criar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCREVER ASSINANTE */}
      {isNewSubscriberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">person_add</span>
                <h3 className="font-bold text-base text-[#131b2e]">Inscrever Assinante</h3>
              </div>
              <button
                onClick={() => setIsNewSubscriberModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="p-5 space-y-4 text-xs">
              {clients.length > 0 && (
                <div>
                  <label className="block font-bold text-[#131b2e] mb-1">Selecionar Cliente Cadastrado</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleSelectClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-semibold focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="">-- Escolha um cliente do banco --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'Sem tel'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={newSubClientName}
                  onChange={(e) => setNewSubClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">WhatsApp do Cliente *</label>
                <input
                  type="tel"
                  required
                  value={newSubClientPhone}
                  onChange={(e) => setNewSubClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Plano Desejado</label>
                <select
                  value={newSubPlanId}
                  onChange={(e) => setNewSubPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-bold focus:outline-none focus:border-[#7c3aed]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {p.price.toFixed(2)} ({p.interval})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Forma de Pagamento Recorrente</label>
                <select
                  value={newSubPaymentMethod}
                  onChange={(e) => setNewSubPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="PIX Recorrente">PIX Recorrente Instantâneo</option>
                  <option value="Cartão de Crédito Recorrente">Cartão de Crédito Recorrente</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewSubscriberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
                >
                  Ativar Assinatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
