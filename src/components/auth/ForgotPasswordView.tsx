import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin }) => {
  const { sendPasswordResetEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await sendPasswordResetEmail(email);
      setSubmittedMessage(
        result.message ||
          'Se este email estiver cadastrado em nossa plataforma, você receberá um link com as instruções para redefinir sua senha em instantes.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] sm:w-[440px] p-6 sm:p-8 bg-white dark:bg-[#161c2d] backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(99,14,212,0.15)] border border-[#eaedff] dark:border-white/10 transition-all">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/25 mb-4">
          <span className="material-symbols-outlined text-[1.875rem]">lock_reset</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#131b2e] dark:text-white">
          Recuperação de senha
        </h2>
        <p className="text-xs sm:text-sm text-[#7b7487] dark:text-slate-400 mt-1.5">
          Digite seu email para receber um link seguro de redefinição
        </p>
      </div>

      {submittedMessage ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[1.25rem] shrink-0 mt-0.5">
              mark_email_read
            </span>
            <div>
              <p className="font-semibold mb-1">Email de recuperação enviado</p>
              <p>{submittedMessage}</p>
              <p className="mt-2 text-[0.6875rem] text-emerald-700/80 dark:text-emerald-300/80">
                Verifique também sua pasta de spam ou lixo eletrônico.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#630ed4] text-white font-semibold text-sm shadow-md shadow-purple-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[1.125rem]">arrow_back</span>
            <span>Voltar para o Login</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-[#4a4455] dark:text-slate-300 mb-1.5"
            >
              Email da sua conta
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] text-[1.25rem] pointer-events-none">
                mail
              </span>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border border-[#dce1f5] dark:border-slate-700 rounded-xl text-sm text-[#131b2e] dark:text-white placeholder:text-[#9e97ab] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
              />
            </div>
          </div>

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
                <span>Enviando link...</span>
              </>
            ) : (
              <>
                <span>Enviar link de recuperação</span>
                <span className="material-symbols-outlined text-[1.125rem]">send</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-2.5 px-4 text-xs font-semibold text-[#4a4455] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[1rem]">arrow_back</span>
            <span>Cancelar e voltar ao login</span>
          </button>
        </form>
      )}
    </div>
  );
};
