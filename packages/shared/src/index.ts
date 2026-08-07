export { supabase } from './supabase';
export {
  fetchUserProfile,
  getSessionProfile,
  passwordResetRateLimitRemainingMs,
  requestPasswordReset,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  signOut,
  type AuthProfile,
} from './auth';
export { deleteUserAccount } from './user';
export {
  DEMO_STAFF_EMAIL,
  fetchStaffSquads,
  type SquadRecord,
} from './squads';
export { fetchSquadSubTeams, type SubTeamOption } from './subteams';
export { squadColorHex } from './teamColors';
export {
  fetchGameStatTimeSeries,
  type GameStatEvent,
  type GameStatTimePoint,
} from './gameStats';
export { parseCSV, validateCSV, type PlayerData } from './csvUtils';
export {
  checkDuplicatePlayerEmails,
  savePlayersToTeam,
} from './playerUpload';
