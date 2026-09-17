import React, { useState } from 'react';
import { AfiliadoItem, AfiliadoLead } from '../types';

interface AfiliadosViewProps {
  onTriggerToast: (msg: string) => void;
  onOpenWhatsAppChat?: (phone?: string, name?: string) => void;
}

export const AfiliadosView: React.FC<AfiliadosViewProps> = ({
  onTriggerToast,
  onOpenWhatsAppChat,
}) => {
  const [activeTab, setActiveTab] = useState<'afiliados' | 'leads' | 'configuracao'>('afiliados');
  const [searchTerm, setSearchTerm] = useState('');

  // Parceiros Cadastrados
  const [afiliados, setAfiliados] = useState<AfiliadoItem[]>([
    {
      id: 'afil-1',
      name: 'Rodrigo Mendes Consultoria',
      email: 'rodrigo@mendesgestao.com.br',
      phone: '+55 11 98112-9900',
      referralCode: 'MENDES20',
      referralLink: 'https://servicosagenda.com.br/convite?ref=MENDES20',
      commissionPercent: 20,
      totalLeads: 18,
      totalConversions: 8,
      totalCommissionEarned: 3580.0,
      totalCommissionPaid: 3100.0,
      pendingBalance: 480.0,
      status: 'Ativo',
      pixKey: 'rodrigo@mendesgestao.com.br',
      joinedAt: '12/03/2026',
    },
    {
      id: 'afil-2',
      name: 'Agência Barbearia Lucrativa',
      email: 'contato@barbearialucrativa.com',
      phone: '+55 11 97433-8822',
      referralCode: 'BARBERPRO',
      referralLink: 'https://servicosagenda.com.br/convite?ref=BARBERPRO',
      commissionPercent: 25,
      totalLeads: 24,
      totalConversions: 12,
      totalCommissionEarned: 5890.0,
      totalCommissionPaid: 4990.0,
      pendingBalance: 900.0,
      status: 'Ativo',
      pixKey: '11974338822',
      joinedAt: '05/04/2026',
    },
    {
      id: 'afil-3',
      name: 'Dra. Juliana Peixoto (Influencer Estética)',
      email: 'dra.juliana@esteticaexpert.com',
      phone: '+55 21 99887-5544',
      referralCode: 'ESTETICAEXPERT',
      referralLink: 'https://servicosagenda.com.br/convite?ref=ESTETICAEXPERT',
      commissionPercent: 20,
      totalLeads: 31,
      totalConversions: 9,
      totalCommissionEarned: 4120.0,
      totalCommissionPaid: 4120.0,
      pendingBalance: 0.0,
      status: 'Ativo',
      pixKey: 'juliana.peixoto@pix.me',
      joinedAt: '18/05/2026',
    },
  ]);

  // Clínicas e Barbearias indicadas pelos parceiros
  const [leads, setLeads] = useState<AfiliadoLead[]>([
    {
      id: 'lead-1',
      afiliadoId: 'afil-1',
      afiliadoName: 'Rodrigo Mendes Consultoria',
      clinicName: 'Clínica Dermato Prime Alphaville',
      ownerName: 'Dra. Helena Duarte',
      planName: 'Ouro (R$ 349/mês)',
      monthlyValue: 349.0,
      commissionValue: 69.8,
      status: 'Assinante Ativo',
      signupDate: '15/06/2026',
    },
    {
      id: 'lead-2',
      afiliadoId: 'afil-2',
      afiliadoName: 'Agência Barbearia Lucrativa',
      clinicName: 'The Barber House Morumbi',
      ownerName: 'Thiago Faria',
      planName: 'Prata (R$ 249/mês)',
      monthlyValue: 249.0,
      commissionValue: 62.25,
      status: 'Assinante Ativo',
      signupDate: '02/07/2026',
    },
    {
      id: 'lead-3',
      afiliadoId: 'afil-3',
      afiliadoName: 'Dra. Juliana Peixoto',
      clinicName: 'Instituto Facial Bela Arte',
      ownerName: 'Cláudia Rocha',
      planName: 'Ouro (R$ 349/mês)',
      monthlyValue: 349.0,
      commissionValue: 69.8,
      status: 'Assinante Ativo',
      signupDate: '28/07/2026',
    },
    {
      id: 'lead-4',
      afiliadoId: 'afil-2',
      afiliadoName: 'Agência Barbearia Lucrativa',
      clinicName: 'Studio Viking Navalha',
      ownerName: 'Felipe Santana',
      planName: 'Bronze (R$ 149/mês)',
      monthlyValue: 149.0,
      commissionValue: 37.25,
      status: 'Em Teste',
      signupDate: '01/09/2026',
    },
  ]);

  // Modais
  const [isNewAfiliadoModalOpen, setIsNewAfiliadoModalOpen] = useState(false);
  const [isPayPixModalOpen, setIsPayPixModalOpen] = useState(false);
  const [selectedAfiliadoForPay, setSelectedAfiliadoForPay] = useState<AfiliadoItem | null>(null);

  // Form Novo Afiliado
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formPercent, setFormPercent] = useState('20');
  const [formPix, setFormPix] = useState('');

  // Cálculos de KPIs
  const totalAfiliadosAtivos = afiliados.filter((a) => a.status === 'Ativo').length;
  const totalMRRGeradoPorAfiliados = leads
    .filter((l) => l.status === 'Assinante Ativo')
    .reduce((acc, cur) => acc + cur.monthlyValue, 0);
  const totalComissoesPagas = afiliados.reduce((acc, cur) => acc + cur.totalCommissionPaid, 0);
  const totalComissoesPendentes = afiliados.reduce((acc, cur) => acc + cur.pendingBalance, 0);

  const filteredAfiliados = afiliados.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = (link: string) => {
    navigator.clipboard?.writeText(link);
    onTriggerToast('Link de afiliado copiado para a área de transferência!');
  };

  const handleCreateAfiliado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const code = formCode || formName.split(' ')[0].toUpperCase() + 'SAAS';
    const newAfil: AfiliadoItem = {
      id: `afil-${Date.now()}`,
      name: formName,
      email: formEmail,
      phone: formPhone || '+55 11 99999-9999',
      referralCode: code,
      referralLink: `https://servicosagenda.com.br/convite?ref=${code}`,
      commissionPercent: parseInt(formPercent) || 20,
      totalLeads: 0,
      totalConversions: 0,
      totalCommissionEarned: 0,
      totalCommissionPaid: 0,
      pendingBalance: 0,
      status: 'Ativo',
      pixKey: formPix || formEmail,
      joinedAt: 'Hoje',
    };

    setAfiliados((prev) => [newAfil, ...prev]);
    setIsNewAfiliadoModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCode('');
    setFormPix('');
    onTriggerToast(`Parceiro ${newAfil.name} cadastrado com sucesso!`);
  };

  const handleConfirmPixPayment = () => {
    if (!selectedAfiliadoForPay) return;

    const amount = selectedAfiliadoForPay.pendingBalance;
    setAfiliados((prev) =>
      prev.map((a) => {
        if (a.id === selectedAfiliadoForPay.id) {
          return {
            ...a,
            totalCommissionPaid: a.totalCommissionPaid + amount,
            pendingBalance: 0,
          };
        }
        return a;
      })
    );

    setIsPayPixModalOpen(false);
    onTriggerToast(`Repasse Pix de R$ ${amount.toFixed(2)} liquidado para ${selectedAfiliadoForPay.name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">share</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Programa de Parceiros & Afiliados</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#7c3aed]">
              Expansão do SaaS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Gestão de influenciadores, consultores e agências parceiras que comercializam o <b>Serviços Agenda</b> para clínicas e barbearias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewAfiliadoModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">person_add</span>
            Cadastrar Parceiro
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">MRR de Afiliados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">trending_up</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalMRRGeradoPorAfiliados.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-emerald-700 font-medium mt-1 block">
            Receita mensal originada de parceiros
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Parceiros Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">handshake</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            {totalAfiliadosAtivos} afiliados
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Divulgando ativamente a plataforma
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Comissões Pagas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">payments</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalComissoesPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-blue-700 font-medium mt-1 block">
            Repasses liquidados via chave Pix
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Repasses Pendentes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">schedule</span>
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            R$ {totalComissoesPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-amber-700 font-medium mt-1 block">
            Saldo acumulado a ser transferido
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('afiliados')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'afiliados'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">group</span>
          Parceiros Cadastrados ({afiliados.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">domain</span>
          Clínicas & Barbearias Indicadas ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab('configuracao')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'configuracao'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">settings</span>
          Diretrizes & Comissionamento
        </button>
      </div>

      {/* TAB 1: AFILIADOS */}
      {activeTab === 'afiliados' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.125rem]">
                search
              </span>
              <input
                type="text"
                placeholder="Buscar parceiro por nome, código ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div className="text-xs text-[#7b7487]">
              Comissões recorrentes pagas mensalmente enquanto o cliente permanecer ativo
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#eaedff] text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Parceiro</th>
                  <th className="py-3.5 px-4">Link Exclusivo</th>
                  <th className="py-3.5 px-4">Comissão (%)</th>
                  <th className="py-3.5 px-4">Conversões</th>
                  <th className="py-3.5 px-4">Saldo a Pagar</th>
                  <th className="py-3.5 px-4">Total Já Pago</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredAfiliados.map((afil) => (
                  <tr key={afil.id} className="hover:bg-[#fcfdff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#131b2e] leading-tight">{afil.name}</p>
                        <p className="text-[0.6875rem] text-[#7b7487]">{afil.email}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded bg-purple-50 text-[#7c3aed] text-[0.625rem] font-bold">
                          CÓDIGO: {afil.referralCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleCopyLink(afil.referralLink)}
                        className="flex items-center gap-1 text-xs text-[#7c3aed] font-semibold hover:underline bg-[#f2f3ff] px-2.5 py-1 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                        Copiar Link
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#131b2e]">
                      {afil.commissionPercent}% recorrente
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-xs">
                        {afil.totalConversions} clientes ({afil.totalLeads} cliques)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-amber-600 text-sm">
                      R$ {afil.pendingBalance.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-[#7b7487]">
                      R$ {afil.totalCommissionPaid.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {afil.pendingBalance > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedAfiliadoForPay(afil);
                              setIsPayPixModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[1rem]">pix</span>
                            Pagar Pix
                          </button>
                        ) : (
                          <span className="text-[0.6875rem] text-emerald-700 font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                            Em Dia
                          </span>
                        )}
                        <button
                          onClick={() => {
                            if (onOpenWhatsAppChat) {
                              onOpenWhatsAppChat(afil.phone, afil.name);
                            }
                            onTriggerToast(`Abrindo conversa de parceiro com ${afil.name}`);
                          }}
                          className="p-1.5 rounded-lg bg-[#f2f3ff] text-[#7c3aed] hover:bg-[#e4e7ff]"
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
        </div>
      )}

      {/* TAB 2: LEADS E CLIENTES INDICADOS */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#131b2e]">Estabelecimentos Cadastrados via Afiliados</h3>
            <span className="text-xs text-[#7b7487]">Comissões computadas automaticamente</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#eaedff] text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Clínica / Barbearia</th>
                  <th className="py-3.5 px-4">Afiliado de Origem</th>
                  <th className="py-3.5 px-4">Plano Assinado</th>
                  <th className="py-3.5 px-4">Mensalidade</th>
                  <th className="py-3.5 px-4">Comissão Gerada/mês</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Data Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-[#fcfdff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-[#131b2e] leading-tight">{l.clinicName}</p>
                        <p className="text-[0.6875rem] text-[#7b7487]">Resp: {l.ownerName}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#7c3aed]">
                      {l.afiliadoName}
                    </td>
                    <td className="py-3.5 px-4 text-[#131b2e]">
                      {l.planName}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#131b2e]">
                      R$ {l.monthlyValue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      R$ {l.commissionValue.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          l.status === 'Assinante Ativo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#7b7487]">
                      {l.signupDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURAÇÃO */}
      {activeTab === 'configuracao' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#131b2e]">Regras Globais do Programa de Afiliados</h3>
            <p className="text-xs text-[#7b7487]">
              Definição dos termos contratuais e comissões para comercialização do SaaS <b>Serviços Agenda</b> por Mariane Ramos D’ Ambrosio.
            </p>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Comissão Padrão (% Recorrente)
                  </label>
                  <input
                    type="number"
                    defaultValue={20}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-[#7c3aed] focus:outline-none"
                  />
                  <p className="text-[0.6875rem] text-[#7b7487] mt-1">Percentual padrão sobre a mensalidade do plano</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Dia do Mês para Fechamento Pix
                  </label>
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-[#131b2e] focus:outline-none"
                  />
                  <p className="text-[0.6875rem] text-[#7b7487] mt-1">Todo dia 10 os saldos são liberados para repasse</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Validade do Cookie de Indicação (Dias)
                </label>
                <select defaultValue="60" className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none">
                  <option value="30">30 dias</option>
                  <option value="60">60 dias (Recomendado)</option>
                  <option value="90">90 dias</option>
                </select>
              </div>

              <button
                onClick={() => onTriggerToast('Diretrizes de afiliados salvas com sucesso!')}
                className="w-full py-2.5 rounded-xl bg-[#131b2e] text-white text-xs sm:text-sm font-bold hover:bg-[#283044] transition-colors"
              >
                Salvar Regras do Programa
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-purple-50 rounded-2xl border border-emerald-100 p-6 space-y-3">
            <span className="material-symbols-outlined text-emerald-600 text-3xl">hub</span>
            <h4 className="font-bold text-sm text-[#131b2e]">Crescimento Orgânico</h4>
            <p className="text-xs text-[#4a4455] leading-relaxed">
              O modelo de afiliados permite que consultores e influenciadores do nicho de beleza e saúde médica indiquem o sistema e recebam comissões sem gerar custo de aquisição (CAC) antecipado.
            </p>
          </div>
        </div>
      )}

      {/* MODAL NOVO AFILIADO */}
      {isNewAfiliadoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">person_add</span>
                <h3 className="font-bold text-base text-[#131b2e]">Cadastrar Novo Afiliado</h3>
              </div>
              <button
                onClick={() => setIsNewAfiliadoModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAfiliado} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome Completo / Razão Social</label>
                <input
                  type="text"
                  placeholder="Ex: Pedro Henrique Consultoria"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="pedro@email.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-9999"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Código Promocional</label>
                  <input
                    type="text"
                    placeholder="PEDRO20"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-bold focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">% Comissão Recorrente</label>
                  <input
                    type="number"
                    value={formPercent}
                    onChange={(e) => setFormPercent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-bold text-[#7c3aed] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Chave Pix para Repasses</label>
                <input
                  type="text"
                  placeholder="CPF, CNPJ, Email ou Telefone"
                  value={formPix}
                  onChange={(e) => setFormPix(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewAfiliadoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
                >
                  Salvar Parceiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGAR PIX REPASSE */}
      {isPayPixModalOpen && selectedAfiliadoForPay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">pix</span>
                <h3 className="font-bold text-base text-[#131b2e]">Liquidar Repasse via Pix</h3>
              </div>
              <button
                onClick={() => setIsPayPixModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-[#7b7487]">Beneficiário do Repasse:</p>
                <p className="text-base font-bold text-[#131b2e]">{selectedAfiliadoForPay.name}</p>
                <p className="text-xs text-[#4a4455]">Chave Pix: <b>{selectedAfiliadoForPay.pixKey}</b></p>
              </div>

              <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff] text-center">
                <span className="text-xs font-semibold text-[#7b7487] uppercase">Valor Total a Transferir</span>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  R$ {selectedAfiliadoForPay.pendingBalance.toFixed(2)}
                </p>
              </div>

              <p className="text-xs text-[#7b7487] text-center">
                Ao clicar em Confirmar, o status do repasse será marcado como pago e o extrato de comissões do afiliado será zerado.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsPayPixModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmPixPayment}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Confirmar Transferência Pix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
