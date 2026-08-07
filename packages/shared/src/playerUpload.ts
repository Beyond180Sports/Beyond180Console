import type { TablesInsert } from '../types/supabase';
import type { PlayerData } from './csvUtils';
import { supabase } from './supabase';

/**
 * Checks for duplicate player emails in a team.
 * Returns unique players and duplicate emails.
 */
export async function checkDuplicatePlayerEmails(
  teamId: string | undefined,
  players: PlayerData[],
): Promise<{
  uniquePlayers: PlayerData[];
  duplicateEmails: string[];
}> {
  if (!teamId || players.length === 0) {
    return { uniquePlayers: players, duplicateEmails: [] };
  }

  try {
    const emails = players.map((player) => player.email.toLowerCase());

    const { data: existingPlayers, error } = await supabase
      .from('PlayerRecord')
      .select('email')
      .eq('teamId', teamId)
      .in('email', emails);

    if (error) {
      throw error;
    }

    const existingEmails = (existingPlayers ?? [])
      .map((p) => p.email)
      .filter((email): email is string => Boolean(email));

    const existingEmailSet = new Set(
      existingEmails.map((email) => email.toLowerCase()),
    );

    const uniquePlayers = players.filter(
      (player) => !existingEmailSet.has(player.email.toLowerCase()),
    );

    return {
      uniquePlayers,
      duplicateEmails: existingEmails,
    };
  } catch {
    return { uniquePlayers: players, duplicateEmails: [] };
  }
}

/**
 * Saves players to the database for a team.
 * Power Admin path: does not enforce plan capacity limits.
 * Note: live PlayerRecord schema does not include `phone`.
 */
export async function savePlayersToTeam(
  teamId: string | undefined,
  players: PlayerData[],
): Promise<{
  success: boolean;
  message?: string;
}> {
  if (!teamId) {
    return {
      success: false,
      message: 'Missing Team ID',
    };
  }

  if (players.length === 0) {
    return {
      success: false,
      message: 'No players to add',
    };
  }

  try {
    const playerRecords: TablesInsert<'PlayerRecord'>[] = players.map(
      (player) => {
        const record: TablesInsert<'PlayerRecord'> = {
          firstName: player.firstName,
          lastName: player.lastName,
          email: player.email,
          teamId,
          jerseyNumber: player.number,
        };

        if (player.emergencyEmail != null) {
          record.emergencyEmail = player.emergencyEmail;
        }
        if (player.emergencyPhone != null) {
          record.emergencyPhone = player.emergencyPhone;
        }
        if (player.heightCm != null) {
          record.heightCm = player.heightCm;
        }
        if (player.weightKg != null) {
          record.weightKg = player.weightKg;
        }
        if (player.birthYear != null) {
          record.birthYear = player.birthYear;
        }

        return record;
      },
    );

    const { error } = await supabase.from('PlayerRecord').insert(playerRecords);

    if (error) {
      return {
        success: false,
        message: error.message || 'Failed to add players to the team',
      };
    }

    return {
      success: true,
      message: `Added ${players.length} players to the team`,
    };
  } catch {
    return {
      success: false,
      message: 'Something went wrong while adding players',
    };
  }
}
