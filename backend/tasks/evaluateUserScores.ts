import pool from '../config/db.js';
import logger from '../utils/logger.js';

interface UserScore {
  user_id: number;
  league_id: number;
  week: number;
  points: number;
  perfect: number;
  overdog_correct: number;
  underdog_correct: number;
  curr_streak: number;
  max_streak: number;
  updated_at: Date;
}

export async function evaluateUserScores(): Promise<void> {
  logger.info('Starting evaluateUserScores');

  const [games] = await pool.query(`
    SELECT id, spread_winner, home_curr_spread, home_team_id, away_team_id, week
    FROM games
    WHERE game_completed = 1 AND spread_winner IS NOT NULL
  `) as any[];

  const [userSelections] = await pool.query(`
    SELECT usg.id AS selection_id, usg.user_id, usg.league_id, usg.game_id,
           usg.points, usg.team_id, g.week
    FROM users_select_games usg
    JOIN games g ON usg.game_id = g.id
    WHERE g.game_completed = 1
  `) as any[];

  const userScores: Record<string, UserScore> = {};

  for (const game of games) {
    const { id: gameId, spread_winner, home_curr_spread, home_team_id, away_team_id } = game;
    const isHomeOverdog = parseFloat(home_curr_spread) < 0;
    const isAwayOverdog = parseFloat(home_curr_spread) > 0;

    for (const sel of userSelections) {
      if (sel.game_id !== gameId) continue;

      const isHomeTeam = sel.team_id === home_team_id;
      const isAwayTeam = sel.team_id === away_team_id;
      let pointsAwarded = 0;

      if ((isHomeTeam && spread_winner === 'home') || (isAwayTeam && spread_winner === 'away')) {
        pointsAwarded = sel.points;
      } else if (spread_winner === 'push') {
        pointsAwarded = sel.points / 2;
      }

      const key = `${sel.user_id}-${sel.league_id}-${sel.week}`;
      if (!userScores[key]) {
        userScores[key] = {
          user_id: sel.user_id,
          league_id: sel.league_id,
          week: sel.week,
          points: 0,
          perfect: 1,
          overdog_correct: 0,
          underdog_correct: 0,
          curr_streak: 0,
          max_streak: 0,
          updated_at: new Date(),
        };
      }

      const score = userScores[key];
      score.points += pointsAwarded;

      if (isHomeTeam) {
        if (isHomeOverdog && spread_winner === 'home') score.overdog_correct++;
        else if (!isHomeOverdog && spread_winner === 'home') score.underdog_correct++;
      } else if (isAwayTeam) {
        if (isAwayOverdog && spread_winner === 'away') score.overdog_correct++;
        else if (!isAwayOverdog && spread_winner === 'away') score.underdog_correct++;
      }
    }
  }

  for (const key of Object.keys(userScores)) {
    const score = userScores[key];

    const [leagueInfo] = await pool.query('SELECT weekly_points FROM leagues WHERE id = ?', [score.league_id]) as any[];
    const weeklyPoints = leagueInfo[0]?.weekly_points;
    if (!weeklyPoints) {
      logger.warn(`League ${score.league_id} not found, skipping score update`);
      continue;
    }

    if (score.points !== weeklyPoints) score.perfect = 0;

    const [lastWeek] = await pool.query(
      'SELECT curr_streak, max_streak, perfect FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?',
      [score.user_id, score.league_id, score.week - 1]
    ) as any[];

    const prev = lastWeek[0] ?? { curr_streak: 0, max_streak: 0, perfect: 0 };

    if (score.perfect === 1) {
      score.curr_streak = prev.perfect === 1
        ? prev.curr_streak + score.points
        : score.points;
      score.max_streak = Math.max(prev.max_streak, score.curr_streak);
    } else {
      score.curr_streak = 0;
      score.max_streak = prev.max_streak;
    }

    const [existing] = await pool.query(
      'SELECT id FROM users_have_scores WHERE user_id = ? AND league_id = ? AND week = ?',
      [score.user_id, score.league_id, score.week]
    ) as any[];

    if (existing.length > 0) {
      await pool.query(
        `UPDATE users_have_scores
         SET points = ?, perfect = ?, overdog_correct = ?, underdog_correct = ?,
             curr_streak = ?, max_streak = ?, updated_at = ?
         WHERE id = ?`,
        [score.points, score.perfect, score.overdog_correct, score.underdog_correct,
         score.curr_streak, score.max_streak, new Date(), existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO users_have_scores
         (user_id, league_id, week, points, perfect, overdog_correct, underdog_correct, curr_streak, max_streak, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [score.user_id, score.league_id, score.week, score.points, score.perfect,
         score.overdog_correct, score.underdog_correct, score.curr_streak, score.max_streak, new Date()]
      );
    }
  }

  logger.info('evaluateUserScores complete');
}
