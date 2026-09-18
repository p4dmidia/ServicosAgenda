import React, { useState, useMemo } from 'react';
import { useTenant } from '../context/TenantContext';
import { Client, Appointment, FidelidadeConfig, FidelidadeClientSummary, FidelidadeTransaction } from '../types';

interface FidelidadeViewProps {
  clients?: Client[];
  appointments?: Appointment[];
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const FidelidadeView: React.FC<FidelidadeViewProps> = ({
  clients = [],
  appointments = [],
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'carteira' | 'extrato' | 'regras'>('carteira');
  const [searchTerm, setSearchTerm] = useState('');

  // Config do Programa
  const [config, setConfig] = useState<FidelidadeConfig>({
    active: true,
    cashbackPercent: 5, // 5% de volta padrão
    pointsPerReal: 1,   // 1 ponto por R$ 1 gasto
    pointValueInReais: 0.05,
    expiryMonths: 6,
  });

  // Manual Adjustments State
  const [manualAdjustments, setManualAdjustments] = useState<
    Record<string, { cashbackDelta: number; pointsDelta: number; redeemedDelta: number; earnedDelta: number }>
  >({});

  const [manualTransactions, setManualTransactions] = useState<FidelidadeTransaction[]>([]);

  // Modal de Crédito / Resgate Manual
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [manualOperationType, setManualOperationType] = useState<'CREDITO' | 'RESGATE'>('CREDITO');
  const [manualCashbackAmount, setManualCashbackAmount] = useState('20');
  const [manualReason, setManualReason] = useState('Bônus de fidelidade / cortesia');

  // Compute Fidelidade Client Summaries dynamically from Real Database
  const clientsFidelidade = useMemo<FidelidadeClientSummary[]>(() => {
    return clients.map((c) => {
      const clientApts = appointments.filter(
        (a) =>
          (a.clientId && a.clientId === c.id) ||
          (a.clientName && c.name && a.clientName.toLowerCase() === c.name.toLowerCase()) ||
          (a.clientPhone && c.phone && a.clientPhone === c.phone)
      );

      const completedApts = clientApts.filter(
        (a) => a.status === 'CONCLUIDO' || a.status === 'CONFIRMADO' || a.status === 'EM ATENDIMENTO'
      );

      const totalSpent = completedApts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const autoEarnedCashback = (totalSpent * config.cashbackPercent) / 100;
      const autoPoints = Math.round(totalSpent * config.pointsPerReal);

      const adj = manualAdjustments[c.id] || {
        cashbackDelta: 0,
        pointsDelta: 0,
        redeemedDelta: 0,
        earnedDelta: 0,
      };

      const totalEarnedCashback = autoEarnedCashback + adj.earnedDelta;
      const totalRedeemedCashback = adj.redeemedDelta;
      const cashbackBalance = Math.max(0, totalEarnedCashback - totalRedeemedCashback);
      const pointsBalance = Math.max(0, autoPoints + adj.pointsDelta);

      // Latest appointment date
      let lastDateStr = 'Sem movimentação';
      if (completedApts.length > 0) {
        const sorted = [...completedApts].sort(
          (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );
        const last = sorted[0];
        lastDateStr = last.date ? `${last.date} às ${last.time || '10:00'}` : 'Hoje';
      }

      return {
        clientId: c.id,
        clientName: c.name,
        clientPhone: c.phone || '+55',
        pointsBalance,
        cashbackBalance,
        totalEarnedCashback,
        totalRedeemedCashback,
        lastMovementDate: lastDateStr,
      };
    });
  }, [clients, appointments, config, manualAdjustments]);

  // Dynamic Transactions generated from completed appointments + manual operations
  const transactions = useMemo<FidelidadeTransaction[]>(() => {
    const aptTxs: FidelidadeTransaction[] = [];

    appointments
      .filter((a) => a.status === 'CONCLUIDO' || a.status === 'CONFIRMADO')
      .forEach((a) => {
        const price = Number(a.price) || 0;
        const earnedCashback = (price * config.cashbackPercent) / 100;
        const pts = Math.round(price * config.pointsPerReal);
        aptTxs.push({
          id: `tx-fid-apt-${a.id}`,
          clientId: a.clientId || a.clientName || 'c',
          clientName: a.clientName || 'Cliente',
          type: 'CREDITO',
          points: pts,
          cashbackAmount: earnedCashback,
          description: `Cashback ${config.cashbackPercent}% ganho no atendimento ${a.service || 'Serviço'}`,
          date: a.date ? `${a.date} às ${a.time || '10:00'}` : 'Hoje',
        });
      });

    return [...manualTransactions, ...aptTxs];
  }, [appointments, config, manualTransactions]);

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
    onTriggerToast(`Mensagem e saldo copiados para o WhatsApp de ${client.clientName}!`);
  };

  const handleExecuteManualOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClient = clientsFidelidade.find((c) => c.clientId === selectedClientId) || clientsFidelidade[0];
    if (!targetClient) return;

    const amount = parseFloat(manualCashbackAmount) || 0;
    if (amount <= 0) {
      onTriggerToast('Informe um valor maior que zero.');
      return;
    }

    if (manualOperationType === 'RESGATE' && amount > targetClient.cashbackBalance) {
      onTriggerToast('Saldo insuficiente para resgate deste valor!');
      return;
    }

    const multiplier = manualOperationType === 'CREDITO' ? 1 : -1;
    const pointsDelta = Math.round(amount * 10) * multiplier;

    setManualAdjustments((prev) => {
      const current = prev[targetClient.clientId] || {
        cashbackDelta: 0,
        pointsDelta: 0,
        redeemedDelta: 0,
        earnedDelta: 0,
      };

      return {
        ...prev,
        [targetClient.clientId]: {
          cashbackDelta: current.cashbackDelta + amount * multiplier,
          pointsDelta: current.pointsDelta + pointsDelta,
          earnedDelta:
            manualOperationType === 'CREDITO'
              ? current.earnedDelta + amount
              : current.earnedDelta,
          redeemedDelta:
            manualOperationType === 'RESGATE'
              ? current.redeemedDelta + amount
              : current.redeemedDelta,
        },
      };
    });

    const newTx: FidelidadeTransaction = {
      id: `tx-fid-${Date.now()}`,
      clientId: targetClient.clientId,
      clientName: targetClient.clientName,
      type: manualOperationType,
      points: pointsDelta,
      cashbackAmount: amount * multiplier,
      description:
        manualReason ||
        (manualOperationType === 'CREDITO' ? 'Ajuste de Crédito Manual' : 'Resgate de Saldo no Caixa'),
      date: 'Agora',
    };

    setManualTransactions((prev) => [newTx, ...prev]);
    setIsManualModalOpen(false);
    onTriggerToast(
      manualOperationType === 'CREDITO'
        ? `Crédito de R$ ${amount.toFixed(2)} lançado para ${targetClient.clientName}!`
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
                setSelectedClientId(clientsFidelidade[0].clientId);
                setIsManualModalOpen(true);
              } else {
                onTriggerToast('Cadastre clientes primeiro para lançar cashback.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
            type="button"
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
            Acumulado histórico da empresa
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
              : '68%'}
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
          type="button"
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
          type="button"
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
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">tune</span>
          Regras & Configuração do Programa
        </button>
      </div>

      {/* TAB 1: CARTEIRAS DE CLIENTES */}
      {activeTab === 'carteira' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.125rem]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar cliente por nome ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <span className="text-xs text-[#7b7487]">
              Mostrando <b>{filteredClients.length}</b> clientes cadastrados
            </span>
          </div>

          {filteredClients.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-[#7c3aed] mb-2">sentiment_dissatisfied</span>
              <p className="font-bold text-[#131b2e] text-sm">Nenhum cliente com cashback encontrado</p>
              <p className="text-xs text-[#7b7487] mt-1">
                Conforme novos atendimentos forem concluídos, os saldos de cashback aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f8f9fa] text-[#7b7487] uppercase font-bold border-b border-[#eaedff]">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Saldo Pontos</th>
                    <th className="py-3 px-4">Saldo Cashback</th>
                    <th className="py-3 px-4">Total Ganho</th>
                    <th className="py-3 px-4">Total Usado</th>
                    <th className="py-3 px-4">Último Movimento</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaedff]">
                  {filteredClients.map((client) => (
                    <tr key={client.clientId} className="hover:bg-[#fcfdff] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#f2f3ff] text-[#7c3aed] font-bold flex items-center justify-center text-xs">
                            {client.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#131b2e]">{client.clientName}</p>
                            <span className="text-[0.6875rem] text-[#7b7487]">{client.clientPhone}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[0.875rem]">stars</span>
                          {client.pointsBalance} pts
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-black text-emerald-600 text-sm">
                          R$ {client.cashbackBalance.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[#4a4455] font-medium">
                        R$ {client.totalEarnedCashback.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-[#4a4455] font-medium">
                        R$ {client.totalRedeemedCashback.toFixed(2)}
                      </td>

                      <td className="py-3 px-4 text-[#7b7487]">
                        {client.lastMovementDate}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleNotifyClientWhatsApp(client)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Notificar saldo via WhatsApp"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[1.125rem]">chat</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedClientId(client.clientId);
                              setManualOperationType('RESGATE');
                              setIsManualModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-md text-[0.6875rem] font-bold text-[#7c3aed] bg-[#f2f3ff] hover:bg-[#7c3aed] hover:text-white transition-all"
                            type="button"
                          >
                            Resgatar
                          </button>

                          <button
                            onClick={() => {
                              setSelectedClientId(client.clientId);
                              setManualOperationType('CREDITO');
                              setIsManualModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-md text-[0.6875rem] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all"
                            type="button"
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
          )}
        </div>
      )}

      {/* TAB 2: EXTRATO GERAL DE MOVIMENTAÇÕES */}
      {activeTab === 'extrato' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#131b2e]">Histórico de Créditos e Resgates</h3>
            <span className="text-xs text-[#7b7487]">Movimentações auditadas</span>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-[#7c3aed] mb-2">receipt_long</span>
              <p className="font-bold text-[#131b2e] text-sm">Nenhuma movimentação registrada</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eaedff]">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[#fcfdff] transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        tx.type === 'CREDITO'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[1.125rem]">
                        {tx.type === 'CREDITO' ? 'add_circle' : 'remove_circle'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#131b2e]">{tx.clientName}</p>
                        <span
                          className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                            tx.type === 'CREDITO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </div>
                      <p className="text-[0.6875rem] text-[#7b7487] mt-0.5">{tx.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`font-black text-sm ${
                        tx.type === 'CREDITO' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'CREDITO' ? '+' : ''} R$ {Math.abs(tx.cashbackAmount).toFixed(2)}
                    </p>
                    <span className="text-[0.6875rem] text-[#7b7487]">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REGRAS E CONFIGURAÇÃO */}
      {activeTab === 'regras' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-6 max-w-2xl">
          <div className="border-b border-[#eaedff] pb-4">
            <h3 className="text-base font-bold text-[#131b2e]">Parâmetros do Programa de Fidelidade</h3>
            <p className="text-xs text-[#7b7487] mt-0.5">
              Personalize a porcentagem de cashback e regras de expiração para a empresa <b>{activeTenant.name}</b>.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl">
              <div>
                <p className="font-bold text-[#131b2e]">Ativar Programa de Fidelidade</p>
                <p className="text-[#7b7487]">Clientes acumulam cashback automaticamente a cada serviço concluído.</p>
              </div>
              <input
                type="checkbox"
                checked={config.active}
                onChange={(e) => setConfig({ ...config, active: e.target.checked })}
                className="w-5 h-5 accent-[#7c3aed]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Porcentagem de Cashback (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.cashbackPercent}
                  onChange={(e) => setConfig({ ...config, cashbackPercent: Number(e.target.value) || 5 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-bold focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Validade dos Créditos (meses)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={config.expiryMonths}
                  onChange={(e) => setConfig({ ...config, expiryMonths: Number(e.target.value) || 6 })}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-bold focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            <button
              onClick={() => onTriggerToast('Parâmetros do programa salvos com sucesso!')}
              className="px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white font-bold text-xs hover:bg-[#6b2fd8] transition-all"
              type="button"
            >
              Salvar Regras
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE LANÇAMENTO MANUAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">swap_horiz</span>
                <h3 className="font-bold text-base text-[#131b2e]">Lançamento de Benefício</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleExecuteManualOperation} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Selecionar Cliente</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-semibold focus:outline-none focus:border-[#7c3aed]"
                >
                  {clientsFidelidade.map((c) => (
                    <option key={c.clientId} value={c.clientId}>
                      {c.clientName} (Saldo: R$ {c.cashbackBalance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setManualOperationType('CREDITO')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    manualOperationType === 'CREDITO'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-[#4a4455] border-[#eaedff]'
                  }`}
                >
                  + Adicionar Crédito
                </button>

                <button
                  type="button"
                  onClick={() => setManualOperationType('RESGATE')}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    manualOperationType === 'RESGATE'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-[#4a4455] border-[#eaedff]'
                  }`}
                >
                  - Efetuar Resgate
                </button>
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Valor do Cashback (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  required
                  value={manualCashbackAmount}
                  onChange={(e) => setManualCashbackAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] font-black text-sm focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#131b2e] mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Ex: Cortesia de Aniversário, Abatimento no caixa"
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white font-bold transition-colors shadow-sm ${
                    manualOperationType === 'CREDITO'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirmar {manualOperationType === 'CREDITO' ? 'Crédito' : 'Resgate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
