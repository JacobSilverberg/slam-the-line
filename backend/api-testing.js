import dotenv from "dotenv";
import fetch from 'node-fetch';
import fs from 'fs';

dotenv.config()


const ApiKey = process.env.API_KEY;

const sport = "americanfootball_nfl";
const regions = "us";
const markets = "h2h,spreads,totals";
const oddsFormat = "american";
const bookmakers = "draftkings";

// API endpoint
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&bookmakers=${bookmakers}&apiKey=${ApiKey}`;

// Function to fetch data from the API and write to a file
async function fetchAndSaveOdds() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Write data to a file called 'api-data.json'
        fs.writeFile('api-data.json', JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('Data successfully written to api-data.json');
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the function to fetch data and write to a file
fetchAndSaveOdds();