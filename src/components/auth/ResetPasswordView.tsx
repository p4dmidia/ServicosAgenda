import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ResetPasswordViewProps {
  onSuccessRedirect?: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onSuccessRedirect }) => {
  const { updatePassword, clearPasswordRecovery } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        setSuccessMessage(result.message || 'Sua senha foi redefinida com sucesso!');
        setTimeout(() => {
          onSuccessRedirect?.();
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Não foi possível redefinir sua senha. O link pode ter expirado.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao processar alteração de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] sm:w-[440px] p-6 sm:p-8 bg-white dark:bg-[#161c2d] backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(99,14,212,0.15)] border border-[#eaedff] dark:border-white/10 transition-all">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-4">
          <span className="material-symbols-outlined text-[1.875rem]">vpn_key</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#131b2e] dark:text-white">
          Redefinir sua senha
        </h2>
        <p className="text-xs sm:text-sm text-[#7b7487] dark:text-slate-400 mt-1.5">
          Crie uma nova senha segura para acessar sua conta
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in duration-200"
        >
          <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-[1.25rem] shrink-0 mt-0.5">
            error
          </span>
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[1.25rem] shrink-0 mt-0.5">
              check_circle
            </span>
            <div>
              <p className="font-semibold mb-1">Senha atualizada com sucesso!</p>
              <p>{successMessage}</p>
              <p className="mt-2 text-[0.6875rem] text-emerald-700/80 dark:text-emerald-300/80">
                Redirecionando para o sistema...
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-semibold text-[#4a4455] dark:text-slate-300 mb-1.5"
            >
              Nova Senha (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] text-[1.25rem] pointer-events-none">
                lock
              </span>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha segura"
                className="w-full pl-10 pr-11 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border border-[#dce1f5] dark:border-slate-700 rounded-xl text-sm text-[#131b2e] dark:text-white placeholder:text-[#9e97ab] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-semibold text-[#4a4455] dark:text-slate-300 mb-1.5"
            >
              Confirme a Nova Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b7487] text-[1.25rem] pointer-events-none">
                lock_clock
              </span>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9ff] dark:bg-slate-900/60 border border-[#dce1f5] dark:border-slate-700 rounded-xl text-sm text-[#131b2e] dark:text-white placeholder:text-[#9e97ab] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
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
                <span>Salvando nova senha...</span>
              </>
            ) : (
              <>
                <span>Salvar Nova Senha</span>
                <span className="material-symbols-outlined text-[1.125rem]">check</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={clearPasswordRecovery}
            className="w-full py-2.5 px-4 text-xs font-semibold text-[#4a4455] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white transition-colors"
          >
            Voltar para o Login
          </button>
        </form>
      )}
    </div>
  );
};
