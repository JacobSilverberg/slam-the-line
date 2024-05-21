import express from "express"
import mysql, { raw } from "mysql2/promise"
import cors from "cors"
import dotenv from "dotenv"
import fs from 'fs';

const rawData = fs.readFileSync('api-data.json');
const jsonData = JSON.parse(rawData);

// console.log(jsonData);

dotenv.config()

const app = express()

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;


console.log("dbHost", dbHost)
console.log("dbUser", dbUser)
console.log("dbPass", dbPass)
console.log("dbName", dbName) 

// const dbConfig = mysql.createConnection({
//     host:       dbHost,
//     user:       dbUser,
//     password:   dbPass,
//     database:   dbName
// })

async function fetchAndSaveOdds() {
    try {
      const data = await jsonData;
  
      // Optionally, write data to a file for debugging purposes
    //   fs.writeFile('api-data.json', JSON.stringify(data, null, 2), (err) => {
    //     if (err) {
    //       console.error('Error writing file:', err);
    //     } else {
    //       console.log('Data successfully written to api-data.json');
    //     }
    //   });
  
        const connection = await mysql.createConnection({
            host: dbHost,
            user: dbUser,
            password: dbPass,
            database: dbName
        });

    //   console.log('connection', connection);
  
      for (const game of data) {
        console.log('connection', connection);
        console.log('home team', game.home_team);


        const homeTeamId = await getTeamId(connection, game.home_team);
        const awayTeamId = await getTeamId(connection, game.away_team);
  
        let last_update, last_update_unformatted;
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
                last_update_unformatted = market.last_update;
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

        // Step 1: Parse the ISO 8601 date string into a JavaScript Date object
        const last_update_interim = new Date(last_update_unformatted);
        // Step 2: Format the JavaScript Date object into the SQL DATETIME format
        last_update = last_update_interim.toISOString().slice(0, 19).replace("T", " ");
  
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
          last_update,
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
    try {
        const [result] = await connection.execute('SELECT id FROM teams WHERE full_name = ?', [teamName]);
        if (!result || result.length === 0) {
            throw new Error(`Team '${teamName}' not found in the database`);
        }
        return result[0].id;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error; // Rethrow the error to be caught in the fetchAndSaveOdds function
    }
}

  
  fetchAndSaveOdds();