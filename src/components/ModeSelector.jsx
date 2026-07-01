import { motion } from 'framer-motion';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } },
};

const floating = (delay = 0) => ({
  animate: {
    y: [0, -14, 0],
    rotate: [-4, 4, -4],
    transition: { duration: 3.5 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay },
  },
});

const MARQUEE_ITEMS = [
  '☕ Flavor Science', '🧪 8-Dim Vectors', '✨ AI Recipes', '🌿 Surplus Rescue',
  '☕ Flavor Science', '🧪 8-Dim Vectors', '✨ AI Recipes', '🌿 Surplus Rescue',
];

export default function ModeSelector({ onSelect }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Floating coffee emojis */}
      {[
        { emoji: '☕', top: '8%', left: '5%', delay: 0 },
        { emoji: '🫘', top: '15%', right: '8%', delay: 0.7 },
        { emoji: '🌿', top: '60%', left: '3%', delay: 1.2 },
        { emoji: '✨', top: '70%', right: '5%', delay: 0.4 },
        { emoji: '🧪', top: '40%', left: '92%', delay: 1.8 },
      ].map(({ emoji, delay, ...pos }) => (
        <motion.span
          key={emoji + delay}
          className="float-deco"
          style={{ ...pos }}
          {...floating(delay)}
        >
          {emoji}
        </motion.span>
      ))}

      <motion.div
        className="home"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item}>
          <span className="home__badge">☕ BeanHacks 2025</span>
        </motion.div>

        {/* Title */}
        <motion.h1 className="home__title" variants={item}>
          Turn surplus
          <br />
          into{' '}
          <span className="home__title-highlight">
            tomorrow's
            <motion.span
              className="home__title-underline"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
            />
          </span>
          <br />
          special.
        </motion.h1>

        {/* Impact stat */}
        <motion.p className="home__subtitle" variants={item}>
          Cafés waste an average of{' '}
          <span className="home__stat">15% of perishable stock</span>
          {' '}every week — Untasted turns surplus into tomorrow's special using flavor chemistry, not guesswork.
        </motion.p>

        {/* Scrolling marquee */}
        <motion.div variants={item}>
          <div className="marquee-wrap">
            <div className="marquee-track">
              {MARQUEE_ITEMS.map((label, i) => (
                <span key={i} className="marquee-item">
                  {label} <span style={{ opacity: 0.4 }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mode cards */}
        <motion.div className="home__cards" variants={item}>
          <motion.button
            className="mode-card mode-card--owner"
            onClick={() => onSelect('owner')}
            whileHover={{ scale: 1.03, rotate: -0.8 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <div className="mode-card__icon">🏪</div>
            <div className="mode-card__title">Owner Mode</div>
            <div className="mode-card__desc">
              Select your surplus stock. Get a costed, buildable recipe that uses what you already have before it expires.
            </div>
            <div className="mode-card__cta">Start with your stock →</div>
          </motion.button>

          <motion.button
            className="mode-card mode-card--creative"
            onClick={() => onSelect('creative')}
            whileHover={{ scale: 1.03, rotate: 0.8 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <div className="mode-card__icon">🎨</div>
            <div className="mode-card__title">Creative Mode</div>
            <div className="mode-card__desc">
              Describe a vibe, mood, or feeling. Get a unique drink name, AI artwork, and a barista-quality recipe.
            </div>
            <div className="mode-card__cta">Invent something new →</div>
          </motion.button>
        </motion.div>

        <motion.p className="home__footnote" variants={item}>
          Powered by cosine similarity flavor matching across 8 dimensions
        </motion.p>
        <motion.p className="home__demo-hint" variants={item}>
          Press <kbd>Shift+F</kbd> at any time to load a saved example instantly
        </motion.p>
      </motion.div>
    </div>
  );
}
