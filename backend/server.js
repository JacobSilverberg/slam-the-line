import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import indexRoute from './routes/indexRoute.js';
import gameRoute from './routes/gameRoute.js';
import authRoutes from './routes/authRoutes.js';
import createLeagueRoutes from './routes/createLeagueRoute.js';
import leagueRegistrationRoute from './routes/leagueRegistrationRoute.js';
import submitPicksRoute from './routes/submitPicksRoute.js';
import getUserLeaguesRoute from './routes/getUserLeaguesRoute.js';
import leagueInfoRoute from './routes/leagueInfoRoute.js';
import userSelectionsRoute from './routes/userSelectionsRoute.js'
import removeUserSelectionsRoute from './routes/removeUserSelectionsRoute.js'
import getOddsRoute from './routes/getOddsRoute.js';
import getScoresRoute from './routes/getScoresRoute.js';
import updateOddsRoute from './routes/updateOddsRoute.js';
import updateScoresRoute from './routes/updateScoresRoute.js';
import evaluateSpreadsRoute from './routes/evaluateSpreadsRoute.js';
import evaluateUserScoresRoute from './routes/evaluateUserScoresRoute.js';
import getLeagueStandingsRoute from './routes/getLeagueStandingsRoute.js';

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// Middleware
app.use(express.json());

// Routes
app.use('/', indexRoute);
app.use('/games', gameRoute);
app.use('/auth', authRoutes);
app.use('/createleague', createLeagueRoutes);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
