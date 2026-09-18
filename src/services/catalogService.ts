import { supabase } from '../lib/supabase';
import { ServiceItem, Professional } from '../types';

export const BARBERSHOP_SERVICES_DEFAULT: Array<Omit<ServiceItem, 'id' | 'tenantId'>> = [
  {
    name: 'Corte Tradicional na Tesoura & Máquina',
    category: 'Cabelo',
    duration: '40 min',
    price: 65,
    description: 'Corte personalizado com finalização e lavagem especial com produtos premium.',
  },
  {
    name: 'Barboterapia & Toalha Quente',
    category: 'Barba',
    duration: '35 min',
    price: 55,
    description: 'Design de barba com navalha, toalha quente aromática e óleos hidratantes.',
  },
  {
    name: 'Combo Completo (Cabelo + Barba)',
    category: 'Combos',
    duration: '70 min',
    price: 110,
    description: 'Experiência completa com corte, alinhamento de barba e finalização.',
  },
  {
    name: 'Camuflagem de Grisalhos',
    category: 'Tratamentos',
    duration: '30 min',
    price: 70,
    description: 'Tonalização sutil e discreta para rejuvenescimento natural dos fios.',
  },
];

export const CLINIC_SERVICES_DEFAULT: Array<Omit<ServiceItem, 'id' | 'tenantId'>> = [
  {
    name: 'Limpeza de Pele Profunda',
    category: 'Cuidados Básicos',
    duration: '60 min',
    price: 180,
    description: 'Higienização profunda com extração de cravos, vapor de ozônio e máscara calmante.',
  },
  {
    name: 'Harmonização Facial / Botox',
    category: 'Estética Avançada',
    duration: '45 min',
    price: 850,
    description: 'Procedimento estético avançado para contorno, volumização e atenuação de linhas.',
  },
  {
    name: 'Massagem Modeladora & Drenagem',
    category: 'Corporal',
    duration: '50 min',
    price: 150,
    description: 'Manobras intensas para redução de medidas aliadas à drenagem linfática.',
  },
  {
    name: 'Consulta de Avaliação Estética',
    category: 'Clínica Geral',
    duration: '30 min',
    price: 120,
    description: 'Diagnóstico clínico detalhado e prescrição de plano personalizado de cuidados.',
  },
];

export async function fetchServicesFromSupabase(tenantId?: string): Promise<ServiceItem[]> {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        tenantId: row.tenant_id,
        name: row.name,
        category: row.category || 'Geral',
        duration: `${row.duration_minutes || 30} min`,
        price: Number(row.price) || 0,
        description: row.description || '',
      }));
    }
  } catch (err) {
    console.warn('Erro ao buscar serviços do Supabase:', err);
  }

  return [];
}

export async function createServiceInSupabase(
  tenantId: string,
  service: Omit<ServiceItem, 'id' | 'tenantId'>
): Promise<ServiceItem> {
  const durationNum = parseInt(service.duration?.replace(/\D/g, '') || '30', 10);
  const payload = {
    tenant_id: tenantId,
    name: service.name,
    category: service.category || 'Geral',
    duration_minutes: durationNum,
    price: service.price,
    description: service.description || '',
    is_active: true,
  };

  const { data, error } = await supabase
    .from('services')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar serviço no Supabase:', error);
    throw error;
  }

  return {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    category: data.category,
    duration: `${data.duration_minutes} min`,
    price: Number(data.price),
    description: data.description || '',
  };
}

export async function deleteServiceInSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao inativar serviço no Supabase:', error);
    throw error;
  }
}

export async function fetchProfessionalsFromSupabase(tenantId?: string): Promise<Professional[]> {
  try {
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((row) => {
        const initials = (row.name || 'Profissional')
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        return {
          id: row.id,
          tenantId: row.tenant_id,
          name: row.name,
          role: row.role || 'Especialista',
          initials,
          activeAppointments: 0,
          capacityPercent: 75,
          colorClass: row.color_class || 'bg-purple-600',
          photo: row.photo_url || undefined,
        };
      });
    }
  } catch (err) {
    console.warn('Erro ao buscar profissionais do Supabase:', err);
  }

  return [];
}

export async function createProfessionalInSupabase(
  tenantId: string,
  prof: { name: string; role: string; phone?: string; email?: string; colorClass?: string; photo?: string }
): Promise<Professional> {
  const payload = {
    tenant_id: tenantId,
    name: prof.name,
    role: prof.role || 'Especialista',
    phone: prof.phone || null,
    email: prof.email || null,
    color_class: prof.colorClass || 'bg-purple-600',
    photo_url: prof.photo || null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from('professionals')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao cadastrar profissional no Supabase:', error);
    throw error;
  }

  const initials = (data.name || 'Profissional')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    role: data.role || 'Especialista',
    initials,
    activeAppointments: 0,
    capacityPercent: 50,
    colorClass: data.color_class || 'bg-purple-600',
    photo: data.photo_url || undefined,
  };
}

export async function deleteProfessionalInSupabase(id: string): Promise<void> {
  const { error } = await supabase
    .from('professionals')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar profissional no Supabase:', error);
    throw error;
  }
}

/**
 * Auto-provisions real seed items in Supabase for a newly registered tenant
 */
export async function seedInitialTenantCatalog(tenantId: string, segment: string, ownerName?: string): Promise<void> {
  try {
    const isBarber = segment?.toLowerCase().includes('barbearia');
    const defaultServices = isBarber ? BARBERSHOP_SERVICES_DEFAULT : CLINIC_SERVICES_DEFAULT;

    // 1. Check if services exist
    const { data: existingServices } = await supabase
      .from('services')
      .select('id')
      .eq('tenant_id', tenantId)
      .limit(1);

    if (!existingServices || existingServices.length === 0) {
      const servicesPayload = defaultServices.map((s) => ({
        tenant_id: tenantId,
        name: s.name,
        category: s.category,
        duration_minutes: parseInt(s.duration.replace(/\D/g, ''), 10) || 30,
        price: s.price,
        description: s.description,
        is_active: true,
      }));
      await supabase.from('services').insert(servicesPayload);
    }

    // 2. Check if professional exists
    const { data: existingProfs } = await supabase
      .from('professionals')
      .select('id')
      .eq('tenant_id', tenantId)
      .limit(1);

    if (!existingProfs || existingProfs.length === 0) {
      const profName = ownerName || (isBarber ? 'Barbeiro Principal' : 'Especialista Principal');
      const profRole = isBarber ? 'Barbeiro & Visagista' : 'Responsável Técnico / Especialista';
      await supabase.from('professionals').insert({
        tenant_id: tenantId,
        name: profName,
        role: profRole,
        color_class: isBarber ? 'bg-amber-600' : 'bg-purple-600',
        is_active: true,
      });
    }
  } catch (err) {
    console.warn('Aviso ao provisionar catálogo inicial do tenant:', err);
  }
}
