const fetch = require('node-fetch');

function fallbackSummarize(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const short = words.slice(0, 60).join(' ');
  return short + (words.length > 60 ? '…' : '');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };
  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) return { statusCode: 400, body: JSON.stringify({ error: 'text required' }) };
    const base = process.env.AI_BASE_URL;
    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || 'gpt-4o';
    if (base && key) {
      try {
        const response = await fetch(`${base}/chat/completions`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
          body: JSON.stringify({
            model,
            messages:[
              { role:'system', content:'Summarize the user text in 3-5 concise bullet points.' },
              { role:'user', content:text }
            ],
            temperature:0.2
          })
        });
        if (!response.ok) throw new Error(`AI provider ${response.status}`);
        const data = await response.json();
        const summary = data?.choices?.[0]?.message?.content || fallbackSummarize(text);
        return { statusCode: 200, body: JSON.stringify({ summary }) };
      } catch(err) {
        return { statusCode: 200, body: JSON.stringify({ summary: fallbackSummarize(text), providerError: err.message }) };
      }
    }
    return { statusCode: 200, body: JSON.stringify({ summary: fallbackSummarize(text) }) };
  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};