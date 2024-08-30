import pool from '../config/db.js';

export const getUserLeagueRole = async (req, res) => {
  const { leagueId, userId } = req.params;

  try {
    // Query the database to get the league_role
    const [user] = await pool.query(
      'SELECT league_role FROM leagues_have_users WHERE user_id = ? AND league_id = ?',
      [userId, leagueId]
    );

    if (user.length > 0) {
      // Return the league_role if the user is found
      return res.status(200).json({ league_role: user[0].league_role });
    } else {
      // Handle the case where the user is not found
      return res.status(404).json({ msg: 'User not found in the league' });
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
