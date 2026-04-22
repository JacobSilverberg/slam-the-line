import pool from '../config/db.js';
import dateFormat from '../utils/dateFormat.js';
import logger from '../utils/logger.js';
import { getScoresFromAPI } from './getScores.js';

export async function fetchAndSaveScores(): Promise<void> {
  logger.info('Starting fetchAndSaveScores');

  const data = await getScoresFromAPI();
  logger.info(`Fetched ${data.length} games from Scores API`);

  for (const game of data) {
    if (!game.completed) continue;

    let homeScore: string | undefined;
    let awayScore: string | undefined;

    for (const score of game.scores ?? []) {
      if (score.name === game.home_team) homeScore = score.score;
      else if (score.name === game.away_team) awayScore = score.score;
    }

    if (!game.last_update) {
      logger.warn(`Missing last_update for game ${game.id}, skipping`);
      continue;
    }

    let last_update: string;
    try {
      last_update = dateFormat(game.last_update);
    } catch {
      logger.warn(`Invalid date for game ${game.id}, skipping`);
      continue;
    }

    const [existing] = await pool.execute(
      'SELECT id, game_completed FROM games WHERE api_id = ?',
      [game.id]
    ) as any[];

    if (existing.length === 0) {
      logger.warn(`Game ${game.id} not found in DB, skipping`);
      continue;
    }

    try {
      await pool.execute(
        'UPDATE games SET updated_at = ?, home_points = ?, away_points = ?, game_completed = 1 WHERE api_id = ?',
        [last_update, homeScore, awayScore, game.id]
      );
      logger.info(`Updated scores for game ${game.id}: ${homeScore}-${awayScore}`);
    } catch (err: any) {
      logger.error(`Failed to update scores for game ${game.id}`, { error: err.message });
    }
  }

  logger.info('fetchAndSaveScores complete');
}
