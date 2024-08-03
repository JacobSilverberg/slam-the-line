import pool from '../config/db.js';

export const removeUserSelections = async (req, res) => {
  const { leagueId, userId } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM users_select_games WHERE league_id = ? AND user_id = ?',
      [leagueId, userId]
    );

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ message: 'User selections deleted successfully.' });
    } else {
      res
        .status(404)
        .json({
          message: 'No selections found for the given user and league.',
        });
    }
  } catch (err) {
    console.error('Error deleting user selections:', err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
