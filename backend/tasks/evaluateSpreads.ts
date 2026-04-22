import pool from '../config/db.js';
import logger from '../utils/logger.js';

export async function evaluateSpreads(): Promise<void> {
  logger.info('Starting evaluateSpreads');

  const [games] = await pool.query(`
    SELECT api_id, home_curr_spread, home_points, away_points
    FROM games
    WHERE game_completed = 1 AND spread_winner IS NULL
  `) as any[];

  logger.info(`Evaluating spreads for ${games.length} completed games`);

  for (const game of games) {
    const home_curr_spread = parseFloat(game.home_curr_spread);
    const home_points = parseFloat(game.home_points);
    const away_points = parseFloat(game.away_points);
    const adjustedHome = home_points + home_curr_spread;

    let spread_winner: 'home' | 'away' | 'push';
    if (adjustedHome > away_points) spread_winner = 'home';
    else if (adjustedHome < away_points) spread_winner = 'away';
    else spread_winner = 'push';

    await pool.query('UPDATE games SET spread_winner = ? WHERE api_id = ?', [spread_winner, game.api_id]);
  }

  logger.info('evaluateSpreads complete');
}
