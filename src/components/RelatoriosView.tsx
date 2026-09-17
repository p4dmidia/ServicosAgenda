import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';

interface RelatoriosViewProps {
  onTriggerToast: (msg: string) => void;
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({ onTriggerToast }) => {
  const { activeTenant } = useTenant();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'ano'>('30d');

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">bar_chart</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Relatórios Gerenciais & Performance</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-[#7c3aed]">
              Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Métricas de produtividade, faturamento por serviço e retenção de <b>{activeTenant.name}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value as any);
              onTriggerToast(`Período atualizado para ${e.target.value}`);
            }}
            className="px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold focus:outline-none focus:border-[#7c3aed]"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Último Trimestre</option>
            <option value="ano">Ano Atual (2026)</option>
          </select>

          <button
            onClick={() => {
              window.print();
              onTriggerToast('Exportando relatório gerencial em PDF...');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#131b2e] text-white text-xs font-bold hover:bg-[#283044] transition-colors"
          >
            <span className="material-symbols-outlined text-[1rem]">picture_as_pdf</span>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs font-semibold text-[#7b7487] uppercase">Faturamento Bruto</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">R$ 54.320,00</p>
          <span className="text-[0.6875rem] text-emerald-700 font-bold mt-1 block">↑ 14.2% vs mês anterior</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs font-semibold text-[#7b7487] uppercase">Ticket Médio</span>
          <p className="text-2xl font-black text-[#131b2e] mt-2">R$ 285,00</p>
          <span className="text-[0.6875rem] text-[#7b7487] font-medium mt-1 block">Por atendimento concluído</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs font-semibold text-[#7b7487] uppercase">Total Atendimentos</span>
          <p className="text-2xl font-black text-[#7c3aed] mt-2">191 consultas</p>
          <span className="text-[0.6875rem] text-purple-700 font-medium mt-1 block">94.8% de comparecimento</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <span className="text-xs font-semibold text-[#7b7487] uppercase">Taxa de Retorno</span>
          <p className="text-2xl font-black text-blue-600 mt-2">68.4%</p>
          <span className="text-[0.6875rem] text-blue-700 font-medium mt-1 block">Clientes recorrentes</span>
        </div>
      </div>

      {/* Grid: 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços Mais Rentáveis */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#131b2e]">Serviços Mais Lucrativos do Período</h3>

          <div className="space-y-3">
            {[
              { name: 'Harmonização Facial & Botox', count: 42, revenue: 18900, pct: 35 },
              { name: 'Drenagem Linfática / Modeladora', count: 64, revenue: 11520, pct: 21 },
              { name: 'Limpeza de Pele Profunda', count: 51, revenue: 9180, pct: 17 },
              { name: 'Barboterapia & Corte VIP', count: 78, revenue: 8580, pct: 16 },
              { name: 'Venda de Produtos & Home Care', count: 39, revenue: 6140, pct: 11 },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#131b2e]">{item.name}</span>
                  <span className="text-emerald-600">R$ {item.revenue.toLocaleString('pt-BR')} ({item.count} atendimentos)</span>
                </div>
                <div className="w-full h-2 bg-[#eaedff] rounded-full overflow-hidden">
                  <div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Produtividade da Equipe */}
        <div className="bg-white rounded-2xl border border-[#eaedff] p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#131b2e]">Produtividade dos Especialistas</h3>

          <div className="divide-y divide-[#eaedff]">
            {[
              { name: 'Dra. Camila Ramos', role: 'Dermatologista / Esteta', count: 68, revenue: 24500, rating: '4.9 ★' },
              { name: 'Juliana Mendes', role: 'Esteticista Corporal', count: 54, revenue: 14200, rating: '5.0 ★' },
              { name: 'Lucas Barbearia', role: 'Master Barber', count: 69, revenue: 15620, rating: '4.8 ★' },
            ].map((p, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs sm:text-sm text-[#131b2e]">{p.name}</p>
                  <p className="text-[0.6875rem] text-[#7b7487]">{p.role} • Avaliação {p.rating}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xs sm:text-sm text-[#131b2e]">R$ {p.revenue.toLocaleString('pt-BR')}</p>
                  <p className="text-[0.6875rem] text-[#7b7487]">{p.count} procedimentos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
