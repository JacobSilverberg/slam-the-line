import fs from 'fs';
import pool from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dateFormat from '../utils/dateFormat.js';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the absolute path to the JSON file
const filePath = path.resolve(__dirname, 'api-data-scores.json');

let data;
try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(filePath, 'utf-8');
  
  // Check if the file is empty
  if (rawData) {
    data = JSON.parse(rawData);
  } else {
    console.error('Error: The JSON file is empty.');
    data = null; // or set a default value
  }
  
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Error: JSON file not found:', filePath);
  } else if (error instanceof SyntaxError) {
    console.error('Error: Invalid JSON format:', error.message);
  } else {
    console.error('An unexpected error occurred:', error);
  }
  data = null; // Handle the absence of valid data gracefully
}

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
      } else {
        gameCompleted = true;
      }

      // Parse JSON into variables
      for (const score of game.scores) {
        if (score.name === game.home_team) {
          homeScore = score.score;
        } else if (score.name === game.away_team) {
          awayScore = score.score;
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
        console.error('game does not exist in db');
      }
    }

    console.log('Scores updated');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
