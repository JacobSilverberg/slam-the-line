import pool from '../config/db.js';

export const leagueInfo = async (req, res) => {
  const { leagueId } = req.params;

  try {
    const [league] = await pool.query('SELECT * FROM leagues WHERE id = ?', [
      leagueId,
    ]);
    res.status(200).json({ league });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
