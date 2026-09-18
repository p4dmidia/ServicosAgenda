import React, { useState, useEffect } from 'react';
import { useTenant } from '../context/TenantContext';

interface ConfiguracoesViewProps {
  onTriggerToast: (msg: string) => void;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ onTriggerToast }) => {
  const { activeTenant, updateTenant } = useTenant();

  const [activeTab, setActiveTab] = useState<'geral' | 'agenda' | 'notificacoes' | 'integracoes'>('geral');

  // Form Geral
  const [name, setName] = useState(activeTenant.name);
  const [slug, setSlug] = useState(activeTenant.slug);
  const [phone, setPhone] = useState(activeTenant.ownerPhone);
  const [email, setEmail] = useState(activeTenant.ownerEmail);
  const [address, setAddress] = useState(activeTenant.address);
  const [logo, setLogo] = useState(activeTenant.logo || '');
  const [primaryColor, setPrimaryColor] = useState(activeTenant.settings.primaryColor || '#7c3aed');

  useEffect(() => {
    setName(activeTenant.name || '');
    setSlug(activeTenant.slug || '');
    setPhone(activeTenant.ownerPhone || '');
    setEmail(activeTenant.ownerEmail || '');
    setAddress(activeTenant.address || '');
    setLogo(activeTenant.logo || '');
    setPrimaryColor(activeTenant.settings?.primaryColor || '#7c3aed');
    setRequireSignal(activeTenant.settings?.allowSignalBooking ?? false);
    setSignalValue(activeTenant.settings?.signalAmount || 30);
  }, [activeTenant]);

  // Quick preset colors
  const colorPresets = [
    { name: 'Roxo Bella Vita', hex: '#7c3aed' },
    { name: 'Âmbar Dom Camilo', hex: '#b45309' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Azul Real', hex: '#2563eb' },
    { name: 'Rosa Coral', hex: '#e11d48' },
    { name: 'Preto Carbono', hex: '#18181b' },
  ];

  // Form Agenda
  const [intervalMinutes, setIntervalMinutes] = useState('15');
  const [minAdvanceHours, setMinAdvanceHours] = useState('2');
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('19:00');

  // Form Notificações
  const [reminder24h, setReminder24h] = useState(true);
  const [reminder2h, setReminder2h] = useState(true);
  const [npsReview, setNpsReview] = useState(true);
  const [reactivationAlert, setReactivationAlert] = useState(true);

  // Form Integrações
  const [pixKey, setPixKey] = useState('pix@clinicabellavita.com.br');
  const [requireSignal, setRequireSignal] = useState(activeTenant.settings.allowSignalBooking);
  const [signalValue, setSignalValue] = useState(activeTenant.settings.signalAmount || 50);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant(activeTenant.id, {
      name,
      slug,
      ownerPhone: phone,
      ownerEmail: email,
      address,
      logo,
      settings: {
        ...activeTenant.settings,
        primaryColor,
      },
    });
    onTriggerToast('Informações e identidade visual salvas com sucesso!');
  };

  const handleSaveAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast('Parâmetros operacionais da agenda atualizados!');
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerToast('Regras de notificações do WhatsApp salvas!');
  };

  const handleSaveIntegrations = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenant(activeTenant.id, {
      settings: {
        ...activeTenant.settings,
        allowSignalBooking: requireSignal,
        signalAmount: signalValue,
      },
    });
    onTriggerToast('Integrações e pagamentos atualizados com sucesso!');
  };

  const bookingUrl = `${window.location.origin}/agendar/${activeTenant.slug}`;
  const portalUrl = `${window.location.origin}/portal/${activeTenant.slug}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    onTriggerToast(`${label} copiado para a área de transferência!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">settings</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Configurações da Unidade</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#7c3aed] capitalize">
              {activeTenant.type} • Plano {activeTenant.plan}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Gerencie os parâmetros operacionais, regras de agenda e integrações de <b>{activeTenant.name}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerToast('Configurações sincronizadas!')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">sync</span>
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="w-full flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('geral')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'geral'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">storefront</span>
          Dados da Empresa
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'agenda'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">calendar_month</span>
          Regras da Agenda
        </button>

        <button
          onClick={() => setActiveTab('notificacoes')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'notificacoes'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">notifications_active</span>
          Lembretes WhatsApp
        </button>

        <button
          onClick={() => setActiveTab('integracoes')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'integracoes'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">integration_instructions</span>
          PIX & Integrações
        </button>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: DADOS DA EMPRESA & WHITE LABEL                    */}
      {/* ======================================================== */}
      {activeTab === 'geral' && (
        <form onSubmit={handleSaveGeneral} className="w-full bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#131b2e]">Identificação do Estabelecimento & Marca White Label</h3>
            <p className="text-xs text-[#7b7487]">Personalize logotipo, cor da marca e dados operacionais da sua empresa.</p>
          </div>

          {/* Links White Label do Estabelecimento */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-600 text-lg">link</span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">Seus Links Exclusivos para Clientes</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[0.6875rem] font-bold text-slate-500 uppercase">Agendamento Online Rápido</p>
                  <p className="text-xs font-mono font-medium text-slate-900 truncate">{bookingUrl}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bookingUrl, 'Link de agendamento')}
                    className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-semibold cursor-pointer"
                    title="Copiar Link"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">content_copy</span>
                  </button>
                  <a
                    href={`/agendar/${activeTenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    title="Abrir página"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">open_in_new</span>
                  </a>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-purple-100 flex items-center justify-between shadow-xs">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[0.6875rem] font-bold text-slate-500 uppercase">Portal do Cliente White Label</p>
                  <p className="text-xs font-mono font-medium text-slate-900 truncate">{portalUrl}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(portalUrl, 'Link do portal do cliente')}
                    className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 text-xs font-semibold cursor-pointer"
                    title="Copiar Link"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">content_copy</span>
                  </button>
                  <a
                    href={`/portal/${activeTenant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                    title="Abrir portal"
                  >
                    <span className="material-symbols-outlined text-[1.125rem]">open_in_new</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome Fantasia da Unidade</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Slug do Link (identificador da URL)</label>
              <div className="flex items-center">
                <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-[#eaedff] rounded-l-xl text-xs text-slate-500 font-mono">
                  /agendar/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                  className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-[#eaedff] text-sm font-mono focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">URL do Logotipo da Empresa</label>
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[1.25rem]">image</span>
                  </div>
                )}
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://suaempresa.com.br/logo.png"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">WhatsApp Oficial de Atendimento</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">E-mail Administrativo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Cor Primária do Tema White Label</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm font-mono focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[0.6875rem] font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: primaryColor === preset.hex ? `${preset.hex}15` : '#fff',
                        borderColor: primaryColor === preset.hex ? preset.hex : '#e2e8f0',
                        color: primaryColor === preset.hex ? preset.hex : '#475569',
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Endereço Completo</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaedff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Salvar Dados da Unidade
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* ABA 2: REGRAS DA AGENDA                                  */}
      {/* ======================================================== */}
      {activeTab === 'agenda' && (
        <form onSubmit={handleSaveAgenda} className="w-full bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#131b2e]">Operação e Grade de Horários</h3>
            <p className="text-xs text-[#7b7487]">Defina a jornada de trabalho e intervalos entre consultas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Horário de Abertura</label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Horário de Fechamento</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Higienização / Intervalo (minutos)</label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="0">Sem intervalo</option>
                <option value="10">10 minutos</option>
                <option value="15">15 minutos (Recomendado)</option>
                <option value="30">30 minutos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Antecedência Mínima para Agendar</label>
              <select
                value={minAdvanceHours}
                onChange={(e) => setMinAdvanceHours(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="1">1 hora antes</option>
                <option value="2">2 horas antes</option>
                <option value="4">4 horas antes</option>
                <option value="24">24 horas antes</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff] space-y-2">
            <h4 className="text-xs font-bold text-[#131b2e]">Dias de Atendimento na Semana</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day) => (
                <span
                  key={day}
                  className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-[#7c3aed] text-xs font-bold border border-purple-100 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[1rem]">check</span>
                  {day}
                </span>
              ))}
              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium border border-gray-200">
                Domingo (Fechado)
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaedff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Salvar Regras de Agenda
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* ABA 3: LEMBRETES WHATSAPP                                */}
      {/* ======================================================== */}
      {activeTab === 'notificacoes' && (
        <form onSubmit={handleSaveNotifications} className="w-full bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-[#131b2e]">Automações e Lembretes via WhatsApp</h3>
            <p className="text-xs text-[#7b7487]">Reduza faltas e fidelize clientes com disparos automáticos.</p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
              <div>
                <p className="text-sm font-bold text-[#131b2e]">Lembrete de Véspera (24h antes)</p>
                <p className="text-xs text-[#7b7487]">Pergunta se o cliente confirma ou precisa remarcar com 1 clique</p>
              </div>
              <input
                type="checkbox"
                checked={reminder24h}
                onChange={(e) => setReminder24h(e.target.checked)}
                className="w-4 h-4 text-[#7c3aed] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
              <div>
                <p className="text-sm font-bold text-[#131b2e]">Lembrete de Turno (2h antes)</p>
                <p className="text-xs text-[#7b7487]">Envia rota GPS do Google Maps e orientações de chegada</p>
              </div>
              <input
                type="checkbox"
                checked={reminder2h}
                onChange={(e) => setReminder2h(e.target.checked)}
                className="w-4 h-4 text-[#7c3aed] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
              <div>
                <p className="text-sm font-bold text-[#131b2e]">Pesquisa de Satisfação NPS (Pós-atendimento)</p>
                <p className="text-xs text-[#7b7487]">Disparada 1h após a consulta ser concluída no sistema</p>
              </div>
              <input
                type="checkbox"
                checked={npsReview}
                onChange={(e) => setNpsReview(e.target.checked)}
                className="w-4 h-4 text-[#7c3aed] rounded"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
              <div>
                <p className="text-sm font-bold text-[#131b2e]">Alerta de Reativação (+30 dias sem retorno)</p>
                <p className="text-xs text-[#7b7487]">Dispara condição especial de retorno para resgatar o cliente</p>
              </div>
              <input
                type="checkbox"
                checked={reactivationAlert}
                onChange={(e) => setReactivationAlert(e.target.checked)}
                className="w-4 h-4 text-[#7c3aed] rounded"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaedff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Salvar Regras de Notificação
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* ABA 4: PIX & INTEGRAÇÕES                                 */}
      {/* ======================================================== */}
      {activeTab === 'integracoes' && (
        <form onSubmit={handleSaveIntegrations} className="w-full bg-white rounded-2xl border border-[#eaedff] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#131b2e]">Meios de Pagamento & Conexões</h3>
            <p className="text-xs text-[#7b7487]">Configuração do Pix Oficial e blindagem de no-shows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Chave Pix Principal da Clínica</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm font-mono focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131b2e] mb-1">Valor do Sinal de Reserva (R$)</label>
              <input
                type="number"
                value={signalValue}
                onChange={(e) => setSignalValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#eaedff] text-sm font-bold text-[#7c3aed] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
            <div>
              <p className="text-sm font-bold text-[#131b2e]">Exigir Sinal Pix no Agendamento Online</p>
              <p className="text-xs text-[#7b7487]">O horário só é confirmado após a confirmação do sinal via webhook</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={requireSignal}
                onChange={(e) => setRequireSignal(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-[#eaedff] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
            >
              Salvar Configurações de Pagamento
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
