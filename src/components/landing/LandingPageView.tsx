import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export const LandingPageView: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'mensal' | 'anual'>('mensal');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [previewTheme, setPreviewTheme] = useState<'clinica' | 'barbearia'>('clinica');

  // Simulator State
  const [appointmentsPerDay, setAppointmentsPerDay] = useState<number>(25);
  const [averageTicket, setAverageTicket] = useState<number>(80);
  const [noShowRate, setNoShowRate] = useState<number>(10);

  // Calculations for Simulator
  const monthlyRevenue = appointmentsPerDay * averageTicket * 26;
  const lostRevenueMonthly = Math.round(monthlyRevenue * (noShowRate / 100));
  const lostRevenueAnnual = lostRevenueMonthly * 12;

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze Starter',
      badge: 'Ideal para Autônomos',
      priceMonthly: 97,
      priceAnnual: 79,
      description: 'Para profissionais autônomos ou pequenos estúdios que querem dar o primeiro passo na organização.',
      features: [
        'Até 2 Profissionais ativos',
        'Agendamento Online 24/7',
        'Página com logo e cores do seu negócio',
        'Lembretes automáticos via WhatsApp',
        'Gestão de Clientes e Histórico',
        'Relatórios de Atendimentos',
      ],
      cta: 'Começar com Bronze',
      popular: false,
    },
    {
      id: 'prata',
      name: 'Prata Pro',
      badge: 'Mais Escolhido',
      priceMonthly: 197,
      priceAnnual: 157,
      description: 'Perfeito para clínicas, barbearias e salões em expansão que querem fidelizar clientes.',
      features: [
        'Até 6 Profissionais ativos',
        'Tudo do Plano Bronze',
        'Programa de Fidelidade & Cashback',
        'Controle Financeiro & Comissões',
        'Portal Exclusivo do Cliente',
        'Disparo de Campanhas no WhatsApp',
        'Controle de Estoque e Insumos',
      ],
      cta: 'Experimentar 14 Dias Grátis',
      popular: true,
    },
    {
      id: 'ouro',
      name: 'Ouro Enterprise',
      badge: 'Recursos Avançados',
      priceMonthly: 297,
      priceAnnual: 237,
      description: 'Para estabelecimentos consolidados que buscam receita recorrente e automação com IA.',
      features: [
        'Profissionais Ilimitados',
        'Tudo do Plano Prata',
        'Agente com Inteligência Artificial no WhatsApp',
        'Clube de Assinaturas Recorrentes',
        'Cobrança de Sinal PIX Automático',
        'Personalização Avançada',
        'Suporte Prioritário VIP',
      ],
      cta: 'Começar com Ouro',
      popular: false,
    },
  ];

  const faqs = [
    {
      question: 'Posso colocar minha própria marca na plataforma?',
      answer: 'Sim. Você pode personalizar elementos da experiência com a identidade do seu estabelecimento, incluindo logo, cores e informações comerciais disponíveis na configuração.',
    },
    {
      question: 'Meus clientes precisam instalar algum aplicativo?',
      answer: 'Não. O cliente pode acessar seu link diretamente pelo navegador do celular, tablet ou computador, sem necessidade de baixar nada.',
    },
    {
      question: 'Como funcionam os 14 dias grátis?',
      answer: 'Você cria sua conta e pode conhecer a plataforma durante o período de teste. Depois, escolhe o plano mais adequado para continuar utilizando o sistema.',
    },
    {
      question: 'Como os lembretes ajudam na agenda?',
      answer: 'O sistema pode enviar mensagens antes do horário marcado para lembrar o cliente e solicitar confirmação. Isso reduz o trabalho manual da equipe e facilita a identificação antecipada de possíveis cancelamentos.',
    },
    {
      question: 'Posso acessar pelo celular e computador?',
      answer: 'Sim. A plataforma funciona online e pode ser acessada por dispositivos compatíveis através do navegador.',
    },
    {
      question: 'Como funciona o Agente de IA?',
      answer: 'O agente pode atender clientes pelo WhatsApp, responder perguntas frequentes, apresentar informações sobre serviços, consultar disponibilidade e auxiliar no agendamento. Quando necessário, a conversa pode seguir para um atendente da sua equipe.',
    },
    {
      question: 'Posso usar o link no Instagram e WhatsApp?',
      answer: 'Sim. Você pode divulgar seu link nos seus canais digitais (bio do Instagram, mensagens automáticas do WhatsApp, Google Meu Negócio) para facilitar o acesso dos clientes ao agendamento.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-['Poppins',sans-serif] antialiased selection:bg-[#7C3AED] selection:text-white overflow-x-hidden">
      
      {/* 1. Header 100% Fixo (Fixed no topo) */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-[#180D2B]/95 border-b border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo Oficial (Versão Dark/Branca) */}
          <div
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <BrandLogo variant="dark" size="md" showTagline={false} />
          </div>

          {/* Links de Navegação */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-purple-200">
            <a href="#demonstracao" className="hover:text-white transition-colors">Demonstração</a>
            <a href="#sua-marca" className="hover:text-white transition-colors">Sua Marca</a>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#fluxo" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#simulador" className="hover:text-white transition-colors">Simulador</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
          </nav>

          {/* CTAs Direita */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-purple-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Fazer Login
            </button>
            <button
              onClick={() => navigate('/login?mode=register')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EDE9FE] text-[#4C1D95] text-xs sm:text-sm font-bold shadow-lg shadow-black/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Testar 14 Dias Grátis</span>
              <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (AJUSTADO PARA ENCAIXAR PERFEITAMENTE NA TELA) */}
      <section className="relative pt-24 pb-14 sm:pt-28 sm:pb-16 bg-gradient-to-b from-[#180D2B] via-[#2E1065] to-[#1E1035] text-white border-b border-purple-900/60 overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#7C3AED]/20 blur-[130px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#A78BFA] border border-white/15 text-xs font-semibold shadow-inner">
            <span className="text-[#A78BFA] font-bold">✦</span>
            <span>Plataforma de agendamento e gestão para clínicas, barbearias e salões</span>
          </div>

          {/* Headline Calibrada: Aumentada para preenchimento nobre */}
          <div className="space-y-1.5 sm:space-y-2">
            <h2 className="text-3xl sm:text-5xl lg:text-[3.35rem] xl:text-[3.85rem] font-bold text-white tracking-tight leading-[1.14]">
              Mais agendamentos. Menos trabalho.
            </h2>
            <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] xl:text-[3.85rem] font-extrabold bg-gradient-to-r from-[#C4B5FD] via-[#EDE9FE] to-white bg-clip-text text-transparent tracking-tight leading-[1.14]">
              Uma plataforma com a sua marca.
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-[1.0625rem] text-purple-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Tenha agendamento online, lembretes automáticos pelo WhatsApp, portal do cliente, gestão financeira, equipe, estoque e automações em <strong className="text-white font-semibold">um único sistema personalizado para o seu negócio.</strong>
          </p>

          {/* Tagline Marca */}
          <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-[#A78BFA] uppercase">
            Organiza • Conecta • Impulsiona seu negócio
          </div>

          {/* CTAs Invertidos */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              onClick={() => navigate('/login?mode=register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-[#EDE9FE] text-[#4C1D95] font-bold text-xs sm:text-sm shadow-xl shadow-black/40 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚀 Testar Grátis por 14 Dias</span>
            </button>

            <a
              href="#demonstracao"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 backdrop-blur-sm"
            >
              <span className="material-symbols-outlined text-[1.125rem] text-[#A78BFA]">play_circle</span>
              <span>Conhecer a Plataforma</span>
            </a>
          </div>

          {/* Micro Trust */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 pt-1 text-[11px] sm:text-xs font-medium text-purple-200">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-[1rem]">check_circle</span>
              Sem fidelidade
            </span>
            <span className="text-purple-400 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-[1rem]">check_circle</span>
              Configuração simples
            </span>
            <span className="text-purple-400 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-[1rem]">check_circle</span>
              Personalizado com sua marca
            </span>
          </div>

          {/* Brand Highlights Bar */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[#A78BFA] text-xl">event_available</span>
              <div>
                <p className="text-xs font-bold text-white">Organização</p>
                <p className="text-[10px] text-purple-200">Em cada detalhe</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[#A78BFA] text-xl">schedule</span>
              <div>
                <p className="text-xs font-bold text-white">Tempo</p>
                <p className="text-[10px] text-purple-200">A seu favor</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[#A78BFA] text-xl">trending_up</span>
              <div>
                <p className="text-xs font-bold text-white">Crescimento</p>
                <p className="text-[10px] text-purple-200">Constante</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5 backdrop-blur-xs">
              <span className="material-symbols-outlined text-[#A78BFA] text-xl">group</span>
              <div>
                <p className="text-xs font-bold text-white">Relacionamento</p>
                <p className="text-[10px] text-purple-200">Que fideliza</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEMONSTRAÇÃO (BLOCO CLARO / INTERCALADO) */}
      <section id="demonstracao" className="py-20 lg:py-24 bg-gradient-to-b from-white via-[#EDE9FE]/20 to-white text-slate-800 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] border border-[#C4B5FD] text-xs font-bold uppercase tracking-wider">
              VEJA A PLATAFORMA EM AÇÃO
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              Veja como funciona para o cliente.<br />
              <span className="text-[#4C1D95]">E como você controla tudo por trás.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              Do agendamento online à confirmação pelo WhatsApp, acompanhe como o Serviços Agenda conecta cliente, equipe e gestão em uma única experiência.
            </p>
          </div>

          {/* Toggle Demonstrador */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-[#EDE9FE] border border-[#C4B5FD]">
              <button
                type="button"
                onClick={() => setPreviewTheme('clinica')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  previewTheme === 'clinica'
                    ? 'bg-[#4C1D95] text-white shadow-md'
                    : 'text-[#4C1D95] hover:text-[#7C3AED]'
                }`}
              >
                <span>🌸 Clínica Bella Vita — Estética</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTheme('barbearia')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  previewTheme === 'barbearia'
                    ? 'bg-[#4C1D95] text-white shadow-md'
                    : 'text-[#4C1D95] hover:text-[#7C3AED]'
                }`}
              >
                <span>✂️ Barbearia Dom Camilo</span>
              </button>
            </div>
          </div>

          {/* Mockup da Plataforma (Clean White com detalhes Roxo e Emerald) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 border-2 border-[#EDE9FE]">
            
            {/* Header da Empresa Mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl text-white font-bold flex items-center justify-center text-base shadow-sm"
                  style={{ backgroundColor: previewTheme === 'clinica' ? '#7C3AED' : '#B45309' }}
                >
                  {previewTheme === 'clinica' ? 'BV' : 'DC'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {previewTheme === 'clinica' ? 'Clínica Bella Vita' : 'Barbearia Dom Camilo'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {previewTheme === 'clinica' ? 'Estética Avançada' : 'Barbearia & Cuidados Masculinos'}
                  </p>
                  <p className="text-xs font-mono font-bold mt-0.5" style={{ color: previewTheme === 'clinica' ? '#7C3AED' : '#B45309' }}>
                    seusistema.com/agendar/{previewTheme === 'clinica' ? 'bella-vita' : 'dom-camilo'}
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-center flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Portal personalizado com a marca do estabelecimento
              </span>
            </div>

            {/* Grid 2 Colunas: Agenda + Automação WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              
              {/* Coluna 1: Hoje na Agenda */}
              <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#4C1D95] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[1.125rem] text-[#7C3AED]">calendar_today</span>
                    Hoje na Agenda
                  </h4>
                  <span className="text-xs font-bold text-[#7C3AED]">2 atendimentos</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-white rounded-xl border border-[#EDE9FE] flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="font-bold text-xs text-slate-900">Mariana Silveira</p>
                      <p className="text-[11px] text-slate-500">
                        {previewTheme === 'clinica' ? 'Harmonização Facial' : 'Corte Tradicional'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                      15:00
                    </span>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-[#EDE9FE] flex items-center justify-between shadow-2xs">
                    <div>
                      <p className="font-bold text-xs text-slate-900">Gabriel Santos</p>
                      <p className="text-[11px] text-slate-500">
                        {previewTheme === 'clinica' ? 'Bioestimulador de Colágeno' : 'Barboterapia'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold">
                      16:30
                    </span>
                  </div>
                </div>
              </div>

              {/* Coluna 2: WhatsApp trabalhando */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[1.125rem] text-emerald-600">chat</span>
                    WhatsApp trabalhando automaticamente
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700">✓ Lembrete enviado às 13:00</span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200 text-xs text-slate-700 space-y-2 shadow-2xs">
                  <p className="italic text-slate-600">
                    &ldquo;Olá, Mariana! Seu horário na {previewTheme === 'clinica' ? 'Clínica Bella Vita' : 'Barbearia Dom Camilo'} está marcado para hoje às 15h. Responda 1 para confirmar sua presença.&rdquo;
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold pt-1 border-t border-slate-100">
                    <span className="material-symbols-outlined text-[0.875rem]">done_all</span>
                    <span>Cliente respondeu: &quot;1 - Confirmado&quot;</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Callout */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <h5 className="font-bold text-sm text-[#4C1D95]">Enquanto sua equipe atende, o sistema trabalha.</h5>
              <p className="text-xs text-slate-600 mt-0.5">
                Organize agendamentos, envie lembretes, acompanhe clientes e mantenha sua operação centralizada — sem depender de várias ferramentas diferentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUA MARCA (PERSONALIZAÇÃO) */}
      <section id="sua-marca" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold uppercase tracking-wider">
              PERSONALIZAÇÃO
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Seu sistema.<br />
              <span className="text-[#4C1D95]">Sua marca em primeiro lugar.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal">
              O cliente não precisa sentir que está entrando em uma plataforma genérica.
            </p>
            <p className="text-sm sm:text-base text-slate-600">
              Personalize a experiência com <strong className="text-[#4C1D95] font-semibold">logo, cores, informações e identidade do seu estabelecimento</strong>, criando um ambiente profissional e familiar para seus clientes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Em plataformas genéricas */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-base">
                  ✕
                </div>
                <h3 className="text-lg font-bold text-slate-900">Em plataformas genéricas</h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span>A identidade da plataforma aparece mais que a sua.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span>O cliente precisa se adaptar à experiência de outra marca.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span>A personalização costuma ser limitada.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span>Você depende das regras e do formato daquele marketplace.</span>
                </li>
              </ul>
            </div>

            {/* Com o Serviços Agenda */}
            <div className="p-7 rounded-3xl bg-[#EDE9FE]/60 border-2 border-[#A78BFA] space-y-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4C1D95] text-white flex items-center justify-center font-bold text-base">
                  ✓
                </div>
                <h3 className="text-lg font-bold text-[#4C1D95]">Com o Serviços Agenda</h3>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C3AED] font-bold text-base">✓</span>
                  <span><strong>Sua identidade:</strong> Personalize logo, cores e informações do estabelecimento.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C3AED] font-bold text-base">✓</span>
                  <span><strong>Seu espaço exclusivo:</strong> O cliente encontra seus serviços, profissionais e horários.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C3AED] font-bold text-base">✓</span>
                  <span><strong>Acesso simples:</strong> Envie seu link pelo WhatsApp, Instagram, Google ou onde quiser.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C3AED] font-bold text-base">✓</span>
                  <span><strong>Sem precisar instalar aplicativo:</strong> O cliente agenda diretamente pelo navegador.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#7C3AED] font-bold text-base">✓</span>
                  <span><strong>Sem comissão por agendamento:</strong> Você utiliza a plataforma de acordo com o plano contratado.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. RECURSOS (TUDO CONECTADO) - BLOCO ROXO ELEGANTE */}
      <section id="recursos" className="py-20 lg:py-24 bg-gradient-to-br from-[#180D2B] via-[#2E1065] to-[#4C1D95] text-white relative overflow-hidden border-y border-purple-900/60">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-[#7C3AED]/20 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#A78BFA] border border-white/15 text-xs font-bold uppercase tracking-wider shadow-inner">
              TUDO CONECTADO
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              Menos ferramentas.<br />
              <span className="bg-gradient-to-r from-[#C4B5FD] via-[#EDE9FE] to-white bg-clip-text text-transparent">Mais controle sobre o seu negócio.</span>
            </h2>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
              Agenda em um lugar. WhatsApp em outro. Financeiro em planilha. Clientes espalhados em contatos.<br />
              O Serviços Agenda foi criado para colocar <strong className="text-white font-semibold">sua operação em um único sistema.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Agente IA */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                🤖
              </div>
              <h4 className="text-lg font-bold text-white">Agente de IA no WhatsApp</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                Seu atendimento não precisa parar quando sua equipe está ocupada.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                A inteligência artificial pode responder dúvidas frequentes, informar serviços, consultar horários disponíveis e auxiliar clientes no agendamento.
              </p>
              <p className="text-[11px] text-purple-200/80 font-medium pt-2 border-t border-white/10">
                Mais agilidade para o cliente. Menos mensagens repetitivas para sua equipe.
              </p>
            </div>

            {/* Feature 2: Lembretes */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                🔔
              </div>
              <h4 className="text-lg font-bold text-white">Lembretes automáticos</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                O sistema lembra o cliente por você.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Configure lembretes antes dos atendimentos e facilite a confirmação de presença pelo WhatsApp.
              </p>
              <p className="text-[11px] text-purple-200/80 font-medium pt-2 border-t border-white/10">
                Menos dependência de confirmações manuais e mais organização da agenda.
              </p>
            </div>

            {/* Feature 3: Fidelidade */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                💎
              </div>
              <h4 className="text-lg font-bold text-white">Fidelidade & Clube VIP</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                Dê motivos para o cliente voltar.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Crie programas de fidelidade, benefícios, cashback e planos recorrentes para fortalecer o relacionamento com seus melhores clientes.
              </p>
            </div>

            {/* Feature 4: Sinal PIX */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                💳
              </div>
              <h4 className="text-lg font-bold text-white">Sinal via PIX & Financeiro</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                Mais segurança para seus horários.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Configure cobrança de sinal para serviços selecionados e acompanhe pagamentos, entradas, saídas e comissões dentro da plataforma.
              </p>
            </div>

            {/* Feature 5: Portal */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                📱
              </div>
              <h4 className="text-lg font-bold text-white">Portal do Cliente</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                Um espaço exclusivo para seus clientes.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Ofereça uma experiência personalizada onde o cliente pode acompanhar seus agendamentos, acessar benefícios e voltar a agendar com facilidade.
              </p>
            </div>

            {/* Feature 6: Estoque */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-[#A78BFA]/60 shadow-xl backdrop-blur-sm transition-all duration-300 space-y-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center text-xl shadow-inner border border-white/15 group-hover:scale-105 transition-transform">
                📦
              </div>
              <h4 className="text-lg font-bold text-white">Estoque e Insumos</h4>
              <p className="text-xs text-[#A78BFA] font-semibold">
                Saiba o que você tem antes que acabe.
              </p>
              <p className="text-xs text-purple-100/90 leading-relaxed">
                Controle produtos e insumos utilizados no dia a dia e acompanhe níveis de estoque para facilitar suas reposições.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. O FLUXO (DO "TEM HORÁRIO HOJE?" AO AGENDAMENTO CONFIRMADO) */}
      <section id="fluxo" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold uppercase tracking-wider">
              O FLUXO PRÁTICO
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Do “tem horário hoje?”<br />
              <span className="text-[#4C1D95]">ao agendamento confirmado.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
            {/* Passo 1 */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] text-center space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-[#4C1D95] text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-900">O cliente entra em contato</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pelo WhatsApp ou acessa seu link de agendamento.
              </p>
            </div>

            {/* Passo 2 */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] text-center space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-[#4C1D95] text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-900">Escolhe o que precisa</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Serviço, profissional, dia e horário disponível.
              </p>
            </div>

            {/* Passo 3 */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] text-center space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-[#4C1D95] text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-900">O agendamento é registrado</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A agenda da equipe é atualizada automaticamente.
              </p>
            </div>

            {/* Passo 4 */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] text-center space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-[#4C1D95] text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                4
              </div>
              <h4 className="font-bold text-xs text-slate-900">O WhatsApp entra em ação</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                O cliente recebe confirmações e lembretes configurados pelo estabelecimento.
              </p>
            </div>

            {/* Passo 5 */}
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 border border-[#EDE9FE] text-center space-y-2 flex flex-col justify-between">
              <div className="w-9 h-9 rounded-full bg-[#4C1D95] text-white font-bold text-xs flex items-center justify-center mx-auto shadow-xs">
                5
              </div>
              <h4 className="font-bold text-xs text-slate-900">Sua equipe acompanha tudo</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agenda, clientes, financeiro e operação ficam centralizados.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold text-[#4C1D95]">
              Menos tarefas manuais. Uma experiência muito mais organizada.
            </p>
          </div>
        </div>
      </section>

      {/* 7. SIMULADOR DE IMPACTO FINANCEIRO */}
      <section id="simulador" className="py-20 lg:py-24 bg-gradient-to-b from-[#EDE9FE]/40 via-[#EDE9FE]/60 to-[#EDE9FE]/30 border-y border-[#EDE9FE]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold uppercase tracking-wider">
              SIMULADOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Quanto os horários vazios podem custar ao seu negócio?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Informe alguns dados da sua operação e veja uma <strong className="text-[#4C1D95]">estimativa</strong> do impacto financeiro causado por faltas e horários não aproveitados.
            </p>
          </div>

          <div className="p-7 sm:p-9 rounded-3xl bg-white border border-[#EDE9FE] shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Inputs Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-slate-700">
                  <span>Quantos atendimentos você realiza por dia?</span>
                  <span className="text-[#4C1D95] text-sm font-extrabold">{appointmentsPerDay}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={appointmentsPerDay}
                  onChange={(e) => setAppointmentsPerDay(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE9FE] rounded-lg appearance-none cursor-pointer accent-[#4C1D95]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-slate-700">
                  <span>Qual seu ticket médio?</span>
                  <span className="text-[#4C1D95] text-sm font-extrabold">R$ {averageTicket}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={averageTicket}
                  onChange={(e) => setAverageTicket(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE9FE] rounded-lg appearance-none cursor-pointer accent-[#4C1D95]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2 text-slate-700">
                  <span>Qual a sua média aproximada de faltas?</span>
                  <span className="text-[#4C1D95] text-sm font-extrabold">{noShowRate}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={noShowRate}
                  onChange={(e) => setNoShowRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#EDE9FE] rounded-lg appearance-none cursor-pointer accent-[#4C1D95]"
                />
              </div>
            </div>

            {/* Painel do Resultado */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1E1035] via-[#2E1065] to-[#4C1D95] text-white space-y-4 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">
                Sua simulação
              </span>

              <div className="space-y-3 text-left pt-1">
                <div className="p-2.5 bg-white/10 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-purple-200">Faturamento potencial mensal:</span>
                  <strong className="text-white text-sm">R$ {monthlyRevenue.toLocaleString('pt-BR')},00</strong>
                </div>

                <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-rose-200">Valor associado aos horários perdidos:</span>
                  <strong className="text-rose-300 text-sm">R$ {lostRevenueMonthly.toLocaleString('pt-BR')},00 /mês</strong>
                </div>

                <div className="p-2.5 bg-white/10 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-purple-200">Impacto anual estimado:</span>
                  <strong className="text-white text-sm">R$ {lostRevenueAnnual.toLocaleString('pt-BR')},00</strong>
                </div>
              </div>

              <div className="pt-2">
                <h5 className="font-bold text-xs text-purple-100">Cada horário vazio tem um custo.</h5>
                <p className="text-[11px] text-purple-200 mt-0.5 leading-relaxed">
                  Automatizar lembretes e confirmações pode ajudar sua equipe a administrar melhor a agenda e agir antecipadamente quando houver cancelamentos.
                </p>
              </div>

              <button
                onClick={() => navigate('/login?mode=register')}
                className="w-full py-3 rounded-xl bg-white text-[#4C1D95] font-bold text-xs shadow-md hover:bg-[#EDE9FE] transition-all cursor-pointer"
              >
                Simular Minha Operação
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center italic">
            *Valores apresentados são estimativas calculadas a partir das informações fornecidas e não representam garantia de resultado.
          </p>
        </div>
      </section>

      {/* 8. POR QUE SERVIÇOS AGENDA? (BLOCO ROXO DE VALOR) */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#1E1035] via-[#2E1065] to-[#4C1D95] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#A78BFA] text-xs font-bold uppercase tracking-wider">
              POR QUE SERVIÇOS AGENDA?
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              Feito para facilitar a rotina<br />
              <span className="text-[#A78BFA]">de quem vive de agenda.</span>
            </h2>
            <p className="text-sm sm:text-base text-purple-200 font-normal">
              Você não precisa de mais um sistema complicado para administrar.<br />
              Precisa de uma plataforma que ajude sua equipe a <strong className="text-white">organizar horários, atender clientes, automatizar tarefas e acompanhar o negócio.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#A78BFA]/50 transition-all space-y-2.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-3xl">event_available</span>
              <h4 className="font-bold text-base text-white">Agenda organizada</h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                Visualize horários, profissionais e atendimentos em um só lugar.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#A78BFA]/50 transition-all space-y-2.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-3xl">smart_toy</span>
              <h4 className="font-bold text-base text-white">Atendimento automatizado</h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                Deixe tarefas repetitivas com as automações e concentre sua equipe no atendimento.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#A78BFA]/50 transition-all space-y-2.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-3xl">badge</span>
              <h4 className="font-bold text-base text-white">Experiência com sua marca</h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                Entregue ao cliente um ambiente personalizado e profissional.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#A78BFA]/50 transition-all space-y-2.5">
              <span className="material-symbols-outlined text-[#A78BFA] text-3xl">hub</span>
              <h4 className="font-bold text-base text-white">Gestão centralizada</h4>
              <p className="text-xs text-purple-200 leading-relaxed">
                Acompanhe clientes, financeiro, comissões, estoque e operação.
              </p>
            </div>
          </div>

          {/* Manifesto Bar */}
          <div className="text-center pt-4">
            <p className="text-xs uppercase tracking-widest text-[#A78BFA] font-bold">
              Mais que uma agenda. Um parceiro para o seu crescimento.
            </p>
          </div>
        </div>
      </section>

      {/* 9. PLANOS E PREÇOS */}
      <section id="planos" className="py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold uppercase tracking-wider">
              PLANOS E PREÇOS
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">
              Escolha o plano ideal para o momento do seu negócio.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Experimente o Serviços Agenda por <strong className="text-[#4C1D95]">14 dias grátis</strong> e conheça a plataforma antes de contratar.
            </p>

            {/* Toggle Mensal / Anual */}
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#EDE9FE] border border-[#C4B5FD] mt-3">
              <button
                type="button"
                onClick={() => setBillingCycle('mensal')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  billingCycle === 'mensal' ? 'bg-[#4C1D95] text-white shadow-xs' : 'text-slate-600 hover:text-[#4C1D95]'
                }`}
              >
                Cobrança Mensal
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('anual')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'anual' ? 'bg-[#4C1D95] text-white shadow-xs' : 'text-slate-600 hover:text-[#4C1D95]'
                }`}
              >
                <span>Anual</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold uppercase">
                  Economize 20%
                </span>
              </button>
            </div>
          </div>

          {/* Cards de Planos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = billingCycle === 'mensal' ? plan.priceMonthly : plan.priceAnnual;
              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
                    plan.popular
                      ? 'bg-gradient-to-br from-[#1E1035] via-[#2E1065] to-[#4C1D95] text-white border-2 border-[#7C3AED] shadow-2xl lg:-translate-y-2'
                      : 'bg-white text-slate-800 border border-[#EDE9FE] shadow-xs hover:border-[#A78BFA]'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-xs mt-1 min-h-[32px] ${plan.popular ? 'text-purple-200' : 'text-slate-500'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-xs ${plan.popular ? 'text-purple-200' : 'text-slate-500'}`}>R$</span>
                        <span className={`text-4xl font-extrabold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                          {price}
                        </span>
                        <span className={`text-xs ${plan.popular ? 'text-purple-200' : 'text-slate-500'}`}>/mês</span>
                      </div>
                      {billingCycle === 'anual' && (
                        <p className={`text-[11px] font-semibold mt-0.5 ${plan.popular ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          Cobrado anualmente (2 meses grátis)
                        </p>
                      )}
                    </div>

                    <div className={`pt-4 border-t space-y-2.5 ${plan.popular ? 'border-white/15' : 'border-slate-100'}`}>
                      <p className={`text-xs font-bold uppercase tracking-wider ${plan.popular ? 'text-purple-200' : 'text-slate-500'}`}>
                        Incluso no plano:
                      </p>
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span
                            className={`material-symbols-outlined text-[1.125rem] shrink-0 ${
                              plan.popular ? 'text-emerald-300' : 'text-[#7C3AED]'
                            }`}
                          >
                            check_circle
                          </span>
                          <span className={plan.popular ? 'text-purple-100' : 'text-slate-700'}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => navigate('/login?mode=register')}
                      className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer ${
                        plan.popular
                          ? 'bg-white text-[#4C1D95] hover:bg-[#EDE9FE]'
                          : 'bg-[#4C1D95] hover:bg-[#3B0764] text-white'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section id="faq" className="py-20 lg:py-24 bg-[#EDE9FE]/30 border-t border-[#EDE9FE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#EDE9FE] text-[#4C1D95] text-xs font-bold uppercase tracking-wider">
              DÚVIDAS FREQUENTES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white border border-[#EDE9FE] overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 cursor-pointer hover:bg-[#EDE9FE]/30"
                  >
                    <span>{faq.question}</span>
                    <span
                      className={`material-symbols-outlined text-[1.25rem] text-[#7C3AED] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#EDE9FE] pt-3 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. CTA FINAL */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-[#1E1035] via-[#2E1065] to-[#4C1D95] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#A78BFA] text-xs font-bold uppercase tracking-wider">
            COMECE AGORA
          </span>

          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Menos tempo administrando agenda.<br />
            <span className="text-[#A78BFA]">Mais tempo cuidando do seu negócio.</span>
          </h2>

          <p className="text-sm sm:text-base text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Centralize seus agendamentos, automatize tarefas repetitivas e ofereça aos seus clientes uma experiência profissional com <strong className="text-white">a identidade da sua empresa.</strong>
          </p>

          <p className="text-xs sm:text-sm text-purple-200">
            Crie sua conta, configure seu estabelecimento e conheça o Serviços Agenda gratuitamente.
          </p>

          <div className="pt-3">
            <button
              onClick={() => navigate('/login?mode=register')}
              className="px-9 py-4 rounded-2xl bg-white text-[#4C1D95] font-bold text-sm sm:text-base hover:bg-[#EDE9FE] shadow-2xl transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <span>🚀 Criar Minha Conta Grátis</span>
              <span className="material-symbols-outlined text-[1.25rem]">arrow_forward</span>
            </button>
          </div>

          <p className="text-xs text-purple-300 font-medium">
            14 dias para testar &bull; Sem fidelidade &bull; Sem cartão de crédito
          </p>

          <div className="pt-6 border-t border-white/15">
            <p className="text-sm sm:text-base text-purple-200 font-semibold italic">
              &ldquo;Seu negócio já tem uma marca. Agora ele pode ter uma plataforma à altura dela.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* 12. RODAPÉ */}
      <footer className="py-12 bg-[#180D2B] text-xs text-purple-300 border-t border-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo variant="dark" size="sm" showTagline={false} />
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-400">Todos os direitos reservados &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-purple-200 text-xs font-medium">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#sua-marca" className="hover:text-white transition-colors">Sua Marca</a>
            <a href="#fluxo" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos</a>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors cursor-pointer">
              Acessar Painel
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
