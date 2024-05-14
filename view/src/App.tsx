import { useState, useEffect } from "react";
import { fetchGameData } from "../utils/api";
import { GameData } from "../models/models";
import Dash from "../components/chart/Dash";
import "../src/css/index.css";

function App() {
  const [gameData, setGameData] = useState<GameData[]>([]);
  const [searchTerm, setSearchTerm] = useState("" || null );
  const [searchError, setSearchError] = useState<boolean>(false);
  const [searchedGameId, setSearchedGameId] = useState<string | null>(null);

  useEffect(() => {
    fetchGameData(setGameData, "http://localhost:4545/games");
  }, []);

  const handleSearch = () => {
    if (!searchTerm || searchTerm == 0) {
      fetchGameData(setGameData, "http://localhost:4545/games");
      setSearchedGameId(null);
    } else {
      fetchGameData(
        setGameData,
        `http://localhost:4545/game/${searchTerm}`,
        searchTerm
      )
        .then(() => setSearchedGameId(searchTerm))
        .catch(() => {
          setSearchError(true);
          setSearchedGameId(null);
        });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <main className="container">
      <section>
        {gameData.map(({ total_kills, players, kills }, index) => (
          <div key={index} className="games">
            <h2>Partida: {searchedGameId ? searchedGameId : index + 1}</h2>{" "}
            <ul>
              {players.map((player, playerIndex) => (
                <li key={playerIndex}>
                  Player: {player} - Kills: {kills[player] || 0}
                </li>
              ))}
            </ul>
            <p>Total Kills: {total_kills}</p>
          </div>
        ))}
        {searchError && <p>Game not found. Please try again.</p>}{" "}
      </section>
      <article>
        <div>
          <input
            placeholder="type:1 or 2 or 3 or 0 to search all matches"
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
          />
          <button onClick={handleSearch}>Buscar</button>
          <Dash />
        </div>
      </article>
    </main>
  );
}

export default App;
