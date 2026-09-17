import React from 'react';

export const AuthLoadingSplash: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0d121f] text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Pulsing Logo */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
            <span className="material-symbols-outlined text-white text-[2rem]">
              calendar_month
            </span>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-30 blur-sm animate-ping" />
        </div>

        {/* Brand and loading text */}
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Serviços Agenda
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma Inteligente de Gestão & Agendamento
          </p>
        </div>

        {/* Minimal spinner */}
        <div className="flex items-center gap-2 text-xs text-purple-300/80 font-medium">
          <svg
            className="animate-spin h-4 w-4 text-purple-400"
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
          <span>Restaurando sessão segura...</span>
        </div>
      </div>
    </div>
  );
};
