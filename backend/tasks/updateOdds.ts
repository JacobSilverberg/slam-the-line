import pool from '../config/db.js';
import dateFormat from '../utils/dateFormat.js';
import logger from '../utils/logger.js';
import { calculateNFLWeekAndDay } from './nflWeekCalculator.js';
import { getOddsFromAPI } from './getOdds.js';

async function getTeamId(teamName: string): Promise<number> {
  const [result] = await pool.execute('SELECT id FROM teams WHERE full_name = ?', [teamName]) as any[];
  if (!result || result.length === 0) {
    throw new Error(`Team '${teamName}' not found in database`);
  }
  return result[0].id;
}

export async function fetchAndSaveOdds(): Promise<void> {
  logger.info('Starting fetchAndSaveOdds');

  const data = await getOddsFromAPI();
  logger.info(`Fetched ${data.length} games from Odds API`);

  const today = new Date();
  const { day: currentDay } = calculateNFLWeekAndDay(today);
  const isTuesday = currentDay === 1;

  for (const game of data) {
    try {
      const gameCommenceTime = new Date(game.commence_time);
      const { week: gameWeek, year: nflYear } = calculateNFLWeekAndDay(gameCommenceTime);

      const homeTeamId = await getTeamId(game.home_team);
      const awayTeamId = await getTeamId(game.away_team);

      const [existingSpreads] = await pool.execute(
        'SELECT home_open_spread, away_open_spread FROM games WHERE api_id = ?',
        [game.id]
      ) as any[];
      const shouldUpdateOpenSpreads = isTuesday || (existingSpreads[0]?.home_open_spread == null && existingSpreads[0]?.away_open_spread == null);

      let last_update_unformatted: string | undefined;
      let homeOpenSpread: number | undefined, awayOpenSpread: number | undefined;
      let homeCurrSpread: number | undefined, awayCurrSpread: number | undefined;

      for (const bookmaker of game.bookmakers) {
        for (const market of bookmaker.markets) {
          if (market.key === 'spreads') {
            last_update_unformatted = market.last_update;
            const homeSpread = market.outcomes.find((o: any) => o.name === game.home_team);
            const awaySpread = market.outcomes.find((o: any) => o.name === game.away_team);
            if (shouldUpdateOpenSpreads) {
              homeOpenSpread = homeSpread?.point;
              awayOpenSpread = awaySpread?.point;
              homeCurrSpread = homeOpenSpread;
              awayCurrSpread = awayOpenSpread;
            } else {
              homeCurrSpread = homeSpread?.point;
              awayCurrSpread = awaySpread?.point;
            }
          }
        }
      }

      if (!last_update_unformatted) {
        logger.warn(`Missing last_update for game ${game.id}, skipping`);
        continue;
      }

      const last_update = dateFormat(last_update_unformatted);
      const gameStarted = gameCommenceTime < new Date() ? 1 : 0;

      const [existingGame] = await pool.execute('SELECT id FROM games WHERE api_id = ?', [game.id]) as any[];

      if (existingGame.length > 0) {
        await pool.execute(
          `UPDATE games SET
            updated_at = ?, home_team_id = ?, away_team_id = ?,
            home_open_spread = ?, away_open_spread = ?,
            home_curr_spread = ?, away_curr_spread = ?,
            week = ?, nfl_year = ?, game_started = ?, game_start_time = ?
           WHERE api_id = ?`,
          [
            last_update, homeTeamId, awayTeamId,
            shouldUpdateOpenSpreads ? homeOpenSpread : existingSpreads[0]?.home_open_spread,
            shouldUpdateOpenSpreads ? awayOpenSpread : existingSpreads[0]?.away_open_spread,
            homeCurrSpread ?? homeOpenSpread,
            awayCurrSpread ?? awayOpenSpread,
            gameWeek, nflYear, gameStarted, gameCommenceTime,
            game.id,
          ]
        );
      } else {
        // ml_odds/total columns are NOT NULL in the schema but unused by the app;
        // insert 0 placeholders since we no longer fetch those markets.
        await pool.execute(
          `INSERT INTO games (
            api_id, updated_at, home_team_id, away_team_id,
            home_open_spread, away_open_spread, home_curr_spread, away_curr_spread,
            home_ml_odds, away_ml_odds, game_open_total, game_curr_total,
            game_over_odds, game_under_odds, week, nfl_year, game_started, game_start_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, ?, ?, ?, ?)`,
          [
            game.id, last_update, homeTeamId, awayTeamId,
            homeOpenSpread, awayOpenSpread,
            homeCurrSpread ?? homeOpenSpread,
            awayCurrSpread ?? awayOpenSpread,
            gameWeek, nflYear, gameStarted, gameCommenceTime,
          ]
        );
      }
    } catch (err: any) {
      logger.error(`Error processing game ${game.id}`, { error: err.message });
    }
  }

  logger.info('fetchAndSaveOdds complete');
}
