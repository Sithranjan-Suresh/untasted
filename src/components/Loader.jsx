import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Loader({ onDone }) {
  const [progress, setProgress] = useState(0);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    const start = Date.now();
    const duration = 2400;
    let raf;
    function tick() {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => onDoneRef.current?.(), 100);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      className="loader"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: 'easeIn' }}
    >
      <motion.div
        className="loader__logo"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        ☕ untasted
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', fontFamily: 'var(--font)', fontWeight: 600 }}
      >
        AI coffee drink invention engine
      </motion.div>

      <motion.div
        className="loader__bar-track"
        initial={{ opacity: 0, scaleX: 0.6 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <motion.div
          className="loader__bar"
          style={{ width: `${progress * 100}%` }}
        />
      </motion.div>
    </motion.div>
  );
}
