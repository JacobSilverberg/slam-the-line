import cron from 'node-cron';
import pool from '../config/db.js';
import logger from '../utils/logger.js';
import { fetchAndSaveOdds } from './updateOdds.js';
import { fetchAndSaveScores } from './updateScores.js';
import { evaluateSpreads } from './evaluateSpreads.js';
import { evaluateUserScores } from './evaluateUserScores.js';
import { checkAndUpdateGameStatus } from './evaluateGameStart.js';

const TIMEZONE = process.env.TASK_TIMEZONE || 'America/New_York';

// How long after a game's scheduled start time before we expect it to be finished.
// 3.5 hours covers standard game length plus typical overtime.
const GAME_COMPLETION_BUFFER_MINUTES = 210;

async function hasPendingCompletedGames(): Promise<boolean> {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS cnt
    FROM games
    WHERE game_completed = 0
      AND game_start_time IS NOT NULL
      AND game_start_time <= DATE_SUB(NOW(), INTERVAL ${GAME_COMPLETION_BUFFER_MINUTES} MINUTE)
      AND week > 0
  `) as any[];
  return rows[0].cnt > 0;
}

async function runScoreEvaluation(): Promise<void> {
  try {
    await fetchAndSaveScores();
    await evaluateSpreads();
    await evaluateUserScores();
  } catch (err: any) {
    logger.error('Score evaluation pipeline failed', { error: err.message });
  }
}

// Daily 8am: fetch latest odds and game schedule.
// This is the only hardcoded time — it's intentional and deliberate.
cron.schedule('0 8 * * *', async () => {
  logger.info('Running scheduled odds update');
  try {
    await fetchAndSaveOdds();
  } catch (err: any) {
    logger.error('Scheduled odds update failed', { error: err.message });
  }
}, { timezone: TIMEZONE });

// Every hour: check if any games should have ended based on their actual start times.
// This handles any game day (Thu, Fri, Sat, Sun, Mon, international kickoffs) automatically.
cron.schedule('0 * * * *', async () => {
  try {
    const pending = await hasPendingCompletedGames();
    if (pending) {
      logger.info('Detected games past completion window — running score evaluation');
      await runScoreEvaluation();
    }
  } catch (err: any) {
    logger.error('Hourly score check failed', { error: err.message });
  }
}, { timezone: TIMEZONE });

// Every 5 minutes: update game_started flag so picks lock at kickoff.
cron.schedule('*/5 * * * *', async () => {
  try {
    await checkAndUpdateGameStatus();
  } catch (err: any) {
    logger.error('Game status check failed', { error: err.message });
  }
}, { timezone: TIMEZONE });

// Daily 9am safety net: catch any games that completed overnight or were delayed.
cron.schedule('0 9 * * *', async () => {
  logger.info('Running 9am safety net score evaluation');
  try {
    await runScoreEvaluation();
  } catch (err: any) {
    logger.error('Safety net evaluation failed', { error: err.message });
  }
}, { timezone: TIMEZONE });

logger.info('Scheduler started', { timezone: TIMEZONE });
