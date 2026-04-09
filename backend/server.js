require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors()); // Allow frontend on localhost:5174 to call this
app.use(express.json({ limit: '20mb' })); // Images can be large as base64

// ── Gemini client ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Default system prompt ─────────────────────────────────────────────────────
// CMS devs can override this per-request via the `systemPrompt` field
const DEFAULT_PROMPT =
  'You are an accessibility expert. Generate a concise, descriptive alt text for the provided image. ' +
  'Focus on the key visual content, context, and purpose. Keep it under 125 characters unless complexity requires more. ' +
  'Return ONLY the alt text string — no quotes, no explanation, no preamble.';

// ── POST /generate-alt-text ───────────────────────────────────────────────────
app.post('/generate-alt-text', async (req, res) => {
  const { image, mimeType, systemPrompt } = req.body;

  if (!image || !mimeType) {
    return res.status(400).json({ message: 'image (base64) and mimeType are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = systemPrompt?.trim() || DEFAULT_PROMPT;

    // Gemini vision call — pass image as inline base64 data part
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image,       // raw base64 string, no data: prefix
          mimeType: mimeType // e.g. "image/jpeg"
        }
      }
    ]);

    const altText = result.response.text().trim();
    return res.json({ altText });

  } catch (err) {
    console.error('Gemini error:', err.message);

    // Return clean, human-readable error messages
    let message = 'Gemini API error. Please try again.';
    if (err.message?.includes('quota') || err.message?.includes('429') || err.message?.includes('Too Many Requests')) {
      message = 'Rate limit hit — wait a moment and try again. (Free tier: 15 requests/min)';
    } else if (err.message?.includes('API key')) {
      message = 'Invalid API key. Check your GEMINI_API_KEY in backend/.env';
    } else if (err.message?.includes('SAFETY')) {
      message = 'Image was blocked by Gemini safety filters. Try a different image.';
    }

    return res.status(500).json({ message });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`✅  Backend running at http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY is not set — add it to backend/.env');
  }
});
