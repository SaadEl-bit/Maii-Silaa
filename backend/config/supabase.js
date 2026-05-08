// Creates the Supabase client — the main way we talk to the database, auth, and storage.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Read the URL and key from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Make sure both values exist before continuing
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env — cannot start.'
  );
}

// Create the client with the service role key (full access, for backend use only)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;