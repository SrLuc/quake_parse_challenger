import { GameData } from "../models/models";

export async function fetchGameData(
  setGameData: React.Dispatch<React.SetStateAction<GameData[]>>,
  apiUrl: string,
  searchTerm?: string
) {
  try {
    let response;
    if (searchTerm) {
      const searchUrl = `http://localhost:4545/game/${searchTerm}`;
      response = await fetch(searchUrl);
    } else {
      response = await fetch(apiUrl);
    }

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (searchTerm) {
      const searchedGameData: GameData = data;
      setGameData([searchedGameData]);
    } else {
      const gamesData: GameData[] = Object.values(data);
      setGameData(gamesData);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
