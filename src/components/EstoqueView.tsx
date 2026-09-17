import React, { useState } from 'react';
import { useTenant } from '../context/TenantContext';
import { ProductItem, StockMovement } from '../types';

interface EstoqueViewProps {
  onTriggerToast: (msg: string) => void;
}

export const EstoqueView: React.FC<EstoqueViewProps> = ({ onTriggerToast }) => {
  const { activeTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'produtos' | 'movimentacoes'>('produtos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Produtos Cadastrados
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: 'prod-1',
      sku: 'SKU-BTX-100',
      name: 'Toxina Botulínica 100U (Frasco)',
      category: 'Insumos Clínicos',
      costPrice: 420.0,
      salePrice: 1100.0,
      stockQuantity: 4,
      minStockAlert: 5, // Alerta!
      unit: 'un',
      supplier: 'Allergan Farmacêutica',
      lastRestocked: '25/08/2026',
    },
    {
      id: 'prod-2',
      sku: 'SKU-ACD-HIA',
      name: 'Ácido Hialurônico 1ml Reticulado',
      category: 'Insumos Clínicos',
      costPrice: 280.0,
      salePrice: 850.0,
      stockQuantity: 12,
      minStockAlert: 6,
      unit: 'un',
      supplier: 'Galderma Brasil',
      lastRestocked: '28/08/2026',
    },
    {
      id: 'prod-3',
      sku: 'SKU-POM-MAT',
      name: 'Pomada Modeladora Efeito Matte 80g',
      category: 'Pomadas & Ceras',
      costPrice: 22.0,
      salePrice: 65.0,
      stockQuantity: 3,
      minStockAlert: 8, // Alerta!
      unit: 'un',
      supplier: 'Barber Premium Co.',
      lastRestocked: '10/08/2026',
    },
    {
      id: 'prod-4',
      sku: 'SKU-SHP-BAR',
      name: 'Shampoo Anticaspa & Fortalecedor de Barba 200ml',
      category: 'Home Care',
      costPrice: 28.0,
      salePrice: 75.0,
      stockQuantity: 15,
      minStockAlert: 5,
      unit: 'un',
      supplier: 'Barber Premium Co.',
      lastRestocked: '01/09/2026',
    },
    {
      id: 'prod-5',
      sku: 'SKU-SER-VITC',
      name: 'Sérum Facial Vitamina C 15% 30ml',
      category: 'Home Care',
      costPrice: 45.0,
      salePrice: 130.0,
      stockQuantity: 2,
      minStockAlert: 6, // Alerta!
      unit: 'un',
      supplier: 'Dermocosméticos Vita',
      lastRestocked: '15/08/2026',
    },
    {
      id: 'prod-6',
      sku: 'SKU-LUV-NIT',
      name: 'Caixa Luvas Nitrílicas Pretas Tam M (100un)',
      category: 'Insumos Clínicos',
      costPrice: 38.0,
      salePrice: 38.0,
      stockQuantity: 18,
      minStockAlert: 8,
      unit: 'kit',
      supplier: 'Dental Cremer',
      lastRestocked: '02/09/2026',
    },
  ]);

  // Movimentações de Estoque
  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: 'mov-1',
      productId: 'prod-1',
      productName: 'Toxina Botulínica 100U (Frasco)',
      type: 'SAIDA_USO_INTERNO',
      quantity: 1,
      unitCost: 420.0,
      reason: 'Utilizado no atendimento de Mariana Silveira',
      date: 'Hoje, 10:20',
      operator: 'Dra. Camila Ramos',
    },
    {
      id: 'mov-2',
      productId: 'prod-3',
      productName: 'Pomada Modeladora Efeito Matte 80g',
      type: 'SAIDA_VENDA',
      quantity: 1,
      unitCost: 22.0,
      reason: 'Venda de balcão para cliente avulso',
      date: 'Ontem, 17:30',
      operator: 'Balcão Recepção',
    },
    {
      id: 'mov-3',
      productId: 'prod-6',
      productName: 'Caixa Luvas Nitrílicas Pretas Tam M (100un)',
      type: 'ENTRADA',
      quantity: 10,
      unitCost: 38.0,
      reason: 'Reposição Nota Fiscal NF-e 44921',
      date: '02/09/2026, 09:15',
      operator: 'Gerência Operacional',
    },
  ]);

  // Modais
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedProductForMov, setSelectedProductForMov] = useState<ProductItem | null>(null);

  // Form Novo Produto
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductItem['category']>('Insumos Clínicos');
  const [formCost, setFormCost] = useState('');
  const [formSale, setFormSale] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formUnit, setFormUnit] = useState<'un' | 'ml' | 'g' | 'kit'>('un');
  const [formSupplier, setFormSupplier] = useState('');

  // Form Movimentação
  const [movType, setMovType] = useState<StockMovement['type']>('ENTRADA');
  const [movQty, setMovQty] = useState('1');
  const [movReason, setMovReason] = useState('Compra de reposição / estoque');

  // Cálculos de KPIs
  const totalCostValue = products.reduce((acc, p) => acc + p.costPrice * p.stockQuantity, 0);
  const totalSaleValue = products.reduce((acc, p) => acc + p.salePrice * p.stockQuantity, 0);
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'todas' || p.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesLowStock = !onlyLowStock || p.stockQuantity <= p.minStockAlert;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCost || !formSale) return;

    const newProd: ProductItem = {
      id: `prod-${Date.now()}`,
      sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formName,
      category: formCategory,
      costPrice: parseFloat(formCost),
      salePrice: parseFloat(formSale),
      stockQuantity: parseInt(formStock) || 0,
      minStockAlert: parseInt(formMinStock) || 5,
      unit: formUnit,
      supplier: formSupplier || 'Fornecedor Padrão',
      lastRestocked: 'Hoje',
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsNewProductModalOpen(false);
    setFormSku('');
    setFormName('');
    setFormCost('');
    setFormSale('');
    setFormStock('');
    onTriggerToast(`Produto "${newProd.name}" cadastrado no estoque!`);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForMov) return;

    const qty = parseInt(movQty) || 0;
    if (qty <= 0) {
      onTriggerToast('Quantidade deve ser maior que zero!');
      return;
    }

    const isExit = movType.startsWith('SAIDA');
    if (isExit && qty > selectedProductForMov.stockQuantity) {
      onTriggerToast('Quantidade solicitada excede o estoque disponível!');
      return;
    }

    const delta = isExit ? -qty : qty;

    // Atualiza produto
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === selectedProductForMov.id) {
          return {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity + delta),
            lastRestocked: !isExit ? 'Hoje' : p.lastRestocked,
          };
        }
        return p;
      })
    );

    // Registra movimentação
    const newMovement: StockMovement = {
      id: `mov-${Date.now()}`,
      productId: selectedProductForMov.id,
      productName: selectedProductForMov.name,
      type: movType,
      quantity: qty,
      unitCost: selectedProductForMov.costPrice,
      reason: movReason || (isExit ? 'Saída de estoque' : 'Entrada de mercadorias'),
      date: 'Agora',
      operator: 'Operador Atual',
    };

    setMovements((prev) => [newMovement, ...prev]);
    setIsMovementModalOpen(false);
    onTriggerToast(
      `${isExit ? 'Saída' : 'Entrada'} de ${qty} ${selectedProductForMov.unit} de ${selectedProductForMov.name} efetuada!`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#eaedff] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7c3aed] text-2xl">inventory_2</span>
            <h1 className="text-xl font-bold text-[#131b2e]">Controle de Estoque & Insumos</h1>
            {lowStockProducts.length > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[0.875rem]">warning</span>
                {lowStockProducts.length} itens no limite
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#4a4455] mt-1">
            Gestão de produtos para venda e insumos de procedimentos em <b>{activeTenant.name}</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (products.length > 0) {
                setSelectedProductForMov(products[0]);
                setIsMovementModalOpen(true);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#eaedff] text-xs sm:text-sm font-semibold text-[#131b2e] hover:bg-[#f8f9fa] transition-all"
          >
            <span className="material-symbols-outlined text-[1.125rem]">swap_vert</span>
            Movimentar Estoque
          </button>
          <button
            onClick={() => setIsNewProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs sm:text-sm font-semibold hover:bg-[#6b2fd8] transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[1.125rem]">add</span>
            Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Patrimônio em Estoque</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">inventory</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalCostValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-[#7b7487] font-medium mt-1 block">
            Avaliado a preço de custo de compra
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Potencial de Venda</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">point_of_sale</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#131b2e] mt-2">
            R$ {totalSaleValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[0.6875rem] text-emerald-700 font-medium mt-1 block">
            Valor bruto se liquidado no balcão
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Margem Teórica</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-[#7c3aed] flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">percent</span>
            </div>
          </div>
          <p className="text-2xl font-black text-[#7c3aed] mt-2">
            {totalCostValue > 0
              ? `${Math.round(((totalSaleValue - totalCostValue) / totalSaleValue) * 100)}%`
              : '0%'}
          </p>
          <span className="text-[0.6875rem] text-[#7c3aed] font-medium mt-1 block">
            Markup médio sobre mercadorias
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#eaedff] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7b7487] uppercase">Alertas de Reposição</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.125rem]">notification_important</span>
            </div>
          </div>
          <p
            className={`text-2xl font-black mt-2 ${
              lowStockProducts.length > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {lowStockProducts.length} itens
          </p>
          <span className="text-[0.6875rem] text-amber-700 font-medium mt-1 block">
            Abaixo do estoque mínimo estipulado
          </span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-[#e2e8f0] gap-4">
        <button
          onClick={() => setActiveTab('produtos')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'produtos'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">category</span>
          Produtos & Insumos ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('movimentacoes')}
          className={`pb-3 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'movimentacoes'
              ? 'border-[#7c3aed] text-[#7c3aed]'
              : 'border-transparent text-[#7b7487] hover:text-[#131b2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[1.125rem]">history</span>
          Histórico de Movimentações ({movements.length})
        </button>
      </div>

      {/* TAB 1: LISTA DE PRODUTOS */}
      {activeTab === 'produtos' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7b7487] text-[1.125rem]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-medium focus:outline-none focus:border-[#7c3aed]"
              >
                <option value="todas">Todas Categorias</option>
                <option value="Insumos Clínicos">Insumos Clínicos</option>
                <option value="Home Care">Home Care</option>
                <option value="Pomadas & Ceras">Pomadas & Ceras</option>
              </select>

              <button
                onClick={() => setOnlyLowStock(!onlyLowStock)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  onlyLowStock
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-[#f8f9fa] text-[#7b7487] hover:bg-[#eaedff]'
                }`}
              >
                <span className="material-symbols-outlined text-[1rem]">warning</span>
                Abaixo do Mínimo
              </button>
            </div>

            <span className="text-xs text-[#7b7487]">
              Mostrando <b>{filteredProducts.length}</b> itens
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9fa] border-b border-[#eaedff] text-[0.6875rem] font-bold text-[#7b7487] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Produto & Código</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Estoque Atual</th>
                  <th className="py-3.5 px-4">Custo Unitário</th>
                  <th className="py-3.5 px-4">Preço de Venda</th>
                  <th className="py-3.5 px-4">Fornecedor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaedff] text-xs sm:text-sm">
                {filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-[#fcfdff] transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-[#131b2e] leading-tight">{p.name}</p>
                          <span className="text-[0.6875rem] font-mono text-[#7b7487]">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#f2f3ff] text-[#4a4455] font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-sm ${
                              isLow ? 'text-amber-600' : 'text-[#131b2e]'
                            }`}
                          >
                            {p.stockQuantity} {p.unit}
                          </span>
                          <span className="text-[0.6875rem] text-[#7b7487]">
                            (mín: {p.minStockAlert})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#4a4455]">
                        R$ {p.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#131b2e]">
                        R$ {p.salePrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#7b7487]">
                        {p.supplier || '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[0.6875rem] font-bold ${
                            isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow ? 'Repor Estoque' : 'Regular'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductForMov(p);
                            setIsMovementModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#f2f3ff] text-[#7c3aed] hover:bg-[#7c3aed] hover:text-white font-bold text-xs transition-colors"
                        >
                          Movimentar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE MOVIMENTAÇÕES */}
      {activeTab === 'movimentacoes' && (
        <div className="bg-white rounded-2xl border border-[#eaedff] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#eaedff] flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#131b2e]">Registro Cronológico de Entradas e Saídas</h3>
            <span className="text-xs text-[#7b7487]">Auditoria de estoque</span>
          </div>

          <div className="divide-y divide-[#eaedff]">
            {movements.map((mov) => (
              <div key={mov.id} className="p-4 flex items-center justify-between hover:bg-[#fcfdff] transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      mov.type === 'ENTRADA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1.25rem]">
                      {mov.type === 'ENTRADA' ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#131b2e]">{mov.productName}</span>
                      <span
                        className={`text-[0.625rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                          mov.type === 'ENTRADA'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {mov.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#7b7487] mt-0.5">
                      {mov.reason} • Por <b>{mov.operator}</b>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-black text-sm ${
                      mov.type === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {mov.type === 'ENTRADA' ? '+' : '-'} {mov.quantity} un
                  </p>
                  <p className="text-[0.6875rem] text-[#7b7487]">{mov.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL NOVO PRODUTO */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">add_box</span>
                <h3 className="font-bold text-base text-[#131b2e]">Cadastrar Produto / Insumo</h3>
              </div>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    placeholder="Ex: Óleo Hidratante de Barba"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Código SKU</label>
                  <input
                    type="text"
                    placeholder="SKU-001"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="Insumos Clínicos">Insumos Clínicos</option>
                    <option value="Home Care">Home Care</option>
                    <option value="Pomadas & Ceras">Pomadas & Ceras</option>
                    <option value="Tratamentos">Tratamentos</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Unidade</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="g">Gramas (g)</option>
                    <option value="kit">Kit / Pacote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Custo de Compra (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="25.00"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.10"
                    placeholder="65.00"
                    value={formSale}
                    onChange={(e) => setFormSale(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Qtd Inicial Estoque</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131b2e] mb-1">Alerta Mínimo</label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Fornecedor</label>
                <input
                  type="text"
                  placeholder="Nome do distribuidor ou laboratório"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE MOVIMENTAÇÃO DE ESTOQUE */}
      {isMovementModalOpen && selectedProductForMov && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#eaedff] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#eaedff] flex items-center justify-between bg-[#f8f9fa]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7c3aed]">swap_vert</span>
                <h3 className="font-bold text-base text-[#131b2e]">Movimentar Estoque</h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-[#7b7487] hover:text-[#131b2e] p-1"
              >
                <span className="material-symbols-outlined text-[1.25rem]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Item Selecionado</label>
                <select
                  value={selectedProductForMov.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setSelectedProductForMov(found);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Atual: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Tipo de Movimentação</label>
                <select
                  value={movType}
                  onChange={(e) => setMovType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold focus:outline-none focus:border-[#7c3aed]"
                >
                  <option value="ENTRADA">Entrada (Compra / Reposição de Fornecedor)</option>
                  <option value="SAIDA_USO_INTERNO">Saída para Uso Interno / Procedimento</option>
                  <option value="SAIDA_VENDA">Saída para Venda no Balcão</option>
                  <option value="AJUSTE_BALANCO">Ajuste de Balanço / Quebra / Avaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">
                  Quantidade ({selectedProductForMov.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={movQty}
                  onChange={(e) => setMovQty(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-sm font-bold text-[#131b2e] focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131b2e] mb-1">Motivo / Observação</label>
                <input
                  type="text"
                  placeholder="Ex: Utilizado na drenagem das 14h"
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#eaedff] text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#eaedff]">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#eaedff] text-xs font-semibold text-[#7b7487] hover:bg-[#f8f9fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6b2fd8] transition-colors"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
