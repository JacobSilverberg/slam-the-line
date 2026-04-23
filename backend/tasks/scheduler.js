import cron from 'node-cron';
import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'localhost';
const PORT = process.env.BACKEND_PORT || '3000';
const TIMEZONE = process.env.TASK_TIMEZONE || 'America/New_York';

// URL of the route you want to trigger
const getOdds = `http://${BASE_URL}:${PORT}/getodds`;
const getScores = `http://${BASE_URL}:${PORT}/getscores`;
const updateOdds = `http://${BASE_URL}:${PORT}/updateodds`;
const updateScores = `http://${BASE_URL}:${PORT}/updatescores`;
const evaluateSpreads = `http://${BASE_URL}:${PORT}/evaluatespreads`;
const evaluateUserScores = `http://${BASE_URL}:${PORT}/evaluateuserscores`;
const evaluateGameStart = `http://${BASE_URL}:${PORT}/evaluategamestart`;

// Function to trigger the route
const triggerRoutes = async (routes) => {
  for (const url of routes) {
    console.log(`Triggering ${url}...`);
    try {
      await axios.get(url, { timeout: 15000 });
      // console.log(`Route ${url} triggered successfully.`);
    } catch (error) {
      console.error(`Error triggering ${url}:`, error.message);
      continue;
    }
  }
};

// Odds Update Schedule:
// Tue-Mon at 8am EST (which is 1pm UTC)
cron.schedule(
  '0 8 * * *',
  () => {
    triggerRoutes([updateOdds]);
  },
  { timezone: TIMEZONE }
);

// Scores Update Schedule:
// Thu at Midnight EDT (which is 4am UTC Fri)
cron.schedule(
  '0 1,3 * * 5',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Sun at 5pm EDT (late afternoon slate)
cron.schedule(
  '0 17 * * 0',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Sun at 8pm EDT (post afternoon slate / pre-SNF)
cron.schedule(
  '0 20 * * 0',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Mon at 1am, 3am EDT for SNF wrap-up
cron.schedule(
  '0 1,3 * * 1',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Tue at 1am, 3am EDT for MNF wrap-up
cron.schedule(
  '0 1,3 * * 2',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Daily 9am ET safety net to catch any stragglers
cron.schedule(
  '0 9 * * *',
  () => {
    triggerRoutes([updateScores]);
  },
  { timezone: TIMEZONE }
);

// Results Update Schedule: Hourly from Tue-Mon in EST (which is every hour in UTC)
cron.schedule(
  '5 * * * *',
  async () => {
    // Run evaluateSpreads first, then evaluateUserScores
    await triggerRoutes([evaluateSpreads]);
    await triggerRoutes([evaluateUserScores]);
  },
  { timezone: TIMEZONE }
);

// GameStart Update Schedule: Every 5 minutes.
cron.schedule(
  '*/5 * * * *',
  () => {
    triggerRoutes([evaluateGameStart]);
  },
  { timezone: TIMEZONE }
);

console.log('Scheduler is running...');

/* Odds Update Schedule:
Tue: 8am
Wed: 8am
Thu: 8am
Fri: 8am
Sat: 8am
Sun: 8am
Mon: 8am
*/

/* Scores Update Schedule (America/New_York):
Tue: 1am, 3am (wrap MNF) + 9am safety net
Wed: 9am safety net
Thu: 9am safety net
Fri: 1am, 3am (wrap TNF) + 9am safety net
Sat: 9am safety net
Sun: 5pm, 8pm, 9am safety net
Mon: 1am, 3am (wrap SNF) + 9am safety net
*/

/* Results Update Schedule:
Tue: Hourly
Wed: Hourly
Thu: Hourly
Fri: Hourly
Sat: Hourly
Sun: Hourly
Mon: Hourly
*/
