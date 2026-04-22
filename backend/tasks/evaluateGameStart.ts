import pool from '../config/db.js';
import logger from '../utils/logger.js';

export async function checkAndUpdateGameStatus(): Promise<void> {
  const [games] = await pool.query('SELECT api_id, game_start_time FROM games') as any[];
  const now = new Date();

  for (const game of games) {
    if (!game.game_start_time) continue;

    const gameStarted = new Date(game.game_start_time) < now ? 1 : 0;
    await pool.execute('UPDATE games SET game_started = ? WHERE api_id = ?', [gameStarted, game.api_id]);
  }

  logger.info('Game status check complete');
}
