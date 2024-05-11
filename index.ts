import * as fs from 'fs';
import * as path from 'path';

try {
    // Read the contents of the file
    const fileContent: string = fs.readFileSync('games.log', 'utf8');
    
    // Split the content by lines
    const lines: string[] = fileContent.split('\n');
    
    // Initialize variables to track the lines between markers
    let isInGameSection: boolean = false;
    let gameSection: string[] = [];
    let gameSections: any = {}; // Using an object instead of an array
    let gameId = 1; // Initialize the game ID
    
    // Process each line
    lines.forEach((line, index) => {
        if (line.includes('InitGame:')) {
            // Start of a new game section
            isInGameSection = true;
            gameSection = [];
        } else if (line.includes('ShutdownGame:')) {
            // End of the current game section
            isInGameSection = false;
            
            // Parse the game information
            const gameInfo = parseGameSection(gameSection);
            
            // Add the game info to the object with the key 'game_X'
            gameSections[`game_${gameId}`] = gameInfo;

            // Write the game section to a new file
            const fileName = `game_${gameId}.txt`;
            // Specify the full path to save the file in the 'games' folder
            const filePath = path.join('games', fileName);
            fs.writeFileSync(filePath, gameSection.join('\n'));
            console.log(`Game section ${gameId} has been written to ${filePath}`);
            
            // Increment the game ID
            gameId++;
        } else if (isInGameSection) {
            // Inside a game section, add the line to the current section
            gameSection.push(line);
        }
    });
    
    // Remove the 'id' field from each game section
    Object.values(gameSections).forEach((game: any) => {
        delete game.id;
    });
    
    // Write the game sections to a JSON archive
    fs.writeFileSync('game_archive.json', JSON.stringify(gameSections, null, 2));
    console.log('Game archive created successfully.');

} catch (error) {
    console.error('An error occurred while reading or processing the file:', error);
}

function parseGameSection(section: string[]): any {
    const game: any = {
        total_kills: 0,
        players: [],
        kills: {}
    };
    
    let shouldDecrementNextKill = false; // Flag to track if next kill should be decremented
    
    const encounteredPlayers: Set<string> = new Set(); // Set to store encountered players
    
    section.forEach((line, index) => {
        // Check for lines containing player information
        if (line.includes('ClientUserinfoChanged')) {
            const playerNameStartIndex = line.indexOf('n\\') + 2;
            const playerNameEndIndex = line.indexOf('\\t\\');
            const playerName = line.slice(playerNameStartIndex, playerNameEndIndex);
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
            const killInfo = parseKill(line);
            
            // If <world> killed a player, decrement that player's kill count
            if (killInfo.killer === '<world>') {
                const killedPlayer = killInfo.killed;
                if (game.kills.hasOwnProperty(killedPlayer)) {
                    game.kills[killedPlayer]--;
                }
            } else {
                // Update player kills
                if (!game.players.includes(killInfo.killer)) {
                    game.players.push(killInfo.killer);
                    game.kills[killInfo.killer] = 0;
                }
                
                // Decrement kill if flag is set
                if (shouldDecrementNextKill) {
                    game.kills[killInfo.killer]--;
                    shouldDecrementNextKill = false; // Reset flag
                } else {
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

function parseKill(line: string): { killer: string, killed: string } {
    const playerNameRegex = /:\s([^:]+)\skilled/;
    const playerNameMatch = line.match(playerNameRegex);

    if (playerNameMatch) {
        const killer = playerNameMatch[1];
        
        const parts: string[] = line.split(' ');
        const killedIndex = parts.findIndex(part => part === 'by') - 1;
        const killed: string = parts.slice(-killedIndex).join(' ');
        
        return { killer, killed };
    } else {
        return { killer: '', killed: '' };
    }
}
