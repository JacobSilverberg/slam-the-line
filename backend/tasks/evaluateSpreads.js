import pool from '../config/db.js';

export async function evaluateSpreads() {
  try {
    // Fetch data from the database
    const [games] = await pool.query(`
          SELECT api_id, home_curr_spread, home_points, away_points, home_team_id, away_team_id
          FROM games
          WHERE game_completed = 1
        `);

    for (const game of games) {
      let {
        api_id,
        home_curr_spread,
        home_points,
        away_points,
        home_team_id,
        away_team_id,
      } = game;
      let spread_winner;

      home_curr_spread = parseFloat(home_curr_spread);
      home_points = parseFloat(home_points);
      away_points = parseFloat(away_points);

      // Calculate the adjusted home points
      const adjustedHomePoints = home_points + home_curr_spread;

      // Determine the spread winner
      if (adjustedHomePoints > away_points) {
        spread_winner = 'home';
      } else if (adjustedHomePoints < away_points) {
        spread_winner = 'away';
      } else {
        spread_winner = 'push';
      }

      // Update the database with the spread winner
      await pool.query(
        `
            UPDATE games
            SET spread_winner = ?
            WHERE api_id = ?
          `,
        [spread_winner, api_id]
      );
    }

    console.log('Spreads evaluated successfully!');
  } catch (error) {
    console.error('Error evaluating spreads:', error);
  }
}
