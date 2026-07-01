import { useEffect, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const DIMS = [
  { key: 'sweetness', label: 'Sweet' },
  { key: 'bitterness', label: 'Bitter' },
  { key: 'roastiness', label: 'Roasty' },
  { key: 'spice', label: 'Spice' },
  { key: 'brightness', label: 'Bright' },
  { key: 'creaminess', label: 'Creamy' },
  { key: 'warmth', label: 'Warm' },
  { key: 'complexity', label: 'Complex' },
];

function lerp(a, b, t) { return a + (b - a) * t; }

export default function FlavorProfileChart({ profile }) {
  const [displayProfile, setDisplayProfile] = useState(
    Object.fromEntries(DIMS.map(d => [d.key, 0]))
  );
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const start = Date.now();
    const duration = 1200;
    let raf;
    function tick() {
      const t = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const next = {};
      DIMS.forEach(d => { next[d.key] = lerp(0, profile[d.key] ?? 0, ease); });
      setDisplayProfile(next);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setAnimating(false);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [profile]);

  const data = DIMS.map(d => ({ subject: d.label, A: displayProfile[d.key] ?? 0 }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#e8d8c0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700, fill: '#6a4020' }}
          />
          <Radar
            dataKey="A"
            stroke="#d4873a"
            fill="#d4873a"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
