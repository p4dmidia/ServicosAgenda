import React, { useState, useMemo } from 'react';
import { Appointment, Client } from '../types';
import { useTenant } from '../context/TenantContext';

interface PagamentosViewProps {
  appointments?: Appointment[];
  clients?: Client[];
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

interface PaymentTransaction {
  id: string;
  txId: string;
  clientName: string;
  clientPhone: string;
  description: string;
  type: 'Sinal de Reserva' | 'Total do Atendimento' | 'Assinatura Mensal';
  method: 'PIX Dinâmico' | 'Cartão de Crédito' | 'Cartão Débito';
  amount: number;
  status: 'Aprovado' | 'Pendente' | 'Expirado' | 'Estornado';
  createdAt: string;
  pixPayload?: string;
}

export const PagamentosView: React.FC<PagamentosViewProps> = ({
  appointments = [],
  clients = [],
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const { activeTenant, updateTenant } = useTenant();
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [isNewChargeModalOpen, setIsNewChargeModalOpen] = useState(false);
  const [activeQrModalTx, setActiveQrModalTx] = useState<PaymentTransaction | null>(null);

  // Settings state from tenant
  const [signalActive, setSignalActive] = useState(activeTenant.settings?.allowSignalBooking ?? false);
  const [signalAmount, setSignalAmount] = useState(activeTenant.settings?.signalAmount || 50);

  // Manual charges generated via "+ Gerar Cobrança PIX"
  const [manualCharges, setManualCharges] = useState<PaymentTransaction[]>([]);

  // Dynamic Gateway Transactions from real database appointments + manual charges
  const transactions = useMemo<PaymentTransaction[]>(() => {
    const aptCharges: PaymentTransaction[] = appointments.map((a, idx) => {
      const priceNum = Number(a.price) || 0;
      const isSignal =
        signalActive &&
        signalAmount > 0 &&
        (priceNum === signalAmount || (a as any).paymentType === 'sinal');

      const isApproved =
        a.status === 'CONCLUIDO' ||
        a.status === 'CONFIRMADO' ||
        a.status === 'EM ATENDIMENTO';
      const isCancelled = a.status === 'CANCELADO' || a.status === 'NAO_COMPARECEU';

      const shortId = a.id ? a.id.replace(/-/g, '').slice(0, 6).toUpperCase() : `APT${idx + 100}`;
      const txCode = `PIX-${shortId}`;

      return {
        id: `apt-tx-${a.id || idx}`,
        txId: txCode,
        clientName: a.clientName || 'Cliente',
        clientPhone: a.clientPhone || '+55',
        description: `${a.service || 'Procedimento'} - ${a.professional || 'Geral'}`,
        type: isSignal ? 'Sinal de Reserva' : 'Total do Atendimento',
        method: 'PIX Dinâmico',
        amount: priceNum,
        status: isCancelled ? 'Estornado' : isApproved ? 'Aprovado' : 'Pendente',
        createdAt: a.date ? `${a.date} às ${a.time || '10:00'}` : 'Hoje',
        pixPayload: `00020126580014br.gov.bcb.pix0136${txCode}520400005303986540${priceNum.toFixed(2)}5802BR5924${(activeTenant.name || 'ServicosAgenda').slice(0, 20)}6009SAOPAULO62070503***6304C4F1`,
      };
    });

    return [...manualCharges, ...aptCharges];
  }, [appointments, manualCharges, signalActive, signalAmount, activeTenant.name]);

  // Form State for creating immediate charge
  const [chargeForm, setChargeForm] = useState({
    clientName: '',
    clientPhone: '+55 11 ',
    description: '',
    amount: '',
    type: 'Total do Atendimento' as PaymentTransaction['type'],
  });

  // KPI calculations based on real database records
  const totalPixApproved = transactions
    .filter((t) => t.method === 'PIX Dinâmico' && t.status === 'Aprovado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalSignalsReceived = transactions
    .filter((t) => t.type === 'Sinal de Reserva' && t.status === 'Aprovado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingChargesCount = transactions.filter((t) => t.status === 'Pendente').length;

  const totalChargesCount = transactions.length;
  const approvedChargesCount = transactions.filter((t) => t.status === 'Aprovado').length;
  const conversionRate =
    totalChargesCount > 0
      ? ((approvedChargesCount / totalChargesCount) * 100).toFixed(1)
      : '100.0';

  const handleSaveSignalConfig = async () => {
    try {
      await updateTenant(activeTenant.id, {
        settings: {
          ...activeTenant.settings,
          allowSignalBooking: signalActive,
          signalAmount: Number(signalAmount) || 0,
        },
      });
      onTriggerToast('Configuração de Sinal de Reserva atualizada com sucesso!');
    } catch {
      onTriggerToast('Configuração de Sinal salva localmente.');
    }
  };

  const handleCreateCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeForm.clientName.trim() || !chargeForm.amount) {
      onTriggerToast('Preencha o nome do cliente e o valor da cobrança.');
      return;
    }

    const txCode = `PIX-${Math.floor(100000 + Math.random() * 900000)}`;
    const parsedAmount = parseFloat(chargeForm.amount) || 0;
    const newTx: PaymentTransaction = {
      id: `manual-gw-${Date.now()}`,
      txId: txCode,
      clientName: chargeForm.clientName,
      clientPhone: chargeForm.clientPhone,
      description: chargeForm.description || 'Cobrança Pix no Balcão',
      type: chargeForm.type,
      method: 'PIX Dinâmico',
      amount: parsedAmount,
      status: 'Pendente',
      createdAt: 'Agora mesmo',
      pixPayload: `00020126580014br.gov.bcb.pix0136${txCode}520400005303986540${parsedAmount.toFixed(2)}5802BR5924${(activeTenant.name || 'ServicosAgenda').slice(0, 20)}6009SAOPAULO62070503***6304A1B2`,
    };

    setManualCharges((prev) => [newTx, ...prev]);
    setIsNewChargeModalOpen(false);
    setActiveQrModalTx(newTx);
    onTriggerToast(`Cobrança Pix gerada com sucesso! Código: ${txCode}`);
  };

  const handleSimulateApproval = (txId: string) => {
    setManualCharges((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'Aprovado' } : t))
    );
    setActiveQrModalTx(null);
    onTriggerToast('✅ Webhook Recebido: Pagamento PIX Aprovado Instantaneamente!');
  };

  const handleSelectExistingClient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const found = clients.find((c) => c.id === selectedId);
    if (found) {
      setChargeForm((prev) => ({
        ...prev,
        clientName: found.name,
        clientPhone: found.phone || prev.clientPhone,
      }));
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === 'aprovados') return t.status === 'Aprovado';
    if (filterStatus === 'pendentes') return t.status === 'Pendente';
    if (filterStatus === 'sinais') return t.type === 'Sinal de Reserva';
    return true;
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#131b2e] tracking-tight">
              Gateway de Pagamentos & Pix
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Gateway Ativo (PIX Instantâneo)
            </span>
          </div>
          <p className="text-sm text-[#4a4455]">
            Emissão de QR Code Pix dinâmico, acompanhamento de webhooks e controle de sinal de reserva.
          </p>
        </div>

        <button
          onClick={() => {
            setChargeForm({
              clientName: clients[0]?.name || '',
              clientPhone: clients[0]?.phone || '+55 11 ',
              description: '',
              amount: '',
              type: 'Total do Atendimento',
            });
            setIsNewChargeModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all transform active:scale-95"
          type="button"
        >
          <span className="material-symbols-outlined text-[1.125rem]">qr_code_2</span>
          + Gerar Cobrança PIX
        </button>
      </div>

      {/* 4 Financial / Gateway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Faturamento via PIX</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              R$ {totalPixApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1rem]">bolt</span>
            Compensação imediata sem taxas
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Sinais de Reserva Recebidos</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#630ed4] mt-1">
              R$ {totalSignalsReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-xs text-[#4a4455] mt-3">
            Garantia contra no-show de clientes online
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Cobranças Pendentes</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1">
              {pendingChargesCount}
            </p>
          </div>
          <span className="text-xs text-amber-800 font-semibold mt-3">
            Aguardando pagamento do cliente
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs text-[#4a4455] font-medium">Taxa de Conversão Pix</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] mt-1">
              {conversionRate}%
            </p>
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-[1rem]">check_circle</span>
            Alta taxa de liquidação
          </span>
        </div>
      </div>

      {/* Seção: Parâmetros do Sinal de Reserva */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#f8f5ff] to-[#eaedff] border border-[#d2bbff]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[1.25rem]">savings</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#131b2e]">
              Exigir Sinal Financeiro para Agendamentos Online
            </h3>
            <p className="text-xs text-[#4a4455] mt-0.5">
              O cliente só garante o horário na agenda se pagar a taxa de reserva via Pix no link público.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#131b2e]">
            <input
              type="checkbox"
              checked={signalActive}
              onChange={(e) => setSignalActive(e.target.checked)}
              className="w-4 h-4 accent-[#7c3aed]"
            />
            <span>Ativar Sinal</span>
          </label>

          {signalActive && (
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-[#eaedff]">
              <span className="text-xs font-bold text-[#7b7487]">R$</span>
              <input
                type="number"
                value={signalAmount}
                onChange={(e) => setSignalAmount(Number(e.target.value))}
                className="w-16 text-xs font-extrabold text-[#131b2e] outline-none"
              />
            </div>
          )}

          <button
            onClick={handleSaveSignalConfig}
            className="px-3.5 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-xs transition-colors"
            type="button"
          >
            Salvar Regra
          </button>
        </div>
      </div>

      {/* Tabela de Transações do Gateway */}
      <div className="rounded-xl bg-white border border-[#eaedff] shadow-sm overflow-hidden flex flex-col gap-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff]/60 pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#131b2e]">Registro de Cobranças do Gateway</h2>
            <p className="text-xs text-[#7b7487]">Todas as liquidações de Pix e cartão em tempo real</p>
          </div>

          <div className="inline-flex p-0.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'aprovados', label: 'Aprovadas' },
              { id: 'pendentes', label: 'Pendentes' },
              { id: 'sinais', label: 'Sinais de Reserva' },
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
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#f2f3ff] text-[#7c3aed] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <p className="font-bold text-[#131b2e] text-sm">Nenhuma cobrança registrada</p>
            <p className="text-xs text-[#7b7487] mt-1 max-w-sm">
              Conforme novos agendamentos forem realizados ou cobranças forem geradas pelo balcão, elas aparecerão aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f2f3ff] text-[#4a4455] text-xs font-semibold">
                  <th className="py-2.5 px-3 rounded-l-lg">ID / Transação</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Tipo de Cobrança</th>
                  <th className="py-2.5 px-3">Forma</th>
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Valor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#f2f3ff]/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-[#630ed4]">
                      {tx.txId}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-[#131b2e] leading-snug">{tx.clientName}</p>
                      <span className="text-[0.6875rem] text-[#7b7487] font-mono">{tx.clientPhone}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold ${
                          tx.type === 'Sinal de Reserva'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                      <p className="text-[0.6875rem] text-[#7b7487] mt-0.5 truncate max-w-[180px]">
                        {tx.description}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-medium text-xs text-[#131b2e]">
                        {tx.method.includes('PIX') ? (
                          <span className="material-symbols-outlined text-emerald-600 text-[1rem]">bolt</span>
                        ) : (
                          <span className="material-symbols-outlined text-[#630ed4] text-[1rem]">credit_card</span>
                        )}
                        {tx.method}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-[#7b7487]">{tx.createdAt}</td>
                    <td className="py-3 px-3 font-extrabold text-[#131b2e]">
                      R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[0.6875rem] font-bold ${
                          tx.status === 'Aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'Pendente'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-900'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        {tx.method.includes('PIX') && (
                          <button
                            onClick={() => setActiveQrModalTx(tx)}
                            className="px-2.5 py-1 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#630ed4] text-xs font-semibold flex items-center gap-1"
                            type="button"
                            title="Exibir QR Code e Chave Pix"
                          >
                            <span className="material-symbols-outlined text-[0.875rem]">qr_code</span>
                            Ver Pix
                          </button>
                        )}

                        <button
                          onClick={() => onOpenWhatsAppChat?.(tx.clientPhone, tx.clientName)}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          title="Enviar comprovante pelo WhatsApp"
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

      {/* Modal: Gerar Nova Cobrança Pix no Balcão */}
      {isNewChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[1.25rem]">qr_code_2</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#131b2e]">Nova Cobrança PIX</h3>
                  <p className="text-xs text-[#7b7487]">Gere QR Code dinâmico para recebimento imediato</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChargeModalOpen(false)}
                className="p-1 rounded-lg text-[#7b7487] hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCharge} className="flex flex-col gap-4 text-xs">
              {clients.length > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">Selecionar Cliente Cadastrado</label>
                  <select
                    onChange={handleSelectExistingClient}
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-xs font-semibold text-[#131b2e] outline-none"
                  >
                    <option value="">-- Digitar manualmente ou escolher --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'Sem tel'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#131b2e]">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  value={chargeForm.clientName}
                  onChange={(e) => setChargeForm({ ...chargeForm, clientName: e.target.value })}
                  placeholder="Ex: Nome do cliente"
                  className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">WhatsApp do Cliente</label>
                  <input
                    type="tel"
                    value={chargeForm.clientPhone}
                    onChange={(e) => setChargeForm({ ...chargeForm, clientPhone: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-[#131b2e]">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={chargeForm.amount}
                    onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })}
                    placeholder="150,00"
                    className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm font-bold text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#131b2e]">Tipo da Cobrança</label>
                <select
                  value={chargeForm.type}
                  onChange={(e) => setChargeForm({ ...chargeForm, type: e.target.value as PaymentTransaction['type'] })}
                  className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-xs font-semibold text-[#131b2e] outline-none"
                >
                  <option value="Total do Atendimento">Total do Procedimento / Atendimento</option>
                  <option value="Sinal de Reserva">Sinal de Reserva Antecipado</option>
                  <option value="Assinatura Mensal">Assinatura Mensal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-[#131b2e]">Descrição do Procedimento</label>
                <input
                  type="text"
                  value={chargeForm.description}
                  onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })}
                  placeholder="Ex: Corte Masculino + Barba"
                  className="h-10 px-3 rounded-lg bg-[#f8f9fa] border border-[#eaedff] text-sm text-[#131b2e] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewChargeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] font-semibold text-[#131b2e]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 font-semibold text-white shadow-xs flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[1rem]">qr_code</span>
                  Gerar QR Code Pix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exibição do QR Code Pix Dinâmico */}
      {activeQrModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-between w-full pb-2 border-b border-[#eaedff]">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <span className="material-symbols-outlined text-[1rem]">bolt</span>
                Pix Instantâneo
              </div>
              <button
                onClick={() => setActiveQrModalTx(null)}
                className="p-1 rounded-lg text-[#7b7487] hover:bg-[#f2f3ff]"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* QR Code Graphic Display */}
            <div className="p-4 bg-white border-2 border-[#131b2e] rounded-2xl shadow-inner flex flex-col items-center justify-center">
              <svg className="w-48 h-48" viewBox="0 0 200 200">
                <rect x="0" y="0" width="200" height="200" fill="#ffffff" />
                <rect x="15" y="15" width="45" height="45" fill="#131b2e" />
                <rect x="23" y="23" width="29" height="29" fill="#ffffff" />
                <rect x="30" y="30" width="15" height="15" fill="#131b2e" />

                <rect x="140" y="15" width="45" height="45" fill="#131b2e" />
                <rect x="148" y="23" width="29" height="29" fill="#ffffff" />
                <rect x="155" y="30" width="15" height="15" fill="#131b2e" />

                <rect x="15" y="140" width="45" height="45" fill="#131b2e" />
                <rect x="23" y="148" width="29" height="29" fill="#ffffff" />
                <rect x="30" y="155" width="15" height="15" fill="#131b2e" />

                <rect x="75" y="25" width="10" height="20" fill="#131b2e" />
                <rect x="95" y="15" width="15" height="10" fill="#131b2e" />
                <rect x="120" y="30" width="10" height="20" fill="#131b2e" />

                <rect x="75" y="75" width="50" height="50" fill="#7c3aed" rx="8" />
                <circle cx="100" cy="100" r="14" fill="#ffffff" />
                <polygon points="96,93 108,100 96,107" fill="#7c3aed" />

                <rect x="20" y="80" width="40" height="10" fill="#131b2e" />
                <rect x="40" y="100" width="25" height="15" fill="#131b2e" />
                <rect x="140" y="80" width="40" height="15" fill="#131b2e" />
                <rect x="145" y="110" width="25" height="15" fill="#131b2e" />

                <rect x="80" y="145" width="20" height="20" fill="#131b2e" />
                <rect x="110" y="140" width="30" height="10" fill="#131b2e" />
                <rect x="150" y="150" width="20" height="25" fill="#131b2e" />
              </svg>
            </div>

            <div>
              <span className="text-[0.6875rem] text-[#7b7487] uppercase font-bold tracking-wider">
                Valor da Cobrança
              </span>
              <p className="text-2xl font-black text-[#131b2e]">
                R$ {activeQrModalTx.amount.toFixed(2)}
              </p>
              <p className="text-xs text-[#4a4455] mt-0.5">
                {activeQrModalTx.clientName} • {activeQrModalTx.description}
              </p>
            </div>

            {/* Pix Copia e Cola */}
            <div className="w-full flex items-center gap-1 p-2 bg-[#f2f3ff] rounded-xl border border-[#eaedff]">
              <input
                readOnly
                type="text"
                value={activeQrModalTx.pixPayload || ''}
                className="bg-transparent text-[0.625rem] font-mono text-[#4a4455] flex-1 outline-none truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(activeQrModalTx.pixPayload || '');
                  onTriggerToast('Chave Pix Copia e Cola copiada para a área de transferência!');
                }}
                className="px-2.5 py-1 rounded bg-[#7c3aed] text-white text-[0.6875rem] font-bold shrink-0"
                type="button"
              >
                Copiar
              </button>
            </div>

            {/* Simular Aprovação do Gateway */}
            <button
              onClick={() => handleSimulateApproval(activeQrModalTx.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[1rem]">check_circle</span>
              Simular Confirmação do Pagamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
