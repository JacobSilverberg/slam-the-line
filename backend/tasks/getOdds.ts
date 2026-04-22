import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const sport = 'americanfootball_nfl';
const regions = 'us';
const markets = 'h2h,spreads,totals';
const oddsFormat = 'american';
const bookmakers = 'draftkings';

const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&bookmakers=${bookmakers}&apiKey=${process.env.API_KEY}`;

export async function getOddsFromAPI(): Promise<any[]> {
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Odds API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<any[]>;
}
