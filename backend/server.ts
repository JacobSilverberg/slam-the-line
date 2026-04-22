import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';

import indexRoute from './routes/indexRoute.js';
import gameRoute from './routes/gameRoute.js';
import authRoutes from './routes/authRoutes.js';
import createLeagueRoute from './routes/createLeagueRoute.js';
import leagueRegistrationRoute from './routes/leagueRegistrationRoute.js';
import submitPicksRoute from './routes/submitPicksRoute.js';
import getUserLeaguesRoute from './routes/getUserLeaguesRoute.js';
import leagueInfoRoute from './routes/leagueInfoRoute.js';
import userSelectionsRoute from './routes/userSelectionsRoute.js';
import removeUserSelectionsRoute from './routes/removeUserSelectionsRoute.js';
import getOddsRoute from './routes/getOddsRoute.js';
import getScoresRoute from './routes/getScoresRoute.js';
import updateOddsRoute from './routes/updateOddsRoute.js';
import updateScoresRoute from './routes/updateScoresRoute.js';
import evaluateSpreadsRoute from './routes/evaluateSpreadsRoute.js';
import evaluateUserScoresRoute from './routes/evaluateUserScoresRoute.js';
import getLeagueStandingsRoute from './routes/getLeagueStandingsRoute.js';
import getUserIdByEmailRoute from './routes/getUserIdByEmailRoute.js';
import searchLeaguesRoute from './routes/searchLeaguesRoute.js';
import evaluateGameStartRoute from './routes/evaluateGameStartRoute.js';
import getUserLeagueRoleRoute from './routes/getUserLeagueRoleRoute.js';
import getUsersInLeagueRoute from './routes/getUsersInLeagueRoute.js';

import './tasks/scheduler.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://slamtheline.com',
  'https://www.slamtheline.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/', indexRoute);
app.use('/games', gameRoute);
app.use('/auth', authRoutes);
app.use('/createleague', createLeagueRoute);
app.use('/leagueregistration', leagueRegistrationRoute);
app.use('/submitpicks', submitPicksRoute);
app.use('/getuserleagues', getUserLeaguesRoute);
app.use('/leagueinfo', leagueInfoRoute);
app.use('/userselections', userSelectionsRoute);
app.use('/removeuserselections', removeUserSelectionsRoute);
app.use('/getodds', getOddsRoute);
app.use('/getscores', getScoresRoute);
app.use('/updateodds', updateOddsRoute);
app.use('/updatescores', updateScoresRoute);
app.use('/evaluatespreads', evaluateSpreadsRoute);
app.use('/evaluateuserscores', evaluateUserScoresRoute);
app.use('/getleaguestandings', getLeagueStandingsRoute);
app.use('/getuseridbyemail', getUserIdByEmailRoute);
app.use('/searchleagues', searchLeaguesRoute);
app.use('/evaluategamestart', evaluateGameStartRoute);
app.use('/getuserleaguerole', getUserLeagueRoleRoute);
app.use('/getusersinleague', getUsersInLeagueRoute);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV });
});
