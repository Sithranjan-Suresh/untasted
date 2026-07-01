import { useState } from 'react';
import FlavorProfileChart from './FlavorProfileChart';

export default function RecipeOutput({ result, onBack, onReset, onSave }) {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave();
    setSaved(true);
  }

  const {
    mode,
    fallback,
    recipe_name,
    recipe_steps,
    matched_ingredients,
    target_flavor_profile,
    cost_estimate,
    buildable,
    artwork_url,
  } = result;

  return (
    <div className="output">
      {fallback && (
        <div className="output__fallback-badge">Showing a saved example</div>
      )}

      <div className="output__top">
        {mode === 'creative' && recipe_name && (
          <h1 className="output__drink-name">{recipe_name}</h1>
        )}
        {mode === 'owner' && (
          <h1 className="output__drink-name">Your New Drink</h1>
        )}

        <div className="output__meta">
          {mode === 'owner' && (
            <>
              <span className={`buildability-badge ${buildable ? 'buildability-badge--ok' : 'buildability-badge--warn'}`}>
                {buildable ? '✅ Ready to Build' : '⚠️ Check Stock'}
              </span>
              {cost_estimate !== null && (
                <span className="cost-badge">Est. cost: ${cost_estimate.toFixed(2)}</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="output__body">
        <div className="output__chart-col">
          <h3 className="output__section-label">Flavor Profile</h3>
          <FlavorProfileChart profile={target_flavor_profile} />
        </div>

        <div className="output__content-col">
          {mode === 'creative' && artwork_url && (
            <div className="output__artwork">
              <img
                src={artwork_url}
                alt={recipe_name ?? 'Generated drink'}
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
          {mode === 'creative' && !artwork_url && recipe_name && (
            <div className="output__artwork output__artwork--placeholder">
              <span>{recipe_name}</span>
            </div>
          )}

          <div className="output__recipe">
            <h3 className="output__section-label">Recipe</h3>
            <ol className="output__steps">
              {(recipe_steps ?? []).map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>

          <div className="output__explanations">
            <h3 className="output__section-label">Why Each Ingredient</h3>
            <ul className="output__reasons">
              {(matched_ingredients ?? []).map((ing, i) => (
                <li key={i} className="output__reason">
                  <span className="output__reason-name">{ing.name}</span>
                  <span className="output__reason-score">match {Math.round(ing.score * 100)}%</span>
                  <p className="output__reason-text">{ing.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="output__actions">
        <button className="back-btn" onClick={onBack}>← Try Another</button>
        <button className="secondary-btn" onClick={onReset}>Change Mode</button>
        {!saved
          ? <button className="save-btn" onClick={handleSave}>Save This Drink</button>
          : <span className="save-btn save-btn--saved">✓ Saved!</span>
        }
      </div>
    </div>
  );
}
