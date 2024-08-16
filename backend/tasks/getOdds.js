import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// dotenv setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const API_KEY = process.env.API_KEY;

const sport = 'americanfootball_nfl';
const regions = 'us';
const markets = 'h2h,spreads,totals';
const oddsFormat = 'american';
const bookmakers = 'draftkings';

// API endpoint
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&bookmakers=${bookmakers}&apiKey=${API_KEY}`;

export async function getOddsFromAPI() {
  try {
    console.log('API_KEY at getOdds:', API_KEY);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Write data to a file in the same directory as this .js file
    const filePath = resolve(__dirname, 'api-data-odds.json');
    fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('Data successfully written to api-data-odds.json');
        }
      }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
