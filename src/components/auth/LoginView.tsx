import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

interface LoginViewProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onForgotPassword, onRegister }) => {
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu email e sua senha para acessar.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signInWithEmail(email, password);
      if (!result.success) {
        setErrorMessage(result.error || 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage('Email ou senha incorretos. Verifique suas credenciais e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] sm:w-[440px] p-6 sm:p-8 bg-white dark:bg-[#161c2d] backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(99,14,212,0.15)] border border-[#eaedff] dark:border-white/10 transition-all">
      {/* Header / Brand */}
      <div className="text-center mb-8 flex flex-col items-center">
        <BrandLogo size="lg" showTagline={false} className="mb-3" />
        <h2 className="text-xl font-bold tracking-tight text-[#131b2e] dark:text-white mt-1">
          Acesse sua conta
        </h2>
        <p className="text-xs text-[#7b7487] dark:text-slate-400 mt-1">
          Sua agenda. Seu negócio. Tudo em um só lugar.
        </p>
      </div>

      {/* Error Alert (Generic message to prevent account enumeration) */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[1.25rem] shrink-0 mt-0.5">
            error
          </span>
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-semibold text-[#4a4455] dark:text-slate-300 mb-1.5"
          >
            Email cadastrado
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] text-[1.25rem] pointer-events-none">
              mail
            </span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@empresa.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border border-[#dce1f5] dark:border-slate-700 rounded-xl text-sm text-[#131b2e] dark:text-white placeholder:text-[#9e97ab] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-[#4a4455] dark:text-slate-300"
            >
              Senha
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-semibold text-[#7c3aed] hover:text-[#630ed4] dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] text-[1.25rem] pointer-events-none">
              lock
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border border-[#dce1f5] dark:border-slate-700 rounded-xl text-sm text-[#131b2e] dark:text-white placeholder:text-[#9e97ab] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b7487] hover:text-[#131b2e] dark:hover:text-white p-1 transition-colors"
              title={showPassword ? 'Ocultar senha' : 'Ver senha'}
            >
              <span className="material-symbols-outlined text-[1.125rem]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#630ed4] hover:from-[#6d28d9] hover:to-[#581c87] text-white font-semibold text-sm shadow-md shadow-purple-500/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <span>Acessar Plataforma</span>
              <span className="material-symbols-outlined text-[1.125rem]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Register CTA */}
      <div className="mt-5 text-center text-xs text-[#7b7487] dark:text-slate-400">
        <span>Não possui uma conta? </span>
        <button
          type="button"
          onClick={onRegister}
          className="font-semibold text-[#7c3aed] hover:text-[#630ed4] dark:text-purple-400 dark:hover:text-purple-300 transition-colors cursor-pointer"
        >
          Criar conta grátis
        </button>
      </div>

      {/* Security footer */}
      <div className="mt-8 pt-5 border-t border-[#eaedff] dark:border-slate-800 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-[#7b7487] dark:text-slate-400">
          <span className="material-symbols-outlined text-[0.875rem] text-emerald-600 dark:text-emerald-400">
            lock
          </span>
          <span>Autenticação segura via Supabase Auth com criptografia ponta a ponta</span>
        </div>
      </div>
    </div>
  );
};
