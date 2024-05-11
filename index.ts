import * as fs from "fs";
import * as path from "path";

class Player {
  name: string;
  kills: number;

  constructor(name: string) {
    this.name = name;
    this.kills = 0;
  }
}

class Game {
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

  addPlayer(playerName: string) {
    const player = new Player(playerName);
    this.players.push(player);
    this.kills[playerName] = 0;
  }

  incrementKill(playerName: string) {
    this.kills[playerName]++;
    this.totalKills++;
  }

  decrementKill(playerName: string) {
    this.kills[playerName]--;
    this.totalKills--;
  }
}

class GameParser {
  games: Game[];

  constructor() {
    this.games = [];
  }

  parseGameSection(section: string[]): Game {
    const game = new Game(this.games.length + 1);

    let shouldDecrementNextKill = false;
    const encounteredPlayers: Set<string> = new Set();

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

    // Recalculate total kills based on individual player kills
    game.totalKills = Object.values(game.kills).reduce(
      (total: number, kills: number) => total + kills,
      0
    );

    return game;
  }

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

try {
  const fileContent: string = fs.readFileSync("games.log", "utf8");
  const lines: string[] = fileContent.split("\n");

  let isInGameSection: boolean = false;
  let gameSection: string[] = [];

  const gameParser = new GameParser();

  lines.forEach((line, index) => {
    if (line.includes("InitGame:")) {
      isInGameSection = true;
      gameSection = [];
    } else if (line.includes("ShutdownGame:")) {
      isInGameSection = false;
      const game = gameParser.parseGameSection(gameSection);
      gameParser.games.push(game);
    } else if (isInGameSection) {
      gameSection.push(line);
    }
  });

  const gameSections = gameParser.games.reduce((sections, game) => {
    const fileName = `game_${game.gameId}.txt`;
    const filePath = path.join("games", fileName);
    fs.writeFileSync(filePath, gameSection.join("\n"));
    console.log(`Game section ${game.gameId} has been written to ${filePath}`);

    const gameHash = `game_${game.gameId}`;
    sections[gameHash] = {
      total_kills: game.totalKills,
      players: game.players.map((player) => player.name),
      kills: game.kills,
    };

    return sections;
  }, {});

  fs.writeFileSync("game_archive.json", JSON.stringify(gameSections, null, 2));
  console.log("Game archive created successfully.");

  gameParser.generateReports();
} catch (error) {
  console.error(
    "An error occurred while reading or processing the file:",
    error
  );
}
