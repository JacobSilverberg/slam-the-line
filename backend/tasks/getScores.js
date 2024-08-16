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
const daysFrom = '1';

// API endpoint
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/scores/?daysFrom=${daysFrom}&apiKey=${API_KEY}`;

export async function getScoresFromAPI() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Write data to a file in the same directory as this .js file
    const filePath = resolve(__dirname, 'api-data-scores.json');
    fs.writeFile(
      filePath,
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) {
          console.error('Error writing file:', err);
        } else {
          console.log('Data successfully written to api-data-scores.json');
        }
      }
    );
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
