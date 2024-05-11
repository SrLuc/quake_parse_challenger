import Player from "./Player";

export default class Game {
  gameId: number;
  totalKills: number;
  players: Player[];
  kills: { [key: string]: number };

  constructor(gameId: number) {
    this.gameId = gameId;
    this.totalKills = 0;
    this.players = [];
    this.kills = {};
  }

  //função para adicionar um jogador ao jogo e inicializar o contador de kills
  addPlayer(playerName: string) {
    const player = new Player(playerName);
    this.players.push(player);
    this.kills[playerName] = 0;
  }

  //função para remover um jogador do jogo e zerar o contador de kills
  incrementKill(playerName: string) {
    this.kills[playerName]++;
    this.totalKills++;
  }

  //função para remover um jogador do jogo e decrementar o contador de kills
  decrementKill(playerName: string) {
    this.kills[playerName]--;
    this.totalKills--;
  }
}
