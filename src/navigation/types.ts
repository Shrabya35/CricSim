import { UserPlayers } from '../database/userPlayersDB';
import { Team } from '../types/team';
import { TossState } from '../screens/TossScreen';
import { GameState } from '../types/match';
import { inningInterface } from '../screens/MatchScreen';
import { GameEndResult } from '../database/standings';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  TeamSelection: undefined;
  Dashboard: undefined;
  Standings: undefined;
  Squad: undefined;
  PlayerStats: { player: UserPlayers };
  History: undefined;
  Fixtures: undefined;
  Club: { team: Team };
  MatchCenter: undefined;
  Toss: undefined;
  Match: { tossState: TossState };
  MatchSummary: { state: GameState; bothTeam: inningInterface | null };
  Statistics: undefined;
  SeasonSummary: { result: GameEndResult };
};
