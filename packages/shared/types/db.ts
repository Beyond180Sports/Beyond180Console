import { Enums, Tables, TablesInsert, TablesUpdate } from "./supabase";

export type User = Tables<"User">;
export type UserInsert = TablesInsert<"User">;
export type UserUpdate = TablesUpdate<"User">;

export type Team = Tables<"Team">;
export type PlayerRecord = Tables<"PlayerRecord">;
export type TeamJoinRequest = Tables<"TeamJoinRequest">;
export type SubTeam = Tables<"SubTeam">;
export type SubTeamInsert = TablesInsert<"SubTeam">;

export type Sport = Enums<"Sport">;
export type RosterPricingTier = Enums<"RosterPricingTier">;
export type RequestType = Enums<"RequestType">;
export type UserRole = Enums<"UserRole">;
export type EventType = Enums<"EventType">;
export type TeamColor = Enums<"TeamColor">;
export type GameEventType = Enums<"GameEventType">;
export type HouseMarker = Tables<"HouseMarker">;
export type HouseMarkerInsert = TablesInsert<"HouseMarker">;

export type Event = Tables<"Event">;
export type EventInsert = TablesInsert<"Event">;
export type EventUpdate = TablesUpdate<"Event">;

export type GameStat = Tables<"GameStat">;
export type GameStatInsert = TablesInsert<"GameStat">;
export type GameStatUpdate = TablesUpdate<"GameStat">;

export type PlayerGameStat = Tables<"PlayerGameStat">;
export type PlayerGameStatInsert = TablesInsert<"PlayerGameStat">;
export type PlayerGameStatUpdate = TablesUpdate<"PlayerGameStat">;

export type EventLink = Tables<"EventLink">;
export type EventLinkInsert = TablesInsert<"EventLink">;
export type EventLinkUpdate = TablesUpdate<"EventLink">;

export type GameEvent = Tables<"GameEvent">;
export type GameEventInsert = TablesInsert<"GameEvent">;
export type GameEventUpdate = TablesUpdate<"GameEvent">;
export type EventOwner = Enums<"EventOwner">;
