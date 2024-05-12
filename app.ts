import * as gameController from "./controllers/gameController";

const express = require("express");
const app = express();

var cors = require("cors");
app.use(cors());

app.get("/games", gameController.getGames);
app.get("/game/:id", gameController.getGameById);
app.get("/reports", gameController.getReports);
app.get("/ranking", gameController.getRanking);

export default app;
