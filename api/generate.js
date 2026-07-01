import ingredients from '../src/data/ingredients.json' assert { type: 'json' };
import fallbacks from '../src/data/fallbacks.json' assert { type: 'json' };
import { buildOwnerProfile } from '../src/utils/profileBuilder.js';
import { scoreIngredients } from '../src/utils/matching.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-8b-8192';
const TIMEOUT_MS = 8000;

async function groqCall(systemPrompt, userMessage, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

function parseJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mode, input } = req.body ?? {};
  if (!mode || !input) {
    return res.status(400).json({ error: 'mode and input are required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ...fallbacks[mode], fallback: true });
  }

  const overallTimer = setTimeout(() => {}, TIMEOUT_MS);

  try {
    let targetProfile;

    if (mode === 'creative') {
      const parseSystem = `You are a flavor profiling assistant. Given a mood or vibe description, return ONLY a JSON object (no explanation, no markdown) with exactly these 8 keys, each a number from 0 to 10: sweetness, bitterness, roastiness, spice, brightness, creaminess, warmth, complexity.`;
      const raw = await groqCall(parseSystem, input, apiKey);
      targetProfile = raw ? (parseJSON(raw) ?? { sweetness: 5, bitterness: 5, roastiness: 5, spice: 5, brightness: 5, creaminess: 5, warmth: 5, complexity: 5 }) : { sweetness: 5, bitterness: 5, roastiness: 5, spice: 5, brightness: 5, creaminess: 5, warmth: 5, complexity: 5 };
    } else {
      targetProfile = buildOwnerProfile(input, ingredients);
    }

    const scored = scoreIngredients(targetProfile, ingredients, mode === 'owner' ? input : null);
    const top = scored.slice(0, 5);

    const ingredientContext = top.map(i => `- ${i.name} (score: ${i.score.toFixed(2)}): sweetness=${i.flavor_profile.sweetness}, bitterness=${i.flavor_profile.bitterness}, roastiness=${i.flavor_profile.roastiness}, spice=${i.flavor_profile.spice}, brightness=${i.flavor_profile.brightness}, creaminess=${i.flavor_profile.creaminess}, warmth=${i.flavor_profile.warmth}, complexity=${i.flavor_profile.complexity}`).join('\n');

    const recipeSystem = mode === 'creative'
      ? `You are a specialty coffee recipe inventor. Given matched ingredients and a target flavor profile, return ONLY a JSON object with: recipe_name (creative, evocative string), recipe_steps (array of 4-6 strings), ingredient_explanations (object mapping ingredient name to a one-sentence reason grounded in its flavor attributes). No markdown, no explanation outside the JSON.`
      : `You are a specialty coffee recipe inventor. Given matched ingredients, return ONLY a JSON object with: recipe_steps (array of 4-6 strings), ingredient_explanations (object mapping ingredient name to a one-sentence reason grounded in its flavor attributes). No markdown, no explanation outside the JSON.`;

    const recipeUser = `Target flavor profile: ${JSON.stringify(targetProfile)}\n\nMatched ingredients:\n${ingredientContext}\n\n${mode === 'creative' ? `Inspiration: "${input}"` : 'Owner mode: create a recipe using these matched ingredients.'}`;

    const recipeRaw = await groqCall(recipeSystem, recipeUser, apiKey);
    const recipeData = recipeRaw ? parseJSON(recipeRaw) : null;

    if (!recipeData) {
      clearTimeout(overallTimer);
      return res.status(200).json({ ...fallbacks[mode], fallback: true });
    }

    let artwork_url = null;
    if (mode === 'creative' && recipeData.recipe_name) {
      const prompt = encodeURIComponent(`${recipeData.recipe_name} specialty coffee drink, moody studio lighting, artistic, top-down view`);
      artwork_url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`;
    }

    let cost_estimate = null;
    let buildable = null;
    if (mode === 'owner') {
      const selectedIngredients = ingredients.filter(i => (Array.isArray(input) ? input : []).includes(i.id));
      cost_estimate = parseFloat(selectedIngredients.reduce((sum, i) => sum + i.cost_per_unit, 0).toFixed(2));
      buildable = selectedIngredients.every(i => i.mock_stock_quantity > 0);
    }

    const result = {
      mode,
      input,
      target_flavor_profile: targetProfile,
      matched_ingredients: top.map(i => ({
        id: i.id,
        name: i.name,
        score: parseFloat(i.score.toFixed(2)),
        reason: recipeData.ingredient_explanations?.[i.name] ?? 'Selected for flavor compatibility.',
      })),
      recipe_name: recipeData.recipe_name ?? null,
      recipe_steps: recipeData.recipe_steps ?? [],
      cost_estimate,
      buildable,
      artwork_url,
      timestamp: new Date().toISOString(),
    };

    clearTimeout(overallTimer);
    return res.status(200).json(result);
  } catch {
    clearTimeout(overallTimer);
    return res.status(200).json({ ...fallbacks[mode], fallback: true });
  }
}
