import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import IngredientChecklist from './IngredientChecklist';
import FlavorProfileChart from './FlavorProfileChart';
import { buildOwnerProfile } from '../utils/profileBuilder.js';
import ingredientsData from '../data/ingredients.json';

export default function OwnerModeScreen({ onGenerate, onBack }) {
  const [selected, setSelected] = useState([]);
  const [liveProfile, setLiveProfile] = useState(null);

  useEffect(() => {
    if (selected.length === 0) {
      setLiveProfile(null);
    } else {
      setLiveProfile(buildOwnerProfile(selected, ingredientsData));
    }
  }, [selected]);

  function handleGenerate() {
    if (selected.length >= 2) onGenerate(selected);
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__inner">
          <div className="navbar__logo">
            <span className="navbar__logo-icon">☕</span>
            untasted
          </div>
          <span className="navbar__mode-tag navbar__mode-tag--owner">Owner Mode</span>
          <button className="navbar__back" onClick={onBack}>← Back</button>
        </div>
      </nav>

      <motion.div
        className="screen screen--owner"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.35 }}
      >
        <div style={{ paddingTop: '1.5rem' }}>
          <motion.h2
            className="screen__title"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            What's in your surplus?
          </motion.h2>
          <motion.p
            className="screen__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Select ingredients from your café's stock — we'll turn them into a costed, buildable recipe.
          </motion.p>
        </div>

        {(() => {
          const nearExpirySelected = selected
            .map(id => ingredientsData.find(i => i.id === id))
            .filter(i => i && i.days_until_expiry != null && i.days_until_expiry <= 3);
          return nearExpirySelected.length > 0 ? (
            <motion.div
              className="expiry-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              🔴 {nearExpirySelected.length} near-expiry ingredient{nearExpirySelected.length > 1 ? 's' : ''} selected:{' '}
              {nearExpirySelected.map(i => `${i.name} (${i.days_until_expiry}d left)`).join(', ')} — act now!
            </motion.div>
          ) : null;
        })()}

        <div className="screen__owner-body">
          {/* Left: ingredient checklist */}
          <div className="screen__body">
            <IngredientChecklist
              selected={selected}
              onChange={setSelected}
              maxSelect={8}
            />
          </div>

          {/* Right: live flavor preview */}
          <div className="owner__preview">
            <div className="owner__preview-label">Live Flavor Profile</div>
            <div className="owner__preview-card neo-card">
              {liveProfile ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <FlavorProfileChart profile={liveProfile} />
                  <p className="chart-caption" style={{ marginTop: '0.5rem' }}>
                    8-dimension flavor vector updating live as you select ingredients
                  </p>
                </motion.div>
              ) : (
                <div className="owner__preview-empty">
                  <span style={{ fontSize: '2.5rem' }}>🧪</span>
                  <p>Select ingredients to see<br />your flavor profile build</p>
                </div>
              )}
            </div>

            {selected.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="owner__preview-hint"
              >
                ✅ {selected.length} ingredient{selected.length > 1 ? 's' : ''} — ready to generate
              </motion.div>
            )}
          </div>
        </div>

        <div className="screen__footer">
          <span className="screen__selection-count">
            {selected.length < 2
              ? `Select at least ${2 - selected.length} more`
              : `${selected.length} ingredient${selected.length > 1 ? 's' : ''} selected`}
          </span>
          <motion.button
            className="neo-btn neo-btn--primary neo-btn--lg"
            onClick={handleGenerate}
            disabled={selected.length < 2}
            whileHover={selected.length >= 2 ? { scale: 1.04 } : {}}
            whileTap={selected.length >= 2 ? { scale: 0.96 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            ✨ Generate Recipe
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
