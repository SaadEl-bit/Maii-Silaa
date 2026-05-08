// Direct PostgreSQL connection pool — used by scripts like migrate.js.
// Most of the app uses supabase.js instead. This is only for raw SQL.

require('dotenv').config();
const { Pool } = require('pg');

// Read the connection string from .env
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in .env — cannot connect to Postgres.');
}

// Create a connection pool (reuses connections instead of opening a new one each time)
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

module.exports = pool;