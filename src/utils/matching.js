const DIMS = ['sweetness', 'bitterness', 'roastiness', 'spice', 'brightness', 'creaminess', 'warmth', 'complexity'];

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const dim of DIMS) {
    dot += a[dim] * b[dim];
    magA += a[dim] ** 2;
    magB += b[dim] ** 2;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function scoreIngredients(targetProfile, ingredients, lockedIds = null) {
  const scored = ingredients.map(ingredient => ({
    ...ingredient,
    score: cosineSimilarity(targetProfile, ingredient.flavor_profile),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Diversity filter: drop same-category duplicates if score diff < 0.05
  const seen = new Map(); // category -> best score in that category
  const filtered = [];
  for (const item of scored) {
    const prev = seen.get(item.category);
    if (prev !== undefined && prev - item.score < 0.05) {
      // Too similar to an already-accepted ingredient in the same category — skip
      continue;
    }
    if (!seen.has(item.category)) seen.set(item.category, item.score);
    filtered.push(item);
    if (filtered.length >= 6) break;
  }

  // If owner mode and some ingredients were locked, ensure they appear
  if (lockedIds && Array.isArray(lockedIds)) {
    const lockedInFiltered = filtered.filter(i => lockedIds.includes(i.id));
    const missing = lockedIds.filter(id => !lockedInFiltered.find(i => i.id === id));
    for (const id of missing) {
      const ing = ingredients.find(i => i.id === id);
      if (ing) filtered.unshift({ ...ing, score: 1.0 });
    }
  }

  return filtered.slice(0, 5);
}
