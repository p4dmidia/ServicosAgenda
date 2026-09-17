import { supabase } from '../lib/supabase';
import { ServiceItem, Professional } from '../types';

const CLINIC_SERVICES_FALLBACK: ServiceItem[] = [
  {
    id: 'srv-bv-1',
    name: 'Harmonização Facial Completa',
    category: 'Estética Avançada',
    duration: '90 min',
    price: 1800,
    description: 'Protocolo personalizado com ácido hialurônico para volumização e contorno facial.',
  },
  {
    id: 'srv-bv-2',
    name: 'Bioestimulador de Colágeno',
    category: 'Estética Avançada',
    duration: '60 min',
    price: 1400,
    description: 'Estímulo de neocolagênese para rejuvenescimento e firmeza tecidual.',
  },
  {
    id: 'srv-bv-3',
    name: 'Limpeza de Pele Profunda',
    category: 'Cuidados Básicos',
    duration: '60 min',
    price: 240,
    description: 'Extração por sucção, alta frequência e máscara calmante hidrolipídica.',
  },
  {
    id: 'srv-bv-4',
    name: 'Peeling Químico Renovador',
    category: 'Dermatologia',
    duration: '45 min',
    price: 450,
    description: 'Renovação celular intensa para uniformização de tom e textura.',
  },
  {
    id: 'srv-bv-5',
    name: 'Consulta Dermatológica',
    category: 'Clínica Geral',
    duration: '45 min',
    price: 350,
    description: 'Diagnóstico clínico detalhado e prescrição de rotina médica de skincare.',
  },
];

const BARBERSHOP_SERVICES_FALLBACK: ServiceItem[] = [
  {
    id: 'srv-dc-1',
    name: 'Corte Tradicional na Tesoura & Máquina',
    category: 'Cabelo',
    duration: '40 min',
    price: 65,
    description: 'Corte personalizado com finalização e lavagem especial com produtos premium.',
  },
  {
    id: 'srv-dc-2',
    name: 'Barboterapia & Toalha Quente',
    category: 'Barba',
    duration: '35 min',
    price: 55,
    description: 'Design de barba com navalha, toalha quente aromática e óleos hidratantes.',
  },
  {
    id: 'srv-dc-3',
    name: 'Combo Dom Camilo (Cabelo + Barba)',
    category: 'Combos VIP',
    duration: '70 min',
    price: 110,
    description: 'Experiência completa com corte, alinhamento de barba e cerveja artesanal.',
  },
  {
    id: 'srv-dc-4',
    name: 'Camuflagem de Grisalhos',
    category: 'Tratamentos',
    duration: '30 min',
    price: 70,
    description: 'Tonalização sutil e discreta para rejuvenescimento natural dos fios.',
  },
  {
    id: 'srv-dc-5',
    name: 'Limpeza de Pele Express Masculina',
    category: 'Estética Masculina',
    duration: '30 min',
    price: 80,
    description: 'Esfoliação com carvão ativado, máscara preta e hidratação com filtro solar.',
  },
];

const CLINIC_PROFESSIONALS_FALLBACK: Professional[] = [
  {
    id: 'prof-bv-1',
    name: 'Dra. Fernanda Lins',
    role: 'Biomédica Esteta',
    initials: 'FL',
    activeAppointments: 6,
    capacityPercent: 85,
    colorClass: 'bg-purple-600',
    photo: 'https://images.unsplash.com/photo-1594824813572-c2cb006c3eb9?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'prof-bv-2',
    name: 'Dr. Rafael Moreira',
    role: 'Dermatologista Clínico',
    initials: 'RM',
    activeAppointments: 4,
    capacityPercent: 70,
    colorClass: 'bg-indigo-600',
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'prof-bv-3',
    name: 'Dra. Camila Duarte',
    role: 'Harmonizadora Facial',
    initials: 'CD',
    activeAppointments: 3,
    capacityPercent: 60,
    colorClass: 'bg-pink-600',
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=60',
  },
];

const BARBERSHOP_PROFESSIONALS_FALLBACK: Professional[] = [
  {
    id: 'prof-dc-1',
    name: 'Camilo Augusto (Mestre Barbeiro)',
    role: 'Barbeiro Chefe & Visagista',
    initials: 'CA',
    activeAppointments: 8,
    capacityPercent: 90,
    colorClass: 'bg-amber-700',
    photo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'prof-dc-2',
    name: 'Marcos Silva (Navalha de Ouro)',
    role: 'Especialista em Degrade & Freestyle',
    initials: 'MS',
    activeAppointments: 5,
    capacityPercent: 75,
    colorClass: 'bg-orange-700',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
  },
  {
    id: 'prof-dc-3',
    name: 'Lucas Pires',
    role: 'Barbeiro & Cuidados com Barba',
    initials: 'LP',
    activeAppointments: 4,
    capacityPercent: 65,
    colorClass: 'bg-stone-700',
  },
];

export async function fetchServicesFromSupabase(tenantId?: string, segment?: string): Promise<ServiceItem[]> {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

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
    console.warn('Erro ao buscar serviços do Supabase, aplicando fallback:', err);
  }

  // Fallback baseado no tenant / segmento
  if (tenantId === '22222222-2222-2222-2222-222222222222' || segment === 'barbearia') {
    return BARBERSHOP_SERVICES_FALLBACK;
  }
  return CLINIC_SERVICES_FALLBACK;
}

export async function fetchProfessionalsFromSupabase(tenantId?: string, segment?: string): Promise<Professional[]> {
  try {
    let query = supabase
      .from('professionals')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

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
          capacityPercent: 80,
          colorClass: row.color_class || 'bg-purple-500',
          photo: row.photo_url || undefined,
        };
      });
    }
  } catch (err) {
    console.warn('Erro ao buscar profissionais do Supabase, aplicando fallback:', err);
  }

  // Fallback baseado no tenant / segmento
  if (tenantId === '22222222-2222-2222-2222-222222222222' || segment === 'barbearia') {
    return BARBERSHOP_PROFESSIONALS_FALLBACK;
  }
  return CLINIC_PROFESSIONALS_FALLBACK;
}

