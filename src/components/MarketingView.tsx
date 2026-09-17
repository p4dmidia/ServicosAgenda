import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';

interface MarketingViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

interface Campaign {
  id: string;
  name: string;
  targetSegment: string;
  targetCount: number;
  channel: 'WhatsApp' | 'SMS' | 'E-mail';
  status: 'Ativa' | 'Concluída' | 'Agendada' | 'Pausada';
  messagesSent: number;
  conversions: number;
  revenueGenerated: number;
  date: string;
  templateMessage: string;
}

interface Coupon {
  id: string;
  code: string;
  type: 'percentual' | 'fixo';
  value: number;
  usedCount: number;
  maxUses: number;
  validUntil: string;
  status: 'Ativo' | 'Expirado';
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'campanhas' | 'cupons' | 'publicos'>('campanhas');
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isNewCouponModalOpen, setIsNewCouponModalOpen] = useState(false);

  // Campanhas
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp-1',
      name: 'Resgate de Clientes Inativos (+30 dias)',
      targetSegment: 'Sem retorno há mais de 30 dias',
      targetCount: 142,
      channel: 'WhatsApp',
      status: 'Ativa',
      messagesSent: 142,
      conversions: 29,
      revenueGenerated: 6380.0,
      date: 'Hoje, 09:30',
      templateMessage:
        'Olá {nome}! Notamos que faz algum tempo desde sua última visita na {clinica}. Preparamos uma condição de 15% OFF para você retornar esta semana! Responda SIM para ver os horários disponíveis.',
    },
    {
      id: 'camp-2',
      name: 'Especial Aniversariantes de Setembro',
      targetSegment: 'Aniversariantes do Mês',
      targetCount: 38,
      channel: 'WhatsApp',
      status: 'Ativa',
      messagesSent: 38,
      conversions: 14,
      revenueGenerated: 3920.0,
      date: '01/09/2026',
      templateMessage:
        'Parabéns {nome}! 🎂 No mês do seu aniversário, você ganha R$ 50 de presente em qualquer procedimento na {clinica}! Agende até o fim do mês.',
    },
    {
      id: 'camp-3',
      name: 'Lançamento Pacote Drenagem Detox',
      targetSegment: 'Clientes VIP (Frequentes)',
      targetCount: 86,
      channel: 'WhatsApp',
      status: 'Concluída',
      messagesSent: 86,
      conversions: 22,
      revenueGenerated: 5940.0,
      date: '25/08/2026',
      templateMessage:
        'Oi {nome}! Temos uma novidade exclusiva para nossas clientes VIP: abrimos vagas antecipadas para o Clube Drenagem Detox com valor promocional. Quer garantir sua vaga?',
    },
    {
      id: 'camp-4',
      name: 'Terça & Quarta da Barba Terapia',
      targetSegment: 'Todos os Homens Cadastrados',
      targetCount: 110,
      channel: 'WhatsApp',
      status: 'Agendada',
      messagesSent: 0,
      conversions: 0,
      revenueGenerated: 0,
      date: 'Agendada para 08/09/2026',
      templateMessage:
        'E aí {nome}! Terça e quarta são dias de Barboterapia com toalha quente e corte com 20% OFF na {clinica}. Garanta seu horário online aqui: {link}',
    },
  ]);

  // Cupons
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'cup-1',
      code: 'BEMVINDO15',
      type: 'percentual',
      value: 15,
      usedCount: 48,
      maxUses: 100,
      validUntil: '31/12/2026',
      status: 'Ativo',
    },
    {
      id: 'cup-2',
      code: 'VOLTA50',
      type: 'fixo',
      value: 50,
      usedCount: 31,
      maxUses: 50,
      validUntil: '30/09/2026',
      status: 'Ativo',
    },
    {
      id: 'cup-3',
      code: 'VIPBELLA20',
      type: 'percentual',
      value: 20,
      usedCount: 65,
      maxUses: 150,
      validUntil: '15/10/2026',
      status: 'Ativo',
    },
  ]);

  // Form states para Nova Campanha
  const [campName, setCampName] = useState('');
  const [campSegment, setCampSegment] = useState('Sem retorno há mais de 30 dias');
  const [campMessage, setCampMessage] = useState(
    'Olá {nome}! Preparamos uma condição exclusiva para você na {clinica} esta semana. Responda esta mensagem para agendar seu procedimento com benefícios especiais! ✨'
  );

  // Form states para Novo Cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentual' | 'fixo'>('percentual');
  const [couponValue, setCouponValue] = useState('15');
  const [couponMax, setCouponMax] = useState('100');

  // KPIs
  const totalRevenueCampaigns = campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);
  const totalMessagesSent = campaigns.reduce((acc, c) => acc + c.messagesSent, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const conversionRate = totalMessagesSent > 0 ? ((totalConversions / totalMessagesSent) * 100).toFixed(1) : '0';

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campName.trim()) return;

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: campName,
      targetSegment: campSegment,
      targetCount: 120,
      channel: 'WhatsApp',
      status: 'Ativa',
      messagesSent: 120,
      conversions: 0,
      revenueGenerated: 0,
      date: 'Hoje, Agora',
      templateMessage: campMessage,
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    setIsNewCampaignModalOpen(false);
    setCampName('');
    onTriggerToast(`Campanha "${newCamp.name}" disparada para 120 clientes!`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const newC: Coupon = {
      id: `cup-${Date.now()}`,
      code: couponCode.toUpperCase().replace(/\s+/g, ''),
      type: couponType,
      value: parseFloat(couponValue) || 10,
      usedCount: 0,
      maxUses: parseInt(couponMax) || 100,
      validUntil: '31/12/2026',
      status: 'Ativo',
    };

    setCoupons((prev) => [newC, ...prev]);
    setIsNewCouponModalOpen(false);
    setCouponCode('');
    onTriggerToast(`Cupom "${newC.code}" criado com sucesso!`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">campaign</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Campanhas de Marketing & Reengajamento</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#7c3aed]">
              WhatsApp Marketing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Recupere clientes inativos, crie cupons de desconto e preencha horários vagos da agenda de <b>{activeTenant.name}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewCouponModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#eaedff] text-xs sm:text-sm font-semibold text-[#131b2e] hover:bg-[#f8f9fa] transition-all"
          >
            <span className="material-symbols-outlined text-[1.125rem]">confirmation_number</span>
            Novo Cupom
          </button>
          <button
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add_comment</span>
            Criar Campanha
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Faturamento Gerado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">monetization_on</span>
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            R$ {totalRevenueCampaigns.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-[#7b7487] font-medium mt-1 block">
            Retorno direto em consultas agendadas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Mensagens Enviadas</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">send</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {totalMessagesSent} disparos
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Via API oficial do WhatsApp
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Taxa de Conversão</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">trending_up</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {conversionRate}%
          </p>
          <span className="text-[0.6875rem] text-blue-700 font-medium mt-1 block">
            {totalConversions} agendamentos confirmados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Cupons Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">discount</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {coupons.filter((c) => c.status === 'Ativo').length} códigos
          </p>
          <span className="text-[0.6875rem] text-amber-700 font-medium mt-1 block">
            Utilizados 144 vezes no total
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'campanhas'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">campaign</span>
          Campanhas Criadas ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('cupons')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'cupons'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">confirmation_number</span>
          Cupons & Promoções ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('publicos')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'publicos'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">groups</span>
          Segmentação de Públicos
        </button>
      </div>

      {/* TAB 1: LISTA DE CAMPANHAS */}
      {activeTab === 'campanhas' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#131b2e]">Histórico e Desempenho de Disparos</h3>
            <span className="text-xs text-[#7b7487]">Mensagens humanizadas com IA</span>
          </div>

          <div className="divide-y divide-[#eaedff]">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-5 hover:bg-[#fcfdff] transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#7c3aed] text-[1.25rem]">chat</span>
                    <h4 className="font-bold text-sm text-[#131b2e]">{camp.name}</h4>
                    <span
                      className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                        camp.status === 'Ativa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : camp.status === 'Concluída'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <span className="text-xs text-[#7b7487]">{camp.date}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff] text-xs text-[#4a4455] italic">
                  "{camp.templateMessage}"
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-4 text-[#7b7487]">
                    <span>Público: <b className="text-[#131b2e]">{camp.targetSegment}</b></span>
                    <span>Disparados: <b className="text-[#131b2e]">{camp.messagesSent}</b></span>
                    <span>Agendamentos: <b className="text-emerald-600">{camp.conversions}</b></span>
                    <span>Receita: <b className="text-emerald-600">R$ {camp.revenueGenerated.toFixed(2)}</b></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onTriggerToast(`Reenviando lembrete da campanha ${camp.name}!`)}
                      className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-[#7c3aed] font-bold text-xs hover:bg-[#7c3aed] hover:text-white transition-colors"
                    >
                      Reenviar Não-Lidos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CUPONS DE DESCONTO */}
      {activeTab === 'cupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-4 hover:border-[#7c3aed] transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#7c3aed] font-mono font-black text-sm border border-purple-100">
                  {coupon.code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  {coupon.status}
                </span>
              </div>

              <div>
                <p className="text-2xl font-black text-[#131b2e]">
                  {coupon.type === 'percentual' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                </p>
                <p className="text-xs text-[#7b7487] mt-1">
                  Válido até <b>{coupon.validUntil}</b>
                </p>
              </div>

              <div className="space-y-1.5 border-t border-[#eaedff] pt-3 text-xs">
                <div className="flex justify-between text-[#7b7487]">
                  <span>Usos registrados:</span>
                  <span className="font-bold text-[#131b2e]">{coupon.usedCount} de {coupon.maxUses}</span>
                </div>
                <div className="w-full h-1.5 bg-[#eaedff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#7c3aed] rounded-full"
                    style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(coupon.code);
                  onTriggerToast(`Cupom ${coupon.code} copiado!`);
                }}
                className="w-full py-2 rounded-xl bg-[#f8f9fa] text-[#131b2e] hover:bg-[#eaedff] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                Copiar Código
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SEGMENTAÇÃO DE PÚBLICOS */}
      {activeTab === 'publicos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-500">person_off</span>
                <h4 className="font-bold text-sm text-[#131b2e]">Clientes Inativos (+30 dias)</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-xs">
                142 contatos
              </span>
            </div>
            <p className="text-xs text-[#4a4455] leading-relaxed">
              Clientes que não realizam atendimentos ou agendamentos há mais de 30 dias. Excelente público para campanhas de resgate com cupom de desconto.
            </p>
            <button
              onClick={() => {
                setCampSegment('Sem retorno há mais de 30 dias');
                setIsNewCampaignModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
            >
              Criar Campanha para Inativos
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
                <h4 className="font-bold text-sm text-[#131b2e]">Clientes VIP (Top Gastos)</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-xs">
                86 contatos
              </span>
            </div>
            <p className="text-xs text-[#4a4455] leading-relaxed">
              Clientes que já acumularam mais de R$ 1.000,00 gastos no estabelecimento. Público prioritário para novidades, clubes de assinatura e combos premium.
            </p>
            <button
              onClick={() => {
                setCampSegment('Clientes VIP (Frequentes)');
                setIsNewCampaignModalOpen(true);
              }}
              className="w-full py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
            >
              Criar Campanha para VIPs
            </button>
          </div>
        </div>
      )}

      {/* MODAL NOVA CAMPANHA */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">campaign</span>
                <h3 className="font-bold text-base text-[#131b2e]">Criar Disparo de Marketing</h3>
              </div>
              <button
                onClick={() => setIsNewCampaignModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  placeholder="Ex: Promoção Terça da Beleza"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Público-Alvo</label>
                <select
                  value={campSegment}
                  onChange={(e) => setCampSegment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="Sem retorno há mais de 30 dias">Inativos (+30 dias sem retorno - 142 clientes)</option>
                  <option value="Clientes VIP (Frequentes)">Clientes VIP (+R$ 1.000 gastos - 86 clientes)</option>
                  <option value="Aniversariantes do Mês">Aniversariantes do Mês (38 clientes)</option>
                  <option value="Todos os Clientes">Base Completa (266 clientes)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Texto da Mensagem (WhatsApp)</label>
                <textarea
                  rows={4}
                  value={campMessage}
                  onChange={(e) => setCampMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
                <span className="text-[0.625rem] text-[#7b7487] mt-1 block">
                  Tags disponíveis: <b>{'{nome}'}</b>, <b>{'{clinica}'}</b>, <b>{'{link}'}</b>
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
                >
                  Confirmar e Disparar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOVO CUPOM */}
      {isNewCouponModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">confirmation_number</span>
                <h3 className="font-bold text-base text-[#131b2e]">Criar Cupom de Desconto</h3>
              </div>
              <button
                onClick={() => setIsNewCouponModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Código do Cupom</label>
                <input
                  type="text"
                  placeholder="Ex: BELLA15"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-mono font-bold focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Tipo de Desconto</label>
                  <select
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="percentual">Percentual (%)</option>
                    <option value="fixo">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Valor</label>
                  <input
                    type="number"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-bold text-[#7c3aed] focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Limite Máximo de Usos</label>
                <input
                  type="number"
                  value={couponMax}
                  onChange={(e) => setCouponMax(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
