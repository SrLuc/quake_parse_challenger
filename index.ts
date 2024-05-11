import * as fs from "fs";
import * as path from "path";
import GameParser from "./ts/GameParser";

export function processGameFile() {
  //Tenta ler o arquivo de log
  try {
    //Lê o conteúdo do arquivo
    const fileContent: string = fs.readFileSync("games.log", "utf8");

    //Separa o conteúdo do arquivo em linhas
    const lines: string[] = fileContent.split("\n");

    //Variáveis para controle de seção de jogo
    let isInGameSection: boolean = false;

    //Variável para armazenar a seção de jogo
    let gameSection: string[] = [];

    //Instancia o parser de jogo
    const gameParser = new GameParser();

    //Itera sobre as linhas do arquivo
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

    //Cria um arquivo para cada seção de jogo e um arquivo de arquivo de jogos
    const gameSections = gameParser.games.reduce((sections, game) => {
      const fileName = `game_${game.gameId}.txt`;
      const filePath = path.join("games", fileName);
      fs.writeFileSync(filePath, gameSection.join("\n"));
      console.log(
        `Game section ${game.gameId} has been written to ${filePath}`
      );

      const gameHash = `game_${game.gameId}`;
      sections[gameHash] = {
        total_kills: game.totalKills,
        players: game.players.map((player) => player.name),
        kills: game.kills,
      };

      return sections;
    }, {});

    //Cria um arquivo json com as informações dos jogos
    fs.writeFileSync(
      "game_archive.json",
      JSON.stringify(gameSections, null, 2)
    );
    console.log("Game archive created successfully.");

    //Gera os relatórios dos jogos e imprime no console
    gameParser.generateReports();
  } catch (error) {
    console.error(
      "An error occurred while reading or processing the file:",
      error
    );
  }
}

processGameFile();
