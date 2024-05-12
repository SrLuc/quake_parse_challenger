import { useState, useEffect } from "react";
import "../src/css/index.css";

interface GameData {
  total_kills: number;
  players: string[];
  kills: Record<string, number>;
}

interface GameApiResponse {
  [gameId: string]: GameData;
}

function App() {
  const [gameData, setGameData] = useState<GameData[]>([]);

  useEffect(() => {
    fetch("http://localhost:4545/games")
      .then((res) => res.json())
      .then((data: GameApiResponse) => {
        const gamesData = Object.values(data);
        setGameData(gamesData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <main className="container">
      <section>
        {gameData.map(({ total_kills, players, kills }, index) => (
          <div key={index} className="games">
            <h2>Partida {index + 1}</h2>
            <p>Total Kills: {total_kills}</p>
            <ul>
              {players.map((player, playerIndex) => (
                <li key={playerIndex}>
                  Player: {player} - Kills: {kills[player] || 0}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <article>
        
      </article>
    </main>
  );
}

export default App;
