"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
try {
    // Read the contents of the file
    var fileContent = fs.readFileSync('games.log', 'utf8');
    // Split the content by lines
    var lines = fileContent.split('\n');
    // Initialize variables to track the lines between markers
    var isInGameSection_1 = false;
    var gameSection_1 = [];
    var gameSections_1 = {}; // Using an object instead of an array
    var gameId_1 = 1; // Initialize the game ID
    // Process each line
    lines.forEach(function (line, index) {
        if (line.includes('InitGame:')) {
            // Start of a new game section
            isInGameSection_1 = true;
            gameSection_1 = [];
        }
        else if (line.includes('ShutdownGame:')) {
            // End of the current game section
            isInGameSection_1 = false;
            // Parse the game information
            var gameInfo = parseGameSection(gameSection_1);
            // Add the game info to the object with the key 'game_X'
            gameSections_1["game_".concat(gameId_1)] = gameInfo;
            // Write the game section to a new file
            var fileName = "game_".concat(gameId_1, ".txt");
            // Specify the full path to save the file in the 'games' folder
            var filePath = path.join('games', fileName);
            fs.writeFileSync(filePath, gameSection_1.join('\n'));
            console.log("Game section ".concat(gameId_1, " has been written to ").concat(filePath));
            // Increment the game ID
            gameId_1++;
        }
        else if (isInGameSection_1) {
            // Inside a game section, add the line to the current section
            gameSection_1.push(line);
        }
    });
    // Remove the 'id' field from each game section
    Object.values(gameSections_1).forEach(function (game) {
        delete game.id;
    });
    // Write the game sections to a JSON archive
    fs.writeFileSync('game_archive.json', JSON.stringify(gameSections_1, null, 2));
    console.log('Game archive created successfully.');
}
catch (error) {
    console.error('An error occurred while reading or processing the file:', error);
}
function parseGameSection(section) {
    var game = {
        total_kills: 0,
        players: [],
        kills: {}
    };
    var shouldDecrementNextKill = false; // Flag to track if next kill should be decremented
    var encounteredPlayers = new Set(); // Set to store encountered players
    section.forEach(function (line, index) {
        // Check for lines containing player information
        if (line.includes('ClientUserinfoChanged')) {
            var playerNameStartIndex = line.indexOf('n\\') + 2;
            var playerNameEndIndex = line.indexOf('\\t\\');
            var playerName = line.slice(playerNameStartIndex, playerNameEndIndex);
            if (!encounteredPlayers.has(playerName)) { // Check if player already encountered
                game.players.push(playerName);
                game.kills[playerName] = 0; // Initialize player kills to 0
                encounteredPlayers.add(playerName); // Add player to encountered set
            }
        }
        // Check for lines containing kill information
        if (line.includes('Kill:')) {
            // Increment total kills for each occurrence of "Kill:"
            game.total_kills++;
            // Parse the kill information
            var killInfo = parseKill(line);
            // If <world> killed a player, decrement that player's kill count
            if (killInfo.killer === '<world>') {
                var killedPlayer = killInfo.killed;
                if (game.kills.hasOwnProperty(killedPlayer)) {
                    game.kills[killedPlayer]--;
                }
            }
            else {
                // Update player kills
                if (!game.players.includes(killInfo.killer)) {
                    game.players.push(killInfo.killer);
                    game.kills[killInfo.killer] = 0;
                }
                // Decrement kill if flag is set
                if (shouldDecrementNextKill) {
                    game.kills[killInfo.killer]--;
                    shouldDecrementNextKill = false; // Reset flag
                }
                else {
                    game.kills[killInfo.killer]++;
                }
            }
            // Check if next kill should be decremented
            if (killInfo.killed === '<world>') {
                shouldDecrementNextKill = true;
            }
        }
    });
    return game;
}
function parseKill(line) {
    var playerNameRegex = /:\s([^:]+)\skilled/;
    var playerNameMatch = line.match(playerNameRegex);
    if (playerNameMatch) {
        var killer = playerNameMatch[1];
        var parts = line.split(' ');
        var killedIndex = parts.findIndex(function (part) { return part === 'by'; }) - 1;
        var killed = parts.slice(-killedIndex).join(' ');
        return { killer: killer, killed: killed };
    }
    else {
        return { killer: '', killed: '' };
    }
}
