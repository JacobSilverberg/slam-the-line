import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool;

if (process.env.NODE_ENV === 'production') {
  // Production environment (e.g., Railway)
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });
} else {
  // Development environment (local setup)
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'your_local_database',
  });
}

console.log('Connected to database:', process.env.NODE_ENV === 'production' ? 'Production' : 'Development');

export default pool;

