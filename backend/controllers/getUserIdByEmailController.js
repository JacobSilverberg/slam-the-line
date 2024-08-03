import pool from '../config/db.js';

export const getUserIdByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [
      email,
    ]);

    if (user.length > 0) {
      res.status(200).json({ userId: user[0].id });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
