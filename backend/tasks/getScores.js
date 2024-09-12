import dotenv from 'dotenv';
import fetch from 'node-fetch';
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

    // Return the data directly
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
