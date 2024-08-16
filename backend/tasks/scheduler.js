import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';


// URL of the route you want to trigger
const getOdds = 'http://localhost:3000/getodds';
const getScores = 'http://localhost:3000/getscores';
const updateOdds = 'http://localhost:3000/updateodds';
const updateScores = 'http://localhost:3000/updatescores';
const evaluateSpreads = 'http://localhost:3000/evaluatespreads';
const evaluateUserScores = 'http://localhost:3000/evaluateuserscores';

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
      continue;
    }
  }
  console.log('All routes triggered successfully.');
};

// Schedule the task to run every 20 seconds
cron.schedule('*/60 * * * * *', triggerRoute);

console.log('Scheduler is running...');
