export interface Player {
  name: string;
  role: string;
  orderType: string;
  isCaptain: boolean;
  batting: number;
  bowling: number;
  bowlingType?: string;
  position: number;
}

export interface ActivePlayer {
  player: Player;
  aggression: number;
  run: number;
  ball: number;
}

export interface ActivePlayersState {
  left: ActivePlayer | null;
  right: ActivePlayer | null;
}

export interface BatsmanState {
  player: Player;
  runs: number;
  balls: number;
  status: string;
  outType?: string;
}

export interface BowlerState {
  player: Player;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
}

export type InningState = {
  runs: number;
  wickets: number;
  balls: number;
  batsmen: BatsmanState[];
  bowlers: { [key: string]: BowlerState };
  currentBowlerId: string;
};

export interface GameState {
  inning1: InningState;
  inning2?: InningState;
  battingTeam: 'user' | 'opp';
  bowlingTeam: 'user' | 'opp';
  over: number;
  ballInOver: number;
  currentInnings: 1 | 2;
}

export interface TeamStatseInterface {
  action: 'bat' | 'ball';
  chasing: boolean;
  run: number;
  wicket: number;
  runRate: number;
}

export interface commentaryString {
  result: string | null;
  commentary: string;
}
