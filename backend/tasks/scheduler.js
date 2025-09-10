import cron from 'node-cron';
import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'localhost';
const PORT = process.env.BACKEND_PORT || '3000';

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

// One time Tuesday update.
cron.schedule('51 * * * *', () => {
  triggerRoutes([evaluateGameStart, evaluateSpreads, evaluateUserScores]);
});

// REAL SCHEDULE IS HERE

// Odds Update Schedule:
// Tue-Mon at 8am EST (which is 1pm UTC)
cron.schedule('0 12 * * *', () => {
  triggerRoutes([updateOdds]);
});

// Scores Update Schedule:
// Thu at Midnight EDT (which is 4am UTC Fri)
cron.schedule('0 4 * * 5', () => {
  triggerRoutes([updateScores]);
});

// Sun at 5pm EDT (which is 9pm, UTC Sun)
cron.schedule('0 21 * * 7', () => {
  triggerRoutes([updateScores]);
});

// Sun at 8pm, Midnight EDT (which is 12am, 4am UTC Mon)
cron.schedule('0 0,4 * * 1', () => {
  triggerRoutes([updateScores]);
});

// Mon at 1am EST (which is 5am UTC Tue)
cron.schedule('0 5 * * 2', () => {
  triggerRoutes([updateScores]);
});

// Results Update Schedule: Hourly from Tue-Mon in EST (which is every hour in UTC)
cron.schedule('5 0-23 * * *', async () => {
  // Run evaluateSpreads first, then evaluateUserScores
  await triggerRoutes([evaluateSpreads]);
  await triggerRoutes([evaluateUserScores]);
});

// GameStart Update Schedule: Every 5 minutes.
cron.schedule('*/5 * * * *', () => {
  triggerRoutes([evaluateGameStart]);
});

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

/* Scores Update Schedule:
Tue: 
Wed: 
Thu: Midnight
Fri: 
Sat: 
Sun: 5pm, 8pm, Midnight
Mon: 1am
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
