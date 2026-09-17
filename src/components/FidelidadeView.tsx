import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { FidelidadeConfig, FidelidadeClientSummary, FidelidadeTransaction } from '../types';

interface FidelidadeViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const FidelidadeView: React.FC<FidelidadeViewProps> = ({
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'carteira' | 'extrato' | 'regras'>('carteira');
  const [searchTerm, setSearchTerm] = useState('');

  // Config do Programa
  const [config, setConfig] = useState<FidelidadeConfig>({
    active: true,
    cashbackPercent: 5, // 5% de volta
    pointsPerReal: 1,   // 1 ponto por R$ 1 gasto
    pointValueInReais: 0.05,
    expiryMonths: 6,
  });

  // Clientes com carteira de benefícios
  const [clientsFidelidade, setClientsFidelidade] = useState<FidelidadeClientSummary[]>([
    {
      clientId: 'c-1',
      clientName: 'Mariana Silveira',
      clientPhone: '+55 11 98452-1100',
      pointsBalance: 450,
      cashbackBalance: 45.0,
      totalEarnedCashback: 180.0,
      totalRedeemedCashback: 135.0,
      lastMovementDate: 'Hoje, 10:15',
    },
    {
      clientId: 'c-2',
      clientName: 'Carlos Eduardo Ramos',
      clientPhone: '+55 11 97233-4411',
      pointsBalance: 280,
      cashbackBalance: 28.0,
      totalEarnedCashback: 88.0,
      totalRedeemedCashback: 60.0,
      lastMovementDate: 'Ontem',
    },
    {
      clientId: 'c-3',
      clientName: 'Beatriz Fagundes',
      clientPhone: '+55 11 99124-7788',
      pointsBalance: 720,
      cashbackBalance: 72.0,
      totalEarnedCashback: 220.0,
      totalRedeemedCashback: 148.0,
      lastMovementDate: '01/09/2026',
    },
    {
      clientId: 'c-4',
      clientName: 'Lucas Oliveira Santos',
      clientPhone: '+55 11 96541-2299',
      pointsBalance: 110,
      cashbackBalance: 11.0,
      totalEarnedCashback: 35.0,
      totalRedeemedCashback: 24.0,
      lastMovementDate: '28/08/2026',
    },
    {
      clientId: 'c-5',
      clientName: 'Fernanda Lima Duarte',
      clientPhone: '+55 11 98877-3344',
      pointsBalance: 590,
      cashbackBalance: 59.0,
      totalEarnedCashback: 150.0,
      totalRedeemedCashback: 91.0,
      lastMovementDate: '26/08/2026',
    },
  ]);

  // Histórico de transações de Fidelidade
  const [transactions, setTransactions] = useState<FidelidadeTransaction[]>([
    {
      id: 'tx-fid-1',
      clientId: 'c-1',
      clientName: 'Mariana Silveira',
      type: 'CREDITO',
      points: 80,
      cashbackAmount: 18.0,
      description: 'Cashback 5% ganho no atendimento Harmonização',
      date: 'Hoje, 10:15',
    },
    {
      id: 'tx-fid-2',
      clientId: 'c-3',
      clientName: 'Beatriz Fagundes',
      type: 'RESGATE',
      points: -200,
      cashbackAmount: -30.0,
      description: 'Abatimento no fechamento de Bioestimulador',
      date: '01/09/2026, 16:40',
    },
    {
      id: 'tx-fid-3',
      clientId: 'c-2',
      clientName: 'Carlos Eduardo Ramos',
      type: 'CREDITO',
      points: 120,
      cashbackAmount: 12.0,
      description: 'Cashback Barba Terapia + Corte Degradê',
      date: 'Ontem, 14:00',
    },
    {
      id: 'tx-fid-4',
      clientId: 'c-4',
      clientName: 'Lucas Oliveira Santos',
      type: 'CREDITO',
      points: 50,
      cashbackAmount: 5.0,
      description: 'Cashback Corte Máquina + Pomada Matte',
      date: '28/08/2026, 11:20',
    },
  ]);

  // Modal de Crédito / Resgate Manual
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedClientForModal, setSelectedClientForModal] = useState<FidelidadeClientSummary | null>(null);
  const [manualOperationType, setManualOperationType] = useState<'CREDITO' | 'RESGATE'>('CREDITO');
  const [manualCashbackAmount, setManualCashbackAmount] = useState('20');
  const [manualReason, setManualReason] = useState('Bônus de cortesia de aniversário');

  const filteredClients = clientsFidelidade.filter(
    (c) =>
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientPhone.includes(searchTerm)
  );

  const totalCashbackEmCarteira = clientsFidelidade.reduce((acc, cur) => acc + cur.cashbackBalance, 0);
  const totalCashbackDistribuido = clientsFidelidade.reduce((acc, cur) => acc + cur.totalEarnedCashback, 0);
  const totalCashbackResgatado = clientsFidelidade.reduce((acc, cur) => acc + cur.totalRedeemedCashback, 0);

  const handleNotifyClientWhatsApp = (client: FidelidadeClientSummary) => {
    const msg = `Olá *${client.clientName.split(' ')[0]}*, tudo bem? Você tem *R$ ${client.cashbackBalance.toFixed(
      2
    )}* em cashback e *${client.pointsBalance} pontos* disponíveis aqui na *${activeTenant.name}*! Que tal aproveitar no seu próximo procedimento esta semana? Responda aqui para agendarmos seu horário! ✨`;
    
    if (onOpenWhatsAppChat) {
      onOpenWhatsAppChat(client.clientPhone, client.clientName);
    }
    navigator.clipboard?.writeText(msg);
    onTriggerToast(`Mensagem copiada para o WhatsApp de ${client.clientName}!`);
  };

  const handleExecuteManualOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForModal) return;

    const amount = parseFloat(manualCashbackAmount) || 0;
    if (amount <= 0) {
      onTriggerToast('Informe um valor maior que zero.');
      return;
    }

    if (manualOperationType === 'RESGATE' && amount > selectedClientForModal.cashbackBalance) {
      onTriggerToast('Saldo insuficiente para resgate deste valor!');
      return;
    }

    const multiplier = manualOperationType === 'CREDITO' ? 1 : -1;
    const pointsDelta = Math.round(amount * 10) * multiplier;

    // Atualiza cliente
    setClientsFidelidade((prev) =>
      prev.map((c) => {
        if (c.clientId === selectedClientForModal.clientId) {
          const newBalance = Math.max(0, c.cashbackBalance + amount * multiplier);
          const newPoints = Math.max(0, c.pointsBalance + pointsDelta);
          return {
            ...c,
            cashbackBalance: newBalance,
            pointsBalance: newPoints,
            totalEarnedCashback:
              manualOperationType === 'CREDITO'
                ? c.totalEarnedCashback + amount
                : c.totalEarnedCashback,
            totalRedeemedCashback:
              manualOperationType === 'RESGATE'
                ? c.totalRedeemedCashback + amount
                : c.totalRedeemedCashback,
            lastMovementDate: 'Agora',
          };
        }
        return c;
      })
    );

    // Adiciona transação ao extrato
    const newTx: FidelidadeTransaction = {
      id: `tx-fid-${Date.now()}`,
      clientId: selectedClientForModal.clientId,
      clientName: selectedClientForModal.clientName,
      type: manualOperationType,
      points: pointsDelta,
      cashbackAmount: amount * multiplier,
      description: manualReason || (manualOperationType === 'CREDITO' ? 'Ajuste de Crédito' : 'Resgate de Saldo'),
      date: 'Agora',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsManualModalOpen(false);
    onTriggerToast(
      manualOperationType === 'CREDITO'
        ? `Crédito de R$ ${amount.toFixed(2)} lançado para ${selectedClientForModal.clientName}!`
        : `Resgate de R$ ${amount.toFixed(2)} efetuado com sucesso!`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">loyalty</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Programa de Fidelidade & Cashback</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                config.active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {config.active ? 'Programa Ativo' : 'Pausado'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Fidelize seus pacientes e clientes devolvendo {config.cashbackPercent}% a cada serviço concluído no estabelecimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (clientsFidelidade.length > 0) {
                setSelectedClientForModal(clientsFidelidade[0]);
                setIsManualModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">swap_horiz</span>
            Lançamento Manual
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Saldo em Carteira</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">account_balance_wallet</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalCashbackEmCarteira.toFixed(2)}
          </p>
          <span className="text-[0.6875rem] text-emerald-700 font-medium flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[0.875rem]">lock_clock</span>
            Disponível para retorno em consultas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Cashback Concedido</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">volunteer_activism</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalCashbackDistribuido.toFixed(2)}
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Acumulado histórico da clínica
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Total Resgatado</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">redeem</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalCashbackResgatado.toFixed(2)}
          </p>
          <span className="text-[0.6875rem] text-blue-700 font-medium mt-1 block">
            Utilizado no caixa como abatimento
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Taxa de Conversão</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">trending_up</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {totalCashbackDistribuido > 0
              ? `${Math.round((totalCashbackResgatado / totalCashbackDistribuido) * 100)}%`
              : '0%'}
          </p>
          <span className="text-[0.6875rem] text-amber-700 font-medium mt-1 block">
            Recompra gerada por incentivo
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('carteira')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'carteira'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">groups</span>
          Carteiras de Clientes ({clientsFidelidade.length})
        </button>

        <button
          onClick={() => setActiveTab('extrato')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'extrato'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">receipt_long</span>
          Extrato Geral de Movimentações
        </button>

        <button
          onClick={() => setActiveTab('regras')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'regras'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">tune</span>
          Regras & Configuração do Programa
        </button>
      </div>

      {/* TAB 1: CARTEIRA DE CLIENTES */}
      {activeTab === 'carteira' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.125rem]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar cliente por nome ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#eaedff] text-xs sm:text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="text-xs text-[#7b7487]">
              Mostrando <b>{filteredClients.length}</b> clientes com saldo
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#eaedff] text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Saldo Pontos</th>
                  <th className="py-3.5 px-4">Saldo Cashback</th>
                  <th className="py-3.5 px-4">Total Ganho</th>
                  <th className="py-3.5 px-4">Total Usado</th>
                  <th className="py-3.5 px-4">Último Movimento</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredClients.map((client) => (
                  <tr key={client.clientId} className="hover:bg-[#fcfdff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#7c3aed] flex items-center justify-center font-bold text-xs">
                          {client.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#131b2e] leading-tight">{client.clientName}</p>
                          <p className="text-[0.6875rem] text-[#7b7487]">{client.clientPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md text-xs">
                        <span className="material-symbols-outlined text-[0.875rem]">stars</span>
                        {client.pointsBalance} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                      R$ {client.cashbackBalance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#4a4455]">
                      R$ {client.totalEarnedCashback.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#7b7487]">
                      R$ {client.totalRedeemedCashback.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[0.6875rem] text-[#7b7487]">
                      {client.lastMovementDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleNotifyClientWhatsApp(client)}
                          title="Avisar saldo disponível via WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClientForModal(client);
                            setManualOperationType('RESGATE');
                            setIsManualModalOpen(true);
                          }}
                          title="Resgatar / Abater saldo"
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-[#7c3aed] hover:bg-purple-100 font-semibold text-xs transition-colors"
                        >
                          Resgatar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClientForModal(client);
                            setManualOperationType('CREDITO');
                            setIsManualModalOpen(true);
                          }}
                          title="Adicionar bônus/crédito"
                          className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#131b2e] hover:bg-[#e4e7ff] font-semibold text-xs transition-colors"
                        >
                          + Crédito
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXTRATO GERAL */}
      {activeTab === 'extrato' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#131b2e]">Histórico de Lançamentos de Pontos & Cashback</h3>
            <span className="text-xs text-[#7b7487]">Últimos registros</span>
          </div>

          <div className="divide-y divide-[#eaedff]">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#fcfdff] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      tx.type === 'CREDITO'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-[#7c3aed]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">
                      {tx.type === 'CREDITO' ? 'add_circle' : 'remove_circle'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#131b2e]">{tx.clientName}</span>
                      <span
                        className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                          tx.type === 'CREDITO'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-purple-50 text-[#7c3aed]'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#7b7487] mt-0.5">{tx.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${
                      tx.type === 'CREDITO' ? 'text-emerald-600' : 'text-purple-600'
                    }`}
                  >
                    {tx.type === 'CREDITO' ? '+' : ''}
                    R$ {Math.abs(tx.cashbackAmount).toFixed(2)}
                  </p>
                  <p className="text-[0.6875rem] text-[#7b7487]">{tx.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REGRAS DO PROGRAMA */}
      {activeTab === 'regras' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-[#131b2e]">Configurações da Unidade Ativa</h3>
            <p className="text-xs text-[#7b7487]">
              Defina as diretrizes financeiras do programa para os clientes de <b>{activeTenant.name}</b>.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                <div>
                  <p className="text-sm font-bold text-[#131b2e]">Status do Programa</p>
                  <p className="text-xs text-[#7b7487]">Ativa o acúmulo automático de saldo na finalização de consultas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.active}
                    onChange={(e) => {
                      setConfig({ ...config, active: e.target.checked });
                      onTriggerToast(e.target.checked ? 'Programa ativado!' : 'Programa pausado temporariamente.');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Percentual de Cashback Concedido (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={config.cashbackPercent}
                      onChange={(e) => setConfig({ ...config, cashbackPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-[#7c3aed] focus:outline-none focus:border-[#7c3aed]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#7b7487] font-bold">%</span>
                  </div>
                  <p className="text-[0.6875rem] text-[#7b7487] mt-1">Ex: 5% a cada R$ 100 gastos devolve R$ 5,00</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Pontos Acumulados por R$ Gasto
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={config.pointsPerReal}
                      onChange={(e) => setConfig({ ...config, pointsPerReal: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-amber-600 focus:outline-none focus:border-[#7c3aed]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#7b7487] font-bold">pts / R$</span>
                  </div>
                  <p className="text-[0.6875rem] text-[#7b7487] mt-1">Gera pontuação no ranking de clientes VIP</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Validade dos Pontos & Saldo (Meses)
                  </label>
                  <select
                    value={config.expiryMonths}
                    onChange={(e) => setConfig({ ...config, expiryMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses (Recomendado)</option>
                    <option value={12}>12 meses (1 ano)</option>
                    <option value={0}>Nunca expira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Valor Mínimo para Resgate
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-[#7b7487]">R$</span>
                    <input
                      type="number"
                      defaultValue={15}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onTriggerToast('Configurações de fidelidade salvas para esta clínica!')}
                className="w-full py-2.5 rounded-xl bg-[#131b2e] text-white text-xs sm:text-sm font-bold hover:bg-[#283044] transition-colors"
              >
                Salvar Regras da Unidade
              </button>
            </div>
          </div>

          {/* Dica Estratégica */}
          <div className="bg-gradient-to-br from-[#f2f3ff] to-purple-50 rounded-2xl border border-purple-100 p-6 space-y-3">
            <span className="material-symbols-outlined text-[#7c3aed] text-3xl">lightbulb</span>
            <h4 className="font-bold text-sm text-[#131b2e]">Por que ter Cashback?</h4>
            <p className="text-xs text-[#4a4455] leading-relaxed">
              Diferente de um simples desconto que desvaloriza o serviço no ato, o <b>cashback obriga o retorno</b> do cliente à clínica para usufruir do saldo acumulado.
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-purple-100 text-xs text-[#4a4455]">
              💡 <b>Gatilho de Reativação:</b> Nossa automação no WhatsApp envia alerta quando o cliente tem mais de R$ 20 retidos e não agenda há 20 dias!
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LANÇAMENTO MANUAL (CRÉDITO OU RESGATE) */}
      {isManualModalOpen && selectedClientForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">swap_horiz</span>
                <h3 className="font-bold text-base text-[#131b2e]">Lançamento Manual de Benefício</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleExecuteManualOperation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Cliente Selecionado</label>
                <select
                  value={selectedClientForModal.clientId}
                  onChange={(e) => {
                    const found = clientsFidelidade.find((c) => c.clientId === e.target.value);
                    if (found) setSelectedClientForModal(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold focus:outline-none"
                >
                  {clientsFidelidade.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.clientName} (Saldo: R$ {c.cashbackBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Tipo de Operação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualOperationType('CREDITO')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      manualOperationType === 'CREDITO'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#f2f3ff] text-[#4a4455] hover:bg-[#e4e7ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">add_circle</span>
                    + Adicionar Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOperationType('RESGATE')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      manualOperationType === 'RESGATE'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-[#f2f3ff] text-[#4a4455] hover:bg-[#e4e7ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">remove_circle</span>
                    - Resgatar / Abater
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Valor em Reais (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-[#7b7487] font-bold">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="1"
                    value={manualCashbackAmount}
                    onChange={(e) => setManualCashbackAmount(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Ex: Cortesia de aniversário ou abatimento no balcão"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
