import { supabase } from '../lib/supabase';
import { Client } from '../types';

export function mapDbClientToAppClient(row: any): Client {
  const initials = (row.name || 'Cliente')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name || 'Sem nome',
    phone: row.phone || '',
    email: row.email || '',
    photo: row.photo_url || undefined,
    initials: initials || 'CL',
    lastVisit: row.updated_at ? new Date(row.updated_at).toLocaleDateString('pt-BR') : 'Hoje',
    totalSpent: 0,
    status: (row.status || 'Novo') as Client['status'],
    favoriteService: row.notes || 'Procedimento Padrão',
  };
}

export async function fetchClientsFromSupabase(tenantId?: string): Promise<Client[]> {
  let query = supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar clientes do Supabase:', error);
    throw error;
  }

  return (data || []).map(mapDbClientToAppClient);
}

export async function createClientInSupabase(
  clientData: {
    tenantId: string;
    name: string;
    phone: string;
    email?: string;
    favoriteService?: string;
    notes?: string;
  }
): Promise<Client> {
  const payload = {
    tenant_id: clientData.tenantId,
    name: clientData.name,
    phone: clientData.phone,
    email: clientData.email || null,
    notes: clientData.favoriteService || clientData.notes || null,
    status: 'Novo',
  };

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao cadastrar cliente no Supabase:', error);
    throw error;
  }

  return mapDbClientToAppClient(data);
}
