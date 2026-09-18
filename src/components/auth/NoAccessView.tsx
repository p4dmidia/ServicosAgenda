import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const NoAccessView: React.FC = () => {
  const { user, signOut, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserProfile();
      navigate('/');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
          <span className="material-symbols-outlined text-[2rem]">lock_person</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          Conta sem acesso vinculado
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Sua conta está autenticada com sucesso como{' '}
          <strong className="text-slate-800 font-semibold">{user?.email}</strong>, porém ainda não possui vínculo ativo com nenhuma empresa ou perfil de cliente.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-500 text-left mb-6 space-y-1.5">
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[1rem] text-slate-400 mt-0.5">info</span>
            <span>Se você é colaborador de uma empresa, solicite ao administrador para incluir seu email na equipe.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[1rem] text-slate-400 mt-0.5">schedule</span>
            <span>Assim que o convite ou vínculo for realizado, as permissões serão atualizadas automaticamente.</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full h-11 rounded-xl bg-[#7c3aed] text-white text-sm font-semibold hover:bg-[#630ed4] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            <span className={`material-symbols-outlined text-[1.125rem] ${isRefreshing ? 'animate-spin' : ''}`}>
              sync
            </span>
            {isRefreshing ? 'Verificando permissões...' : 'Verificar novamente'}
          </button>

          <button
            onClick={() => signOut()}
            className="w-full h-11 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[1.125rem]">logout</span>
            Sair desta conta
          </button>
        </div>
      </div>
    </div>
  );
};
