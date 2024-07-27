import cron from 'node-cron';
import axios from 'axios';

// URL of the route you want to trigger
const getOdds = 'http://localhost:3000/getodds';
const getScores = 'http://localhost:3000/getscores';
const updateOdds = 'http://localhost:3000/updateodds';
const updateScores = 'http://localhost:3000/updatescores';
const evaluateSpreads = 'http://localhost:3000/evaluatespreads';

// List of routes to trigger
const ROUTE_URLS = [
    updateOdds,
    updateScores,
    evaluateSpreads
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

// Schedule the task to run every 30 seconds
cron.schedule('*/20 * * * * *', triggerRoute);

console.log('Scheduler is running...');