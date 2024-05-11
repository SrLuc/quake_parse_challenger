import { Request, Response } from "express";

const express = require("express");
const app = express();

import * as gameController from "./controllers/gameController";

app.get("/games", gameController.getGames);
app.get("/games/:id", gameController.getGameById);
app.get("/reports", gameController.getReports);
app.get("/ranking", gameController.getRanking);

export default app;
