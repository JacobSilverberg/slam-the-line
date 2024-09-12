import pool from '../config/db.js';

export async function evaluateUserScores() {
  try {
    // Fetch completed games from the database
    const [games] = await pool.query(`
      SELECT id, spread_winner, home_curr_spread, home_team_id, away_team_id, week
      FROM games
      WHERE game_completed = 1
    `);

    // Fetch user selections with game details
    const [userSelections] = await pool.query(`
      SELECT usg.id AS selection_id, usg.user_id, usg.league_id, usg.game_id, usg.points, usg.team_id, g.week
      FROM users_select_games usg
      JOIN games g ON usg.game_id = g.id
      WHERE g.game_completed = 1
    `);

    const userScores = {};

    // Evaluate user selections based on the spread winner
    for (const game of games) {
      const {
        id: gameId,
        spread_winner,
        home_curr_spread,
        home_team_id,
        away_team_id,
      } = game;

      // Determine overdog and underdog
      const isHomeOverdog = parseFloat(home_curr_spread) < 0;
      const isAwayOverdog = parseFloat(home_curr_spread) > 0;

      // Evaluate user selections
      for (const selection of userSelections) {
        if (selection.game_id === gameId) {
          const isHomeTeam = selection.team_id === home_team_id;
          const isAwayTeam = selection.team_id === away_team_id;
          let pointsAwarded = 0;

          if (
            (isHomeTeam && spread_winner === 'home') ||
            (isAwayTeam && spread_winner === 'away')
          ) {
            pointsAwarded = selection.points;
          } else if (spread_winner === 'push') {
            pointsAwarded = selection.points / 2;
          }

          const scoreKey = `${selection.user_id}-${selection.league_id}-${selection.week}`;
          if (!userScores[scoreKey]) {
            userScores[scoreKey] = {
              user_id: selection.user_id,
              league_id: selection.league_id,
              week: selection.week,
              points: 0,
              perfect: 1, // Assume perfect until proven otherwise
              overdog_correct: 0,
              underdog_correct: 0,
              curr_streak: 0,
              max_streak: 0, // Assuming a fresh start
              updated_at: new Date(),
            };
          }

          const userScore = userScores[scoreKey];
          userScore.points += pointsAwarded;

          if (isHomeTeam || isAwayTeam) {
            if (isHomeTeam && isHomeOverdog && spread_winner === 'home') {
              userScore.overdog_correct++;
            } else if (
              isAwayTeam &&
              isAwayOverdog &&
              spread_winner === 'away'
            ) {
              userScore.overdog_correct++;
            } else if (
              isHomeTeam &&
              !isHomeOverdog &&
              spread_winner === 'home'
            ) {
              userScore.underdog_correct++;
            } else if (
              isAwayTeam &&
              !isAwayOverdog &&
              spread_winner === 'away'
            ) {
              userScore.underdog_correct++;
            }
          }

          if (pointsAwarded === 0) {
            userScore.perfect = 0; // If they get any game wrong, they're not perfect.
          }
        }
      }
    }

    // Fetch league weekly points from league info and adjust perfect week logic
    for (const scoreKey of Object.keys(userScores)) {
      const userScore = userScores[scoreKey];
      const leagueId = userScore.league_id;

      // Fetch league info to get weekly_points
      const [leagueInfo] = await pool.query(
        'SELECT weekly_points FROM leagues WHERE id = ?',
        [leagueId]
      );

      // Since leagueInfo is an array, extract the weekly_points value
      const leagueWeeklyPoints = leagueInfo[0]?.weekly_points;

      if (!leagueWeeklyPoints) {
        throw new Error(`League info not found for league_id ${leagueId}`);
      }

      // If user's total points are less than the league's weekly points, it's not a perfect week
      if (userScore.points !== leagueWeeklyPoints) {
        userScore.perfect = 0;
      }

      // Update streaks and insert/update user scores in the database
      const [existingScore] = await pool.query(
        `SELECT id, curr_streak, max_streak FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?`,
        [userScore.user_id, userScore.league_id, userScore.week - 1]
      );

      let lastWeekCurrStreak = 0;
      let lastWeekMaxStreak = 0;

      if (existingScore.length > 0) {
        const lastWeekScore = existingScore[0];
        lastWeekCurrStreak = lastWeekScore.curr_streak;
        lastWeekMaxStreak = lastWeekScore.max_streak;
      }

      if (userScore.perfect === 1) {
        // Had a perfect week
        userScore.curr_streak = lastWeekCurrStreak + userScore.points;
        if (userScore.curr_streak > lastWeekMaxStreak) {
          userScore.max_streak = userScore.curr_streak;
        } else {
          userScore.max_streak = lastWeekMaxStreak;
        }
      } else {
        // Did not have a perfect week
        if (lastWeekCurrStreak > 0) {
          userScore.curr_streak = lastWeekCurrStreak + userScore.points;
          if (userScore.curr_streak > lastWeekMaxStreak) {
            userScore.max_streak = userScore.curr_streak;
            userScore.curr_streak = 0;
          } else {
            userScore.max_streak = lastWeekMaxStreak;
          }
        } else {
          userScore.max_streak = lastWeekMaxStreak;
        }
      }

      const [currentWeekScore] = await pool.query(
        `SELECT id FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?`,
        [userScore.user_id, userScore.league_id, userScore.week]
      );

      if (currentWeekScore.length > 0) {
        await pool.query(
          `UPDATE users_have_scores
           SET points = ?, perfect = ?, overdog_correct = ?, underdog_correct = ?, curr_streak = ?, max_streak = ?, updated_at = ?
           WHERE id = ?`,
          [
            userScore.points,
            userScore.perfect,
            userScore.overdog_correct,
            userScore.underdog_correct,
            userScore.curr_streak,
            userScore.max_streak,
            new Date(),
            currentWeekScore[0].id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO users_have_scores (user_id, league_id, week, points, perfect, overdog_correct, underdog_correct, curr_streak, max_streak, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userScore.user_id,
            userScore.league_id,
            userScore.week,
            userScore.points,
            userScore.perfect,
            userScore.overdog_correct,
            userScore.underdog_correct,
            userScore.curr_streak,
            userScore.max_streak,
            new Date(),
          ]
        );
      }
    }

    console.log('Scores updated successfully!');
  } catch (error) {
    console.error('Error evaluating user scores:', error);
  }
}
