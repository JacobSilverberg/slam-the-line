import axios from 'axios';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const createMockData = async () => {
  try {
    const dateFormatted = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const uniqueIdentifier = Date.now();

    // Create multiple users
    const userEmails = Array.from({ length: 10 }, (_, i) => `user${i}@test.com`);
    const users = await Promise.all(
      userEmails.map(async email => {
        try {
          // Try to create the user
          await axios.post('http://localhost:3000/auth/register', {
            email,
            password: 'password123',
            role: 'user',
            created_at: dateFormatted,
            updated_at: dateFormatted
          });
        } catch (err) {
          if (err.response && err.response.status === 400 && err.response.data.msg === 'User already exists') {
            // User already exists, proceed to get the user ID
            console.log(`User ${email} already exists, fetching user ID.`);
          } else {
            // Other errors
            throw err;
          }
        }

        // Get the user ID
        const response = await axios.get(`http://localhost:3000/getuseridbyemail/${encodeURIComponent(email)}`);
        return response.data.userId;
      })
    );

    // Create multiple leagues with random weekly_points, games_select_min, and games_select_max
    const leagues = await Promise.all(
      Array.from({ length: 3 }, async (_, i) => {
        const weekly_points = getRandomInt(10, 20); // Example range for weekly points
        const games_select_min = getRandomInt(1, 32); // Example range for games_select_min
        const games_select_max = getRandomInt(games_select_min, 32); // Ensure games_select_max >= games_select_min

        // Log the values to verify they are correct
        console.log('Creating league with:');
        console.log('weekly_points:', weekly_points);
        console.log('games_select_min:', games_select_min);
        console.log('games_select_max:', games_select_max);

        // Create the league and log the response for debugging
        const response = await axios.post('http://localhost:3000/createleague', {
          name: `League_${uniqueIdentifier}_${i}`,
          type: 'league',
          sport: 'nfl',
          year: 2024,
          weeklyPoints: weekly_points,
          gamesSelectMin: games_select_min,
          gamesSelectMax: games_select_max,
        });

        console.log('League created:', response.data);

        return response;
      })
    );

    // Add users to leagues and make pick selections
    for (const userId of users) {
      for (const league of leagues) {
        const leagueId = league.data.id; // Extract leagueId from response

        // Debug logging
        const teamName = `Team ${userId}`;
        console.log(`Registering user ${userId} to league ${leagueId} with team name ${teamName}`);

        // Register the user to the league
        try {
          await axios.post(`http://localhost:3000/leagueregistration/${leagueId}/users/${userId}`, {
            league_role: 'owner',
            team_name: teamName,
          });
        } catch (err) {
          console.error(`Error registering user ${userId} to league ${leagueId}:`, err.response?.data || err.message);
          continue;
        }

        // Make pick selections
        try {
          const week = 1;
          const gamesResponse = await axios.get(`http://localhost:3000/games/${week}`);
          const games = gamesResponse.data;

          const selectedGamesCount = getRandomInt(league.data.gamesSelectMin, league.data.gamesSelectMax);
          const selectedGames = games.slice(0, selectedGamesCount);
          
          let remainingPoints = league.data.weeklyPoints;
          const picks = selectedGames.map((game, index) => {
            const points = index === selectedGamesCount - 1 ? remainingPoints : getRandomInt(1, remainingPoints - (selectedGamesCount - index - 1));
            remainingPoints -= points;
            return {
              gameId: game.id,
              teamId: game.home_team_id,
              points: points,
              createdAt: dateFormatted,
              updatedAt: dateFormatted,
            };
          });

          await axios.post(`http://localhost:3000/submitpicks/`, {
            userId: userId,
            leagueId: leagueId,
            picks,
          });
        } catch (err) {
          console.error(`Error making picks for user ${userId} in league ${leagueId}:`, err.response?.data || err.message);
        }
      }
    }

    console.log('Mock data created successfully');
  } catch (error) {
    console.error('Error creating mock data:', error.response?.data || error.message);
  }
};

createMockData();
