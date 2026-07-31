import type { Event, GameStat } from '../types/db';
import { supabase } from './supabase';

export type GameStatEvent = Pick<
  Event,
  'id' | 'startDateTime' | 'subTeamId' | 'opponent' | 'type'
>;

export type GameStatTimePoint = GameStat & {
  Event: GameStatEvent & { startDateTime: string };
};

export async function fetchGameStatTimeSeries(
  squadId: string,
  subTeamIds: string[],
): Promise<GameStatTimePoint[]> {
  if (subTeamIds.length === 0) {
    return [];
  }

  const { data: events, error: eventsError } = await supabase
    .from('Event')
    .select('id, startDateTime, subTeamId, opponent, type')
    .eq('teamId', squadId)
    .eq('type', 'GAME')
    .in('subTeamId', subTeamIds)
    .not('startDateTime', 'is', null);

  if (eventsError) {
    throw eventsError;
  }

  const gameEvents = (events ?? []).filter(
    (event): event is GameStatEvent & { startDateTime: string } =>
      Boolean(event.startDateTime),
  );

  if (gameEvents.length === 0) {
    return [];
  }

  const eventById = new Map(gameEvents.map((event) => [event.id, event]));
  const eventIds = gameEvents.map((event) => event.id);

  const { data: stats, error: statsError } = await supabase
    .from('GameStat')
    .select('*')
    .eq('teamId', squadId)
    .in('eventId', eventIds);

  if (statsError) {
    throw statsError;
  }

  return (stats ?? [])
    .flatMap((stat) => {
      const event = eventById.get(stat.eventId);
      if (!event) {
        return [];
      }
      return [{ ...stat, Event: event }];
    })
    .sort((a, b) => {
      const aTime = new Date(a.Event.startDateTime).getTime();
      const bTime = new Date(b.Event.startDateTime).getTime();
      return aTime - bTime;
    });
}
