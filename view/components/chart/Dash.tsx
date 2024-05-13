import { Column } from "@ant-design/charts";
import { useEffect, useState } from "react";
import { fetchGameData } from "../../utils/api";
import { GameData } from "../../models/models";
import "../../src/css/index.css";

const Dash = () => {
  const [playerRanking, setPlayerRanking] = useState<GameData[]>([]); // Update the type here

  useEffect(() => {
    fetchGameData(setPlayerRanking, "http://localhost:4545/ranking");
  });

  const data = playerRanking.map(({ player, kills }) => ({
    Player: player,
    value: kills,
  }));

  return (
    <div className="dashboard">
      <h1 className="dashH1">Player Kill's Ranking</h1>
      <Column
        height={400}
        xField="Player"
        yField="value"
        data={data}
        colorField={"Player"}
      />
    </div>
  );
};

export default Dash;
