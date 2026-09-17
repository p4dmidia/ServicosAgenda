import { supabase } from '../lib/supabase';
import { Tenant } from '../types';
import { Database } from '../types/database.types';

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
