import type { SubTeam, Team } from '../types/db';
import { supabase } from './supabase';

/** Temporary hardcoded staff identity until auth is wired up. */
export const DEMO_STAFF_EMAIL = 'matthew.riley2471@gmail.com';

export type SquadRecord = Team & {
  SubTeam: Pick<SubTeam, 'id' | 'name' | 'leagueName'>[];
  leagues: string[];
};

function leagueLabel(subTeam: Pick<SubTeam, 'name' | 'leagueName'>): string | null {
  const fromLeague = subTeam.leagueName?.trim();
  if (fromLeague) {
    return fromLeague;
  }
  const fromName = subTeam.name?.trim();
  return fromName || null;
}

export async function fetchStaffSquads(staffEmail: string): Promise<SquadRecord[]> {
  const { data, error } = await supabase
    .from('Team')
    .select('*, SubTeam(id, name, leagueName)')
    .contains('staff', [staffEmail])
    .is('deletedAt', null)
    .order('order', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((team) => {
    const subTeams = team.SubTeam ?? [];
    const leagues = [
      ...new Set(
        subTeams
          .map(leagueLabel)
          .filter((name): name is string => Boolean(name)),
      ),
    ];

    return {
      ...team,
      SubTeam: subTeams,
      leagues,
    };
  });
}
