const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { text, targetLang } = JSON.parse(event.body || '{}');
    if (!text || !targetLang) return { statusCode: 400, body: JSON.stringify({ error: 'text and targetLang required' }) };
    const api = process.env.TRANSLATE_API_URL || process.env.LIBRETRANSLATE_URL;
    const apiKey = process.env.TRANSLATE_API_KEY;
    if (api) {
      try {
        const resp = await fetch(api, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', ...(apiKey ? { 'Authorization':`Bearer ${apiKey}` } : {}) },
          body: JSON.stringify({ q:text, target:targetLang })
        });
        if (!resp.ok) throw new Error(`Translate provider ${resp.status}`);
        const data = await resp.json();
        const translation = data?.translatedText || data?.data?.translations?.[0]?.translatedText;
        if (translation) return { statusCode: 200, body: JSON.stringify({ translation }) };
        throw new Error('No translation field');
      } catch(err) {
        return { statusCode: 200, body: JSON.stringify({ translation:`[${targetLang}] ${text}`, providerError: err.message }) };
      }
    }
    return { statusCode: 200, body: JSON.stringify({ translation:`[${targetLang}] ${text}` }) };
  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};