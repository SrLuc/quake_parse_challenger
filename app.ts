const express = require("express");
const app = express();

import * as gameController from "./controllers/gameController";

app.get("/games", gameController.getGames);
app.get("/game/:id", gameController.getGameById);
app.get("/reports", gameController.getReports);
app.get("/ranking", gameController.getRanking);

export default app;
