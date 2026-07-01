import { useState } from 'react';
import { motion } from 'framer-motion';

const MAX_CHARS = 300;

const EXAMPLES = [
  'Rainy afternoon with a book',
  'First day of autumn',
  'Late night creative flow',
  'Beachside morning',
  'Cozy winter fireplace',
];

export default function CreativeModeScreen({ onGenerate, onBack }) {
  const [vibe, setVibe] = useState('');
  const [error, setError] = useState('');

  function handleGenerate() {
    const trimmed = vibe.trim();
    if (trimmed.length < 5) {
      setError('Describe a vibe with at least 5 characters.');
      return;
    }
    setError('');
    onGenerate(trimmed);
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
          <span className="navbar__mode-tag navbar__mode-tag--creative">Creative Mode</span>
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
            What's the vibe?
          </motion.h2>
          <motion.p
            className="screen__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Describe a mood, moment, or feeling — we'll engineer it into a drink.
          </motion.p>
        </div>

        <div className="screen__body">
          <motion.div
            className="vibe-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Example chips */}
            <div className="vibe-examples">
              {EXAMPLES.map(ex => (
                <motion.button
                  key={ex}
                  className="vibe-example"
                  onClick={() => { setVibe(ex); setError(''); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {ex}
                </motion.button>
              ))}
            </div>

            {/* Textarea */}
            <div className={`vibe-textarea-wrap ${error ? 'vibe-textarea--error' : ''}`}>
              <textarea
                className="vibe-textarea"
                placeholder="e.g. Rainy afternoon reading a novel with a warm blanket…"
                value={vibe}
                onChange={e => { setVibe(e.target.value.slice(0, MAX_CHARS)); setError(''); }}
                rows={5}
              />
              <div className="vibe-meta">
                {error && <span className="vibe-error">⚠ {error}</span>}
                <span className="vibe-counter">{vibe.length}/{MAX_CHARS}</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="screen__footer">
          <span className="screen__selection-count" />
          <motion.button
            className="neo-btn neo-btn--espresso neo-btn--lg"
            onClick={handleGenerate}
            disabled={vibe.trim().length < 5}
            whileHover={vibe.trim().length >= 5 ? { scale: 1.04 } : {}}
            whileTap={vibe.trim().length >= 5 ? { scale: 0.96 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            🎨 Invent My Drink
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
