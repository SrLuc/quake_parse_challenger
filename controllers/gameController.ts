import { Request, Response } from "express";

const gamesArchives = require("../game_archive.json");
const gameReports = require("../game_reports.json");
const playerRaking = require("../player_ranking.json");

export async function getGames(req: Request, res: Response) {
  res.json(gamesArchives);
}

export async function getGameById(req: Request, res: Response) {
  const gameId = req.params.id;
  const game = gamesArchives[`game_${gameId}`];
  if (game) {
    res.json(game);
  } else {
    res.status(404).send("Game not found.");
  }
}

export async function getReports(req: Request, res: Response) {
  res.json(gameReports);
}

export async function getRanking(req: Request, res: Response) {
  res.json(playerRaking);
}
