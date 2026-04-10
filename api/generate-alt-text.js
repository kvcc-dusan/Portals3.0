const https = require('https');

const DEFAULT_PROMPT =
  'You are an accessibility expert. Generate a concise, descriptive alt text for the provided image. ' +
  'Focus on the key visual content, context, and purpose. Keep it under 125 characters unless complexity requires more. ' +
  'Return ONLY the alt text string — no quotes, no explanation, no preamble.';

// Thin wrapper around the OpenAI API — no SDK needed
function openaiRequest(body, apiKey) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from OpenAI')); }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  // CORS headers — allow requests from any origin (prototype use)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { image, mimeType, systemPrompt } = req.body;

  if (!image || !mimeType) {
    return res.status(400).json({ message: 'image (base64) and mimeType are required' });
  }

  try {
    const prompt = systemPrompt?.trim() || DEFAULT_PROMPT;

    // GPT-4o mini vision — pass image as base64 data URL
    const response = await openaiRequest({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image}` } },
        ],
      }],
      max_tokens: 200,
    }, process.env.OPENAI_API_KEY);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const altText = response.choices?.[0]?.message?.content?.trim();
    if (!altText) throw new Error('No response from OpenAI');

    return res.json({ altText });

  } catch (err) {
    console.error('OpenAI error:', err.message);

    let message = 'Failed to generate alt text. Please try again.';
    if (err.message?.includes('insufficient_quota') || err.message?.includes('exceeded')) {
      message = 'OpenAI quota exceeded. Add credits at platform.openai.com/billing.';
    } else if (err.message?.includes('API key') || err.message?.includes('Incorrect API key')) {
      message = 'Invalid API key. Check OPENAI_API_KEY in Vercel environment variables.';
    } else if (err.message?.includes('rate_limit')) {
      message = 'Rate limit hit — wait a moment and try again.';
    }

    return res.status(500).json({ message });
  }
};
