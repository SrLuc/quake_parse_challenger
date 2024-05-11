import { Request, Response } from "express";

const gamesArchives = require("./game_archive.json");
const gameReports = require("./game_reports.json");
const playerRaking = require("./player_ranking.json");

const express = require("express");
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/games", (req: Request, res: Response) => {
  res.json(gamesArchives);
});

app.get("/game/:id", (req: Request, res: Response) => {
  const gameId = req.params.id;
  const game = gamesArchives[`game_${gameId}`];
  if (game) {
    res.json(game);
  } else {
    res.status(404).send("Game not found.");
  }
});

app.get("/reports", (req: Request, res: Response) => {
  res.json(gameReports);
});

app.get("/ranking", (req: Request, res: Response) => {
  res.json(playerRaking);
});

export default app;
