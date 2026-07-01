const DIMS = ['sweetness', 'bitterness', 'roastiness', 'spice', 'brightness', 'creaminess', 'warmth', 'complexity'];

export function buildOwnerProfile(selectedIds, ingredients) {
  const selected = ingredients.filter(i => selectedIds.includes(i.id));
  if (selected.length === 0) {
    return Object.fromEntries(DIMS.map(d => [d, 5]));
  }
  const profile = {};
  for (const dim of DIMS) {
    profile[dim] = parseFloat(
      (selected.reduce((sum, i) => sum + i.flavor_profile[dim], 0) / selected.length).toFixed(2)
    );
  }
  return profile;
}
