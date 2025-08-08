const { getClient } = require('./_supabaseClient');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const supabase = getClient();
  if (!supabase) return { statusCode: 500, body: JSON.stringify({ error: 'Supabase not configured' }) };
  try {
    // Insert demo cases
    const demoCases = [
      { title: 'Lease Dispute — Late Payments', description: 'Tenant vs Landlord. Late fees and notice periods.' },
      { title: 'Online Purchase Chargeback', description: 'Consumer claims non-delivery; merchant disputes.' },
      { title: 'Workplace Mediation', description: 'Mediation between manager and employee regarding schedule.' }
    ];
    for (const c of demoCases) {
      await supabase.from('cases').insert({ ...c, created_by: '00000000-0000-0000-0000-000000000000' });
    }
    return { statusCode: 200, body: JSON.stringify({ inserted: demoCases.length }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};