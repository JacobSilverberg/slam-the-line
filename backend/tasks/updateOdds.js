import fs from 'fs';
import pool from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dateFormat from './dateFormat.js';

// Define the start date of the NFL season
const seasonStartDate = new Date('2024-09-04');

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the absolute path to the JSON file
const filePath = path.resolve(__dirname, '../data/api-data-odds.json');

// handle json formatting, reading from api-data.json
const rawData = fs.readFileSync(filePath);
const data = JSON.parse(rawData);

export async function fetchAndSaveOdds() {
  try {
    // const data = jsonData;

    for (const game of data) {
      // Get home and away team id's
      const homeTeamId = await getTeamId(pool, game.home_team);
      const awayTeamId = await getTeamId(pool, game.away_team);

      // Initialize variables for SQL update
      let db_id;
      let last_update, last_update_unformatted;
      let homeOpenSpread, awayOpenSpread, homeCurrSpread, awayCurrSpread;
      let homeMlOdds, awayMlOdds;
      let gameOpenTotal, gameCurrTotal, gameOverOdds, gameUnderOdds;

      [homeOpenSpread, awayOpenSpread] = await pool.execute(
        'SELECT home_open_spread, away_open_spread FROM games WHERE api_id = ?',
        [game.id]
      );

      console.log('home open spread 41: ', homeOpenSpread)

      // Parse JSON into variables
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
              if (!homeOpenSpread || (Array.isArray(homeOpenSpread) && homeOpenSpread.length === 0)) {
                homeOpenSpread = homeSpread?.point;
                awayOpenSpread = awaySpread?.point;
              } else {
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

      // Debugging log to check the value of last_update_unformatted
      // console.log('last_update_unformatted:', last_update_unformatted);

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

      // Calculate the week number of the NFL season
      const gameDate = new Date(game.commence_time);
      const weekNumber =
        Math.floor((gameDate - seasonStartDate) / (7 * 24 * 60 * 60 * 1000)) +
        1;

      // Check if the game has started
      const gameCommenceTime = new Date(game.commence_time);
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
              game_started = ?
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
          weekNumber,
          gameStarted,
          game.id,
        ];
        await pool.execute(updateQuery, updateValues);
      } else {
        console.log('home open spread:', homeOpenSpread)

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
            game_started)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          weekNumber,
          gameStarted,
        ];
        await pool.execute(insertQuery, insertValues);
      }
    }

    await pool.end();
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

// function dateFormat(unformatted_date) {
//   const interim_date = new Date(unformatted_date);
//   if (isNaN(interim_date.getTime())) {
//     throw new Error(`Invalid date value: ${unformatted_date}`);
//   }
//   return interim_date.toISOString().slice(0, 19).replace('T', ' ');
// }

