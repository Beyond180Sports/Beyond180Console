export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "12.2.3 (519615d)";
	};
	public: {
		Tables: {
			_PlayerRecordToSubTeam: {
				Row: {
					A: string;
					B: string;
				};
				Insert: {
					A: string;
					B: string;
				};
				Update: {
					A?: string;
					B?: string;
				};
				Relationships: [
					{
						foreignKeyName: "_PlayerRecordToSubTeam_A_fkey";
						columns: ["A"];
						isOneToOne: false;
						referencedRelation: "PlayerRecord";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "_PlayerRecordToSubTeam_B_fkey";
						columns: ["B"];
						isOneToOne: false;
						referencedRelation: "SubTeam";
						referencedColumns: ["id"];
					}
				];
			};
			Event: {
				Row: {
					allDay: boolean;
					createdAt: string;
					description: string | null;
					endDateTime: string | null;
					entireSquad: boolean;
					id: string;
					location: string | null;
					opponent: string | null;
					opponentColor: Database["public"]["Enums"]["TeamColor"] | null;
					publishedToPlayers: boolean;
					publishedToPlayersAt: string | null;
					publishedToPlayersBy: string | null;
					publishedToFans: boolean;
					publishedToFansAt: string | null;
					publishedToFansBy: string | null;
					recurrenceEndDate: string | null;
					recurrenceGroupId: string | null;
					recurrenceRule: string | null;
					startDateTime: string | null;
					subTeamId: string | null;
					teamId: string;
					timeZone: string | null;
					type: Database["public"]["Enums"]["EventType"];
					updatedAt: string;
				};
				Insert: {
					allDay?: boolean;
					createdAt?: string;
					description?: string | null;
					endDateTime?: string | null;
					entireSquad?: boolean;
					id?: string;
					location?: string | null;
					opponent?: string | null;
					opponentColor?: Database["public"]["Enums"]["TeamColor"] | null;
					publishedToPlayers?: boolean;
					publishedToPlayersAt?: string | null;
					publishedToPlayersBy?: string | null;
					publishedToFans?: boolean;
					publishedToFansAt?: string | null;
					publishedToFansBy?: string | null;
					recurrenceEndDate?: string | null;
					recurrenceGroupId?: string | null;
					recurrenceRule?: string | null;
					startDateTime?: string | null;
					subTeamId?: string | null;
					teamId: string;
					timeZone?: string | null;
					type: Database["public"]["Enums"]["EventType"];
					updatedAt: string;
				};
				Update: {
					allDay?: boolean;
					createdAt?: string;
					description?: string | null;
					endDateTime?: string | null;
					entireSquad?: boolean;
					id?: string;
					location?: string | null;
					opponent?: string | null;
					opponentColor?: Database["public"]["Enums"]["TeamColor"] | null;
					publishedToPlayers?: boolean;
					publishedToPlayersAt?: string | null;
					publishedToPlayersBy?: string | null;
					publishedToFans?: boolean;
					publishedToFansAt?: string | null;
					publishedToFansBy?: string | null;
					recurrenceEndDate?: string | null;
					recurrenceGroupId?: string | null;
					recurrenceRule?: string | null;
					startDateTime?: string | null;
					subTeamId?: string | null;
					teamId?: string;
					timeZone?: string | null;
					type?: Database["public"]["Enums"]["EventType"];
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "Event_subTeamId_fkey";
						columns: ["subTeamId"];
						isOneToOne: false;
						referencedRelation: "SubTeam";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "Event_teamId_fkey";
						columns: ["teamId"];
						isOneToOne: false;
						referencedRelation: "Team";
						referencedColumns: ["id"];
					}
				];
			};
			EventAvailability: {
				Row: {
					available: boolean;
					createdAt: string;
					eventId: string;
					id: string;
					note: string | null;
					playerRecordId: string;
					updatedAt: string;
				};
				Insert: {
					available: boolean;
					createdAt?: string;
					eventId: string;
					id?: string;
					note?: string | null;
					playerRecordId: string;
					updatedAt: string;
				};
				Update: {
					available?: boolean;
					createdAt?: string;
					eventId?: string;
					id?: string;
					note?: string | null;
					playerRecordId?: string;
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "EventAvailability_eventId_fkey";
						columns: ["eventId"];
						isOneToOne: false;
						referencedRelation: "Event";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "EventAvailability_playerRecordId_fkey";
						columns: ["playerRecordId"];
						isOneToOne: false;
						referencedRelation: "PlayerRecord";
						referencedColumns: ["id"];
					}
				];
			};
			StaffEventAvailability: {
				Row: {
					available: boolean;
					createdAt: string;
					eventId: string;
					id: string;
					note: string | null;
					staffEmail: string;
					updatedAt: string;
				};
				Insert: {
					available: boolean;
					createdAt?: string;
					eventId: string;
					id?: string;
					note?: string | null;
					staffEmail: string;
					updatedAt: string;
				};
				Update: {
					available?: boolean;
					createdAt?: string;
					eventId?: string;
					id?: string;
					note?: string | null;
					staffEmail?: string;
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "StaffEventAvailability_eventId_fkey";
						columns: ["eventId"];
						isOneToOne: false;
						referencedRelation: "Event";
						referencedColumns: ["id"];
					}
				];
			};
			EventPlayerSlot: {
				Row: {
					accepted: boolean | null;
					assignedAt: string | null;
					assignedBy: string | null;
					createdAt: string;
					eventId: string;
					id: string;
					playerRecordId: string | null;
					slotNumber: number;
					updatedAt: string;
				};
				Insert: {
					accepted?: boolean | null;
					assignedAt?: string | null;
					assignedBy?: string | null;
					createdAt?: string;
					eventId: string;
					id?: string;
					playerRecordId?: string | null;
					slotNumber: number;
					updatedAt: string;
				};
				Update: {
					accepted?: boolean | null;
					assignedAt?: string | null;
					assignedBy?: string | null;
					createdAt?: string;
					eventId?: string;
					id?: string;
					playerRecordId?: string | null;
					slotNumber?: number;
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "EventPlayerSlot_eventId_fkey";
						columns: ["eventId"];
						isOneToOne: false;
						referencedRelation: "Event";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "EventPlayerSlot_playerRecordId_fkey";
						columns: ["playerRecordId"];
						isOneToOne: false;
						referencedRelation: "PlayerRecord";
						referencedColumns: ["id"];
					}
				];
			};
GameStat: {
  Row: {
    id: string;
    eventId: string;
    teamId: string;
    win: Database["public"]["Enums"]["GameResult"];
    pointsFor: number;
    pointsAgainst: number;
    triesFor: number;
    triesAgainst: number;
    conversionsForMade: number;
    conversionsAgainstMade: number;
    penaltiesForMade: number;
    penaltiesAgainstMade: number;
    dropGoalsForMade: number;
    dropGoalsAgainstMade: number;
    yellowCardsFor: number;
    yellowCardsAgainst: number;
    redCardsFor: number;
    redCardsAgainst: number;
    createdAt: string;
    updatedAt: string;
    conversionsForMiss: number;
    conversionsAgainstMiss: number;
    penaltiesForMiss: number;
    penaltiesAgainstMiss: number;
    dropGoalsForMiss: number;
    dropGoalsAgainstMiss: number;
    possessionFor: number | null;
    possessionAgainst: number | null;
    scrumsForWin: number | null;
    scrumsForLoss: number | null;
    scrumsAgainstWin: number | null;
    scrumsAgainstLoss: number | null;
    scrumsResetFor: number | null;
    scrumsResetAgainst: number | null;
    scrumsOppPenFor: number | null;
    scrumsOppPenAgainst: number | null;
    scrumsOppFreeKickFor: number | null;
    scrumsOppFreeKickAgainst: number | null;
    lineoutsForWin: number | null;
    lineoutsForLoss: number | null;
    lineoutsAgainstWin: number | null;
    lineoutsAgainstLoss: number | null;
    lineoutNotStraightFor: number | null;
    lineoutNotStraightAgainst: number | null;
    lineoutOppPenFor: number | null;
    lineoutOppPenAgainst: number | null;
    lineoutOppFreeKickFor: number | null;
    lineoutOppFreeKickAgainst: number | null;
    restartRetentionFor: number | null;
    restartRetentionAgainst: number | null;
    turnoversFor: number | null;
    turnoversAgainst: number | null;
    handlingErrorsFor: number | null;
    handlingErrorsAgainst: number | null;
    offloadsFor: number | null;
    offloadsAgainst: number | null;
    threePassPhasesFor: number | null;
    threePassPhasesAgainst: number | null;
    phasesFor: number | null;
    phasesAgainst: number | null;
    kickInPlayFor: number | null;
    kickInPlayAgainst: number | null;
    kickInTouchFor: number | null;
    kickInTouchAgainst: number | null;
    boxKickFor: number | null;
    boxKickAgainst: number | null;
    offsideFor: number | null;
    offsideAgainst: number | null;
    scrumPenFor: number | null;
    scrumPenAgainst: number | null;
    breakdownPenFor: number | null;
    breakdownPenAgainst: number | null;
    foulPlayFor: number | null;
    foulPlayAgainst: number | null;
    lineoutMaulPenFor: number | null;
    lineoutMaulPenAgainst: number | null;
    missedTacklesFor: number | null;
    missedTacklesAgainst: number | null;
    madeTacklesFor: number | null;
    madeTacklesAgainst: number | null;
    carriesFor: number | null;
    carriesAgainst: number | null;
    threeSecRuckFor: number | null;
    threeSecRuckAgainst: number | null;
    fourFiveSecRuckFor: number | null;
    fourFiveSecRuckAgainst: number | null;
    fivePlusSecRuckFor: number | null;
    fivePlusSecRuckAgainst: number | null;
    gainlinePlusFor: number | null;
    gainlinePlusAgainst: number | null;
    gainlineNeutralFor: number | null;
    gainlineNeutralAgainst: number | null;
    gainlineMinusFor: number | null;
    gainlineMinusAgainst: number | null;
    linebreakLeftEdgeFor: number | null;
    linebreakLeftEdgeAgainst: number | null;
    linebreakRightEdgeFor: number | null;
    linebreakRightEdgeAgainst: number | null;
    linebreakMiddleFor: number | null;
    linebreakMiddleAgainst: number | null;
    ballInPlayHome22: number | null;
    ballInPlayHome50: number | null;
    ballInPlayAway50: number | null;
    ballInPlayAway22: number | null;
    picksFor: number | null;
    picksAgainst: number | null;
    offTenFor: number | null;
    offTenAgainst: number | null;
    offNineFor: number | null;
    offNineAgainst: number | null;
    "22EntryPointsFor": number | null;
    "22EntryNoPointsFor": number | null;
    "22EntryPointsAgainst": number | null;
    "22EntryNoPointsAgainst": number | null;
    efficientRucksFor: number | null;
    efficientRucksAgainst: number | null;
  };
  Insert: {
    id?: string;
    eventId: string;
    teamId: string;
	subTeamId?: string;
    win: Database["public"]["Enums"]["GameResult"];
    pointsFor: number;
    pointsAgainst: number;
    triesFor: number;
    triesAgainst: number;
    conversionsForMade: number;
    conversionsAgainstMade: number;
    penaltiesForMade: number;
    penaltiesAgainstMade: number;
    dropGoalsForMade: number;
    dropGoalsAgainstMade: number;
    yellowCardsFor: number;
    yellowCardsAgainst: number;
    redCardsFor: number;
    redCardsAgainst: number;
    createdAt?: string;
    updatedAt?: string;
    conversionsForMiss: number;
    conversionsAgainstMiss: number;
    penaltiesForMiss: number;
    penaltiesAgainstMiss: number;
    dropGoalsForMiss: number;
    dropGoalsAgainstMiss: number;
    possessionFor?: number | null;
    possessionAgainst?: number | null;
    scrumsForWin?: number | null;
    scrumsForLoss?: number | null;
    scrumsAgainstWin?: number | null;
    scrumsAgainstLoss?: number | null;
    scrumsResetFor?: number | null;
    scrumsResetAgainst?: number | null;
    scrumsOppPenFor?: number | null;
    scrumsOppPenAgainst?: number | null;
    scrumsOppFreeKickFor?: number | null;
    scrumsOppFreeKickAgainst?: number | null;
    lineoutsForWin?: number | null;
    lineoutsForLoss?: number | null;
    lineoutsAgainstWin?: number | null;
    lineoutsAgainstLoss?: number | null;
    lineoutNotStraightFor?: number | null;
    lineoutNotStraightAgainst?: number | null;
    lineoutOppPenFor?: number | null;
    lineoutOppPenAgainst?: number | null;
    lineoutOppFreeKickFor?: number | null;
    lineoutOppFreeKickAgainst?: number | null;
    restartRetentionFor?: number | null;
    restartRetentionAgainst?: number | null;
    turnoversFor?: number | null;
    turnoversAgainst?: number | null;
    handlingErrorsFor?: number | null;
    handlingErrorsAgainst?: number | null;
    offloadsFor?: number | null;
    offloadsAgainst?: number | null;
    threePassPhasesFor?: number | null;
    threePassPhasesAgainst?: number | null;
    phasesFor?: number | null;
    phasesAgainst?: number | null;
    kickInPlayFor?: number | null;
    kickInPlayAgainst?: number | null;
    kickInTouchFor?: number | null;
    kickInTouchAgainst?: number | null;
    boxKickFor?: number | null;
    boxKickAgainst?: number | null;
    offsideFor?: number | null;
    offsideAgainst?: number | null;
    scrumPenFor?: number | null;
    scrumPenAgainst?: number | null;
    breakdownPenFor?: number | null;
    breakdownPenAgainst?: number | null;
    foulPlayFor?: number | null;
    foulPlayAgainst?: number | null;
    lineoutMaulPenFor?: number | null;
    lineoutMaulPenAgainst?: number | null;
    missedTacklesFor?: number | null;
    missedTacklesAgainst?: number | null;
    madeTacklesFor?: number | null;
    madeTacklesAgainst?: number | null;
    carriesFor?: number | null;
    carriesAgainst?: number | null;
    threeSecRuckFor?: number | null;
    threeSecRuckAgainst?: number | null;
    fourFiveSecRuckFor?: number | null;
    fourFiveSecRuckAgainst?: number | null;
    fivePlusSecRuckFor?: number | null;
    fivePlusSecRuckAgainst?: number | null;
    gainlinePlusFor?: number | null;
    gainlinePlusAgainst?: number | null;
    gainlineNeutralFor?: number | null;
    gainlineNeutralAgainst?: number | null;
    gainlineMinusFor?: number | null;
    gainlineMinusAgainst?: number | null;
    linebreakLeftEdgeFor?: number | null;
    linebreakLeftEdgeAgainst?: number | null;
    linebreakRightEdgeFor?: number | null;
    linebreakRightEdgeAgainst?: number | null;
    linebreakMiddleFor?: number | null;
    linebreakMiddleAgainst?: number | null;
    ballInPlayHome22?: number | null;
    ballInPlayHome50?: number | null;
    ballInPlayAway50?: number | null;
    ballInPlayAway22?: number | null;
    picksFor?: number | null;
    picksAgainst?: number | null;
    offTenFor?: number | null;
    offTenAgainst?: number | null;
    offNineFor?: number | null;
    offNineAgainst?: number | null;
    "22EntryPointsFor"?: number | null;
    "22EntryNoPointsFor"?: number | null;
    "22EntryPointsAgainst"?: number | null;
    "22EntryNoPointsAgainst"?: number | null;
    efficientRucksFor?: number | null;
    efficientRucksAgainst?: number | null;
  };
  Update: {
    id?: string;
    eventId?: string;
    teamId?: string;
	subTeamId?: string;
    win?: Database["public"]["Enums"]["GameResult"];
    pointsFor?: number;
    pointsAgainst?: number;
    triesFor?: number;
    triesAgainst?: number;
    conversionsForMade?: number;
    conversionsAgainstMade?: number;
    penaltiesForMade?: number;
    penaltiesAgainstMade?: number;
    dropGoalsForMade?: number;
    dropGoalsAgainstMade?: number;
    yellowCardsFor?: number;
    yellowCardsAgainst?: number;
    redCardsFor?: number;
    redCardsAgainst?: number;
    createdAt?: string;
    updatedAt?: string;
    conversionsForMiss?: number;
    conversionsAgainstMiss?: number;
    penaltiesForMiss?: number;
    penaltiesAgainstMiss?: number;
    dropGoalsForMiss?: number;
    dropGoalsAgainstMiss?: number;
    possessionFor?: number | null;
    possessionAgainst?: number | null;
    scrumsForWin?: number | null;
    scrumsForLoss?: number | null;
    scrumsAgainstWin?: number | null;
    scrumsAgainstLoss?: number | null;
    scrumsResetFor?: number | null;
    scrumsResetAgainst?: number | null;
    scrumsOppPenFor?: number | null;
    scrumsOppPenAgainst?: number | null;
    scrumsOppFreeKickFor?: number | null;
    scrumsOppFreeKickAgainst?: number | null;
    lineoutsForWin?: number | null;
    lineoutsForLoss?: number | null;
    lineoutsAgainstWin?: number | null;
    lineoutsAgainstLoss?: number | null;
    lineoutNotStraightFor?: number | null;
    lineoutNotStraightAgainst?: number | null;
    lineoutOppPenFor?: number | null;
    lineoutOppPenAgainst?: number | null;
    lineoutOppFreeKickFor?: number | null;
    lineoutOppFreeKickAgainst?: number | null;
    restartRetentionFor?: number | null;
    restartRetentionAgainst?: number | null;
    turnoversFor?: number | null;
    turnoversAgainst?: number | null;
    handlingErrorsFor?: number | null;
    handlingErrorsAgainst?: number | null;
    offloadsFor?: number | null;
    offloadsAgainst?: number | null;
    threePassPhasesFor?: number | null;
    threePassPhasesAgainst?: number | null;
    phasesFor?: number | null;
    phasesAgainst?: number | null;
    kickInPlayFor?: number | null;
    kickInPlayAgainst?: number | null;
    kickInTouchFor?: number | null;
    kickInTouchAgainst?: number | null;
    boxKickFor?: number | null;
    boxKickAgainst?: number | null;
    offsideFor?: number | null;
    offsideAgainst?: number | null;
    scrumPenFor?: number | null;
    scrumPenAgainst?: number | null;
    breakdownPenFor?: number | null;
    breakdownPenAgainst?: number | null;
    foulPlayFor?: number | null;
    foulPlayAgainst?: number | null;
    lineoutMaulPenFor?: number | null;
    lineoutMaulPenAgainst?: number | null;
    missedTacklesFor?: number | null;
    missedTacklesAgainst?: number | null;
    madeTacklesFor?: number | null;
    madeTacklesAgainst?: number | null;
    carriesFor?: number | null;
    carriesAgainst?: number | null;
    threeSecRuckFor?: number | null;
    threeSecRuckAgainst?: number | null;
    fourFiveSecRuckFor?: number | null;
    fourFiveSecRuckAgainst?: number | null;
    fivePlusSecRuckFor?: number | null;
    fivePlusSecRuckAgainst?: number | null;
    gainlinePlusFor?: number | null;
    gainlinePlusAgainst?: number | null;
    gainlineNeutralFor?: number | null;
    gainlineNeutralAgainst?: number | null;
    gainlineMinusFor?: number | null;
    gainlineMinusAgainst?: number | null;
    linebreakLeftEdgeFor?: number | null;
    linebreakLeftEdgeAgainst?: number | null;
    linebreakRightEdgeFor?: number | null;
    linebreakRightEdgeAgainst?: number | null;
    linebreakMiddleFor?: number | null;
    linebreakMiddleAgainst?: number | null;
    ballInPlayHome22?: number | null;
    ballInPlayHome50?: number | null;
    ballInPlayAway50?: number | null;
    ballInPlayAway22?: number | null;
    picksFor?: number | null;
    picksAgainst?: number | null;
    offTenFor?: number | null;
    offTenAgainst?: number | null;
    offNineFor?: number | null;
    offNineAgainst?: number | null;
    "22EntryPointsFor"?: number | null;
    "22EntryNoPointsFor"?: number | null;
    "22EntryPointsAgainst"?: number | null;
    "22EntryNoPointsAgainst"?: number | null;
    efficientRucksFor?: number | null;
    efficientRucksAgainst?: number | null;
  };
  Relationships: [];
};
			HouseMarker: {
				Row: {
					comment: string | null;
					createdAt: string;
					id: string;
					playerRecordId: string;
					teamId: string;
					updatedAt: string;
					x: number;
					y: number;
				};
				Insert: {
					comment?: string | null;
					createdAt?: string;
					id?: string;
					playerRecordId: string;
					teamId: string;
					updatedAt: string;
					x: number;
					y: number;
				};
				Update: {
					comment?: string | null;
					createdAt?: string;
					id?: string;
					playerRecordId?: string;
					teamId?: string;
					updatedAt?: string;
					x?: number;
					y?: number;
				};
				Relationships: [
					{
						foreignKeyName: "HouseMarker_playerRecordId_fkey";
						columns: ["playerRecordId"];
						isOneToOne: false;
						referencedRelation: "PlayerRecord";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "HouseMarker_teamId_fkey";
						columns: ["teamId"];
						isOneToOne: false;
						referencedRelation: "Team";
						referencedColumns: ["id"];
					}
				];
			};
			PlayerGameStat: {
				Row: {
					conversions: number;
					conversionsMade: number;
					conversionsMiss: number;
					dropGoals: number;
					dropGoalsMade: number;
					dropGoalsMiss: number;
					eventId: string;
					id: string;
					minutesPlayed: number;
					penalties: number;
					penaltiesMade: number;
					penaltiesMiss: number;
					playerRecordId: string;
					redCards: number;
					teamId: string;
					subTeamId: string | null;
					tries: number;
					yellowCards: number;
				};
				Insert: {
					conversions?: number;
					conversionsMade?: number;
					conversionsMiss?: number;
					dropGoals?: number;
					dropGoalsMade?: number;
					dropGoalsMiss?: number;
					eventId: string;
					id?: string;
					minutesPlayed?: number;
					penalties?: number;
					penaltiesMade?: number;
					penaltiesMiss?: number;
					playerRecordId: string;
					redCards: number;
					teamId: string;
					subTeamId?: string | null;
					tries: number;
					yellowCards: number;
				};
				Update: {
					conversions?: number;
					conversionsMade?: number;
					conversionsMiss?: number;
					dropGoals?: number;
					dropGoalsMade?: number;
					dropGoalsMiss?: number;
					eventId?: string;
					id?: string;
					minutesPlayed?: number;
					penalties?: number;
					penaltiesMade?: number;
					penaltiesMiss?: number;
					playerRecordId?: string;
					redCards?: number;
					teamId?: string;
					subTeamId?: string | null;
					tries?: number;
					yellowCards?: number;
				};
				Relationships: [];
			};
			PlayerRecord: {
				Row: {
					avatarUrl: string | null;
					birthYear: number | null;
					createdAt: string | null;
					email: string | null;
					emergencyEmail: string | null;
					emergencyPhone: string | null;
					firstName: string;
					healthStatus: number;
					heightCm: number | null;
					id: string;
					jerseyNumber: number | null;
					lastName: string;
					notes: string | null;
					phone: string | null;
					teamId: string;
					updatedAt: string | null;
					userId: string | null;
					weightKg: number | null;
				};
				Insert: {
					avatarUrl?: string | null;
					birthYear?: number | null;
					createdAt?: string | null;
					email?: string | null;
					emergencyEmail?: string | null;
					emergencyPhone?: string | null;
					firstName: string;
					healthStatus?: number;
					heightCm?: number | null;
					id?: string;
					jerseyNumber?: number | null;
					lastName: string;
					notes?: string | null;
					phone?: string | null;
					teamId: string;
					updatedAt?: string | null;
					userId?: string | null;
					weightKg?: number | null;
				};
				Update: {
					avatarUrl?: string | null;
					birthYear?: number | null;
					createdAt?: string | null;
					email?: string | null;
					emergencyEmail?: string | null;
					emergencyPhone?: string | null;
					firstName?: string;
					healthStatus?: number;
					heightCm?: number | null;
					id?: string;
					jerseyNumber?: number | null;
					lastName?: string;
					notes?: string | null;
					phone?: string | null;
					teamId?: string;
					updatedAt?: string | null;
					userId?: string | null;
					weightKg?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: "PlayerRecord_teamId_fkey";
						columns: ["teamId"];
						isOneToOne: false;
						referencedRelation: "Team";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "PlayerRecord_userId_fkey";
						columns: ["userId"];
						isOneToOne: false;
						referencedRelation: "User";
						referencedColumns: ["id"];
					}
				];
			};
			SubTeam: {
				Row: {
					createdAt: string;
					id: string;
					leagueName: string | null;
					leagueURL: string | null;
					name: string;
					order: number | null;
					playerIds: string[] | null;
					teamId: string;
					updatedAt: string;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					leagueName?: string | null;
					leagueURL?: string | null;
					name: string;
					order?: number | null;
					playerIds?: string[] | null;
					teamId: string;
					updatedAt: string;
				};
				Update: {
					createdAt?: string;
					id?: string;
					leagueName?: string | null;
					leagueURL?: string | null;
					name?: string;
					order?: number | null;
					playerIds?: string[] | null;
					teamId?: string;
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "SubTeam_teamId_fkey";
						columns: ["teamId"];
						isOneToOne: false;
						referencedRelation: "Team";
						referencedColumns: ["id"];
					}
				];
			};
			Team: {
				Row: {
					color: Database["public"]["Enums"]["TeamColor"] | null;
					createdAt: string | null;
					createdById: string;
					deletedAt: string | null;
					fans: string[] | null;
					id: string;
					logoUrl: string | null;
					losses: number;
					name: string;
					order: number | null;
					pointsAgainst: number;
					pointsFor: number;
					sport: Database["public"]["Enums"]["Sport"];
					staff: string[] | null;
					ties: number;
					updatedAt: string | null;
					wins: number;
					year: number;
				};
				Insert: {
					color?: Database["public"]["Enums"]["TeamColor"] | null;
					createdAt?: string | null;
					createdById: string;
					deletedAt?: string | null;
					fans?: string[] | null;
					id?: string;
					logoUrl?: string | null;
					losses?: number;
					name: string;
					order?: number | null;
					pointsAgainst?: number;
					pointsFor?: number;
					sport: Database["public"]["Enums"]["Sport"];
					staff?: string[] | null;
					ties?: number;
					updatedAt?: string | null;
					wins?: number;
					year?: number;
				};
				Update: {
					color?: Database["public"]["Enums"]["TeamColor"] | null;
					createdAt?: string | null;
					createdById?: string;
					deletedAt?: string | null;
					fans?: string[] | null;
					id?: string;
					logoUrl?: string | null;
					losses?: number;
					name?: string;
					order?: number | null;
					pointsAgainst?: number;
					pointsFor?: number;
					sport?: Database["public"]["Enums"]["Sport"];
					staff?: string[] | null;
					ties?: number;
					updatedAt?: string | null;
					wins?: number;
					year?: number;
				};
				Relationships: [];
			};
			TeamJoinRequest: {
				Row: {
					createdAt: string;
					id: string;
					playerRecordId: string | null;
					requestType: Database["public"]["Enums"]["RequestType"];
					status: string;
					teamId: string;
					updatedAt: string;
					userEmail: string;
					userId: string;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					playerRecordId?: string | null;
					requestType: Database["public"]["Enums"]["RequestType"];
					status?: string;
					teamId: string;
					updatedAt: string;
					userEmail: string;
					userId: string;
				};
				Update: {
					createdAt?: string;
					id?: string;
					playerRecordId?: string | null;
					requestType?: Database["public"]["Enums"]["RequestType"];
					status?: string;
					teamId?: string;
					updatedAt?: string;
					userEmail?: string;
					userId?: string;
				};
				Relationships: [];
			};
			User: {
				Row: {
					avatarUrl: string | null;
					createdAt: string;
					email: string;
					firstName: string;
					id: string;
					lastName: string;
					onboarded: boolean;
					phone: string | null;
					plan: Database["public"]["Enums"]["RosterPricingTier"];
					updatedAt: string;
				};
				Insert: {
					avatarUrl?: string | null;
					createdAt?: string;
					email: string;
					firstName: string;
					id: string;
					lastName: string;
					onboarded?: boolean;
					phone?: string | null;
					plan?: Database["public"]["Enums"]["RosterPricingTier"];
					updatedAt: string;
				};
				Update: {
					avatarUrl?: string | null;
					createdAt?: string;
					email?: string;
					firstName?: string;
					id?: string;
					lastName?: string;
					onboarded?: boolean;
					phone?: string | null;
					plan?: Database["public"]["Enums"]["RosterPricingTier"];
					updatedAt?: string;
				};
				Relationships: [];
			};
			EventLink: {
				Row: {
					id: string;
					eventId: string;
					title: string;
					url: string;
					notes: string | null;
					visibleTo: string[];
					createdAt: string;
					updatedAt: string;
				};
				Insert: {
					id?: string;
					eventId: string;
					title: string;
					url: string;
					notes?: string | null;
					visibleTo: string[];
					createdAt?: string;
					updatedAt: string;
				};
				Update: {
					id?: string;
					eventId?: string;
					title?: string;
					url?: string;
					notes?: string | null;
					visibleTo?: string[];
					createdAt?: string;
					updatedAt?: string;
				};
				Relationships: [
					{
						foreignKeyName: "EventLink_eventId_fkey";
						columns: ["eventId"];
						isOneToOne: false;
						referencedRelation: "Event";
						referencedColumns: ["id"];
					}
				];
			};
			GameEvent: {
				Row: {
					id: string;
					createdAt: string;
					eventId: string;
					teamId: string;
					subTeamId: string | null;
					playerId: string | null;
					eventType: Database["public"]["Enums"]["GameEventType"];
					eventOwner: Database["public"]["Enums"]["EventOwner"];
					timeInGame: number | null;
				};
				Insert: {
					id?: string;
					createdAt?: string;
					eventId: string;
					teamId: string;
					subTeamId?: string | null;
					playerId?: string | null;
					eventType: Database["public"]["Enums"]["GameEventType"];
					timeInGame?: number | null;
					eventOwner: Database["public"]["Enums"]["EventOwner"];
				};
				Update: {
					id?: string;
					createdAt?: string;
					eventId?: string;
					teamId?: string;
					subTeamId?: string | null;
					playerId?: string | null;
					eventType?: Database["public"]["Enums"]["GameEventType"];
					timeInGame?: number | null;
					eventOwner?: Database["public"]["Enums"]["EventOwner"];
				};
				Relationships: [
					{
						foreignKeyName: "_GameEvent_eventId_fkey";
						columns: ["eventId"];
						isOneToOne: false;
						referencedRelation: "Event";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "_GameEvent_teamId_fkey";
						columns: ["teamId"];
						isOneToOne: false;
						referencedRelation: "Team";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "_GameEvent_subTeamId_fkey";
						columns: ["subTeamId"];
						isOneToOne: false;
						referencedRelation: "SubTeam";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "_GameEvent_playerId_fkey";
						columns: ["playerId"];
						isOneToOne: false;
						referencedRelation: "PlayerRecord";
						referencedColumns: ["id"];
					}
				];
			}
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			EventType: "GAME" | "PRACTICE" | "MEETING" | "STAFF_ONLY_MEETING";
			GameResult: "WIN" | "LOSS" | "TIE";
			RequestType: "FAN" | "CLAIM_PLAYER" | "NEW_PLAYER";
			RosterPricingTier: "FREE" | "PREMIUM" | "ENTERPRISE";
			Sport: "RUGBY" | "FIELD_HOCKEY";
			UserRole: "PLAYER" | "STAFF" | "FAN";
			GameEventType:
				| "TRY"
				| "CONVERSION_MADE"
				| "CONVERSION_MISS"
				| "PENALTY_MADE"
				| "PENALTY_MISS"
				| "DROP_GOAL_MADE"
				| "DROP_GOAL_MISS"
				| "KICK_FOR_GOAL_MADE"
				| "KICK_FOR_GOAL_MISS"
				| "YELLOW_CARD"
				| "RED_CARD"
				| "SCRUM_MADE"
				| "SCRUM_MISS"
				| "LINEOUT_MADE"
				| "LINEOUT_MISS"
				| "RUCK_MADE"
				| "RUCK_MISS"
				| "MAUL_MADE"
				| "MAUL_MISS"
				| "SUB_IN"
				| "SUB_OUT"
				| "GAME_START"
				| "GAME_PAUSE"
				| "GAME_RESUME"
				| "GAME_HALF"
				| "GAME_END"
				| "GAME_OVERTIME_START"
				| "GAME_OVERTIME_END"
				| "TIMER_SET";
			EventOwner: "HOME" | "AWAY";
			TeamColor:
				| "RED"
				| "PINK"
				| "PURPLE"
				| "YELLOW"
				| "ORANGE"
				| "LIGHT_BLUE"
				| "DARK_BLUE"
				| "LIGHT_GREEN"
				| "DARK_GREEN";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
			DefaultSchema["Views"])
	? (DefaultSchema["Tables"] &
			DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
	? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
	? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
	? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;

export const Constants = {
	public: {
		Enums: {
			EventType: ["GAME", "PRACTICE", "MEETING", "STAFF_ONLY_MEETING"],
			GameResult: ["WIN", "LOSS", "TIE"],
			RequestType: ["FAN", "CLAIM_PLAYER", "NEW_PLAYER"],
			RosterPricingTier: ["FREE", "PREMIUM", "ENTERPRISE"],
			Sport: ["RUGBY", "FIELD_HOCKEY"],
			UserRole: ["PLAYER", "STAFF", "FAN"],
			GameEventType: [
				"TRY",
				"CONVERSION_MADE",
				"CONVERSION_MISS",
				"PENALTY_MADE",
				"PENALTY_MISS",
				"DROP_GOAL_MADE",
				"DROP_GOAL_MISS",
				"KICK_FOR_GOAL_MADE",
				"KICK_FOR_GOAL_MISS",
				"YELLOW_CARD",
				"RED_CARD",
				"SCRUM_MADE",
				"SCRUM_MISS",
				"LINEOUT_MADE",
				"LINEOUT_MISS",
				"RUCK_MADE",
				"RUCK_MISS",
				"MAUL_MADE",
				"MAUL_MISS",
				"SUB_IN",
				"SUB_OUT",
				"GAME_START",
				"GAME_PAUSE",
				"GAME_RESUME",
				"GAME_HALF",
				"GAME_END",
				"GAME_OVERTIME_START",
				"GAME_OVERTIME_END",
				"TIMER_SET",
			],
			EventOwner: ["HOME", "AWAY"],
			TeamColor: [
				"RED",
				"PINK",
				"PURPLE",
				"YELLOW",
				"ORANGE",
				"LIGHT_BLUE",
				"DARK_BLUE",
				"LIGHT_GREEN",
				"DARK_GREEN",
			],
		},
	},
} as const;
