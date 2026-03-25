export const config = { runtime: 'nodejs' };

async function fetchAnkiCards(condition) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || !condition) return [];

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_anki_cards_for_condition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ condition_name: condition }),
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt, condition } = req.body;

  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: 'Missing messages or systemPrompt' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API_KEY_MISSING' });
  }

  // Fetch matching Anki cards and inject into system prompt
  const cards = await fetchAnkiCards(condition);
  let augmentedPrompt = systemPrompt;
  if (cards.length > 0) {
    const cardText = cards
      .map(c => `- ${c.front}${c.back ? ' → ' + c.back : ''}`)
      .join('\n');
    augmentedPrompt += `\n\nREFERENCE MATERIAL (verified medical flashcard deck — use these facts when teaching):\n${cardText}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: augmentedPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
