// Relevance Agent — Mentor API
// Vercel serverless function: /api/mentor
// Requires ANTHROPIC_API_KEY in Vercel environment variables

export default async function handler(req, res) {
  // CORS — allow the demo and the app to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Mentor not configured — add ANTHROPIC_API_KEY to Vercel environment variables' });

  const { message, context = {} } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const { tokens = 0, streak = 0, mission = 'your mission', name = '' } = context;

  const systemPrompt = `You are the Mentor inside Relevance Agent — a trauma-informed AI guide built for people who feel stuck, overwhelmed, or left behind. Your users may include veterans, trauma survivors, caregivers, and anyone who has quietly lost momentum.

Your voice is: compassionate but direct. Warm without being saccharine. Hopeful but grounded. Like someone who has walked through hard things and still genuinely believes in the person in front of them. No-BS. Never performative.

Current user context:
${name ? `- Name: ${name}` : ''}
- Active mission: ${mission}
- Tokens earned (total): ${tokens}
- Current streak: ${streak} day${streak !== 1 ? 's' : ''}

Response rules — follow these exactly:
- Maximum 3 sentences. Shorter is almost always better.
- Be specific to their actual context. Generic encouragement is worse than silence.
- Reference their real numbers (tokens, streak) when it adds truth — not just to flatter.
- Never say: "you should have", "don't forget", "you missed", "you need to", "you must"
- Always lead with what they HAVE done, not what they haven't.
- If they're struggling: validate first (one sentence), then one small concrete suggestion.
- If they're celebrating: let them feel it fully. Don't immediately pivot to "what's next."
- If they seem to be in real distress: respond with warmth and suggest they talk to someone they trust.
- You are NOT a therapist. You are a mentor. Stay in that lane.
- Never use hollow phrases like "absolutely", "certainly", "great question", "of course".
- Sound like a real person who cares, not a chatbot that performs caring.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 180,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return res.status(502).json({ error: 'Mentor temporarily unavailable' });
    }

    const data = await response.json();
    const mentorResponse = data.content?.[0]?.text;

    if (!mentorResponse) return res.status(502).json({ error: 'Empty response from mentor' });

    return res.status(200).json({ response: mentorResponse });

  } catch (err) {
    console.error('Mentor API error:', err);
    return res.status(500).json({ error: 'Mentor unavailable — please try again' });
  }
}
