import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const LINES = [
  { icon: '🧮', text: 'Computing cosine similarity across 8 flavor dimensions…' },
  { icon: '🫘', text: 'Ranking ingredients by flavor compatibility…' },
  { icon: '🤖', text: 'Generating recipe with LLM…' },
  { icon: '🎨', text: 'Crafting your drink profile…' },
];

const BREW_FACTS = [
  'Espresso has over 1,500 distinct chemical compounds.',
  'Flavor wheels used by Q Graders track 36 sub-categories.',
  'Cold brew steeps at ~12°C to suppress bitterness.',
  'Latte art dates back to Italy in the 1980s.',
];

export default function LoadingScreen({ mode }) {
  const [step, setStep] = useState(0);
  const [fact] = useState(() => BREW_FACTS[Math.floor(Math.random() * BREW_FACTS.length)]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % LINES.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

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
