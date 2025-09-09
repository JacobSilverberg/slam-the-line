import axios from 'axios';

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const createMockData = async () => {
  try {
    const dateFormatted = new Date()
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
    const uniqueIdentifier = Date.now();

    console.log('Note: Make sure you have run insertMockData.sql first to create teams and games!');

    // Create multiple users
    const userEmails = Array.from(
      { length: 10 },
      (_, i) => `user${i}@test.com`
    );
    const users = await Promise.all(
      userEmails.map(async (email) => {
        try {
          // Try to create the user
          await axios.post('http://localhost:3000/auth/register', {
            email,
            password: 'password123',
            role: 'user',
            created_at: dateFormatted,
            updated_at: dateFormatted,
          });
        } catch (err) {
          if (
            err.response &&
            err.response.status === 400 &&
            err.response.data.msg === 'User already exists'
          ) {
            // User already exists, proceed to get the user ID
            console.log(`User ${email} already exists, fetching user ID.`);
          } else {
            // Other errors
            throw err;
          }
        }

        // Get the user ID
        const response = await axios.get(
          `http://localhost:3000/getuseridbyemail/${encodeURIComponent(email)}`
        );
        return response.data.userId;
      })
    );

    // Create multiple leagues with random weeklyPoints, gamesSelectMin, and gamesSelectMax
    const leagues = await Promise.all(
      Array.from({ length: 3 }, async (_, i) => {
        const weeklyPoints = getRandomInt(10, 20); // Example range for weekly points
        const gamesSelectMin = getRandomInt(1, 8); // More realistic range for gamesSelectMin
        const gamesSelectMax = getRandomInt(gamesSelectMin, 12); // More realistic range for gamesSelectMax
        const year = 2025; // Use 2025 for all leagues

        // Log the values to verify they are correct
        console.log('Creating league with:');
        console.log('weeklyPoints:', weeklyPoints);
        console.log('gamesSelectMin:', gamesSelectMin);
        console.log('gamesSelectMax:', gamesSelectMax);
        console.log('year:', year);

        // Create the league and log the response for debugging
        const response = await axios.post(
          'http://localhost:3000/createleague',
          {
            name: `League_${uniqueIdentifier}_${i}`,
            type: 'league',
            sport: 'nfl',
            year: year,
            weeklyPoints,
            gamesSelectMin,
            gamesSelectMax,
          }
        );

        console.log('League created:', response.data);

        return {
          ...response.data,
          weeklyPoints,
          gamesSelectMin,
          gamesSelectMax,
          year: year, // Make sure year is included
        };
      })
    );

    // Add users to leagues and make pick selections
    for (const userId of users) {
      for (const league of leagues) {
        const leagueId = league.id; // Extract leagueId from response

        // Debug logging
        const teamName = `Team ${userId}`;
        console.log(
          `Registering user ${userId} to league ${leagueId} with team name ${teamName}`
        );

        // Register the user to the league
        try {
          await axios.post(
            `http://localhost:3000/leagueregistration/${leagueId}/users/${userId}`,
            {
              league_role: 'owner',
              team_name: teamName,
            }
          );
        } catch (err) {
          console.error(
            `Error registering user ${userId} to league ${leagueId}:`,
            err.response?.data || err.message
          );
          continue;
        }

        // Make pick selections for multiple weeks
        try {
          // Create picks for weeks 1-3 to have more comprehensive test data
          const weeks = [1, 2, 3];
          
          // Debug: Log league info
          console.log(`League info for league ${leagueId}:`, {
            id: league.id,
            year: league.year,
            weeklyPoints: league.weeklyPoints
          });
          
          for (const week of weeks) {
          const gamesResponse = await axios.get(
            `http://localhost:3000/games/${week}`
          );
          // Filter games by nfl_year to match the league year
          const games = gamesResponse.data.filter(game => game.nfl_year === league.year);

          // Log fetched games
          console.log(`Fetched games for week ${week} (year ${league.year}):`, games);

          if (games.length === 0) {
            console.warn(
              `No games found for week ${week} in year ${league.year}. Skipping picks for user ${userId} in league ${leagueId}.`
            );
            continue;
          }

          const { weeklyPoints, gamesSelectMin, gamesSelectMax } = league;

          // Ensure gamesSelectMin and gamesSelectMax are numbers
          const parsedGamesSelectMin = parseInt(gamesSelectMin, 10);
          const parsedGamesSelectMax = parseInt(gamesSelectMax, 10);

          // Check for NaN values
          if (isNaN(parsedGamesSelectMin) || isNaN(parsedGamesSelectMax)) {
            console.error(
              `Invalid gamesSelectMin or gamesSelectMax for league ${leagueId}:`,
              {
                gamesSelectMin,
                gamesSelectMax,
              }
            );
            continue;
          }

          const selectedGamesCount = getRandomInt(
            parsedGamesSelectMin,
            parsedGamesSelectMax
          );
          const selectedGames = games
            .sort(() => 0.5 - Math.random())
            .slice(0, selectedGamesCount); // Shuffle and pick random games

          let remainingPoints = weeklyPoints;
          const selectedTeam = {};
          const weeklyPointsAllocation = {};

          selectedGames.forEach((game, index) => {
            const maxPointsForGame =
              remainingPoints - (selectedGamesCount - index - 1);
            const points =
              index === selectedGamesCount - 1
                ? remainingPoints
                : getRandomInt(1, Math.max(1, maxPointsForGame));
            remainingPoints -= points;
            selectedTeam[game.id] =
              Math.random() < 0.5 ? game.home_team_id : game.away_team_id; // Randomly select home or away team
            weeklyPointsAllocation[game.id] = points;
          });

          const formData = selectedGames.map((game) => ({
            gameId: game.id,
            teamId: selectedTeam[game.id],
            points: weeklyPointsAllocation[game.id],
            createdAt: dateFormatted,
            updatedAt: dateFormatted,
          }));

          // Log the picks
          console.log(
            `Submitting picks for user ${userId} in league ${leagueId}:`,
            formData
          );

            await axios.post(`http://localhost:3000/submitpicks/`, {
              userId: userId,
              leagueId: leagueId,
              picks: formData,
            });
            
            console.log(`Successfully created picks for user ${userId} in league ${leagueId} for week ${week}`);
          } // End of week loop
        } catch (err) {
          console.error(
            `Error making picks for user ${userId} in league ${leagueId}:`,
            err.response?.data || err.message
          );
        }
      }
    }

    console.log('Mock data created successfully');
  } catch (error) {
    console.error(
      'Error creating mock data:',
      error.response?.data || error.message
    );
  }
};

createMockData();
