-- ==============================================================================
-- SERVIÇOS AGENDA - MIGRATION 0001: SCHEMA MULTI-TENANT & ROW LEVEL SECURITY
-- Arquitetura SaaS Enterprise: Isolamento Estrito por Tenant + Políticas Anon & Auth
-- Versão Revisada com Segurança Avançada, Constraint EXCLUDE e View Pública
-- ==============================================================================

-- 1. EXTENSÕES ESSENCIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Necessário para EXCLUDE USING gist com UUID e timestamps

-- ==============================================================================
-- 2. FUNÇÃO IMUTÁVEL DE RANGE PARA CONSTRAINTS DE AGENDAMENTO
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.appointment_range(start_time TIMESTAMPTZ, duration INT)
RETURNS tstzrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
    SELECT tstzrange(start_time, start_time + (duration || ' minutes')::interval, '[)');
$$;

-- ==============================================================================
-- 3. TABELA DE SUPER ADMINS (SEGURANÇA BLINDADA)
-- Não é coluna comum em profiles: sem policy de INSERT/UPDATE para usuários comuns
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.super_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.super_admins IS 'Lista restrita de Super Administradores do SaaS Serviços Agenda. Gerenciável apenas via service_role ou migração inicial.';

-- Helper Function: is_super_admin (SECURITY DEFINER para desempenho e segurança nas policies)
CREATE OR REPLACE FUNCTION public.is_super_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.super_admins WHERE user_id = check_user_id
    );
$$;

-- ==============================================================================
-- 4. TABELA DE EMPRESAS / ORGANIZAÇÕES (TENANTS)
-- Contém slug único para URL de agendamento público (/agendar/clinica-bella-vita)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    segment VARCHAR(50) DEFAULT 'clinica' NOT NULL, -- clinica, barbearia, salao, estetica
    status VARCHAR(20) DEFAULT 'ativo' NOT NULL,   -- ativo, suspenso, pendente
    plan VARCHAR(50) DEFAULT 'Bronze' NOT NULL,    -- Bronze, Prata, Ouro, Pro, Enterprise
    monthly_fee NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    owner_name VARCHAR(255),
    owner_email VARCHAR(255),
    owner_phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{
        "allow_signal_booking": false,
        "signal_amount": 0.0,
        "primary_color": "#7c3aed",
        "reminder_hours_before": [24, 2]
    }'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT tenants_slug_unique UNIQUE (slug)
);

COMMENT ON TABLE public.tenants IS 'Empresas/Clínicas assinantes da plataforma SaaS (Tenants). O slug único define a página pública de agendamento.';

CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON public.tenants (status);

-- ==============================================================================
-- 5. VIEW PÚBLICA PARA AGENDAMENTO ONLINE (SEM EXPOR DADOS INTERNOS DA EMPRESA)
-- Anon acessa apenas dados públicos (nome, slug, settings, segmento e logo)
-- ==============================================================================
CREATE OR REPLACE VIEW public.public_tenant_info AS
SELECT
    id,
    name,
    slug,
    segment,
    logo_url,
    settings
FROM public.tenants
WHERE status = 'ativo';

COMMENT ON VIEW public.public_tenant_info IS 'Visão pública e restrita de dados do tenant para consumo da página de agendamento online.';

GRANT SELECT ON public.public_tenant_info TO anon, authenticated;

-- ==============================================================================
-- 6. PERFIS DE USUÁRIOS (PROFILES)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários vinculados ao auth.users (proprietários, funcionários e clientes finais).';

CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);

-- ==============================================================================
-- 7. MEMBROS DO TENANT (RELAÇÃO N:M ENTRE USUÁRIOS E EMPRESAS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'staff' NOT NULL, -- owner, manager, staff, receptionist
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT tenant_members_unique UNIQUE (tenant_id, user_id)
);

COMMENT ON TABLE public.tenant_members IS 'Vínculo de colaboradores e proprietários com os tenants e suas respectivas funções (RBAC).';

CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members (tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_lookup ON public.tenant_members (tenant_id, user_id);

-- Helper Function: is_tenant_member
CREATE OR REPLACE FUNCTION public.is_tenant_member(target_tenant_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = target_tenant_id AND user_id = check_user_id
    );
$$;

-- Helper Function: get_user_role_in_tenant
CREATE OR REPLACE FUNCTION public.get_user_role_in_tenant(target_tenant_id UUID, check_user_id UUID DEFAULT auth.uid())
RETURNS VARCHAR
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.tenant_members
    WHERE tenant_id = target_tenant_id AND user_id = check_user_id
    LIMIT 1;
$$;

-- ==============================================================================
-- 8. TABELA DE SERVIÇOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Geral' NOT NULL,
    duration_minutes INT DEFAULT 30 NOT NULL,
    price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.services IS 'Procedimentos e serviços prestados por cada tenant, com preço, duração e categoria.';

CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON public.services (tenant_id);
CREATE INDEX IF NOT EXISTS idx_services_tenant_active ON public.services (tenant_id, is_active);

-- ==============================================================================
-- 9. TABELA DE PROFISSIONAIS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    color_class VARCHAR(50) DEFAULT 'bg-purple-500' NOT NULL,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.professionals IS 'Profissionais cadastrados no tenant para execução de atendimentos e agendamentos.';

CREATE INDEX IF NOT EXISTS idx_professionals_tenant_id ON public.professionals (tenant_id);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals (user_id);

-- ==============================================================================
-- 10. TABELA DE CLIENTES (CONSUMIDOR FINAL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    photo_url TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Novo' NOT NULL, -- Novo, Ativo, Sem retorno (+30d), Sem retorno (+60d)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT clients_tenant_phone_unique UNIQUE (tenant_id, phone)
);

COMMENT ON TABLE public.clients IS 'Carteira de clientes do tenant. O telefone é chave primária lógica para identificação e agendamento por WhatsApp/Phone Auth.';

CREATE INDEX IF NOT EXISTS idx_clients_tenant_id ON public.clients (tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS idx_clients_tenant_phone ON public.clients (tenant_id, phone);

-- ==============================================================================
-- 11. TABELA DE AGENDAMENTOS (COM EXCLUDE CONSTRAINT CONTRA SOBREPOSIÇÃO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    professional_name VARCHAR(255) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 30 NOT NULL,
    status VARCHAR(50) DEFAULT 'AGENDADO' NOT NULL, -- CONFIRMADO, AGENDADO, AGUARDANDO CONFIRMAÇÃO, EM ATENDIMENTO, CONCLUIDO, CANCELADO, NAO_COMPARECEU
    price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Constraint anti-sobreposição: impede que o mesmo profissional receba 2 agendamentos no mesmo intervalo
    CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
        professional_id WITH =,
        public.appointment_range(scheduled_at, duration_minutes) WITH &&
    ) WHERE (status NOT IN ('CANCELADO', 'NAO_COMPARECEU') AND professional_id IS NOT NULL)
);

COMMENT ON TABLE public.appointments IS 'Agendamentos da empresa. Registra horários marcados, status do fluxo de atendimento e valores.';

CREATE INDEX IF NOT EXISTS idx_appointments_tenant_id ON public.appointments (tenant_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON public.appointments (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON public.appointments (tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments (client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments (professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);

-- ==============================================================================
-- 12. FUNÇÃO SECURITY DEFINER: DISPONIBILIDADE SEM VAZAMENTO DE DADOS (SLOTS)
-- Substitui o SELECT direto de anon em appointments.
-- Retorna apenas horário e duração ocupados, sem NENHUM PII (nome, telefone, notas, preço).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_available_slots(
    p_tenant_id UUID,
    p_professional_id UUID,
    p_date DATE
)
RETURNS TABLE (
    scheduled_at TIMESTAMPTZ,
    duration_minutes INT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT
        a.scheduled_at,
        a.duration_minutes
    FROM public.appointments a
    WHERE a.tenant_id = p_tenant_id
      AND (p_professional_id IS NULL OR a.professional_id = p_professional_id)
      AND a.scheduled_at::date = p_date
      AND a.status IN ('CONFIRMADO', 'AGENDADO', 'AGUARDANDO CONFIRMAÇÃO', 'EM ATENDIMENTO');
$$;

COMMENT ON FUNCTION public.get_available_slots IS 'Consulta pública e segura de horários ocupados por profissional/data para motor de agendamento online.';

GRANT EXECUTE ON FUNCTION public.get_available_slots(UUID, UUID, DATE) TO anon, authenticated;

-- ==============================================================================
-- 13. TABELA DE TRANSAÇÕES FINANCEIRAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- RECEITA, DESPESA
    category VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50), -- PIX, CARTAO_CREDITO, CARTAO_DEBITO, DINHEIRO
    status VARCHAR(30) DEFAULT 'PAGO' NOT NULL, -- PAGO, PENDENTE, CANCELADO
    due_date DATE DEFAULT CURRENT_DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.financial_transactions IS 'Lançamentos de receitas e despesas do tenant para controle de fluxo de caixa e DRE.';

CREATE INDEX IF NOT EXISTS idx_financial_transactions_tenant_id ON public.financial_transactions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON public.financial_transactions (due_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_tenant_type ON public.financial_transactions (tenant_id, type);

-- ==============================================================================
-- 14. TABELA DE PRODUTOS DO ESTOQUE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stock_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    cost_price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    sale_price NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    stock_quantity NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    min_stock_alert NUMERIC(10,2) DEFAULT 5.00 NOT NULL,
    unit VARCHAR(20) DEFAULT 'un' NOT NULL, -- un, ml, g, kit
    supplier VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.stock_products IS 'Inventário de produtos, cosméticos e insumos consumidos em procedimentos ou revendidos.';

CREATE INDEX IF NOT EXISTS idx_stock_products_tenant_id ON public.stock_products (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_products_sku ON public.stock_products (sku);

-- ==============================================================================
-- 15. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.stock_products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- ENTRADA, SAIDA_VENDA, SAIDA_USO_INTERNO, AJUSTE_BALANCO
    quantity NUMERIC(10,2) NOT NULL,
    unit_cost NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    reason TEXT,
    operator_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.stock_movements IS 'Registro imutável de movimentações de estoque para rastreabilidade de custos e perdas.';

CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant_id ON public.stock_movements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements (product_id);

-- ==============================================================================
-- 16. TABELA DE CONTAS DE FIDELIDADE & CASHBACK
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    points_balance INT DEFAULT 0 NOT NULL,
    cashback_balance NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    total_earned_cashback NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    total_redeemed_cashback NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    last_movement_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT loyalty_accounts_unique UNIQUE (tenant_id, client_id)
);

COMMENT ON TABLE public.loyalty_accounts IS 'Carteira de pontos e cashback acumulados pelo cliente exclusivamente no tenant.';

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_tenant_id ON public.loyalty_accounts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_client_id ON public.loyalty_accounts (client_id);

-- ==============================================================================
-- 17. TABELA DE TRANSAÇÕES DE FIDELIDADE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.loyalty_accounts(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL, -- CREDITO, RESGATE, EXPIRADO
    points INT DEFAULT 0 NOT NULL,
    cashback_amount NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.loyalty_transactions IS 'Extrato detalhado de créditos e débitos de cashback/pontos de fidelidade.';

CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_tenant_id ON public.loyalty_transactions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_account_id ON public.loyalty_transactions (account_id);

-- ==============================================================================
-- 18. TABELA DE PLANOS DE ASSINATURA (CLUBE RECORRENTE DO TENANT)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price NUMERIC(10,2) NOT NULL,
    interval VARCHAR(50) DEFAULT 'mensal' NOT NULL, -- mensal, trimestral, semestral, anual
    description TEXT,
    included_services JSONB DEFAULT '[]'::jsonb NOT NULL,
    max_sessions_per_month INT DEFAULT 4 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.subscription_plans IS 'Planos de mensalidade recorrente disponibilizados pelo tenant para seus clientes.';

CREATE INDEX IF NOT EXISTS idx_subscription_plans_tenant_id ON public.subscription_plans (tenant_id);

-- ==============================================================================
-- 19. TABELA DE ASSINATURAS DOS CLIENTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.client_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Ativo' NOT NULL, -- Ativo, Inadimplente, Cancelado, Pendente
    payment_method VARCHAR(50) DEFAULT 'Cartão de Crédito Recorrente' NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    next_billing_date DATE,
    sessions_used INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.client_subscriptions IS 'Assinaturas ativas de clientes em clubes recorrentes da clínica.';

CREATE INDEX IF NOT EXISTS idx_client_subscriptions_tenant_id ON public.client_subscriptions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON public.client_subscriptions (client_id);

-- ==============================================================================
-- 20. TABELA DE LOGS DE AUDITORIA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.audit_logs IS 'Trilha de auditoria para monitoramento de ações críticas e conformidade LGPD.';

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at);

-- ==============================================================================
-- 21. HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
-- ==============================================================================
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 22. POLÍTICAS DE ROW LEVEL SECURITY (RLS) - REVISADAS E BLINDADAS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- POLÍTICAS: super_admins
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS super_admins_select_policy ON public.super_admins;
CREATE POLICY super_admins_select_policy ON public.super_admins
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_super_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- POLÍTICAS: tenants
-- Anon NÃO acessa mais a tabela tenants inteira (usa public_tenant_info)
-- INSERT restrito estritamente a super admin
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS tenants_select_policy ON public.tenants;
CREATE POLICY tenants_select_policy ON public.tenants
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(id, auth.uid())
    );

DROP POLICY IF EXISTS tenants_insert_policy ON public.tenants;
CREATE POLICY tenants_insert_policy ON public.tenants
    FOR INSERT TO authenticated
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS tenants_update_policy ON public.tenants;
CREATE POLICY tenants_update_policy ON public.tenants
    FOR UPDATE TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (public.is_tenant_member(id, auth.uid()) AND public.get_user_role_in_tenant(id, auth.uid()) IN ('owner', 'manager'))
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
CREATE POLICY profiles_select_policy ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- POLÍTICAS: tenant_members
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS tenant_members_select_policy ON public.tenant_members;
CREATE POLICY tenant_members_select_policy ON public.tenant_members
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS tenant_members_modify_policy ON public.tenant_members;
CREATE POLICY tenant_members_modify_policy ON public.tenant_members
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (public.is_tenant_member(tenant_id, auth.uid()) AND public.get_user_role_in_tenant(tenant_id, auth.uid()) = 'owner')
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: services
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS services_select_policy ON public.services;
CREATE POLICY services_select_policy ON public.services
    FOR SELECT TO public
    USING (
        (is_active = true)
        OR public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS services_modify_policy ON public.services;
CREATE POLICY services_modify_policy ON public.services
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (public.is_tenant_member(tenant_id, auth.uid()) AND public.get_user_role_in_tenant(tenant_id, auth.uid()) IN ('owner', 'manager'))
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: professionals
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS professionals_select_policy ON public.professionals;
CREATE POLICY professionals_select_policy ON public.professionals
    FOR SELECT TO public
    USING (
        (is_active = true)
        OR public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS professionals_modify_policy ON public.professionals;
CREATE POLICY professionals_modify_policy ON public.professionals
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (public.is_tenant_member(tenant_id, auth.uid()) AND public.get_user_role_in_tenant(tenant_id, auth.uid()) IN ('owner', 'manager'))
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: clients
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS clients_select_policy ON public.clients;
CREATE POLICY clients_select_policy ON public.clients
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS clients_insert_anon_policy ON public.clients;
CREATE POLICY clients_insert_anon_policy ON public.clients
    FOR INSERT TO anon
    WITH CHECK (
        tenant_id IS NOT NULL
        AND name IS NOT NULL AND length(trim(name)) >= 2
        AND phone IS NOT NULL AND length(trim(phone)) >= 8
    );

DROP POLICY IF EXISTS clients_insert_auth_policy ON public.clients;
CREATE POLICY clients_insert_auth_policy ON public.clients
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
        OR user_id = auth.uid()
    );

DROP POLICY IF EXISTS clients_update_policy ON public.clients;
CREATE POLICY clients_update_policy ON public.clients
    FOR UPDATE TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
        OR user_id = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: appointments
-- Anon NÃO tem mais SELECT direto nesta tabela (usa get_available_slots)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS appointments_select_anon_slots ON public.appointments;

DROP POLICY IF EXISTS appointments_select_policy ON public.appointments;
CREATE POLICY appointments_select_policy ON public.appointments
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
        OR (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
    );

DROP POLICY IF EXISTS appointments_insert_anon_policy ON public.appointments;
CREATE POLICY appointments_insert_anon_policy ON public.appointments
    FOR INSERT TO anon
    WITH CHECK (
        tenant_id IS NOT NULL
        AND client_name IS NOT NULL AND length(trim(client_name)) >= 2
        AND client_phone IS NOT NULL AND length(trim(client_phone)) >= 8
        AND scheduled_at IS NOT NULL
    );

DROP POLICY IF EXISTS appointments_insert_auth_policy ON public.appointments;
CREATE POLICY appointments_insert_auth_policy ON public.appointments
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
        OR (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()))
    );

DROP POLICY IF EXISTS appointments_update_policy ON public.appointments;
CREATE POLICY appointments_update_policy ON public.appointments
    FOR UPDATE TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: financial_transactions, stock_products, stock_movements
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS financial_transactions_policy ON public.financial_transactions;
CREATE POLICY financial_transactions_policy ON public.financial_transactions
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS stock_products_policy ON public.stock_products;
CREATE POLICY stock_products_policy ON public.stock_products
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS stock_movements_policy ON public.stock_movements;
CREATE POLICY stock_movements_policy ON public.stock_movements
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: loyalty_accounts (SEPARADA: CLIENTE FOR SELECT / TENANT FOR ALL)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS loyalty_accounts_policy ON public.loyalty_accounts;

DROP POLICY IF EXISTS loyalty_accounts_tenant_policy ON public.loyalty_accounts;
CREATE POLICY loyalty_accounts_tenant_policy ON public.loyalty_accounts
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS loyalty_accounts_client_select_policy ON public.loyalty_accounts;
CREATE POLICY loyalty_accounts_client_select_policy ON public.loyalty_accounts
    FOR SELECT TO authenticated
    USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: loyalty_transactions (SEPARADA: CLIENTE FOR SELECT / TENANT FOR ALL)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS loyalty_transactions_policy ON public.loyalty_transactions;

DROP POLICY IF EXISTS loyalty_transactions_tenant_policy ON public.loyalty_transactions;
CREATE POLICY loyalty_transactions_tenant_policy ON public.loyalty_transactions
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS loyalty_transactions_client_select_policy ON public.loyalty_transactions;
CREATE POLICY loyalty_transactions_client_select_policy ON public.loyalty_transactions
    FOR SELECT TO authenticated
    USING (
        account_id IN (
            SELECT la.id FROM public.loyalty_accounts la
            JOIN public.clients c ON c.id = la.client_id
            WHERE c.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: subscription_plans
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS subscription_plans_policy ON public.subscription_plans;
CREATE POLICY subscription_plans_policy ON public.subscription_plans
    FOR SELECT TO public
    USING (
        is_active = true
        OR public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS subscription_plans_modify_policy ON public.subscription_plans;
CREATE POLICY subscription_plans_modify_policy ON public.subscription_plans
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (public.is_tenant_member(tenant_id, auth.uid()) AND public.get_user_role_in_tenant(tenant_id, auth.uid()) IN ('owner', 'manager'))
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: client_subscriptions (SEPARADA: CLIENTE FOR SELECT / TENANT FOR ALL)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS client_subscriptions_policy ON public.client_subscriptions;

DROP POLICY IF EXISTS client_subscriptions_tenant_policy ON public.client_subscriptions;
CREATE POLICY client_subscriptions_tenant_policy ON public.client_subscriptions
    FOR ALL TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS client_subscriptions_client_select_policy ON public.client_subscriptions;
CREATE POLICY client_subscriptions_client_select_policy ON public.client_subscriptions
    FOR SELECT TO authenticated
    USING (
        client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

-- ------------------------------------------------------------------------------
-- POLÍTICAS: audit_logs (INSERT-ONLY PARA MEMBROS, SELECT OWNER/MANAGER, ALL SUPER ADMIN)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS audit_logs_policy ON public.audit_logs;

DROP POLICY IF EXISTS audit_logs_select_policy ON public.audit_logs;
CREATE POLICY audit_logs_select_policy ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin(auth.uid())
        OR (
            public.is_tenant_member(tenant_id, auth.uid())
            AND public.get_user_role_in_tenant(tenant_id, auth.uid()) IN ('owner', 'manager')
        )
    );

DROP POLICY IF EXISTS audit_logs_insert_policy ON public.audit_logs;
CREATE POLICY audit_logs_insert_policy ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin(auth.uid())
        OR public.is_tenant_member(tenant_id, auth.uid())
    );

DROP POLICY IF EXISTS audit_logs_update_super_admin ON public.audit_logs;
CREATE POLICY audit_logs_update_super_admin ON public.audit_logs
    FOR UPDATE TO authenticated
    USING (public.is_super_admin(auth.uid()))
    WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS audit_logs_delete_super_admin ON public.audit_logs;
CREATE POLICY audit_logs_delete_super_admin ON public.audit_logs
    FOR DELETE TO authenticated
    USING (public.is_super_admin(auth.uid()));
