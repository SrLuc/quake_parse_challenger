import * as fs from "fs";
import Game from "./Game";

export default class GameParser {
  games: Game[];

  constructor() {
    this.games = [];
  }

  // Função para processar uma seção de jogo e retornar um objeto de jogo
  parseGameSection(section: string[]): Game {
    // Cria um novo jogo
    const game = new Game(this.games.length + 1);

    // Variável para controle de decremento de morte do jogador
    let shouldDecrementNextKill = false;

    // Set para armazenar os jogadores encontrados na seção de jogo
    const encounteredPlayers: Set<string> = new Set();

    // Itera sobre as linhas da seção de jogo para processar as informações
    section.forEach((line, index) => {
      if (line.includes("ClientUserinfoChanged")) {
        const playerNameStartIndex = line.indexOf("n\\") + 2;
        const playerNameEndIndex = line.indexOf("\\t\\");
        const playerName = line.slice(playerNameStartIndex, playerNameEndIndex);
        if (!encounteredPlayers.has(playerName)) {
          game.addPlayer(playerName);
          encounteredPlayers.add(playerName);
        }
      }

      if (line.includes("Kill:")) {
        game.totalKills++;

        const killInfo = this.parseKill(line);

        if (killInfo.killer === "<world>") {
          const killedPlayer = killInfo.killed;
          if (game.kills.hasOwnProperty(killedPlayer)) {
            game.decrementKill(killedPlayer);
          }
        } else {
          if (!game.players.find((player) => player.name === killInfo.killer)) {
            game.addPlayer(killInfo.killer);
          }
          game.incrementKill(killInfo.killer);

          if (killInfo.killed === "<world>") {
            shouldDecrementNextKill = true;
          }
        }
      }
    });

    // Atualiza o total de mortes do jogo com base nas mortes do jogador
    game.totalKills = Object.values(game.kills).reduce(
      (total: number, kills: number) => total + kills,
      0
    );

    return game;
  }

  // Função para processar a linha de morte de um jogador
  parseKill(line: string): { killer: string; killed: string } {
    const playerNameRegex = /:\s([^:]+)\skilled/;
    const playerNameMatch = line.match(playerNameRegex);

    if (playerNameMatch) {
      const killer = playerNameMatch[1];

      const parts: string[] = line.split(" ");
      const killedIndex = parts.findIndex((part) => part === "by") - 1;
      const killed: string = parts.slice(-killedIndex).join(" ");

      return { killer, killed };
    } else {
      return { killer: "", killed: "" };
    }
  }

  // Função para gerar os relatórios dos jogos e ranking de jogadores
  generateReports() {
    // Generate game reports
    const gameReports = this.games.map((game) => `game_${game.gameId}`);
    fs.writeFileSync("game_reports.json", JSON.stringify(gameReports, null, 2));

    // Generate player ranking
    const playerKills = this.calculatePlayerKills();
    const sortedPlayerKills = Object.entries(playerKills)
      .map(([player, kills]) => ({ player, kills }))
      .sort((a, b) => b.kills - a.kills);
    fs.writeFileSync(
      "player_ranking.json",
      JSON.stringify(sortedPlayerKills, null, 2)
    );

    console.log("Game reports and player ranking created successfully.");
  }

  // Função para calcular as mortes de cada jogador nos jogos processados
  calculatePlayerKills(): { [key: string]: number } {
    const playerKills: { [key: string]: number } = {};

    this.games.forEach((game) => {
      game.players.forEach((player) => {
        if (!playerKills[player.name]) {
          playerKills[player.name] = 0;
        }
        playerKills[player.name] += game.kills[player.name]; // Corrigido para contabilizar as mortes do jogador no jogo atual
      });
    });

    return playerKills;
  }
}
