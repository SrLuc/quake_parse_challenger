"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGameFile = void 0;
var fs = require("fs");
var path = require("path");
var GameParser_1 = require("./ts/GameParser");
function processGameFile() {
    //Tenta ler o arquivo de log
    try {
        //Lê o conteúdo do arquivo
        var fileContent = fs.readFileSync("games.log", "utf8");
        //Separa o conteúdo do arquivo em linhas
        var lines = fileContent.split("\n");
        //Variáveis para controle de seção de jogo
        var isInGameSection_1 = false;
        //Variável para armazenar a seção de jogo
        var gameSection_1 = [];
        //Instancia o parser de jogo
        var gameParser_1 = new GameParser_1.default();
        //Itera sobre as linhas do arquivo
        lines.forEach(function (line, index) {
            if (line.includes("InitGame:")) {
                isInGameSection_1 = true;
                gameSection_1 = [];
            }
            else if (line.includes("ShutdownGame:")) {
                isInGameSection_1 = false;
                var game = gameParser_1.parseGameSection(gameSection_1);
                gameParser_1.games.push(game);
            }
            else if (isInGameSection_1) {
                gameSection_1.push(line);
            }
        });
        //Cria um arquivo para cada seção de jogo e um arquivo de arquivo de jogos
        var gameSections = gameParser_1.games.reduce(function (sections, game) {
            var fileName = "game_".concat(game.gameId, ".txt");
            var filePath = path.join("games", fileName);
            fs.writeFileSync(filePath, gameSection_1.join("\n"));
            var gameHash = "game_".concat(game.gameId);
            sections[gameHash] = {
                total_kills: game.totalKills,
                players: game.players.map(function (player) { return player.name; }),
                kills: game.kills,
            };
            console.log("Game ".concat(game.gameId, " has been added to the game archive."));
            return sections;
        }, {});
        //Cria um arquivo json com as informações dos jogos
        fs.writeFileSync("game_archive.json", JSON.stringify(gameSections, null, 2));
        console.log("Game archive created successfully.");
        //Gera os relatórios dos jogos e imprime no console
        gameParser_1.generateReports();
    }
    catch (error) {
        console.error("An error occurred while reading or processing the file:", error);
    }
}
exports.processGameFile = processGameFile;
processGameFile();
