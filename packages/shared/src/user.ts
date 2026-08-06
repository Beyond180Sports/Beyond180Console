import { supabase } from './supabase';

const DELETE_ACCOUNT_TIMEOUT_MS = 10_000;

function deleteAccountEdgeFunctionUrl(): string {
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!base) {
    throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL');
  }
  return `${base}/functions/v1/delete-account`;
}

/**
 * Permanently deletes a user account and associated data.
 * Mirrors Coach180's deleteUserAccount flow:
 * 1. Delete auth user via Edge Function
 * 2. Remove from team staff/fan lists
 * 3. Delete team join requests
 * 4. Unlink player records (preserve records)
 * 5. Delete User profile row
 * 6. Sign out locally
 */
export async function deleteUserAccount(
  userId: string,
  userEmail: string,
): Promise<{ success: true; error: null } | { success: false; error: Error }> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (session?.access_token && !sessionError) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), DELETE_ACCOUNT_TIMEOUT_MS);

      try {
        const response = await fetch(deleteAccountEdgeFunctionUrl(), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user?.id ?? userId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          try {
            await response.json();
          } catch {
            // Ignore body parse errors; continue with DB cleanup.
          }
        }
      } catch {
        clearTimeout(timeoutId);
        // Continue with DB cleanup even if Edge Function call fails/times out.
      }
    }

    const { data: playerRecords, error: playerRecordsError } = await supabase
      .from('PlayerRecord')
      .select('id, teamId')
      .eq('userId', userId);

    if (playerRecordsError && playerRecordsError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch player records: ${playerRecordsError.message}`);
    }

    const lowerEmail = userEmail.toLowerCase();

    const { data: teams, error: teamsError } = await supabase
      .from('Team')
      .select('id, staff, fans')
      .or(`staff.cs.{${lowerEmail}},fans.cs.{${lowerEmail}}`);

    if (teamsError && teamsError.code !== 'PGRST116') {
      // Non-fatal: continue deletion.
    } else if (teams && teams.length > 0) {
      for (const team of teams) {
        const updatedStaff = (team.staff ?? []).filter((email) => email !== lowerEmail);
        const updatedFans = (team.fans ?? []).filter((email) => email !== lowerEmail);

        const { error: teamUpdateError } = await supabase
          .from('Team')
          .update({
            staff: updatedStaff,
            fans: updatedFans,
          })
          .eq('id', team.id);

        if (teamUpdateError) {
          // Non-fatal: continue deletion.
        }
      }
    }

    const { error: joinRequestsError } = await supabase
      .from('TeamJoinRequest')
      .delete()
      .eq('userId', userId);

    if (joinRequestsError && joinRequestsError.code !== 'PGRST116') {
      // Non-fatal: continue deletion.
    }

    if (playerRecords && playerRecords.length > 0) {
      const { error: unlinkError } = await supabase
        .from('PlayerRecord')
        .update({ userId: null })
        .eq('userId', userId);

      if (unlinkError) {
        // Non-fatal: continue deletion.
      }
    }

    const { error: userDeleteError } = await supabase.from('User').delete().eq('id', userId);

    if (userDeleteError) {
      throw new Error(`Failed to delete user profile: ${userDeleteError.message}`);
    }

    await supabase.auth.signOut();

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error
          : new Error('Unknown error occurred during account deletion'),
    };
  }
}
