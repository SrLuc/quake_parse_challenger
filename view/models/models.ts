export interface GameData {
  total_kills: number;
  players: string[];
  player: string;
  kills: Record<string, number>;
}

export interface GameApiResponse {
  [gameId: string]: GameData;
}

export interface GameRanking {
  player: string;
  kills: number;
}
