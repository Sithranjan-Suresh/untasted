import { useState, useEffect } from 'react';
import FlavorProfileChart from './FlavorProfileChart';

const OWNER_LINES = [
  'Mapping your ingredient vectors…',
  'Computing flavor compatibility scores…',
  'Selecting the best ingredient pairings…',
  'Calculating cost estimate…',
  'Writing your recipe…',
];

const CREATIVE_LINES = [
  'Parsing your vibe into flavor dimensions…',
  'Scanning 40 ingredients for the best match…',
  'Computing flavor profile vectors…',
  'Inventing a name and recipe…',
  'Generating your drink artwork…',
];

const SIMULATED_PROFILES = [
  { sweetness: 3, bitterness: 2, roastiness: 2, spice: 1, brightness: 3, creaminess: 2, warmth: 3, complexity: 4 },
  { sweetness: 5, bitterness: 4, roastiness: 5, spice: 3, brightness: 5, creaminess: 3, warmth: 5, complexity: 6 },
  { sweetness: 6, bitterness: 6, roastiness: 7, spice: 5, brightness: 6, creaminess: 5, warmth: 7, complexity: 8 },
];

export default function LoadingScreen({ mode }) {
  const lines = mode === 'owner' ? OWNER_LINES : CREATIVE_LINES;
  const [lineIndex, setLineIndex] = useState(0);
  const [profileIndex, setProfileIndex] = useState(0);

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex(i => Math.min(i + 1, lines.length - 1));
    }, 1400);
    const profileTimer = setInterval(() => {
      setProfileIndex(i => Math.min(i + 1, SIMULATED_PROFILES.length - 1));
    }, 2200);
    return () => {
      clearInterval(lineTimer);
      clearInterval(profileTimer);
    };
  }, [lines.length]);

  return (
    <div className="loading-screen">
      <FlavorProfileChart profile={SIMULATED_PROFILES[profileIndex]} animating />
      <div className="loading-screen__lines">
        {lines.slice(0, lineIndex + 1).map((line, i) => (
          <p key={i} className={`loading-line ${i === lineIndex ? 'loading-line--active' : 'loading-line--done'}`}>
            {i < lineIndex ? '✓ ' : '› '}{line}
          </p>
        ))}
      </div>
    </div>
  );
}
