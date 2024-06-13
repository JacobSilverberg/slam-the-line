import pool from '../config/db.js';

export const createLeague = async (req, res) => {
  const {
    gamesSelectMax,
    gamesSelectMin,
    name,
    sport,
    type,
    weeklyPoints,
    year,
  } = req.body;

  try {
    const [league] = await pool.query('SELECT * FROM leagues WHERE name = ?', [
      name,
    ]);
    if (league.length > 0) {
      return res
        .status(400)
        .json({ msg: 'League with that name already exists' });
    }

    await pool.query(
      'INSERT INTO leagues (games_select_max, games_select_min, name, sport, type, weekly_points, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [gamesSelectMax, gamesSelectMin, name, sport, type, weeklyPoints, year]
    );

    const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id');
    const id = rows[0].id;

    res.json({ message: 'League created successfully', id: id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
