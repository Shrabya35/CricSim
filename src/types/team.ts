export interface Player {
  name: string;
  role: string;
  orderType: string;
  isCaptain: boolean;
  batting: number;
  bowling: number;
  bowlingType?: string;
}

export interface Team {
  name: string;
  logo: string;
  themeColor: string;
  players: Player[];
}
