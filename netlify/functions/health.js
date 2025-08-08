exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'ok', supabaseConfigured: !!process.env.SUPABASE_URL }),
  };
};