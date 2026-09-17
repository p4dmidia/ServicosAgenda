import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { SubscriptionPlan, ClientSubscription } from '../types';

interface ClubeAssinaturaViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const ClubeAssinaturaView: React.FC<ClubeAssinaturaViewProps> = ({
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'assinantes' | 'planos'>('assinantes');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Planos de Assinatura da Clínica/Barbearia
  const [plans, setPlans] = useState<SubscriptionPlan[]>([
    {
      id: 'plan-1',
      name: 'Clube VIP Cabelo & Barba Unlimited',
      category: 'Barbearia',
      price: 149.9,
      interval: 'mensal',
      description: 'Cortes e barbas à vontade no mês, com lavagem especial e cerveja cortesia.',
      includedServices: ['Corte Degradê', 'Barba Terapia com Toalha Quente', 'Lavagem'],
      maxSessionsPerMonth: 999, // Ilimitado
      activeSubscribersCount: 28,
      isPopular: true,
    },
    {
      id: 'plan-2',
      name: 'Passaporte Drenagem & Detox Corporal',
      category: 'Estética',
      price: 289.0,
      interval: 'mensal',
      description: '4 sessões no mês com drenagem linfática e massagem modeladora.',
      includedServices: ['Drenagem Linfática', 'Massagem Modeladora'],
      maxSessionsPerMonth: 4,
      activeSubscribersCount: 14,
      isPopular: false,
    },
    {
      id: 'plan-3',
      name: 'Clube Facial Rejuvenesce Trimestral',
      category: 'Clínica',
      price: 490.0,
      interval: 'trimestral',
      description: '1 limpeza de pele profunda ao mês + 1 hidratação com ácido hialurônico.',
      includedServices: ['Limpeza de Pele Profunda', 'Peeling de Diamante', 'Hidratação Facial'],
      maxSessionsPerMonth: 2,
      activeSubscribersCount: 9,
      isPopular: true,
    },
  ]);

  // Lista de Clientes Assinantes
  const [subscribers, setSubscribers] = useState<ClientSubscription[]>([
    {
      id: 'sub-1',
      clientId: 'c-1',
      clientName: 'Carlos Eduardo Ramos',
      clientPhone: '+55 11 97233-4411',
      planId: 'plan-1',
      planName: 'Clube VIP Cabelo & Barba Unlimited',
      price: 149.9,
      status: 'Ativo',
      paymentMethod: 'Cartão de Crédito Recorrente',
      startDate: '10/05/2026',
      nextBillingDate: '10/09/2026',
      sessionsUsed: 3,
      sessionsTotal: 999,
    },
    {
      id: 'sub-2',
      clientId: 'c-2',
      clientName: 'Mariana Silveira',
      clientPhone: '+55 11 98452-1100',
      planId: 'plan-3',
      planName: 'Clube Facial Rejuvenesce Trimestral',
      price: 490.0,
      status: 'Ativo',
      paymentMethod: 'PIX Recorrente',
      startDate: '15/07/2026',
      nextBillingDate: '15/10/2026',
      sessionsUsed: 1,
      sessionsTotal: 2,
    },
    {
      id: 'sub-3',
      clientId: 'c-3',
      clientName: 'Fernanda Lima Duarte',
      clientPhone: '+55 11 98877-3344',
      planId: 'plan-2',
      planName: 'Passaporte Drenagem & Detox Corporal',
      price: 289.0,
      status: 'Inadimplente',
      paymentMethod: 'Cartão de Crédito Recorrente',
      startDate: '01/08/2026',
      nextBillingDate: '01/09/2026',
      sessionsUsed: 4,
      sessionsTotal: 4,
    },
    {
      id: 'sub-4',
      clientId: 'c-4',
      clientName: 'Lucas Oliveira Santos',
      clientPhone: '+55 11 96541-2299',
      planId: 'plan-1',
      planName: 'Clube VIP Cabelo & Barba Unlimited',
      price: 149.9,
      status: 'Ativo',
      paymentMethod: 'PIX Recorrente',
      startDate: '20/06/2026',
      nextBillingDate: '20/09/2026',
      sessionsUsed: 2,
      sessionsTotal: 999,
    },
  ]);

  // Modais
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isNewSubscriberModalOpen, setIsNewSubscriberModalOpen] = useState(false);

  // Form State para Novo Plano
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanInterval, setNewPlanInterval] = useState<'mensal' | 'trimestral' | 'semestral' | 'anual'>('mensal');
  const [newPlanSessions, setNewPlanSessions] = useState('4');
  const [newPlanServices, setNewPlanServices] = useState('Corte, Barba');
  const [newPlanDesc, setNewPlanDesc] = useState('');

  // Form State para Novo Assinante
  const [newSubClientName, setNewSubClientName] = useState('');
  const [newSubClientPhone, setNewSubClientPhone] = useState('');
  const [newSubPlanId, setNewSubPlanId] = useState(plans[0]?.id || '');
  const [newSubPaymentMethod, setNewSubPaymentMethod] = useState<'Cartão de Crédito Recorrente' | 'PIX Recorrente'>('PIX Recorrente');

  // Cálculos de KPIs
  const activeSubscribers = subscribers.filter((s) => s.status === 'Ativo');
  const recurringMRR = activeSubscribers.reduce((acc, cur) => {
    // Normaliza trimestral para mensalidade média
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
    const msg = `Olá *${sub.clientName.split(' ')[0]}*, tudo bem? Identificamos uma pendência na renovação da sua assinatura *${sub.planName}* na *${activeTenant.name}*. Para manter seus benefícios ativos e garantir suas sessões, clique no link seguro para atualizar seu pagamento ou nos avise por aqui! 💳✨`;
    
    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat(sub.clientPhone, sub.clientName);
    }
    navigator.clipboard?.writeText(msg);
    onTriggerToast(`Cobrança enviada para o WhatsApp de ${sub.clientName}!`);
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

  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubClientName || !newSubClientPhone) return;

    const planObj = plans.find((p) => p.id === newSubPlanId) || plans[0];

    const newSub: ClientSubscription = {
      id: `sub-${Date.now()}`,
      clientId: `c-${Date.now()}`,
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
    setNewSubClientName('');
    setNewSubClientPhone('');
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
          >
            <span className="material-symbols-outlined text-[1.125rem]">add_circle</span>
            Criar Novo Plano
          </button>
          <button
            onClick={() => setIsNewSubscriberModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
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
            {activeSubscribers.length} clientes
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Retenção média de 8.4 meses
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
        >
          <span className="material-symbols-outlined text-[1.125rem]">layers</span>
          Gerenciar Planos & Pacotes ({plans.length})
        </button>
      </div>

      {/* TAB 1: ASSINANTES */}
      {activeTab === 'assinantes' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterStatus('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  filterStatus === 'todos'
                    ? 'bg-[#131b2e] text-white'
                    : 'bg-[#f8f9fa] text-[#7b7487] hover:bg-[#eaedff]'
                }`}
              >
                Todos ({subscribers.length})
              </button>
              <button
                onClick={() => setFilterStatus('ativo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  filterStatus === 'ativo'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#f8f9fa] text-[#7b7487] hover:bg-[#eaedff]'
                }`}
              >
                Ativos ({activeSubscribers.length})
              </button>
              <button
                onClick={() => setFilterStatus('inadimplente')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                  filterStatus === 'inadimplente'
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#f8f9fa] text-[#7b7487] hover:bg-[#eaedff]'
                }`}
              >
                Inadimplentes ({defaultSubscribers.length})
              </button>
            </div>
            <span className="text-xs text-[#7b7487]">
              Sessões são renovadas automaticamente a cada ciclo
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#eaedff] text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Assinante</th>
                  <th className="py-3.5 px-4">Plano Contratado</th>
                  <th className="py-3.5 px-4">Forma Pagamento</th>
                  <th className="py-3.5 px-4">Mensalidade</th>
                  <th className="py-3.5 px-4">Sessões Utilizadas</th>
                  <th className="py-3.5 px-4">Próxima Cobrança</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#fcfdff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#131b2e] leading-tight">{sub.clientName}</p>
                        <p className="text-[0.6875rem] text-[#7b7487]">{sub.clientPhone}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-[#131b2e]">{sub.planName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[#4a4455] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[1rem] text-[#7c3aed]">
                          {sub.paymentMethod.includes('PIX') ? 'qr_code_2' : 'credit_card'}
                        </span>
                        {sub.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#131b2e]">
                      R$ {sub.price.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">
                          {sub.sessionsUsed} / {sub.sessionsTotal === 999 ? '∞' : sub.sessionsTotal}
                        </span>
                        <button
                          onClick={() => handleUseSession(sub.id)}
                          title="Dar baixa em 1 sessão"
                          className="px-2 py-0.5 rounded bg-purple-50 text-[#7c3aed] text-[0.6875rem] font-bold hover:bg-purple-100"
                        >
                          +1 Baixa
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#7b7487]">
                      {sub.nextBillingDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.status === 'Ativo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === 'Inadimplente' ? (
                        <button
                          onClick={() => handleNotifyOverdueWhatsApp(sub)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1 ml-auto"
                        >
                          <span className="material-symbols-outlined text-[1rem]">chat</span>
                          Cobrar via WhatsApp
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onOpenWhatsAppChat) {
                              onOpenWhatsAppChat(sub.clientPhone, sub.clientName);
                            }
                            onTriggerToast(`Abrindo conversa de ${sub.clientName}`);
                          }}
                          className="p-1.5 rounded-lg bg-[#f2f3ff] text-[#7c3aed] hover:bg-[#e4e7ff]"
                        >
                          <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO DE PLANOS */}
      {activeTab === 'planos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm flex flex-col justify-between relative hover:border-[#7c3aed] transition-all group"
            >
              {plan.isPopular && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[0.6875rem] uppercase shadow-sm">
                  Mais Vendido
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#7c3aed] uppercase tracking-wider">
                    {plan.category}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#f2f3ff] text-[#131b2e] font-semibold capitalize">
                    {plan.interval}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#131b2e] group-hover:text-[#7c3aed] transition-colors">
                  {plan.name}
                </h3>
                <p className="text-xs text-[#4a4455] mt-1.5 leading-relaxed">
                  {plan.description}
                </p>

                <div className="my-4 pt-4 border-t border-[#eaedff]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-[#7b7487]">R$</span>
                    <span className="text-3xl font-black text-[#131b2e]">
                      {plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-[#7b7487]">/{plan.interval === 'mensal' ? 'mês' : plan.interval}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#131b2e] flex items-center gap-1">
                    <span className="material-symbols-outlined text-emerald-500 text-[1rem]">check_circle</span>
                    {plan.maxSessionsPerMonth === 999
                      ? 'Sessões Ilimitadas no período'
                      : `Até ${plan.maxSessionsPerMonth} sessões inclusas/mês`}
                  </p>

                  <div className="text-xs text-[#7b7487] space-y-1 mt-2">
                    {plan.includedServices.map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></span>
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-[#eaedff] flex items-center justify-between">
                <span className="text-xs text-[#7b7487] font-semibold">
                  <b>{plan.activeSubscribersCount}</b> assinantes
                </span>
                <button
                  onClick={() => {
                    setNewSubPlanId(plan.id);
                    setIsNewSubscriberModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#f2f3ff] text-[#7c3aed] text-xs font-bold hover:bg-[#7c3aed] hover:text-white transition-all"
                >
                  + Inscrever
                </button>
              </div>
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
                <span className="material-symbols-outlined text-[#7c3aed]">card_membership</span>
                <h3 className="font-bold text-base text-[#131b2e]">Criar Plano de Assinatura</h3>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome do Plano</label>
                <input
                  type="text"
                  placeholder="Ex: Clube Vip Barba Livre"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="149.90"
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Ciclo</label>
                  <select
                    value={newPlanInterval}
                    onChange={(e) => setNewPlanInterval(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Limite de Sessões/mês</label>
                <input
                  type="number"
                  placeholder="Ex: 4 (ou 999 para ilimitado)"
                  value={newPlanSessions}
                  onChange={(e) => setNewPlanSessions(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Serviços Inclusos (separados por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Corte Degradê, Barboterapia, Lavagem"
                  value={newPlanServices}
                  onChange={(e) => setNewPlanServices(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Benefícios e condições do plano..."
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO ASSINANTE */}
      {isNewSubscriberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">person_add</span>
                <h3 className="font-bold text-base text-[#131b2e]">Inscrever Novo Assinante</h3>
              </div>
              <button
                onClick={() => setIsNewSubscriberModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Beatriz Fagundes"
                  value={newSubClientName}
                  onChange={(e) => setNewSubClientName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">WhatsApp</label>
                <input
                  type="text"
                  placeholder="+55 11 99999-9999"
                  value={newSubClientPhone}
                  onChange={(e) => setNewSubClientPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Plano Escolhido</label>
                <select
                  value={newSubPlanId}
                  onChange={(e) => setNewSubPlanId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold focus:outline-none focus:border-[#7c3aed]"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {p.price.toFixed(2)}/{p.interval}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Forma de Pagamento</label>
                <select
                  value={newSubPaymentMethod}
                  onChange={(e) => setNewSubPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="Cartão de Crédito Recorrente">Cartão de Crédito (Cobrança Automática)</option>
                  <option value="PIX Recorrente">PIX Recorrente (Cobrança com Chave Pix)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewSubscriberModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
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
