import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const sport = 'americanfootball_nfl';
// daysFrom=3 catches games that may have been missed in earlier updates
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/scores/?daysFrom=3&apiKey=${process.env.API_KEY}`;

export async function getScoresFromAPI(): Promise<any[]> {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Scores API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<any[]>;
}
