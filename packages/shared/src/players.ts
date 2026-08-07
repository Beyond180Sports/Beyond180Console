import type { PlayerRecord } from '../types/db';
import { supabase } from './supabase';

export async function fetchTeamPlayers(
  teamId: string,
): Promise<PlayerRecord[]> {
  const { data, error } = await supabase
    .from('PlayerRecord')
    .select('*')
    .eq('teamId', teamId)
    .order('lastName', { ascending: true })
    .order('firstName', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
