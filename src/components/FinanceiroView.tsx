import React, { useState, useMemo } from 'react';
import { Appointment, Service, Professional } from '../types';
import { useTenant } from '../context/TenantContext';

interface FinanceiroViewProps {
  appointments?: Appointment[];
  services?: Service[];
  professionals?: Professional[];
  onTriggerToast: (msg: string) => void;
}

interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  clientOrBeneficiary: string;
  serviceOrCategory: string;
  professional?: string;
  method: 'PIX' | 'Cartão Crédito' | 'Cartão Débito' | 'Dinheiro' | 'Transferência';
  value: number;
  status: 'Aprovado' | 'Pendente' | 'Cancelado';
  time: string;
}

interface ProfessionalCommission {
  profId: string;
  name: string;
  role: string;
  commissionRate: number; // e.g. 40 = 40%
  totalProduced: number;
  commissionTotal: number;
  appointmentsCount: number;
  isPaid: boolean;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  appointments = [],
  services = [],
  professionals = [],
  onTriggerToast,
}) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'caixa' | 'comissoes'>('caixa');
  const [filterType, setFilterType] = useState<string>('todos');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // Manual additional transactions (expenses/extra revenues)
  const [manualTransactions, setManualTransactions] = useState<Transaction[]>([]);

  // Paid commission tracking
  const [paidCommissions, setPaidCommissions] = useState<Record<string, boolean>>({});

  // Dynamic transactions generated from real database appointments + manual transactions
  const allTransactions = useMemo<Transaction[]>(() => {
    const aptTx: Transaction[] = appointments.map((a) => {
      const isApproved = a.status === 'CONCLUÍDO' || a.status === 'CONFIRMADO';
      const isCancelled = a.status === 'CANCELADO';
      return {
        id: `tx-apt-${a.id}`,
        type: 'receita',
        clientOrBeneficiary: a.clientName || 'Cliente',
        serviceOrCategory: a.service || 'Atendimento',
        professional: a.professional,
        method: 'PIX',
        value: Number(a.price) || 0,
        status: isCancelled ? 'Cancelado' : isApproved ? 'Aprovado' : 'Pendente',
        time: a.date ? `${a.date} às ${a.time || '10:00'}` : 'Hoje',
      };
    });

    return [...manualTransactions, ...aptTx];
  }, [appointments, manualTransactions]);

  // Dynamic commissions calculated per professional from real database appointments
  const commissions = useMemo<ProfessionalCommission[]>(() => {
    return professionals.map((p) => {
      const profApts = appointments.filter(
        (a) =>
          (a.professional && p.name && a.professional.toLowerCase().includes(p.name.toLowerCase())) ||
          (p.name && a.professional && p.name.toLowerCase().includes(a.professional.toLowerCase()))
      );
      const validApts = profApts.filter((a) => a.status !== 'CANCELADO');
      const totalProduced = validApts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
      const commissionRate = (p as any).commissionRate || (activeTenant.type === 'barbearia' ? 50 : 40);
      const commissionTotal = (totalProduced * commissionRate) / 100;
      return {
        profId: p.id,
        name: p.name,
        role: p.role || 'Especialista',
        commissionRate,
        totalProduced,
        commissionTotal,
        appointmentsCount: validApts.length,
        isPaid: !!paidCommissions[p.id],
      };
    });
  }, [professionals, appointments, activeTenant.type, paidCommissions]);

  // Form State for new transaction
  const [newTx, setNewTx] = useState({
    type: 'receita' as 'receita' | 'despesa',
    clientOrBeneficiary: '',
    serviceOrCategory: '',
    professional: professionals[0]?.name || 'Geral',
    method: 'PIX' as Transaction['method'],
    value: '',
  });

  // KPI Calculations from real database entries
  const totalReceitas = allTransactions
    .filter((t) => t.type === 'receita' && (t.status === 'Aprovado' || t.status === 'Pendente'))
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalDespesas = allTransactions
    .filter((t) => t.type === 'despesa' && t.status === 'Aprovado')
    .reduce((acc, curr) => acc + curr.value, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  const totalComissoesPendentes = commissions
    .filter((c) => !c.isPaid)
    .reduce((acc, curr) => acc + curr.commissionTotal, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.clientOrBeneficiary.trim() || !newTx.value) {
      onTriggerToast('Preencha a descrição e o valor da transação.');
      return;
    }

    const createdTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: newTx.type,
      clientOrBeneficiary: newTx.clientOrBeneficiary,
      serviceOrCategory: newTx.serviceOrCategory || (newTx.type === 'receita' ? 'Procedimento' : 'Despesa Operacional'),
      professional: newTx.type === 'receita' ? newTx.professional : undefined,
      method: newTx.method,
      value: parseFloat(newTx.value),
      status: 'Aprovado',
      time: 'Hoje',
    };

    setManualTransactions((prev) => [createdTx, ...prev]);
    setIsNewTxModalOpen(false);
    onTriggerToast(`Lançamento de ${newTx.type === 'receita' ? 'Receita' : 'Despesa'} registrado com sucesso!`);
    setNewTx({
      type: 'receita',
      clientOrBeneficiary: '',
      serviceOrCategory: '',
      professional: professionals[0]?.name || 'Geral',
      method: 'PIX',
      value: '',
    });
  };

  const handlePayCommission = (profId: string, profName: string) => {
    setPaidCommissions((prev) => ({ ...prev, [profId]: true }));
    onTriggerToast(`Repasse de comissão de ${profName} dado como PAGO!`);
  };

  const filteredTransactions = allTransactions.filter((t) => {
    if (filterType === 'receitas') return t.type === 'receita';
    if (filterType === 'despesas') return t.type === 'despesa';
    if (filterType === 'pix') return t.method === 'PIX';
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
              Financeiro & Repasses
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#eaedff] text-[#630ed4] text-xs font-semibold">
              {activeTenant.name}
            </span>
          </div>
          <p className="text-sm text-[#4a4455]">
            Controle de fluxo de caixa, conciliação de pagamentos e apuração de comissões por profissional.
          </p>
        </div>

        {/* Action buttons and Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex p-0.5 rounded-xl bg-white border border-[#eaedff] shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('caixa')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'caixa'
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'text-[#4a4455] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">account_balance_wallet</span>
              Fluxo de Caixa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comissoes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'comissoes'
                  ? 'bg-[#7c3aed] text-white shadow-xs'
                  : 'text-[#4a4455] hover:text-[#131b2e]'
              }`}
            >
              <span className="material-symbols-outlined text-[1rem]">badge</span>
              Comissões da Equipe
            </button>
          </div>

          <button
            onClick={() => onTriggerToast('Gerando extrato consolidado em PDF...')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold border border-[#eaedff] shadow-2xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[1rem]">download</span>
            Exportar
          </button>

          <button
            onClick={() => setIsNewTxModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#630ed4] shadow-sm transition-all transform active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">payments</span>
            + Novo Lançamento
          </button>
        </div>
      </div>

      {/* 4 Financial Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Receitas Realizadas</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1rem]">trending_up</span>
            Entradas confirmadas no caixa
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Despesas Operacionais</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-rose-700 font-semibold mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1rem]">trending_down</span>
            Insumos e contas do mês
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Saldo Líquido em Caixa</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-1">
              R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-[#630ed4] font-semibold mt-3">
            Margem operacional positiva
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Comissões a Repassar</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              R$ {totalComissoesPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-amber-800 font-semibold mt-3">
            Aguardando fechamento quinzenal
          </span>
        </div>
      </div>

      {/* ABA 1: FLUXO DE CAIXA E TRANSAÇÕES */}
      {activeTab === 'caixa' && (
        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col gap-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff]/60 pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#131b2e]">Extrato e Movimentações</h2>
              <p className="text-xs text-[#7b7487]">Histórico completo de entradas e saídas</p>
            </div>

            {/* Filter tags */}
            <div className="inline-flex p-0.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'receitas', label: 'Receitas' },
                { id: 'despesas', label: 'Despesas' },
                { id: 'pix', label: 'PIX' },
              ].map((ft) => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => setFilterType(ft.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    filterType === ft.id
                      ? 'bg-white text-[#630ed4] shadow-xs'
                      : 'text-[#4a4455] hover:text-[#131b2e]'
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f2f3ff] text-[#4a4455] text-xs font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">Tipo</th>
                  <th className="py-2.5 px-3">Cliente / Fornecedor</th>
                  <th className="py-2.5 px-3">Procedimento / Categoria</th>
                  <th className="py-2.5 px-3">Profissional</th>
                  <th className="py-2.5 px-3">Forma de Pagto</th>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#7b7487]">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#630ed4] flex items-center justify-center mb-2">
                          <span className="material-symbols-outlined text-[1.5rem]">account_balance_wallet</span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">Nenhuma movimentação registrada</p>
                        <p className="text-xs text-slate-500 mt-0.5 mb-3">Os agendamentos e lançamentos financeiros aparecerão aqui em tempo real.</p>
                        <button
                          type="button"
                          onClick={() => setIsNewTxModalOpen(true)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] text-white text-xs font-semibold hover:bg-[#630ed4] transition-all cursor-pointer"
                        >
                          + Novo Lançamento
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#f2f3ff]/40 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                            tx.type === 'receita'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[0.875rem]">
                            {tx.type === 'receita' ? 'arrow_downward' : 'arrow_upward'}
                          </span>
                          {tx.type === 'receita' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#131b2e]">
                        {tx.clientOrBeneficiary}
                      </td>
                      <td className="py-3 px-3 text-xs text-[#4a4455]">{tx.serviceOrCategory}</td>
                      <td className="py-3 px-3 text-xs text-[#630ed4] font-medium">
                        {tx.professional || 'Geral'}
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <span className="px-2 py-0.5 rounded bg-[#eaedff] font-medium text-[#131b2e]">
                          {tx.method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-[#7b7487]">{tx.time}</td>
                      <td
                        className={`py-3 px-3 font-bold ${
                          tx.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type === 'receita' ? '+' : '-'} R${' '}
                        {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold ${
                            tx.status === 'Aprovado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: MÓDULO DE COMISSÕES POR PROFISSIONAL (PRD SEÇÃO 10) */}
      {activeTab === 'comissoes' && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-150">
          <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-[#131b2e]">
                Apuração e Fechamento de Comissões
              </h2>
              <p className="text-xs text-[#7b7487]">
                Cálculo conforme taxa de repasse contratual de cada especialista sobre os serviços prestados.
              </p>
            </div>
            <span className="text-xs font-bold text-[#630ed4] bg-[#eaedff] px-3 py-1.5 rounded-lg">
              Mês Vigente
            </span>
          </div>

          {commissions.length === 0 ? (
            <div className="p-10 bg-white rounded-2xl border border-[#eaedff] text-center">
              <p className="font-bold text-slate-800 text-sm">Nenhum profissional cadastrado</p>
              <p className="text-xs text-slate-500 mt-1">Cadastre os profissionais da sua equipe para acompanhar repasses de comissões.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commissions.map((c) => (
                <div
                  key={c.profId}
                  className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#eaddff] text-[#630ed4] flex items-center justify-center font-bold text-sm">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#131b2e] leading-snug">{c.name}</h3>
                        <p className="text-xs text-[#7b7487]">{c.role}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#f2f3ff] text-[#630ed4] text-[0.6875rem] font-bold">
                          Taxa de comissão: {c.commissionRate}%
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        c.isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {c.isPaid ? 'Pago' : 'Pendente'}
                    </span>
                  </div>

                  {/* Numbers breakdown */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff] text-center text-xs">
                    <div>
                      <span className="text-[0.6875rem] text-[#7b7487] block">Produção Bruta</span>
                      <span className="font-bold text-[#131b2e] mt-0.5 block">
                        R$ {c.totalProduced.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[0.6875rem] text-[#7b7487] block">Atendimentos</span>
                      <span className="font-bold text-[#630ed4] mt-0.5 block">
                        {c.appointmentsCount} consultas
                      </span>
                    </div>
                    <div>
                      <span className="text-[0.6875rem] text-[#7b7487] block">Repasse Líquido</span>
                      <span className="font-extrabold text-emerald-700 mt-0.5 block">
                        R$ {c.commissionTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#eaedff]">
                    <button
                      onClick={() => onTriggerToast(`Extrato analítico de procedimentos de ${c.name} gerado`)}
                      className="text-xs font-semibold text-[#630ed4] hover:underline flex items-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[1rem]">receipt_long</span>
                      Ver Extrato de Procedimentos
                    </button>

                    <button
                      disabled={c.isPaid}
                      onClick={() => handlePayCommission(c.profId, c.name)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        c.isPaid
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                      type="button"
                    >
                      {c.isPaid ? 'Repasse Efetuado' : 'Dar Baixa no Repasse'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Novo Lançamento */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#eaddff] text-[#630ed4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[1.25rem]">payments</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#131b2e]">Novo Lançamento Financeiro</h3>
                  <p className="text-xs text-[#7b7487]">Registrar receita ou despesa de caixa</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTxModalOpen(false)}
                className="p-1 rounded-lg text-[#7b7487] hover:bg-[#f2f3ff] cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="flex flex-col gap-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#f2f3ff] rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'receita' })}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    newTx.type === 'receita'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-[#4a4455] hover:text-[#131b2e]'
                  }`}
                >
                  + Entrada (Receita)
                </button>
                <button
                  type="button"
                  onClick={() => setNewTx({ ...newTx, type: 'despesa' })}
                  className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    newTx.type === 'despesa'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-[#4a4455] hover:text-[#131b2e]'
                  }`}
                >
                  - Saída (Despesa)
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#131b2e]">
                  {newTx.type === 'receita' ? 'Nome do Cliente *' : 'Fornecedor / Favorecido *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTx.clientOrBeneficiary}
                  onChange={(e) => setNewTx({ ...newTx, clientOrBeneficiary: e.target.value })}
                  placeholder={newTx.type === 'receita' ? 'Ex: Mariana Silveira' : 'Ex: Fornecedor de Descartáveis'}
                  className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTx.value}
                    onChange={(e) => setNewTx({ ...newTx, value: e.target.value })}
                    placeholder="0,00"
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm font-bold text-[#131b2e] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">Forma de Pagamento *</label>
                  <select
                    value={newTx.method}
                    onChange={(e) => setNewTx({ ...newTx, method: e.target.value as Transaction['method'] })}
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-xs font-semibold text-[#131b2e] outline-none cursor-pointer"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão Crédito">Cartão de Crédito</option>
                    <option value="Cartão Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Transferência">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#131b2e]">
                  {newTx.type === 'receita' ? 'Procedimento / Descrição' : 'Categoria da Despesa'}
                </label>
                <input
                  type="text"
                  value={newTx.serviceOrCategory}
                  onChange={(e) => setNewTx({ ...newTx, serviceOrCategory: e.target.value })}
                  placeholder={newTx.type === 'receita' ? 'Ex: Corte e Barba' : 'Ex: Contas de Luz, Insumos...'}
                  className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                />
              </div>

              {newTx.type === 'receita' && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">Profissional Vinculado</label>
                  <select
                    value={newTx.professional}
                    onChange={(e) => setNewTx({ ...newTx, professional: e.target.value })}
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-xs font-semibold text-[#131b2e] outline-none cursor-pointer"
                  >
                    {professionals.length === 0 ? (
                      <option value="Geral">Geral</option>
                    ) : (
                      professionals.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] font-semibold text-[#131b2e] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] font-semibold text-white shadow-xs cursor-pointer"
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
