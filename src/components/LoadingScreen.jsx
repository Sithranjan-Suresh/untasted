import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const DIMS = ['sweetness', 'bitterness', 'roastiness', 'spice', 'brightness', 'creaminess', 'warmth', 'complexity'];

const OWNER_LINES = [
  { icon: '🧮', text: 'Computing cosine similarity across 8 flavor dimensions…' },
  { icon: '🫘', text: 'Ranking ingredients by flavor compatibility…' },
  { icon: '🤖', text: 'Generating recipe with LLM…' },
  { icon: '🎨', text: 'Crafting your drink profile…' },
];

const CREATIVE_LINES = [
  { icon: '🧠', text: 'Parsing your vibe into a flavor profile…' },
  { icon: '🧮', text: 'Computing cosine similarity across 8 dimensions…' },
  { icon: '🤖', text: 'Generating recipe with LLM…' },
  { icon: '🎨', text: 'Creating AI artwork…' },
];

const BREW_FACTS = [
  'Espresso has over 1,500 distinct chemical compounds.',
  'Flavor wheels used by Q Graders track 36 sub-categories.',
  'Cold brew steeps at ~12°C to suppress bitterness.',
  'Latte art dates back to Italy in the 1980s.',
];

function randomProfile() {
  return Object.fromEntries(DIMS.map(d => [d, Math.floor(Math.random() * 6) + 3]));
}

export default function LoadingScreen({ mode }) {
  const [step, setStep] = useState(0);
  const [fact] = useState(() => BREW_FACTS[Math.floor(Math.random() * BREW_FACTS.length)]);
  const [parsedProfile] = useState(randomProfile);
  const [showProfile, setShowProfile] = useState(false);

  const LINES = mode === 'creative' ? CREATIVE_LINES : OWNER_LINES;

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => {
        const next = (s + 1) % LINES.length;
        if (next === 1 && mode === 'creative') setShowProfile(true);
        return next;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [mode]);

  return (
    <motion.div
      className="loading"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        style={{ fontSize: '4rem', lineHeight: 1 }}
      >
        ☕
      </motion.div>

      <div className="loading__lines">
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            className={`loading-line ${i === step ? 'loading-line--active' : i < step ? 'loading-line--done' : ''}`}
            animate={{ opacity: i === step ? 1 : i < step ? 0.45 : 0.15 }}
            transition={{ duration: 0.3 }}
          >
            {line.icon} {line.text}
          </motion.div>
        ))}
      </div>

      {/* Creative Mode: show parsed flavor profile once vibe is parsed */}
      <AnimatePresence>
        {mode === 'creative' && showProfile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              border: '2px solid #d4873a',
              borderRadius: '12px',
              background: 'white',
              padding: '0.75rem 1rem',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a5030', marginBottom: '0.5rem' }}>
              Vibe → Flavor Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem 1rem' }}>
              {DIMS.map(dim => (
                <div key={dim} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600, color: '#6a4020', textTransform: 'capitalize' }}>{dim}</span>
                  <span style={{ fontWeight: 900, color: '#d4873a' }}>{parsedProfile[dim]}/10</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="loading__caption"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        ☕ Did you know? {fact}
      </motion.div>
    </motion.div>
  );
}
