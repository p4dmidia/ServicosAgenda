export type ScreenType = 
  | 'visao-geral'
  | 'agenda'
  | 'clientes'
  | 'profissionais'
  | 'servicos'
  | 'whatsapp'
  | 'agente-ia'
  | 'financeiro'
  | 'pagamentos'
  | 'marketing'
  | 'fidelidade'
  | 'clube-de-assinatura'
  | 'afiliados'
  | 'estoque'
  | 'relatorios'
  | 'configuracoes'
  | 'ajuda-e-suporte'
  | 'super-admin'
  | 'agendamento-online';

export type AppointmentStatus = 
  | 'CONFIRMADO' 
  | 'AGENDADO' 
  | 'AGUARDANDO CONFIRMAÇÃO' 
  | 'EM ATENDIMENTO' 
  | 'CONCLUIDO' 
  | 'CANCELADO'
  | 'NAO_COMPARECEU';

export interface TenantSettings {
  allowSignalBooking: boolean;
  signalAmount: number;
  primaryColor: string;
  secondaryColor?: string;
  reminderHoursBefore: number[];
  segment: 'clinica' | 'barbearia' | 'salao' | 'estetica';
  coverImage?: string;
  instagram?: string;
  whatsapp?: string;
  description?: string;
  businessHours?: {
    open: string;
    close: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'clinica' | 'barbearia' | 'salao' | 'estetica';
  status: 'ativo' | 'suspenso' | 'pendente';
  plan: 'Bronze' | 'Prata' | 'Ouro' | 'Pro' | 'Enterprise';
  monthlyFee: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: string;
  logo?: string;
  createdAt: string;
  activeProfessionalsCount: number;
  activeAppointmentsCount: number;
  settings: TenantSettings;
}

export interface Appointment {
  id: string;
  tenantId?: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientPhoto?: string;
  clientInitials?: string;
  service: string;
  professional: string;
  status: AppointmentStatus;
  price?: number;
  duration?: string;
  date?: string;
}

export interface Professional {
  id: string;
  tenantId?: string;
  name: string;
  role: string;
  initials: string;
  activeAppointments: number;
  capacityPercent: number;
  colorClass: string;
  photo?: string;
}

export interface Client {
  id: string;
  tenantId?: string;
  name: string;
  phone: string;
  email: string;
  photo?: string;
  initials: string;
  lastVisit: string;
  totalSpent: number;
  status: 'Ativo' | 'Sem retorno (+30d)' | 'Sem retorno (+60d)' | 'Novo';
  favoriteService: string;
}

export interface ServiceItem {
  id: string;
  tenantId?: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
}

export interface AttentionItem {
  id: string;
  title: string;
  badge: string;
  badgeType: 'amber' | 'rose' | 'orange' | 'purple' | 'neutral';
  icon: string;
  actionText?: string;
}

// ETAPA 5: FIDELIDADE & CASHBACK
export interface FidelidadeConfig {
  active: boolean;
  cashbackPercent: number; // ex: 5%
  pointsPerReal: number;   // ex: 1 pt por R$ 1
  pointValueInReais: number; // ex: 100 pts = R$ 5 (0.05)
  expiryMonths: number;
}

export interface FidelidadeClientSummary {
  clientId: string;
  clientName: string;
  clientPhone: string;
  pointsBalance: number;
  cashbackBalance: number;
  totalEarnedCashback: number;
  totalRedeemedCashback: number;
  lastMovementDate: string;
}

export interface FidelidadeTransaction {
  id: string;
  clientId: string;
  clientName: string;
  type: 'CREDITO' | 'RESGATE' | 'EXPIRADO';
  points: number;
  cashbackAmount: number;
  description: string;
  date: string;
}

// ETAPA 5: CLUBE DE ASSINATURA RECORRENTE
export interface SubscriptionPlan {
  id: string;
  name: string;
  category: string;
  price: number;
  interval: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  description: string;
  includedServices: string[];
  maxSessionsPerMonth: number; // 999 para ilimitado
  activeSubscribersCount: number;
  isPopular?: boolean;
}

export interface ClientSubscription {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  planId: string;
  planName: string;
  price: number;
  status: 'Ativo' | 'Inadimplente' | 'Cancelado' | 'Pendente';
  paymentMethod: 'Cartão de Crédito Recorrente' | 'PIX Recorrente';
  startDate: string;
  nextBillingDate: string;
  sessionsUsed: number;
  sessionsTotal: number;
}

// ETAPA 5: CONTROLE DE ESTOQUE
export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: 'Tratamentos' | 'Home Care' | 'Insumos Clínicos' | 'Pomadas & Ceras' | 'Acessórios';
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  unit: 'un' | 'ml' | 'g' | 'kit';
  supplier?: string;
  lastRestocked: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'ENTRADA' | 'SAIDA_VENDA' | 'SAIDA_USO_INTERNO' | 'AJUSTE_BALANCO';
  quantity: number;
  unitCost: number;
  reason: string;
  date: string;
  operator: string;
}

// ETAPA 6: PROGRAMA DE AFILIADOS / PARCEIROS SAAS
export interface AfiliadoItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  referralLink: string;
  commissionPercent: number; // ex: 20% recorrente
  totalLeads: number;
  totalConversions: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  pendingBalance: number;
  status: 'Ativo' | 'Pendente' | 'Bloqueado';
  pixKey: string;
  joinedAt: string;
}

export interface AfiliadoLead {
  id: string;
  afiliadoId: string;
  afiliadoName: string;
  clinicName: string;
  ownerName: string;
  planName: string;
  monthlyValue: number;
  commissionValue: number;
  status: 'Em Teste' | 'Assinante Ativo' | 'Cancelado';
  signupDate: string;
}

// ETAPA 6: AGENTE DE INTELIGÊNCIA ARTIFICIAL CONVERSACIONAL
export interface AgenteIaConfig {
  enabled: boolean;
  agentName: string;
  toneOfVoice: 'clinico_especialista' | 'amigavel' | 'formal' | 'descontraido';
  autoConfirmAppointments: boolean;
  allowCancelAndReschedule: boolean;
  emergencyEscalationPhone: string;
  clinicDescription: string;
  specialInstructions: string;
  simulatedConversationsCount: number;
}


