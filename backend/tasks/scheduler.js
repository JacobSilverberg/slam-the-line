import cron from 'node-cron';
import axios from 'axios';
import { calculateNFLWeekAndDay } from './nflWeekCalculator.js';

const BASE_URL = process.env.BACKEND_URL || 'localhost';
const PORT = process.env.BACKEND_PORT || '3000';
const TIMEZONE = process.env.TASK_TIMEZONE || 'America/New_York';

const updateOdds = `http://${BASE_URL}:${PORT}/updateodds`;
const updateScores = `http://${BASE_URL}:${PORT}/updatescores`;
const evaluateSpreads = `http://${BASE_URL}:${PORT}/evaluatespreads`;
const evaluateUserScores = `http://${BASE_URL}:${PORT}/evaluateuserscores`;
const evaluateGameStart = `http://${BASE_URL}:${PORT}/evaluategamestart`;

const triggerRoutes = async (routes) => {
  for (const url of routes) {
    console.log(`Triggering ${url}...`);
    try {
      await axios.get(url, { timeout: 15000 });
    } catch (error) {
      console.error(`Error triggering ${url}:`, error.message);
      continue;
    }
  }
};

const inSeason = () => calculateNFLWeekAndDay(new Date()).week > 0;

// Odds Update Schedule: Tue, Thu, Sat, Sun at 8am ET
// Tue: open spreads reset (isTuesday flag), Thu: TNF prep, Sat/Sun: weekend slate
cron.schedule(
  '0 8 * * 0,2,4,6',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateOdds]);
  },
  { timezone: TIMEZONE }
);

// Scores Update Schedule:

// Fri 2am ET — TNF wrap-up
cron.schedule(
  '0 2 * * 5',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Sun 5pm ET — early afternoon slate wrap-up
cron.schedule(
  '0 17 * * 0',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Sun 8pm ET — late afternoon slate wrap-up / pre-SNF
cron.schedule(
  '0 20 * * 0',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Mon 2am ET — SNF wrap-up
cron.schedule(
  '0 2 * * 1',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Tue 2am ET — MNF wrap-up
cron.schedule(
  '0 2 * * 2',
  () => {
    if (!inSeason()) return;
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Results evaluation: every hour at :05
cron.schedule(
  '5 * * * *',
  async () => {
    await triggerRoutes([evaluateSpreads]);
    await triggerRoutes([evaluateUserScores]);
  },
  { timezone: TIMEZONE }
);

// Game start check: every 5 minutes
cron.schedule(
  '*/5 * * * *',
  () => {
    triggerRoutes([evaluateGameStart]);
  },
  { timezone: TIMEZONE }
);

console.log('Scheduler is running...');

/* Odds Update Schedule (in-season only, America/New_York):
Tue: 8am (open spreads reset)
Thu: 8am (TNF prep)
Sat: 8am (weekend slate)
Sun: 8am (final line check before 1pm kickoffs)
*/

/* Scores Update Schedule (in-season only, America/New_York):
Fri: 2am (TNF wrap-up)
Sun: 5pm, 8pm (early + late slate)
Mon: 2am (SNF wrap-up)
Tue: 2am (MNF wrap-up)
*/

/* Results/GameStart Schedule (year-round, DB only — no API cost):
evaluateSpreads + evaluateUserScores: hourly at :05
evaluateGameStart: every 5 minutes
*/
