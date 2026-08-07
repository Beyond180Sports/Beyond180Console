import type { SubTeam } from '../types/db';
import { supabase } from './supabase';

export type SubTeamOption = Pick<
  SubTeam,
  'id' | 'name' | 'leagueName' | 'teamId' | 'playerIds'
>;

export async function fetchSquadSubTeams(squadId: string): Promise<SubTeamOption[]> {
  const { data, error } = await supabase
    .from('SubTeam')
    .select('id, name, leagueName, teamId, playerIds')
    .eq('teamId', squadId)
    .order('order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}
