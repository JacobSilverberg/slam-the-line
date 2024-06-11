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
