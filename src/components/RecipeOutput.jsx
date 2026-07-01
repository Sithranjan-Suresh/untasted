import { useState } from 'react';
import { motion } from 'framer-motion';
import FlavorProfileChart from './FlavorProfileChart';

const scrollReveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 26 } },
};

export default function RecipeOutput({ result, onBack, onReset, onSave }) {
  const [saved, setSaved] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  if (!result) return null;

  const isOwner = result.mode === 'owner';
  const drinkName = result.recipe_name ?? 'Your New Drink';

  function handleSave() {
    onSave?.(result);
    setSaved(true);
  }

  const matchPct = result.matched_ingredients?.length
    ? Math.round(
        (result.matched_ingredients.reduce((sum, i) => sum + i.score, 0) /
          result.matched_ingredients.length) * 100
      )
    : null;

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="navbar__logo">
            <span className="navbar__logo-icon">☕</span>
            untasted
          </div>
          {result.fallback && <span className="output__fallback-badge">📦 Example result</span>}
          <button className="navbar__back" onClick={onReset}>← New Drink</button>
        </div>
      </nav>

      <motion.div
        className="output"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* Drink name */}
        <motion.div variants={scrollReveal}>
          <div style={{ marginBottom: '0.25rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a5030' }}>
            {isOwner ? 'Owner Mode Recipe' : 'Creative Mode Recipe'}
          </div>
          <div className="output__drink-name">
            {drinkName}
            <motion.span
              className="output__name-underline"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="output__meta">
            {matchPct !== null && (
              <span style={{
                fontSize: '0.85rem', fontWeight: 800, padding: '6px 16px',
                border: '3px solid var(--black)', borderRadius: '100px',
                background: 'white', boxShadow: 'var(--shadow-sm)'
              }}>
                Flavor match: {matchPct}%
              </span>
            )}
            {isOwner && result.buildable !== null && (
              <span className={`buildability-badge ${result.buildable ? 'buildability-badge--ok' : 'buildability-badge--warn'}`}>
                {result.buildable ? '✅ Buildable' : '⚠️ Check stock'}
              </span>
            )}
            {isOwner && result.cost_estimate !== null && (
              <span className="cost-badge">
                💰 Est. cost: ${result.cost_estimate.toFixed(2)}
              </span>
            )}
          </div>
        </motion.div>

        {/* Main body */}
        <div className="output__body">
          {/* Left col: chart + artwork */}
          <div>
            <motion.div variants={scrollReveal}>
              <div className="output__section-label">Flavor Profile</div>
              <div className="output__chart-wrap">
                <FlavorProfileChart profile={result.target_flavor_profile} />
                <p className="chart-caption">
                  This radar shows the 8-dimension flavor vector that mathematically selected each ingredient.
                </p>
              </div>
            </motion.div>

            {!isOwner && (
              <motion.div variants={scrollReveal} style={{ marginTop: '1.25rem' }}>
                <div className="output__section-label">AI Artwork</div>
                <div className={`output__artwork ${!result.artwork_url || imgErr ? 'output__artwork--placeholder' : ''}`}>
                  {result.artwork_url && !imgErr ? (
                    <img
                      src={result.artwork_url}
                      alt={drinkName}
                      onError={() => setImgErr(true)}
                    />
                  ) : (
                    <>
                      <span style={{ fontSize: '3rem' }}>☕</span>
                      <span>{drinkName}</span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right col: recipe + reasons */}
          <div>
            <motion.div variants={scrollReveal}>
              <div className="output__section-label">Recipe Steps</div>
              <div className="output__recipe-card">
                <ol className="output__steps">
                  {(result.recipe_steps ?? []).map((step, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.07 }}
                    >
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>

            <motion.div variants={scrollReveal}>
              <div className="output__section-label">Why These Ingredients?</div>
              <ul className="output__reasons">
                {(result.matched_ingredients ?? []).map((ing, i) => (
                  <motion.li
                    key={ing.id ?? i}
                    className="output__reason-card"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * i }}
                  >
                    <div className="output__reason-header">
                      <span className="output__reason-name">{ing.name}</span>
                      <span className="output__reason-score">
                        {Math.round(ing.score * 100)}%
                      </span>
                    </div>
                    <div className="output__reason-text">{ing.reason}</div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Actions */}
        <motion.div className="output__actions" variants={scrollReveal}>
          <motion.button
            className="neo-btn neo-btn--primary"
            onClick={handleSave}
            disabled={saved}
            whileHover={!saved ? { scale: 1.04 } : {}}
            whileTap={!saved ? { scale: 0.96 } : {}}
          >
            {saved ? '✓ Saved!' : '💾 Save Recipe'}
          </motion.button>
          <motion.button
            className="neo-btn neo-btn--outline"
            onClick={onReset}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            🔄 Make Another
          </motion.button>
          <motion.button
            className="neo-btn neo-btn--outline neo-btn--sm"
            onClick={onBack}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            ← Back to Modes
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
