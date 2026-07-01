import { useState } from 'react';
import { motion } from 'framer-motion';
import IngredientChecklist from './IngredientChecklist';

export default function OwnerModeScreen({ onGenerate, onBack }) {
  const [selected, setSelected] = useState([]);

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
        className="screen"
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

        <div className="screen__body">
          <IngredientChecklist
            selected={selected}
            onChange={setSelected}
            maxSelect={8}
          />
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
