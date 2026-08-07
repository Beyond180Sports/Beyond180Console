import type { HouseMarker, HouseMarkerInsert } from '../types/db';
import { supabase } from './supabase';

export async function saveHouseMarker(
  marker: HouseMarkerInsert,
): Promise<HouseMarker> {
  const { data, error } = await supabase
    .from('HouseMarker')
    .insert(marker)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateHouseMarker(
  id: string,
  updates: Partial<HouseMarkerInsert>,
): Promise<HouseMarker> {
  const { data, error } = await supabase
    .from('HouseMarker')
    .update({ ...updates, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteHouseMarker(id: string): Promise<void> {
  const { error } = await supabase.from('HouseMarker').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

export async function getPlayerRecentHouseMarkers(
  playerRecordId: string,
  teamId: string,
  limit = 2,
): Promise<HouseMarker[]> {
  const { data, error } = await supabase
    .from('HouseMarker')
    .select('*')
    .eq('playerRecordId', playerRecordId)
    .eq('teamId', teamId)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getPlayerLatestHouseMarker(
  playerRecordId: string,
  teamId: string,
): Promise<HouseMarker | null> {
  const markers = await getPlayerRecentHouseMarkers(playerRecordId, teamId, 1);
  return markers[0] ?? null;
}

export async function getTeamHouseMarkers(
  teamId: string,
): Promise<HouseMarker[]> {
  const { data, error } = await supabase
    .from('HouseMarker')
    .select('*')
    .eq('teamId', teamId)
    .order('createdAt', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}
