import { COMMENTARY } from '../constants';
import { BallOutcome, Fielding, WicketType } from '../services/matchService';
import { Player } from '../types/match';

export const mapToPlayers = (
  playersArray: any[],
  useIndexAsPosition = false,
): Player[] => {
  return playersArray.map((p, index) => ({
    name: p.name,
    role: p.role,
    orderType: p.orderType,
    isCaptain: p.isCaptain,
    batting: p.batting,
    bowling: p.bowling,
    bowlingType: p.bowlingType,
    position: useIndexAsPosition ? index + 1 : p.position,
  }));
};

const randomFrom = <T extends readonly string[]>(arr: T): string =>
  arr[Math.floor(Math.random() * arr.length)];

type SimpleBallType = Exclude<keyof typeof COMMENTARY, 'run' | 'wicket'>;

const getBallCommentary = (type: SimpleBallType): string => {
  return randomFrom(COMMENTARY[type]);
};

const getRunCommentary = (runs: 1 | 2 | 3, legBye: boolean): string => {
  const type = legBye ? 'lb' : 'bat';
  const options = COMMENTARY.run[runs][type];
  return options[Math.floor(Math.random() * options.length)];
};

const getWicketCommentary = (wicketType: WicketType): string => {
  return randomFrom(COMMENTARY.wicket[wicketType]);
};

export const getBallCommentaryFromOutcome = (
  outcome: BallOutcome,
): { commentary: string; outcome: string } => {
  switch (outcome.type) {
    case 'run': {
      return {
        commentary: getRunCommentary(outcome.runs, outcome.legBye),
        outcome: outcome.legBye ? `${outcome.runs}lb` : `${outcome.runs}`,
      };
    }

    case 'four':
      return { commentary: getBallCommentary('four'), outcome: '4' };

    case 'six':
      return { commentary: getBallCommentary('six'), outcome: '6' };

    case 'wide':
      return { commentary: getBallCommentary('wide'), outcome: 'wide' };

    case 'noBall':
      return { commentary: getBallCommentary('noBall'), outcome: 'nb' };

    case 'wicket':
      return {
        commentary: getWicketCommentary(outcome.wicketType),
        outcome: 'wk',
      };

    case 'dot':
    default:
      return { commentary: getBallCommentary('dot'), outcome: '0' };
  }
};

const getRandomFielder = (
  players: Player[],
  excludeName: string,
  role?: string,
) => {
  const filtered = players.filter(
    p => p.name !== excludeName && (role ? p.role === role : true),
  );

  if (filtered.length === 0) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
};

export const getOutType = ({
  wicketType,
  bowler,
  fieldingTeam,
}: {
  wicketType: WicketType;
  bowler: Player;
  fieldingTeam: Player[];
}): { text: string; bowlerGetsWicket: boolean } => {
  switch (wicketType) {
    case 'bowled':
      return {
        text: `b. ${bowler.name}`,
        bowlerGetsWicket: true,
      };

    case 'lbw':
      return {
        text: `lbw ${bowler.name}`,
        bowlerGetsWicket: true,
      };

    case 'caught': {
      const fielder = getRandomFielder(fieldingTeam, bowler.name) ?? bowler;

      return {
        text: `b. ${bowler.name} c. ${fielder.name}`,
        bowlerGetsWicket: true,
      };
    }

    case 'runOut': {
      const fielder = getRandomFielder(fieldingTeam, bowler.name) ?? bowler;

      return {
        text: `run out (${fielder.name})`,
        bowlerGetsWicket: false,
      };
    }

    default:
      return {
        text: 'out',
        bowlerGetsWicket: true,
      };
  }
};

export const getFieldingType = (fielding: string): Fielding => {
  if (fielding.toLowerCase().includes('attacking')) return 'attacking';
  if (fielding.toLowerCase().includes('defensive')) return 'defensive';
  return 'neutral';
};

export const ballsToOver = (balls: number): string => {
  const completeOvers = Math.floor(balls / 6);
  const ballsInOver = balls % 6;
  return `${completeOvers}.${ballsInOver}`;
};

export const generateBowlingLineup = (players: Player[]): Player[] => {
  const bowlers = players.filter(p => p.role === 'BOWL' || p.role === 'AR');

  if (bowlers.length < 5) {
    throw new Error('At least 5 bowlers are required.');
  }

  const totalOvers = 20;
  const maxOversPerBowler = 4;

  let pool: Player[] = [];
  bowlers.forEach(b => {
    for (let i = 0; i < maxOversPerBowler; i++) pool.push(b);
  });

  const lineup: Player[] = [];

  while (lineup.length < totalOvers) {
    const available = pool.filter(
      b => b.name !== lineup[lineup.length - 1]?.name,
    );

    if (available.length === 0) {
      throw new Error(
        'Cannot generate a valid lineup without consecutive overs',
      );
    }

    const selected = available[Math.floor(Math.random() * available.length)];

    lineup.push(selected);

    const index = pool.findIndex(p => p.name === selected.name);
    pool.splice(index, 1);
  }
  // console.log(lineup);
  return lineup;
};
