import cron from 'node-cron';
import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3000';

console.log("base_url", BASE_URL);

// URL of the route you want to trigger
const getOdds = `${BASE_URL}/getodds`;
const getScores = `${BASE_URL}/getscores`;
const updateOdds = `${BASE_URL}/updateodds`;
const updateScores = `${BASE_URL}/updatescores`;
const evaluateSpreads = `${BASE_URL}/evaluatespreads`;
const evaluateUserScores = `${BASE_URL}/evaluateuserscores`;

// List of routes to trigger
console.log("URLS:",
  getOdds,
  getScores,
  updateOdds,
  updateScores,
  evaluateSpreads,
  evaluateUserScores,
)

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
      await axios.get(url, { timeout: 5000 }); // 5 seconds timeout, no need to log response
      // console.log(`Route ${url} triggered successfully.`);
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  console.log('All routes triggered successfully.');
};

// Schedule the task to run every 20 seconds
cron.schedule('*/40 * * * * *', triggerRoute);

console.log('Scheduler is running...');
