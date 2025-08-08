const { getClient } = require('./_supabaseClient');

exports.handler = async (event) => {
  const method = event.httpMethod;
  const supabase = getClient();
  if (!supabase) return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };
  if (method === 'POST') {
    const body = JSON.parse(event.body || '{}');
    const { case_id, filename, sha256, size_bytes, metadata } = body;
    if (!filename || !sha256) return { statusCode: 400, body: JSON.stringify({ error: 'filename and sha256 required' }) };
    const record = {
      case_id: case_id || null,
      uploaded_by: '00000000-0000-0000-0000-000000000000',
      file_name: filename,
      file_hash: sha256,
      file_size_bytes: size_bytes,
      mime_type: metadata?.mime_type || null,
      storage_path: null
    };
    const { error } = await supabase.from('evidence').insert(record);
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    return { statusCode: 201, body: JSON.stringify({ ok: true }) };
  }
  return { statusCode: 405, body: 'Method not allowed' };
};