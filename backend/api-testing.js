import dotenv from "dotenv";
import fetch from 'node-fetch';
import fs from 'fs';
import mysql from 'mysql2';

dotenv.config()


const ApiKey = process.env.API_KEY;

const sport = "americanfootball_nfl";
const regions = "us";
const markets = "h2h,spreads,totals";
const oddsFormat = "american";
const bookmakers = "draftkings";

// API endpoint
const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${regions}&markets=${markets}&oddsFormat=${oddsFormat}&bookmakers=${bookmakers}&apiKey=${ApiKey}`;


const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

async function fetchAndSaveOdds() {
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
  
      const connection = await mysql.createConnection(dbConfig);
  
      for (const game of data) {
        const homeTeamId = await getTeamId(connection, game.home_team);
        const awayTeamId = await getTeamId(connection, game.away_team);
  
        let homeOpenSpread, awayOpenSpread, homeCurrSpread, awayCurrSpread;
        let homeMlOdds, awayMlOdds;
        let gameOpenTotal, gameCurrTotal, gameOverOdds, gameUnderOdds;
  
        for (const bookmaker of game.bookmakers) {
          for (const market of bookmaker.markets) {
            switch (market.key) {
              case 'h2h':
                homeMlOdds = market.outcomes.find(o => o.name === game.home_team).price;
                awayMlOdds = market.outcomes.find(o => o.name === game.away_team).price;
                break;
              case 'spreads':
                const homeSpread = market.outcomes.find(o => o.name === game.home_team);
                const awaySpread = market.outcomes.find(o => o.name === game.away_team);
                if (!homeOpenSpread) {
                  homeOpenSpread = homeSpread.point;
                  awayOpenSpread = awaySpread.point;
                } else {
                  homeCurrSpread = homeSpread.point;
                  awayCurrSpread = awaySpread.point;
                }
                break;
              case 'totals':
                const totalOutcome = market.outcomes.find(o => o.name === 'Over');
                if (!gameOpenTotal) {
                  gameOpenTotal = totalOutcome.point;
                } else {
                  gameCurrTotal = totalOutcome.point;
                }
                gameOverOdds = totalOutcome.price;
                gameUnderOdds = market.outcomes.find(o => o.name === 'Under').price;
                break;
            }
          }
        }
  
        // Update the games table
        const updateQuery = `
          UPDATE games
          SET updated_at = ?,
              home_team_id = ?,
              away_team_id = ?,
              home_open_spread = COALESCE(home_open_spread, ?),
              away_open_spread = COALESCE(away_open_spread, ?),
              home_curr_spread = ?,
              away_curr_spread = ?,
              home_ml_odds = ?,
              away_ml_odds = ?,
              game_open_total = COALESCE(game_open_total, ?),
              game_curr_total = ?,
              game_over_odds = ?,
              game_under_odds = ?
          WHERE id = ?
        `;
        const updateValues = [
          bookmaker.last_update,
          homeTeamId,
          awayTeamId,
          homeOpenSpread,
          awayOpenSpread,
          homeCurrSpread || homeOpenSpread,
          awayCurrSpread || awayOpenSpread,
          homeMlOdds,
          awayMlOdds,
          gameOpenTotal,
          gameCurrTotal || gameOpenTotal,
          gameOverOdds,
          gameUnderOdds,
          game.id
        ];
        await connection.execute(updateQuery, updateValues);
      }
  
      await connection.end();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  async function getTeamId(connection, teamName) {
    const [rows] = await connection.execute('SELECT id FROM teams WHERE name = ?', [teamName]);
    if (rows.length > 0) {
      return rows[0].id;
    } else {
      throw new Error(`Team not found: ${teamName}`);
    }
  }
  
  fetchAndSaveOdds();