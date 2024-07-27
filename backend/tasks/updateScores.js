import fs from 'fs';
import pool from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dateFormat from '../utils/dateFormat.js';

// Define the start date of the NFL season
const seasonStartDate = new Date('2024-09-04');

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the absolute path to the JSON file
const filePath = path.resolve(__dirname, '../data/api-data-scores.json');

// handle json formatting, reading from api-data.json
const rawData = fs.readFileSync(filePath);
const data = JSON.parse(rawData);

export async function fetchAndSaveScores() {
  try {
    for (const game of data) {

      // Initialize variables for SQL update
        let homeScore, awayScore;
        let gameCompleted = false;
        let last_update_unformatted, last_update;

        // Skip games that have not completed
        if (game.completed === false) {
            continue;
        } else {gameCompleted = true;}

      // Parse JSON into variables
      for (const score of game.scores) {
        if (score.name === game.home_team) {
            homeScore = score.score;
            console.log('homescore', homeScore);
        } else if (score.name === game.away_team) {
            awayScore = score.score;
            console.log('awaycore', awayScore);
        }
    }
    last_update_unformatted = game.last_update;

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

      // Check if the game exists in db
      const [existingGame] = await pool.execute(
        'SELECT id FROM games WHERE api_id = ?',
        [game.id]
      );

      if (existingGame.length > 0 && gameCompleted) {
        // Update the existing game
        const updateQuery = `
          UPDATE games
          SET updated_at = ?,
              home_points = ?,
              away_points = ?,
              game_completed = ?
          WHERE api_id = ?
        `;
        const updateValues = [
          last_update,
          homeScore,
          awayScore,
          gameCompleted,
          game.id,
        ];
        await pool.execute(updateQuery, updateValues);
      } else {
        console.log('game does not exist in db');
      }

      console.log('Game updated:', game.id);
    }

    // await pool.end();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// function dateFormat(unformatted_date) {
//   const interim_date = new Date(unformatted_date);
//   if (isNaN(interim_date.getTime())) {
//     throw new Error(`Invalid date value: ${unformatted_date}`);
//   }
//   return interim_date.toISOString().slice(0, 19).replace('T', ' ');
// }

