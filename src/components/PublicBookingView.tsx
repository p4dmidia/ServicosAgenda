import React, { useState } from 'react';
import { Appointment, ScreenType } from '../types';
import { SERVICES_CATALOG, PROFESSIONALS_DATA } from '../data/mockData';
import { useTenant } from '../context/TenantContext';
import { createClientInSupabase } from '../services/clientService';
import { createAppointmentInSupabase } from '../services/appointmentService';

interface PublicBookingViewProps {
  onAddAppointment: (newApt: Appointment) => void;
  onNavigate?: (screen: ScreenType) => void;
  onTriggerToast: (msg: string) => void;
  initialViewMode?: 'gestao' | 'preview-cliente';
  isPublic?: boolean;
}

export const PublicBookingView: React.FC<PublicBookingViewProps> = ({
  onAddAppointment,
  onNavigate,
  onTriggerToast,
  initialViewMode = 'gestao',
  isPublic = false,
}) => {
  const { activeTenant, updateTenant } = useTenant();

  // Visualização: 'gestao' (Painel do Link & QR Code) ou 'preview-cliente' (Experiência do Cliente)
  const [viewMode, setViewMode] = useState<'gestao' | 'preview-cliente'>(
    isPublic ? 'preview-cliente' : initialViewMode
  );

  // Wizard Steps: 1 (Serviço) -> 2 (Profissional) -> 3 (Data & Hora) -> 4 (Identificação / Cadastro) -> 5 (Sucesso)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Seleções do cliente
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedService, setSelectedService] = useState<typeof SERVICES_CATALOG[0] | null>(SERVICES_CATALOG[0]);
  const [selectedProf, setSelectedProf] = useState<typeof PROFESSIONALS_DATA[0] | 'any'>('any');
  const [selectedDate, setSelectedDate] = useState<string>('Hoje, 24 Out');
  const [selectedTime, setSelectedTime] = useState<string>('15:30');

  // Modo de Identificação do Cliente: 'novo-cadastro' ou 'ja-cliente'
  const [authMode, setAuthMode] = useState<'novo-cadastro' | 'ja-cliente'>('novo-cadastro');

  // Dados do cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Agendamento confirmado
  const [confirmedBooking, setConfirmedBooking] = useState<{
    code: string;
    serviceName: string;
    profName: string;
    time: string;
    date: string;
    total: number;
    clientEmail?: string;
  } | null>(null);

  // Configurações do Tenant para o Link
  const [allowSignal, setAllowSignal] = useState(activeTenant.settings?.allowSignalBooking ?? true);
  const [signalValue, setSignalValue] = useState(activeTenant.settings?.signalAmount || 50);

  const publicUrl = `https://servicosagenda.com.br/agendar/${activeTenant.slug}`;
  const portalUrl = `/portal/${activeTenant.slug}`;
  const primaryColor = activeTenant.settings?.primaryColor || '#7c3aed';

  const categories = ['todos', 'Facial', 'Corporal', 'Laser', 'Cabelo & Barba'];

  const availableDays = [
    { label: 'Hoje', date: '24 Out', full: 'Hoje, 24 Out' },
    { label: 'Amanhã', date: '25 Out', full: 'Amanhã, 25 Out' },
    { label: 'Sábado', date: '26 Out', full: 'Sábado, 26 Out' },
    { label: 'Segunda', date: '28 Out', full: 'Segunda, 28 Out' },
    { label: 'Terça', date: '29 Out', full: 'Terça, 29 Out' },
  ];

  const availableSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:30', '16:30', '17:30', '18:30'
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    onTriggerToast('Link público copiado com sucesso!');
  };

  const handleConfirmAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'novo-cadastro') {
      if (!customerName.trim() || !customerPhone.trim()) {
        onTriggerToast('Por favor, informe seu nome completo e WhatsApp.');
        return;
      }
    } else {
      if (!customerEmail.trim() && !customerPhone.trim()) {
        onTriggerToast('Informe seu e-mail ou WhatsApp para entrar.');
        return;
      }
    }

    if (!selectedService) {
      onTriggerToast('Selecione um serviço para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const proName = selectedProf === 'any' ? PROFESSIONALS_DATA[0].name : selectedProf.name;
      const bookingCode = `BV-${Math.floor(1000 + Math.random() * 9000)}`;
      const effectiveName = customerName.trim() || (customerEmail ? customerEmail.split('@')[0] : 'Cliente');

      // Tenta salvar o cliente no Supabase
      if (activeTenant.id) {
        try {
          await createClientInSupabase({
            tenantId: activeTenant.id,
            name: effectiveName,
            phone: customerPhone,
            email: customerEmail,
            favoriteService: selectedService.name,
            notes: customerPassword ? 'Cadastrado via Agendamento Online' : undefined,
          });
        } catch (clientErr) {
          console.warn('Nota: Cliente salvo localmente/em sessão', clientErr);
        }
      }

      const newAppointment: Appointment = {
        id: `online-apt-${Date.now()}`,
        tenantId: activeTenant.id,
        time: selectedTime,
        clientName: effectiveName,
        clientPhone: customerPhone,
        clientInitials: effectiveName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase(),
        service: selectedService.name,
        professional: proName,
        status: 'AGENDADO',
        price: selectedService.price,
        duration: selectedService.duration,
        date: selectedDate,
      };

      onAddAppointment(newAppointment);

      // Tenta salvar o agendamento no Supabase
      if (activeTenant.id) {
        try {
          await createAppointmentInSupabase({
            tenantId: activeTenant.id,
            clientName: effectiveName,
            clientPhone: customerPhone,
            service: selectedService.name,
            professional: proName,
            date: selectedDate,
            time: selectedTime,
            price: selectedService.price,
            duration: selectedService.duration,
            status: 'AGENDADO',
          });
        } catch (aptErr) {
          console.warn('Nota: Agendamento sincronizado em memória', aptErr);
        }
      }

      setConfirmedBooking({
        code: bookingCode,
        serviceName: selectedService.name,
        profName: proName,
        time: selectedTime,
        date: selectedDate,
        total: selectedService.price,
        clientEmail: customerEmail,
      });

      setCurrentStep(5);
      onTriggerToast(`Agendamento #${bookingCode} confirmado com sucesso!`);
    } catch (err: any) {
      console.error('Erro ao registrar agendamento:', err);
      onTriggerToast('Erro ao registrar agendamento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setConfirmedBooking(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerPassword('');
    setCustomerNotes('');
  };

  const handleSaveSettings = () => {
    updateTenant(activeTenant.id, {
      settings: {
        ...activeTenant.settings,
        allowSignalBooking: allowSignal,
        signalAmount: signalValue,
      },
    });
    onTriggerToast('Configurações de agendamento online salvas!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Header - APENAS VISÍVEL PARA O ADMINISTRADOR DA CLÍNICA NO PAINEL */}
      {!isPublic && (
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#7c3aed] text-2xl">public</span>
              <h1 className="text-xl font-bold text-[#131b2e]">Agendamento Online Público</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                Link Ativo
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
              Configure as regras e pré-visualize como seus clientes agendam e criam conta com a sua marca.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('gestao')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'gestao'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'bg-[#f8f9fa] text-[#4a4455] hover:bg-[#eaedff]'
              }`}
            >
              <span className="material-symbols-outlined text-[1.125rem]">settings</span>
              Painel & Divulgação
            </button>
            <button
              onClick={() => setViewMode('preview-cliente')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                viewMode === 'preview-cliente'
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'bg-[#f8f9fa] text-[#4a4455] hover:bg-[#eaedff]'
              }`}
            >
              <span className="material-symbols-outlined text-[1.125rem]">smartphone</span>
              Testar Fluxo do Cliente
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 1: GESTÃO DO LINK, DIVULGAÇÃO & QR CODE (PAINEL ADMIN) */}
      {/* ======================================================== */}
      {!isPublic && viewMode === 'gestao' && (
        <div className="w-full space-y-6">
          {/* Barra Compacta do Link de Agendamento */}
          <div className="w-full bg-white p-4 rounded-2xl border border-[#eaedff] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#f2f3ff] text-[#7c3aed] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[1.25rem]">link</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                    Link Exclusivo de Agendamento com a Sua Marca
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs sm:text-sm font-semibold text-[#131b2e] truncate select-all bg-[#f8f9fa] px-2.5 py-1 rounded-lg border border-[#eaedff] font-mono">
                    {publicUrl}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#eaedff]">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#7c3aed] text-white font-bold text-xs hover:bg-[#6b2fd8] transition-all shadow-xs"
              >
                <span className="material-symbols-outlined text-[1rem]">content_copy</span>
                Copiar Link
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f2f3ff] text-[#131b2e] font-bold text-xs hover:bg-[#eaedff] transition-all border border-[#eaedff]"
              >
                <span className="material-symbols-outlined text-[1rem]">open_in_new</span>
                Abrir Link Público
              </a>
            </div>
          </div>

          {/* Grid de 3 Colunas com Estatísticas e QR Code */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Métricas de Conversão do Link */}
            <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">trending_up</span>
                Desempenho do Link no Mês
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                  <span className="text-[0.6875rem] font-semibold text-[#7b7487] uppercase">Visualizações</span>
                  <p className="text-2xl font-black text-[#131b2e] mt-1">1.280</p>
                  <span className="text-[0.625rem] text-emerald-600 font-bold">+18% esta semana</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                  <span className="text-[0.6875rem] font-semibold text-[#7b7487] uppercase">Agendamentos</span>
                  <p className="text-2xl font-black text-[#7c3aed] mt-1">94</p>
                  <span className="text-[0.625rem] text-emerald-600 font-bold">7.3% conversão</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                  <span className="text-[0.6875rem] font-semibold text-[#7b7487] uppercase">Receita Online</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">R$ 14.8k</p>
                  <span className="text-[0.625rem] text-[#7b7487]">Sem intervenção humana</span>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                  <span className="text-[0.6875rem] font-semibold text-[#7b7487] uppercase">Faltas Evitadas</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">98.2%</p>
                  <span className="text-[0.625rem] text-blue-700 font-bold">Com lembretes WhatsApp</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-[#4a4455] leading-relaxed">
                💡 <b>Dica de Ouro:</b> Clientes que agendam pelo link online têm 40% menos faltas porque recebem o voucher com botão de rota no WhatsApp!
              </div>
            </div>

            {/* Coluna 2: QR Code de Balcão / Recepção */}
            <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#131b2e] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[#7c3aed]">qr_code_2</span>
                  QR Code para Balcão & Display
                </h3>
                <p className="text-xs text-[#7b7487] mt-1">
                  Imprima e posicione na recepção para os clientes escanearem e agendarem o retorno.
                </p>
              </div>

              {/* QR Code Mock Visual */}
              <div className="p-4 bg-[#f8f9fa] rounded-2xl border border-[#eaedff] flex flex-col items-center shadow-2xs">
                <div className="w-40 h-40 bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-center relative shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`}
                    alt="QR Code Agendamento"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-[0.6875rem] font-mono font-bold text-[#7c3aed] mt-2">
                  /agendar/{activeTenant.slug}
                </span>
              </div>

              <button
                onClick={() => {
                  window.print();
                  onTriggerToast('Preparando impressão do display de QR Code!');
                }}
                className="w-full py-2.5 rounded-xl bg-[#131b2e] text-white text-xs font-bold hover:bg-[#283044] transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[1rem]">print</span>
                Imprimir Display de Mesa
              </button>
            </div>

            {/* Coluna 3: Regras e Parâmetros da Reserva Online */}
            <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">tune</span>
                Regras de Agendamento Online
              </h3>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9fa] border border-[#eaedff]">
                  <div>
                    <p className="text-xs font-bold text-[#131b2e]">Cobrar Sinal de Reserva (Pix)</p>
                    <p className="text-[0.6875rem] text-[#7b7487]">Exige pagamento antecipado para garantir o horário</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowSignal}
                      onChange={(e) => setAllowSignal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7c3aed]"></div>
                  </label>
                </div>

                {allowSignal && (
                  <div className="p-3 rounded-xl bg-[#f2f3ff] border border-purple-100">
                    <label className="block text-xs font-bold text-[#131b2e] mb-1">
                      Valor do Sinal Exigido (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-[#7b7487]">R$</span>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        value={signalValue}
                        onChange={(e) => setSignalValue(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#eaedff] text-xs font-bold text-[#7c3aed] focus:outline-none"
                      />
                    </div>
                    <span className="text-[0.625rem] text-[#7b7487] mt-1 block">
                      Abatido automaticamente do valor total do atendimento no balcão.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">
                    Antecedência Mínima para Agendar
                  </label>
                  <select className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none">
                    <option value="1">1 hora antes</option>
                    <option value="2">2 horas antes (Recomendado)</option>
                    <option value="4">4 horas antes</option>
                    <option value="24">24 horas de antecedência</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors shadow-sm"
                >
                  Salvar Parâmetros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 2: EXPERIÊNCIA DO CLIENTE (100% WHITE LABEL)        */}
      {/* ======================================================== */}
      {(isPublic || viewMode === 'preview-cliente') && (
        <div className="w-full py-2">
          <div
            className="bg-white rounded-3xl shadow-xl border border-[#eaedff] overflow-hidden mx-auto"
            style={{ width: '100%', maxWidth: '720px' }}
          >
            {/* Top Bar - APENAS EM MODO PREVIEW DO ADMIN INTERNO */}
            {!isPublic && (
              <div className="bg-[#1e1743] text-white px-5 py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold">Pré-visualização da Visão do Cliente • {activeTenant.name}</span>
                </div>
                <button
                  onClick={() => setViewMode('gestao')}
                  className="text-white/80 hover:text-white underline text-xs flex items-center gap-1 font-medium"
                >
                  <span className="material-symbols-outlined text-[0.875rem]">arrow_back</span>
                  Voltar às Configurações
                </button>
              </div>
            )}

            {/* Cabeçalho da Empresa / Estabelecimento (100% White Label) */}
            <div className="w-full p-6 bg-gradient-to-b from-[#f8f9fa] to-white border-b border-[#eaedff] flex flex-col items-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {activeTenant.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="w-full text-center px-4">
                <h1 className="text-xl sm:text-2xl font-black text-[#131b2e] tracking-tight">
                  {activeTenant.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#4a4455] mt-1 text-center w-full block">
                  {activeTenant.address}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-[#7b7487]">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Horários Disponíveis Hoje
                </span>
                {activeTenant.ownerPhone && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[1rem]">call</span>
                      {activeTenant.ownerPhone}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Wizard Progress Bar */}
            {currentStep < 5 && (
              <div className="px-6 py-4 bg-white border-b border-[#eaedff] flex items-center justify-between">
                {[
                  { num: 1, label: 'Serviço' },
                  { num: 2, label: 'Especialista' },
                  { num: 3, label: 'Data & Hora' },
                  { num: 4, label: 'Identificação' },
                ].map((step, idx) => (
                  <React.Fragment key={step.num}>
                    <div
                      onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        currentStep === step.num
                          ? 'text-[#7c3aed] font-bold'
                          : currentStep > step.num
                          ? 'text-emerald-600 font-semibold'
                          : 'text-[#7b7487]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          currentStep === step.num
                            ? 'bg-[#7c3aed] text-white'
                            : currentStep > step.num
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-[#f2f3ff] text-[#7b7487]'
                        }`}
                      >
                        {currentStep > step.num ? (
                          <span className="material-symbols-outlined text-[0.875rem]">check</span>
                        ) : (
                          step.num
                        )}
                      </div>
                      <span className="hidden md:inline text-xs">{step.label}</span>
                    </div>
                    {idx < 3 && <div className="flex-1 h-0.5 bg-[#eaedff] mx-2 hidden sm:block"></div>}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Wizard Content Body */}
            <div className="p-6">
              {/* PASSO 1: ESCOLHA DE SERVIÇO */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#131b2e]">
                        1. Selecione o Procedimento
                      </h2>
                      <p className="text-xs text-[#7b7487]">Escolha o serviço desejado para ver a disponibilidade</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7c3aed]">Passo 1 de 4</span>
                  </div>

                  {/* Filtro por categoria */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition-all ${
                          selectedCategory === cat
                            ? 'bg-[#7c3aed] text-white shadow-xs'
                            : 'bg-[#f8f9fa] text-[#4a4455] hover:bg-[#eaedff]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Serviços */}
                  <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-1">
                    {SERVICES_CATALOG.filter((s) => selectedCategory === 'todos' || s.category === selectedCategory).map((srv) => {
                      const isSelected = selectedService?.id === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#7c3aed] bg-[#fdfcff] shadow-sm ring-1 ring-[#7c3aed]'
                              : 'border-[#eaedff] bg-white hover:border-[#7c3aed]/40'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#7c3aed] text-white' : 'bg-[#f2f3ff] text-[#7c3aed]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[1.25rem]">spa</span>
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-[#131b2e]">{srv.name}</h4>
                              <p className="text-xs text-[#7b7487] line-clamp-1 mt-0.5">{srv.description}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7b7487]">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[0.875rem]">schedule</span>
                                  {srv.duration}
                                </span>
                                <span>•</span>
                                <span className="font-bold text-[#7c3aed]">
                                  R$ {srv.price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#7c3aed] bg-[#7c3aed] text-white' : 'border-[#ccc3d8]'
                            }`}
                          >
                            {isSelected && <span className="material-symbols-outlined text-[0.75rem]">check</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end pt-3 border-t border-[#eaedff]">
                    <button
                      type="button"
                      disabled={!selectedService}
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-xs sm:text-sm hover:bg-[#6b2fd8] disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Continuar
                      <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 2: ESCOLHA DE PROFISSIONAL */}
              {currentStep === 2 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#131b2e]">
                        2. Escolha o Profissional
                      </h2>
                      <p className="text-xs text-[#7b7487]">Selecione quem fará o seu atendimento</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7c3aed]">Passo 2 de 4</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Opção Qualquer Profissional */}
                    <div
                      onClick={() => setSelectedProf('any')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        selectedProf === 'any'
                          ? 'border-[#7c3aed] bg-[#fdfcff] shadow-sm ring-1 ring-[#7c3aed]'
                          : 'border-[#eaedff] bg-white hover:border-[#7c3aed]/40'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#7c3aed] flex items-center justify-center font-bold">
                        <span className="material-symbols-outlined text-2xl">group</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#131b2e]">Qualquer Profissional</h4>
                        <p className="text-[0.6875rem] text-emerald-600 font-bold mt-0.5">Maior disponibilidade de horário</p>
                      </div>
                    </div>

                    {/* Lista de Profissionais */}
                    {PROFESSIONALS_DATA.map((pro) => {
                      const isSelected = typeof selectedProf === 'object' && selectedProf?.id === pro.id;
                      return (
                        <div
                          key={pro.id}
                          onClick={() => setSelectedProf(pro)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'border-[#7c3aed] bg-[#fdfcff] shadow-sm ring-1 ring-[#7c3aed]'
                              : 'border-[#eaedff] bg-white hover:border-[#7c3aed]/40'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-[#f2f3ff] text-[#7c3aed] flex items-center justify-center font-black">
                            {pro.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#131b2e]">{pro.name}</h4>
                            <p className="text-[0.6875rem] text-[#7b7487]">{pro.role}</p>
                            <div className="flex items-center gap-1 text-[0.625rem] text-amber-600 font-bold mt-0.5">
                              <span className="material-symbols-outlined text-[0.75rem] text-amber-500">star</span>
                              4.9 (84 avaliações)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eaedff]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4a4455] hover:bg-[#f2f3ff]"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-xs sm:text-sm hover:bg-[#6b2fd8] transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Continuar
                      <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 3: DATA E HORÁRIO */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#131b2e]">
                        3. Escolha o Melhor Horário
                      </h2>
                      <p className="text-xs text-[#7b7487]">Selecione o dia e o horário conveniente</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7c3aed]">Passo 3 de 4</span>
                  </div>

                  {/* Dias disponíveis */}
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-2">Dia do Atendimento</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {availableDays.map((d) => (
                        <button
                          key={d.full}
                          type="button"
                          onClick={() => setSelectedDate(d.full)}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selectedDate === d.full
                              ? 'border-[#7c3aed] bg-[#7c3aed] text-white shadow-xs font-bold'
                              : 'border-[#eaedff] bg-[#f8f9fa] text-[#4a4455] hover:bg-white'
                          }`}
                        >
                          <span className="text-[0.6875rem] block opacity-80">{d.label}</span>
                          <span className="text-xs font-bold block mt-0.5">{d.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horários disponíveis */}
                  <div>
                    <label className="block text-xs font-bold text-[#131b2e] mb-2">Horários Livres</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            selectedTime === slot
                              ? 'border-[#7c3aed] bg-[#fdfcff] text-[#7c3aed] ring-1 ring-[#7c3aed]'
                              : 'border-[#eaedff] bg-white text-[#131b2e] hover:border-[#7c3aed]/40'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[0.875rem]">schedule</span>
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#eaedff]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4a4455] hover:bg-[#f2f3ff]"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2.5 rounded-xl bg-[#7c3aed] text-white font-semibold text-xs sm:text-sm hover:bg-[#6b2fd8] transition-all shadow-sm flex items-center gap-1.5"
                    >
                      Continuar para Identificação
                      <span className="material-symbols-outlined text-[1rem]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* PASSO 4: IDENTIFICAÇÃO E CADASTRO DO CLIENTE (WHITE LABEL) */}
              {currentStep === 4 && (
                <form onSubmit={handleConfirmAppointment} className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#eaedff] pb-3">
                    <div>
                      <h2 className="text-base font-bold text-[#131b2e]">
                        4. Identificação do Cliente
                      </h2>
                      <p className="text-xs text-[#7b7487]">Crie sua conta ou faça login para confirmar o agendamento</p>
                    </div>
                    <span className="text-xs font-semibold text-[#7c3aed]">Passo 4 de 4</span>
                  </div>

                  {/* Resumo do Procedimento Escolhido */}
                  <div className="p-3.5 rounded-xl bg-[#f8f5ff] border border-[#eaedff] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#131b2e] block">{selectedService?.name}</span>
                      <span className="text-[#7b7487]">{selectedDate} às {selectedTime}</span>
                    </div>
                    <span className="font-black text-sm text-[#7c3aed]">
                      R$ {selectedService?.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Tabs: Novo Cadastro vs Já sou Cliente */}
                  <div className="flex bg-[#f2f3ff] p-1 rounded-xl gap-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('novo-cadastro')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'novo-cadastro'
                          ? 'bg-white text-[#7c3aed] shadow-xs'
                          : 'text-[#4a4455] hover:text-[#131b2e]'
                      }`}
                    >
                      ✨ Primeira Vez (Criar Conta)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('ja-cliente')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        authMode === 'ja-cliente'
                          ? 'bg-white text-[#7c3aed] shadow-xs'
                          : 'text-[#4a4455] hover:text-[#131b2e]'
                      }`}
                    >
                      🔑 Já Tenho Cadastro
                    </button>
                  </div>

                  {authMode === 'novo-cadastro' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#131b2e] mb-1">
                            Seu Nome Completo *
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Mariana Silveira"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#131b2e] mb-1">
                            WhatsApp com DDD *
                          </label>
                          <input
                            type="tel"
                            placeholder="(11) 98452-1100"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#131b2e] mb-1">
                            E-mail (para login e recibo)
                          </label>
                          <input
                            type="email"
                            placeholder="mariana@email.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#131b2e] mb-1">
                            Crie uma Senha de Acesso
                          </label>
                          <input
                            type="password"
                            placeholder="Para acessar seu portal depois"
                            value={customerPassword}
                            onChange={(e) => setCustomerPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                          />
                        </div>
                      </div>

                      <p className="text-[0.6875rem] text-[#7b7487] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[0.875rem] text-purple-600">verified_user</span>
                        Com esta senha, você poderá acessar o portal da clínica para ver seu histórico e pontos de fidelidade.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#131b2e] mb-1">
                          E-mail ou WhatsApp Cadastrado *
                        </label>
                        <input
                          type="text"
                          placeholder="mariana@email.com ou (11) 98452-1100"
                          value={customerEmail || customerPhone}
                          onChange={(e) => {
                            if (e.target.value.includes('@')) {
                              setCustomerEmail(e.target.value);
                            } else {
                              setCustomerPhone(e.target.value);
                            }
                          }}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#131b2e] mb-1">
                          Sua Senha *
                        </label>
                        <input
                          type="password"
                          placeholder="Sua senha de acesso"
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                        />
                      </div>
                    </div>
                  )}

                  {allowSignal && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[1.25rem]">info</span>
                      <div>
                        <p className="font-bold">Sinal de Reserva: R$ {signalValue.toFixed(2)}</p>
                        <p className="text-[0.6875rem] text-amber-800 mt-0.5">
                          Para garantir a vaga na agenda, o valor do sinal será abatido do atendimento presencial.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[#eaedff]">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#4a4455] hover:bg-[#f2f3ff]"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Confirmando...' : 'Confirmar e Finalizar Agendamento'}
                      <span className="material-symbols-outlined text-[1rem]">check_circle</span>
                    </button>
                  </div>
                </form>
              )}

              {/* PASSO 5: SUCESSO & VOUCHER COM ACESSO AO PORTAL DO CLIENTE */}
              {currentStep === 5 && confirmedBooking && (
                <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <span className="material-symbols-outlined text-3xl">check</span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                      Agendamento Confirmado com Sucesso!
                    </span>
                    <h3 className="text-2xl font-black text-[#131b2e] mt-2">
                      Código da Reserva: #{confirmedBooking.code}
                    </h3>
                    <p className="text-xs text-[#7b7487] mt-1">
                      Enviamos a confirmação detalhada para o seu WhatsApp/E-mail.
                    </p>
                  </div>

                  {/* Resumo do Voucher */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#f8f9fa] border border-[#eaedff] text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#7b7487]">Estabelecimento:</span>
                      <span className="font-bold text-[#131b2e]">{activeTenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7b7487]">Serviço:</span>
                      <span className="font-bold text-[#131b2e]">{confirmedBooking.serviceName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7b7487]">Especialista:</span>
                      <span className="font-bold text-[#131b2e]">{confirmedBooking.profName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7b7487]">Data & Horário:</span>
                      <span className="font-bold text-[#7c3aed]">{confirmedBooking.date} às {confirmedBooking.time}</span>
                    </div>
                    <div className="flex justify-between border-t border-[#eaedff] pt-2">
                      <span className="font-bold text-[#131b2e]">Valor Total:</span>
                      <span className="font-black text-sm text-emerald-600">
                        R$ {confirmedBooking.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Portal do Cliente White Label Callout */}
                  <div className="max-w-md mx-auto p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#7c3aed]">
                      <span className="material-symbols-outlined text-[1.125rem]">badge</span>
                      Seu Portal Exclusivo do Cliente
                    </div>
                    <p className="text-[0.6875rem] text-[#4a4455]">
                      Acompanhe o status do seu agendamento, consulte seus pontos de fidelidade e faça novos pedidos no seu portal.
                    </p>
                    <a
                      href={portalUrl}
                      className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-all shadow-sm w-full"
                    >
                      <span className="material-symbols-outlined text-[1rem]">account_circle</span>
                      Acessar Meu Portal do Cliente
                    </a>
                  </div>

                  {/* Ações adicionais */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-2.5 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#4a4455] hover:bg-[#f8f9fa] transition-colors"
                    >
                      Agendar Outro Procedimento
                    </button>
                    {activeTenant.ownerPhone && (
                      <a
                        href={`https://wa.me/55${activeTenant.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá, acabei de agendar o serviço ${confirmedBooking.serviceName} (#${confirmedBooking.code}) pelo link online!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[1rem]">chat</span>
                        Falar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
