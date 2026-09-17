import { supabase } from '../lib/supabase';
import { Appointment, AppointmentStatus } from '../types';

export function mapDbAppointmentToAppAppointment(row: any): Appointment {
  const scheduledDate = new Date(row.scheduled_at);
  const timeStr = !isNaN(scheduledDate.getTime()) 
    ? scheduledDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '09:00';
  const dateStr = !isNaN(scheduledDate.getTime())
    ? scheduledDate.toISOString().split('T')[0]
    : '';

  const initials = (row.client_name || 'Cliente')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return {
    id: row.id,
    tenantId: row.tenant_id,
    time: timeStr,
    date: dateStr,
    clientName: row.client_name,
    clientPhone: row.client_phone || '',
    clientInitials: initials,
    service: row.service_name,
    professional: row.professional_name,
    status: (row.status || 'AGENDADO') as AppointmentStatus,
    price: Number(row.price) || 0,
    duration: row.duration_minutes ? `${row.duration_minutes} min` : '45 min',
  };
}

export async function fetchAppointmentsFromSupabase(tenantId?: string): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar agendamentos do Supabase:', error);
    throw error;
  }

  return (data || []).map(mapDbAppointmentToAppAppointment);
}

export async function createAppointmentInSupabase(
  appointment: Omit<Appointment, 'id'> & { tenantId: string }
): Promise<Appointment> {
  // Parse date and time into scheduled_at timestamptz
  const todayStr = appointment.date || new Date().toISOString().split('T')[0];
  const [hours, mins] = (appointment.time || '09:00').split(':').map(Number);
  const scheduledDate = new Date(todayStr);
  scheduledDate.setHours(hours || 9, mins || 0, 0, 0);

  const durationMin = parseInt(appointment.duration?.replace(/\D/g, '') || '45', 10);

  const payload = {
    tenant_id: appointment.tenantId,
    client_name: appointment.clientName,
    client_phone: appointment.clientPhone || '',
    service_name: appointment.service,
    professional_name: appointment.professional,
    scheduled_at: scheduledDate.toISOString(),
    duration_minutes: durationMin,
    status: appointment.status || 'AGENDADO',
    price: appointment.price || 0,
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar agendamento no Supabase:', error);
    throw error;
  }

  return mapDbAppointmentToAppAppointment(data);
}

export async function updateAppointmentStatusInSupabase(
  id: string,
  newStatus: AppointmentStatus
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error(`Erro ao atualizar status do agendamento ${id}:`, error);
    throw error;
  }
}
