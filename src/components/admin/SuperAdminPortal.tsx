import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

type AdminTab = 'empresas' | 'faturamento' | 'auditoria';

export const SuperAdminPortal: React.FC = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('empresas');

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100 font-sans antialiased">
      {/* Super Admin Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <span className="material-symbols-outlined text-[1.25rem]">shield_person</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Super Admin</h1>
              <span className="text-[0.6875rem] text-purple-400 font-medium tracking-wide uppercase">Controle SaaS</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveTab('empresas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'empresas'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[1.25rem]">domain</span>
              Empresas
            </button>

            <button
              onClick={() => setActiveTab('faturamento')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'faturamento'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[1.25rem]">payments</span>
              Faturamento
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'auditoria'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[1.25rem]">history_edu</span>
              Auditoria
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
              <span className="text-[0.625rem] text-emerald-400 font-medium">Super Administrador</span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors border border-rose-500/20"
          >
            <span className="material-symbols-outlined text-[1rem]">logout</span>
            Sair da Plataforma
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-[#1e293b]/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Super Admin /</span>
            <span className="text-white text-sm font-semibold capitalize">{activeTab}</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
            Ambiente Global
          </span>
        </header>

        <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
          {activeTab === 'empresas' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Empresas Cadastradas</h2>
                <p className="text-sm text-slate-400 mt-1">Gestão global de inquilinos (tenants) e licenças da plataforma.</p>
              </div>

              <div className="bg-[#1e293b] rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <p className="text-sm font-medium text-slate-300">Estrutura preparada para a próxima etapa</p>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">Em breve</span>
                </div>
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <span className="material-symbols-outlined text-[2.5rem] text-slate-600">domain_add</span>
                  <p className="text-sm font-medium">O módulo de listagem e criação de empresas será conectado aqui.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faturamento' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Faturamento & Assinaturas</h2>
                <p className="text-sm text-slate-400 mt-1">Controle de planos, MRR e recebíveis das empresas assinantes.</p>
              </div>

              <div className="bg-[#1e293b] rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <p className="text-sm font-medium text-slate-300">Módulo Financeiro SaaS</p>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">Em breve</span>
                </div>
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <span className="material-symbols-outlined text-[2.5rem] text-slate-600">account_balance_wallet</span>
                  <p className="text-sm font-medium">Visualização consolidada de faturamento SaaS.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'auditoria' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Auditoria & Logs de Segurança</h2>
                <p className="text-sm text-slate-400 mt-1">Registro de acessos, alterações de permissão e chamadas críticas.</p>
              </div>

              <div className="bg-[#1e293b] rounded-2xl border border-slate-800 p-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <p className="text-sm font-medium text-slate-300">Trilha de Auditoria</p>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">Em breve</span>
                </div>
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <span className="material-symbols-outlined text-[2.5rem] text-slate-600">security</span>
                  <p className="text-sm font-medium">Logs de auditoria e segurança em tempo real.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
