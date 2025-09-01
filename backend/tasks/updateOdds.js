import pool from '../config/db.js';
import dateFormat from '../utils/dateFormat.js';
import { calculateNFLWeekAndDay } from './nflWeekCalculator.js';
import { getOddsFromAPI } from './getOdds.js';

export async function fetchAndSaveOdds() {
  try {
    // Fetch data from the API
    const data = await getOddsFromAPI();

    const today = new Date();
    const { day: currentDay } = calculateNFLWeekAndDay(today);
    const isTuesday = currentDay === 1; // Tuesday is the first day of the NFL week

    for (const game of data) {
      // Get the game commence time and calculate the NFL week for the game
      const gameCommenceTime = new Date(game.commence_time);
      const { week: gameWeek, day: gameDay, nflYear } =
        calculateNFLWeekAndDay(gameCommenceTime);

      // Get home and away team id's
      const homeTeamId = await getTeamId(pool, game.home_team);
      const awayTeamId = await getTeamId(pool, game.away_team);

      // Initialize variables for SQL update
      let last_update, last_update_unformatted;
      let homeOpenSpread, awayOpenSpread, homeCurrSpread, awayCurrSpread;
      let homeMlOdds, awayMlOdds;
      let gameOpenTotal, gameCurrTotal, gameOverOdds, gameUnderOdds;

      // Fetch existing spreads from the database
      const [existingSpreads] = await pool.execute(
        'SELECT home_open_spread, away_open_spread FROM games WHERE api_id = ?',
        [game.id]
      );

      // Parse the API response into variables
      for (const bookmaker of game.bookmakers) {
        for (const market of bookmaker.markets) {
          switch (market.key) {
            case 'h2h':
              homeMlOdds = market.outcomes.find(
                (o) => o.name === game.home_team
              )?.price;
              awayMlOdds = market.outcomes.find(
                (o) => o.name === game.away_team
              )?.price;
              break;
            case 'spreads':
              last_update_unformatted = market.last_update;
              const homeSpread = market.outcomes.find(
                (o) => o.name === game.home_team
              );
              const awaySpread = market.outcomes.find(
                (o) => o.name === game.away_team
              );

              if (
                isTuesday ||
                (!existingSpreads.home_open_spread &&
                  !existingSpreads.away_open_spread)
              ) {
                // Set both open and current spreads on Tuesday or if no open spread exists
                homeOpenSpread = homeSpread?.point;
                awayOpenSpread = awaySpread?.point;
                homeCurrSpread = homeOpenSpread;
                awayCurrSpread = awayOpenSpread;
              } else {
                // Otherwise, only update the current spread
                homeCurrSpread = homeSpread?.point;
                awayCurrSpread = awaySpread?.point;
              }
              break;
            case 'totals':
              const totalOutcome = market.outcomes.find(
                (o) => o.name === 'Over'
              );
              if (!gameOpenTotal) {
                gameOpenTotal = totalOutcome?.point;
              } else {
                gameCurrTotal = totalOutcome?.point;
              }
              gameOverOdds = totalOutcome?.price;
              gameUnderOdds = market.outcomes.find(
                (o) => o.name === 'Under'
              )?.price;
              break;
          }
        }
      }

      // Ensure last_update_unformatted is valid
      if (!last_update_unformatted) {
        console.error('Missing last_update_unformatted for game:', game.id);
        continue; // Skip this iteration and move to the next game
      }

      // Parse the ISO 8601 date string into a JavaScript Date object
      try {
        last_update = dateFormat(last_update_unformatted);
      } catch (error) {
        console.error(
          'Error parsing last_update_unformatted:',
          last_update_unformatted,
          'Error:',
          error
        );
        continue; // Skip this iteration and move to the next game
      }

      // Check if the game has started
      const gameStarted = gameCommenceTime < new Date() ? 1 : 0;

      // Check if the game exists
      const [existingGame] = await pool.execute(
        'SELECT id FROM games WHERE api_id = ?',
        [game.id]
      );

      if (existingGame.length > 0) {
        // Update the existing game
        const updateQuery = `
          UPDATE games
          SET updated_at = ?,
              home_team_id = ?,
              away_team_id = ?,
              home_open_spread = COALESCE(home_open_spread, ?),
              away_open_spread = COALESCE(away_open_spread, ?),
              home_curr_spread = ?,
              away_curr_spread = ?,
              home_ml_odds = ?,
              away_ml_odds = ?,
              game_open_total = COALESCE(game_open_total, ?),
              game_curr_total = ?,
              game_over_odds = ?,
              game_under_odds = ?,
              week = ?,
              nfl_year = ?,
              game_started = ?,
              game_start_time = ?
          WHERE api_id = ?
        `;
        const updateValues = [
          last_update,
          homeTeamId,
          awayTeamId,
          homeOpenSpread,
          awayOpenSpread,
          homeCurrSpread || homeOpenSpread,
          awayCurrSpread || awayOpenSpread,
          homeMlOdds,
          awayMlOdds,
          gameOpenTotal,
          gameCurrTotal || gameOpenTotal,
          gameOverOdds,
          gameUnderOdds,
          gameWeek, // Use gameWeek calculated based on commence_time
          nflYear,  // Add nflYear here
          gameStarted,
          gameCommenceTime, // Set the game_start_time to gameCommenceTime
          game.id,
        ];
        await pool.execute(updateQuery, updateValues);
      } else {
        // Insert a new game
        const insertQuery = `
          INSERT INTO games (api_id, 
            updated_at, 
            home_team_id, 
            away_team_id, 
            home_open_spread, 
            away_open_spread, 
            home_curr_spread, 
            away_curr_spread, 
            home_ml_odds, 
            away_ml_odds, 
            game_open_total, 
            game_curr_total, 
            game_over_odds, 
            game_under_odds, 
            week, 
            nfl_year,
            game_started,
            game_start_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [
          game.id,
          last_update,
          homeTeamId,
          awayTeamId,
          homeOpenSpread,
          awayOpenSpread,
          homeCurrSpread || homeOpenSpread,
          awayCurrSpread || awayOpenSpread,
          homeMlOdds,
          awayMlOdds,
          gameOpenTotal,
          gameCurrTotal || gameOpenTotal,
          gameOverOdds,
          gameUnderOdds,
          gameWeek, // Use gameWeek calculated based on commence_time
          nflYear,  // Add nflYear here
          gameStarted,
          gameCommenceTime, // Insert the game_start_time
        ];
        await pool.execute(insertQuery, insertValues);
      }
    }

    console.log('Odds updated successfully');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function getTeamId(pool, teamName) {
  try {
    const [result] = await pool.execute(
      'SELECT id FROM teams WHERE full_name = ?',
      [teamName]
    );
    if (!result || result.length === 0) {
      throw new Error(`Team '${teamName}' not found in the database`);
    }
    return result[0].id;
  } catch (error) {
    console.error('Error executing SQL query:', error);
    throw error; // Rethrow the error to be caught in the fetchAndSaveOdds function
  }
}