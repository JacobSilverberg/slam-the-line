import fs from 'fs';
import pool from '../config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the absolute path to the JSON file
const filePath = path.resolve(__dirname, 'api-data-odds.json');

let data;
try {
  // Read and parse the JSON file
  const rawData = fs.readFileSync(filePath, 'utf-8');
  
  if (rawData) {
    data = JSON.parse(rawData);
  } else {
    console.error('Error: The JSON file is empty.');
    data = null;
  }
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('Error: JSON file not found:', filePath);
  } else if (error instanceof SyntaxError) {
    console.error('Error: Invalid JSON format:', error.message);
  } else {
    console.error('An unexpected error occurred:', error);
  }
  data = null;
}

// Function to check if games have started and update the database
export async function checkAndUpdateGameStatus() {
  try {
    if (!data) {
      throw new Error('No data available to process.');
    }

    for (const game of data) {
      // Get the game commence time
      const gameCommenceTime = new Date(game.commence_time);

      // Check if the game has started
      const gameStarted = gameCommenceTime < new Date() ? 1 : 0;

      // Update the game_started column in the database
      const updateQuery = `
        UPDATE games
        SET game_started = ?
        WHERE api_id = ?
      `;
      const updateValues = [gameStarted, game.id];

      await pool.execute(updateQuery, updateValues);
    }

    console.log('Game status updated successfully');
  } catch (error) {
    console.error('Error updating game status:', error);
  }
}