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
              perfect: 1,
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
            userScore.perfect = 0;
          }
        }
      }
    }

    // Update streaks and insert/update user scores in the database
    for (const scoreData of Object.values(userScores)) {
      const [existingScore] = await pool.query(
        `SELECT id, curr_streak, max_streak FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?`,
        [scoreData.user_id, scoreData.league_id, scoreData.week - 1] // Get last week's data
      );

      let lastWeekCurrStreak = 0;
      let lastWeekMaxStreak = 0;

      if (existingScore.length > 0) {
        const lastWeekScore = existingScore[0];
        lastWeekCurrStreak = lastWeekScore.curr_streak;
        lastWeekMaxStreak = lastWeekScore.max_streak;
      }

      if (scoreData.perfect === 1) {
        // Had a perfect week
        scoreData.curr_streak = lastWeekCurrStreak + scoreData.points;
        if (scoreData.curr_streak > lastWeekMaxStreak) {
          scoreData.max_streak = scoreData.curr_streak;
        } else {
          scoreData.max_streak = lastWeekMaxStreak;
        }
      } else {
        // Did not have a perfect week
        if (lastWeekCurrStreak > 0) {
          scoreData.curr_streak = lastWeekCurrStreak + scoreData.points;
          if (scoreData.curr_streak > lastWeekMaxStreak) {
            scoreData.max_streak = scoreData.curr_streak;
            scoreData.curr_streak = 0;
          } else {
            scoreData.max_streak = lastWeekMaxStreak;
          }
        } else {
          scoreData.max_streak = lastWeekMaxStreak;
        }
      }

      const [currentWeekScore] = await pool.query(
        `SELECT id FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?`,
        [scoreData.user_id, scoreData.league_id, scoreData.week]
      );

      if (currentWeekScore.length > 0) {
        await pool.query(
          `UPDATE users_have_scores
           SET points = ?, perfect = ?, overdog_correct = ?, underdog_correct = ?, curr_streak = ?, max_streak = ?, updated_at = ?
           WHERE id = ?`,
          [
            scoreData.points,
            scoreData.perfect,
            scoreData.overdog_correct,
            scoreData.underdog_correct,
            scoreData.curr_streak,
            scoreData.max_streak,
            new Date(),
            currentWeekScore[0].id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO users_have_scores (user_id, league_id, week, points, perfect, overdog_correct, underdog_correct, curr_streak, max_streak, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            scoreData.user_id,
            scoreData.league_id,
            scoreData.week,
            scoreData.points,
            scoreData.perfect,
            scoreData.overdog_correct,
            scoreData.underdog_correct,
            scoreData.curr_streak,
            scoreData.max_streak,
            new Date(),
          ]
        );
      }
    }

    console.log('Scores updated successfully!');
  } catch (error) {
    console.error('Error evaluating spreads:', error);
  }
}
