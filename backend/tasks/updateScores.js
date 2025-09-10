import pool from '../config/db.js';
import dateFormat from '../utils/dateFormat.js';
import { getScoresFromAPI } from './getScores.js';

export async function fetchAndSaveScores() {
  try {
    console.log('Starting fetchAndSaveScores...');
    // Fetch scores from the API
    const data = await getScoresFromAPI();
    console.log(`Fetched ${data.length} games from API`);

    for (const game of data) {
      console.log(
        `\nProcessing game: ${game.id} (${game.home_team} vs ${game.away_team})`
      );

      // Initialize variables for SQL update
      let homeScore, awayScore;
      let gameCompleted = false;
      let last_update_unformatted, last_update;

      // Skip games that have not completed
      if (game.completed === false) {
        console.log(`Skipping game ${game.id}: not completed`);
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

      // Log parsed scores
      console.log(
        `Parsed scores - Home: ${homeScore}, Away: ${awayScore}`
      );

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
      console.log(
        `Game ${game.id} exists in DB:`,
        existingGame.length > 0
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
        console.log('Updating game with values:', updateValues);
        
        try {
          const [result] = await pool.execute(updateQuery, updateValues);
          console.log(`Successfully updated game ${game.id}. Rows affected: ${result.affectedRows}`);
          
          // Verify the update was successful
          const [verifyGame] = await pool.execute(
            'SELECT game_completed FROM games WHERE api_id = ?',
            [game.id]
          );
          console.log(`Verification - Game ${game.id} game_completed status:`, verifyGame[0]?.game_completed);
        } catch (updateError) {
          console.error(`Failed to update game ${game.id}:`, updateError);
        }
      } else {
        console.error(
          `Game ${game.id} does not exist in db or not completed`
        );
      }
    }

    console.log('Scores updated');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
