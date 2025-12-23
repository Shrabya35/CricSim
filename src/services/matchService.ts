export type Batsman = {
  battingSkill: number;
  aggression: 1 | 2 | 3 | 4 | 5;
  isCaptain?: boolean;
  order: 'top' | 'middle' | 'lower';
};

export type Bowler = {
  bowlingSkill: number;
  type: 'fast' | 'medium' | 'spin';
};

export type Fielding = 'attacking' | 'neutral' | 'defensive';

export type GamePhase = 'powerplay' | 'middle' | 'death';

export type GameState = {
  phase: GamePhase;
  chasing: boolean;
  runsLeft?: number;
  ballsLeft?: number;
  wicketsLost: number;
};

export type WicketType = 'bowled' | 'caught' | 'runOut' | 'lbw';

export type BallOutcome =
  | { type: 'dot' }
  | { type: 'run'; runs: 1 | 2 | 3; legBye: boolean }
  | { type: 'four' }
  | { type: 'six' }
  | { type: 'wicket'; wicketType: WicketType }
  | { type: 'wide' }
  | { type: 'noBall' };

function weightedRandom<T extends Record<string, number>>(weights: T): keyof T {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const key in weights) {
    r -= weights[key]!;
    if (r <= 0) return key as keyof T;
  }
  return Object.keys(weights)[0] as keyof T;
}

export function simulateBall(
  batsman: Batsman,
  bowler: Bowler,
  fielding: Fielding,
  gameState: GameState,
): BallOutcome {
  let probs: Record<string, number> = {
    dot: 0.25,
    oneRun: 0.25,
    twoRun: 0.1,
    threeRun: 0.03,
    four: 0.15,
    six: 0.05,
    wicket: 0.08,
    wide: 0.015,
    noBall: 0.015,
  };

  switch (gameState.phase) {
    case 'powerplay':
      probs.dot += 0.04;
      probs.oneRun += 0.08;
      probs.twoRun += 0.05;
      probs.four -= 0.03;
      probs.six -= 0.04;
      probs.wicket -= 0.01;
      break;
    case 'middle':
      probs.dot += 0.05;
      probs.oneRun += 0.03;
      probs.twoRun += 0.02;
      probs.four += 0.03;
      probs.six += 0.01;
      probs.wicket += 0.01;
      break;
    case 'death':
      probs.dot -= 0.05;
      probs.oneRun += 0.03;
      probs.twoRun += 0.02;
      probs.four += 0.05;
      probs.six += 0.03;
      probs.wicket += 0.02;
      break;
  }

  const skillFactor = (batsman.battingSkill - bowler.bowlingSkill) * 0.002;
  probs.dot = Math.max(0.05, probs.dot - skillFactor);
  probs.oneRun += skillFactor * 0.5;
  probs.four += skillFactor * 0.3;
  probs.wicket = Math.max(0.01, probs.wicket - skillFactor * 0.5);

  if (fielding === 'attacking') probs.wicket += 0.02;
  if (fielding === 'defensive') probs.wicket -= 0.01;

  switch (gameState.phase) {
    case 'powerplay':
      probs.four += 0.03;
      probs.six -= 0.02;
      probs.dot += 0.05;
      probs.wicket -= 0.03;
      break;
    case 'middle':
      probs.dot += 0.02;
      probs.four -= 0.01;
      probs.six -= 0.005;
      break;
    case 'death':
      probs.four += 0.05;
      probs.six += 0.03;
      probs.dot -= 0.03;
      probs.wicket += 0.02;
      break;
  }

  const total = Object.values(probs).reduce((a, b) => a + b, 0);
  for (const key in probs) {
    probs[key] = probs[key] / total;
  }

  const outcomeKey = weightedRandom(probs);

  switch (outcomeKey) {
    case 'dot':
      return { type: 'dot' };
    case 'oneRun':
      return { type: 'run', runs: 1, legBye: Math.random() < 0.05 };
    case 'twoRun':
      return { type: 'run', runs: 2, legBye: Math.random() < 0.05 };
    case 'threeRun':
      return { type: 'run', runs: 3, legBye: Math.random() < 0.05 };
    case 'four':
      return { type: 'four' };
    case 'six':
      return { type: 'six' };
    case 'wicket':
      const wicketTypes: WicketType[] = ['bowled', 'caught', 'runOut', 'lbw'];
      return {
        type: 'wicket',
        wicketType: wicketTypes[Math.floor(Math.random() * wicketTypes.length)],
      };
    case 'wide':
      return { type: 'wide' };
    case 'noBall':
      return { type: 'noBall' };
    default:
      return { type: 'dot' };
  }
}
