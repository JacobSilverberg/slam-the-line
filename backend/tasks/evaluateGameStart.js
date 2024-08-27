import pool from '../config/db.js';

// Function to check if games have started and update the database
export async function checkAndUpdateGameStatus() {
  try {
    // Fetch game start times from the database
    const [games] = await pool.query(`
      SELECT api_id, game_start_time
      FROM games
    `);

    if (!games || games.length === 0) {
      throw new Error('No games found in the database.');
    }

    for (const game of games) {
      // Get the game commence time from the database
      const gameCommenceTime = new Date(game.game_start_time);

      // Check if the game has started
      const gameStarted = gameCommenceTime < new Date() ? 1 : 0;

      // Update the game_started column in the database
      const updateQuery = `
        UPDATE games
        SET game_started = ?
        WHERE api_id = ?
      `;
      const updateValues = [gameStarted, game.api_id];

      await pool.execute(updateQuery, updateValues);
    }

    console.log('Game status updated successfully');
  } catch (error) {
    console.error('Error updating game status:', error);
  }
}
