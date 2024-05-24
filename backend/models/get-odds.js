import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import mysql from 'mysql2';

dotenv.config();

const ApiKey = process.env.API_KEY;

const sport = 'americanfootball_nfl';
const regions = 'us';
const markets = 'h2h,spreads,totals';
const oddsFormat = 'american';
const bookmakers = 'draftkings';

// API endpoint
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&bookmakers=${bookmakers}&apiKey=${ApiKey}`;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

export async function getOddsFromAPI() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Optionally, write data to a file for debugging purposes
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
