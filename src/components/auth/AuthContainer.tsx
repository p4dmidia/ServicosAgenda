import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ResetPasswordView } from './ResetPasswordView';
import { BrandLogo } from '../common/BrandLogo';

export const AuthContainer: React.FC = () => {
  const { user, loading, isPasswordRecovery, clearPasswordRecovery, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>(initialMode);
  const navigate = useNavigate();

  // If user is already logged in, give them a clear choice: continue to app or logout/switch account
  if (!loading && user && !isPasswordRecovery) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#180D2B] via-[#2E1065] to-[#1E1035] text-white font-['Poppins',sans-serif]">
        {/* Header */}
        <header className="w-full backdrop-blur-md bg-[#180D2B]/95 border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div
              className="cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => navigate('/')}
            >
              <BrandLogo variant="dark" size="md" showTagline={false} />
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-purple-200 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[1.125rem]">arrow_back</span>
              <span>Voltar ao Início</span>
            </button>
          </div>
        </header>

        {/* Center Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative z-10 w-full max-w-[420px] p-8 bg-white text-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] text-[#4C1D95] flex items-center justify-center mx-auto mb-5 shadow-inner">
              <span className="material-symbols-outlined text-[2rem]">account_circle</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Você já está conectado
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Conectado com <strong className="text-[#4C1D95] font-semibold">{user.email}</strong>
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/')}
                className="w-full h-11 rounded-xl bg-[#4C1D95] hover:bg-[#3B0764] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#4C1D95]/30 cursor-pointer"
              >
                <span>Continuar no Sistema</span>
                <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
              </button>

              <button
                onClick={async () => {
                  await signOut();
                }}
                className="w-full h-11 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[1.125rem]">logout</span>
                <span>Sair e entrar com outra conta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 bg-[#180D2B] text-xs text-purple-300 border-t border-purple-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BrandLogo variant="dark" size="sm" showTagline={false} />
              <span className="text-slate-400">&bull;</span>
              <span className="text-slate-400">Todos os direitos reservados &copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-[#180D2B] via-[#2E1065] to-[#1E1035] text-white font-['Poppins',sans-serif] relative overflow-x-hidden selection:bg-[#7C3AED] selection:text-white">
      
      {/* 1. Cabeçalho Fixo / Institucional */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#180D2B]/95 border-b border-white/10 shadow-[0_4px_25px_rgba(0,0,0,0.35)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo Oficial */}
          <div
            className="cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => navigate('/')}
          >
            <BrandLogo variant="dark" size="md" showTagline={false} />
          </div>

          {/* Links de Navegação */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-purple-200">
            <button onClick={() => navigate('/#demonstracao')} className="hover:text-white transition-colors cursor-pointer">
              Demonstração
            </button>
            <button onClick={() => navigate('/#sua-marca')} className="hover:text-white transition-colors cursor-pointer">
              Sua Marca
            </button>
            <button onClick={() => navigate('/#recursos')} className="hover:text-white transition-colors cursor-pointer">
              Recursos
            </button>
            <button onClick={() => navigate('/#planos')} className="hover:text-white transition-colors cursor-pointer">
              Planos
            </button>
            <button onClick={() => navigate('/#faq')} className="hover:text-white transition-colors cursor-pointer">
              Dúvidas
            </button>
          </nav>

          {/* CTAs Direita */}
          <div className="flex items-center gap-3">
            {authMode === 'register' ? (
              <button
                onClick={() => setAuthMode('login')}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-purple-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Já tenho conta (Login)
              </button>
            ) : (
              <button
                onClick={() => setAuthMode('register')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#EDE9FE] text-[#4C1D95] text-xs sm:text-sm font-bold shadow-lg shadow-black/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>Criar Conta Grátis</span>
                <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Conteúdo Central de Autenticação */}
      <main className="relative flex-1 flex items-center justify-center p-4 py-12 sm:py-16">
        
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#7C3AED]/20 blur-[150px] pointer-events-none rounded-full" />

        <div className="relative z-10 w-full flex flex-col items-center">
          {isPasswordRecovery ? (
            <ResetPasswordView onSuccessRedirect={clearPasswordRecovery} />
          ) : authMode === 'register' ? (
            <RegisterView onBackToLogin={() => setAuthMode('login')} />
          ) : authMode === 'forgot-password' ? (
            <ForgotPasswordView onBackToLogin={() => setAuthMode('login')} />
          ) : (
            <LoginView
              onForgotPassword={() => setAuthMode('forgot-password')}
              onRegister={() => setAuthMode('register')}
            />
          )}
        </div>
      </main>

      {/* 3. Rodapé Institucional */}
      <footer className="py-10 bg-[#180D2B] text-xs text-purple-300 border-t border-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <BrandLogo variant="dark" size="sm" showTagline={false} />
            <span className="text-slate-400">&bull;</span>
            <span className="text-slate-400">Todos os direitos reservados &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center gap-6 text-purple-200 text-xs font-medium">
            <button onClick={() => navigate('/#recursos')} className="hover:text-white transition-colors cursor-pointer">
              Recursos
            </button>
            <button onClick={() => navigate('/#sua-marca')} className="hover:text-white transition-colors cursor-pointer">
              Sua Marca
            </button>
            <button onClick={() => navigate('/#fluxo')} className="hover:text-white transition-colors cursor-pointer">
              Como Funciona
            </button>
            <button onClick={() => navigate('/#planos')} className="hover:text-white transition-colors cursor-pointer">
              Planos
            </button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors cursor-pointer">
              Página Inicial
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
