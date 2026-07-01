import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlavorProfileChart from './FlavorProfileChart';

const scrollReveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 26 } },
};

export default function RecipeOutput({ result, onBack, onReset, onSave, savedDrinks = [] }) {
  const [saved, setSaved] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  if (!result) return null;

  const isOwner = result.mode === 'owner';
  const drinkName = result.recipe_name ?? 'Your New Drink';
  const surplusCount = result.matched_ingredients?.length ?? 0;

  const sellPrice = result.cost_estimate != null
    ? (result.cost_estimate * 4.5).toFixed(2)
    : null;
  const marginPerCup = result.cost_estimate != null
    ? (result.cost_estimate * 3.5).toFixed(2)
    : null;

  function handleSave() {
    onSave?.(result);
    setSaved(true);
  }

  const shareText = `Just invented "${drinkName}" with Untasted ☕ — an AI-powered flavor chemistry engine that turns café surplus into tomorrow's special.`;

  function handleShare() {
    navigator.clipboard?.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {result.fallback && <span className="output__fallback-badge">📦 Example result</span>}
            {savedDrinks.length > 0 && (
              <button
                className="navbar__back"
                onClick={() => setSavedOpen(o => !o)}
                style={{ background: savedOpen ? 'var(--latte)' : 'white' }}
              >
                📋 Saved ({savedDrinks.length})
              </button>
            )}
          </div>
          <button className="navbar__back" onClick={onReset}>← New Drink</button>
        </div>
      </nav>

      {/* Saved drinks drawer */}
      <AnimatePresence>
        {savedOpen && savedDrinks.length > 0 && (
          <motion.div
            className="saved-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="saved-drawer__label">This session's saved recipes</div>
            <div className="saved-drawer__list">
              {savedDrinks.map((d, i) => (
                <div key={i} className="saved-drawer__item">
                  <span className="saved-drawer__name">{d.recipe_name ?? 'Unnamed Drink'}</span>
                  <span className="saved-drawer__mode">{d.mode === 'owner' ? '🏪' : '🎨'}</span>
                  {d.cost_estimate != null && (
                    <span className="saved-drawer__cost">${d.cost_estimate.toFixed(2)} cost</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="output"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
      >
        {/* Drink name + meta */}
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
              <span className="cost-badge">Flavor match: {matchPct}%</span>
            )}
            {isOwner && result.buildable !== null && (
              <span className={`buildability-badge ${result.buildable ? 'buildability-badge--ok' : 'buildability-badge--warn'}`}>
                {result.buildable ? '✅ Buildable' : '⚠️ Check stock'}
              </span>
            )}
            {isOwner && result.cost_estimate != null && (
              <span className="cost-badge">💰 Cost: ${result.cost_estimate.toFixed(2)}/cup</span>
            )}
            {isOwner && sellPrice && (
              <motion.span
                className="margin-badge"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 300 }}
                title="Estimated at standard 4.5× café markup. Actual margin depends on pricing and labour."
              >
                📈 ~${sellPrice} sell price → ${marginPerCup} margin/cup
              </motion.span>
            )}
            {isOwner && sellPrice && (
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#a08060', alignSelf: 'center' }}>
                * est. at standard café markup
              </span>
            )}
            {isOwner && surplusCount > 0 && (
              <motion.span
                className="waste-badge"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
              >
                ♻️ Keeps {surplusCount} near-expiry item{surplusCount > 1 ? 's' : ''} off the bin
              </motion.span>
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
                  Selected by cosine similarity across 8 flavor dimensions: sweetness, bitterness, roastiness, spice, brightness, creaminess, warmth, complexity.
                </p>
              </div>
            </motion.div>

            {!isOwner && (
              <motion.div variants={scrollReveal} style={{ marginTop: '1.25rem' }}>
                <div className="output__section-label">AI Artwork</div>
                <div className={`output__artwork ${!result.artwork_url || imgErr ? 'output__artwork--placeholder' : ''}`}>
                  {result.artwork_url && !imgErr ? (
                    <>
                      {!imgLoaded && <div className="artwork-shimmer" />}
                      <img
                        src={result.artwork_url}
                        alt={drinkName}
                        style={{ display: imgLoaded ? 'block' : 'none' }}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgErr(true)}
                      />
                    </>
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
                      <span className="output__reason-score-big">{Math.round(ing.score * 100)}%</span>
                    </div>
                    <div className="output__reason-text">{ing.reason}</div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Save & Share card */}
        <motion.div variants={scrollReveal}>
          <div className="output__actions-card">
            <div className="output__actions-label">Save & Share This Recipe</div>
            <div className="output__actions-primary">
              <motion.button
                className="neo-btn neo-btn--primary neo-btn--lg"
                onClick={handleSave}
                disabled={saved}
                whileHover={!saved ? { scale: 1.04 } : {}}
                whileTap={!saved ? { scale: 0.96 } : {}}
              >
                {saved ? '✓ Saved to session!' : '💾 Save Recipe'}
              </motion.button>
              <motion.button
                className="neo-btn neo-btn--matcha neo-btn--lg"
                onClick={handleShare}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {copied ? '✓ Copied!' : '🔗 Copy & Share'}
              </motion.button>
            </div>

            <AnimatePresence>
              {copied && (
                <motion.div
                  className="share-preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  "{shareText}"
                </motion.div>
              )}
            </AnimatePresence>

            <div className="output__actions-secondary">
              <motion.button
                className="neo-btn neo-btn--outline"
                onClick={onReset}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                🔄 Invent Another
              </motion.button>
              <motion.button
                className="neo-btn neo-btn--outline neo-btn--sm"
                onClick={onBack}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                ← Change Mode
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
