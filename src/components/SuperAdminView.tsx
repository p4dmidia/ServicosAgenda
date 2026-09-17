import React, { useState } from 'react';
import { Tenant, ScreenType } from '../types';
import { useTenant } from '../context/TenantContext';

interface SuperAdminViewProps {
  onNavigate: (screen: ScreenType) => void;
  onTriggerToast: (msg: string) => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  onNavigate,
  onTriggerToast,
}) => {
  const {
    tenants,
    addTenant,
    toggleTenantStatus,
    impersonateTenant,
  } = useTenant();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('todos');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);

  // Form state for new clinic
  const [formData, setFormData] = useState({
    name: '',
    type: 'clinica' as Tenant['type'],
    plan: 'Pro' as Tenant['plan'],
    monthlyFee: 297,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '+55 11 ',
    address: '',
    allowSignalBooking: true,
    signalAmount: 50,
    activeProfessionalsCount: 2,
  });

  // Calculate KPIs
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.status === 'ativo').length;
  const suspendedTenants = tenants.filter((t) => t.status === 'suspenso').length;
  const mrrTotal = tenants
    .filter((t) => t.status === 'ativo')
    .reduce((acc, curr) => acc + curr.monthlyFee, 0);
  const totalNetworkAppointments = tenants.reduce(
    (acc, curr) => acc + curr.activeAppointmentsCount,
    0
  );

  // Filtered tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedSegment !== 'todos' && t.type !== selectedSegment) return false;
    if (selectedStatus !== 'todos' && t.status !== selectedStatus) return false;

    return true;
  });

  const handlePlanChange = (plan: Tenant['plan']) => {
    const feeMap: Record<Tenant['plan'], number> = {
      Bronze: 97,
      Prata: 147,
      Ouro: 197,
      Pro: 297,
      Enterprise: 497,
    };
    setFormData((prev) => ({
      ...prev,
      plan,
      monthlyFee: feeMap[plan],
    }));
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.ownerName.trim()) {
      onTriggerToast('Por favor, preencha o nome da empresa e do responsável.');
      return;
    }

    const generatedSlug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    addTenant({
      name: formData.name,
      slug: generatedSlug,
      type: formData.type,
      status: 'ativo',
      plan: formData.plan,
      monthlyFee: formData.monthlyFee,
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      ownerPhone: formData.ownerPhone,
      address: formData.address || 'Endereço Comercial',
      activeProfessionalsCount: Number(formData.activeProfessionalsCount) || 1,
      settings: {
        allowSignalBooking: formData.allowSignalBooking,
        signalAmount: Number(formData.signalAmount) || 0,
        primaryColor: formData.type === 'barbearia' ? '#b45309' : '#7c3aed',
        reminderHoursBefore: [24, 2],
        segment: formData.type,
      },
    });

    onTriggerToast(`Empresa "${formData.name}" cadastrada com sucesso no SaaS!`);
    setIsNewTenantModalOpen(false);
    setFormData({
      name: '',
      type: 'clinica',
      plan: 'Pro',
      monthlyFee: 297,
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '+55 11 ',
      address: '',
      allowSignalBooking: true,
      signalAmount: 50,
      activeProfessionalsCount: 2,
    });
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Super Admin Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#1e1743] to-[#283044] p-6 rounded-2xl text-white shadow-md border border-[#eaedff]/20">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaddff] text-[#630ed4] text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[0.875rem]">admin_panel_settings</span>
              Super Admin SaaS
            </span>
            <span className="text-xs text-[#ccbeff]">Painel Master da Plataforma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1 text-white">
            Gestão Multi-empresa & Assinantes
          </h1>
          <p className="text-xs sm:text-sm text-[#e2e7ff]/80">
            Gerencie todas as clínicas e barbearias licenciadas no sistema, planos e status de operação.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTriggerToast('Exportando relatório consolidado do SaaS em XLSX...')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors border border-white/10"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">download</span>
            Exportar dados
          </button>
          <button
            id="btn-cadastrar-nova-clinica"
            onClick={() => setIsNewTenantModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-purple-900/30 transition-all transform active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add_business</span>
            + Nova Empresa
          </button>
        </div>
      </div>

      {/* KPI Cards SaaS (Visão Global da Mariane) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#4a4455] font-medium">Total de Empresas</span>
              <p className="text-3xl font-extrabold text-[#131b2e] tracking-tight mt-1">
                {totalTenants}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#630ed4]">
              <span className="material-symbols-outlined text-[1.375rem]">domain</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4a4455]">
            <span className="font-semibold text-emerald-700">{activeTenants} ativas</span>
            <span>•</span>
            <span className="text-amber-700 font-medium">{suspendedTenants} suspensas</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#4a4455] font-medium">MRR (Receita Recorrente SaaS)</span>
              <p className="text-3xl font-extrabold text-emerald-600 tracking-tight mt-1">
                R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[1.375rem]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <span className="material-symbols-outlined text-[1rem]">trending_up</span>
            <span>Previsão de fechamento mensal</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#4a4455] font-medium">Agendamentos Hoje (Rede)</span>
              <p className="text-3xl font-extrabold text-[#630ed4] tracking-tight mt-1">
                {totalNetworkAppointments}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#630ed4]">
              <span className="material-symbols-outlined text-[1.375rem]">event_available</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-[#4a4455]">
            Volume operacional somado de todos os clientes
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#4a4455] font-medium">Taxa de Atividade SaaS</span>
              <p className="text-3xl font-extrabold text-[#131b2e] tracking-tight mt-1">
                {totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0}%
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#524584]">
              <span className="material-symbols-outlined text-[1.375rem]">verified_user</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[0.875rem]">check_circle</span>
            Plataforma 100% operacional
          </div>
        </div>
      </div>

      {/* Filtros e Busca de Estabelecimentos */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#eaedff] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.25rem]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por clínica, responsável, e-mail ou link..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f2f3ff] text-sm text-[#131b2e] placeholder:text-[#7b7487] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Filter */}
          <div className="inline-flex p-0.5 rounded-lg bg-[#f2f3ff] border border-[#eaedff]">
            {[
              { id: 'todos', label: 'Todos segmentos' },
              { id: 'clinica', label: 'Clínicas' },
              { id: 'barbearia', label: 'Barbearias' },
              { id: 'estetica', label: 'Estética' },
            ].map((seg) => (
              <button
                key={seg.id}
                onClick={() => setSelectedSegment(seg.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedSegment === seg.id
                    ? 'bg-white text-[#630ed4] shadow-xs'
                    : 'text-[#4a4455] hover:text-[#131b2e]'
                }`}
                type="button"
              >
                {seg.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            aria-label="Filtrar por status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[#f2f3ff] text-xs font-semibold text-[#131b2e] border border-[#eaedff] outline-none cursor-pointer"
          >
            <option value="todos">Status: Todos</option>
            <option value="ativo">Somente Ativos</option>
            <option value="suspenso">Somente Suspensos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Empresas Cadastradas */}
      <div className="rounded-xl bg-white border border-[#eaedff] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#eaedff]/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#630ed4]">storefront</span>
            <h2 className="font-bold text-lg text-[#131b2e]">Empresas Licenciadas no SaaS</h2>
          </div>
          <span className="text-xs text-[#4a4455] font-medium">
            Exibindo {filteredTenants.length} de {tenants.length} cadastradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f3ff]/70 text-[#4a4455] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Empresa / Estabelecimento</th>
                <th className="py-3 px-4">Segmento</th>
                <th className="py-3 px-4">Responsável & Contato</th>
                <th className="py-3 px-4">Plano Contratado</th>
                <th className="py-3 px-4">Operação Hoje</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaedff]/60 text-sm">
              {filteredTenants.map((tenant) => (
                <tr
                  key={tenant.id}
                  className="hover:bg-[#f2f3ff]/40 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {tenant.logo ? (
                        <img
                          src={tenant.logo}
                          alt={tenant.name}
                          className="w-10 h-10 rounded-lg object-cover border border-[#eaedff]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#eaddff] text-[#630ed4] flex items-center justify-center font-bold text-sm">
                          {tenant.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-[#131b2e] leading-tight">
                          {tenant.name}
                        </span>
                        <span className="text-xs text-[#630ed4] hover:underline flex items-center gap-0.5 mt-0.5">
                          <span className="material-symbols-outlined text-[0.875rem]">link</span>
                          /agendar/{tenant.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tenant.type === 'clinica'
                          ? 'bg-purple-100 text-purple-800'
                          : tenant.type === 'barbearia'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[0.875rem]">
                        {tenant.type === 'clinica'
                          ? 'medical_services'
                          : tenant.type === 'barbearia'
                          ? 'content_cut'
                          : 'spa'}
                      </span>
                      {tenant.type === 'clinica'
                        ? 'Clínica'
                        : tenant.type === 'barbearia'
                        ? 'Barbearia'
                        : 'Estética/Spa'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col text-xs">
                      <span className="font-semibold text-[#131b2e]">{tenant.ownerName}</span>
                      <span className="text-[#4a4455]">{tenant.ownerEmail}</span>
                      <span className="text-[#7b7487] font-medium mt-0.5">{tenant.ownerPhone}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-[#e2e7ff] text-[#131b2e] text-xs font-bold">
                          {tenant.plan}
                        </span>
                        <span className="font-bold text-[#131b2e] text-xs sm:text-sm">
                          R$ {tenant.monthlyFee.toFixed(2)}/mês
                        </span>
                      </div>
                      <span className="text-[0.6875rem] text-[#7b7487] mt-0.5">
                        Desde {tenant.createdAt}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex flex-col text-xs">
                      <span className="text-[#131b2e] font-semibold">
                        {tenant.activeAppointmentsCount} agendamentos hoje
                      </span>
                      <span className="text-[#7b7487]">
                        {tenant.activeProfessionalsCount} especialistas ativos
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => {
                        toggleTenantStatus(tenant.id);
                        onTriggerToast(
                          `Status de "${tenant.name}" alterado para ${
                            tenant.status === 'ativo' ? 'SUSPENSO' : 'ATIVO'
                          }`
                        );
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        tenant.status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                      type="button"
                      title="Clique para alternar o status da conta"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tenant.status === 'ativo' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}
                      />
                      {tenant.status === 'ativo' ? 'Ativo' : 'Suspenso'}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          impersonateTenant(tenant.id, onNavigate);
                          onTriggerToast(`Acessando painel da empresa: ${tenant.name}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-xs transition-all"
                        type="button"
                        title="Acessar como dono desta clínica (Impersonation)"
                      >
                        <span className="material-symbols-outlined text-[1rem]">login</span>
                        Acessar Painel
                      </button>

                      <button
                        onClick={() => {
                          onTriggerToast(`Link público copiado: https://seusite.com/agendar/${tenant.slug}`);
                        }}
                        className="p-1.5 rounded-lg text-[#4a4455] hover:bg-[#e2e7ff] transition-colors"
                        type="button"
                        title="Copiar link público de agendamento"
                      >
                        <span className="material-symbols-outlined text-[1.125rem]">share</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Nova Empresa (Tenant) */}
      {isNewTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#eaedff] flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaedff]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#eaddff] text-[#630ed4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[1.25rem]">add_business</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#131b2e]">Nova Empresa no SaaS</h3>
                  <p className="text-xs text-[#7b7487]">Cadastrar nova clínica, barbearia ou salão</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTenantModalOpen(false)}
                className="p-1 rounded-lg text-[#7b7487] hover:bg-[#f2f3ff] hover:text-[#131b2e]"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-[#131b2e]">
                  Nome da Empresa / Estabelecimento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Clínica Derma Laser, Barbearia Vintage..."
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] focus:ring-2 focus:ring-[#7c3aed]/30 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-[#131b2e]">Segmento *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Tenant['type'] })}
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none cursor-pointer"
                  >
                    <option value="clinica">Clínica Médica / Estética</option>
                    <option value="barbearia">Barbearia</option>
                    <option value="salao">Salão de Beleza</option>
                    <option value="estetica">Spa / Estética</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-[#131b2e]">Plano SaaS *</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => handlePlanChange(e.target.value as Tenant['plan'])}
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none cursor-pointer"
                  >
                    <option value="Bronze">Bronze (R$ 97/mês)</option>
                    <option value="Prata">Prata (R$ 147/mês)</option>
                    <option value="Ouro">Ouro (R$ 197/mês)</option>
                    <option value="Pro">Pro (R$ 297/mês)</option>
                    <option value="Enterprise">Enterprise (R$ 497/mês)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-[#131b2e]">Nome do Responsável *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Ex: Carlos Andrade"
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-xs text-[#131b2e]">WhatsApp do Dono *</label>
                  <input
                    type="text"
                    required
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="+55 11 99999-9999"
                    className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-[#131b2e]">E-mail de Login do Cliente</label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="dono@empresa.com.br"
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-xs text-[#131b2e]">Endereço Físico</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade/UF"
                  className="h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] outline-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-[#f2f3ff] border border-[#eaedff] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#131b2e]">Exigir Sinal de Reserva Online</p>
                  <p className="text-[0.6875rem] text-[#7b7487]">Cliente paga valor no Pix ao agendar</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.allowSignalBooking}
                    onChange={(e) => setFormData({ ...formData, allowSignalBooking: e.target.checked })}
                    className="w-4 h-4 accent-[#7c3aed]"
                  />
                  {formData.allowSignalBooking && (
                    <input
                      type="number"
                      value={formData.signalAmount}
                      onChange={(e) => setFormData({ ...formData, signalAmount: Number(e.target.value) })}
                      placeholder="R$"
                      className="w-20 h-8 px-2 rounded bg-white border border-[#eaedff] text-xs font-bold"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewTenantModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#7c3aed] hover:bg-[#630ed4] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Salvar e Ativar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
