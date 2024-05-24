import express from 'express';
import dotenv from 'dotenv';
import indexRoute from './routes/indexRoute.js';
import gameRoute from './routes/gameRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/', indexRoute);
app.use('/api/games', gameRoute);

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
