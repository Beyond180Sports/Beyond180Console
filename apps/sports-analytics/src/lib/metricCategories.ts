import type { GameStatTimePoint } from '@beyond180/shared';

export type MetricCategoryId =
  | 'points'
  | 'possession'
  | 'handling'
  | 'attack'
  | 'kicking'
  | 'disciplinary'
  | 'contact'
  | 'gainline'
  | 'linebreaks'
  | 'lineout'
  | 'scrum'
  | 'territory';

export type MetricSeriesDef = {
  key: string;
  label: string;
  getValue: (row: GameStatTimePoint) => number | null;
};

export type MetricChartDef = {
  id: string;
  title: string;
  series: MetricSeriesDef[];
};

export type MetricCategoryDef = {
  id: MetricCategoryId;
  label: string;
  charts: MetricChartDef[];
};

function num(value: number | null | undefined): number {
  return value ?? 0;
}

function successRate(made: number, miss: number): number | null {
  const total = made + miss;
  if (total === 0) {
    return null;
  }
  return Math.round((made / total) * 100);
}

function ballInPlayShare(
  row: GameStatTimePoint,
  value: number | null | undefined,
): number | null {
  const total =
    num(row.ballInPlayHome22) +
    num(row.ballInPlayHome50) +
    num(row.ballInPlayAway50) +
    num(row.ballInPlayAway22);
  if (total === 0) {
    return null;
  }
  return Math.round((num(value) / total) * 100);
}

export const METRIC_CATEGORIES: MetricCategoryDef[] = [
  {
    id: 'points',
    label: 'Points',
    charts: [
      {
        id: 'points-for-against',
        title: 'Points',
        series: [
          {
            key: 'pointsFor',
            label: 'For',
            getValue: (row) => row.pointsFor,
          },
          {
            key: 'pointsAgainst',
            label: 'Against',
            getValue: (row) => row.pointsAgainst,
          },
        ],
      },
      {
        id: 'point-differential',
        title: 'Point differential',
        series: [
          {
            key: 'pointDiff',
            label: 'Differential',
            getValue: (row) => row.pointsFor - row.pointsAgainst,
          },
        ],
      },
      {
        id: 'tries-for-against',
        title: 'Tries',
        series: [
          {
            key: 'triesFor',
            label: 'For',
            getValue: (row) => row.triesFor,
          },
          {
            key: 'triesAgainst',
            label: 'Against',
            getValue: (row) => row.triesAgainst,
          },
        ],
      },
      {
        id: 'conversions-for-against',
        title: 'Conversions',
        series: [
          {
            key: 'conversionsForMade',
            label: 'For',
            getValue: (row) => row.conversionsForMade,
          },
          {
            key: 'conversionsAgainstMade',
            label: 'Against',
            getValue: (row) => row.conversionsAgainstMade,
          },
        ],
      },
      {
        id: 'penalties-for-against',
        title: 'Penalties',
        series: [
          {
            key: 'penaltiesForMade',
            label: 'For',
            getValue: (row) => row.penaltiesForMade,
          },
          {
            key: 'penaltiesAgainstMade',
            label: 'Against',
            getValue: (row) => row.penaltiesAgainstMade,
          },
        ],
      },
      {
        id: 'drop-goals-for-against',
        title: 'Drop goals',
        series: [
          {
            key: 'dropGoalsForMade',
            label: 'For',
            getValue: (row) => row.dropGoalsForMade,
          },
          {
            key: 'dropGoalsAgainstMade',
            label: 'Against',
            getValue: (row) => row.dropGoalsAgainstMade,
          },
        ],
      },
    ],
  },
  {
    id: 'possession',
    label: 'Possession',
    charts: [
      {
        id: 'possession-for-against',
        title: 'Possession',
        series: [
          {
            key: 'possessionFor',
            label: 'For',
            getValue: (row) => row.possessionFor,
          },
          {
            key: 'possessionAgainst',
            label: 'Against',
            getValue: (row) => row.possessionAgainst,
          },
        ],
      },
    ],
  },
  {
    id: 'handling',
    label: 'Handling',
    charts: [
      {
        id: 'restart-retention-for-against',
        title: 'Restart retention',
        series: [
          {
            key: 'restartRetentionFor',
            label: 'For',
            getValue: (row) => row.restartRetentionFor,
          },
          {
            key: 'restartRetentionAgainst',
            label: 'Against',
            getValue: (row) => row.restartRetentionAgainst,
          },
        ],
      },
      {
        id: 'turnovers-for-against',
        title: 'Turnovers',
        series: [
          {
            key: 'turnoversFor',
            label: 'For',
            getValue: (row) => row.turnoversFor,
          },
          {
            key: 'turnoversAgainst',
            label: 'Against',
            getValue: (row) => row.turnoversAgainst,
          },
        ],
      },
      {
        id: 'handling-errors-for-against',
        title: 'Handling errors',
        series: [
          {
            key: 'handlingErrorsFor',
            label: 'For',
            getValue: (row) => row.handlingErrorsFor,
          },
          {
            key: 'handlingErrorsAgainst',
            label: 'Against',
            getValue: (row) => row.handlingErrorsAgainst,
          },
        ],
      },
    ],
  },
  {
    id: 'attack',
    label: 'Attack',
    charts: [
      {
        id: 'offloads-for-against',
        title: 'Offloads',
        series: [
          {
            key: 'offloadsFor',
            label: 'For',
            getValue: (row) => row.offloadsFor,
          },
          {
            key: 'offloadsAgainst',
            label: 'Against',
            getValue: (row) => row.offloadsAgainst,
          },
        ],
      },
      {
        id: 'three-pass-phases-for-against',
        title: '3 pass phases',
        series: [
          {
            key: 'threePassPhasesFor',
            label: 'For',
            getValue: (row) => row.threePassPhasesFor,
          },
          {
            key: 'threePassPhasesAgainst',
            label: 'Against',
            getValue: (row) => row.threePassPhasesAgainst,
          },
        ],
      },
      {
        id: 'attack-off-nine-for-against',
        title: 'Attack off nine',
        series: [
          {
            key: 'offNineFor',
            label: 'For',
            getValue: (row) => row.offNineFor,
          },
          {
            key: 'offNineAgainst',
            label: 'Against',
            getValue: (row) => row.offNineAgainst,
          },
        ],
      },
      {
        id: 'attack-off-ten-for-against',
        title: 'Attack off ten',
        series: [
          {
            key: 'offTenFor',
            label: 'For',
            getValue: (row) => row.offTenFor,
          },
          {
            key: 'offTenAgainst',
            label: 'Against',
            getValue: (row) => row.offTenAgainst,
          },
        ],
      },
      {
        id: 'picks-for-against',
        title: 'Picks',
        series: [
          {
            key: 'picksFor',
            label: 'For',
            getValue: (row) => row.picksFor,
          },
          {
            key: 'picksAgainst',
            label: 'Against',
            getValue: (row) => row.picksAgainst,
          },
        ],
      },
      {
        id: '22-entry-points-for-against',
        title: '22 entry points',
        series: [
          {
            key: '22EntryPointsFor',
            label: 'For',
            getValue: (row) => row['22EntryPointsFor'],
          },
          {
            key: '22EntryPointsAgainst',
            label: 'Against',
            getValue: (row) => row['22EntryPointsAgainst'],
          },
        ],
      },
      {
        id: '22-entry-no-points-for-against',
        title: '22 entry no points',
        series: [
          {
            key: '22EntryNoPointsFor',
            label: 'For',
            getValue: (row) => row['22EntryNoPointsFor'],
          },
          {
            key: '22EntryNoPointsAgainst',
            label: 'Against',
            getValue: (row) => row['22EntryNoPointsAgainst'],
          },
        ],
      },
      {
        id: 'efficient-rucks-for-against',
        title: 'Efficient rucks',
        series: [
          {
            key: 'efficientRucksFor',
            label: 'For',
            getValue: (row) => row.efficientRucksFor,
          },
          {
            key: 'efficientRucksAgainst',
            label: 'Against',
            getValue: (row) => row.efficientRucksAgainst,
          },
        ],
      },
    ],
  },
  {
    id: 'kicking',
    label: 'Kicking',
    charts: [
      {
        id: 'kick-in-play-for-against',
        title: 'Kick in play',
        series: [
          {
            key: 'kickInPlayFor',
            label: 'For',
            getValue: (row) => num(row.kickInPlayFor),
          },
          {
            key: 'kickInPlayAgainst',
            label: 'Against',
            getValue: (row) => num(row.kickInPlayAgainst),
          },
        ],
      },
      {
        id: 'box-kick-for-against',
        title: 'Box kick',
        series: [
          {
            key: 'boxKickFor',
            label: 'For',
            getValue: (row) => num(row.boxKickFor),
          },
          {
            key: 'boxKickAgainst',
            label: 'Against',
            getValue: (row) => num(row.boxKickAgainst),
          },
        ],
      },
      {
        id: 'kick-in-touch-for-against',
        title: 'Kick in touch',
        series: [
          {
            key: 'kickInTouchFor',
            label: 'For',
            getValue: (row) => num(row.kickInTouchFor),
          },
          {
            key: 'kickInTouchAgainst',
            label: 'Against',
            getValue: (row) => num(row.kickInTouchAgainst),
          },
        ],
      },
      {
        id: 'penalty-kick-success-rate',
        title: 'Penalty kick success rate',
        series: [
          {
            key: 'penaltySuccessFor',
            label: 'For %',
            getValue: (row) => successRate(row.penaltiesForMade, row.penaltiesForMiss),
          },
          {
            key: 'penaltySuccessAgainst',
            label: 'Against %',
            getValue: (row) =>
              successRate(row.penaltiesAgainstMade, row.penaltiesAgainstMiss),
          },
        ],
      },
      {
        id: 'conversion-rate',
        title: 'Conversion rate',
        series: [
          {
            key: 'conversionSuccessFor',
            label: 'For %',
            getValue: (row) =>
              successRate(row.conversionsForMade, row.conversionsForMiss),
          },
          {
            key: 'conversionSuccessAgainst',
            label: 'Against %',
            getValue: (row) =>
              successRate(row.conversionsAgainstMade, row.conversionsAgainstMiss),
          },
        ],
      },
      {
        id: 'drop-goal-success-rate',
        title: 'Drop goal success rate',
        series: [
          {
            key: 'dropGoalSuccessFor',
            label: 'For %',
            getValue: (row) =>
              successRate(row.dropGoalsForMade, row.dropGoalsForMiss),
          },
          {
            key: 'dropGoalSuccessAgainst',
            label: 'Against %',
            getValue: (row) =>
              successRate(row.dropGoalsAgainstMade, row.dropGoalsAgainstMiss),
          },
        ],
      },
    ],
  },
  {
    id: 'disciplinary',
    label: 'Disciplinary',
    charts: [
      {
        id: 'total-penalties-for-against',
        title: 'Total penalties',
        series: [
          {
            key: 'totalPenaltiesFor',
            label: 'For',
            getValue: (row) =>
              num(row.offsideFor) +
              num(row.scrumPenFor) +
              num(row.breakdownPenFor) +
              num(row.foulPlayFor) +
              num(row.lineoutMaulPenFor),
          },
          {
            key: 'totalPenaltiesAgainst',
            label: 'Against',
            getValue: (row) =>
              num(row.offsideAgainst) +
              num(row.scrumPenAgainst) +
              num(row.breakdownPenAgainst) +
              num(row.foulPlayAgainst) +
              num(row.lineoutMaulPenAgainst),
          },
        ],
      },
      {
        id: 'offside-for-against',
        title: 'Offside',
        series: [
          {
            key: 'offsideFor',
            label: 'For',
            getValue: (row) => num(row.offsideFor),
          },
          {
            key: 'offsideAgainst',
            label: 'Against',
            getValue: (row) => num(row.offsideAgainst),
          },
        ],
      },
      {
        id: 'lineout-maul-pens-for-against',
        title: 'Lineout/maul pens',
        series: [
          {
            key: 'lineoutMaulPenFor',
            label: 'For',
            getValue: (row) => num(row.lineoutMaulPenFor),
          },
          {
            key: 'lineoutMaulPenAgainst',
            label: 'Against',
            getValue: (row) => num(row.lineoutMaulPenAgainst),
          },
        ],
      },
      {
        id: 'scrum-pens-for-against',
        title: 'Scrum pens',
        series: [
          {
            key: 'scrumPenFor',
            label: 'For',
            getValue: (row) => num(row.scrumPenFor),
          },
          {
            key: 'scrumPenAgainst',
            label: 'Against',
            getValue: (row) => num(row.scrumPenAgainst),
          },
        ],
      },
      {
        id: 'breakdown-pens-for-against',
        title: 'Breakdown pens',
        series: [
          {
            key: 'breakdownPenFor',
            label: 'For',
            getValue: (row) => num(row.breakdownPenFor),
          },
          {
            key: 'breakdownPenAgainst',
            label: 'Against',
            getValue: (row) => num(row.breakdownPenAgainst),
          },
        ],
      },
      {
        id: 'foul-play-for-against',
        title: 'Foul play',
        series: [
          {
            key: 'foulPlayFor',
            label: 'For',
            getValue: (row) => num(row.foulPlayFor),
          },
          {
            key: 'foulPlayAgainst',
            label: 'Against',
            getValue: (row) => num(row.foulPlayAgainst),
          },
        ],
      },
      {
        id: 'yellow-cards-for-against',
        title: 'Yellow cards',
        series: [
          {
            key: 'yellowCardsFor',
            label: 'For',
            getValue: (row) => row.yellowCardsFor,
          },
          {
            key: 'yellowCardsAgainst',
            label: 'Against',
            getValue: (row) => row.yellowCardsAgainst,
          },
        ],
      },
      {
        id: 'red-cards-for-against',
        title: 'Red cards',
        series: [
          {
            key: 'redCardsFor',
            label: 'For',
            getValue: (row) => row.redCardsFor,
          },
          {
            key: 'redCardsAgainst',
            label: 'Against',
            getValue: (row) => row.redCardsAgainst,
          },
        ],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact area',
    charts: [
      {
        id: 'made-tackles-for-against',
        title: 'Made tackles',
        series: [
          {
            key: 'madeTacklesFor',
            label: 'For',
            getValue: (row) => num(row.madeTacklesFor),
          },
          {
            key: 'madeTacklesAgainst',
            label: 'Against',
            getValue: (row) => num(row.madeTacklesAgainst),
          },
        ],
      },
      {
        id: 'missed-tackles-for-against',
        title: 'Missed tackles',
        series: [
          {
            key: 'missedTacklesFor',
            label: 'For',
            getValue: (row) => num(row.missedTacklesFor),
          },
          {
            key: 'missedTacklesAgainst',
            label: 'Against',
            getValue: (row) => num(row.missedTacklesAgainst),
          },
        ],
      },
      {
        id: 'tackle-success-rate',
        title: 'Tackle success rate',
        series: [
          {
            key: 'tackleSuccessFor',
            label: 'For %',
            getValue: (row) =>
              successRate(num(row.madeTacklesFor), num(row.missedTacklesFor)),
          },
          {
            key: 'tackleSuccessAgainst',
            label: 'Against %',
            getValue: (row) =>
              successRate(num(row.madeTacklesAgainst), num(row.missedTacklesAgainst)),
          },
        ],
      },
      {
        id: 'carries-for-against',
        title: 'Carries',
        series: [
          {
            key: 'carriesFor',
            label: 'For',
            getValue: (row) => num(row.carriesFor),
          },
          {
            key: 'carriesAgainst',
            label: 'Against',
            getValue: (row) => num(row.carriesAgainst),
          },
        ],
      },
      {
        id: 'three-sec-ruck-for-against',
        title: '3 sec ruck',
        series: [
          {
            key: 'threeSecRuckFor',
            label: 'For',
            getValue: (row) => num(row.threeSecRuckFor),
          },
          {
            key: 'threeSecRuckAgainst',
            label: 'Against',
            getValue: (row) => num(row.threeSecRuckAgainst),
          },
        ],
      },
      {
        id: 'four-five-sec-ruck-for-against',
        title: '4–5 sec ruck',
        series: [
          {
            key: 'fourFiveSecRuckFor',
            label: 'For',
            getValue: (row) => num(row.fourFiveSecRuckFor),
          },
          {
            key: 'fourFiveSecRuckAgainst',
            label: 'Against',
            getValue: (row) => num(row.fourFiveSecRuckAgainst),
          },
        ],
      },
      {
        id: 'five-plus-sec-ruck-for-against',
        title: '5+ sec ruck',
        series: [
          {
            key: 'fivePlusSecRuckFor',
            label: 'For',
            getValue: (row) => num(row.fivePlusSecRuckFor),
          },
          {
            key: 'fivePlusSecRuckAgainst',
            label: 'Against',
            getValue: (row) => num(row.fivePlusSecRuckAgainst),
          },
        ],
      },
    ],
  },
  {
    id: 'gainline',
    label: 'Gainline',
    charts: [
      {
        id: 'gainline-plus-for-against',
        title: 'Gainline plus',
        series: [
          {
            key: 'gainlinePlusFor',
            label: 'For',
            getValue: (row) => num(row.gainlinePlusFor),
          },
          {
            key: 'gainlinePlusAgainst',
            label: 'Against',
            getValue: (row) => num(row.gainlinePlusAgainst),
          },
        ],
      },
      {
        id: 'gainline-neutral-for-against',
        title: 'Gainline neutral',
        series: [
          {
            key: 'gainlineNeutralFor',
            label: 'For',
            getValue: (row) => num(row.gainlineNeutralFor),
          },
          {
            key: 'gainlineNeutralAgainst',
            label: 'Against',
            getValue: (row) => num(row.gainlineNeutralAgainst),
          },
        ],
      },
      {
        id: 'gainline-minus-for-against',
        title: 'Gainline minus',
        series: [
          {
            key: 'gainlineMinusFor',
            label: 'For',
            getValue: (row) => num(row.gainlineMinusFor),
          },
          {
            key: 'gainlineMinusAgainst',
            label: 'Against',
            getValue: (row) => num(row.gainlineMinusAgainst),
          },
        ],
      },
    ],
  },
  {
    id: 'linebreaks',
    label: 'Linebreaks',
    charts: [
      {
        id: 'total-linebreaks-for-against',
        title: 'Total linebreaks',
        series: [
          {
            key: 'totalLinebreaksFor',
            label: 'For',
            getValue: (row) =>
              num(row.linebreakLeftEdgeFor) +
              num(row.linebreakMiddleFor) +
              num(row.linebreakRightEdgeFor),
          },
          {
            key: 'totalLinebreaksAgainst',
            label: 'Against',
            getValue: (row) =>
              num(row.linebreakLeftEdgeAgainst) +
              num(row.linebreakMiddleAgainst) +
              num(row.linebreakRightEdgeAgainst),
          },
        ],
      },
      {
        id: 'linebreak-middle-for-against',
        title: 'Midfield linebreaks',
        series: [
          {
            key: 'linebreakMiddleFor',
            label: 'For',
            getValue: (row) => num(row.linebreakMiddleFor),
          },
          {
            key: 'linebreakMiddleAgainst',
            label: 'Against',
            getValue: (row) => num(row.linebreakMiddleAgainst),
          },
        ],
      },
      {
        id: 'linebreak-left-edge-for-against',
        title: 'Left edge linebreaks',
        series: [
          {
            key: 'linebreakLeftEdgeFor',
            label: 'For',
            getValue: (row) => num(row.linebreakLeftEdgeFor),
          },
          {
            key: 'linebreakLeftEdgeAgainst',
            label: 'Against',
            getValue: (row) => num(row.linebreakLeftEdgeAgainst),
          },
        ],
      },
      {
        id: 'linebreak-right-edge-for-against',
        title: 'Right edge linebreaks',
        series: [
          {
            key: 'linebreakRightEdgeFor',
            label: 'For',
            getValue: (row) => num(row.linebreakRightEdgeFor),
          },
          {
            key: 'linebreakRightEdgeAgainst',
            label: 'Against',
            getValue: (row) => num(row.linebreakRightEdgeAgainst),
          },
        ],
      },
    ],
  },
  {
    id: 'lineout',
    label: 'Lineout',
    charts: [
      {
        id: 'lineouts-won-for-against',
        title: 'Lineouts won',
        series: [
          {
            key: 'lineoutsForWin',
            label: 'For',
            getValue: (row) => num(row.lineoutsForWin),
          },
          {
            key: 'lineoutsAgainstWin',
            label: 'Against',
            getValue: (row) => num(row.lineoutsAgainstWin),
          },
        ],
      },
      {
        id: 'lineouts-lost-for-against',
        title: 'Lineouts lost',
        series: [
          {
            key: 'lineoutsForLoss',
            label: 'For',
            getValue: (row) => num(row.lineoutsForLoss),
          },
          {
            key: 'lineoutsAgainstLoss',
            label: 'Against',
            getValue: (row) => num(row.lineoutsAgainstLoss),
          },
        ],
      },
      {
        id: 'lineout-not-straight-for-against',
        title: 'Not straight',
        series: [
          {
            key: 'lineoutNotStraightFor',
            label: 'For',
            getValue: (row) => num(row.lineoutNotStraightFor),
          },
          {
            key: 'lineoutNotStraightAgainst',
            label: 'Against',
            getValue: (row) => num(row.lineoutNotStraightAgainst),
          },
        ],
      },
      {
        id: 'lineout-opp-pen-for-against',
        title: 'Opposition penalized',
        series: [
          {
            key: 'lineoutOppPenFor',
            label: 'For',
            getValue: (row) => num(row.lineoutOppPenFor),
          },
          {
            key: 'lineoutOppPenAgainst',
            label: 'Against',
            getValue: (row) => num(row.lineoutOppPenAgainst),
          },
        ],
      },
      {
        id: 'lineout-opp-free-kick-for-against',
        title: 'Opposition free kicked',
        series: [
          {
            key: 'lineoutOppFreeKickFor',
            label: 'For',
            getValue: (row) => num(row.lineoutOppFreeKickFor),
          },
          {
            key: 'lineoutOppFreeKickAgainst',
            label: 'Against',
            getValue: (row) => num(row.lineoutOppFreeKickAgainst),
          },
        ],
      },
    ],
  },
  {
    id: 'scrum',
    label: 'Scrums',
    charts: [
      {
        id: 'scrums-won-for-against',
        title: 'Scrums won',
        series: [
          {
            key: 'scrumsForWin',
            label: 'For',
            getValue: (row) => num(row.scrumsForWin),
          },
          {
            key: 'scrumsAgainstWin',
            label: 'Against',
            getValue: (row) => num(row.scrumsAgainstWin),
          },
        ],
      },
      {
        id: 'scrums-lost-for-against',
        title: 'Scrums lost',
        series: [
          {
            key: 'scrumsForLoss',
            label: 'For',
            getValue: (row) => num(row.scrumsForLoss),
          },
          {
            key: 'scrumsAgainstLoss',
            label: 'Against',
            getValue: (row) => num(row.scrumsAgainstLoss),
          },
        ],
      },
      {
        id: 'scrums-reset-for-against',
        title: 'Scrums reset',
        series: [
          {
            key: 'scrumsResetFor',
            label: 'For',
            getValue: (row) => num(row.scrumsResetFor),
          },
          {
            key: 'scrumsResetAgainst',
            label: 'Against',
            getValue: (row) => num(row.scrumsResetAgainst),
          },
        ],
      },
      {
        id: 'scrums-opp-pen-for-against',
        title: 'Opposition penalized',
        series: [
          {
            key: 'scrumsOppPenFor',
            label: 'For',
            getValue: (row) => num(row.scrumsOppPenFor),
          },
          {
            key: 'scrumsOppPenAgainst',
            label: 'Against',
            getValue: (row) => num(row.scrumsOppPenAgainst),
          },
        ],
      },
      {
        id: 'scrums-opp-free-kick-for-against',
        title: 'Opposition free kicked',
        series: [
          {
            key: 'scrumsOppFreeKickFor',
            label: 'For',
            getValue: (row) => num(row.scrumsOppFreeKickFor),
          },
          {
            key: 'scrumsOppFreeKickAgainst',
            label: 'Against',
            getValue: (row) => num(row.scrumsOppFreeKickAgainst),
          },
        ],
      },
    ],
  },
  {
    id: 'territory',
    label: 'Territory',
    charts: [
      {
        id: 'ball-in-play-home-22',
        title: 'Ball in play home 22',
        series: [
          {
            key: 'ballInPlayHome22Pct',
            label: '%',
            getValue: (row) => ballInPlayShare(row, row.ballInPlayHome22),
          },
        ],
      },
      {
        id: 'ball-in-play-home-50',
        title: 'Ball in play home 50',
        series: [
          {
            key: 'ballInPlayHome50Pct',
            label: '%',
            getValue: (row) => ballInPlayShare(row, row.ballInPlayHome50),
          },
        ],
      },
      {
        id: 'ball-in-play-away-50',
        title: 'Ball in play away 50',
        series: [
          {
            key: 'ballInPlayAway50Pct',
            label: '%',
            getValue: (row) => ballInPlayShare(row, row.ballInPlayAway50),
          },
        ],
      },
      {
        id: 'ball-in-play-away-22',
        title: 'Ball in play away 22',
        series: [
          {
            key: 'ballInPlayAway22Pct',
            label: '%',
            getValue: (row) => ballInPlayShare(row, row.ballInPlayAway22),
          },
        ],
      },
    ],
  },
];

export function getChartsByIds(chartIds: string[]): MetricChartDef[] {
  if (chartIds.length === 0) {
    return [];
  }
  const byId = new Map(
    METRIC_CATEGORIES.flatMap((category) =>
      category.charts.map((chart) => [chart.id, chart] as const),
    ),
  );
  return chartIds.flatMap((id) => {
    const chart = byId.get(id);
    return chart ? [chart] : [];
  });
}

/** Layout rows for the chart grid: each row holds 1 (full-width) or 2 (half-width) chart ids. */
export type ChartRows = string[][];

export type ChartDropTarget =
  | { kind: 'beside'; rowIndex: number; slotIndex: 0 | 1 }
  | { kind: 'row'; rowIndex: number };

export function flattenChartRows(rows: ChartRows): string[] {
  return rows.flat();
}

export function chartRowsEqual(a: ChartRows, b: ChartRows): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].length !== b[i].length) {
      return false;
    }
    for (let j = 0; j < a[i].length; j += 1) {
      if (a[i][j] !== b[i][j]) {
        return false;
      }
    }
  }
  return true;
}

/** Keep row layout in sync when the combobox selection changes. New charts fill the last incomplete row. */
export function reconcileChartRows(previous: ChartRows, nextIds: string[]): ChartRows {
  const nextSet = new Set(nextIds);
  const result = previous
    .map((row) => row.filter((id) => nextSet.has(id)))
    .filter((row) => row.length > 0)
    .map((row) => [...row]);
  const present = new Set(result.flat());

  for (const id of nextIds) {
    if (present.has(id)) {
      continue;
    }
    const last = result[result.length - 1];
    if (last && last.length === 1) {
      last.push(id);
    } else {
      result.push([id]);
    }
    present.add(id);
  }

  return result;
}

export function removeChartFromRows(rows: ChartRows, chartId: string): ChartRows {
  return rows
    .map((row) => row.filter((id) => id !== chartId))
    .filter((row) => row.length > 0);
}

export function moveChartInRows(
  rows: ChartRows,
  chartId: string,
  target: ChartDropTarget,
): ChartRows {
  const next = removeChartFromRows(rows, chartId).map((row) => [...row]);

  if (target.kind === 'row') {
    const insertAt = Math.max(0, Math.min(target.rowIndex, next.length));
    next.splice(insertAt, 0, [chartId]);
    return chartRowsEqual(rows, next) ? rows : next;
  }

  if (next.length === 0) {
    return [[chartId]];
  }

  const rowIndex = Math.max(0, Math.min(target.rowIndex, next.length - 1));
  const row = next[rowIndex];

  if (row.length === 1) {
    next[rowIndex] =
      target.slotIndex === 0 ? [chartId, row[0]] : [row[0], chartId];
  } else {
    // Insert into a full row; the overflowing chart gets its own row below.
    const inserted = [...row];
    inserted.splice(target.slotIndex, 0, chartId);
    next[rowIndex] = [inserted[0], inserted[1]];
    next.splice(rowIndex + 1, 0, [inserted[2]]);
  }

  return chartRowsEqual(rows, next) ? rows : next;
}
