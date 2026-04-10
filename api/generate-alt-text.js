const { GoogleGenerativeAI } = require('@google/generative-ai');

const DEFAULT_PROMPT =
  'You are an accessibility expert. Generate a concise, descriptive alt text for the provided image. ' +
  'Focus on the key visual content, context, and purpose. Keep it under 125 characters unless complexity requires more. ' +
  'Return ONLY the alt text string — no quotes, no explanation, no preamble.';

// Gemini 2.5 Flash can return 503 under high demand — retry up to 3 times
async function generateWithRetry(model, parts, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(parts);
      return result.response.text().trim();
    } catch (err) {
      const isOverloaded = err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand');
      if (isOverloaded && attempt < maxAttempts) {
        // Wait 1s, 2s before retrying
        await new Promise(r => setTimeout(r, attempt * 1000));
        continue;
      }
      throw err;
    }
  }
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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = systemPrompt?.trim() || DEFAULT_PROMPT;

    const altText = await generateWithRetry(model, [
      prompt,
      { inlineData: { data: image, mimeType } },
    ]);

    return res.json({ altText });

  } catch (err) {
    console.error('Gemini error:', err.message);

    let message = 'Gemini API error. Please try again.';
    if (err.message?.includes('503') || err.message?.includes('UNAVAILABLE') || err.message?.includes('high demand')) {
      message = 'Gemini is overloaded right now. Please try again in a moment.';
    } else if (err.message?.includes('quota') || err.message?.includes('429')) {
      message = 'Rate limit hit — wait a moment and try again.';
    } else if (err.message?.includes('API key')) {
      message = 'Invalid API key. Check GEMINI_API_KEY in Vercel environment variables.';
    } else if (err.message?.includes('SAFETY')) {
      message = 'Image was blocked by Gemini safety filters. Try a different image.';
    }

    return res.status(500).json({ message });
  }
};
