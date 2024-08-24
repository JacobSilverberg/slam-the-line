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

// Testing runs every 20 seconds.
// cron.schedule('*/20 * * * * *', () => {
//   triggerRoutes([updateScores, updateOdds, evaluateGameStart]);
// });

// REAL SCHEDULE IS HERE

// Odds Update Schedule: Tue-Mon at 8am EST (which is 1pm UTC)
cron.schedule('0 13 * * 2-1', () => {
  triggerRoutes([getOdds, updateOdds]);
});

// Scores Update Schedule:
// Thu at Midnight EST (which is 5am UTC)
cron.schedule('0 5 * * 4', () => {
  triggerRoutes([getScores, updateScores]);
});

// Sun at 5pm, 8pm, and Midnight EST (which are 10pm, 1am, 5am UTC)
cron.schedule('0 22,1,5 * * 7', () => {
  triggerRoutes([getScores, updateScores]);
});

// Mon at Midnight EST (which is 5am UTC)
cron.schedule('0 5 * * 1', () => {
  triggerRoutes([getScores, updateScores]);
});

// Results Update Schedule: Hourly from Tue-Mon in EST (which is every hour in UTC)
cron.schedule('1 0-23 * * 2-1', () => {
  triggerRoutes([evaluateSpreads, evaluateUserScores]);
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
Mon: Midnight
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
