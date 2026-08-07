import type { HouseMarker } from '@beyond180/shared';

export type PlayerPosition = {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  date?: Date;
  opacity?: number;
  initial?: string;
  playerRecordId: string;
};

export type HouseBoardProps = {
  teamId: string;
};

export type FilterOption = {
  id: string;
  label: string;
  subtitle?: string;
};

export type { HouseMarker };
