export interface GameData {
  total_kills: number;
  players: string[];
  kills: Record<string, number>;
}

export interface GameApiResponse {
  [gameId: string]: GameData;
}
