import ingredients from '../src/data/ingredients.json' assert { type: 'json' };
import fallbacks from '../src/data/fallbacks.json' assert { type: 'json' };
import { buildOwnerProfile } from '../src/utils/profileBuilder.js';
import { scoreIngredients } from '../src/utils/matching.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const CALL_TIMEOUT_MS = 8000;
const TOTAL_TIMEOUT_MS = 14000;

async function groqCall(systemPrompt, userMessage, apiKey) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
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
        temperature: 0.75,
        max_tokens: 1800,
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

function calcCost(matchedIngredients) {
  return parseFloat(
    matchedIngredients
      .reduce((sum, i) => sum + i.cost_per_unit * (i.default_quantity ?? 1), 0)
      .toFixed(2)
  );
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

  // Real overall timeout — returns fallback if entire handler exceeds limit
  const fallbackOnTimeout = new Promise(resolve =>
    setTimeout(() => resolve({ ...fallbacks[mode], fallback: true }), TOTAL_TIMEOUT_MS)
  );

  const work = async () => {
    try {
      let targetProfile;

      if (mode === 'creative') {
        // Parse vibe into flavor profile
        const parseSystem = `You are a flavor profiling assistant. Given a mood or vibe description, return ONLY a JSON object (no explanation, no markdown) with exactly these 8 keys, each a number from 0 to 10: sweetness, bitterness, roastiness, spice, brightness, creaminess, warmth, complexity.`;
        const raw = await groqCall(parseSystem, input, apiKey);
        targetProfile = raw
          ? (parseJSON(raw) ?? { sweetness: 5, bitterness: 5, roastiness: 5, spice: 5, brightness: 5, creaminess: 5, warmth: 5, complexity: 5 })
          : { sweetness: 5, bitterness: 5, roastiness: 5, spice: 5, brightness: 5, creaminess: 5, warmth: 5, complexity: 5 };
      } else {
        targetProfile = buildOwnerProfile(input, ingredients);
      }

      const scored = scoreIngredients(targetProfile, ingredients, mode === 'owner' ? input : null);
      const top = scored.slice(0, 5);

      const ingredientContext = top
        .map(i => `- ${i.name} (flavor match score: ${i.score.toFixed(2)}): sweetness=${i.flavor_profile.sweetness}, bitterness=${i.flavor_profile.bitterness}, roastiness=${i.flavor_profile.roastiness}, spice=${i.flavor_profile.spice}, brightness=${i.flavor_profile.brightness}, creaminess=${i.flavor_profile.creaminess}, warmth=${i.flavor_profile.warmth}, complexity=${i.flavor_profile.complexity}`)
        .join('\n');

      const recipeSystem = mode === 'creative'
        ? `You are an award-winning specialty coffee recipe inventor with the creativity of a Michelin-starred chef and the precision of a barista champion. Given matched ingredients and a target flavor profile, return ONLY a JSON object with these exact keys:
- recipe_name: a creative, evocative drink name (2-4 words, sounds like something on a specialty café menu)
- recipe_steps: array of 5-6 precise, barista-quality instruction strings. Be specific with temperatures, quantities, and technique.
- ingredient_explanations: object mapping each ingredient name to a single sentence explaining WHY it was selected based on its specific flavor attributes and score.
No markdown, no explanation outside the JSON.`
        : `You are an award-winning specialty coffee recipe inventor. Given matched ingredients from a café's surplus stock, return ONLY a JSON object with these exact keys:
- recipe_name: a creative, menuable drink name (2-4 words, the kind a barista could write on a chalkboard)
- recipe_steps: array of 5-6 precise, barista-quality instruction strings with specific quantities and temperatures
- ingredient_explanations: object mapping each ingredient name to a single sentence explaining WHY it was selected based on its specific flavor attributes and score.
No markdown, no explanation outside the JSON.`;

      const recipeUser = `Target flavor profile: ${JSON.stringify(targetProfile)}\n\nMatched ingredients:\n${ingredientContext}\n\n${mode === 'creative' ? `Vibe inspiration: "${input}"` : `Owner mode — turn these surplus café ingredients into a sellable drink. Selected by owner: ${Array.isArray(input) ? input.map(id => ingredients.find(i => i.id === id)?.name).join(', ') : input}`}`;

      const recipeRaw = await groqCall(recipeSystem, recipeUser, apiKey);
      const recipeData = recipeRaw ? parseJSON(recipeRaw) : null;

      if (!recipeData) {
        return { ...fallbacks[mode], fallback: true };
      }

      let artwork_url = null;
      if (mode === 'creative' && recipeData.recipe_name) {
        const prompt = encodeURIComponent(
          `${recipeData.recipe_name} specialty coffee drink artistic photography, moody dark studio lighting, ceramic cup, top-down view, food photography`
        );
        artwork_url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`;
      }

      // Correct cost: cost_per_unit × default_quantity for each matched ingredient
      const matchedWithData = top.map(i => ({
        ...i,
        cost_per_unit: i.cost_per_unit,
        default_quantity: i.default_quantity ?? 1,
      }));

      let cost_estimate = null;
      let buildable = null;
      if (mode === 'owner') {
        cost_estimate = calcCost(matchedWithData);
        buildable = top.every(i => i.mock_stock_quantity > 0);
      }

      return {
        mode,
        input,
        target_flavor_profile: targetProfile,
        matched_ingredients: top.map(i => ({
          id: i.id,
          name: i.name,
          score: parseFloat(i.score.toFixed(2)),
          reason: recipeData.ingredient_explanations?.[i.name] ?? 'Selected for flavor compatibility with the target profile.',
        })),
        recipe_name: recipeData.recipe_name ?? null,
        recipe_steps: recipeData.recipe_steps ?? [],
        cost_estimate,
        buildable,
        artwork_url,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return { ...fallbacks[mode], fallback: true };
    }
  };

  const result = await Promise.race([work(), fallbackOnTimeout]);
  return res.status(200).json(result);
}
