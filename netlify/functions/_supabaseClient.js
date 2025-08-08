const { createClient } = require('@supabase/supabase-js');

function getClient(accessToken) {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = accessToken ? anon : service;
  const opts = {};
  if (accessToken) {
    opts.global = { headers: { Authorization: `Bearer ${accessToken}` } };
  }
  return createClient(url, key, opts);
}

module.exports = { getClient };