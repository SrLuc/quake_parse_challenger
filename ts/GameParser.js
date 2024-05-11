"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Game_1 = require("./Game");
var GameParser = /** @class */ (function () {
    function GameParser() {
        this.games = [];
    }
    // Função para processar uma seção de jogo e retornar um objeto de jogo
    GameParser.prototype.parseGameSection = function (section) {
        var _this = this;
        // Cria um novo jogo
        var game = new Game_1.default(this.games.length + 1);
        // Variável para controle de decremento de morte do jogador
        var shouldDecrementNextKill = false;
        // Set para armazenar os jogadores encontrados na seção de jogo
        var encounteredPlayers = new Set();
        // Itera sobre as linhas da seção de jogo para processar as informações
        section.forEach(function (line, index) {
            if (line.includes("ClientUserinfoChanged")) {
                var playerNameStartIndex = line.indexOf("n\\") + 2;
                var playerNameEndIndex = line.indexOf("\\t\\");
                var playerName = line.slice(playerNameStartIndex, playerNameEndIndex);
                if (!encounteredPlayers.has(playerName)) {
                    game.addPlayer(playerName);
                    encounteredPlayers.add(playerName);
                }
            }
            if (line.includes("Kill:")) {
                game.totalKills++;
                var killInfo_1 = _this.parseKill(line);
                if (killInfo_1.killer === "<world>") {
                    var killedPlayer = killInfo_1.killed;
                    if (game.kills.hasOwnProperty(killedPlayer)) {
                        game.decrementKill(killedPlayer);
                    }
                }
                else {
                    if (!game.players.find(function (player) { return player.name === killInfo_1.killer; })) {
                        game.addPlayer(killInfo_1.killer);
                    }
                    game.incrementKill(killInfo_1.killer);
                    if (killInfo_1.killed === "<world>") {
                        shouldDecrementNextKill = true;
                    }
                }
            }
        });
        // Atualiza o total de mortes do jogo com base nas mortes do jogador
        game.totalKills = Object.values(game.kills).reduce(function (total, kills) { return total + kills; }, 0);
        return game;
    };
    // Função para processar a linha de morte de um jogador
    GameParser.prototype.parseKill = function (line) {
        var playerNameRegex = /:\s([^:]+)\skilled/;
        var playerNameMatch = line.match(playerNameRegex);
        if (playerNameMatch) {
            var killer = playerNameMatch[1];
            var parts = line.split(" ");
            var killedIndex = parts.findIndex(function (part) { return part === "by"; }) - 1;
            var killed = parts.slice(-killedIndex).join(" ");
            return { killer: killer, killed: killed };
        }
        else {
            return { killer: "", killed: "" };
        }
    };
    // Função para gerar os relatórios dos jogos e ranking de jogadores
    GameParser.prototype.generateReports = function () {
        // Generate game reports
        var gameReports = this.games.map(function (game) { return "game_".concat(game.gameId); });
        fs.writeFileSync("game_reports.json", JSON.stringify(gameReports, null, 2));
        // Generate player ranking
        var playerKills = this.calculatePlayerKills();
        var sortedPlayerKills = Object.entries(playerKills)
            .map(function (_a) {
            var player = _a[0], kills = _a[1];
            return ({ player: player, kills: kills });
        })
            .sort(function (a, b) { return b.kills - a.kills; });
        fs.writeFileSync("player_ranking.json", JSON.stringify(sortedPlayerKills, null, 2));
        console.log("Game reports and player ranking created successfully.");
    };
    // Função para calcular as mortes de cada jogador nos jogos processados
    GameParser.prototype.calculatePlayerKills = function () {
        var playerKills = {};
        this.games.forEach(function (game) {
            game.players.forEach(function (player) {
                if (!playerKills[player.name]) {
                    playerKills[player.name] = 0;
                }
                playerKills[player.name] += game.kills[player.name]; // Corrigido para contabilizar as mortes do jogador no jogo atual
            });
        });
        return playerKills;
    };
    return GameParser;
}());
exports.default = GameParser;
