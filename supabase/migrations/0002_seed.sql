-- ==============================================================================
-- SERVIÇOS AGENDA - MIGRATION 0002: SEED DE DADOS INICIAIS
-- Carga controlada para testes de homologação, portais e agendamento online
-- ==============================================================================

-- 1. TENANTS DE DEMONSTRAÇÃO COM SLUGS ÚNICOS
INSERT INTO public.tenants (
    id,
    name,
    slug,
    segment,
    status,
    plan,
    monthly_fee,
    owner_name,
    owner_email,
    owner_phone,
    address,
    settings
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Clínica Bella Vita - Estética Avançada',
    'bella-vita',
    'clinica',
    'ativo',
    'Pro',
    297.00,
    'Dra. Mariane Silveira',
    'mariane@bellavita.com.br',
    '+5511984521100',
    'Av. Paulista, 1200 - Sala 42, Bela Vista - São Paulo/SP',
    '{
        "allow_signal_booking": true,
        "signal_amount": 50.00,
        "primary_color": "#7c3aed",
        "reminder_hours_before": [24, 2]
    }'::jsonb
),
(
    '22222222-2222-2222-2222-222222222222',
    'Barbearia Dom Camilo',
    'dom-camilo',
    'barbearia',
    'ativo',
    'Ouro',
    197.00,
    'Camilo Augusto',
    'camilo@domcamilo.com.br',
    '+5511972004411',
    'Rua Augusta, 850, Consolação - São Paulo/SP',
    '{
        "allow_signal_booking": true,
        "signal_amount": 25.00,
        "primary_color": "#b45309",
        "reminder_hours_before": [24, 1]
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. SERVIÇOS INICIAIS (CLÍNICA BELLA VITA)
INSERT INTO public.services (
    tenant_id,
    name,
    category,
    duration_minutes,
    price,
    description,
    is_active
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Limpeza de Pele Profunda',
    'Facial',
    60,
    180.00,
    'Higienização profunda com extração de cravos, vapor de ozônio e máscara calmante.',
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Botox Facial (Área Completa)',
    'Injetáveis',
    45,
    950.00,
    'Aplicação de toxina botulínica para linhas de expressão (testa, glabela e pés de galinha).',
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Massagem Modeladora & Drenagem',
    'Corporal',
    50,
    140.00,
    'Manobras intensas para redução de medidas aliadas à drenagem linfática para retenção.',
    true
)
ON CONFLICT DO NOTHING;

-- 3. SERVIÇOS INICIAIS (BARBEARIA DOM CAMILO)
INSERT INTO public.services (
    tenant_id,
    name,
    category,
    duration_minutes,
    price,
    description,
    is_active
) VALUES
(
    '22222222-2222-2222-2222-222222222222',
    'Corte Degradê na Tesoura & Máquina',
    'Cabelo',
    35,
    65.00,
    'Corte contemporâneo com acabamento navalhado e lavagem inclusa.',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Barboterapia Tradicional com Toalha Quente',
    'Barba',
    40,
    55.00,
    'Desenho da barba, esfoliação, toalha quente, óleo especial e massagem facial.',
    true
)
ON CONFLICT DO NOTHING;

-- 4. PROFISSIONAIS DE DEMONSTRAÇÃO
INSERT INTO public.professionals (
    tenant_id,
    name,
    role,
    phone,
    color_class,
    is_active
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Dra. Fernanda Lins',
    'Dermatologista & Biomédica',
    '+5511988880001',
    'bg-purple-500',
    true
),
(
    '11111111-1111-1111-1111-111111111111',
    'Dra. Camila Duarte',
    'Fisioterapeuta Dermato-Funcional',
    '+5511988880002',
    'bg-emerald-500',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Camilo Augusto',
    'Master Barber',
    '+5511977770001',
    'bg-amber-600',
    true
)
ON CONFLICT DO NOTHING;

-- 5. PLANOS DE ASSINATURA RECORRENTE (CLUBE)
INSERT INTO public.subscription_plans (
    tenant_id,
    name,
    category,
    price,
    interval,
    description,
    included_services,
    max_sessions_per_month,
    is_active
) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Clube Pele de Seda (Mensal)',
    'Estética Facial',
    199.00,
    'mensal',
    '1 Limpeza de pele profunda + 2 hidratações faciais completas por mês.',
    '["Limpeza de Pele Profunda", "Hidratação Facial"]'::jsonb,
    3,
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'Clube Barba & Cabelo Ilimitado',
    'Assinatura Barber',
    149.00,
    'mensal',
    'Corte e barba livres no mês com agendamento prioritário e 10% em pomadas.',
    '["Corte Degradê", "Barboterapia"]'::jsonb,
    99,
    true
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- GUIA: COMO PROMOVER SEU PRIMEIRO USUÁRIO A SUPER ADMIN OU DONO DE TENANT
-- ==============================================================================
-- Após criar seu usuário pelo painel Auth do Supabase ou na tela de cadastro da aplicação,
-- copie o "User UID" gerado em Authentication > Users e execute uma das queries abaixo:
--
-- 1) Para torná-lo SUPER ADMIN do Serviços Agenda:
--    INSERT INTO public.super_admins (user_id, notes)
--    VALUES ('SEU-UUID-AQUI', 'Administrador Principal');
--
-- 2) Para vinculá-lo como PROPRIETÁRIO (owner) da Clínica Bella Vita:
--    INSERT INTO public.tenant_members (tenant_id, user_id, role)
--    VALUES ('11111111-1111-1111-1111-111111111111', 'SEU-UUID-AQUI', 'owner');
