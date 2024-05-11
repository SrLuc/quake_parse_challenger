"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Player = /** @class */ (function () {
    function Player(name) {
        this.name = name;
        this.kills = 0;
    }
    return Player;
}());
var Game = /** @class */ (function () {
    function Game(gameId) {
        this.gameId = gameId;
        this.totalKills = 0;
        this.players = [];
        this.kills = {};
    }
    Game.prototype.addPlayer = function (playerName) {
        var player = new Player(playerName);
        this.players.push(player);
        this.kills[playerName] = 0;
    };
    Game.prototype.incrementKill = function (playerName) {
        this.kills[playerName]++;
        this.totalKills++;
    };
    Game.prototype.decrementKill = function (playerName) {
        this.kills[playerName]--;
        this.totalKills--;
    };
    return Game;
}());
var GameParser = /** @class */ (function () {
    function GameParser() {
        this.games = [];
    }
    GameParser.prototype.parseGameSection = function (section) {
        var _this = this;
        var game = new Game(this.games.length + 1);
        var shouldDecrementNextKill = false;
        var encounteredPlayers = new Set();
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
        return game;
    };
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
    GameParser.prototype.calculatePlayerKills = function () {
        var playerKills = {};
        this.games.forEach(function (game) {
            game.players.forEach(function (player) {
                if (!playerKills[player.name]) {
                    playerKills[player.name] = 0;
                }
                playerKills[player.name] += player.kills;
            });
        });
        return playerKills;
    };
    return GameParser;
}());
try {
    var fileContent = fs.readFileSync("games.txt", "utf8");
    var lines = fileContent.split("\n");
    var isInGameSection_1 = false;
    var gameSection_1 = [];
    var gameParser_1 = new GameParser();
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
    var gameSections = gameParser_1.games.reduce(function (sections, game) {
        var fileName = "game_".concat(game.gameId, ".txt");
        var filePath = path.join("games", fileName);
        fs.writeFileSync(filePath, gameSection_1.join("\n"));
        console.log("Game section ".concat(game.gameId, " has been written to ").concat(filePath));
        var gameHash = "game_".concat(game.gameId);
        sections[gameHash] = {
            total_kills: game.totalKills,
            players: game.players.map(function (player) { return player.name; }),
            kills: game.kills,
        };
        return sections;
    }, {});
    fs.writeFileSync("game_archive.json", JSON.stringify(gameSections, null, 2));
    console.log("Game archive created successfully.");
    gameParser_1.generateReports();
}
catch (error) {
    console.error("An error occurred while reading or processing the file:", error);
}
