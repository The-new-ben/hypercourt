const { getClient } = require('./_supabaseClient');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const token = event.headers.authorization ? event.headers.authorization.split(' ')[1] : null;
  const supabase = getClient();
  if (!supabase) return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };
  // Without auth, use service role and filter by dummy user; for demonstration only
  if (method === 'GET') {
    const { data, error } = await supabase.from('cases').select('*').order('created_at', { ascending: false });
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 200, body: JSON.stringify(data) };
  }
  if (method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { title, description } = body;
    if (!title) return { statusCode: 400, body: JSON.stringify({ error: 'title required' }) };
    const insertItem = { title, description, created_by: '00000000-0000-0000-0000-000000000000' };
    const { data, error } = await supabase.from('cases').insert(insertItem).select().single();
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 201, body: JSON.stringify(data) };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};