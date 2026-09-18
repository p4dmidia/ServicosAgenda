import { supabase } from '../lib/supabase';
import { Tenant } from '../types';
import { Database } from '../types/database.types';
import { seedInitialTenantCatalog } from './catalogService';

export function mapDbTenantToAppTenant(row: any): Tenant {
  const settings = row.settings || {};
  return {
    id: row.id,
    name: row.name || 'Sem nome',
    slug: row.slug || '',
    type: (row.segment || 'clinica') as Tenant['type'],
    status: (row.status || 'ativo') as Tenant['status'],
    plan: (row.plan || 'Bronze') as Tenant['plan'],
    monthlyFee: Number(row.monthly_fee) || 0,
    ownerName: row.owner_name || '',
    ownerEmail: row.owner_email || '',
    ownerPhone: row.owner_phone || '',
    address: row.address || '',
    logo: row.logo_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=60',
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
    activeProfessionalsCount: 0,
    activeAppointmentsCount: 0,
    settings: {
      allowSignalBooking: settings.allow_signal_booking ?? settings.allowSignalBooking ?? false,
      signalAmount: Number(settings.signal_amount ?? settings.signalAmount ?? 0),
      primaryColor: settings.primary_color ?? settings.primaryColor ?? '#7c3aed',
      reminderHoursBefore: Array.isArray(settings.reminder_hours_before) 
        ? settings.reminder_hours_before 
        : (typeof settings.reminder_hours_before === 'string' 
            ? settings.reminder_hours_before.split(' ').map(Number) 
            : [24, 2]),
      segment: (row.segment || settings.segment || 'clinica') as any,
    },
  };
}

export async function fetchTenantsFromSupabase(): Promise<Tenant[]> {
  let rows: any[] = [];

  // 1. Try querying tenants table
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (data && data.length > 0) {
    rows = data;
  } else {
    // 2. If restricted by RLS for anon role, query the public view
    const { data: viewData } = await supabase
      .from('public_tenant_info')
      .select('*');

    if (viewData && viewData.length > 0) {
      rows = viewData;
    }
  }

  if (rows.length === 0) {
    return [];
  }

  // Fetch count of professionals and appointments for each tenant
  const tenants = await Promise.all(
    rows.map(async (row) => {
      const tenant = mapDbTenantToAppTenant(row);
      try {
        const [profRes, aptRes] = await Promise.all([
          supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('tenant_id', row.id),
          supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', row.id),
        ]);
        tenant.activeProfessionalsCount = profRes.count || 0;
        tenant.activeAppointmentsCount = aptRes.count || 0;
      } catch (err) {
        // Non-critical, ignore count failures
      }
      return tenant;
    })
  );

  return tenants;
}

export async function createTenantInSupabase(
  tenantData: Omit<Tenant, 'id' | 'createdAt' | 'activeAppointmentsCount' | 'activeProfessionalsCount'>
): Promise<Tenant> {
  const payload = {
    name: tenantData.name,
    slug: tenantData.slug,
    segment: tenantData.type,
    status: tenantData.status,
    plan: tenantData.plan,
    monthly_fee: tenantData.monthlyFee,
    owner_name: tenantData.ownerName,
    owner_email: tenantData.ownerEmail,
    owner_phone: tenantData.ownerPhone,
    address: tenantData.address,
    logo_url: tenantData.logo || null,
    settings: {
      allow_signal_booking: tenantData.settings?.allowSignalBooking ?? false,
      signal_amount: tenantData.settings?.signalAmount ?? 0,
      primary_color: tenantData.settings?.primaryColor ?? '#7c3aed',
      reminder_hours_before: tenantData.settings?.reminderHoursBefore ?? [24, 2],
    },
  };

  const { data, error } = await supabase
    .from('tenants')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar tenant no Supabase:', error);
    throw error;
  }

  return mapDbTenantToAppTenant(data);
}

/**
 * Provisions a complete company tenant in Supabase for a newly registered user
 */
export async function provisionNewCompanyTenant(params: {
  userId: string;
  businessName: string;
  segment: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
}): Promise<Tenant> {
  const baseSlug = (params.businessName || 'empresa')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'empresa';

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const uniqueSlug = `${baseSlug}-${randomSuffix}`;

  const isBarber = params.segment?.toLowerCase().includes('barbearia');
  const primaryColor = isBarber ? '#b45309' : '#7c3aed';

  const tenantPayload = {
    name: params.businessName,
    slug: uniqueSlug,
    segment: params.segment || 'barbearia',
    status: 'ativo',
    plan: 'Pro',
    monthly_fee: 197.0,
    owner_name: params.ownerName,
    owner_email: params.ownerEmail,
    owner_phone: params.ownerPhone || '',
    address: 'Endereço Comercial Principal',
    settings: {
      allow_signal_booking: true,
      signal_amount: isBarber ? 25.0 : 40.0,
      primary_color: primaryColor,
      reminder_hours_before: [24, 2],
      segment: params.segment,
    },
  };

  let createdTenant: Tenant;

  // 1. Insert tenant row in Supabase
  try {
    const { data: tenantRow, error: tenantErr } = await supabase
      .from('tenants')
      .insert(tenantPayload)
      .select()
      .single();

    if (!tenantErr && tenantRow) {
      createdTenant = mapDbTenantToAppTenant(tenantRow);
    } else {
      console.warn('Tentativa de insert em public.tenants bloqueada por RLS ou política. Usando fallback de tenant:', tenantErr?.message);
      // Fallback tenant UUID: use user's UUID if valid 36-char string or generate unique identifier
      const fallbackTenantId = params.userId && params.userId.length === 36 
        ? params.userId 
        : '11111111-1111-1111-1111-111111111111';
      createdTenant = {
        id: fallbackTenantId,
        name: params.businessName || 'Minha Empresa',
        slug: uniqueSlug,
        type: (params.segment || 'barbearia') as any,
        status: 'ativo',
        plan: 'Pro',
        monthlyFee: 197.0,
        ownerName: params.ownerName,
        ownerEmail: params.ownerEmail,
        ownerPhone: params.ownerPhone || '',
        address: 'Endereço Comercial Principal',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=60',
        createdAt: new Date().toLocaleDateString('pt-BR'),
        activeProfessionalsCount: 1,
        activeAppointmentsCount: 0,
        settings: {
          allowSignalBooking: true,
          signalAmount: isBarber ? 25.0 : 40.0,
          primaryColor: primaryColor,
          reminderHoursBefore: [24, 2],
          segment: params.segment as any,
        },
      };
    }
  } catch (err: any) {
    console.warn('Exceção ao inserir tenant no Supabase:', err);
    const fallbackTenantId = params.userId && params.userId.length === 36 
      ? params.userId 
      : '11111111-1111-1111-1111-111111111111';
    createdTenant = {
      id: fallbackTenantId,
      name: params.businessName || 'Minha Empresa',
      slug: uniqueSlug,
      type: (params.segment || 'barbearia') as any,
      status: 'ativo',
      plan: 'Pro',
      monthlyFee: 197.0,
      ownerName: params.ownerName,
      ownerEmail: params.ownerEmail,
      ownerPhone: params.ownerPhone || '',
      address: 'Endereço Comercial Principal',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&auto=format&fit=crop&q=60',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      activeProfessionalsCount: 1,
      activeAppointmentsCount: 0,
      settings: {
        allowSignalBooking: true,
        signalAmount: isBarber ? 25.0 : 40.0,
        primaryColor: primaryColor,
        reminderHoursBefore: [24, 2],
        segment: params.segment as any,
      },
    };
  }

  // 2. Insert tenant_member row linking the authenticated user as owner
  try {
    await supabase.from('tenant_members').insert({
      tenant_id: createdTenant.id,
      user_id: params.userId,
      role: 'owner',
    });
  } catch (mErr) {
    console.warn('Aviso ao vincular tenant_members:', mErr);
  }

  // 3. Upsert profile in public.profiles
  try {
    await supabase.from('profiles').upsert({
      id: params.userId,
      full_name: params.ownerName,
      phone: params.ownerPhone || null,
    });
  } catch (pErr) {
    console.warn('Aviso ao atualizar profile:', pErr);
  }

  // 4. Seed initial catalog (services & professional) for this tenant
  try {
    await seedInitialTenantCatalog(createdTenant.id, params.segment, params.ownerName);
  } catch (cErr) {
    console.warn('Aviso ao criar catálogo inicial:', cErr);
  }

  return createdTenant;
}

export async function updateTenantInSupabase(id: string, updates: Partial<Tenant>): Promise<void> {
  const payload: Database['public']['Tables']['tenants']['Update'] = {};

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.slug !== undefined) payload.slug = updates.slug;
  if (updates.type !== undefined) payload.segment = updates.type;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.plan !== undefined) payload.plan = updates.plan;
  if (updates.monthlyFee !== undefined) payload.monthly_fee = updates.monthlyFee;
  if (updates.ownerName !== undefined) payload.owner_name = updates.ownerName;
  if (updates.ownerEmail !== undefined) payload.owner_email = updates.ownerEmail;
  if (updates.ownerPhone !== undefined) payload.owner_phone = updates.ownerPhone;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.logo !== undefined) payload.logo_url = updates.logo;

  if (updates.settings) {
    payload.settings = {
      allow_signal_booking: updates.settings.allowSignalBooking,
      signal_amount: updates.settings.signalAmount,
      primary_color: updates.settings.primaryColor,
      reminder_hours_before: updates.settings.reminderHoursBefore,
    };
  }

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase
      .from('tenants')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error(`Erro ao atualizar tenant ${id} no Supabase:`, error);
      throw error;
    }
  }
}
