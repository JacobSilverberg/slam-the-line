import cron from 'node-cron';
import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const PORT = process.env.BACKEND_PORT || '3000';

console.log("base_url", BASE_URL);
console.log('port', PORT);

// URL of the route you want to trigger
const getOdds = `http://${BASE_URL}:${PORT}/getodds`;
const getScores = `http://${BASE_URL}:${PORT}/getscores`;
const updateOdds = `http://${BASE_URL}:${PORT}/updateodds`;
const updateScores = `http://${BASE_URL}:${PORT}/updatescores`;
const evaluateSpreads = `http://${BASE_URL}:${PORT}/evaluatespreads`;
const evaluateUserScores = `http://${BASE_URL}:${PORT}/evaluateuserscores`;

// Log of routes to trigger
// console.log("URLS:",
//   getOdds,
//   getScores,
//   updateOdds,
//   updateScores,
//   evaluateSpreads,
//   evaluateUserScores,
// )

// List of routes to trigger
const ROUTE_URLS = [
  getOdds,
  getScores,
  updateOdds,
  updateScores,
  evaluateSpreads,
  evaluateUserScores,
];

// Function to trigger the route
const triggerRoute = async () => {
  for (const url of ROUTE_URLS) {
    console.log(`Triggering ${url}...`);
    try {
      await axios.get(url, { timeout: 5000 }); // 5 seconds timeout
      console.log(`Route ${url} triggered successfully.`);
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  console.log('All routes triggered successfully.');
};

// Schedule the task to run at 7 AM, 12 PM, and 3 PM every day
cron.schedule('0 7,12,15 * * *', triggerRoute);

console.log('Scheduler is running...');

/* Odds Update Schedule:
Sun: Noon
Mon:
Tue:
Wed:
Thu:
Fri:
Sat:
Sun:

*/