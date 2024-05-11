"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("./Player");
var Game = /** @class */ (function () {
    function Game(gameId) {
        this.gameId = gameId;
        this.totalKills = 0;
        this.players = [];
        this.kills = {};
    }
    //função para adicionar um jogador ao jogo e inicializar o contador de kills
    Game.prototype.addPlayer = function (playerName) {
        var player = new Player_1.default(playerName);
        this.players.push(player);
        this.kills[playerName] = 0;
    };
    //função para remover um jogador do jogo e zerar o contador de kills
    Game.prototype.incrementKill = function (playerName) {
        this.kills[playerName]++;
        this.totalKills++;
    };
    //função para remover um jogador do jogo e decrementar o contador de kills
    Game.prototype.decrementKill = function (playerName) {
        this.kills[playerName]--;
        this.totalKills--;
    };
    return Game;
}());
exports.default = Game;
